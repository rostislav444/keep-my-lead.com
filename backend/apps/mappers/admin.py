from django.contrib import admin
from .models import TenantCRMConfig


@admin.register(TenantCRMConfig)
class TenantCRMConfigAdmin(admin.ModelAdmin):
    list_display = ['name', 'tenant', 'api_url', 'is_active', 'last_synced_at']
    list_filter = ['is_active']
