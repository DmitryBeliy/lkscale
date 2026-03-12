# Инструкция по миграции базы данных Supabase

## Проект
- **Project URL**: https://app.supabase.com/project/onnncepenxxxfprqaodu
- **Project ID**: `onnncepenxxxfprqaodu`

## Порядок выполнения миграции

### Шаг 1: Вход в Supabase Dashboard
1. Откройте https://app.supabase.com/project/onnncepenxxxfprqaodu
2. Войдите в свой аккаунт Supabase

### Шаг 2: Открытие SQL Editor
1. В боковом меню выберите **"SQL Editor"**
2. Нажмите **"New query"** (или откройте существующий)
3. Скопируйте содержимое SQL файлов из проекта

### Шаг 3: Выполнение миграции

#### 3.1 Очистка таблиц (если нужно перезагрузить данные)
**Файл**: [`supabase/migrations/00_truncate.sql`](supabase/migrations/00_truncate.sql)

⚠️ **ВНИМАНИЕ**: Это удалит ВСЕ существующие данные!

```sql
-- Очистка таблиц перед миграцией
TRUNCATE TABLE inventory_transactions CASCADE;
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE suppliers CASCADE;
TRUNCATE TABLE manufacturers CASCADE;
TRUNCATE TABLE categories CASCADE;
```

#### 3.2 Создание таблиц
**Файл**: [`supabase/migrations/00_setup.sql`](supabase/migrations/00_setup.sql)

Этот файл создаёт все необходимые таблицы:
- `categories` - категории товаров
- `manufacturers` - производители
- `suppliers` - поставщики
- `products` - товары
- `orders` - заказы
- `order_items` - позиции заказов
- `inventory_transactions` - операции со складом

Также настраивает RLS политики для безопасности.

#### 3.3 Загрузка данных
**Файлы**: [`supabase/migrations/chunks/part_001.sql`](supabase/migrations/chunks/part_001.sql) - [`part_009.sql`](supabase/migrations/chunks/part_009.sql)

| Файл | Размер | Статус |
|------|--------|--------|
| part_001.sql | 349 KB | ✅ OK |
| part_002.sql | 287 KB | ✅ OK |
| part_003.sql | 409 KB | ⚠️ Разделить |
| part_004.sql | 409 KB | ⚠️ Разделить |
| part_005.sql | 410 KB | ⚠️ Разделить |
| part_006.sql | 362 KB | ✅ OK |
| part_007.sql | 362 KB | ✅ OK |
| part_008.sql | 388 KB | ✅ OK |
| part_009.sql | 293 KB | ✅ OK |

⚠️ **Важно**: Supabase SQL Editor имеет ограничение ~400KB на запрос. Файлы part_003, part_004, part_005 нужно разбить на части.

### Шаг 4: Проверка результата

После выполнения всех миграций, выполните SQL запрос для проверки:

```sql
-- Проверка количества записей в таблицах
SELECT 
    'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'manufacturers', COUNT(*) FROM manufacturers
UNION ALL
SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'inventory_transactions', COUNT(*) FROM inventory_transactions;
```

**Ожидаемые результаты**:
- categories: 13 записей
- manufacturers: ~64 записи
- suppliers: ~18 записей
- products: ~500+ записей
- orders: ~1000+ записей
- order_items: ~5000+ записей
- inventory_transactions: ~2000+ записей

## Альтернативный способ: Выполнение через Node.js скрипт

### Предварительные требования
1. Установлен Node.js
2. Service Role Key из Supabase Dashboard

### Получение Service Role Key
1. Откройте Supabase Dashboard
2. Project Settings → API
3. Скопируйте `service_role` ключ (не публикуйте его!)

### Запуск скрипта
```bash
cd h:\dev_lk\lkscale
node scripts/apply-migration.js
```

Скрипт запросит Service Role Key и выполнит миграцию автоматически.

## Структура таблиц

### categories
- Категории товаров (13 записей)
- Поля: id, name, description, color, icon, sort_order, is_active

### manufacturers
- Производители оборудования (~64 записи)
- Поля: id, name, description, website, logo_url, is_active

### suppliers
- Поставщики (~18 записей)
- Поля: id, name, type, contact_name, email, phone, address, website, notes

### products
- Товары (~500+ записей)
- Поля: id, user_id, name, sku, barcode, description, price, stock, category_id, supplier_id, manufacturer_id

### orders
- Заказы (~1000+ записей)
- Поля: id, user_id, order_number, customer_name, total, status, payment_status

### order_items
- Позиции заказов (~5000+ записей)
- Поля: id, order_id, product_id, quantity, price, total

### inventory_transactions
- Операции со складом (~2000+ записей)
- Поля: id, product_id, supplier_id, type, quantity, unit_cost, total_cost

## Устранение неполадок

### Ошибка "Query size limit exceeded"
- Разделите большой SQL файл на части (< 400KB каждая)
- Выполняйте частями с паузами между запросами

### Ошибка "Foreign key constraint violation"
- Убедитесь, что сначала выполнили [`00_setup.sql`](supabase/migrations/00_setup.sql)
- Проверьте порядок загрузки: categories → suppliers/manufacturers → products → orders → order_items → inventory_transactions

### Ошибка "Permission denied"
- Используйте Service Role Key вместо anon key
- Проверьте права доступа в Supabase Dashboard

## Поддержка

При возникновении проблем:
1. Проверьте логи в Supabase Dashboard → Logs
2. Проверьте консоль браузера (F12)
3. Обратитесь к документации Supabase: https://supabase.com/docs
