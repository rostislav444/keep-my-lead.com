from django.db import models


class Dialog(models.Model):
    class Status(models.TextChoices):
        NEW = 'new', 'New'
        ACTIVE = 'active', 'Active'
        QUALIFIED = 'qualified', 'Qualified'
        LEAD = 'lead', 'Lead'
        HANDED_OFF = 'handed_off', 'Handed Off'
        CLOSED = 'closed', 'Closed'

    class Source(models.TextChoices):
        COMMENT = 'comment', 'Comment'
        DM = 'dm', 'Direct Message'

    tenant = models.ForeignKey(
        'tenants.Tenant', on_delete=models.CASCADE, related_name='dialogs'
    )
    instagram_account = models.ForeignKey(
        'accounts.InstagramAccount', on_delete=models.CASCADE, related_name='dialogs'
    )
    instagram_user_id = models.CharField(max_length=100)
    instagram_username = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    is_bot_active = models.BooleanField(default=True)
    source = models.CharField(max_length=20, choices=Source.choices)
    source_post_id = models.CharField(max_length=100, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Dialog with {self.instagram_username or self.instagram_user_id}'


class Message(models.Model):
    class Role(models.TextChoices):
        USER = 'user', 'User'
        BOT = 'bot', 'Bot'
        MANAGER = 'manager', 'Manager'

    dialog = models.ForeignKey(Dialog, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=Role.choices)
    text = models.TextField()
    instagram_message_id = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'[{self.role}] {self.text[:50]}'
