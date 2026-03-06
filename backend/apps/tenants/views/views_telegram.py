from django.http import HttpResponse
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from ..services import TelegramConnectionService


class TelegramViewSet(viewsets.ViewSet):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.tg_service = TelegramConnectionService()

    @action(detail=False, methods=['get', 'delete'], url_path='link')
    def link(self, request):
        if request.method == 'DELETE':
            self.tg_service.disconnect(request.user)
            return Response(status=status.HTTP_204_NO_CONTENT)

        data = self.tg_service.generate_link(request.user)
        if not data:
            return Response(
                {'error': 'Telegram bot not configured'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response(data)

    @action(detail=False, methods=['post'], url_path='webhook',
            permission_classes=[AllowAny], authentication_classes=[])
    def webhook(self, request):
        message = request.data.get('message', {})
        text = message.get('text', '')
        chat_id = str(message.get('chat', {}).get('id', ''))
        first_name = message.get('chat', {}).get('first_name', '')

        if not text.startswith('/start') or not chat_id:
            return HttpResponse('ok')

        self.tg_service.handle_start(chat_id, text, first_name)
        return HttpResponse('ok')
