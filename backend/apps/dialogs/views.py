from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.core.mixins import TenantQuerySetMixin
from .filters import DialogFilter
from .models import Dialog
from .serializers import DialogListSerializer, DialogDetailSerializer, MessageSerializer
from .services import handoff_dialog, return_dialog_to_bot, send_manager_message


class DialogViewSet(TenantQuerySetMixin, viewsets.ReadOnlyModelViewSet):
    queryset = Dialog.objects.all()
    filterset_class = DialogFilter

    def get_queryset(self):
        return super().get_queryset().prefetch_related('messages').order_by('-updated_at')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DialogDetailSerializer
        return DialogListSerializer

    @action(detail=True, methods=['post'])
    def handoff(self, request, pk=None):
        handoff_dialog(self.get_object())
        return Response({'status': 'handed_off'})

    @action(detail=True, methods=['post'], url_path='return-to-bot')
    def return_to_bot(self, request, pk=None):
        return_dialog_to_bot(self.get_object())
        return Response({'status': 'returned_to_bot'})

    @action(detail=True, methods=['post'])
    def send(self, request, pk=None):
        text = request.data.get('text', '').strip()
        if not text:
            return Response(
                {'error': 'text is required'}, status=status.HTTP_400_BAD_REQUEST
            )
        message = send_manager_message(self.get_object(), text)
        return Response(
            MessageSerializer(message).data,
            status=status.HTTP_201_CREATED,
        )
