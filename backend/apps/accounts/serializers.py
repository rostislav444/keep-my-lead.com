from rest_framework import serializers
from .models import InstagramAccount


class InstagramAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstagramAccount
        fields = ['id', 'username', 'instagram_user_id', 'is_active', 'connected_at', 'token_expires_at']
        read_only_fields = ['id', 'username', 'instagram_user_id', 'connected_at']
