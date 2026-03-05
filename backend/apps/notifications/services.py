import logging
import httpx
from django.conf import settings
from apps.tenants.models import User

logger = logging.getLogger(__name__)


def notify_new_lead(lead):
    """Send Telegram notification about a new hot lead to all managers."""
    managers = User.objects.filter(
        tenant=lead.tenant,
        role=User.Role.MANAGER,
    ).exclude(telegram_chat_id='')

    for manager in managers:
        text = (
            f"New hot lead!\n\n"
            f"Name: {lead.name or 'unknown'}\n"
            f"Phone: {lead.phone or 'not provided'}\n"
            f"Interest: {lead.interest or '-'}\n"
            f"Product: {lead.product.name if lead.product else '-'}"
        )
        _send_telegram(manager.telegram_chat_id, text)

    # Also notify owner
    owners = User.objects.filter(
        tenant=lead.tenant,
        role=User.Role.OWNER,
    ).exclude(telegram_chat_id='')

    for owner in owners:
        text = (
            f"New hot lead!\n\n"
            f"Name: {lead.name or 'unknown'}\n"
            f"Phone: {lead.phone or 'not provided'}\n"
            f"Interest: {lead.interest or '-'}\n"
            f"Product: {lead.product.name if lead.product else '-'}"
        )
        _send_telegram(owner.telegram_chat_id, text)


def _send_telegram(chat_id, text):
    """Send a message via Telegram Bot API."""
    token = settings.TELEGRAM_BOT_TOKEN
    if not token:
        logger.warning('TELEGRAM_BOT_TOKEN not configured, skipping notification')
        return

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    try:
        response = httpx.post(url, json={
            "chat_id": chat_id,
            "text": text,
        }, timeout=10)
        response.raise_for_status()
        logger.info('Telegram notification sent to chat_id=%s', chat_id)
    except Exception as e:
        logger.error('Failed to send Telegram to chat_id=%s: %s', chat_id, e)
