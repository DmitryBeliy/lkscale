-- Очистка таблиц перед миграцией (выполнить если нужно перезагрузить)
-- ВНИМАНИЕ: Это удалит ВСЕ существующие данные!

TRUNCATE TABLE inventory_transactions CASCADE;
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE suppliers CASCADE;
TRUNCATE TABLE manufacturers CASCADE;
TRUNCATE TABLE categories CASCADE;

-- Теперь можно загружать данные заново
