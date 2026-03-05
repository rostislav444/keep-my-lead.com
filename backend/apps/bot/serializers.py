from rest_framework import serializers
from .models import BotConfig


class BotConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = BotConfig
        fields = [
            'id', 'bot_name', 'tone', 'goal', 'greeting_template',
            'escalation_trigger', 'forbidden_topics', 'additional_instructions',
        ]
        read_only_fields = ['id']
