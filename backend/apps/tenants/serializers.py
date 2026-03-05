from rest_framework import serializers
from .models import Tenant, User


class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = ['id', 'name', 'slug', 'industry', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'telegram_chat_id']
        read_only_fields = ['id']


class RegisterSerializer(serializers.Serializer):
    # Tenant fields
    company_name = serializers.CharField(max_length=255)
    industry = serializers.CharField(max_length=100, required=False, default='')
    # User fields
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already exists')
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already exists')
        return value

    def create(self, validated_data):
        from django.utils.text import slugify
        tenant = Tenant.objects.create(
            name=validated_data['company_name'],
            slug=slugify(validated_data['company_name']),
            industry=validated_data.get('industry', ''),
        )
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            tenant=tenant,
            role=User.Role.OWNER,
        )
        return user


class TeamMemberSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    telegram_chat_id = serializers.CharField(required=False, default='')

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already exists')
        return value

    def create(self, validated_data):
        tenant = self.context['request'].user.tenant
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            tenant=tenant,
            role=User.Role.MANAGER,
            telegram_chat_id=validated_data.get('telegram_chat_id', ''),
        )
