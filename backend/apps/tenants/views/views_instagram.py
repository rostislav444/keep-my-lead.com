import logging
from urllib.parse import urlencode

from django.conf import settings
from django.shortcuts import redirect
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.services.auth import JwtService
from ..serializers import OnboardingSerializer, UserSerializer
from ..services import InstagramOnboardingService

logger = logging.getLogger(__name__)

INSTAGRAM_AUTH_URL = 'https://www.instagram.com/oauth/authorize'
IG_SCOPES = 'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments'


class InstagramLoginRedirectView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        callback_url = request.build_absolute_uri('/api/auth/instagram/callback/')
        params = {
            'client_id': settings.META_APP_ID,
            'redirect_uri': callback_url,
            'response_type': 'code',
            'scope': IG_SCOPES,
        }
        return redirect(f'{INSTAGRAM_AUTH_URL}?{urlencode(params)}')


class InstagramLoginCallbackView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.onboarding_service = InstagramOnboardingService()

    def get(self, request):
        code = request.query_params.get('code')
        error = request.query_params.get('error')

        if error or not code:
            return redirect(f'/panel/login?error={error or "no_code"}')

        try:
            callback_url = request.build_absolute_uri('/api/auth/instagram/callback/')
            redirect_url = self.onboarding_service.handle_login_callback(code, callback_url)
            return redirect(redirect_url)
        except Exception:
            logger.exception('Instagram login error')
            return redirect('/panel/login?error=oauth_failed')


class OnboardingView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.onboarding_service = InstagramOnboardingService()
        self.jwt_service = JwtService()

    def get(self, request):
        token = request.query_params.get('token', '')
        data = self.onboarding_service.load_onboarding_data(token)
        if not data:
            return Response({'error': 'Token expired or invalid'}, status=400)
        return Response(data)

    def post(self, request):
        serializer = OnboardingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user, error = self.onboarding_service.complete_onboarding(serializer.validated_data)
        if error:
            return Response({'error': error}, status=400)

        access_jwt, refresh_jwt = self.jwt_service.create_tokens_for_user(user)
        return Response(
            {
                'access': access_jwt,
                'refresh': refresh_jwt,
                'user': UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )
