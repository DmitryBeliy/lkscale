-- Включение foreign key constraint обратно (опционально)
-- Выполните после загрузки part_002.sql, если нужен constraint

-- Добавить constraint обратно (только если manufacturers заполнены)
-- ALTER TABLE products ADD CONSTRAINT products_manufacturer_id_fkey 
--     FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id) ON DELETE SET NULL;

-- Или оставить без constraint
SELECT 'Foreign key constraint отключен. Можно продолжить миграцию.' as status;
