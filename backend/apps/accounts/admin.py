from django.contrib import admin
from .models import InstagramAccount


@admin.register(InstagramAccount)
class InstagramAccountAdmin(admin.ModelAdmin):
    list_display = ['username', 'tenant', 'is_active', 'connected_at']
    list_filter = ['is_active', 'tenant']
    search_fields = ['username']
