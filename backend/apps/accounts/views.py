import hashlib
import hmac
import json
import logging
import time
from urllib.parse import urlencode

import httpx
from django.conf import settings
from django.shortcuts import redirect
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import InstagramAccount
from .serializers import InstagramAccountSerializer

logger = logging.getLogger(__name__)

INSTAGRAM_AUTH_URL = 'https://api.instagram.com/oauth/authorize'
INSTAGRAM_TOKEN_URL = 'https://api.instagram.com/oauth/access_token'
INSTAGRAM_GRAPH_URL = 'https://graph.instagram.com'

SCOPES = 'instagram_business_basic,instagram_business_manage_messages,instagram_manage_comments'


def exchange_code_for_token(code, redirect_uri):
    """Exchange Instagram OAuth code for a long-lived token and profile info.
    Returns (access_token, ig_user_id, username) or raises."""
    # 1. Exchange code for short-lived token
    token_resp = httpx.post(INSTAGRAM_TOKEN_URL, data={
        'client_id': settings.META_APP_ID,
        'client_secret': settings.META_APP_SECRET,
        'grant_type': 'authorization_code',
        'redirect_uri': redirect_uri,
        'code': code,
    }, timeout=15)
    token_data = token_resp.json()

    if 'access_token' not in token_data:
        raise ValueError(token_data.get('error_message', 'Token exchange failed'))

    short_token = token_data['access_token']
    ig_user_id = str(token_data['user_id'])

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
        'fields': 'user_id,username,name',
        'access_token': access_token,
    }, timeout=15)
    profile = profile_resp.json()
    username = profile.get('username', '')
    name = profile.get('name', '')

    return access_token, ig_user_id, username, name


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
        callback_url = request.build_absolute_uri('/api/settings/accounts/callback')
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
            callback_url = request.build_absolute_uri('/api/settings/accounts/callback')
            access_token, ig_user_id, username, _name = exchange_code_for_token(code, callback_url)

            # Find the logged-in user's tenant from session
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

            account, created = InstagramAccount.objects.update_or_create(
                instagram_user_id=ig_user_id,
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


def _verify_signed_request(signed_request):
    """Parse and verify Meta signed_request payload."""
    sig, payload = signed_request.split('.', 1)
    import base64
    decoded_sig = base64.urlsafe_b64decode(sig + '==')
    decoded_payload = base64.urlsafe_b64decode(payload + '==')
    expected_sig = hmac.new(
        settings.META_APP_SECRET.encode(),
        payload.encode(),
        hashlib.sha256,
    ).digest()
    if not hmac.compare_digest(decoded_sig, expected_sig):
        return None
    return json.loads(decoded_payload)


class InstagramDeauthorizeView(APIView):
    """Called by Meta when a user removes the app."""
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        signed_request = request.data.get('signed_request')
        if not signed_request:
            return Response({'error': 'missing signed_request'}, status=400)

        data = _verify_signed_request(signed_request)
        if not data:
            return Response({'error': 'invalid signature'}, status=403)

        user_id = str(data.get('user_id', ''))
        if user_id:
            InstagramAccount.objects.filter(instagram_user_id=user_id).update(is_active=False)
            logger.info('Deauthorized Instagram user %s', user_id)

        return Response({'success': True})


class InstagramDataDeletionView(APIView):
    """Called by Meta when a user requests data deletion (GDPR)."""
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        signed_request = request.data.get('signed_request')
        if not signed_request:
            return Response({'error': 'missing signed_request'}, status=400)

        data = _verify_signed_request(signed_request)
        if not data:
            return Response({'error': 'invalid signature'}, status=403)

        user_id = str(data.get('user_id', ''))
        confirmation_code = f'del_{user_id}_{int(time.time())}'

        if user_id:
            InstagramAccount.objects.filter(instagram_user_id=user_id).delete()
            logger.info('Deleted data for Instagram user %s, code: %s', user_id, confirmation_code)

        return Response({
            'url': f'https://keep-my-lead.com/data-deletion?code={confirmation_code}',
            'confirmation_code': confirmation_code,
        })
