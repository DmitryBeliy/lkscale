-- Добавление недостающих колонок в таблицу orders
-- Выполните перед загрузкой part_003.sql

-- Добавить колонки если они не существуют
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items_count INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0;

-- Проверка
SELECT column_name FROM information_schema.columns WHERE table_name = 'orders';
