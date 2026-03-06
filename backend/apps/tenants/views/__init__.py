from .views_auth import LoginView, RegisterView, MeView
from .views_team import TeamViewSet
from .views_telegram import TelegramViewSet
from .views_instagram import (
    InstagramLoginRedirectView,
    InstagramLoginCallbackView,
    OnboardingView,
)

__all__ = [
    'LoginView',
    'RegisterView',
    'MeView',
    'TeamViewSet',
    'TelegramViewSet',
    'InstagramLoginRedirectView',
    'InstagramLoginCallbackView',
    'OnboardingView',
]
