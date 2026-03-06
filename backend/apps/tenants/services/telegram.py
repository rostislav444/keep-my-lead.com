import logging

import httpx
from django.conf import settings

from apps.core.services.tokens import TelegramLinkTokenService, TokenValidationError
from ..models import User

logger = logging.getLogger(__name__)


class TelegramBotClient:
    """Client for Telegram Bot API."""

    def __init__(self, token: str | None = None, timeout: int = 5):
        self.token = token or settings.TELEGRAM_BOT_TOKEN
        self.timeout = timeout

    @property
    def is_configured(self) -> bool:
        return bool(self.token)

    def _build_url(self, method: str) -> str:
        return f'https://api.telegram.org/bot{self.token}/{method}'

    def send_message(self, chat_id: str, text: str) -> bool:
        if not self.is_configured:
            return False
        try:
            response = httpx.post(
                self._build_url('sendMessage'),
                json={'chat_id': chat_id, 'text': text},
                timeout=self.timeout,
            )
            response.raise_for_status()
            return True
        except Exception as exc:
            logger.error('Telegram send_message failed: %s', exc)
            return False

    def get_bot_username(self) -> str | None:
        if not self.is_configured:
            return None
        try:
            response = httpx.get(
                self._build_url('getMe'),
                timeout=self.timeout,
            )
            response.raise_for_status()
            data = response.json()
            return data.get('result', {}).get('username') or None
        except Exception as exc:
            logger.error('Telegram getMe failed: %s', exc)
            return None


class TelegramConnectionService:
    """Business logic for Telegram connect/disconnect flow."""

    def __init__(
        self,
        bot_client: TelegramBotClient | None = None,
        token_service: TelegramLinkTokenService | None = None,
    ):
        self.bot_client = bot_client or TelegramBotClient()
        self.token_service = token_service or TelegramLinkTokenService()

    def generate_link(self, user) -> dict | None:
        bot_username = self.bot_client.get_bot_username()
        if not bot_username:
            return None

        token = self.token_service.dumps(user.id)
        return {
            'link': f'https://t.me/{bot_username}?start={token}',
            'bot_username': bot_username,
            'connected': bool(user.telegram_chat_id),
        }

    def disconnect(self, user) -> None:
        user.telegram_chat_id = ''
        user.save(update_fields=['telegram_chat_id'])

    def handle_start(self, chat_id: str, text: str, first_name: str) -> None:
        parts = text.split()
        if len(parts) < 2:
            self.bot_client.send_message(
                chat_id, 'Please use the link from LeadBot to connect.'
            )
            return

        try:
            user_id = self.token_service.loads(parts[1])
        except TokenValidationError:
            self.bot_client.send_message(
                chat_id, 'Link expired or invalid. Generate a new one.'
            )
            return

        try:
            user = User.objects.select_related('tenant').get(id=user_id)
        except User.DoesNotExist:
            self.bot_client.send_message(chat_id, 'User not found.')
            return

        user.telegram_chat_id = chat_id
        user.save(update_fields=['telegram_chat_id'])
        logger.info('Telegram connected: user=%s chat_id=%s', user.username, chat_id)

        self.bot_client.send_message(
            chat_id,
            f'Connected! Hi {first_name}, you will now receive '
            f'lead notifications for {user.tenant.name}.',
        )
