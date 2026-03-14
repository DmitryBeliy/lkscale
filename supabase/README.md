# Lkscale Supabase Infrastructure

Эта директория содержит всю инфраструктуру для работы с Supabase - backend для ERP системы Lkscale.

## 📁 Структура

```
supabase/
├── schema.sql          # Полная схема базы данных
├── seed.sql            # Тестовые данные для разработки
├── migrations/         # Миграции базы данных
└── README.md           # Этот файл
```

## 🚀 Быстрый старт

### 1. Создание проекта в Supabase

1. Перейдите на [supabase.com](https://supabase.com) и создайте аккаунт
2. Создайте новый проект
3. Получите URL и API ключи:
   - Go to **Project Settings** → **API**
   - Скопируйте `Project URL` и `anon/public` ключ

### 2. Установка CLI (опционально)

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (через scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 3. Применение схемы

#### Вариант A: Через SQL Editor (рекомендуется)

1. Откройте **SQL Editor** в Supabase Dashboard
2. Скопируйте содержимое [`schema.sql`](schema.sql)
3. Выполните SQL

#### Вариант B: Через CLI

```bash
# Логин
supabase login

# Линк проекта
supabase link --project-ref your-project-ref

# Применение миграций
supabase db push
```

### 4. Загрузка тестовых данных

1. Откройте **SQL Editor**
2. Скопируйте содержимое [`seed.sql`](seed.sql)
3. Выполните SQL

Или через скрипт:

```bash
node scripts/setup-supabase.js
```

### 5. Настройка Environment Variables

Скопируйте переменные из Supabase Dashboard в `.env`:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📊 Схема базы данных

### Основные таблицы

| Таблица | Описание | Основные поля |
|---------|----------|---------------|
| `companies` | Компании/организации | name, slug, subscription_tier, settings |
| `profiles` | Профили пользователей | user_id, company_id, role, permissions |
| `categories` | Категории товаров | name, parent_id, color, icon |
| `products` | Товары | name, sku, price, cost_price, stock |
| `product_variants` | Варианты товаров | product_id, attributes, stock |
| `customers` | Клиенты | name, email, phone, segment |
| `orders` | Заказы | order_number, status, total_amount |
| `order_items` | Элементы заказа | order_id, product_id, quantity, price |
| `suppliers` | Поставщики | name, contact_info, payment_terms |
| `purchase_orders` | Заказы поставщикам | po_number, supplier_id, status |
| `inventory_transactions` | Движение товаров | type, quantity, stock_before, stock_after |
| `warehouses` | Склады | name, address, is_primary |
| `warehouse_stock` | Остатки на складах | warehouse_id, product_id, quantity |
| `staff` | Сотрудники | employee_id, position, salary |
| `shifts` | Смены/график работы | staff_id, date, start_time, end_time |
| `notifications` | Уведомления | user_id, type, title, message |
| `audit_logs` | Логи аудита | action, entity_type, old_data, new_data |

### Типы ENUM

- `order_status`: pending, processing, completed, cancelled, refunded
- `payment_method`: cash, card, transfer, online
- `payment_status`: pending, paid, partial, failed, refunded
- `user_role`: owner, admin, manager, cashier, viewer
- `inventory_transaction_type`: sale, purchase, adjustment, return, transfer_in, transfer_out, write_off
- `subscription_tier`: free, starter, business, enterprise

## 🔐 Row Level Security (RLS)

Все таблицы защищены политиками RLS:

- **companies**: Доступ только к своей компании
- **profiles**: Пользователи видят профили своей компании
- **products/customers/orders**: Данные изолированы по company_id
- **notifications**: Персональные уведомления пользователя

### Роли пользователей

| Роль | Права |
|------|-------|
| `owner` | Полный доступ |
| `admin` | Управление пользователями, настройки |
| `manager` | Товары, заказы, клиенты |
| `cashier` | Заказы, клиенты (только создание) |
| `viewer` | Только просмотр отчетов |

## 🔄 Триггеры и функции

### Автоматические обновления

- `update_updated_at_column()` - Обновляет updated_at при изменении
- `update_customer_stats()` - Обновляет статистику клиента после заказа
- `update_product_stock()` - Обновляет остаток товара после транзакции
- `generate_order_number()` - Генерирует номер заказа автоматически
- `set_order_completed_at()` - Устанавливает дату завершения заказа

### Представления (Views)

- `low_stock_products` - Товары с низким остатком
- `daily_sales_summary` - Сводка продаж по дням
- `top_selling_products` - Топ продаваемых товаров
- `customer_lifetime_value` - CLV клиентов с сегментацией

## 📦 Storage Buckets

- `product-images` - Изображения товаров (public)
- `company-logos` - Логотипы компаний (public)
- `user-avatars` - Аватары пользователей (public)
- `documents` - Документы (private)
- `exports` - Экспортируемые файлы (private)

## 🧪 Тестовые данные

После применения `seed.sql` будут созданы:

- 1 компания (ООО "ТехноТорг")
- 5 пользователей с разными ролями
- 6 категорий товаров
- 16 товаров (включая товар с низким запасом)
- 10 клиентов
- 6 заказов (разные статусы)
- 5 поставщиков
- 4 заказа поставщикам
- 2 склада
- 5 сотрудников
- Уведомления и транзакции

### Тестовые пользователи

| Email | Роль | Пароль (auth) |
|-------|------|---------------|
| owner@technotorg.ru | owner | (создается отдельно) |
| admin@technotorg.ru | admin | (создается отдельно) |
| manager@technotorg.ru | manager | (создается отдельно) |
| cashier@technotorg.ru | cashier | (создается отдельно) |
| viewer@technotorg.ru | viewer | (создается отдельно) |

## 🛠️ Разработка

### Локальная разработка с Docker

```bash
# Запуск локального Supabase
docker-compose up -d

# Остановка
docker-compose down
```

### Создание миграции

```bash
# Создать новую миграцию
supabase migration new add_new_feature

# Применить миграции
supabase db push

# Откат последней миграции
supabase db reset
```

### Резервное копирование

```bash
# Экспорт данных
supabase db dump -f backup.sql

# Импорт данных
psql $SUPABASE_DB_URL -f backup.sql
```

## 🔍 Полезные запросы

### Статистика компании

```sql
-- Продажи за текущий месяц
SELECT 
  COUNT(*) as orders_count,
  SUM(total_amount) as total_sales
FROM orders
WHERE company_id = 'your-company-id'
  AND status = 'completed'
  AND created_at >= DATE_TRUNC('month', NOW());

-- Топ 5 товаров
SELECT * FROM top_selling_products
WHERE company_id = 'your-company-id'
LIMIT 5;

-- Клиенты по сегментам
SELECT segment, COUNT(*) 
FROM customer_lifetime_value
WHERE company_id = 'your-company-id'
GROUP BY segment;
```

### Проверка RLS

```sql
-- Проверить политики
SELECT * FROM pg_policies WHERE tablename = 'orders';

-- Проверить RLS статус
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname IN ('orders', 'products', 'customers');
```

## 📚 Документация

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [PostgREST Docs](https://postgrest.org/)

## 🆘 Поддержка

При возникновении проблем:

1. Проверьте логи в Supabase Dashboard → Logs
2. Убедитесь что RLS политики настроены правильно
3. Проверьте подключение через API в разделе API Docs
4. Используйте `EXPLAIN ANALYZE` для оптимизации медленных запросов
