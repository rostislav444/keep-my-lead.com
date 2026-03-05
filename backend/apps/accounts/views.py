import logging
from urllib.parse import urlencode

import httpx
from django.conf import settings
from django.shortcuts import redirect
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import InstagramAccount
from .serializers import InstagramAccountSerializer

logger = logging.getLogger(__name__)

INSTAGRAM_AUTH_URL = 'https://api.instagram.com/oauth/authorize'
INSTAGRAM_TOKEN_URL = 'https://api.instagram.com/oauth/access_token'
INSTAGRAM_GRAPH_URL = 'https://graph.instagram.com'

SCOPES = 'instagram_business_basic,instagram_business_manage_messages,instagram_manage_comments'


class InstagramAccountListView(generics.ListAPIView):
    serializer_class = InstagramAccountSerializer

    def get_queryset(self):
        return InstagramAccount.objects.filter(tenant=self.request.user.tenant)


class InstagramAccountDeleteView(generics.DestroyAPIView):
    serializer_class = InstagramAccountSerializer

    def get_queryset(self):
        return InstagramAccount.objects.filter(tenant=self.request.user.tenant)


class InstagramConnectView(APIView):
    """Return the Instagram OAuth URL for the frontend to redirect to."""

    def get(self, request):
        callback_url = request.build_absolute_uri('/api/panel/settings/accounts/callback')
        redirect_uri = request.query_params.get('redirect_uri', callback_url)

        params = {
            'client_id': settings.META_APP_ID,
            'redirect_uri': redirect_uri,
            'response_type': 'code',
            'scope': SCOPES,
        }
        auth_url = f'{INSTAGRAM_AUTH_URL}?{urlencode(params)}'
        return Response({'auth_url': auth_url, 'redirect_uri': redirect_uri})


class InstagramCallbackView(APIView):
    """Handle OAuth callback: exchange code for token, save account."""
    permission_classes = []
    authentication_classes = []

    def get(self, request):
        code = request.query_params.get('code')
        error = request.query_params.get('error')

        if error:
            logger.error('Instagram OAuth error: %s - %s',
                         error, request.query_params.get('error_description'))
            return redirect(f'/panel/settings/accounts?error={error}')

        if not code:
            return redirect('/panel/settings/accounts?error=no_code')

        try:
            callback_url = request.build_absolute_uri('/api/panel/settings/accounts/callback')

            # 1. Exchange code for short-lived token
            token_resp = httpx.post(INSTAGRAM_TOKEN_URL, data={
                'client_id': settings.META_APP_ID,
                'client_secret': settings.META_APP_SECRET,
                'grant_type': 'authorization_code',
                'redirect_uri': callback_url,
                'code': code,
            }, timeout=15)
            token_data = token_resp.json()
            logger.info('Token exchange response status: %s', token_resp.status_code)

            if 'access_token' not in token_data:
                error_msg = token_data.get('error_message', 'Token exchange failed')
                logger.error('Token exchange failed: %s', token_data)
                return redirect(f'/panel/settings/accounts?error={error_msg}')

            short_token = token_data['access_token']
            user_id = str(token_data['user_id'])

            # 2. Exchange for long-lived token (60 days)
            long_resp = httpx.get(f'{INSTAGRAM_GRAPH_URL}/access_token', params={
                'grant_type': 'ig_exchange_token',
                'client_secret': settings.META_APP_SECRET,
                'access_token': short_token,
            }, timeout=15)
            long_data = long_resp.json()
            access_token = long_data.get('access_token', short_token)

            # 3. Get user profile
            profile_resp = httpx.get(f'{INSTAGRAM_GRAPH_URL}/me', params={
                'fields': 'user_id,username',
                'access_token': access_token,
            }, timeout=15)
            profile = profile_resp.json()
            username = profile.get('username', '')

            # 4. Find the logged-in user's tenant from session
            from apps.tenants.models import User
            user = None
            if request.user and request.user.is_authenticated:
                user = request.user
            else:
                session_user_id = request.session.get('_auth_user_id')
                if session_user_id:
                    user = User.objects.filter(id=session_user_id).first()

            if not user or not user.tenant:
                logger.error('No authenticated user for Instagram callback')
                return redirect('/panel/settings/accounts?error=not_authenticated')

            # 5. Save or update the Instagram account
            account, created = InstagramAccount.objects.update_or_create(
                instagram_user_id=user_id,
                defaults={
                    'tenant': user.tenant,
                    'username': username,
                    'access_token': access_token,
                    'is_active': True,
                },
            )

            action = 'connected' if created else 'updated'
            logger.info('Instagram account %s: @%s for tenant %s',
                        action, username, user.tenant)

            return redirect(f'/panel/settings/accounts?success={action}')

        except Exception as e:
            logger.exception('Instagram OAuth error')
            return redirect(f'/panel/settings/accounts?error=oauth_failed')
