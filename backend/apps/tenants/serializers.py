from django.contrib.auth import authenticate
from django.utils.text import slugify
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Tenant, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'telegram_chat_id']
        read_only_fields = ['id']


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs['username'].strip()
        if '@' in username:
            try:
                username = User.objects.get(email=username).username
            except User.DoesNotExist:
                pass
        user = authenticate(
            request=self.context.get('request'),
            username=username,
            password=attrs['password'],
        )
        if user is None:
            raise serializers.ValidationError('Invalid credentials')
        attrs['user'] = user
        return attrs

    def get_tokens(self):
        user = self.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }


class RegisterSerializer(serializers.Serializer):
    company_name = serializers.CharField(max_length=255)
    industry = serializers.CharField(max_length=100, required=False, default='')
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

    def get_tokens(self):
        user = self.instance
        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }


class TeamMemberSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'telegram_chat_id']
        read_only_fields = ['id']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already exists')
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data['tenant'] = self.context['request'].user.tenant
        validated_data['role'] = User.Role.MANAGER
        return User.objects.create_user(password=password, **validated_data)


class OnboardingSerializer(serializers.Serializer):
    token = serializers.CharField()
    company_name = serializers.CharField(max_length=255)
    email = serializers.EmailField(required=False, allow_blank=True, default='')
    password = serializers.CharField(required=False, allow_blank=True, default='')
    industry = serializers.CharField(required=False, allow_blank=True, default='')
