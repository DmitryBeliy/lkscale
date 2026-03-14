-- ============================================================================
-- LKSCALE ERP - COMPLETE DATABASE SCHEMA
-- Migration: 08_create_all_tables_final.sql
-- Description: Creates all ERP tables from scratch with proper dependencies
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- STEP 1: DROP EXISTING TABLES (in reverse dependency order)
-- ============================================================================

DROP TABLE IF EXISTS user_activity_logs CASCADE;
DROP TABLE IF EXISTS write_offs CASCADE;
DROP TABLE IF EXISTS product_locations CASCADE;
DROP TABLE IF EXISTS consignment_note_products CASCADE;
DROP TABLE IF EXISTS consignment_notes CASCADE;
DROP TABLE IF EXISTS outlets CASCADE;
DROP TABLE IF EXISTS product_suppliers CASCADE;
DROP TABLE IF EXISTS stock_adjustments CASCADE;
DROP TABLE IF EXISTS purchase_order_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS manufacturers CASCADE;

-- ============================================================================
-- STEP 2: CREATE TABLES (in dependency order - independent tables first)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. MANUFACTURERS - No dependencies
-- ----------------------------------------------------------------------------
CREATE TABLE manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    website TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE manufacturers IS 'Product manufacturers/brands';
COMMENT ON COLUMN manufacturers.legacy_id IS 'Original ID from legacy system for migration tracking';

-- ----------------------------------------------------------------------------
-- 2. SUPPLIERS - No dependencies
-- ----------------------------------------------------------------------------
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    website TEXT,
    notes TEXT,
    payment_terms TEXT,
    lead_time_days INTEGER DEFAULT 0,
    rating DECIMAL(3,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE suppliers IS 'Product suppliers and vendors';
COMMENT ON COLUMN suppliers.legacy_id IS 'Original ID from legacy system for migration tracking';

-- ----------------------------------------------------------------------------
-- 3. LOCATIONS - No dependencies
-- ----------------------------------------------------------------------------
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'warehouse' CHECK (type IN ('warehouse', 'store', 'office', 'other')),
    address TEXT,
    phone TEXT,
    email TEXT,
    manager_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE locations IS 'Warehouses, stores, and office locations';
COMMENT ON COLUMN locations.legacy_id IS 'Original ID from legacy system for migration tracking';

-- ----------------------------------------------------------------------------
-- 4. CUSTOMERS - No dependencies
-- ----------------------------------------------------------------------------
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    company TEXT,
    notes TEXT,
    avatar_url TEXT,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    average_check DECIMAL(10,2),
    last_order_date TIMESTAMP WITH TIME ZONE,
    top_categories TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE customers IS 'Customer information and purchase history';
COMMENT ON COLUMN customers.legacy_id IS 'Original ID from legacy system for migration tracking';

-- ----------------------------------------------------------------------------
-- 5. CATEGORIES - No dependencies
-- ----------------------------------------------------------------------------
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE categories IS 'Product categories and subcategories';
COMMENT ON COLUMN categories.legacy_id IS 'Original ID from legacy system for migration tracking';

-- ----------------------------------------------------------------------------
-- 6. PRODUCTS - Depends on: manufacturers, suppliers, categories
-- ----------------------------------------------------------------------------
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    barcode TEXT,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    cost_price DECIMAL(10,2) DEFAULT 0,
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    category TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE SET NULL,
    image_url TEXT,
    images TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    attributes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE products IS 'Product catalog with inventory tracking';
COMMENT ON COLUMN products.legacy_id IS 'Original ID from legacy system for migration tracking';
COMMENT ON COLUMN products.sku IS 'Stock Keeping Unit - unique product identifier';
COMMENT ON COLUMN products.barcode IS 'EAN/UPC barcode for scanning';

-- ----------------------------------------------------------------------------
-- 7. ORDERS - Depends on: customers
-- ----------------------------------------------------------------------------
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    total_amount DECIMAL(12,2) DEFAULT 0,
    items_count INTEGER DEFAULT 0,
    customer_name TEXT,
    customer_phone TEXT,
    customer_address TEXT,
    payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'transfer', 'online')),
    notes TEXT,
    items JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE orders IS 'Customer sales orders';
COMMENT ON COLUMN orders.legacy_id IS 'Original ID from legacy system for migration tracking';
COMMENT ON COLUMN orders.items IS 'JSONB backup of order items for historical reference';

-- ----------------------------------------------------------------------------
-- 8. ORDER_ITEMS - Depends on: orders, products
-- ----------------------------------------------------------------------------
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_sku TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE order_items IS 'Individual line items for each order';
COMMENT ON COLUMN order_items.legacy_id IS 'Original ID from legacy system for migration tracking';

-- ----------------------------------------------------------------------------
-- 9. PURCHASE_ORDERS - Depends on: suppliers
-- ----------------------------------------------------------------------------
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    order_number TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'ordered', 'partial', 'received', 'cancelled')),
    total_amount DECIMAL(12,2) DEFAULT 0,
    total_items INTEGER DEFAULT 0,
    notes TEXT,
    expected_date TIMESTAMP WITH TIME ZONE,
    received_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE purchase_orders IS 'Purchase orders to suppliers';
COMMENT ON COLUMN purchase_orders.legacy_id IS 'Original ID from legacy system for migration tracking';

-- ----------------------------------------------------------------------------
-- 10. PURCHASE_ORDER_ITEMS - Depends on: purchase_orders, products
-- ----------------------------------------------------------------------------
CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_sku TEXT,
    quantity_ordered INTEGER NOT NULL DEFAULT 1,
    quantity_received INTEGER DEFAULT 0,
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_cost DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE purchase_order_items IS 'Line items for purchase orders';
COMMENT ON COLUMN purchase_order_items.legacy_id IS 'Original ID from legacy system for migration tracking';

-- ----------------------------------------------------------------------------
-- 11. STOCK_ADJUSTMENTS - Depends on: products
-- ----------------------------------------------------------------------------
CREATE TABLE stock_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_sku TEXT,
    adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('write_off', 'damage', 'theft', 'count', 'return', 'transfer_in', 'transfer_out', 'other')),
    quantity_change INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL DEFAULT 0,
    new_stock INTEGER NOT NULL DEFAULT 0,
    unit_cost DECIMAL(10,2),
    total_value DECIMAL(10,2),
    reason TEXT,
    reference_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE stock_adjustments IS 'Inventory adjustments and stock movements';
COMMENT ON COLUMN stock_adjustments.legacy_id IS 'Original ID from legacy system for migration tracking';

-- ----------------------------------------------------------------------------
-- 12. ROLES - No dependencies
-- ----------------------------------------------------------------------------
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE roles IS 'User roles for access control';
COMMENT ON COLUMN roles.is_system IS 'System roles cannot be deleted or renamed';

-- ----------------------------------------------------------------------------
-- 13. USER_ROLES - Depends on: roles, auth.users
-- ----------------------------------------------------------------------------
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

COMMENT ON TABLE user_roles IS 'Many-to-many relationship between users and roles';

-- ============================================================================
-- STEP 3: ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

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

-- ============================================================================
-- STEP 4: CREATE PERMISSIVE POLICIES
-- ============================================================================

-- Manufacturers
CREATE POLICY "manufacturers_all_access" ON manufacturers FOR ALL USING (true) WITH CHECK (true);

-- Suppliers
CREATE POLICY "suppliers_all_access" ON suppliers FOR ALL USING (true) WITH CHECK (true);

-- Locations
CREATE POLICY "locations_all_access" ON locations FOR ALL USING (true) WITH CHECK (true);

-- Customers
CREATE POLICY "customers_all_access" ON customers FOR ALL USING (true) WITH CHECK (true);

-- Categories
CREATE POLICY "categories_all_access" ON categories FOR ALL USING (true) WITH CHECK (true);

-- Products
CREATE POLICY "products_all_access" ON products FOR ALL USING (true) WITH CHECK (true);

-- Orders
CREATE POLICY "orders_all_access" ON orders FOR ALL USING (true) WITH CHECK (true);

-- Order Items
CREATE POLICY "order_items_all_access" ON order_items FOR ALL USING (true) WITH CHECK (true);

-- Purchase Orders
CREATE POLICY "purchase_orders_all_access" ON purchase_orders FOR ALL USING (true) WITH CHECK (true);

-- Purchase Order Items
CREATE POLICY "purchase_order_items_all_access" ON purchase_order_items FOR ALL USING (true) WITH CHECK (true);

-- Stock Adjustments
CREATE POLICY "stock_adjustments_all_access" ON stock_adjustments FOR ALL USING (true) WITH CHECK (true);

-- Roles
CREATE POLICY "roles_all_access" ON roles FOR ALL USING (true) WITH CHECK (true);

-- User Roles
CREATE POLICY "user_roles_all_access" ON user_roles FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- STEP 5: CREATE INDEXES ON LEGACY_ID COLUMNS (for migration performance)
-- ============================================================================

CREATE INDEX idx_manufacturers_legacy_id ON manufacturers(legacy_id);
CREATE INDEX idx_suppliers_legacy_id ON suppliers(legacy_id);
CREATE INDEX idx_locations_legacy_id ON locations(legacy_id);
CREATE INDEX idx_customers_legacy_id ON customers(legacy_id);
CREATE INDEX idx_categories_legacy_id ON categories(legacy_id);
CREATE INDEX idx_products_legacy_id ON products(legacy_id);
CREATE INDEX idx_orders_legacy_id ON orders(legacy_id);
CREATE INDEX idx_order_items_legacy_id ON order_items(legacy_id);
CREATE INDEX idx_purchase_orders_legacy_id ON purchase_orders(legacy_id);
CREATE INDEX idx_purchase_order_items_legacy_id ON purchase_order_items(legacy_id);
CREATE INDEX idx_stock_adjustments_legacy_id ON stock_adjustments(legacy_id);

-- ============================================================================
-- STEP 6: CREATE ADDITIONAL USEFUL INDEXES
-- ============================================================================

-- Foreign key indexes for performance
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_manufacturer_id ON products(manufacturer_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_stock_adjustments_product_id ON stock_adjustments(product_id);

-- Search indexes
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_purchase_orders_order_number ON purchase_orders(order_number);

-- ============================================================================
-- STEP 7: INSERT DEFAULT ROLES
-- ============================================================================

INSERT INTO roles (name, description, is_system, permissions) VALUES
('admin', 'Full system access - can manage all settings and data', TRUE, '{
    "canCreateOrders": true,
    "canEditOrders": true,
    "canDeleteOrders": true,
    "canViewAllOrders": true,
    "canManageProducts": true,
    "canEditPrices": true,
    "canAdjustStock": true,
    "canViewCustomers": true,
    "canEditCustomers": true,
    "canViewReports": true,
    "canManageCoupons": true,
    "canViewActivityLog": true,
    "canManageUsers": true,
    "canManageSettings": true
}'::jsonb),

('cashier', 'Can create and edit orders, view customers', TRUE, '{
    "canCreateOrders": true,
    "canEditOrders": true,
    "canDeleteOrders": false,
    "canViewAllOrders": false,
    "canManageProducts": false,
    "canEditPrices": false,
    "canAdjustStock": false,
    "canViewCustomers": true,
    "canEditCustomers": false,
    "canViewReports": false,
    "canManageCoupons": false,
    "canViewActivityLog": false,
    "canManageUsers": false,
    "canManageSettings": false
}'::jsonb),

('stock_manager', 'Can manage inventory, products, and view reports', TRUE, '{
    "canCreateOrders": false,
    "canEditOrders": false,
    "canDeleteOrders": false,
    "canViewAllOrders": false,
    "canManageProducts": true,
    "canEditPrices": false,
    "canAdjustStock": true,
    "canViewCustomers": false,
    "canEditCustomers": false,
    "canViewReports": true,
    "canManageCoupons": false,
    "canViewActivityLog": false,
    "canManageUsers": false,
    "canManageSettings": false
}'::jsonb),

('manager', 'Can manage orders, products, customers, and view reports', TRUE, '{
    "canCreateOrders": true,
    "canEditOrders": true,
    "canDeleteOrders": true,
    "canViewAllOrders": true,
    "canManageProducts": true,
    "canEditPrices": true,
    "canAdjustStock": true,
    "canViewCustomers": true,
    "canEditCustomers": true,
    "canViewReports": true,
    "canManageCoupons": true,
    "canViewActivityLog": true,
    "canManageUsers": false,
    "canManageSettings": false
}'::jsonb);

-- ============================================================================
-- STEP 8: CREATE TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_manufacturers_updated_at BEFORE UPDATE ON manufacturers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

SELECT 'Migration 08_create_all_tables_final completed successfully!' as status;
