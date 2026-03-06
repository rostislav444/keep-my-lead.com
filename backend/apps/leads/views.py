import csv

from django.http import HttpResponse
from rest_framework import viewsets, mixins
from rest_framework.decorators import action

from apps.core.mixins import TenantQuerySetMixin
from .filters import LeadFilter
from .models import Lead
from .serializers import LeadSerializer


class LeadViewSet(TenantQuerySetMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = LeadSerializer
    queryset = Lead.objects.all()
    filterset_class = LeadFilter

    def get_queryset(self):
        return super().get_queryset().select_related('product', 'dialog').order_by('-created_at')

    @action(detail=False, methods=['get'], url_path='export/csv')
    def export_csv(self, request):
        leads = self.get_queryset()
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="leads.csv"'
        writer = csv.writer(response)
        writer.writerow(['Name', 'Phone', 'Interest', 'Product', 'Temperature', 'Created'])
        for lead in leads:
            writer.writerow([
                lead.name, lead.phone, lead.interest,
                lead.product.name if lead.product else '',
                lead.temperature, lead.created_at.isoformat(),
            ])
        return response
