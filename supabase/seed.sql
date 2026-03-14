-- ============================================
-- Lkscale ERP - Seed Data
-- ============================================
-- Demo data for testing and development
-- Run after schema.sql
-- ============================================

-- ============================================
-- DEMO COMPANY
-- ============================================

INSERT INTO companies (id, name, slug, email, phone, address, city, country, currency, currency_symbol, subscription_tier, max_users, max_products)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'ООО "ТехноТорг"',
  'techno-torg',
  'info@technotorg.ru',
  '+7 (495) 123-45-67',
  'ул. Тверская, д. 15, офис 302',
  'Москва',
  'Россия',
  'RUB',
  '₽',
  'business',
  10,
  1000
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- DEMO USERS
-- ============================================

-- Note: Auth users must be created separately via Supabase Auth
-- These profiles will be linked to auth users with matching IDs

INSERT INTO profiles (id, company_id, first_name, last_name, email, phone, role, permissions, is_active)
VALUES
  -- Owner
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Иван', 'Петров', 'owner@technotorg.ru', '+7 (999) 111-11-11', 'owner', '{"all": true}'::jsonb, true),
  -- Admin
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Мария', 'Сидорова', 'admin@technotorg.ru', '+7 (999) 222-22-22', 'admin', '{"users": true, "products": true, "orders": true, "reports": true}'::jsonb, true),
  -- Manager
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Алексей', 'Козлов', 'manager@technotorg.ru', '+7 (999) 333-33-33', 'manager', '{"products": true, "orders": true, "customers": true}'::jsonb, true),
  -- Cashier
  ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Елена', 'Новикова', 'cashier@technotorg.ru', '+7 (999) 444-44-44', 'cashier', '{"orders": true, "customers": true}'::jsonb, true),
  -- Viewer
  ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Дмитрий', 'Морозов', 'viewer@technotorg.ru', '+7 (999) 555-55-55', 'viewer', '{"reports": true}'::jsonb, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CATEGORIES
-- ============================================

INSERT INTO categories (id, company_id, name, description, color, icon, sort_order, is_active)
VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Смартфоны', 'Мобильные телефоны и аксессуары', '#3B82F6', 'Smartphone', 1, true),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Ноутбуки', 'Портативные компьютеры', '#10B981', 'Laptop', 2, true),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Планшеты', 'Планшетные компьютеры', '#F59E0B', 'Tablet', 3, true),
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Аудио', 'Наушники, колонки и аудиосистемы', '#8B5CF6', 'Headphones', 4, true),
  ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Аксессуары', 'Чехлы, кабели, зарядные устройства', '#EC4899', 'Package', 5, true),
  ('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'Комплектующие', 'Комплектующие для ПК', '#6366F1', 'Cpu', 6, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PRODUCTS
-- ============================================

INSERT INTO products (id, company_id, category_id, name, sku, barcode, description, price, cost_price, stock, min_stock, unit, has_variants, is_active, tags, attributes)
VALUES
  -- Смартфоны
  ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 
   'iPhone 15 Pro Max', 'IP15PM-256', '4601234567890', 
   'Флагманский смартфон Apple с титановым корпусом', 
   139990.00, 115000.00, 25, 5, 'шт', false, true, 
   '["apple", "flagman", "premium"]'::jsonb, '{"brand": "Apple", "color": "Natural Titanium", "storage": "256GB"}'::jsonb),

  ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 
   'Samsung Galaxy S24 Ultra', 'SGS24U-512', '4601234567891', 
   'Премиум Android-смартфон с S Pen', 
   129990.00, 105000.00, 18, 3, 'шт', false, true, 
   '["samsung", "flagman", "premium"]'::jsonb, '{"brand": "Samsung", "color": "Titanium Black", "storage": "512GB"}'::jsonb),

  ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 
   'Xiaomi 14 Pro', 'XM14P-256', '4601234567892', 
   'Флагман Xiaomi с камерой Leica', 
   79990.00, 62000.00, 35, 8, 'шт', false, true, 
   '["xiaomi", "flagman", "leica"]'::jsonb, '{"brand": "Xiaomi", "color": "Black", "storage": "256GB"}'::jsonb),

  ('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 
   'iPhone 15', 'IP15-128', '4601234567893', 
   'Базовая модель iPhone 15 с Dynamic Island', 
   89990.00, 72000.00, 42, 10, 'шт', false, true, 
   '["apple", "popular"]'::jsonb, '{"brand": "Apple", "color": "Blue", "storage": "128GB"}'::jsonb),

  -- Ноутбуки
  ('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440002', 
   'MacBook Pro 16 M3 Max', 'MBP16-M3M', '4601234567894', 
   'Профессиональный ноутбук Apple', 
   349990.00, 290000.00, 12, 2, 'шт', false, true, 
   '["apple", "pro", "m3"]'::jsonb, '{"brand": "Apple", "cpu": "M3 Max", "ram": "36GB", "storage": "1TB"}'::jsonb),

  ('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440002', 
   'ASUS ROG Zephyrus G14', 'ROG-G14-2024', '4601234567895', 
   'Игровой ноутбук с OLED-экраном', 
   189990.00, 155000.00, 8, 3, 'шт', false, true, 
   '["asus", "gaming", "oled"]'::jsonb, '{"brand": "ASUS", "cpu": "Ryzen 9", "gpu": "RTX 4070", "ram": "32GB"}'::jsonb),

  ('770e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440002', 
   'Lenovo ThinkPad X1 Carbon', 'TP-X1C-G12', '4601234567896', 
   'Бизнес-ноутбук премиум-класса', 
   219990.00, 185000.00, 15, 4, 'шт', false, true, 
   '["lenovo", "business", "premium"]'::jsonb, '{"brand": "Lenovo", "cpu": "Core Ultra 7", "ram": "16GB", "storage": "512GB"}'::jsonb),

  -- Планшеты
  ('770e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440003', 
   'iPad Pro 12.9 M2', 'IPD129-M2', '4601234567897', 
   'Профессиональный планшет Apple', 
   129990.00, 105000.00, 20, 5, 'шт', false, true, 
   '["apple", "pro", "tablet"]'::jsonb, '{"brand": "Apple", "screen": "12.9\"", "storage": "256GB"}'::jsonb),

  ('770e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440003', 
   'Samsung Galaxy Tab S9 Ultra', 'GTAB-S9U', '4601234567898', 
   '14.6" планшет с S Pen', 
   109990.00, 88000.00, 14, 3, 'шт', false, true, 
   '["samsung", "tablet", "spen"]'::jsonb, '{"brand": "Samsung", "screen": "14.6\"", "storage": "256GB"}'::jsonb),

  -- Аудио
  ('770e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440004', 
   'AirPods Pro 2', 'APP2-USB-C', '4601234567899', 
   'Беспроводные наушники с шумоподавлением', 
   29990.00, 22000.00, 50, 15, 'шт', false, true, 
   '["apple", "audio", "popular"]'::jsonb, '{"brand": "Apple", "type": "TWS", "color": "White"}'::jsonb),

  ('770e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440004', 
   'Sony WH-1000XM5', 'SONY-XM5', '4601234567900', 
   'Премиум наушники с шумоподавлением', 
   44990.00, 35000.00, 22, 6, 'шт', false, true, 
   '["sony", "audio", "premium"]'::jsonb, '{"brand": "Sony", "type": "Over-ear", "color": "Black"}'::jsonb),

  ('770e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440004', 
   'JBL Charge 5', 'JBL-C5', '4601234567901', 
   'Портативная колонка', 
   14990.00, 10500.00, 40, 10, 'шт', false, true, 
   '["jbl", "audio", "speaker"]'::jsonb, '{"brand": "JBL", "type": "Speaker", "color": "Blue"}'::jsonb),

  -- Аксессуары
  ('770e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440005', 
   'Apple 20W USB-C Charger', 'A-20W-PD', '4601234567902', 
   'Оригинальное зарядное устройство Apple', 
   2990.00, 1800.00, 100, 30, 'шт', false, true, 
   '["apple", "charger", "accessory"]'::jsonb, '{"brand": "Apple", "power": "20W", "type": "USB-C"}'::jsonb),

  ('770e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440005', 
   'USB-C to Lightning Cable 1m', 'CABLE-C-L-1M', '4601234567903', 
   'Кабель для зарядки и синхронизации', 
   1990.00, 800.00, 150, 50, 'шт', false, true, 
   '["cable", "accessory", "popular"]'::jsonb, '{"type": "Cable", "length": "1m", "connector": "USB-C to Lightning"}'::jsonb),

  ('770e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440005', 
   'iPhone 15 Pro Clear Case', 'CASE-IP15P-CL', '4601234567904', 
   'Прозрачный чехол MagSafe', 
   5990.00, 2800.00, 60, 20, 'шт', false, true, 
   '["apple", "case", "accessory"]'::jsonb, '{"brand": "Apple", "type": "Case", "color": "Clear"}'::jsonb),

  -- Низкий запас (для демо)
  ('770e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440002', 
   'MacBook Air 15 M3', 'MBA15-M3', '4601234567905', 
   'Тонкий и легкий ноутбук Apple', 
   169990.00, 140000.00, 2, 5, 'шт', false, true, 
   '["apple", "macbook", "air"]'::jsonb, '{"brand": "Apple", "cpu": "M3", "screen": "15\"", "color": "Midnight"}'::jsonb)

ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CUSTOMERS
-- ============================================

INSERT INTO customers (id, company_id, first_name, last_name, email, phone, address, city, segment, notes, is_active)
VALUES
  ('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Александр', 'Смирнов', 'alex.smirnov@email.ru', '+7 (900) 123-45-67', 'ул. Ленина, д. 10, кв. 25', 'Москва', 'vip', 'Постоянный клиент, предпочитает премиум товары', true),
  ('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Ольга', 'Иванова', 'olga.ivanova@email.ru', '+7 (900) 234-56-78', 'пр. Мира, д. 45, кв. 12', 'Москва', 'regular', NULL, true),
  ('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Михаил', 'Кузнецов', 'mikhail.k@email.ru', '+7 (900) 345-67-89', 'ул. Гагарина, д. 20', 'Санкт-Петербург', 'regular', 'Корпоративный клиент', true),
  ('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Анна', 'Попова', 'anna.popova@email.ru', '+7 (900) 456-78-90', 'ул. Советская, д. 15', 'Новосибирск', 'new', NULL, true),
  ('880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Сергей', 'Васильев', 'sergey.v@email.ru', '+7 (900) 567-89-01', 'ул. Кирова, д. 8, кв. 42', 'Екатеринбург', 'inactive', 'Давно не делал заказов', true),
  ('880e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'Екатерина', 'Соколова', 'ekaterina.s@email.ru', '+7 (900) 678-90-12', 'ул. Пушкина, д. 30', 'Казань', 'regular', NULL, true),
  ('880e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', 'Дмитрий', 'Павлов', 'dmitry.pavlov@email.ru', '+7 (900) 789-01-23', 'ул. Лермонтова, д. 5', 'Нижний Новгород', 'new', NULL, true),
  ('880e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', 'Наталья', 'Морозова', 'natalia.m@email.ru', '+7 (900) 890-12-34', 'пр. Победы, д. 100', 'Самара', 'vip', 'VIP клиент, скидка 10%', true),
  ('880e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440000', 'Андрей', 'Волков', 'andrey.volkov@email.ru', '+7 (900) 901-23-45', 'ул. Спортивная, д. 12', 'Омск', 'regular', NULL, true),
  ('880e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Марина', 'Лебедева', 'marina.lebedeva@email.ru', '+7 (900) 012-34-56', 'ул. Центральная, д. 77', 'Челябинск', 'new', NULL, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ORDERS (with items)
-- ============================================

-- Order 1 - Completed
INSERT INTO orders (id, company_id, customer_id, order_number, status, customer_name, customer_phone, shipping_address, 
                    subtotal, tax_amount, tax_rate, discount_amount, shipping_amount, total_amount, 
                    payment_method, payment_status, paid_amount, paid_at, completed_at, notes)
VALUES (
  '990e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  '880e8400-e29b-41d4-a716-446655440001',
  'ORD-2024-000001',
  'completed',
  'Александр Смирнов',
  '+7 (900) 123-45-67',
  'ул. Ленина, д. 10, кв. 25, Москва',
  169980.00, 16998.00, 10.00, 5000.00, 0, 181978.00,
  'card', 'paid', 181978.00, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days',
  'Предоплата, доставка курьером'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (id, order_id, product_id, product_name, sku, barcode, unit_price, cost_price, quantity)
VALUES
  ('a90e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'iPhone 15 Pro Max', 'IP15PM-256', '4601234567890', 139990.00, 115000.00, 1),
  ('a90e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440010', 'AirPods Pro 2', 'APP2-USB-C', '4601234567899', 29990.00, 22000.00, 1)
ON CONFLICT (id) DO NOTHING;

-- Order 2 - Completed
INSERT INTO orders (id, company_id, customer_id, order_number, status, customer_name, customer_phone, shipping_address, 
                    subtotal, tax_amount, tax_rate, discount_amount, shipping_amount, total_amount, 
                    payment_method, payment_status, paid_amount, paid_at, completed_at)
VALUES (
  '990e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440000',
  '880e8400-e29b-41d4-a716-446655440008',
  'ORD-2024-000002',
  'completed',
  'Наталья Морозова',
  '+7 (900) 890-12-34',
  'пр. Победы, д. 100, Самара',
  464980.00, 46498.00, 10.00, 10000.00, 0, 501478.00,
  'transfer', 'paid', 501478.00, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (id, order_id, product_id, product_name, sku, barcode, unit_price, cost_price, quantity)
VALUES
  ('a90e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440005', 'MacBook Pro 16 M3 Max', 'MBP16-M3M', '4601234567894', 349990.00, 290000.00, 1),
  ('a90e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440013', 'Apple 20W USB-C Charger', 'A-20W-PD', '4601234567902', 2990.00, 1800.00, 5),
  ('a90e8400-e29b-41d4-a716-446655440005', '990e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440014', 'USB-C to Lightning Cable 1m', 'CABLE-C-L-1M', '4601234567903', 1990.00, 800.00, 3)
ON CONFLICT (id) DO NOTHING;

-- Order 3 - Processing
INSERT INTO orders (id, company_id, customer_id, order_number, status, customer_name, customer_phone, shipping_address, 
                    subtotal, tax_amount, tax_rate, discount_amount, shipping_amount, total_amount, 
                    payment_method, payment_status, paid_amount)
VALUES (
  '990e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440000',
  '880e8400-e29b-41d4-a716-446655440002',
  'ORD-2024-000003',
  'processing',
  'Ольга Иванова',
  '+7 (900) 234-56-78',
  'пр. Мира, д. 45, кв. 12, Москва',
  109990.00, 10999.00, 10.00, 0, 500.00, 121489.00,
  'card', 'partial', 50000.00
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (id, order_id, product_id, product_name, sku, barcode, unit_price, cost_price, quantity)
VALUES
  ('a90e8400-e29b-41d4-a716-446655440006', '990e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440009', 'Samsung Galaxy Tab S9 Ultra', 'GTAB-S9U', '4601234567898', 109990.00, 88000.00, 1)
ON CONFLICT (id) DO NOTHING;

-- Order 4 - Pending
INSERT INTO orders (id, company_id, customer_id, order_number, status, customer_name, customer_phone, shipping_address, 
                    subtotal, tax_amount, tax_rate, discount_amount, shipping_amount, total_amount, 
                    payment_method, payment_status)
VALUES (
  '990e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440000',
  '880e8400-e29b-41d4-a716-446655440003',
  'ORD-2024-000004',
  'pending',
  'Михаил Кузнецов',
  '+7 (900) 345-67-89',
  'ул. Гагарина, д. 20, Санкт-Петербург',
  189990.00, 18999.00, 10.00, 0, 0, 208989.00,
  'transfer', 'pending'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (id, order_id, product_id, product_name, sku, barcode, unit_price, cost_price, quantity)
VALUES
  ('a90e8400-e29b-41d4-a716-446655440007', '990e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440006', 'ASUS ROG Zephyrus G14', 'ROG-G14-2024', '4601234567895', 189990.00, 155000.00, 1)
ON CONFLICT (id) DO NOTHING;

-- Order 5 - Completed (multiple items)
INSERT INTO orders (id, company_id, customer_id, order_number, status, customer_name, customer_phone, shipping_address, 
                    subtotal, tax_amount, tax_rate, discount_amount, shipping_amount, total_amount, 
                    payment_method, payment_status, paid_amount, paid_at, completed_at)
VALUES (
  '990e8400-e29b-41d4-a716-446655440005',
  '550e8400-e29b-41d4-a716-446655440000',
  '880e8400-e29b-41d4-a716-446655440006',
  'ORD-2024-000005',
  'completed',
  'Екатерина Соколова',
  '+7 (900) 678-90-12',
  'ул. Пушкина, д. 30, Казань',
  44970.00, 4497.00, 10.00, 0, 0, 49467.00,
  'cash', 'paid', 49467.00, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (id, order_id, product_id, product_name, sku, barcode, unit_price, cost_price, quantity)
VALUES
  ('a90e8400-e29b-41d4-a716-446655440008', '990e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440012', 'JBL Charge 5', 'JBL-C5', '4601234567901', 14990.00, 10500.00, 1),
  ('a90e8400-e29b-41d4-a716-446655440009', '990e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440014', 'USB-C to Lightning Cable 1m', 'CABLE-C-L-1M', '4601234567903', 1990.00, 800.00, 2),
  ('a90e8400-e29b-41d4-a716-446655440010', '990e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440015', 'iPhone 15 Pro Clear Case', 'CASE-IP15P-CL', '4601234567904', 5990.00, 2800.00, 1),
  ('a90e8400-e29b-41d4-a716-446655440011', '990e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440013', 'Apple 20W USB-C Charger', 'A-20W-PD', '4601234567902', 2990.00, 1800.00, 2)
ON CONFLICT (id) DO NOTHING;

-- Order 6 - Cancelled
INSERT INTO orders (id, company_id, customer_id, order_number, status, customer_name, customer_phone, shipping_address, 
                    subtotal, tax_amount, tax_rate, discount_amount, shipping_amount, total_amount, 
                    payment_method, payment_status, cancelled_at, notes)
VALUES (
  '990e8400-e29b-41d4-a716-446655440006',
  '550e8400-e29b-41d4-a716-446655440000',
  '880e8400-e29b-41d4-a716-446655440005',
  'ORD-2024-000006',
  'cancelled',
  'Сергей Васильев',
  '+7 (900) 567-89-01',
  'ул. Кирова, д. 8, кв. 42, Екатеринбург',
  44990.00, 4499.00, 10.00, 0, 0, 49489.00,
  'online', 'pending',
  NOW() - INTERVAL '2 days',
  'Отменен по просьбе клиента'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (id, order_id, product_id, product_name, sku, barcode, unit_price, cost_price, quantity)
VALUES
  ('a90e8400-e29b-41d4-a716-446655440012', '990e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440011', 'Sony WH-1000XM5', 'SONY-XM5', '4601234567900', 44990.00, 35000.00, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SUPPLIERS
-- ============================================

INSERT INTO suppliers (id, company_id, name, code, email, phone, contact_name, contact_phone, address, city, tax_id, payment_terms, rating, is_active)
VALUES
  ('b90e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'ООО "АйТи Дистрибуция"', 'IT-DIST', 'sales@itdistr.ru', '+7 (495) 100-00-01', 'Иван Петров', '+7 (999) 100-10-10', 'ул. Электрозаводская, д. 20', 'Москва', '7701234567', 'Оплата в течение 30 дней', 5, true),
  ('b90e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'ЗАО "Мобайл Снаб"', 'MOB-SNAB', 'orders@mobilesnab.ru', '+7 (495) 200-00-02', 'Мария Иванова', '+7 (999) 200-20-20', 'пр. Ленинградский, д. 15, офис 300', 'Москва', '7702345678', 'Предоплата 50%', 4, true),
  ('b90e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'ИП Сидоров А.В.', 'SIDOROV-AV', 'sidorov@audio.ru', '+7 (495) 300-00-03', 'Алексей Сидоров', '+7 (999) 300-30-30', 'ул. Аудио, д. 5', 'Москва', '770345678901', 'Оплата при получении', 4, true),
  ('b90e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'ООО "ТехноИмпорт"', 'TECH-IMP', 'info@techimport.ru', '+7 (812) 400-00-04', 'Елена Соколова', '+7 (999) 400-40-40', 'наб. Реки Фонтанки, д. 50', 'Санкт-Петербург', '7804567890', 'Отсрочка 45 дней', 3, true),
  ('b90e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'ООО "Аксессуары Плюс"', 'ACC-PLUS', 'zakaz@acc-plus.ru', '+7 (495) 500-00-05', 'Дмитрий Морозов', '+7 (999) 500-50-50', 'ул. Аксессуарная, д. 12', 'Москва', '7705678901', 'Оплата в течение 14 дней', 5, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PURCHASE ORDERS
-- ============================================

INSERT INTO purchase_orders (id, company_id, supplier_id, po_number, status, subtotal, tax_amount, total_amount, expected_delivery_date, payment_status)
VALUES
  ('c90e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'b90e8400-e29b-41d4-a716-446655440001', 'PO-2024-0001', 'completed', 575000.00, 57500.00, 632500.00, NOW() - INTERVAL '10 days', 'paid'),
  ('c90e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'b90e8400-e29b-41d4-a716-446655440002', 'PO-2024-0002', 'completed', 350000.00, 35000.00, 385000.00, NOW() - INTERVAL '7 days', 'paid'),
  ('c90e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'b90e8400-e29b-41d4-a716-446655440005', 'PO-2024-0003', 'processing', 45000.00, 4500.00, 49500.00, NOW() + INTERVAL '5 days', 'partial'),
  ('c90e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'b90e8400-e29b-41d4-a716-446655440003', 'PO-2024-0004', 'pending', 75000.00, 7500.00, 82500.00, NOW() + INTERVAL '14 days', 'pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO purchase_order_items (id, purchase_order_id, product_id, product_name, sku, unit_price, quantity)
VALUES
  ('d90e8400-e29b-41d4-a716-446655440001', 'c90e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'iPhone 15 Pro Max', 'IP15PM-256', 115000.00, 5),
  ('d90e8400-e29b-41d4-a716-446655440002', 'c90e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'Samsung Galaxy S24 Ultra', 'SGS24U-512', 105000.00, 3),
  ('d90e8400-e29b-41d4-a716-446655440003', 'c90e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440003', 'Xiaomi 14 Pro', 'XM14P-256', 62000.00, 2),
  ('d90e8400-e29b-41d4-a716-446655440004', 'c90e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440013', 'Apple 20W USB-C Charger', 'A-20W-PD', 1800.00, 10),
  ('d90e8400-e29b-41d4-a716-446655440005', 'c90e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440014', 'USB-C to Lightning Cable 1m', 'CABLE-C-L-1M', 800.00, 20),
  ('d90e8400-e29b-41d4-a716-446655440006', 'c90e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440015', 'iPhone 15 Pro Clear Case', 'CASE-IP15P-CL', 2800.00, 5),
  ('d90e8400-e29b-41d4-a716-446655440007', 'c90e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440010', 'AirPods Pro 2', 'APP2-USB-C', 22000.00, 2),
  ('d90e8400-e29b-41d4-a716-446655440008', 'c90e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440011', 'Sony WH-1000XM5', 'SONY-XM5', 35000.00, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- WAREHOUSES
-- ============================================

INSERT INTO warehouses (id, company_id, name, code, address, city, phone, is_primary, is_active)
VALUES
  ('e90e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Основной склад', 'MAIN', 'ул. Складская, д. 1', 'Москва', '+7 (495) 111-22-33', true, true),
  ('e90e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Склад СПб', 'SPB', 'ул. Логистическая, д. 10', 'Санкт-Петербург', '+7 (812) 444-55-66', false, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- WAREHOUSE STOCK
-- ============================================

INSERT INTO warehouse_stock (id, warehouse_id, product_id, quantity, reserved_quantity, min_stock, max_stock)
VALUES
  ('f90e8400-e29b-41d4-a716-446655440001', 'e90e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 20, 0, 5, 50),
  ('f90e8400-e29b-41d4-a716-446655440002', 'e90e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', 15, 0, 3, 30),
  ('f90e8400-e29b-41d4-a716-446655440003', 'e90e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440003', 30, 0, 8, 60),
  ('f90e8400-e29b-41d4-a716-446655440004', 'e90e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440004', 40, 0, 10, 80),
  ('f90e8400-e29b-41d4-a716-446655440005', 'e90e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440005', 10, 0, 2, 20),
  ('f90e8400-e29b-41d4-a716-446655440006', 'e90e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440006', 8, 0, 3, 15),
  ('f90e8400-e29b-41d4-a716-446655440007', 'e90e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440007', 15, 0, 4, 30),
  ('f90e8400-e29b-41d4-a716-446655440008', 'e90e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440008', 18, 0, 5, 35),
  ('f90e8400-e29b-41d4-a716-446655440009', 'e90e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440009', 12, 0, 3, 25),
  ('f90e8400-e29b-41d4-a716-446655440010', 'e90e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440010', 45, 0, 15, 100),
  ('f90e8400-e29b-41d4-a716-446655440011', 'e90e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440011', 20, 0, 6, 40),
  ('f90e8400-e29b-41d4-a716-446655440012', 'e90e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440012', 35, 0, 10, 70),
  ('f90e8400-e29b-41d4-a716-446655440013', 'e90e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440013', 95, 0, 30, 200),
  ('f90e8400-e29b-41d4-a716-446655440014', 'e90e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440014', 145, 0, 50, 300),
  ('f90e8400-e29b-41d4-a716-446655440015', 'e90e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440015', 55, 0, 20, 120),
  ('f90e8400-e29b-41d4-a716-446655440016', 'e90e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440016', 2, 0, 5, 20)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STAFF
-- ============================================

INSERT INTO staff (id, company_id, user_id, first_name, last_name, email, phone, employee_id, position, department, hire_date, salary, is_active)
VALUES
  ('g90e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Иван', 'Петров', 'owner@technotorg.ru', '+7 (999) 111-11-11', 'EMP-001', 'Директор', 'Руководство', '2020-01-15', 300000.00, true),
  ('g90e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'Мария', 'Сидорова', 'admin@technotorg.ru', '+7 (999) 222-22-22', 'EMP-002', 'Администратор', 'Управление', '2020-03-01', 150000.00, true),
  ('g90e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Алексей', 'Козлов', 'manager@technotorg.ru', '+7 (999) 333-33-33', 'EMP-003', 'Менеджер по продажам', 'Продажи', '2021-02-10', 120000.00, true),
  ('g90e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', 'Елена', 'Новикова', 'cashier@technotorg.ru', '+7 (999) 444-44-44', 'EMP-004', 'Кассир', 'Продажи', '2021-06-15', 80000.00, true),
  ('g90e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', NULL, 'Сергей', 'Федоров', 'sergey.f@technotorg.ru', '+7 (999) 777-77-77', 'EMP-005', 'Кладовщик', 'Склад', '2022-01-20', 70000.00, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INVENTORY TRANSACTIONS (sample)
-- ============================================

INSERT INTO inventory_transactions (id, company_id, product_id, type, quantity, stock_before, stock_after, order_id, purchase_order_id, unit_cost, unit_price, reason, performed_by)
VALUES
  ('h90e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440001', 'purchase', 5, 20, 25, NULL, 'c90e8400-e29b-41d4-a716-446655440001', 115000.00, NULL, 'Поступление от поставщика', '550e8400-e29b-41d4-a716-446655440002'),
  ('h90e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440001', 'sale', -1, 25, 24, '990e8400-e29b-41d4-a716-446655440001', NULL, 115000.00, 139990.00, 'Продажа по заказу ORD-2024-000001', '550e8400-e29b-41d4-a716-446655440004'),
  ('h90e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440010', 'purchase', 50, 0, 50, NULL, 'c90e8400-e29b-41d4-a716-446655440004', 22000.00, NULL, 'Поступление от поставщика', '550e8400-e29b-41d4-a716-446655440002'),
  ('h90e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440010', 'sale', -1, 50, 49, '990e8400-e29b-41d4-a716-446655440001', NULL, 22000.00, 29990.00, 'Продажа по заказу ORD-2024-000001', '550e8400-e29b-41d4-a716-446655440004'),
  ('h90e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440005', 'sale', -1, 13, 12, '990e8400-e29b-41d4-a716-446655440002', NULL, 290000.00, 349990.00, 'Продажа по заказу ORD-2024-000002', '550e8400-e29b-41d4-a716-446655440004'),
  ('h90e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440014', 'sale', -3, 148, 145, '990e8400-e29b-41d4-a716-446655440002', NULL, 800.00, 1990.00, 'Продажа по заказу ORD-2024-000002', '550e8400-e29b-41d4-a716-446655440004'),
  ('h90e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440013', 'sale', -5, 100, 95, '990e8400-e29b-41d4-a716-446655440002', NULL, 1800.00, 2990.00, 'Продажа по заказу ORD-2024-000002', '550e8400-e29b-41d4-a716-446655440004'),
  ('h90e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440009', 'sale', -1, 14, 13, '990e8400-e29b-41d4-a716-446655440003', NULL, 88000.00, 109990.00, 'Продажа по заказу ORD-2024-000003', '550e8400-e29b-41d4-a716-446655440004')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- NOTIFICATIONS
-- ============================================

INSERT INTO notifications (id, company_id, user_id, type, title, message, priority, entity_type, entity_id)
VALUES
  ('i90e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'new_order', 'Новый заказ #ORD-2024-000004', 'Поступил новый заказ на сумму 208 989 ₽', 'high', 'order', '990e8400-e29b-41d4-a716-446655440004'),
  ('i90e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'low_stock', 'Низкий запас: MacBook Air 15 M3', 'Остаток товара ниже минимального (2 шт.)', 'high', 'product', '770e8400-e29b-41d4-a716-446655440016'),
  ('i90e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', NULL, 'alert', 'Системное уведомление', 'Демо-данные успешно загружены', 'normal', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- UPDATE CUSTOMER STATS (trigger should handle this, but ensure data consistency)
-- ============================================

UPDATE customers SET 
  total_orders = 1,
  total_spent = 181978.00,
  average_order_value = 181978.00,
  last_order_date = (NOW() - INTERVAL '5 days')
WHERE id = '880e8400-e29b-41d4-a716-446655440001';

UPDATE customers SET 
  total_orders = 1,
  total_spent = 501478.00,
  average_order_value = 501478.00,
  last_order_date = (NOW() - INTERVAL '3 days')
WHERE id = '880e8400-e29b-41d4-a716-446655440008';

UPDATE customers SET 
  total_orders = 1,
  total_spent = 121489.00,
  average_order_value = 121489.00,
  last_order_date = NOW() - INTERVAL '1 day'
WHERE id = '880e8400-e29b-41d4-a716-446655440002';

UPDATE customers SET 
  total_orders = 1,
  total_spent = 49467.00,
  average_order_value = 49467.00,
  last_order_date = NOW() - INTERVAL '1 day'
WHERE id = '880e8400-e29b-41d4-a716-446655440006';

-- ============================================
-- SEED COMPLETE
-- ============================================

SELECT 'Seed data loaded successfully!' as status;
