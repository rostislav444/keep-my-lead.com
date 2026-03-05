from django.db import models


class Lead(models.Model):
    class Temperature(models.TextChoices):
        HOT = 'hot', 'Hot'
        WARM = 'warm', 'Warm'
        COLD = 'cold', 'Cold'

    tenant = models.ForeignKey(
        'tenants.Tenant', on_delete=models.CASCADE, related_name='leads'
    )
    dialog = models.OneToOneField(
        'dialogs.Dialog', on_delete=models.CASCADE, related_name='lead'
    )
    name = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    interest = models.TextField(blank=True)
    product = models.ForeignKey(
        'catalog.Item', on_delete=models.SET_NULL, null=True, blank=True
    )
    temperature = models.CharField(
        max_length=10, choices=Temperature.choices, default=Temperature.WARM
    )
    manager_notified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.name or "Unknown"} - {self.phone or "no phone"}'
