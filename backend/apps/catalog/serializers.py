from rest_framework import serializers
from .models import Category, Item


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'order']
        read_only_fields = ['id']


class ItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)

    class Meta:
        model = Item
        fields = [
            'id', 'category', 'category_name', 'name', 'short_description',
            'context', 'bot_instructions', 'is_active',
            'source_type', 'source_id', 'synced_at',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'source_type', 'source_id', 'synced_at', 'created_at', 'updated_at']
