import logging
from django.db.models import Q
from apps.accounts.models import InstagramAccount
from apps.dialogs.models import Dialog, Message
from apps.bot.engine import handle_bot_response

logger = logging.getLogger(__name__)


def process_incoming_message(page_id, sender_id, text, message_id='', source='dm', post_id=''):
    """Process an incoming message from Instagram (DM or comment)."""

    # entry.id can be IGBA ID (page_id) or scoped user ID (instagram_user_id)
    print(f'[WEBHOOK SVC] Looking for account with id={page_id}, sender={sender_id}', flush=True)
    all_accounts = InstagramAccount.objects.all()
    for a in all_accounts:
        print(f'[WEBHOOK SVC] DB account: ig_id={a.instagram_user_id}, page_id={a.page_id}, active={a.is_active}', flush=True)
    try:
        ig_account = InstagramAccount.objects.select_related('tenant').filter(
            Q(page_id=page_id) | Q(instagram_user_id=page_id),
            is_active=True,
        ).first()
        if not ig_account:
            raise InstagramAccount.DoesNotExist
    except InstagramAccount.DoesNotExist:
        print(f'[WEBHOOK SVC] No account found for id={page_id}', flush=True)
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
