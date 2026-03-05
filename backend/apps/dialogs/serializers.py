from rest_framework import serializers
from .models import Dialog, Message


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'role', 'text', 'created_at']
        read_only_fields = ['id', 'created_at']


class DialogListSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Dialog
        fields = [
            'id', 'instagram_username', 'status', 'source',
            'is_bot_active', 'started_at', 'updated_at', 'last_message',
        ]

    def get_last_message(self, obj):
        msg = obj.messages.last()
        if msg:
            return {'role': msg.role, 'text': msg.text[:100], 'created_at': msg.created_at}
        return None


class DialogDetailSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Dialog
        fields = [
            'id', 'instagram_username', 'instagram_user_id', 'status',
            'source', 'is_bot_active', 'started_at', 'updated_at', 'messages',
        ]
