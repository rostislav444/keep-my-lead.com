import json
import re
import logging
import anthropic
from django.conf import settings
from apps.dialogs.models import Dialog, Message
from apps.catalog.models import Item
from apps.leads.models import Lead

logger = logging.getLogger(__name__)


def _build_catalog_summary(tenant):
    """Build short catalog overview — always included in system prompt."""
    items = Item.objects.filter(tenant=tenant, is_active=True).select_related('category')
    if not items.exists():
        return "(No products/services configured yet)", []

    lines = []
    for item in items:
        cat = item.category.name if item.category else 'General'
        short = item.short_description or item.name
        lines.append(f"- [{item.id}] {item.name} ({cat}): {short}")
    return "\n".join(lines), list(items)


def _build_focused_context(item):
    """Build detailed context for a specific product the user is interested in."""
    parts = [f"=== DETAILED INFO: {item.name} ==="]
    if item.context:
        parts.append(item.context)
    if item.bot_instructions:
        parts.append(f"\nBOT INSTRUCTIONS FOR THIS PRODUCT:\n{item.bot_instructions}")
    return "\n".join(parts)


def _detect_focused_item(dialog, all_items):
    """Detect which product the user is interested in based on conversation history.
    Returns the Item or None."""
    if not all_items:
        return None

    # Check if a previous bot response already identified a product
    last_bot_msgs = dialog.messages.filter(role=Message.Role.BOT).order_by('-created_at')[:3]
    for msg in last_bot_msgs:
        meta_match = re.search(r'<!--BOT_META:(.*?)-->', msg.text)
        if meta_match:
            try:
                meta = json.loads(meta_match.group(1))
                product_name = meta.get('product_interest')
                if product_name:
                    for item in all_items:
                        if item.name.lower() == product_name.lower():
                            return item
                    # Fuzzy match
                    for item in all_items:
                        if product_name.lower() in item.name.lower() or item.name.lower() in product_name.lower():
                            return item
            except (json.JSONDecodeError, AttributeError):
                pass

    return None


def build_system_prompt(tenant, dialog=None):
    """Build system prompt with two-phase catalog context."""
    try:
        config = tenant.bot_config
    except Exception:
        config = None

    bot_name = config.bot_name if config else 'Assistant'
    tone = config.tone if config else 'friendly'
    goal = config.goal if config else 'Collect name and phone number'

    catalog_summary, all_items = _build_catalog_summary(tenant)

    prompt = f"""You are {bot_name}.
Communication tone: {tone}.
Your main goal: {goal}.

AVAILABLE PRODUCTS/SERVICES (short overview):
{catalog_summary}
"""

    # If we can detect interest, add full context for that product
    focused_item = None
    if dialog:
        focused_item = _detect_focused_item(dialog, all_items)

    if focused_item:
        prompt += f"\n{_build_focused_context(focused_item)}\n"
    else:
        prompt += """
The user hasn't specified which product/service they're interested in yet.
Your first task: understand what they need. Ask clarifying questions.
If the message is vague, briefly present the available options from the catalog above.
Once you identify the product, focus the conversation on it.
"""

    if config:
        if config.greeting_template:
            prompt += f"\nGREETING TEMPLATE: {config.greeting_template}\n"
        if config.escalation_trigger:
            prompt += f"\nESCALATION TO MANAGER: {config.escalation_trigger}\n"
        if config.forbidden_topics:
            prompt += f"\nFORBIDDEN TOPICS: {config.forbidden_topics}\n"
        if config.additional_instructions:
            prompt += f"\nADDITIONAL: {config.additional_instructions}\n"

    prompt += """
BEHAVIOR RULES:
1. Follow the sales funnel: capture interest -> qualify -> present -> collect contact
2. Don't be pushy. Ask questions, understand needs
3. Handle objections using info from the catalog
4. When the person shows interest, collect name and phone number
5. Reply short, like in a messenger. No walls of text
6. If you don't know the answer, say a manager will contact them
7. Never make up product/service information
8. If the user asks about a product you have details for, use that info
9. If the user asks about something not in the catalog, say you don't have that service

After EVERY response, add a metadata block on a NEW LINE (user won't see it):
<!--BOT_META:{"has_name": false, "has_phone": false, "interest_level": "cold", "product_interest": null}-->

Update the values based on the conversation:
- has_name: true if you learned the person's name
- has_phone: true if you received a phone number
- interest_level: "hot", "warm", or "cold"
- product_interest: EXACT name of the product/service from the catalog, or null
"""
    return prompt


def handle_bot_response(dialog, ig_account):
    """Generate a bot response and send it."""
    tenant = dialog.tenant
    system_prompt = build_system_prompt(tenant, dialog)

    # Build message history
    messages = []
    history = dialog.messages.order_by('created_at')
    # Limit to last 40 messages to avoid token overflow
    total = history.count()
    if total > 40:
        history = history[total - 40:]
    for msg in history:
        if msg.role == Message.Role.USER:
            messages.append({"role": "user", "content": msg.text})
        else:
            # Strip metadata from previous bot messages
            clean_text = re.sub(r'<!--BOT_META:.*?-->', '', msg.text).strip()
            if clean_text:
                messages.append({"role": "assistant", "content": clean_text})

    if not messages:
        return

    # Call Claude API
    try:
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=500,
            system=system_prompt,
            messages=messages,
        )
        full_response = response.content[0].text
    except Exception as e:
        logger.error('Claude API error for dialog=%s: %s', dialog.id, e)
        return

    # Parse metadata from response
    bot_text, meta = _parse_response(full_response)

    # Save bot message (with metadata for future context detection)
    Message.objects.create(
        dialog=dialog,
        role=Message.Role.BOT,
        text=full_response,  # Keep metadata in DB for _detect_focused_item
    )

    # Process metadata (create lead if name + phone collected)
    if meta:
        _process_meta(dialog, meta)

    # Send clean message via Instagram (without metadata)
    from apps.bot.instagram import send_dm
    send_dm(ig_account, dialog.instagram_user_id, bot_text)


def _parse_response(full_response):
    """Extract bot text and metadata from Claude response."""
    pattern = r'<!--BOT_META:(.*?)-->'
    match = re.search(pattern, full_response)

    if match:
        bot_text = re.sub(pattern, '', full_response).strip()
        try:
            meta = json.loads(match.group(1))
        except json.JSONDecodeError:
            meta = None
    else:
        bot_text = full_response.strip()
        meta = None

    return bot_text, meta


def _process_meta(dialog, meta):
    """Update dialog status and create lead based on bot metadata."""
    has_name = meta.get('has_name', False)
    has_phone = meta.get('has_phone', False)
    interest = meta.get('interest_level', 'cold')
    product_name = meta.get('product_interest')

    # Map interest to temperature
    temp_map = {'hot': Lead.Temperature.HOT, 'warm': Lead.Temperature.WARM, 'cold': Lead.Temperature.COLD}
    temperature = temp_map.get(interest, Lead.Temperature.COLD)

    # Update dialog status based on interest
    if interest == 'hot' or (has_name and has_phone):
        dialog.status = Dialog.Status.LEAD
    elif interest == 'warm':
        dialog.status = Dialog.Status.QUALIFIED
    dialog.save(update_fields=['status', 'updated_at'])

    # Create or update lead when we have name or phone
    if has_name or has_phone:
        # Extract name and phone from conversation
        name, phone = _extract_contact_from_messages(dialog)

        product = None
        if product_name:
            product = Item.objects.filter(
                tenant=dialog.tenant, name__icontains=product_name, is_active=True
            ).first()

        lead, created = Lead.objects.update_or_create(
            dialog=dialog,
            defaults={
                'tenant': dialog.tenant,
                'name': name,
                'phone': phone,
                'interest': product_name or '',
                'product': product,
                'temperature': temperature,
            }
        )

        # Notify manager if lead is hot and not yet notified
        if lead.temperature == Lead.Temperature.HOT and not lead.manager_notified:
            from apps.notifications.services import notify_new_lead
            notify_new_lead(lead)
            lead.manager_notified = True
            lead.save(update_fields=['manager_notified'])


def _extract_contact_from_messages(dialog):
    """Try to extract name and phone from user messages in the dialog."""
    name = ''
    phone = ''

    user_messages = dialog.messages.filter(role=Message.Role.USER).order_by('created_at')
    for msg in user_messages:
        # Phone pattern (various formats)
        phone_match = re.search(r'[\+]?[\d\s\-\(\)]{7,15}', msg.text)
        if phone_match and not phone:
            phone = phone_match.group(0).strip()

        # Name: simple heuristic — short message (1-3 words) that's not a phone
        words = msg.text.strip().split()
        if 1 <= len(words) <= 3 and not re.search(r'\d{5,}', msg.text) and not name:
            if all(w.isalpha() for w in words):
                name = msg.text.strip()

    return name, phone
