from rest_framework import serializers
from .models import TenantCRMConfig


class TenantCRMConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenantCRMConfig
        fields = [
            'id', 'name', 'api_url', 'auth_type', 'auth_key', 'auth_value',
            'items_path', 'field_id', 'field_name', 'context_template',
            'sync_interval_minutes', 'last_synced_at', 'is_active',
        ]
        read_only_fields = ['id', 'last_synced_at']
        extra_kwargs = {'auth_value': {'write_only': True}}
