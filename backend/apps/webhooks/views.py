import logging

from django.http import HttpResponse
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from .services import handle_webhook_payload, verify_meta_webhook

logger = logging.getLogger(__name__)


class InstagramWebhookView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        challenge = verify_meta_webhook(request)
        if challenge:
            return HttpResponse(challenge, content_type='text/plain')
        return HttpResponse(status=403)

    def post(self, request):
        logger.debug('Webhook received: %s', request.data)
        handle_webhook_payload(request.data)
        return HttpResponse('OK', content_type='text/plain')
