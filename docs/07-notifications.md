# 07 - Уведомления (Telegram)

## Зачем
Когда бот собрал горячий лид (имя + телефон), менеджер должен узнать об этом мгновенно.
Telegram — самый быстрый канал для этой аудитории.

## Как работает

### 1. Подключение Telegram
- При добавлении менеджера (или в профиле) — поле `telegram_chat_id`
- Менеджер пишет `/start` Telegram-боту LeadBot
- Бот возвращает chat_id, менеджер вводит его в дашборде
- (Или: бот генерирует уникальную ссылку для привязки)

### 2. Отправка уведомления

```python
import httpx

async def notify_lead(lead):
    managers = User.objects.filter(
        tenant=lead.tenant,
        role='manager',
        telegram_chat_id__isnull=False,
    )
    for manager in managers:
        text = (
            f"🔥 Новый горячий лид!\n\n"
            f"Имя: {lead.name}\n"
            f"Телефон: {lead.phone}\n"
            f"Интерес: {lead.interest}\n"
            f"Продукт: {lead.product.name if lead.product else '—'}\n\n"
            f"Диалог: https://leadbot.app/dialogs/{lead.dialog_id}"
        )
        await send_telegram(manager.telegram_chat_id, text)

async def send_telegram(chat_id, text):
    url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
    async with httpx.AsyncClient() as client:
        await client.post(url, json={
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "HTML",
        })
```

### 3. Когда отправляем
- Создан Lead с температурой `hot`
- Менеджер может настроить: уведомлять обо всех лидах или только горячих

## Будущее (не MVP)
- Кнопки в Telegram: "Позвонить", "Открыть диалог"
- Уведомление если лид не обработан за N минут
- Дайджест за день
