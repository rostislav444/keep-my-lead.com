from django.contrib import admin
from .models import Dialog, Message


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ['role', 'text', 'created_at']


@admin.register(Dialog)
class DialogAdmin(admin.ModelAdmin):
    list_display = ['instagram_username', 'tenant', 'status', 'source', 'is_bot_active', 'updated_at']
    list_filter = ['status', 'source', 'is_bot_active', 'tenant']
    search_fields = ['instagram_username', 'instagram_user_id']
    inlines = [MessageInline]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['dialog', 'role', 'text_short', 'created_at']
    list_filter = ['role']

    def text_short(self, obj):
        return obj.text[:80]
