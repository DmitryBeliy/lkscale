# Ручная миграция базы данных Supabase

## Информация о проекте
- **Project ID**: `onnncepenxxxfprqaodu`
- **URL**: https://app.supabase.com/project/onnncepenxxxfprqaodu
- **SQL Editor**: https://app.supabase.com/project/onnncepenxxxfprqaodu/sql

## Файлы для миграции (в порядке выполнения)

Все файлы находятся в директории `supabase/migrations/ready/`:

| № | Файл | Размер | Назначение |
|---|------|--------|------------|
| 1 | `00_setup.sql` | 6.5 KB | Создание таблиц и структуры БД |
| 2 | `part_001.sql` | 341 KB | Categories, Suppliers, Manufacturers |
| 3 | `part_002.sql` | 281 KB | Products (часть 1) |
| 4 | `part_003_part001.sql` | 350 KB | Orders (часть 1) |
| 5 | `part_003_part002.sql` | 50 KB | Orders (часть 2) |
| 6 | `part_004_part001.sql` | 350 KB | Orders (часть 3) |
| 7 | `part_004_part002.sql` | 50 KB | Orders (часть 4) |
| 8 | `part_005_part001.sql` | 350 KB | Order Items (часть 1) |
| 9 | `part_005_part002.sql` | 51 KB | Order Items (часть 2) |
| 10 | `part_006_part001.sql` | 350 KB | Inventory Transactions (часть 1) |
| 11 | `part_006_part002.sql` | 4 KB | Inventory Transactions (часть 2) |

## Способ 1: Через SQL Editor (рекомендуется)

### Шаги выполнения:

1. **Открыть SQL Editor**
   - Перейдите по ссылке: https://app.supabase.com/project/onnncepenxxxfprqaodu/sql
   - Войдите в аккаунт Supabase

2. **Создать новый запрос**
   - Нажмите "New query" или "+"
   - Дайте название: `migration_setup`

3. **Выполнить файлы по порядку**

   Для каждого файла:
   - Откройте файл из `supabase/migrations/ready/`
   - Скопируйте содержимое
   - Вставьте в SQL Editor
   - Нажмите "Run" (или Ctrl+Enter)
   - Дождитесь завершения
   - Проверьте отсутствие ошибок

4. **Рекомендуемый порядок выполнения:**

   ```
   00_setup.sql → part_001.sql → part_002.sql → 
   part_003_part001.sql → part_003_part002.sql → 
   part_004_part001.sql → part_004_part002.sql → 
   part_005_part001.sql → part_005_part002.sql → 
   part_006_part001.sql → part_006_part002.sql
   ```

### Важные замечания:

⚠️ **Не пропускайте файлы** - каждый следующий зависит от предыдущего
⚠️ **Дождитесь завершения** каждого запроса перед запуском следующего
⚠️ **Большие файлы** (300+ KB) могут выполняться 30-60 секунд

## Способ 2: Автоматический (через скрипт)

### Требования:
- Node.js 18+
- SUPABASE_SERVICE_ROLE_KEY

### Шаги:

1. **Установите зависимости** (если еще не установлены):
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Установите Service Role Key**:
   ```bash
   # Windows PowerShell
   $env:SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"
   
   # или в .env файл
   echo "SUPABASE_SERVICE_ROLE_KEY=your_key_here" > .env
   ```

3. **Запустите миграцию**:
   ```bash
   node scripts/execute-ready-migrations.js
   ```

### Где взять Service Role Key:
1. Откройте Supabase Dashboard
2. Project Settings → API
3. Скопируйте `service_role` key (НЕ anon key!)

## Проверка результата

После выполнения всех миграций, выполните в SQL Editor:

```sql
-- Проверка количества записей
SELECT 'Products' as table_name, COUNT(*) as count FROM products
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Order Items', COUNT(*) FROM order_items
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Suppliers', COUNT(*) FROM suppliers
UNION ALL
SELECT 'Manufacturers', COUNT(*) FROM manufacturers
UNION ALL
SELECT 'Inventory Transactions', COUNT(*) FROM inventory_transactions;
```

### Ожидаемые результаты:
- **Products**: ~3000-4000 записей
- **Orders**: ~8000-10000 записей
- **Order Items**: ~15000-20000 записей
- **Categories**: ~10-20 записей
- **Suppliers**: ~50-100 записей
- **Manufacturers**: ~30-50 записей
- **Inventory Transactions**: ~8000-10000 записей

## Устранение неполадок

### Ошибка "Query exceeds maximum size"
**Решение**: Файл уже разбит на части (part_XXX_partYYY.sql), выполняйте их последовательно.

### Ошибка "Foreign key violation"
**Решение**: Пропущен предыдущий файл. Выполните файлы строго по порядку.

### Ошибка "Table already exists"
**Решение**: Таблицы уже созданы. Пропустите 00_setup.sql или выполните `00_truncate.sql` для очистки.

### Ошибка аутентификации
**Решение**: Проверьте что используете `service_role` key, а не `anon` key.

## Контакты для поддержки

При возникновении проблем:
1. Проверьте логи в SQL Editor
2. Убедитесь в правильности порядка выполнения
3. Проверьте права доступа (Service Role Key)
