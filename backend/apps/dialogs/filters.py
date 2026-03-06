from django_filters import rest_framework as filters
from .models import Dialog


class DialogFilter(filters.FilterSet):
    class Meta:
        model = Dialog
        fields = ['status', 'source']
