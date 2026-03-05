# 03 - Bot Engine

## Общая логика

Бот не просто отвечает на вопросы. Бот продаёт по воронке:

```
ЗАХВАТ → КВАЛИФИКАЦИЯ → ПРЕЗЕНТАЦИЯ → СБОР КОНТАКТА → ПЕРЕДАЧА ЛИДА
```

## Промпт-билдер

Системный промпт собирается динамически из данных tenant'а:

```python
def build_system_prompt(tenant, dialog):
    config = tenant.botconfig
    items = Item.objects.filter(tenant=tenant, is_active=True)

    prompt = f"""Ты — {config.bot_name}.
Тон общения: {config.tone}.
Твоя главная цель: {config.goal}.

КАТАЛОГ УСЛУГ/ПРОДУКТОВ:
"""
    for item in items:
        prompt += f"\n--- {item.name} ---\n{item.context}\n"

    if config.escalation_trigger:
        prompt += f"\nПЕРЕДАЧА МЕНЕДЖЕРУ: {config.escalation_trigger}\n"

    if config.forbidden_topics:
        prompt += f"\nЗАПРЕЩЁННЫЕ ТЕМЫ: {config.forbidden_topics}\n"

    if config.additional_instructions:
        prompt += f"\nДОПОЛНИТЕЛЬНО: {config.additional_instructions}\n"

    prompt += """
ПРАВИЛА ПОВЕДЕНИЯ:
1. Веди диалог по воронке: захват интереса → квалификация → презентация → сбор контакта
2. Не навязывай. Задавай вопросы, выясняй потребности
3. Работай с возражениями используя информацию из каталога
4. Когда человек проявил интерес — собери имя и номер телефона
5. Отвечай коротко, как в мессенджере. Не пиши простыни
6. Если не знаешь ответ — скажи что менеджер свяжется и уточнит
7. Никогда не выдумывай информацию о продукте/услуге
"""
    return prompt
```

## Вызов Claude API

```python
import anthropic

async def generate_response(tenant, dialog):
    system_prompt = build_system_prompt(tenant, dialog)

    # Собираем историю сообщений
    messages = []
    for msg in dialog.messages.order_by('created_at'):
        role = 'user' if msg.role == 'user' else 'assistant'
        messages.append({"role": role, "content": msg.text})

    client = anthropic.AsyncAnthropic()
    response = await client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        system=system_prompt,
        messages=messages,
    )

    return response.content[0].text
```

## Определение статуса диалога

Бот сам определяет когда лид "горячий". Для этого в промпт добавляем инструкцию
возвращать structured output:

```python
# В конец промпта добавляем:
"""
После каждого ответа добавь JSON-блок (пользователь его не увидит):
<!--BOT_META:{"has_name": bool, "has_phone": bool, "interest_level": "hot"|"warm"|"cold", "product_interest": "название продукта или null"}-->
"""
```

Backend парсит этот блок, обновляет Dialog.status и создаёт Lead когда собраны имя + телефон.

## Воронка по шагам

### Шаг 1: ЗАХВАТ (source = comment)
Человек комментирует пост → бот пишет в DM:
> "Привет! Вижу вас интересует [тема]. Расскажу подробнее?"

### Шаг 2: КВАЛИФИКАЦИЯ
Бот выясняет:
- Что именно интересует
- Есть ли опыт / пользовался ли раньше
- Когда планирует (срочность)

### Шаг 3: ПРЕЗЕНТАЦИЯ
- Рассказывает о продукте/услуге из каталога
- Работает с возражениями
- Подчёркивает ценности и результат

### Шаг 4: СБОР КОНТАКТА
> "Чтобы ответить на все ваши вопросы детально, наш специалист свяжется с вами. Как вас зовут и на какой номер удобно позвонить?"

### Шаг 5: ПЕРЕДАЧА
- Создаётся Lead (имя + телефон + интерес)
- Telegram уведомление менеджеру
- Dialog.status → 'lead'

## Ручной режим

Менеджер нажимает "Перехватить диалог" в дашборде:
- `dialog.is_bot_active = False`
- Бот перестаёт отвечать
- Менеджер пишет через дашборд, сообщения уходят через Meta API
