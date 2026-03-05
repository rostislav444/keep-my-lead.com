import hashlib
import hmac
import logging
import time

import httpx
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User
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
