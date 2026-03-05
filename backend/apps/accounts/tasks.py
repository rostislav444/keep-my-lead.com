import logging
import httpx
from celery import shared_task
from django.utils import timezone

logger = logging.getLogger(__name__)

REFRESH_URL = "https://graph.instagram.com/refresh_access_token"


@shared_task
def refresh_instagram_tokens():
    """Refresh long-lived Instagram tokens before they expire."""
    from apps.accounts.models import InstagramAccount

    for account in InstagramAccount.objects.filter(is_active=True):
        try:
            response = httpx.get(
                REFRESH_URL,
                params={
                    "grant_type": "ig_refresh_token",
                    "access_token": account.access_token,
                },
                timeout=15,
            )
            response.raise_for_status()
            data = response.json()

            account.access_token = data["access_token"]
            account.token_expires_at = timezone.now() + timezone.timedelta(
                seconds=data["expires_in"]
            )
            account.save(update_fields=["access_token", "token_expires_at"])
            logger.info("Refreshed token for @%s, expires in %s days", account.username, data["expires_in"] // 86400)
        except Exception as e:
            logger.error("Failed to refresh token for @%s: %s", account.username, e)
