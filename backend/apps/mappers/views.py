from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import TenantCRMConfig
from .serializers import TenantCRMConfigSerializer
from . import engine


class IntegrationListCreateView(generics.ListCreateAPIView):
    serializer_class = TenantCRMConfigSerializer

    def get_queryset(self):
        return TenantCRMConfig.objects.filter(tenant=self.request.user.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class IntegrationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TenantCRMConfigSerializer

    def get_queryset(self):
        return TenantCRMConfig.objects.filter(tenant=self.request.user.tenant)


class IntegrationSyncView(APIView):
    def post(self, request, pk):
        config = TenantCRMConfig.objects.get(pk=pk, tenant=request.user.tenant)
        try:
            engine.sync(config)
            return Response({'status': 'sync complete'})
        except Exception as e:
            return Response(
                {'error': str(e)}, status=status.HTTP_400_BAD_REQUEST
            )
