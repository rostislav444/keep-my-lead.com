from rest_framework import serializers
from .models import Lead


class LeadSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True, default=None)
    dialog_id = serializers.IntegerField(source='dialog.id', read_only=True)

    class Meta:
        model = Lead
        fields = [
            'id', 'name', 'phone', 'interest', 'product', 'product_name',
            'temperature', 'manager_notified', 'dialog_id', 'created_at',
        ]
