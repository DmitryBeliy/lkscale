-- ============================================
-- LKSCALE ERP - COMPLETE TABLE CREATION
-- ============================================
-- This file creates ALL tables needed for the Lkscale ERP application
-- Execute this in Supabase SQL Editor to set up the complete schema
-- Generated: 2026-03-14
-- ============================================

-- Enable UUID extension (use gen_random_uuid() for newer Postgres)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. MANUFACTURERS
-- Product manufacturers reference table
-- ============================================

CREATE TABLE IF NOT EXISTS manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,  -- Original ID from old system for migration mapping
    name TEXT NOT NULL,
    description TEXT,
    website TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE manufacturers IS 'Product manufacturers reference table';
COMMENT ON COLUMN manufacturers.legacy_id IS 'Original ID from old system for migration mapping';

-- ============================================
-- 2. SUPPLIERS
-- Suppliers and vendors
-- ============================================

CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,  -- Original ID from old system for migration mapping
    name TEXT NOT NULL,
    type TEXT,  -- manufacturer, supplier, etc.
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    website TEXT,
    notes TEXT,
    payment_terms TEXT,
    lead_time_days INTEGER,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE suppliers IS 'Suppliers and vendors';
COMMENT ON COLUMN suppliers.legacy_id IS 'Original ID from old system for migration mapping';

-- ============================================
-- 3. LOCATIONS
-- Warehouses and shops where inventory is stored
-- ============================================

CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,  -- Original ID from old system
    name TEXT NOT NULL,
    type INTEGER NOT NULL DEFAULT 1,  -- 1=Warehouse, 2=Shop, 3=Other
    address TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE locations IS 'Warehouses and shops where inventory is stored';
COMMENT ON COLUMN locations.type IS 'Location type: 1=Warehouse, 2=Shop, 3=Other';
COMMENT ON COLUMN locations.legacy_id IS 'Original ID from old system for migration mapping';

-- ============================================
-- 4. CUSTOMERS
-- Customer database
-- ============================================

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,  -- Original ID from old system for migration mapping
    
    -- Personal info
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    
    -- Company info (for B2B)
    company_name TEXT,
    tax_id TEXT,
    
    -- Address
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'Russia',
    postal_code TEXT,
    
    -- Segment
    segment TEXT DEFAULT 'new',
    tags JSONB DEFAULT '[]'::jsonb,
    
    -- Notes
    notes TEXT,
    
    -- Computed fields (updated via triggers)
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0,
    average_order_value DECIMAL(12, 2) DEFAULT 0,
    last_order_date TIMESTAMP WITH TIME ZONE,
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE customers IS 'Customer database';
COMMENT ON COLUMN customers.legacy_id IS 'Original ID from old system for migration mapping';

-- ============================================
-- 5. PRODUCTS
-- Product catalog with inventory tracking
-- ============================================

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,  -- Original ID from old system for migration mapping
    user_id UUID REFERENCES auth.users(id),
    
    -- Basic info
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    barcode TEXT,
    description TEXT,
    
    -- Pricing
    price DECIMAL(12, 2) DEFAULT 0,
    purchase_price DECIMAL(12, 2) DEFAULT 0,
    cost_price DECIMAL(12, 2) DEFAULT 0,
    compare_at_price DECIMAL(12, 2) DEFAULT 0,
    
    -- Inventory
    quantity INTEGER DEFAULT 0,
    stock INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    unit TEXT DEFAULT 'шт',
    
    -- Categories and relationships
    category TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE SET NULL,
    
    -- Media
    image_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    
    -- Status and flags
    has_variants BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- SEO
    seo_title TEXT,
    seo_description TEXT,
    slug TEXT,
    
    -- Metadata
    tags JSONB DEFAULT '[]'::jsonb,
    attributes JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE products IS 'Product catalog with inventory tracking';
COMMENT ON COLUMN products.legacy_id IS 'Original ID from old system for migration mapping';

-- ============================================
-- CATEGORIES (Required by products)
-- Product categories
-- ============================================

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE categories IS 'Product categories';

-- ============================================
-- 6. ORDERS
-- Sales orders from customers
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,  -- Original ID from old system for migration mapping
    user_id UUID REFERENCES auth.users(id),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    
    -- Order info
    order_number TEXT UNIQUE,
    status TEXT DEFAULT 'pending',  -- pending, processing, completed, cancelled
    
    -- Customer snapshot (for history)
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    customer_address TEXT,
    
    -- Financial
    subtotal DECIMAL(12, 2) DEFAULT 0,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    shipping_amount DECIMAL(12, 2) DEFAULT 0,
    total DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) DEFAULT 0,
    
    -- Payment
    payment_status TEXT DEFAULT 'pending',  -- pending, paid, partial, failed
    payment_method TEXT,
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Additional info
    notes TEXT,
    internal_notes TEXT,
    items JSONB,
    items_count INTEGER DEFAULT 0,
    
    -- Metadata
    source TEXT DEFAULT 'app',
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE orders IS 'Sales orders from customers';
COMMENT ON COLUMN orders.legacy_id IS 'Original ID from old system for migration mapping';

-- ============================================
-- ORDER ITEMS (Required by orders)
-- Line items for each order
-- ============================================

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    
    -- Product snapshot
    product_name TEXT NOT NULL,
    product_sku TEXT,
    
    -- Pricing
    price DECIMAL(12, 2) DEFAULT 0,
    unit_price DECIMAL(12, 2) DEFAULT 0,
    quantity INTEGER DEFAULT 1,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    
    -- Calculated totals
    total DECIMAL(12, 2) DEFAULT 0,
    total_price DECIMAL(12, 2) DEFAULT 0,
    
    -- Cost tracking
    cost_price DECIMAL(12, 2) DEFAULT 0,
    
    -- Additional info
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE order_items IS 'Line items for each order';

-- ============================================
-- 7. PURCHASE ORDERS
-- Purchase orders to suppliers
-- ============================================

CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,  -- Original ID from old system for migration mapping
    user_id UUID REFERENCES auth.users(id),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    
    -- Order info
    order_number TEXT NOT NULL,
    status TEXT DEFAULT 'pending',  -- pending, processing, completed, cancelled
    
    -- Financial
    subtotal DECIMAL(12, 2) DEFAULT 0,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) DEFAULT 0,
    total_items INTEGER,
    
    -- Delivery
    expected_date TIMESTAMP WITH TIME ZONE,
    received_date TIMESTAMP WITH TIME ZONE,
    
    -- Payment
    payment_status TEXT DEFAULT 'pending',  -- pending, paid, partial
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    
    -- Notes
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE purchase_orders IS 'Purchase orders to suppliers';
COMMENT ON COLUMN purchase_orders.legacy_id IS 'Original ID from old system for migration mapping';

-- ============================================
-- 8. PURCHASE ORDER ITEMS
-- Line items for each purchase order
-- ============================================

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

-- ============================================
-- 9. STOCK ADJUSTMENTS
-- Inventory adjustments and corrections
-- ============================================

CREATE TABLE IF NOT EXISTS stock_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,  -- Original ID from old system for migration mapping
    user_id UUID REFERENCES auth.users(id),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    
    -- Product info (snapshot)
    product_name TEXT NOT NULL,
    product_sku TEXT,
    
    -- Adjustment details
    adjustment_type TEXT NOT NULL,  -- addition, reduction, correction, damage, expiry
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

-- ============================================
-- 10. ROLES
-- User roles for RBAC
-- ============================================

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

-- ============================================
-- 11. USER_ROLES
-- Junction table for user-role assignments
-- ============================================

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    PRIMARY KEY (user_id, role_id)
);

COMMENT ON TABLE user_roles IS 'Junction table for user-role assignments';

-- ============================================
-- ROW LEVEL SECURITY (RLS) - ENABLE ALL TABLES
-- ============================================

ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - Allow all for development
-- ============================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow_all" ON manufacturers;
DROP POLICY IF EXISTS "Allow_all" ON suppliers;
DROP POLICY IF EXISTS "Allow_all" ON locations;
DROP POLICY IF EXISTS "Allow_all" ON customers;
DROP POLICY IF EXISTS "Allow_all" ON categories;
DROP POLICY IF EXISTS "Allow_all" ON products;
DROP POLICY IF EXISTS "Allow_all" ON orders;
DROP POLICY IF EXISTS "Allow_all" ON order_items;
DROP POLICY IF EXISTS "Allow_all" ON purchase_orders;
DROP POLICY IF EXISTS "Allow_all" ON purchase_order_items;
DROP POLICY IF EXISTS "Allow_all" ON stock_adjustments;
DROP POLICY IF EXISTS "Allow_all" ON roles;
DROP POLICY IF EXISTS "Allow_all" ON user_roles;

-- Create Allow_all policies for each table
CREATE POLICY "Allow_all" ON manufacturers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow_all" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow_all" ON locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow_all" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow_all" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow_all" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow_all" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow_all" ON order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow_all" ON purchase_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow_all" ON purchase_order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow_all" ON stock_adjustments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow_all" ON roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow_all" ON user_roles FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- INDEXES - For legacy_id columns
-- ============================================

CREATE INDEX IF NOT EXISTS idx_manufacturers_legacy_id ON manufacturers(legacy_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_legacy_id ON suppliers(legacy_id);
CREATE INDEX IF NOT EXISTS idx_locations_legacy_id ON locations(legacy_id);
CREATE INDEX IF NOT EXISTS idx_customers_legacy_id ON customers(legacy_id);
CREATE INDEX IF NOT EXISTS idx_products_legacy_id ON products(legacy_id);
CREATE INDEX IF NOT EXISTS idx_orders_legacy_id ON orders(legacy_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_legacy_id ON purchase_orders(legacy_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_legacy_id ON stock_adjustments(legacy_id);

-- Additional useful indexes
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_manufacturer ON products(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);

CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po_id ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_product ON purchase_order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_stock_adjustments_product ON stock_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_user ON stock_adjustments(user_id);

CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(type);
CREATE INDEX IF NOT EXISTS idx_locations_is_active ON locations(is_active);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company_name);

CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- ============================================
-- DEFAULT ROLES INSERT
-- ============================================

INSERT INTO roles (name, description, permissions) VALUES
    ('admin', 'Главный Администратор', '["all"]'::jsonb),
    ('manager', 'Менеджер', '["products:view","products:edit","orders:view","orders:edit","customers:view","customers:edit","purchase_orders:view","purchase_orders:edit"]'::jsonb),
    ('seller', 'Продавец', '["products:view","orders:view","orders:create","customers:view"]'::jsonb),
    ('warehouse', 'Кладовщик', '["products:view","inventory:view","inventory:edit","stock_adjustments:view","stock_adjustments:create"]'::jsonb),
    ('viewer', 'Только просмотр', '["products:view","orders:view","customers:view"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- TRIGGER FUNCTION FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers for relevant tables
DROP TRIGGER IF EXISTS update_manufacturers_updated_at ON manufacturers;
CREATE TRIGGER update_manufacturers_updated_at
    BEFORE UPDATE ON manufacturers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON purchase_orders;
CREATE TRIGGER update_purchase_orders_updated_at
    BEFORE UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION SELECT
-- ============================================

SELECT 
    'Tables created successfully' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'manufacturers') as manufacturers_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'suppliers') as suppliers_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'locations') as locations_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customers') as customers_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') as products_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') as orders_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'purchase_orders') as purchase_orders_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'purchase_order_items') as purchase_order_items_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stock_adjustments') as stock_adjustments_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'roles') as roles_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') as user_roles_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories') as categories_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_items') as order_items_exists,
    (SELECT COUNT(*) FROM roles) as roles_count;
