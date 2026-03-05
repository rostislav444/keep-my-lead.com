import re
import logging
import httpx
from django.utils import timezone
from apps.catalog.models import Item

logger = logging.getLogger(__name__)


def sync(config):
    """Sync catalog items from external API using config."""
    raw_items = fetch(config)
    logger.info('Fetched %d items from %s', len(raw_items), config.name)

    synced_ids = []
    for raw in raw_items:
        item_id = str(_resolve_path(raw, config.field_id))
        item_name = str(_resolve_path(raw, config.field_name))
        context = _render_template(config.context_template, raw)

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
        synced_ids.append(item_id)

    # Deactivate items that are no longer in the API
    Item.objects.filter(
        tenant=config.tenant,
        source_type=f'api_{config.id}',
    ).exclude(source_id__in=synced_ids).update(is_active=False)

    config.last_synced_at = timezone.now()
    config.save(update_fields=['last_synced_at'])
    logger.info('Sync complete for %s', config.name)


def fetch(config):
    """Fetch items from external API."""
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

    items = _resolve_path(data, config.items_path)
    if not isinstance(items, list):
        logger.error('items_path "%s" did not resolve to a list', config.items_path)
        return []
    return items


def _resolve_path(data, path):
    """Resolve dot-separated path: 'data.services' -> data['data']['services']"""
    for key in path.split('.'):
        if isinstance(data, dict):
            data = data.get(key, '')
        elif isinstance(data, list) and key.isdigit():
            data = data[int(key)]
        else:
            return ''
    return data


def _render_template(template, item):
    """Render {{ field.path }} placeholders with values from item."""
    def replacer(match):
        path = match.group(1).strip()
        value = _resolve_path(item, path)
        if value is None or value == '':
            return ''
        return str(value)
    return re.sub(r'\{\{\s*(.+?)\s*\}\}', replacer, template).strip()
