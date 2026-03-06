import logging

from django.shortcuts import redirect
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.core.mixins import TenantQuerySetMixin
from ..models import InstagramAccount
from ..serializers import InstagramAccountSerializer
from ..services import InstagramConnectService

logger = logging.getLogger(__name__)


class InstagramAccountViewSet(
    TenantQuerySetMixin,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = InstagramAccountSerializer
    queryset = InstagramAccount.objects.all()

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.connect_service = InstagramConnectService()

    @action(detail=False, methods=['get'])
    def connect(self, request):
        callback_url = request.build_absolute_uri('/api/settings/accounts/callback/')
        auth_url = self.connect_service.build_connect_url(request.user, callback_url)
        return Response({'auth_url': auth_url})

    @action(detail=False, methods=['get'], permission_classes=[AllowAny], authentication_classes=[])
    def callback(self, request):
        code = request.query_params.get('code')
        error = request.query_params.get('error')

        if error:
            return redirect(f'/panel/settings/accounts?error={error}')
        if not code:
            return redirect('/panel/settings/accounts?error=no_code')

        try:
            state = request.query_params.get('state', '')
            callback_url = request.build_absolute_uri('/api/settings/accounts/callback/')
            redirect_url, err = self.connect_service.handle_callback(code, state, callback_url)
            return redirect(redirect_url)
        except Exception:
            logger.exception('Instagram OAuth error')
            return redirect('/panel/settings/accounts?error=oauth_failed')

    @action(detail=False, methods=['post'], url_path='deauthorize',
            permission_classes=[AllowAny], authentication_classes=[])
    def deauthorize(self, request):
        signed_request = request.data.get('signed_request')
        if not signed_request:
            return Response({'error': 'missing signed_request'}, status=400)

        success, error = self.connect_service.deauthorize(signed_request)
        if not success:
            return Response({'error': error}, status=403)
        return Response({'success': True})

    @action(detail=False, methods=['post'], url_path='data-deletion',
            permission_classes=[AllowAny], authentication_classes=[])
    def data_deletion(self, request):
        signed_request = request.data.get('signed_request')
        if not signed_request:
            return Response({'error': 'missing signed_request'}, status=400)

        result, error = self.connect_service.delete_data(signed_request)
        if not result:
            return Response({'error': error}, status=403)
        return Response(result)
