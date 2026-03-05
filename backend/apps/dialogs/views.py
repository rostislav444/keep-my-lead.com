from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Dialog, Message
from .serializers import DialogListSerializer, DialogDetailSerializer


class DialogListView(generics.ListAPIView):
    serializer_class = DialogListSerializer

    def get_queryset(self):
        qs = Dialog.objects.filter(
            tenant=self.request.user.tenant
        ).prefetch_related('messages')
        s = self.request.query_params.get('status')
        if s:
            qs = qs.filter(status=s)
        source = self.request.query_params.get('source')
        if source:
            qs = qs.filter(source=source)
        return qs.order_by('-updated_at')


class DialogDetailView(generics.RetrieveAPIView):
    serializer_class = DialogDetailSerializer

    def get_queryset(self):
        return Dialog.objects.filter(
            tenant=self.request.user.tenant
        ).prefetch_related('messages')


class DialogHandoffView(APIView):
    def post(self, request, pk):
        dialog = Dialog.objects.get(pk=pk, tenant=request.user.tenant)
        dialog.is_bot_active = False
        dialog.status = Dialog.Status.HANDED_OFF
        dialog.save()
        return Response({'status': 'handed_off'})


class DialogReturnToBotView(APIView):
    def post(self, request, pk):
        dialog = Dialog.objects.get(pk=pk, tenant=request.user.tenant)
        dialog.is_bot_active = True
        dialog.status = Dialog.Status.ACTIVE
        dialog.save()
        return Response({'status': 'returned_to_bot'})


class DialogSendMessageView(APIView):
    def post(self, request, pk):
        dialog = Dialog.objects.get(pk=pk, tenant=request.user.tenant)
        text = request.data.get('text', '').strip()
        if not text:
            return Response(
                {'error': 'text is required'}, status=status.HTTP_400_BAD_REQUEST
            )
        message = Message.objects.create(
            dialog=dialog, role=Message.Role.MANAGER, text=text
        )
        # TODO: send message via Meta API
        return Response({
            'id': message.id, 'role': message.role,
            'text': message.text, 'created_at': message.created_at,
        }, status=status.HTTP_201_CREATED)
