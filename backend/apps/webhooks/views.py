import logging
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name='dispatch')
class InstagramWebhookView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        """Webhook verification by Meta."""
        mode = request.query_params.get('hub.mode')
        token = request.query_params.get('hub.verify_token')
        challenge = request.query_params.get('hub.challenge')
        if mode == 'subscribe' and token == settings.META_VERIFY_TOKEN:
            return HttpResponse(challenge)
        return HttpResponse(status=403)

    def post(self, request):
        """Handle incoming webhook events from Meta."""
        payload = request.data
        print(f'[WEBHOOK] Received: {payload}', flush=True)

        for entry in payload.get('entry', []):
            page_id = entry.get('id')
            print(f'[WEBHOOK] entry.id={page_id}, keys={list(entry.keys())}', flush=True)

            # Direct Messages
            for messaging in entry.get('messaging', []):
                print(f'[WEBHOOK] messaging={messaging}', flush=True)
                self._handle_dm(page_id, messaging)

            # Comments
            for change in entry.get('changes', []):
                if change.get('field') == 'comments':
                    self._handle_comment(page_id, change.get('value', {}))

        return Response('OK')

    def _handle_dm(self, page_id, messaging):
        sender_id = messaging.get('sender', {}).get('id')
        message = messaging.get('message', {})
        text = message.get('text', '')

        if not text or not sender_id:
            return

        # Don't process echo (messages sent by the page itself)
        if message.get('is_echo'):
            return

        from apps.webhooks.services import process_incoming_message
        process_incoming_message(
            page_id=page_id,
            sender_id=sender_id,
            text=text,
            message_id=message.get('mid', ''),
            source='dm',
        )

    def _handle_comment(self, page_id, comment_data):
        user_id = comment_data.get('from', {}).get('id')
        text = comment_data.get('text', '')
        post_id = comment_data.get('media', {}).get('id', '')

        if not text or not user_id:
            return

        from apps.webhooks.services import process_incoming_message
        process_incoming_message(
            page_id=page_id,
            sender_id=user_id,
            text=text,
            message_id=comment_data.get('id', ''),
            source='comment',
            post_id=post_id,
        )
