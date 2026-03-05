import json
import logging
from urllib.request import urlopen
from urllib.error import HTTPError
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

            for messaging in entry.get('messaging', []):
                print(f'[WEBHOOK] messaging={messaging}', flush=True)
                # Handle message_edit as new message (Instagram sends these instead of messages in dev mode)
                if 'message_edit' in messaging:
                    self._handle_message_edit(page_id, messaging)
                else:
                    self._handle_dm(page_id, messaging)

            for change in entry.get('changes', []):
                field = change.get('field')
                value = change.get('value', {})
                print(f'[WEBHOOK] change field={field}, value={value}', flush=True)
                if field == 'messages':
                    self._handle_dm(page_id, value)
                elif field == 'comments':
                    self._handle_comment(page_id, value)

        return Response('OK')

    def _handle_message_edit(self, sender_ig_id, messaging):
        """Handle message_edit webhook — fetch message via API to get text."""
        mid = messaging.get('message_edit', {}).get('mid', '')
        num_edit = messaging.get('message_edit', {}).get('num_edit', -1)
        if not mid or num_edit != 0:
            return  # Only process new messages (num_edit=0), not actual edits

        from apps.accounts.models import InstagramAccount

        # sender_ig_id is the person who sent the DM — we need to find the receiving business account
        # Try all active accounts and check their conversations
        for ig_account in InstagramAccount.objects.filter(is_active=True):
            try:
                url = f'https://graph.instagram.com/v25.0/{mid}?fields=from,to,message,created_time&access_token={ig_account.access_token}'
                resp = urlopen(url)
                data = json.loads(resp.read().decode())
                print(f'[WEBHOOK EDIT] Fetched message: {data}', flush=True)

                sender_id = data.get('from', {}).get('id', '')
                text = data.get('message', '')

                if not text or not sender_id:
                    return

                # Skip if the message is from our own account
                if sender_id == ig_account.instagram_user_id or sender_id == ig_account.page_id:
                    return

                from apps.webhooks.services import process_incoming_message
                process_incoming_message(
                    page_id=ig_account.page_id or ig_account.instagram_user_id,
                    sender_id=sender_id,
                    text=text,
                    message_id=mid,
                    source='dm',
                )
                return
            except HTTPError as e:
                print(f'[WEBHOOK EDIT] Failed to fetch mid={mid[:30]}... error={e.code}', flush=True)
                continue

    def _handle_dm(self, page_id, messaging):
        sender_id = messaging.get('sender', {}).get('id')
        recipient_id = messaging.get('recipient', {}).get('id')
        message = messaging.get('message', {})
        text = message.get('text', '')

        print(f'[WEBHOOK DM] sender={sender_id}, recipient={recipient_id}, text={text}', flush=True)

        if not text or not sender_id:
            return

        if message.get('is_echo'):
            return

        account_id = recipient_id or page_id

        from apps.webhooks.services import process_incoming_message
        process_incoming_message(
            page_id=account_id,
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
