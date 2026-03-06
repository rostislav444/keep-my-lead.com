from django_filters import rest_framework as filters
from .models import Lead


class LeadFilter(filters.FilterSet):
    class Meta:
        model = Lead
        fields = ['temperature']
