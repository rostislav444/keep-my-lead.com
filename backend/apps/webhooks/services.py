import json
import logging
from urllib.error import HTTPError
from urllib.request import urlopen

from django.conf import settings
from django.db.models import Q

from apps.accounts.models import InstagramAccount
from apps.bot.engine import handle_bot_response
from apps.dialogs.models import Dialog, Message

logger = logging.getLogger(__name__)


def verify_meta_webhook(request):
    """Verify Meta webhook subscription. Returns challenge string or None."""
    mode = request.query_params.get('hub.mode')
    token = request.query_params.get('hub.verify_token')
    challenge = request.query_params.get('hub.challenge')

    if mode == 'subscribe' and token == settings.META_VERIFY_TOKEN:
        return challenge

    return None


def process_incoming_message(page_id, sender_id, text, message_id='', source='dm', post_id=''):
    """Process an incoming message from Instagram (DM or comment)."""
    ig_account = InstagramAccount.objects.select_related('tenant').filter(
        Q(page_id=page_id) | Q(instagram_user_id=page_id),
        is_active=True,
    ).first()

    if not ig_account:
        logger.warning('No account found for page_id=%s', page_id)
        return

    dialog, created = Dialog.objects.get_or_create(
        tenant=ig_account.tenant,
        instagram_account=ig_account,
        instagram_user_id=sender_id,
        defaults={
            'source': source,
            'source_post_id': post_id,
            'status': Dialog.Status.NEW,
        },
    )

    Message.objects.create(
        dialog=dialog,
        role=Message.Role.USER,
        text=text,
        instagram_message_id=message_id,
    )

    if dialog.status == Dialog.Status.NEW:
        dialog.status = Dialog.Status.ACTIVE
        dialog.save(update_fields=['status'])

    if not dialog.is_bot_active:
        logger.info('Bot inactive for dialog=%s, skipping', dialog.id)
        return

    handle_bot_response(dialog, ig_account)


def handle_webhook_payload(payload):
    """Parse Instagram webhook payload and dispatch to handlers."""
    for entry in payload.get('entry', []):
        page_id = entry.get('id')

        for messaging in entry.get('messaging', []):
            if 'message_edit' in messaging:
                _handle_message_edit(messaging)
            else:
                _handle_dm(page_id, messaging)

        for change in entry.get('changes', []):
            field = change.get('field')
            value = change.get('value', {})
            if field == 'messages':
                _handle_dm(page_id, value)
            elif field == 'comments':
                _handle_comment(page_id, value)


def _handle_message_edit(messaging):
    mid = messaging.get('message_edit', {}).get('mid', '')
    num_edit = messaging.get('message_edit', {}).get('num_edit', -1)
    if not mid or num_edit != 0:
        return

    for ig_account in InstagramAccount.objects.filter(is_active=True):
        try:
            url = (
                f'https://graph.instagram.com/v25.0/{mid}'
                f'?fields=from,to,message,created_time'
                f'&access_token={ig_account.access_token}'
            )
            resp = urlopen(url)
            data = json.loads(resp.read().decode())

            sender_id = data.get('from', {}).get('id', '')
            text = data.get('message', '')

            if not text or not sender_id:
                return

            if sender_id in (ig_account.instagram_user_id, ig_account.page_id):
                return

            process_incoming_message(
                page_id=ig_account.page_id or ig_account.instagram_user_id,
                sender_id=sender_id,
                text=text,
                message_id=mid,
                source='dm',
            )
            return
        except HTTPError:
            continue


def _handle_dm(page_id, messaging):
    sender_id = messaging.get('sender', {}).get('id')
    recipient_id = messaging.get('recipient', {}).get('id')
    message = messaging.get('message', {})
    text = message.get('text', '')

    if not text or not sender_id or message.get('is_echo'):
        return

    process_incoming_message(
        page_id=recipient_id or page_id,
        sender_id=sender_id,
        text=text,
        message_id=message.get('mid', ''),
        source='dm',
    )


def _handle_comment(page_id, comment_data):
    user_id = comment_data.get('from', {}).get('id')
    text = comment_data.get('text', '')
    post_id = comment_data.get('media', {}).get('id', '')

    if not text or not user_id:
        return

    process_incoming_message(
        page_id=page_id,
        sender_id=user_id,
        text=text,
        message_id=comment_data.get('id', ''),
        source='comment',
        post_id=post_id,
    )
