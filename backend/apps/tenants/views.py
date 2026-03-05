import hashlib
import hmac
import logging
import time
from urllib.parse import urlencode

import httpx
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse
from django.shortcuts import redirect
from django.utils.text import slugify
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Tenant, User
from .serializers import RegisterSerializer, UserSerializer, TeamMemberSerializer

logger = logging.getLogger(__name__)


def _make_tg_token(user_id):
    """Create an HMAC token: user_id:timestamp:signature."""
    ts = str(int(time.time()))
    msg = f'{user_id}:{ts}'
    sig = hmac.new(
        settings.SECRET_KEY.encode(), msg.encode(), hashlib.sha256
    ).hexdigest()[:16]
    return f'{user_id}.{ts}.{sig}'


def _verify_tg_token(token, max_age=3600):
    """Verify token, return user_id or None."""
    try:
        user_id, ts, sig = token.split('.')
        msg = f'{user_id}:{ts}'
        expected = hmac.new(
            settings.SECRET_KEY.encode(), msg.encode(), hashlib.sha256
        ).hexdigest()[:16]
        if not hmac.compare_digest(sig, expected):
            return None
        if time.time() - int(ts) > max_age:
            return None
        return int(user_id)
    except (ValueError, TypeError):
        return None


@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        login(request, user)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response(
                {'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED
            )
        login(request, user)
        return Response(UserSerializer(user).data)


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class TelegramLinkView(APIView):
    """Generate a Telegram deep link for the current user to connect notifications."""

    def get(self, request):
        token = _make_tg_token(request.user.id)
        bot_token = settings.TELEGRAM_BOT_TOKEN
        if not bot_token:
            return Response(
                {'error': 'Telegram bot not configured'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        # Get bot username via getMe
        try:
            resp = httpx.get(
                f'https://api.telegram.org/bot{bot_token}/getMe', timeout=5
            )
            bot_username = resp.json().get('result', {}).get('username', '')
        except Exception:
            bot_username = ''

        if not bot_username:
            return Response(
                {'error': 'Could not get bot username'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        deep_link = f'https://t.me/{bot_username}?start={token}'
        return Response({
            'link': deep_link,
            'bot_username': bot_username,
            'connected': bool(request.user.telegram_chat_id),
        })

    def delete(self, request):
        """Disconnect Telegram notifications."""
        request.user.telegram_chat_id = ''
        request.user.save(update_fields=['telegram_chat_id'])
        return Response(status=status.HTTP_204_NO_CONTENT)


@method_decorator(csrf_exempt, name='dispatch')
class TelegramWebhookView(APIView):
    """Handle Telegram bot webhook: /start <token> saves chat_id."""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        data = request.data
        message = data.get('message', {})
        text = message.get('text', '')
        chat_id = str(message.get('chat', {}).get('id', ''))
        first_name = message.get('chat', {}).get('first_name', '')

        if not text.startswith('/start') or not chat_id:
            return HttpResponse('ok')

        parts = text.split()
        if len(parts) < 2:
            self._send_reply(chat_id, 'Please use the link from LeadBot to connect.')
            return HttpResponse('ok')

        token = parts[1]
        user_id = _verify_tg_token(token)

        if user_id is None:
            self._send_reply(chat_id, 'Link expired or invalid. Generate a new one in LeadBot settings.')
            return HttpResponse('ok')

        try:
            user = User.objects.get(id=user_id)
            user.telegram_chat_id = chat_id
            user.save(update_fields=['telegram_chat_id'])
            logger.info('Telegram connected: user=%s chat_id=%s', user.username, chat_id)
            self._send_reply(
                chat_id,
                f'Connected! Hi {first_name}, you will now receive lead notifications for {user.tenant.name}.'
            )
        except User.DoesNotExist:
            self._send_reply(chat_id, 'User not found.')

        return HttpResponse('ok')

    def _send_reply(self, chat_id, text):
        token = settings.TELEGRAM_BOT_TOKEN
        if not token:
            return
        try:
            httpx.post(
                f'https://api.telegram.org/bot{token}/sendMessage',
                json={'chat_id': chat_id, 'text': text},
                timeout=5,
            )
        except Exception as e:
            logger.error('Telegram reply failed: %s', e)


class TeamListCreateView(generics.ListCreateAPIView):
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserSerializer
        return TeamMemberSerializer

    def get_queryset(self):
        return User.objects.filter(tenant=self.request.user.tenant, role=User.Role.MANAGER)


class TeamDeleteView(generics.DestroyAPIView):
    def get_queryset(self):
        return User.objects.filter(tenant=self.request.user.tenant, role=User.Role.MANAGER)


@method_decorator(csrf_exempt, name='dispatch')
class OnboardingView(APIView):
    """Complete registration after Instagram OAuth: create tenant + user + connect IG."""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get(self, request):
        """Return stored IG onboarding data from session."""
        ig_data = request.session.get('ig_onboarding')
        if not ig_data:
            return Response({'error': 'no_onboarding_data'}, status=400)
        return Response({
            'ig_username': ig_data.get('ig_username', ''),
            'ig_name': ig_data.get('ig_name', ''),
        })

    def post(self, request):
        ig_data = request.session.get('ig_onboarding')
        if not ig_data:
            return Response(
                {'error': 'No Instagram data in session. Please sign in with Instagram first.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        company_name = request.data.get('company_name', '').strip()
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')
        industry = request.data.get('industry', '').strip()

        if not company_name:
            return Response({'error': 'Company name is required.'}, status=400)

        ig_username = ig_data['ig_username']
        ig_user_id = ig_data['ig_user_id']
        access_token = ig_data['access_token']

        # Check if username is taken
        if User.objects.filter(username=ig_username).exists():
            return Response({'error': 'This Instagram account is already registered.'}, status=400)

        tenant = Tenant.objects.create(
            name=company_name,
            slug=slugify(company_name) or f'ig-{ig_user_id}',
            industry=industry,
        )
        user = User.objects.create_user(
            username=ig_username,
            email=email,
            password=password if password else None,
            tenant=tenant,
            role=User.Role.OWNER,
        )

        from apps.accounts.models import InstagramAccount
        InstagramAccount.objects.update_or_create(
            instagram_user_id=ig_user_id,
            defaults={
                'tenant': tenant,
                'username': ig_username,
                'access_token': access_token,
                'is_active': True,
            },
        )

        # Clear session data and log in
        del request.session['ig_onboarding']
        login(request, user)
        logger.info('Instagram signup completed: @%s, company: %s', ig_username, company_name)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


INSTAGRAM_AUTH_URL = 'https://www.instagram.com/oauth/authorize'
IG_SCOPES = 'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments'


class InstagramLoginRedirectView(APIView):
    """Redirect user to Instagram OAuth for login/signup."""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get(self, request):
        callback_url = request.build_absolute_uri('/api/auth/instagram/callback')
        params = {
            'client_id': settings.META_APP_ID,
            'redirect_uri': callback_url,
            'response_type': 'code',
            'scope': IG_SCOPES,
        }
        return redirect(f'{INSTAGRAM_AUTH_URL}?{urlencode(params)}')


@method_decorator(csrf_exempt, name='dispatch')
class InstagramLoginCallbackView(APIView):
    """Handle Instagram OAuth callback: create/login user + connect IG account."""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get(self, request):
        code = request.query_params.get('code')
        error = request.query_params.get('error')

        if error or not code:
            return redirect(f'/panel/login?error={error or "no_code"}')

        try:
            from apps.accounts.views import exchange_code_for_token
            from apps.accounts.models import InstagramAccount

            callback_url = request.build_absolute_uri('/api/auth/instagram/callback')
            access_token, ig_user_id, ig_username, ig_name = exchange_code_for_token(code, callback_url)

            # Check if this Instagram account is already linked to a user
            ig_account = InstagramAccount.objects.filter(instagram_user_id=ig_user_id).first()

            if ig_account and ig_account.tenant:
                # Existing user — log them in
                user = User.objects.filter(tenant=ig_account.tenant, role=User.Role.OWNER).first()
                if user:
                    ig_account.access_token = access_token
                    ig_account.is_active = True
                    ig_account.save(update_fields=['access_token', 'is_active'])
                    login(request, user)
                    logger.info('Instagram login: @%s -> user %s', ig_username, user.username)
                    return redirect('/panel/dashboard')

            # New user — store IG data in session and redirect to onboarding
            request.session['ig_onboarding'] = {
                'access_token': access_token,
                'ig_user_id': ig_user_id,
                'ig_username': ig_username,
                'ig_name': ig_name,
            }
            logger.info('Instagram onboarding started: @%s', ig_username)
            return redirect('/panel/onboarding')

        except Exception as e:
            logger.exception('Instagram login error')
            return redirect('/panel/login?error=oauth_failed')
