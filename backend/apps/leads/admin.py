from django.contrib import admin
from .models import Lead


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'temperature', 'tenant', 'manager_notified', 'created_at']
    list_filter = ['temperature', 'manager_notified', 'tenant']
    search_fields = ['name', 'phone']
