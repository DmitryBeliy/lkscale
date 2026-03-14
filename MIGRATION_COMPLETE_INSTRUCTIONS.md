# Завершение миграции базы данных

## ⚠️ Проблема
Колонки `cost_price`, `product_sku`, `notes` отсутствуют в таблице `order_items`.

## Решение

### Вариант 1: Выполнить ALTER TABLE через SQL Editor (рекомендуется)

1. **Откройте Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/onnncepenxxxfprqaodu/sql/new
   ```

2. **Вставьте и выполните SQL:**
   ```sql
   ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_sku TEXT;
   ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2) DEFAULT 0;
   ALTER TABLE order_items ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2) DEFAULT 0;
   ALTER TABLE order_items ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2) DEFAULT 0;
   ALTER TABLE order_items ADD COLUMN IF NOT EXISTS notes TEXT;
   ```

3. **Проверьте что колонки созданы:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'order_items';
   ```

4. **Затем выполните Python скрипт:**
   ```bash
   cd H:\dev_lk\lkscale
   python scripts/migrate_via_rest_final.py
   ```

### Вариант 2: Полностью через SQL Editor (без Python)

1. Выполните ALTER TABLE (см. выше)

2. Откройте файлы по очереди и выполните в SQL Editor:
   - `supabase/migrations/ready/part_005_part001.sql`
   - `supabase/migrations/ready/part_005_part002.sql`
   - `supabase/migrations/ready/part_006_part001.sql`
   - `supabase/migrations/ready/part_006_part002.sql`

### Вариант 3: Через pgAdmin или psql

Если есть доступ к Database Connection String:
```bash
psql "postgresql://postgres:FCUDRbuAMUn6ORrs@db.onnncepenxxxfprqaodu.supabase.co:5432/postgres" -f scripts/fix_order_items_schema.sql
```

## Проверка результата

```sql
SELECT 
  'order_items' as table_name, 
  COUNT(*) as count 
FROM order_items
UNION ALL 
SELECT 
  'inventory_transactions', 
  COUNT(*) 
FROM inventory_transactions;
```

Ожидаемый результат:
- order_items: ~17,000 записей
- inventory_transactions: ~8,500 записей
