from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.core.mixins import TenantQuerySetMixin
from .models import TenantCRMConfig
from .serializers import TenantCRMConfigSerializer
from . import engine


class IntegrationViewSet(TenantQuerySetMixin, viewsets.ModelViewSet):
    serializer_class = TenantCRMConfigSerializer
    queryset = TenantCRMConfig.objects.all()

    @action(detail=True, methods=['post'])
    def sync(self, request, pk=None):
        config = self.get_object()
        try:
            engine.sync(config)
            return Response({'status': 'sync complete'})
        except Exception as e:
            return Response(
                {'error': str(e)}, status=status.HTTP_400_BAD_REQUEST
            )
