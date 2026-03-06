from rest_framework_simplejwt.tokens import RefreshToken


class JwtService:
    """JWT token generation service."""

    @staticmethod
    def create_tokens_for_user(user) -> tuple[str, str]:
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token), str(refresh)
