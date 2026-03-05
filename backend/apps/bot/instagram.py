import logging
import httpx

logger = logging.getLogger(__name__)


def send_dm(ig_account, recipient_id, text):
    """Send a DM to a user via Meta Graph API."""
    url = f"https://graph.facebook.com/v18.0/{ig_account.instagram_user_id}/messages"
    try:
        response = httpx.post(
            url,
            json={
                "recipient": {"id": recipient_id},
                "message": {"text": text},
            },
            headers={
                "Authorization": f"Bearer {ig_account.access_token}",
            },
            timeout=10,
        )
        response.raise_for_status()
        logger.info('DM sent to %s via @%s', recipient_id, ig_account.username)
        return response.json()
    except Exception as e:
        logger.error('Failed to send DM to %s: %s', recipient_id, e)
        return None
