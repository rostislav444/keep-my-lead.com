# 02 - Модели базы данных

## Tenant & Users

```python
class Tenant(models.Model):
    name = models.CharField(max_length=255)           # "Beauty School Kyiv"
    slug = models.SlugField(unique=True)               # "beauty-school-kyiv"
    industry = models.CharField(max_length=100)        # "cosmetology", "fitness", "education"
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

class User(AbstractUser):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    role = models.CharField(choices=[
        ('owner', 'Owner'),
        ('manager', 'Manager'),
    ], max_length=20)
    telegram_chat_id = models.CharField(max_length=50, blank=True)  # для уведомлений
```

## Instagram Accounts

```python
class InstagramAccount(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    instagram_user_id = models.CharField(max_length=100, unique=True)
    username = models.CharField(max_length=100)
    access_token = models.TextField()                  # encrypted
    token_expires_at = models.DateTimeField(null=True)
    page_id = models.CharField(max_length=100)         # Facebook Page ID
    is_active = models.BooleanField(default=True)
    connected_at = models.DateTimeField(auto_now_add=True)
```

## Catalog (контекст для бота)

```python
class Category(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)            # "Перманентный макияж"
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

class Item(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=255)            # "ПМ губ"
    context = models.TextField()                       # ВСЁ описание в свободном формате
                                                       # цены, тарифы, FAQ, возражения
    is_active = models.BooleanField(default=True)

    # Для синхронизации из внешних CRM
    source_type = models.CharField(max_length=50, blank=True)  # "moami", "other_crm"
    source_id = models.CharField(max_length=100, blank=True)   # ID во внешней системе
    synced_at = models.DateTimeField(null=True)

    class Meta:
        unique_together = ['tenant', 'source_type', 'source_id']
```

## Bot Configuration

```python
class BotConfig(models.Model):
    tenant = models.OneToOneField(Tenant, on_delete=models.CASCADE)
    bot_name = models.CharField(max_length=100)            # "Алина, помощник Beauty Expert"
    tone = models.CharField(max_length=50, default='friendly')  # friendly / professional / expert
    goal = models.TextField(default='Получить имя и номер телефона для звонка менеджера')
    greeting_template = models.TextField(blank=True)       # шаблон первого сообщения
    escalation_trigger = models.TextField(blank=True)      # когда передавать менеджеру
    forbidden_topics = models.TextField(blank=True)        # что бот не обсуждает
    additional_instructions = models.TextField(blank=True) # доп. инструкции для промпта
```

## Dialogs & Messages

```python
class Dialog(models.Model):
    class Status(models.TextChoices):
        NEW = 'new'
        ACTIVE = 'active'
        QUALIFIED = 'qualified'
        LEAD = 'lead'
        HANDED_OFF = 'handed_off'     # менеджер перехватил
        CLOSED = 'closed'

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    instagram_account = models.ForeignKey(InstagramAccount, on_delete=models.CASCADE)
    instagram_user_id = models.CharField(max_length=100)   # ID собеседника
    instagram_username = models.CharField(max_length=100, blank=True)
    status = models.CharField(choices=Status.choices, default=Status.NEW, max_length=20)
    is_bot_active = models.BooleanField(default=True)      # False когда менеджер подключился
    source = models.CharField(max_length=20)               # "comment" | "dm"
    source_post_id = models.CharField(max_length=100, blank=True)  # ID поста (если из коммента)
    started_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Message(models.Model):
    dialog = models.ForeignKey(Dialog, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(choices=[
        ('user', 'User'),
        ('bot', 'Bot'),
        ('manager', 'Manager'),
    ], max_length=10)
    text = models.TextField()
    instagram_message_id = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

## Leads

```python
class Lead(models.Model):
    class Temperature(models.TextChoices):
        HOT = 'hot'
        WARM = 'warm'
        COLD = 'cold'

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    dialog = models.OneToOneField(Dialog, on_delete=models.CASCADE)
    name = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    interest = models.TextField(blank=True)                # в чём заинтересован
    product = models.ForeignKey(Item, on_delete=models.SET_NULL, null=True)
    temperature = models.CharField(choices=Temperature.choices, default=Temperature.WARM, max_length=10)
    manager_notified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
```

## ER-диаграмма (упрощённая)

```
Tenant ─┬─── User (owner, manager)
        ├─── InstagramAccount
        ├─── BotConfig (1:1)
        ├─── Category ──── Item (context, source_type, source_id)
        ├─── Dialog ─┬──── Message
        │            └──── Lead ──── Item (interest)
        └─── (mappers работают через Item.source_type/source_id)
```
