from django.db import models


class BotConfig(models.Model):
    class Tone(models.TextChoices):
        FRIENDLY = 'friendly', 'Friendly'
        PROFESSIONAL = 'professional', 'Professional'
        EXPERT = 'expert', 'Expert'

    tenant = models.OneToOneField(
        'tenants.Tenant', on_delete=models.CASCADE, related_name='bot_config'
    )
    bot_name = models.CharField(max_length=100, blank=True)
    tone = models.CharField(max_length=50, choices=Tone.choices, default=Tone.FRIENDLY)
    goal = models.TextField(default='Collect name and phone number for a manager callback')
    greeting_template = models.TextField(blank=True)
    escalation_trigger = models.TextField(blank=True)
    forbidden_topics = models.TextField(blank=True)
    additional_instructions = models.TextField(blank=True)

    def __str__(self):
        return f'BotConfig for {self.tenant}'
