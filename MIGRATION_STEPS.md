# Инструкция по миграции данных в Supabase

## Проект: onnncepenxxxfprqaodu

### Шаг 1: Выполнить SQL скрипт в Supabase Dashboard

1. Откройте https://app.supabase.com/project/onnncepenxxxfprqaodu
2. Перейдите в SQL Editor
3. Создайте New Query
4. Скопируйте содержимое файла `docs/base/migration_sql/RUN_MIGRATION.sql`
5. Нажмите Run

### Шаг 2: Проверить созданные таблицы

Выполните в SQL Editor:

```sql
-- Проверка таблиц
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'manufacturers', 'suppliers', 'products', 'locations', 
    'outlets', 'consignment_notes', 'consignment_note_products',
    'product_locations', 'write_offs', 'user_activity_logs', 
    'migration_status'
)
ORDER BY table_name;
```

### Шаг 3: Запустить миграцию данных

#### Вариант A: Через Node.js скрипт

```bash
cd scripts
npm install
node run-migration.js
```

#### Вариант B: Через UI приложения

1. Запустите приложение с обновленными env переменными
2. Войдите как администратор
3. Перейдите на экран "Миграция данных"
4. Нажмите "Начать миграцию"

### Шаг 4: Проверить данные

```sql
-- Проверка количества записей
SELECT 'products' as table_name, COUNT(*) as count FROM products
UNION ALL SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'purchase_orders', COUNT(*) FROM purchase_orders
UNION ALL SELECT 'stock_adjustments', COUNT(*) FROM stock_adjustments;
```

### Ожидаемые результаты

| Таблица | Ожидаемое количество |
|---------|---------------------|
| manufacturers | 64 |
| suppliers | 18 |
| products | 1,102 |
| orders | 5,173 |
| purchase_orders | 976 |
| stock_adjustments | 246 |

### Обновленные переменные окружения

Файл `.env` обновлен с правильными ключами:

```
EXPO_PUBLIC_SUPABASE_URL=https://onnncepenxxxfprqaodu.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
