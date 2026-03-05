from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Tenant, User


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'industry', 'is_active', 'created_at']
    list_filter = ['is_active', 'industry']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'tenant', 'role', 'is_active']
    list_filter = ['role', 'is_active', 'tenant']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('LeadBot', {'fields': ('tenant', 'role', 'telegram_chat_id')}),
    )
