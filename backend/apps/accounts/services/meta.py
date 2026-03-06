import base64
import hashlib
import hmac
import json
import logging

from django.conf import settings

logger = logging.getLogger(__name__)


class MetaSignedRequestService:
    """Verify and parse Meta signed_request payloads."""

    def __init__(self, app_secret: str | None = None):
        self.app_secret = app_secret or settings.META_APP_SECRET

    def verify(self, signed_request: str) -> dict | None:
        """Parse and verify signed_request. Returns payload dict or None."""
        try:
            sig, payload = signed_request.split('.', 1)
            decoded_sig = base64.urlsafe_b64decode(sig + '==')
            expected_sig = hmac.new(
                self.app_secret.encode(),
                payload.encode(),
                hashlib.sha256,
            ).digest()
            if not hmac.compare_digest(decoded_sig, expected_sig):
                return None
            decoded_payload = base64.urlsafe_b64decode(payload + '==')
            return json.loads(decoded_payload)
        except Exception:
            logger.exception('Failed to verify signed_request')
            return None
