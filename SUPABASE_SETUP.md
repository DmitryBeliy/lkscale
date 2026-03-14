# Lkscale ERP - Supabase Setup Guide

Полное руководство по настройке и развертыванию Supabase для ERP системы Lkscale.

## 🎯 Быстрый старт

### 1. Клонирование и подготовка

```bash
git clone https://github.com/your-org/lkscale.git
cd lkscale
cp .env.example .env
```

### 2. Создание проекта Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект (New Project)
3. Запомните **Project URL** и **anon/public** ключ
4. Скопируйте их в `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Настройка базы данных

**Вариант 1: Через SQL Editor (рекомендуется)**

1. Откройте Supabase Dashboard → SQL Editor
2. Скопируйте содержимое [`supabase/schema.sql`](supabase/schema.sql)
3. Выполните SQL
4. Затем выполните [`supabase/seed.sql`](supabase/seed.sql)

**Вариант 2: Через скрипт**

```bash
npm install
cp .env.example .env
# Заполните .env своими данными Supabase
node scripts/setup-supabase.js
```

### 4. Создание тестовых пользователей

В Supabase Dashboard → Authentication → Users создайте пользователей:

| Email | Пароль | Роль |
|-------|--------|------|
| owner@technotorg.ru | Demo123! | owner |
| admin@technotorg.ru | Demo123! | admin |
| manager@technotorg.ru | Demo123! | manager |

### 5. Запуск приложения

```bash
npm install
npm start        # Expo development
npm run web      # Web версия
```

## 📁 Созданные файлы

### Структура директорий

```
lkscale/
├── supabase/
│   ├── schema.sql              # Полная схема БД (650+ строк)
│   ├── seed.sql                # Тестовые данные
│   ├── migrations/
│   │   └── .gitkeep
│   └── README.md               # Документация по Supabase
│
├── scripts/
│   └── setup-supabase.js       # Скрипт автоматической настройки
│
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI: линтинг, тесты, сборка
│       ├── vercel-preview.yml  # Preview деплой на Vercel
│       └── eas-build.yml       # Сборка мобильных приложений
│
├── docker-compose.yml          # Локальная разработка
├── .env.example                # Шаблон переменных окружения
├── GITHUB_ACTIONS.md           # CI/CD документация
└── SUPABASE_SETUP.md           # Этот файл
```

## 🗄️ Схема базы данных

### Таблицы

| Таблица | Описание | Строки в seed |
|---------|----------|---------------|
| `companies` | Компании | 1 |
| `profiles` | Пользователи | 5 |
| `categories` | Категории товаров | 6 |
| `products` | Товары | 16 |
| `product_variants` | Варианты товаров | 0 (примеры) |
| `customers` | Клиенты | 10 |
| `orders` | Заказы | 6 |
| `order_items` | Элементы заказов | 13 |
| `suppliers` | Поставщики | 5 |
| `purchase_orders` | Заказы поставщикам | 4 |
| `purchase_order_items` | Элементы заказов поставщикам | 8 |
| `inventory_transactions` | Движение товаров | 8 |
| `warehouses` | Склады | 2 |
| `warehouse_stock` | Остатки на складах | 16 |
| `staff` | Сотрудники | 5 |
| `shifts` | Смены | 0 (примеры) |
| `notifications` | Уведомления | 3 |
| `audit_logs` | Логи аудита | 0 |

### ENUM типы

```sql
order_status: pending, processing, completed, cancelled, refunded
payment_method: cash, card, transfer, online
payment_status: pending, paid, partial, failed, refunded
user_role: owner, admin, manager, cashier, viewer
inventory_transaction_type: sale, purchase, adjustment, return, transfer_in, transfer_out, write_off
subscription_tier: free, starter, business, enterprise
```

### Представления (Views)

- `low_stock_products` - Товары с низким остатком
- `daily_sales_summary` - Сводка продаж по дням
- `top_selling_products` - Топ продаваемых товаров
- `customer_lifetime_value` - CLV с сегментацией

## 🔐 Безопасность (RLS)

### Роли пользователей

| Роль | Права |
|------|-------|
| `owner` | Полный доступ ко всем данным |
| `admin` | Управление пользователями, настройки |
| `manager` | Товары, заказы, клиенты, поставщики |
| `cashier` | Создание заказов, работа с клиентами |
| `viewer` | Только просмотр отчетов |

### Политики RLS

Все таблицы защищены Row Level Security:

```sql
-- Пример: пользователи видят только данные своей компании
CREATE POLICY products_select_company ON products
  FOR SELECT USING (company_id = get_current_user_company());
```

## 🧪 Тестовые данные

### Демо-компания: ООО "ТехноТорг"

**Продукты:**
- iPhone 15 Pro Max - 139 990 ₽
- Samsung Galaxy S24 Ultra - 129 990 ₽
- MacBook Pro 16 M3 Max - 349 990 ₽
- AirPods Pro 2 - 29 990 ₽
- И еще 12 товаров...

**Заказы:**
- ORD-2024-000001 - Completed - 181 978 ₽
- ORD-2024-000002 - Completed - 501 478 ₽
- ORD-2024-000003 - Processing - 121 489 ₽
- ORD-2024-000004 - Pending - 208 989 ₽
- ORD-2024-000005 - Completed - 49 467 ₽
- ORD-2024-000006 - Cancelled - 49 489 ₽

**Клиенты:**
- VIP сегмент: Александр Смирнов, Наталья Морозова
- Новые клиенты: Анна Попова, Дмитрий Павлов

## 🐳 Локальная разработка

### Запуск через Docker Compose

```bash
# Запуск всех сервисов
docker-compose up -d

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f postgres
docker-compose logs -f auth

# Остановка
docker-compose down

# Полный сброс (удаление данных)
docker-compose down -v
```

### Доступ к сервисам

| Сервис | URL | Логин/Пароль |
|--------|-----|--------------|
| PostgreSQL | localhost:5432 | postgres/postgres |
| PostgREST API | localhost:3000 | - |
| Auth (GoTrue) | localhost:9999 | - |
| Realtime | localhost:4000 | - |
| Storage | localhost:5000 | - |
| MinIO Console | localhost:9001 | minioadmin/minioadmin |
| pgAdmin | localhost:5050 | admin@lkscale.local/admin |
| MailHog | localhost:8025 | - |
| Redis | localhost:6379 | - |

### Настройка pgAdmin

1. Откройте http://localhost:5050
2. Войдите с данными из таблицы выше
3. Add New Server:
   - Name: Lkscale Local
   - Host: postgres
   - Port: 5432
   - Database: postgres
   - Username: postgres
   - Password: postgres

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow

```
Pull Request
    │
    ├──► ci.yml (Lint, Type Check, Tests, Build)
    │
    └──► vercel-preview.yml (Preview Deployment)
              │
              └──► Комментарий в PR со ссылкой

Merge to main
    │
    ├──► vercel-production.yml (Production Deploy)
    │
    ├──► eas-build.yml (Android & iOS Builds)
    │       │
    │       └──► publish-update (OTA Update)
    │
    └──► supabase-deploy.yml (Database Migrations)
```

### Необходимые секреты

Добавьте в GitHub Settings → Secrets:

```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_PROJECT_REF
SUPABASE_ACCESS_TOKEN
EXPO_TOKEN
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

## 📊 Полезные SQL запросы

### Статистика компании

```sql
-- Продажи за текущий месяц
SELECT 
  COUNT(*) as orders_count,
  SUM(total_amount) as total_sales,
  AVG(total_amount) as avg_order
FROM orders
WHERE status = 'completed'
  AND created_at >= DATE_TRUNC('month', NOW());

-- Товары с низким запасом
SELECT * FROM low_stock_products
WHERE company_id = 'your-company-id';

-- Топ клиентов
SELECT * FROM customer_lifetime_value
WHERE company_id = 'your-company-id'
ORDER BY total_spent DESC
LIMIT 10;
```

### Управление заказами

```sql
-- Заказы по статусам
SELECT status, COUNT(*), SUM(total_amount)
FROM orders
WHERE company_id = 'your-company-id'
GROUP BY status;

-- Товары в заказе
SELECT oi.*, p.stock
FROM order_items oi
JOIN products p ON p.id = oi.product_id
WHERE oi.order_id = 'order-uuid';
```

## 🔧 Триггеры и автоматизация

### Автоматические обновления

- `generate_order_number()` - Генерация номера заказа при создании
- `set_order_completed_at()` - Установка даты завершения
- `update_customer_stats()` - Обновление статистики клиента
- `update_product_stock()` - Обновление остатков товара

### Примеры работы

```sql
-- При создании заказа:
INSERT INTO orders (company_id, customer_id, ...) VALUES (...);
-- → Номер заказа генерируется автоматически (ORD-YYYY-NNNNNN)

-- При завершении заказа:
UPDATE orders SET status = 'completed' WHERE id = '...';
-- → completed_at устанавливается автоматически
-- → Статистика клиента обновляется
-- → Инвентарь уменьшается через транзакцию
```

## 📱 Мобильная разработка

### Настройка EAS

```bash
# Логин
eas login

# Настройка проекта
eas build:configure

# Сборка development
eas build --profile development

# Сборка production
eas build --profile production

# OTA Update
eas update
```

### Environment Variables

```bash
# Для сборки через EAS
eas env:push

# Локально
export EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
export EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🐛 Отладка

### Проверка подключения

```javascript
// В консоли браузера
const { data, error } = await supabase.from('products').select('*').limit(5);
console.log(data, error);
```

### Логи Supabase

```bash
# Локально
docker-compose logs -f postgres
docker-compose logs -f rest

# В продакшене
# Supabase Dashboard → Logs
```

### Проверка RLS

```sql
-- Проверить политики
SELECT * FROM pg_policies WHERE tablename = 'orders';

-- Проверить текущего пользователя
SELECT auth.uid();
SELECT get_current_user_company();
```

## 📚 Дополнительная документация

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Expo Docs](https://docs.expo.dev)
- [Vercel Docs](https://vercel.com/docs)

## 🤝 Поддержка

При возникновении проблем:

1. Проверьте логи в Supabase Dashboard
2. Убедитесь что все переменные окружения установлены
3. Проверьте RLS политики
4. Создайте issue в репозитории

---

**Lkscale ERP** © 2024 | Powered by Supabase, Expo, and Vercel
