import logging
from typing import Any

from django.core import signing

logger = logging.getLogger(__name__)


class TokenValidationError(Exception):
    """Raised when a signed token is invalid or expired."""


class BaseSignedTokenService:
    """Base service for signed token dump/load operations."""

    salt: str = ''
    max_age: int | None = None

    def dumps(self, payload: Any) -> str:
        return signing.dumps(payload, salt=self.salt)

    def loads(self, token: str) -> Any:
        try:
            return signing.loads(token, salt=self.salt, max_age=self.max_age)
        except signing.BadSignature as exc:
            raise TokenValidationError('Token expired or invalid.') from exc


class TelegramLinkTokenService(BaseSignedTokenService):
    salt = 'tg-link'
    max_age = 3600


class InstagramOnboardingTokenService(BaseSignedTokenService):
    salt = 'ig-onboarding'
    max_age = 600


class InstagramConnectTokenService(BaseSignedTokenService):
    salt = 'ig-connect'
    max_age = 600
