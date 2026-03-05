# 06 - Frontend

## Стек
- **Next.js** (App Router)
- **yarn** (package manager)
- **shadcn/ui** (UI-kit)
- **TailwindCSS**
- **React Query** (tanstack) для API-запросов
- Запускается отдельно от Docker: `cd frontend && yarn dev`
- API проксируется через next.config.js rewrites на backend (localhost:8000)

## Роли

| Роль | Доступ |
|---|---|
| Owner | Всё: настройки, каталог, бот, менеджеры, биллинг |
| Manager | Диалоги, лиды, перехват диалога |

## Страницы

### 1. Auth
- `/login` — вход
- `/register` — регистрация tenant (название, сфера, email, пароль)

### 2. Onboarding (после регистрации)
- `/onboarding/connect-instagram` — OAuth подключение Instagram
- `/onboarding/add-product` — добавить первый продукт/услугу
- `/onboarding/setup-bot` — настроить бота (имя, тон)
- Визард: 3 шага, можно пропустить и вернуться

### 3. Dashboard (главная)
- `/dashboard` — обзор:
  - Количество диалогов сегодня / за неделю
  - Горячие лиды (требуют внимания)
  - Последние диалоги
  - Конверсия: диалоги → лиды (простая метрика)

### 4. Диалоги
- `/dialogs` — список диалогов с фильтрами:
  - По статусу: новый, активный, квалифицирован, лид, закрыт
  - По источнику: comment / dm
  - Поиск по имени / username
- `/dialogs/:id` — чат-интерфейс:
  - История сообщений (бот / user / менеджер — разные цвета)
  - Кнопка "Перехватить диалог"
  - Поле ввода сообщения (когда менеджер перехватил)
  - Кнопка "Вернуть боту"
  - Карточка лида справа (если собраны данные)

### 5. Лиды
- `/leads` — таблица лидов:
  - Имя, телефон, интерес, продукт, температура (hot/warm/cold)
  - Фильтр по температуре
  - Кнопка "Позвонить" (tel: ссылка)
  - Кнопка "Открыть диалог"
  - Экспорт CSV

### 6. Каталог
- `/catalog` — список категорий и продуктов
- `/catalog/new` — создать продукт:
  - Название
  - Категория
  - Context (textarea, основное поле)
  - Подсказка: "Опишите услугу, цены, тарифы, FAQ, возражения — всё что нужно боту"
- `/catalog/:id/edit` — редактировать
- Индикатор синхронизации (если подключена CRM)

### 7. Настройки бота
- `/settings/bot` — BotConfig:
  - Имя бота
  - Тон (select: дружелюбный / профессиональный / экспертный)
  - Цель диалога
  - Шаблон приветствия
  - Триггер эскалации
  - Запрещённые темы
  - Доп. инструкции
- Превью: "Так бот представится клиенту"

### 8. Instagram аккаунты
- `/settings/accounts` — список подключённых аккаунтов
  - Статус: активен / токен истекает / ошибка
  - Кнопка "Подключить ещё аккаунт"
  - Кнопка "Отключить"

### 9. Команда (owner only)
- `/settings/team` — менеджеры:
  - Список менеджеров
  - Добавить менеджера (email + telegram)
  - Удалить

### 10. CRM интеграция
- `/settings/integrations` — подключение внешних CRM:
  - Выбор CRM (Moami, ...)
  - API ключ
  - Кнопка "Синхронизировать"
  - Последняя синхронизация, статус

## Компоненты (переиспользуемые)

```
components/
├── Layout/
│   ├── Sidebar           # навигация
│   ├── Header            # tenant name, user menu
│   └── PageContainer     # обёртка страницы
├── Chat/
│   ├── ChatWindow        # список сообщений
│   ├── ChatBubble        # одно сообщение (bot/user/manager стили)
│   └── ChatInput         # поле ввода + отправка
├── Leads/
│   ├── LeadCard          # карточка лида (sidebar в чате)
│   └── LeadTable         # таблица лидов
├── Catalog/
│   ├── ItemForm          # форма создания/редактирования
│   └── ItemCard          # карточка продукта в списке
└── Common/
    ├── StatusBadge       # статус диалога / лида
    ├── TemperatureBadge  # hot/warm/cold
    └── EmptyState        # пустые списки
```

## API Endpoints (для фронтенда)

```
Auth:
POST   /api/auth/register/
POST   /api/auth/login/
POST   /api/auth/logout/

Catalog:
GET    /api/catalog/categories/
POST   /api/catalog/categories/
GET    /api/catalog/items/
POST   /api/catalog/items/
PUT    /api/catalog/items/:id/
DELETE /api/catalog/items/:id/

Dialogs:
GET    /api/dialogs/                    # list с фильтрами
GET    /api/dialogs/:id/               # detail + messages
POST   /api/dialogs/:id/handoff/       # менеджер перехватывает
POST   /api/dialogs/:id/return-to-bot/ # вернуть боту
POST   /api/dialogs/:id/send/          # менеджер отправляет сообщение

Leads:
GET    /api/leads/
GET    /api/leads/export/csv/

Settings:
GET    /api/settings/bot/
PUT    /api/settings/bot/
GET    /api/settings/accounts/
POST   /api/settings/accounts/connect/  # OAuth начало
GET    /api/settings/accounts/callback/ # OAuth callback
DELETE /api/settings/accounts/:id/
GET    /api/settings/team/
POST   /api/settings/team/
DELETE /api/settings/team/:id/

Integrations:
GET    /api/integrations/
POST   /api/integrations/
POST   /api/integrations/:id/sync/
DELETE /api/integrations/:id/
```
