# 01 - Архитектура

## Стек

| Слой | Технология | Почему |
|---|---|---|
| Backend | Django 4.x, async views | ORM, миграции, admin, auth из коробки |
| Database | PostgreSQL (Docker) | Надёжность, JSON-поля для гибких данных |
| AI | Anthropic Claude API | Качество диалогов, работа с контекстом |
| Instagram | Meta Graph API | Webhooks, отправка/получение сообщений |
| Frontend | **Next.js + yarn + shadcn/ui + TailwindCSS** | Скорость разработки, SSR, App Router |
| Notifications | Telegram Bot API | Уведомления менеджерам о горячих лидах |
| Queue | Celery + Redis (Docker) | Фоновые задачи: синхронизация, AI-вызовы |
| Containers | **docker-compose** | Backend, PostgreSQL, Redis, Celery — всё в контейнерах |
| Deploy | Railway / Render | Простота, не нужен DevOps |
| Dev tunneling | ngrok | Тестирование webhook локально |

## Структура проекта

```
leadbot/
├── docker-compose.yml         # PostgreSQL, Redis, Django, Celery
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── manage.py
│   ├── leadbot/               # settings, urls, wsgi/asgi
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── asgi.py
│   │
│   └── apps/
│       ├── tenants/           # Tenant, User, роли
│       ├── accounts/          # InstagramAccount, OAuth tokens
│       ├── catalog/           # Category, Item (с текстовым context)
│       ├── bot/               # Bot engine, промпт-билдер, воронка
│       ├── dialogs/           # Dialog, Message
│       ├── leads/             # Lead, LeadContact
│       ├── webhooks/          # Instagram webhook handler
│       ├── mappers/           # API mappers для внешних CRM
│       └── notifications/     # Telegram уведомления
│
├── frontend/                  # Next.js app (yarn + shadcn/ui)
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── src/
│       └── app/               # Next.js App Router
│
├── docs/                      # Документация
├── PLAN.md
└── MANIFEST.md
```

## Docker Compose (backend)

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: leadbot
      POSTGRES_USER: leadbot
      POSTGRES_PASSWORD: leadbot
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis
    env_file:
      - .env

  celery:
    build: ./backend
    command: celery -A leadbot worker -l info
    volumes:
      - ./backend:/app
    depends_on:
      - db
      - redis
    env_file:
      - .env

volumes:
  postgres_data:
```

## Frontend (отдельно от Docker)

```bash
cd frontend
yarn dev    # http://localhost:3000
```

Frontend проксирует API-запросы на backend (localhost:8000) через next.config.js rewrites.

## Потоки данных

### Комментарий → Лид
```
1. Человек комментирует пост в Instagram
2. Meta отправляет webhook → POST /api/webhooks/instagram/
3. webhooks app определяет tenant по Instagram account
4. bot app загружает контекст (каталог, настройки бота)
5. bot app отправляет запрос к Claude API с контекстом + историей
6. Claude генерирует ответ
7. bot app отправляет ответ в DM через Meta API
8. Когда бот собрал имя + телефон → создаётся Lead
9. notifications app отправляет уведомление в Telegram менеджеру
```

### DM → Лид
```
1. Человек пишет в Direct Instagram
2. Meta отправляет webhook → POST /api/webhooks/instagram/
3-9. Аналогично (без шага отправки в DM — уже в DM)
```

### Синхронизация из CRM
```
1. Celery задача по расписанию (или webhook от CRM)
2. mappers app вызывает адаптер для конкретной CRM
3. Адаптер получает данные, конвертирует в текстовый context
4. catalog app обновляет Item (update_or_create по source_id)
```

## Мультитенантность

Одна БД, одна схема. Каждая таблица с данными содержит `tenant_id`.
Фильтрация на уровне Django queryset.

```python
# Каждый view фильтрует по tenant
items = Item.objects.filter(tenant=request.user.tenant)
```

Middleware определяет tenant по авторизованному пользователю.
