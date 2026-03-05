# LeadBot - Master Plan
> Этот файл — точка входа. Читай его первым при начале новой сессии.

## Что это
Мультитенантная SaaS-платформа для автоматической обработки лидов из Instagram.
Бот отвечает на комментарии/DM, квалифицирует интерес, прогревает и собирает контакт (имя + телефон).
Менеджер получает уведомление и звонит горячему лиду.

## Целевая аудитория
- Косметологи, эксперты, онлайн-школы, фитнес-тренеры, юристы
- Основная аудитория: косметологи, которым пишут в директ
- Пользователи дашборда: менеджеры (основные), владельцы бизнеса (редко)

## Ключевые решения
- **Backend:** Django 4.x + async views, **запускается в Docker (docker-compose.yml)**
- **Frontend:** Next.js + yarn + shadcn/ui + TailwindCSS
- **Database:** PostgreSQL (контейнер в docker-compose), одна схема, tenant_id в каждой таблице
- **Cache/Queue:** Redis (контейнер в docker-compose) + Celery
- **AI:** Claude API (claude-sonnet)
- **Мультитенантность:** простой ForeignKey на Tenant, без django-tenants
- **Контекст для бота:** текстовое поле `context` в модели Item (не структурированные атрибуты)
- **API Mapper:** адаптеры для внешних CRM, каждый маппер конвертирует данные в текстовый context
- **Dev environment:** docker-compose up для всего backend (Django + PostgreSQL + Redis + Celery), фронт отдельно через yarn dev

## Структура документации
| Файл | Что описывает |
|---|---|
| [MANIFEST.md](MANIFEST.md) | Продуктовый манифест, бизнес-логика |
| [docs/01-architecture.md](docs/01-architecture.md) | Архитектура, стек, структура проекта |
| [docs/02-models.md](docs/02-models.md) | Модели базы данных |
| [docs/03-bot-engine.md](docs/03-bot-engine.md) | Логика бота, промпты, воронка продаж |
| [docs/04-api-mapper.md](docs/04-api-mapper.md) | Маппер внешних CRM, синхронизация |
| [docs/05-instagram-integration.md](docs/05-instagram-integration.md) | Webhook, Meta API, OAuth |
| [docs/06-frontend.md](docs/06-frontend.md) | Страницы, компоненты, роли |
| [docs/07-notifications.md](docs/07-notifications.md) | Telegram уведомления |
| [docs/08-dev-plan.md](docs/08-dev-plan.md) | Фазы разработки, порядок задач |

## Быстрый старт для AI-агента
1. Прочитай этот файл
2. Прочитай нужный docs/ файл по теме задачи
3. Работай
