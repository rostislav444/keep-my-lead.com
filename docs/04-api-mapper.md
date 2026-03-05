# 04 - API Mapper (универсальный, конфиг-driven)

## Концепция

Один универсальный маппер. Никаких классов на каждую CRM.
Вся логика определяется **конфигом**: URL, заголовки, путь к данным, маппинг полей в текст.

Новая CRM = новая строка конфига в БД. Ноль кода.

## Модель конфига

```python
class TenantCRMConfig(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)                # "Procedure CRM", "My API"

    # Подключение
    api_url = models.URLField()                            # https://procedure.app/api/services
    auth_type = models.CharField(max_length=20, choices=[  # как авторизоваться
        ('bearer', 'Bearer Token'),
        ('header', 'Custom Header'),
        ('query', 'Query Parameter'),
    ], default='bearer')
    auth_key = models.CharField(max_length=100, default='Authorization')  # имя заголовка/параметра
    auth_value = models.TextField()                        # токен / ключ

    # Парсинг ответа
    items_path = models.CharField(max_length=200, default='results')
    # JSONPath до массива items в ответе API
    # "results" -> response["results"]
    # "data.services" -> response["data"]["services"]

    # Маппинг полей
    field_id = models.CharField(max_length=100, default='id')
    field_name = models.CharField(max_length=100, default='name')
    context_template = models.TextField()
    # Jinja-like шаблон, который собирает текстовый context из полей:
    #
    # {{ name }}
    #
    # Описание: {{ description }}
    # Цена: {{ price }} грн
    # Длительность: {{ duration }} мин
    #
    # Протокол:
    # {{ protocol }}
    #
    # Противопоказания: {{ contraindications }}

    # Синхронизация
    sync_interval_minutes = models.IntegerField(default=60)
    last_synced_at = models.DateTimeField(null=True)
    is_active = models.BooleanField(default=True)
```

## Универсальный маппер (один на всех)

```python
# apps/mappers/engine.py
import httpx
from string import Template
from django.utils import timezone
from apps.catalog.models import Item


def sync(config):
    """Синхронизировать каталог по конфигу."""
    raw_items = fetch(config)
    for raw in raw_items:
        item_id = str(resolve_path(raw, config.field_id))
        item_name = str(resolve_path(raw, config.field_name))
        context = render_template(config.context_template, raw)

        Item.objects.update_or_create(
            tenant=config.tenant,
            source_type=f'api_{config.id}',
            source_id=item_id,
            defaults={
                'name': item_name,
                'context': context,
                'synced_at': timezone.now(),
                'is_active': True,
            }
        )

    config.last_synced_at = timezone.now()
    config.save(update_fields=['last_synced_at'])


def fetch(config):
    """Получить данные из внешнего API."""
    headers = {}
    params = {}

    if config.auth_type == 'bearer':
        headers['Authorization'] = f'Bearer {config.auth_value}'
    elif config.auth_type == 'header':
        headers[config.auth_key] = config.auth_value
    elif config.auth_type == 'query':
        params[config.auth_key] = config.auth_value

    response = httpx.get(config.api_url, headers=headers, params=params, timeout=30)
    response.raise_for_status()
    data = response.json()

    return resolve_path(data, config.items_path)


def resolve_path(data, path):
    """Получить значение по пути: 'data.services' -> data['data']['services']"""
    for key in path.split('.'):
        if isinstance(data, dict):
            data = data.get(key, '')
        elif isinstance(data, list) and key.isdigit():
            data = data[int(key)]
        else:
            return ''
    return data


def render_template(template, item):
    """Простой рендер: {{ field }} -> значение поля."""
    import re
    def replacer(match):
        path = match.group(1).strip()
        value = resolve_path(item, path)
        if value is None or value == '':
            return ''
        return str(value)
    return re.sub(r'\{\{\s*(.+?)\s*\}\}', replacer, template).strip()
```

## Пример: подключение Procedure CRM

В дашборде владелец заполняет форму:

| Поле | Значение |
|---|---|
| Name | Procedure CRM |
| API URL | `https://procedure.app/api/v1/services/` |
| Auth type | Bearer Token |
| Auth value | `sk-xxxx` |
| Items path | `results` |
| Field ID | `id` |
| Field name | `name` |
| Context template | (см. ниже) |

```
{{ name }}

Описание: {{ description }}
Цена: {{ price }} грн
Длительность: {{ duration }} мин

Протокол процедуры:
{{ protocol }}

Противопоказания: {{ contraindications }}
Уход после: {{ aftercare }}
```

Любая другая CRM — тот же процесс, другие поля в шаблоне. Ноль кода.

## Синхронизация

```python
# Celery задача
@shared_task
def sync_catalog(config_id):
    config = TenantCRMConfig.objects.get(id=config_id)
    engine.sync(config)
```

## Ручной ввод

Если CRM нет — владелец заполняет Item.context вручную в дашборде.
