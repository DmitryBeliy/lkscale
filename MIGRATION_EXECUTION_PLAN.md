# План выполнения миграции данных

## Шаг 1: Выполнить SQL скрипты в Supabase SQL Editor

Откройте Supabase Dashboard -> SQL Editor и выполните следующие файлы по порядку:

### 1.1 Базовая схема
Файл: `docs/base/migration_sql/schema.sql`

### 1.2 Новые таблицы для данных из старой системы
Файл: `docs/base/migration_sql/RUN_MIGRATION.sql`

Или по частям:
1. `docs/base/migration_sql/07_new_tables.sql`

## Шаг 2: Настроить переменные окружения для Vercel

В Vercel Dashboard добавьте следующие Environment Variables:

```
EXPO_PUBLIC_SUPABASE_URL=https://csjvvyjpqpchkpaqoufr.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzanZ2eWpwcXBjaGtwYXFvdWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjY0MzEsImV4cCI6MjA4NTkwMjQzMX0.lUJQgAbFt3y5GJktgd-bIhhg61NVjPQv8ikcMHB4dl0
```

## Шаг 3: Получить Service Role Key

1. Перейдите в Supabase Dashboard -> Project Settings -> API
2. Скопируйте "service_role key" (только для серверных операций!)
3. Сохраните его в `scripts/.env`:

```bash
cd scripts
echo "SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here" > .env
```

## Шаг 4: Выполнить миграцию данных

### Вариант A: Через Node.js скрипт

```bash
cd scripts
npm install
node run-migration.js
```

### Вариант B: Через UI в приложении

1. Запустите приложение
2. Войдите как администратор
3. Перейдите на экран "Миграция данных"
4. Нажмите "Начать миграцию"

### Вариант C: Через SQL напрямую

Загрузите JSON файлы через SQL Editor используя `supabase-js` в браузере.

## Шаг 5: Проверка данных

Выполните SQL запросы для проверки:

```sql
-- Проверка количества записей
SELECT 'products' as table_name, COUNT(*) as count FROM products
UNION ALL SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'purchase_orders', COUNT(*) FROM purchase_orders;
```

## Ожидаемые результаты

| Таблица | Ожидаемое количество |
|---------|---------------------|
| manufacturers | 64 |
| suppliers | 18 |
| products | 1,102 |
| orders | 5,173 |
| purchase_orders | 976 |
| stock_adjustments | 246 |
