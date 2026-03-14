-- ============================================
-- LKSCALE ERP - SCHEMA FIX: ADD MISSING COLUMNS AND TABLES
-- ============================================
-- This migration safely adds missing legacy_id columns and creates missing tables
-- Uses IF NOT EXISTS for all operations - safe to run multiple times
-- Generated: 2026-03-14
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- PART 1: ADD legacy_id TO EXISTING TABLES
-- ============================================

-- Manufacturers
ALTER TABLE manufacturers ADD COLUMN IF NOT EXISTS legacy_id INTEGER UNIQUE;
COMMENT ON COLUMN manufacturers.legacy_id IS 'Original ID from old system for migration mapping';

-- Suppliers
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS legacy_id INTEGER UNIQUE;
COMMENT ON COLUMN suppliers.legacy_id IS 'Original ID from old system for migration mapping';

-- Locations
ALTER TABLE locations ADD COLUMN IF NOT EXISTS legacy_id INTEGER UNIQUE;
COMMENT ON COLUMN locations.legacy_id IS 'Original ID from old system for migration mapping';

-- Customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS legacy_id INTEGER UNIQUE;
COMMENT ON COLUMN customers.legacy_id IS 'Original ID from old system for migration mapping';

-- Products
ALTER TABLE products ADD COLUMN IF NOT EXISTS legacy_id INTEGER UNIQUE;
COMMENT ON COLUMN products.legacy_id IS 'Original ID from old system for migration mapping';

-- Orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS legacy_id INTEGER UNIQUE;
COMMENT ON COLUMN orders.legacy_id IS 'Original ID from old system for migration mapping';

-- ============================================
-- PART 2: ADD OTHER MISSING COLUMNS TO PRODUCTS
-- ============================================

-- Unit of measurement (e.g., 'шт', 'kg', 'm')
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'шт';
COMMENT ON COLUMN products.unit IS 'Unit of measurement (e.g., шт, kg, m)';

-- Compare at price (original price before discount)
ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_at_price DECIMAL(12, 2) DEFAULT 0;
COMMENT ON COLUMN products.compare_at_price IS 'Original price before discount for showing savings';

-- Has variants flag
ALTER TABLE products ADD COLUMN IF NOT EXISTS has_variants BOOLEAN DEFAULT FALSE;
COMMENT ON COLUMN products.has_variants IS 'Whether product has size/color variants';

-- ============================================
-- PART 3: ADD OTHER MISSING COLUMNS TO ORDERS
-- ============================================

-- Customer email snapshot
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
COMMENT ON COLUMN orders.customer_email IS 'Customer email at time of order (snapshot)';

-- Legacy outlet ID for migration
ALTER TABLE orders ADD COLUMN IF NOT EXISTS legacy_outlet_id INTEGER;
COMMENT ON COLUMN orders.legacy_outlet_id IS 'Original outlet ID from old system';

-- ============================================
-- PART 4: CREATE MISSING TABLES (IF NOT EXISTS)
-- ============================================

-- --------------------------------------------
-- PURCHASE ORDERS
-- Purchase orders to suppliers
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,
    user_id UUID REFERENCES auth.users(id),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    
    -- Order info
    order_number TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    
    -- Financial
    subtotal DECIMAL(12, 2) DEFAULT 0,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) DEFAULT 0,
    total_items INTEGER,
    
    -- Delivery
    expected_date TIMESTAMP WITH TIME ZONE,
    received_date TIMESTAMP WITH TIME ZONE,
    
    -- Payment
    payment_status TEXT DEFAULT 'pending',
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    
    -- Notes
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE purchase_orders IS 'Purchase orders to suppliers';
COMMENT ON COLUMN purchase_orders.legacy_id IS 'Original ID from old system for migration mapping';

-- --------------------------------------------
-- PURCHASE ORDER ITEMS
-- Line items for each purchase order
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    
    -- Product info
    product_name TEXT NOT NULL,
    product_sku TEXT,
    
    -- Quantities
    quantity_ordered INTEGER NOT NULL DEFAULT 0,
    quantity_received INTEGER DEFAULT 0,
    
    -- Pricing
    unit_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE purchase_order_items IS 'Line items for each purchase order';

-- --------------------------------------------
-- STOCK ADJUSTMENTS
-- Inventory adjustments and corrections
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS stock_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,
    user_id UUID REFERENCES auth.users(id),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    
    -- Product info (snapshot)
    product_name TEXT NOT NULL,
    product_sku TEXT,
    
    -- Adjustment details
    adjustment_type TEXT NOT NULL,
    quantity_change INTEGER NOT NULL,
    
    -- Stock levels
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    
    -- Value tracking
    unit_cost DECIMAL(12, 2),
    total_value DECIMAL(12, 2),
    
    -- Reason and reference
    reason TEXT,
    reference_number TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE stock_adjustments IS 'Inventory adjustments and corrections';
COMMENT ON COLUMN stock_adjustments.legacy_id IS 'Original ID from old system for migration mapping';

-- --------------------------------------------
-- ROLES
-- User roles for RBAC
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE roles IS 'User roles for role-based access control';

-- --------------------------------------------
-- USER_ROLES
-- Junction table for user-role assignments
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    PRIMARY KEY (user_id, role_id)
);

COMMENT ON TABLE user_roles IS 'Junction table for user-role assignments';

-- ============================================
-- PART 5: ENABLE RLS ON NEW TABLES
-- ============================================

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 6: CREATE RLS POLICIES
-- ============================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow_all" ON purchase_orders;
DROP POLICY IF EXISTS "Allow_all" ON purchase_order_items;
DROP POLICY IF EXISTS "Allow_all" ON stock_adjustments;
DROP POLICY IF EXISTS "Allow_all" ON roles;
DROP POLICY IF EXISTS "Allow_all" ON user_roles;

-- Create Allow_all policies for development
CREATE POLICY "Allow_all" ON purchase_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow_all" ON purchase_order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow_all" ON stock_adjustments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow_all" ON roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow_all" ON user_roles FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- PART 7: CREATE INDEXES
-- ============================================

-- Legacy ID indexes
CREATE INDEX IF NOT EXISTS idx_manufacturers_legacy_id ON manufacturers(legacy_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_legacy_id ON suppliers(legacy_id);
CREATE INDEX IF NOT EXISTS idx_locations_legacy_id ON locations(legacy_id);
CREATE INDEX IF NOT EXISTS idx_customers_legacy_id ON customers(legacy_id);
CREATE INDEX IF NOT EXISTS idx_products_legacy_id ON products(legacy_id);
CREATE INDEX IF NOT EXISTS idx_orders_legacy_id ON orders(legacy_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_legacy_id ON purchase_orders(legacy_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_legacy_id ON stock_adjustments(legacy_id);

-- New table indexes
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po_id ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_product ON purchase_order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_product ON stock_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_user ON stock_adjustments(user_id);

-- ============================================
-- PART 8: INSERT DEFAULT ROLES
-- ============================================

INSERT INTO roles (name, description, permissions) VALUES
    ('admin', 'Главный Администратор', '["all"]'::jsonb),
    ('manager', 'Менеджер', '["products:view","products:edit","orders:view","orders:edit","customers:view","customers:edit","purchase_orders:view","purchase_orders:edit"]'::jsonb),
    ('seller', 'Продавец', '["products:view","orders:view","orders:create","customers:view"]'::jsonb),
    ('warehouse', 'Кладовщик', '["products:view","inventory:view","inventory:edit","stock_adjustments:view","stock_adjustments:create"]'::jsonb),
    ('viewer', 'Только просмотр', '["products:view","orders:view","customers:view"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- PART 9: CREATE TRIGGERS FOR updated_at
-- ============================================

-- Create trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for new tables
DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON purchase_orders;
CREATE TRIGGER update_purchase_orders_updated_at
    BEFORE UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 
    'Schema fix complete' as status,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'manufacturers' AND column_name = 'legacy_id') as manufacturers_legacy_id,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'suppliers' AND column_name = 'legacy_id') as suppliers_legacy_id,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'legacy_id') as locations_legacy_id,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'legacy_id') as customers_legacy_id,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'legacy_id') as products_legacy_id,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'legacy_id') as orders_legacy_id,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'unit') as products_unit,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'compare_at_price') as products_compare_at_price,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'has_variants') as products_has_variants,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'customer_email') as orders_customer_email,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'legacy_outlet_id') as orders_legacy_outlet_id,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'purchase_orders') as purchase_orders_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'purchase_order_items') as purchase_order_items_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stock_adjustments') as stock_adjustments_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'roles') as roles_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') as user_roles_exists,
    (SELECT COUNT(*) FROM roles) as roles_count;
