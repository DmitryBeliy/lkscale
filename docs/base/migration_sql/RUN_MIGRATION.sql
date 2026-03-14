-- ============================================
-- RUN_MIGRATION.sql
-- Comprehensive Migration Script for MagGaz to LkScale
-- This script is idempotent - safe to run multiple times
-- Generated: 2026-03-14
-- ============================================

-- ============================================
-- SECTION 1: PRE-MIGRATION CHECKS
-- Verify existing tables and required extensions
-- ============================================

-- Enable UUID extension (required for gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Check if we're starting fresh or migrating existing data
DO $$
BEGIN
    RAISE NOTICE 'Starting migration check at %', NOW();
    
    -- Check for auth.users table (required for foreign keys)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'auth' AND table_name = 'users'
    ) THEN
        RAISE WARNING 'auth.users table not found. Some foreign keys may fail if auth schema is not set up.';
    END IF;
    
    RAISE NOTICE 'Pre-migration checks completed.';
END $$;

-- ============================================
-- SECTION 2: CREATE MISSING TABLES
-- Tables are created in dependency order
-- ============================================

-- --------------------------------------------
-- 2.1 MANUFACTURERS
-- Base table for product manufacturers
-- Legacy system: 64 manufacturers
-- --------------------------------------------

-- Create manufacturers table if not exists
CREATE TABLE IF NOT EXISTS manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    website TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add legacy_id column for migration mapping (idempotent)
ALTER TABLE manufacturers 
    ADD COLUMN IF NOT EXISTS legacy_id INTEGER UNIQUE,
    ADD COLUMN IF NOT EXISTS country TEXT,
    ADD COLUMN IF NOT EXISTS email TEXT;

COMMENT ON TABLE manufacturers IS 'Product manufacturers. Populated from dbo_Manufacturer.json (64 manufacturers like Baxi, Vaillant, etc.)';
COMMENT ON COLUMN manufacturers.legacy_id IS 'Original ID from old system for migration mapping';

-- --------------------------------------------
-- 2.2 LOCATIONS
-- Warehouses and shops where inventory is stored
-- Legacy system: 9 locations
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,
    name TEXT NOT NULL,
    type INTEGER NOT NULL DEFAULT 1,  -- 1=Warehouse, 2=Shop, 3=Other
    address TEXT,
    phone TEXT,
    email TEXT,
    manager_name TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE locations IS 'Warehouses and shops where inventory is stored. Populated from dbo_Location.json (9 locations)';
COMMENT ON COLUMN locations.type IS 'Location type: 1=Warehouse, 2=Shop, 3=Other';

-- --------------------------------------------
-- 2.3 OUTLETS
-- Sales channels/outlets
-- Legacy system: 3 outlets (physical store, website, Yandex.Market)
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS outlets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,
    name TEXT NOT NULL,
    type INTEGER NOT NULL DEFAULT 1,  -- 1=Physical Store, 2=Website, 3=Marketplace
    description TEXT,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE outlets IS 'Sales channels/outlets. Populated from dbo_Outlet.json (3 outlets)';
COMMENT ON COLUMN outlets.type IS 'Outlet type: 1=Physical Store, 2=Website, 3=Marketplace';

-- --------------------------------------------
-- 2.4 SUPPLIERS (if not exists)
-- Required for consignment notes foreign key
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    website TEXT,
    notes TEXT,
    payment_terms TEXT,
    lead_time_days INTEGER,
    rating INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add legacy_id for migration if not exists
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS legacy_id INTEGER UNIQUE;

COMMENT ON TABLE suppliers IS 'Product suppliers. Populated from dbo_Supplier.json';
COMMENT ON COLUMN suppliers.legacy_id IS 'Original ID from old system for migration mapping';

-- --------------------------------------------
-- 2.5 PRODUCTS (if not exists)
-- Required for foreign keys
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    barcode TEXT,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    purchase_price DECIMAL(10,2) DEFAULT 0,
    cost_price DECIMAL(10,2) DEFAULT 0,
    compare_at_price DECIMAL(10,2) DEFAULT 0,
    quantity INTEGER DEFAULT 0,
    stock INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    category TEXT,
    category_id UUID,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE SET NULL,
    unit TEXT DEFAULT 'шт',
    image_url TEXT,
    images JSONB,
    has_variants BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    seo_title TEXT,
    seo_description TEXT,
    slug TEXT,
    tags JSONB,
    attributes JSONB,
    metadata JSONB DEFAULT '{}',
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add legacy_id for migration if not exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS legacy_id INTEGER UNIQUE;

COMMENT ON TABLE products IS 'Product catalog. Populated from dbo_Product.json';
COMMENT ON COLUMN products.legacy_id IS 'Original ProductId from old system for migration mapping';

-- --------------------------------------------
-- 2.6 CONSIGNMENT NOTES
-- Purchase receipts from suppliers
-- Legacy system: 976 records
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS consignment_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,
    supplier_id INTEGER,
    supplier_uuid UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    note_number TEXT,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_owner_balance BOOLEAN DEFAULT FALSE,
    total_amount DECIMAL(12,2) DEFAULT 0,
    status TEXT DEFAULT 'received',
    notes TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE consignment_notes IS 'Purchase receipts/consignment notes from suppliers. Populated from dbo_ConsignmentNote.json (976 records)';
COMMENT ON COLUMN consignment_notes.is_owner_balance IS 'If TRUE, goods are on consignment (not paid until sold)';
COMMENT ON COLUMN consignment_notes.legacy_id IS 'Original ConsignmentNoteId from old system';
COMMENT ON COLUMN consignment_notes.status IS 'Status: received, processed, cancelled, archived';

-- --------------------------------------------
-- 2.7 CONSIGNMENT NOTE PRODUCTS
-- Individual items in each consignment note
-- Legacy system: 1973 records
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS consignment_note_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,
    consignment_note_id INTEGER,
    consignment_note_uuid UUID REFERENCES consignment_notes(id) ON DELETE CASCADE,
    product_id INTEGER,
    product_uuid UUID REFERENCES products(id) ON DELETE SET NULL,
    purchase_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    count INTEGER NOT NULL DEFAULT 0,
    start_location_id INTEGER,
    start_location_uuid UUID REFERENCES locations(id) ON DELETE SET NULL,
    sold_count INTEGER DEFAULT 0,
    received_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE consignment_note_products IS 'Individual line items in consignment notes. Populated from dbo_ConsignmentNoteProduct.json (1973 records)';
COMMENT ON COLUMN consignment_note_products.purchase_price IS 'Purchase/cost price per unit at time of receipt';
COMMENT ON COLUMN consignment_note_products.count IS 'Total quantity received';
COMMENT ON COLUMN consignment_note_products.sold_count IS 'Quantity already sold from this batch';
COMMENT ON COLUMN consignment_note_products.legacy_id IS 'Original ConsignmentNoteProductId from old system';

-- --------------------------------------------
-- 2.8 PRODUCT LOCATIONS
-- Current inventory quantities by location
-- Legacy system: 1080 records
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS product_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,
    product_id INTEGER,
    product_uuid UUID REFERENCES products(id) ON DELETE CASCADE,
    location_id INTEGER,
    location_uuid UUID REFERENCES locations(id) ON DELETE CASCADE,
    count INTEGER NOT NULL DEFAULT 0,
    storage_cell TEXT,
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER DEFAULT 0,
    last_counted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_uuid, location_uuid, COALESCE(storage_cell, ''))
);

COMMENT ON TABLE product_locations IS 'Current inventory quantities by location. Populated from dbo_ProductLocation.json (1080 records)';
COMMENT ON COLUMN product_locations.storage_cell IS 'Specific storage cell/shelf code (e.g., "С", "О4")';
COMMENT ON COLUMN product_locations.legacy_id IS 'Original ProductLocationId from old system';

-- --------------------------------------------
-- 2.9 WRITE OFFS
-- Inventory write-offs for damaged, expired, or lost goods
-- Legacy system: 246 records
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS write_offs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,
    product_id INTEGER,
    product_uuid UUID REFERENCES products(id) ON DELETE SET NULL,
    count INTEGER NOT NULL DEFAULT 0,
    purchase_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    consignment_note_id INTEGER,
    consignment_note_uuid UUID REFERENCES consignment_notes(id) ON DELETE SET NULL,
    type INTEGER NOT NULL DEFAULT 1,
    reason TEXT,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE write_offs IS 'Inventory write-offs for damaged, expired, or lost goods. Populated from dbo_WriteOff.json (246 records)';
COMMENT ON COLUMN write_offs.type IS 'Write-off type: 1=Damage, 2=Expiration, 3=Loss, 4=Other';
COMMENT ON COLUMN write_offs.purchase_price IS 'Cost price at time of write-off (for COGS calculation)';
COMMENT ON COLUMN write_offs.legacy_id IS 'Original WriteOffId from old system';

-- --------------------------------------------
-- 2.10 USER ACTIVITY LOGS
-- Audit trail of user actions
-- Legacy system: 10192 records
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,
    username TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    operation TEXT NOT NULL,
    entity_type TEXT,
    entity_id INTEGER,
    entity_uuid UUID,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL,
    data JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE user_activity_logs IS 'Audit trail of user actions. Populated from dbo_UserActivityLog.json (10192 records)';
COMMENT ON COLUMN user_activity_logs.operation IS 'Operation type: CreatedProduct, EditProduct, DeletedProduct, etc.';
COMMENT ON COLUMN user_activity_logs.data IS 'Full JSON snapshot of the entity state at time of operation';
COMMENT ON COLUMN user_activity_logs.legacy_id IS 'Original UserActivityLogId from old system';

-- --------------------------------------------
-- 2.11 MIGRATION STATUS
-- Track migration progress for each table
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS migration_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL UNIQUE,
    legacy_count INTEGER,
    migrated_count INTEGER DEFAULT 0,
    last_migrated_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE migration_status IS 'Tracks migration progress for each table from old system';
COMMENT ON COLUMN migration_status.status IS 'Status: pending, in_progress, completed, failed';

-- Initialize migration status records
INSERT INTO migration_status (table_name, legacy_count, status) VALUES
    ('manufacturers', 64, 'pending'),
    ('locations', 9, 'pending'),
    ('outlets', 3, 'pending'),
    ('suppliers', 56, 'pending'),
    ('products', 745, 'pending'),
    ('consignment_notes', 976, 'pending'),
    ('consignment_note_products', 1973, 'pending'),
    ('product_locations', 1080, 'pending'),
    ('write_offs', 246, 'pending'),
    ('user_activity_logs', 10192, 'pending')
ON CONFLICT (table_name) DO NOTHING;

-- ============================================
-- SECTION 3: CREATE INDEXES
-- Performance optimization for queries
-- ============================================

-- Manufacturers indexes
CREATE INDEX IF NOT EXISTS idx_manufacturers_legacy_id ON manufacturers(legacy_id);
CREATE INDEX IF NOT EXISTS idx_manufacturers_is_active ON manufacturers(is_active);
CREATE INDEX IF NOT EXISTS idx_manufacturers_name ON manufacturers(name);

-- Locations indexes
CREATE INDEX IF NOT EXISTS idx_locations_legacy_id ON locations(legacy_id);
CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(type);
CREATE INDEX IF NOT EXISTS idx_locations_is_active ON locations(is_active);

-- Outlets indexes
CREATE INDEX IF NOT EXISTS idx_outlets_legacy_id ON outlets(legacy_id);
CREATE INDEX IF NOT EXISTS idx_outlets_type ON outlets(type);
CREATE INDEX IF NOT EXISTS idx_outlets_is_active ON outlets(is_active);

-- Suppliers indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_legacy_id ON suppliers(legacy_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON suppliers(is_active);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_legacy_id ON products(legacy_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_manufacturer_id ON products(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at) WHERE deleted_at IS NULL;

-- Consignment notes indexes
CREATE INDEX IF NOT EXISTS idx_consignment_notes_legacy_id ON consignment_notes(legacy_id);
CREATE INDEX IF NOT EXISTS idx_consignment_notes_supplier_id ON consignment_notes(supplier_id);
CREATE INDEX IF NOT EXISTS idx_consignment_notes_supplier_uuid ON consignment_notes(supplier_uuid);
CREATE INDEX IF NOT EXISTS idx_consignment_notes_created_date ON consignment_notes(created_date);
CREATE INDEX IF NOT EXISTS idx_consignment_notes_status ON consignment_notes(status);
CREATE INDEX IF NOT EXISTS idx_consignment_notes_user_id ON consignment_notes(user_id);

-- Consignment note products indexes
CREATE INDEX IF NOT EXISTS idx_consignment_note_products_legacy_id ON consignment_note_products(legacy_id);
CREATE INDEX IF NOT EXISTS idx_consignment_note_products_note_id ON consignment_note_products(consignment_note_id);
CREATE INDEX IF NOT EXISTS idx_consignment_note_products_note_uuid ON consignment_note_products(consignment_note_uuid);
CREATE INDEX IF NOT EXISTS idx_consignment_note_products_product_id ON consignment_note_products(product_id);
CREATE INDEX IF NOT EXISTS idx_consignment_note_products_product_uuid ON consignment_note_products(product_uuid);
CREATE INDEX IF NOT EXISTS idx_consignment_note_products_location_id ON consignment_note_products(start_location_id);
CREATE INDEX IF NOT EXISTS idx_consignment_note_products_received_date ON consignment_note_products(received_date);

-- Product locations indexes
CREATE INDEX IF NOT EXISTS idx_product_locations_legacy_id ON product_locations(legacy_id);
CREATE INDEX IF NOT EXISTS idx_product_locations_product_id ON product_locations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_locations_product_uuid ON product_locations(product_uuid);
CREATE INDEX IF NOT EXISTS idx_product_locations_location_id ON product_locations(location_id);
CREATE INDEX IF NOT EXISTS idx_product_locations_location_uuid ON product_locations(location_uuid);
CREATE INDEX IF NOT EXISTS idx_product_locations_storage_cell ON product_locations(storage_cell);
CREATE INDEX IF NOT EXISTS idx_product_locations_count ON product_locations(count) WHERE count > 0;

-- Write offs indexes
CREATE INDEX IF NOT EXISTS idx_write_offs_legacy_id ON write_offs(legacy_id);
CREATE INDEX IF NOT EXISTS idx_write_offs_product_id ON write_offs(product_id);
CREATE INDEX IF NOT EXISTS idx_write_offs_product_uuid ON write_offs(product_uuid);
CREATE INDEX IF NOT EXISTS idx_write_offs_consignment_note_id ON write_offs(consignment_note_id);
CREATE INDEX IF NOT EXISTS idx_write_offs_consignment_note_uuid ON write_offs(consignment_note_uuid);
CREATE INDEX IF NOT EXISTS idx_write_offs_type ON write_offs(type);
CREATE INDEX IF NOT EXISTS idx_write_offs_created_date ON write_offs(created_date);
CREATE INDEX IF NOT EXISTS idx_write_offs_user_id ON write_offs(user_id);

-- User activity logs indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_legacy_id ON user_activity_logs(legacy_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_username ON user_activity_logs(username);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_operation ON user_activity_logs(operation);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_entity_type ON user_activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_entity_id ON user_activity_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_entity_uuid ON user_activity_logs(entity_uuid);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_date ON user_activity_logs(created_date);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_data ON user_activity_logs USING GIN(data jsonb_path_ops);

-- ============================================
-- SECTION 4: ENABLE ROW LEVEL SECURITY
-- Security policies for multi-tenant access
-- ============================================

-- Enable RLS on all tables
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE consignment_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE consignment_note_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE write_offs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE migration_status ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean slate (idempotent)
DROP POLICY IF EXISTS "Manufacturers are readable by authenticated" ON manufacturers;
DROP POLICY IF EXISTS "Manufacturers are manageable by admins" ON manufacturers;
DROP POLICY IF EXISTS "Suppliers are readable by authenticated" ON suppliers;
DROP POLICY IF EXISTS "Suppliers are manageable by admins" ON suppliers;
DROP POLICY IF EXISTS "Products readable by owner" ON products;
DROP POLICY IF EXISTS "Products manageable by owner" ON products;
DROP POLICY IF EXISTS "Locations are readable by authenticated" ON locations;
DROP POLICY IF EXISTS "Locations are manageable by admins" ON locations;
DROP POLICY IF EXISTS "Outlets are readable by authenticated" ON outlets;
DROP POLICY IF EXISTS "Outlets are manageable by admins" ON outlets;
DROP POLICY IF EXISTS "Consignment notes viewable by authenticated" ON consignment_notes;
DROP POLICY IF EXISTS "Consignment notes manageable by owner or admin" ON consignment_notes;
DROP POLICY IF EXISTS "Consignment note products viewable by authenticated" ON consignment_note_products;
DROP POLICY IF EXISTS "Product locations viewable by authenticated" ON product_locations;
DROP POLICY IF EXISTS "Write offs viewable by authenticated" ON write_offs;
DROP POLICY IF EXISTS "User activity logs viewable by own user" ON user_activity_logs;
DROP POLICY IF EXISTS "User activity logs viewable by admins" ON user_activity_logs;
DROP POLICY IF EXISTS "Migration status viewable by admins" ON migration_status;

-- Manufacturers policies
CREATE POLICY "Manufacturers are readable by authenticated" ON manufacturers
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Manufacturers are manageable by admins" ON manufacturers
    FOR ALL TO authenticated 
    USING (COALESCE((SELECT role FROM users WHERE id = auth.uid()), 'user') = 'admin')
    WITH CHECK (COALESCE((SELECT role FROM users WHERE id = auth.uid()), 'user') = 'admin');

-- Suppliers policies
CREATE POLICY "Suppliers are readable by authenticated" ON suppliers
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Suppliers are manageable by admins" ON suppliers
    FOR ALL TO authenticated 
    USING (COALESCE((SELECT role FROM users WHERE id = auth.uid()), 'user') = 'admin')
    WITH CHECK (COALESCE((SELECT role FROM users WHERE id = auth.uid()), 'user') = 'admin');

-- Products policies
CREATE POLICY "Products readable by owner" ON products
    FOR SELECT TO authenticated USING (user_id = auth.uid() OR auth.uid() IS NULL);

CREATE POLICY "Products manageable by owner" ON products
    FOR ALL TO authenticated 
    USING (user_id = auth.uid() OR auth.uid() IS NULL)
    WITH CHECK (user_id = auth.uid() OR auth.uid() IS NULL);

-- Locations policies
CREATE POLICY "Locations are readable by authenticated" ON locations
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Locations are manageable by admins" ON locations
    FOR ALL TO authenticated 
    USING (COALESCE((SELECT role FROM users WHERE id = auth.uid()), 'user') = 'admin')
    WITH CHECK (COALESCE((SELECT role FROM users WHERE id = auth.uid()), 'user') = 'admin');

-- Outlets policies
CREATE POLICY "Outlets are readable by authenticated" ON outlets
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Outlets are manageable by admins" ON outlets
    FOR ALL TO authenticated 
    USING (COALESCE((SELECT role FROM users WHERE id = auth.uid()), 'user') = 'admin')
    WITH CHECK (COALESCE((SELECT role FROM users WHERE id = auth.uid()), 'user') = 'admin');

-- Consignment notes policies
CREATE POLICY "Consignment notes viewable by authenticated" ON consignment_notes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Consignment notes manageable by owner or admin" ON consignment_notes
    FOR ALL TO authenticated 
    USING (user_id = auth.uid() OR COALESCE((SELECT role FROM users WHERE id = auth.uid()), 'user') = 'admin')
    WITH CHECK (user_id = auth.uid() OR COALESCE((SELECT role FROM users WHERE id = auth.uid()), 'user') = 'admin');

-- Consignment note products policies
CREATE POLICY "Consignment note products viewable by authenticated" ON consignment_note_products
    FOR SELECT TO authenticated USING (true);

-- Product locations policies
CREATE POLICY "Product locations viewable by authenticated" ON product_locations
    FOR SELECT TO authenticated USING (true);

-- Write offs policies
CREATE POLICY "Write offs viewable by authenticated" ON write_offs
    FOR SELECT TO authenticated USING (true);

-- User activity logs policies
CREATE POLICY "User activity logs viewable by own user" ON user_activity_logs
    FOR SELECT TO authenticated 
    USING (user_id = auth.uid());

CREATE POLICY "User activity logs viewable by admins" ON user_activity_logs
    FOR ALL TO authenticated 
    USING (COALESCE((SELECT role FROM users WHERE id = auth.uid()), 'user') = 'admin');

-- Migration status policies
CREATE POLICY "Migration status viewable by admins" ON migration_status
    FOR ALL TO authenticated 
    USING (COALESCE((SELECT role FROM users WHERE id = auth.uid()), 'user') = 'admin');

-- ============================================
-- SECTION 5: CREATE HELPER VIEWS
-- Pre-built queries for common operations
-- ============================================

-- View: Current inventory by location with product details
CREATE OR REPLACE VIEW inventory_by_location AS
SELECT 
    pl.id,
    pl.product_uuid,
    p.name as product_name,
    p.sku as product_sku,
    p.barcode as product_barcode,
    m.name as manufacturer_name,
    pl.location_uuid,
    l.name as location_name,
    l.type as location_type,
    CASE l.type
        WHEN 1 THEN 'Warehouse'
        WHEN 2 THEN 'Shop'
        ELSE 'Other'
    END as location_type_name,
    pl.storage_cell,
    pl.count,
    pl.min_stock,
    pl.max_stock,
    pl.last_counted_at,
    pl.updated_at,
    -- Calculate stock status
    CASE 
        WHEN pl.count = 0 THEN 'out_of_stock'
        WHEN pl.min_stock > 0 AND pl.count <= pl.min_stock THEN 'low_stock'
        ELSE 'in_stock'
    END as stock_status
FROM product_locations pl
LEFT JOIN products p ON pl.product_uuid = p.id
LEFT JOIN manufacturers m ON p.manufacturer_id = m.id
LEFT JOIN locations l ON pl.location_uuid = l.id
WHERE pl.count > 0 OR pl.count IS NULL;

COMMENT ON VIEW inventory_by_location IS 'Current inventory quantities by location with product and location details';

-- View: Consignment note summary with totals
CREATE OR REPLACE VIEW consignment_note_summary AS
SELECT 
    cn.id,
    cn.legacy_id,
    cn.note_number,
    s.name as supplier_name,
    s.legacy_id as supplier_legacy_id,
    cn.created_date,
    cn.is_owner_balance,
    CASE WHEN cn.is_owner_balance THEN 'Consignment' ELSE 'Paid' END as balance_type,
    cn.status,
    cn.total_amount,
    cn.notes,
    COUNT(cnp.id) as total_items,
    SUM(cnp.count) as total_quantity,
    SUM(cnp.count * cnp.purchase_price) as calculated_total_cost,
    SUM(cnp.sold_count) as total_sold,
    SUM((cnp.count - COALESCE(cnp.sold_count, 0)) * cnp.purchase_price) as remaining_value,
    SUM(COALESCE(cnp.sold_count, 0) * cnp.purchase_price) as cogs_sold,
    cn.created_at,
    cn.updated_at
FROM consignment_notes cn
LEFT JOIN suppliers s ON cn.supplier_uuid = s.id
LEFT JOIN consignment_note_products cnp ON cn.id = cnp.consignment_note_uuid
GROUP BY cn.id, cn.legacy_id, cn.note_number, s.name, s.legacy_id, 
         cn.created_date, cn.is_owner_balance, cn.status, cn.total_amount, 
         cn.notes, cn.created_at, cn.updated_at;

COMMENT ON VIEW consignment_note_summary IS 'Consignment notes with aggregated product totals and values';

-- View: Write-off summary by type and period
CREATE OR REPLACE VIEW write_off_summary AS
SELECT 
    wo.type,
    CASE wo.type
        WHEN 1 THEN 'Damage'
        WHEN 2 THEN 'Expiration'
        WHEN 3 THEN 'Loss'
        ELSE 'Other'
    END as type_name,
    DATE_TRUNC('month', wo.created_date) as period,
    COUNT(*) as write_off_count,
    SUM(wo.count) as total_quantity,
    SUM(wo.count * wo.purchase_price) as total_value,
    AVG(wo.purchase_price) as avg_purchase_price,
    MIN(wo.created_date) as first_write_off,
    MAX(wo.created_date) as last_write_off
FROM write_offs wo
GROUP BY wo.type, DATE_TRUNC('month', wo.created_date)
ORDER BY period DESC, wo.type;

COMMENT ON VIEW write_off_summary IS 'Write-offs aggregated by type and month';

-- View: Low stock alert
CREATE OR REPLACE VIEW low_stock_alerts AS
SELECT 
    pl.id,
    pl.product_uuid,
    p.name as product_name,
    p.sku as product_sku,
    m.name as manufacturer_name,
    pl.location_uuid,
    l.name as location_name,
    pl.count as current_stock,
    pl.min_stock,
    pl.max_stock,
    CASE 
        WHEN pl.count = 0 THEN 'critical'
        WHEN pl.count <= pl.min_stock * 0.5 THEN 'urgent'
        ELSE 'warning'
    END as alert_level,
    (pl.min_stock - pl.count) as suggested_reorder_quantity
FROM product_locations pl
JOIN products p ON pl.product_uuid = p.id
LEFT JOIN manufacturers m ON p.manufacturer_id = m.id
JOIN locations l ON pl.location_uuid = l.id
WHERE pl.min_stock > 0 
  AND pl.count <= pl.min_stock
  AND p.is_active = true
ORDER BY alert_level, p.name;

COMMENT ON VIEW low_stock_alerts IS 'Products that are at or below minimum stock levels';

-- ============================================
-- SECTION 6: CREATE TRIGGERS
-- Auto-update updated_at timestamps
-- ============================================

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
DROP TRIGGER IF EXISTS update_manufacturers_updated_at ON manufacturers;
CREATE TRIGGER update_manufacturers_updated_at
    BEFORE UPDATE ON manufacturers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_outlets_updated_at ON outlets;
CREATE TRIGGER update_outlets_updated_at
    BEFORE UPDATE ON outlets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_consignment_notes_updated_at ON consignment_notes;
CREATE TRIGGER update_consignment_notes_updated_at
    BEFORE UPDATE ON consignment_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_consignment_note_products_updated_at ON consignment_note_products;
CREATE TRIGGER update_consignment_note_products_updated_at
    BEFORE UPDATE ON consignment_note_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_locations_updated_at ON product_locations;
CREATE TRIGGER update_product_locations_updated_at
    BEFORE UPDATE ON product_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_write_offs_updated_at ON write_offs;
CREATE TRIGGER update_write_offs_updated_at
    BEFORE UPDATE ON write_offs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_migration_status_updated_at ON migration_status;
CREATE TRIGGER update_migration_status_updated_at
    BEFORE UPDATE ON migration_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SECTION 7: VERIFICATION QUERIES
-- Check that migration was successful
-- ============================================

DO $$
DECLARE
    v_table_count INTEGER;
    v_rls_count INTEGER;
    v_index_count INTEGER;
    v_view_count INTEGER;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MIGRATION VERIFICATION REPORT';
    RAISE NOTICE '========================================';
    
    -- Count tables created
    SELECT COUNT(*) INTO v_table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'manufacturers', 'suppliers', 'products', 'locations', 
        'outlets', 'consignment_notes', 'consignment_note_products',
        'product_locations', 'write_offs', 'user_activity_logs', 
        'migration_status'
    );
    RAISE NOTICE 'Tables created: % / 11', v_table_count;
    
    -- Count RLS enabled tables
    SELECT COUNT(*) INTO v_rls_count
    FROM pg_tables 
    JOIN pg_class ON pg_tables.tablename = pg_class.relname
    WHERE pg_tables.schemaname = 'public'
    AND pg_tables.tablename IN (
        'manufacturers', 'suppliers', 'products', 'locations', 
        'outlets', 'consignment_notes', 'consignment_note_products',
        'product_locations', 'write_offs', 'user_activity_logs', 
        'migration_status'
    )
    AND pg_class.relrowsecurity = true;
    RAISE NOTICE 'Tables with RLS enabled: % / 11', v_rls_count;
    
    -- Count indexes
    SELECT COUNT(*) INTO v_index_count
    FROM pg_indexes 
    WHERE schemaname = 'public'
    AND tablename IN (
        'manufacturers', 'suppliers', 'products', 'locations', 
        'outlets', 'consignment_notes', 'consignment_note_products',
        'product_locations', 'write_offs', 'user_activity_logs', 
        'migration_status'
    );
    RAISE NOTICE 'Indexes created: %', v_index_count;
    
    -- Count views
    SELECT COUNT(*) INTO v_view_count
    FROM information_schema.views 
    WHERE table_schema = 'public'
    AND table_name IN ('inventory_by_location', 'consignment_note_summary', 'write_off_summary', 'low_stock_alerts');
    RAISE NOTICE 'Views created: % / 4', v_view_count;
    
    RAISE NOTICE '========================================';
    
    IF v_table_count = 11 AND v_rls_count = 11 THEN
        RAISE NOTICE 'MIGRATION VERIFICATION: PASSED';
    ELSE
        RAISE WARNING 'MIGRATION VERIFICATION: INCOMPLETE';
    END IF;
    
    RAISE NOTICE '========================================';
END $$;

-- ============================================
-- DETAILED VERIFICATION - Run these queries manually to verify:
-- ============================================

-- -- 1. Check all tables exist
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN (
--     'manufacturers', 'suppliers', 'products', 'locations', 
--     'outlets', 'consignment_notes', 'consignment_note_products',
--     'product_locations', 'write_offs', 'user_activity_logs', 
--     'migration_status'
-- )
-- ORDER BY table_name;

-- -- 2. Verify RLS is enabled
-- SELECT tablename, relrowsecurity as rls_enabled
-- FROM pg_tables 
-- JOIN pg_class ON pg_tables.tablename = pg_class.relname
-- WHERE pg_tables.schemaname = 'public'
-- AND pg_tables.tablename IN (
--     'manufacturers', 'suppliers', 'products', 'locations', 
--     'outlets', 'consignment_notes', 'consignment_note_products',
--     'product_locations', 'write_offs', 'user_activity_logs', 
--     'migration_status'
-- )
-- ORDER BY tablename;

-- -- 3. Count indexes per table
-- SELECT tablename, COUNT(*) as index_count
-- FROM pg_indexes 
-- WHERE schemaname = 'public'
-- GROUP BY tablename
-- ORDER BY tablename;

-- -- 4. Verify views exist
-- SELECT table_name, view_definition IS NOT NULL as has_definition
-- FROM information_schema.views 
-- WHERE table_schema = 'public'
-- AND table_name IN ('inventory_by_location', 'consignment_note_summary', 'write_off_summary', 'low_stock_alerts');

-- -- 5. Check migration status
-- SELECT table_name, legacy_count, migrated_count, status
-- FROM migration_status
-- ORDER BY table_name;

-- ============================================
-- MIGRATION SCRIPT COMPLETE
-- ============================================

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Migration script executed successfully at %', NOW();
    RAISE NOTICE 'Tables ready for data migration from MagGaz system';
END $$;
