from django.db import models


class TenantCRMConfig(models.Model):
    class AuthType(models.TextChoices):
        BEARER = 'bearer', 'Bearer Token'
        HEADER = 'header', 'Custom Header'
        QUERY = 'query', 'Query Parameter'

    tenant = models.ForeignKey(
        'tenants.Tenant', on_delete=models.CASCADE, related_name='crm_configs'
    )
    name = models.CharField(max_length=100)

    # Connection
    api_url = models.URLField()
    auth_type = models.CharField(max_length=20, choices=AuthType.choices, default=AuthType.BEARER)
    auth_key = models.CharField(max_length=100, default='Authorization')
    auth_value = models.TextField()

    # Response parsing
    items_path = models.CharField(max_length=200, default='results',
        help_text='Dot-separated path to items array in API response, e.g. "data.services"')

    # Field mapping
    field_id = models.CharField(max_length=100, default='id')
    field_name = models.CharField(max_length=100, default='name')
    context_template = models.TextField(
        help_text='Template with {{ field }} placeholders to build item context')

    # Sync
    sync_interval_minutes = models.IntegerField(default=60)
    last_synced_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.name} ({self.tenant})'
