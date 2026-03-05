from django.contrib import admin
from .models import BotConfig


@admin.register(BotConfig)
class BotConfigAdmin(admin.ModelAdmin):
    list_display = ['tenant', 'bot_name', 'tone']
