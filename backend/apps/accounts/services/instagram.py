import logging

import httpx
from django.conf import settings

logger = logging.getLogger(__name__)

INSTAGRAM_AUTH_URL = 'https://www.instagram.com/oauth/authorize'
INSTAGRAM_TOKEN_URL = 'https://api.instagram.com/oauth/access_token'
INSTAGRAM_GRAPH_URL = 'https://graph.instagram.com'
SCOPES = 'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments'


class InstagramApiClient:
    """Client for Instagram / Graph API."""

    def __init__(self, timeout: int = 15):
        self.app_id = settings.META_APP_ID
        self.app_secret = settings.META_APP_SECRET
        self.timeout = timeout

    def exchange_code_for_token(self, code: str, redirect_uri: str) -> tuple[str, str, str, str]:
        """Exchange OAuth code for long-lived token + profile info.

        Returns (access_token, ig_user_id, username, name).
        """
        token_resp = httpx.post(INSTAGRAM_TOKEN_URL, data={
            'client_id': self.app_id,
            'client_secret': self.app_secret,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri,
            'code': code,
        }, timeout=self.timeout)
        token_data = token_resp.json()

        if 'access_token' not in token_data:
            raise ValueError(token_data.get('error_message', 'Token exchange failed'))

        short_token = token_data['access_token']
        ig_user_id = str(token_data['user_id'])

        long_resp = httpx.get(f'{INSTAGRAM_GRAPH_URL}/access_token', params={
            'grant_type': 'ig_exchange_token',
            'client_secret': self.app_secret,
            'access_token': short_token,
        }, timeout=self.timeout)
        long_data = long_resp.json()
        access_token = long_data.get('access_token', short_token)

        profile_resp = httpx.get(f'{INSTAGRAM_GRAPH_URL}/me', params={
            'fields': 'user_id,username,name',
            'access_token': access_token,
        }, timeout=self.timeout)
        profile = profile_resp.json()

        return access_token, ig_user_id, profile.get('username', ''), profile.get('name', '')
