from django.contrib.auth.models import AbstractUser
from django.db import models


class Tenant(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    industry = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class User(AbstractUser):
    class Role(models.TextChoices):
        OWNER = 'owner', 'Owner'
        MANAGER = 'manager', 'Manager'

    tenant = models.ForeignKey(
        Tenant, on_delete=models.CASCADE, related_name='users', null=True
    )
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.OWNER)
    telegram_chat_id = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return f'{self.username} ({self.tenant})'
