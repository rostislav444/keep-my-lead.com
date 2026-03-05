import logging
from apps.accounts.models import InstagramAccount
from apps.dialogs.models import Dialog, Message
from apps.bot.engine import handle_bot_response

logger = logging.getLogger(__name__)


def process_incoming_message(page_id, sender_id, text, message_id='', source='dm', post_id=''):
    """Process an incoming message from Instagram (DM or comment)."""

    # Find the Instagram account — entry.id from webhook is the instagram_user_id
    try:
        ig_account = InstagramAccount.objects.select_related('tenant').get(
            instagram_user_id=page_id, is_active=True
        )
    except InstagramAccount.DoesNotExist:
        logger.warning('No active Instagram account for ig_user_id=%s', page_id)
        return

    tenant = ig_account.tenant

    # Get or create dialog
    dialog, created = Dialog.objects.get_or_create(
        tenant=tenant,
        instagram_account=ig_account,
        instagram_user_id=sender_id,
        defaults={
            'source': source,
            'source_post_id': post_id,
            'status': Dialog.Status.NEW,
        }
    )

    # Save incoming message
    Message.objects.create(
        dialog=dialog,
        role=Message.Role.USER,
        text=text,
        instagram_message_id=message_id,
    )

    # Update dialog status
    if dialog.status == Dialog.Status.NEW:
        dialog.status = Dialog.Status.ACTIVE
        dialog.save(update_fields=['status'])

    # If bot is not active (manager took over), skip bot response
    if not dialog.is_bot_active:
        logger.info('Bot is inactive for dialog=%s, skipping', dialog.id)
        return

    # Generate and send bot response
    handle_bot_response(dialog, ig_account)
