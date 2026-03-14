-- Временное отключение foreign key constraint для products.manufacturer_id
-- Выполните перед загрузкой part_002.sql

-- Отключить constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_manufacturer_id_fkey;

-- Теперь можно загружать part_002.sql с любыми manufacturer_id
