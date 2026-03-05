# 08 - План разработки

## Фаза 1: Скелет (Backend)
> Цель: Django проект в Docker с моделями, admin, базовый API

- [ ] docker-compose.yml (PostgreSQL, Redis, Django, Celery)
- [ ] Dockerfile для backend
- [ ] .env файл с переменными окружения
- [ ] `django-admin startproject leadbot` (внутри backend/)
- [ ] Создать apps: tenants, accounts, catalog, bot, dialogs, leads, webhooks, mappers, notifications
- [ ] Модели по схеме из 02-models.md
- [ ] Миграции + PostgreSQL
- [ ] Django Admin для всех моделей (для отладки)
- [ ] DRF (Django REST Framework) setup
- [ ] Auth: регистрация tenant + login/logout
- [ ] CRUD API для каталога (Category, Item)
- [ ] API для BotConfig
- [ ] API для диалогов (list, detail, handoff, return-to-bot)
- [ ] API для лидов (list, export CSV)

## Фаза 2: Instagram интеграция
> Цель: получать сообщения из Instagram и отвечать

- [ ] Meta App setup (Facebook Developer Console)
- [ ] OAuth flow: подключение Instagram аккаунта
- [ ] Webhook verification endpoint
- [ ] Webhook handler: приём DM
- [ ] Webhook handler: приём комментариев
- [ ] Отправка DM через Meta API
- [ ] Тестирование через ngrok

## Фаза 3: Bot Engine
> Цель: бот отвечает в диалогах, собирает лиды

- [ ] Промпт-билдер (system prompt из BotConfig + каталога)
- [ ] Интеграция Claude API (async)
- [ ] Обработка входящего сообщения → генерация ответа → отправка
- [ ] Парсинг BOT_META из ответа (has_name, has_phone, interest)
- [ ] Автоматическое создание Lead
- [ ] Обновление статуса Dialog по воронке
- [ ] Логика "менеджер перехватил" — бот замолкает

## Фаза 4: Telegram уведомления
> Цель: менеджер получает уведомление о горячем лиде

- [ ] Telegram бот setup (BotFather)
- [ ] Привязка telegram_chat_id к менеджеру
- [ ] Отправка уведомления при создании Lead
- [ ] Форматирование сообщения (имя, телефон, интерес, ссылка)

## Фаза 5: Frontend MVP
> Цель: рабочий дашборд для менеджера и владельца

- [ ] Next.js проект setup (yarn create next-app + shadcn/ui init)
- [ ] Layout: sidebar, header
- [ ] Auth: login, register
- [ ] Onboarding wizard (connect Instagram, add product, setup bot)
- [ ] Dashboard (метрики, горячие лиды)
- [ ] Диалоги: список + чат-интерфейс
- [ ] Перехват диалога менеджером + отправка сообщений
- [ ] Лиды: таблица + экспорт CSV
- [ ] Каталог: CRUD продуктов с textarea context
- [ ] Настройки бота
- [ ] Управление Instagram аккаунтами
- [ ] Управление командой (менеджеры)

## Фаза 6: API Mapper
> Цель: синхронизация каталога из внешних CRM

- [ ] BaseMapper интерфейс
- [ ] MoamiMapper (первый адаптер)
- [ ] TenantCRMConfig модель
- [ ] Celery задача синхронизации по расписанию
- [ ] UI: страница интеграций в дашборде
- [ ] Кнопка "Синхронизировать сейчас"

## Фаза 7: Polish & Deploy
> Цель: продакшн

- [ ] Rate limiting (Meta API, Claude API)
- [ ] Token refresh для Instagram (Celery задача)
- [ ] Error handling и retry логика
- [ ] Логирование
- [ ] Deploy на Railway / Render
- [ ] Домен + SSL
- [ ] Тестирование на реальном Instagram аккаунте

---

## Порядок работы

```
Фаза 1 (скелет)
    ↓
Фаза 2 (Instagram) + Фаза 3 (Bot Engine) — параллельно
    ↓
Фаза 4 (Telegram) — быстро, 1 день
    ↓
Фаза 5 (Frontend) — основная работа
    ↓
Фаза 6 (Mapper) — когда MVP работает
    ↓
Фаза 7 (Deploy)
```

Фазы 2 и 3 можно делать параллельно: Instagram webhook можно тестировать с заглушкой бота, а бота — с фейковыми сообщениями.
