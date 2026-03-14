-- Добавление недостающих колонок в таблицу inventory_transactions
-- Выполните перед загрузкой part_009.sql

ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id);
ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS transaction_type TEXT;
ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(10,2) DEFAULT 0;
ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS total_cost DECIMAL(10,2) DEFAULT 0;
ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS status TEXT;

-- Проверка
SELECT column_name FROM information_schema.columns WHERE table_name = 'inventory_transactions';
