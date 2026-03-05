import csv
from django.http import HttpResponse
from rest_framework import generics
from .models import Lead
from .serializers import LeadSerializer


class LeadListView(generics.ListAPIView):
    serializer_class = LeadSerializer

    def get_queryset(self):
        qs = Lead.objects.filter(
            tenant=self.request.user.tenant
        ).select_related('product', 'dialog')
        temp = self.request.query_params.get('temperature')
        if temp:
            qs = qs.filter(temperature=temp)
        return qs.order_by('-created_at')


class LeadExportCSVView(generics.GenericAPIView):
    def get(self, request):
        leads = Lead.objects.filter(tenant=request.user.tenant).select_related('product')
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
