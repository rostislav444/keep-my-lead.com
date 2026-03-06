from rest_framework import viewsets

from apps.core.mixins import TenantQuerySetMixin
from .filters import ItemFilter
from .models import Category, Item
from .serializers import CategorySerializer, ItemSerializer


class CategoryViewSet(TenantQuerySetMixin, viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()


class ItemViewSet(TenantQuerySetMixin, viewsets.ModelViewSet):
    serializer_class = ItemSerializer
    queryset = Item.objects.select_related('category')
    filterset_class = ItemFilter
