from django.contrib import admin
from .models import Category, Item


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'tenant', 'order']
    list_filter = ['tenant']


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'tenant', 'is_active', 'source_type', 'synced_at']
    list_filter = ['is_active', 'tenant', 'source_type']
    search_fields = ['name']
