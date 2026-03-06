import logging
import time
from urllib.parse import urlencode

from apps.core.services.tokens import InstagramConnectTokenService, TokenValidationError
from .instagram import INSTAGRAM_AUTH_URL, SCOPES, InstagramApiClient
from .meta import MetaSignedRequestService

logger = logging.getLogger(__name__)


class InstagramConnectService:
    """Business logic for connecting/disconnecting Instagram accounts."""

    def __init__(
        self,
        api_client: InstagramApiClient | None = None,
        token_service: InstagramConnectTokenService | None = None,
        meta_service: MetaSignedRequestService | None = None,
    ):
        self.api_client = api_client or InstagramApiClient()
        self.token_service = token_service or InstagramConnectTokenService()
        self.meta_service = meta_service or MetaSignedRequestService()

    def build_connect_url(self, user, callback_url: str) -> str:
        """Build Instagram OAuth URL with signed state."""
        state = self.token_service.dumps(user.id)
        params = {
            'client_id': self.api_client.app_id,
            'redirect_uri': callback_url,
            'response_type': 'code',
            'scope': SCOPES,
            'state': state,
        }
        return f'{INSTAGRAM_AUTH_URL}?{urlencode(params)}'

    def handle_callback(self, code: str, state: str, callback_url: str) -> tuple[str, str | None]:
        """Handle OAuth callback. Returns (redirect_path, error)."""
        from apps.tenants.models import User
        from ..models import InstagramAccount

        try:
            user_id = self.token_service.loads(state)
        except TokenValidationError:
            return '/panel/settings/accounts?error=invalid_state', 'invalid_state'

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return '/panel/settings/accounts?error=user_not_found', 'user_not_found'

        access_token, ig_user_id, username, _name = self.api_client.exchange_code_for_token(
            code, callback_url
        )

        account, created = InstagramAccount.objects.update_or_create(
            instagram_user_id=ig_user_id,
            defaults={
                'tenant': user.tenant,
                'username': username,
                'access_token': access_token,
                'is_active': True,
            },
        )

        action_str = 'connected' if created else 'updated'
        logger.info('Instagram account %s: @%s for tenant %s', action_str, username, user.tenant)
        return f'/panel/settings/accounts?success={action_str}', None

    def deauthorize(self, signed_request: str) -> tuple[bool, str | None]:
        """Handle Meta deauthorization callback."""
        from ..models import InstagramAccount

        data = self.meta_service.verify(signed_request)
        if not data:
            return False, 'invalid signature'

        user_id = str(data.get('user_id', ''))
        if user_id:
            InstagramAccount.objects.filter(instagram_user_id=user_id).update(is_active=False)
            logger.info('Deauthorized Instagram user %s', user_id)

        return True, None

    def delete_data(self, signed_request: str) -> tuple[dict | None, str | None]:
        """Handle Meta data deletion callback."""
        from ..models import InstagramAccount

        data = self.meta_service.verify(signed_request)
        if not data:
            return None, 'invalid signature'

        user_id = str(data.get('user_id', ''))
        confirmation_code = f'del_{user_id}_{int(time.time())}'

        if user_id:
            InstagramAccount.objects.filter(instagram_user_id=user_id).delete()
            logger.info('Deleted data for Instagram user %s', user_id)

        return {
            'url': f'https://keep-my-lead.com/data-deletion?code={confirmation_code}',
            'confirmation_code': confirmation_code,
        }, None
