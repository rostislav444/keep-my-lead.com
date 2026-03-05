from django.db import models


class InstagramAccount(models.Model):
    tenant = models.ForeignKey(
        'tenants.Tenant', on_delete=models.CASCADE, related_name='instagram_accounts'
    )
    instagram_user_id = models.CharField(max_length=100, unique=True)
    username = models.CharField(max_length=100)
    access_token = models.TextField()
    token_expires_at = models.DateTimeField(null=True, blank=True)
    page_id = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    connected_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'@{self.username}'
