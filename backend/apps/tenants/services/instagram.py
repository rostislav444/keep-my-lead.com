import logging

from django.utils.text import slugify

from apps.core.services.auth import JwtService
from apps.core.services.tokens import InstagramOnboardingTokenService, TokenValidationError
from ..models import Tenant, User

logger = logging.getLogger(__name__)


class InstagramOnboardingService:
    """Instagram login callback and onboarding workflow."""

    def __init__(
        self,
        token_service: InstagramOnboardingTokenService | None = None,
        jwt_service: JwtService | None = None,
    ):
        self.token_service = token_service or InstagramOnboardingTokenService()
        self.jwt_service = jwt_service or JwtService()

    def handle_login_callback(self, code: str, callback_url: str) -> str:
        """Handle Instagram OAuth callback. Returns redirect URL."""
        from apps.accounts.services.instagram import InstagramApiClient
        from apps.accounts.models import InstagramAccount

        client = InstagramApiClient()
        access_token, ig_user_id, ig_username, ig_name = client.exchange_code_for_token(
            code, callback_url
        )

        ig_account = InstagramAccount.objects.filter(
            instagram_user_id=ig_user_id,
        ).select_related('tenant').first()

        if ig_account and ig_account.tenant:
            user = User.objects.filter(
                tenant=ig_account.tenant, role=User.Role.OWNER
            ).first()
            if user:
                ig_account.access_token = access_token
                ig_account.is_active = True
                ig_account.save(update_fields=['access_token', 'is_active'])

                access_jwt, refresh_jwt = self.jwt_service.create_tokens_for_user(user)
                return f'/panel/auth/callback?access={access_jwt}&refresh={refresh_jwt}'

        token = self.token_service.dumps({
            'access_token': access_token,
            'ig_user_id': ig_user_id,
            'ig_username': ig_username,
            'ig_name': ig_name,
        })
        return f'/panel/onboarding?token={token}'

    def load_onboarding_data(self, token: str) -> dict | None:
        """Load Instagram onboarding data from signed token."""
        try:
            data = self.token_service.loads(token)
        except TokenValidationError:
            return None

        return {
            'ig_username': data.get('ig_username', ''),
            'ig_name': data.get('ig_name', ''),
            'token': token,
        }

    def complete_onboarding(self, validated_data: dict) -> tuple[User | None, str | None]:
        """Create tenant, user, and IG account. Returns (user, error)."""
        from apps.accounts.models import InstagramAccount

        try:
            ig_data = self.token_service.loads(validated_data['token'])
        except TokenValidationError:
            return None, 'Token expired or invalid'

        ig_username = ig_data['ig_username']
        ig_user_id = ig_data['ig_user_id']
        access_token = ig_data['access_token']
        company_name = validated_data['company_name']

        if User.objects.filter(username=ig_username).exists():
            return None, 'This Instagram account is already registered.'

        tenant = Tenant.objects.create(
            name=company_name,
            slug=slugify(company_name) or f'ig-{ig_user_id}',
            industry=validated_data.get('industry', ''),
        )
        user = User.objects.create_user(
            username=ig_username,
            email=validated_data.get('email', ''),
            password=validated_data.get('password') or None,
            tenant=tenant,
            role=User.Role.OWNER,
        )

        InstagramAccount.objects.update_or_create(
            instagram_user_id=ig_user_id,
            defaults={
                'tenant': tenant,
                'username': ig_username,
                'access_token': access_token,
                'is_active': True,
            },
        )

        logger.info('Instagram signup: @%s, company: %s', ig_username, company_name)
        return user, None
