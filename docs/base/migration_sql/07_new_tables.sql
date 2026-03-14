-- ============================================
-- NEW TABLES MIGRATION FROM OLD SYSTEM
-- Generated: 2026-03-14
-- Tables: manufacturers, locations, outlets, consignment_notes, 
--         consignment_note_products, product_locations, write_offs, user_activity_logs
-- ============================================

-- ============================================
-- 1. MANUFACTURERS
-- Stores product manufacturers (64 records from old system)
-- Note: manufacturers table already exists in schema.sql, but we add legacy_id for migration mapping
-- ============================================

-- Add legacy_id column to existing manufacturers table for migration mapping
ALTER TABLE manufacturers ADD COLUMN IF NOT EXISTS legacy_id INTEGER;

-- Create index for legacy_id lookup during migration
CREATE INDEX IF NOT EXISTS idx_manufacturers_legacy_id ON manufacturers(legacy_id);

COMMENT ON TABLE manufacturers IS 'Product manufacturers. Populated from dbo_Manufacturer.json (64 manufacturers like Baxi, Vaillant, etc.)';
COMMENT ON COLUMN manufacturers.legacy_id IS 'Original ID from old system for migration mapping';

-- ============================================
-- 2. LOCATIONS  
-- Stores warehouses and shops (9 locations from old system)
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

COMMENT ON TABLE locations IS 'Warehouses and shops where inventory is stored. Populated from dbo_Location.json (9 locations)';
COMMENT ON COLUMN locations.type IS 'Location type: 1=Warehouse, 2=Shop, 3=Other';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_locations_legacy_id ON locations(legacy_id);
CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(type);
CREATE INDEX IF NOT EXISTS idx_locations_is_active ON locations(is_active);

-- ============================================
-- 3. OUTLETS
-- Sales channels (3 outlets from old system)
-- ============================================

CREATE TABLE IF NOT EXISTS outlets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,  -- Original ID from old system
    name TEXT NOT NULL,
    type INTEGER NOT NULL DEFAULT 1,  -- 1=Physical Store, 2=Website, 3=Marketplace
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE outlets IS 'Sales channels/outlets. Populated from dbo_Outlet.json (3 outlets: physical store, website, Yandex.Market)';
COMMENT ON COLUMN outlets.type IS 'Outlet type: 1=Physical Store, 2=Website, 3=Marketplace';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_outlets_legacy_id ON outlets(legacy_id);
CREATE INDEX IF NOT EXISTS idx_outlets_type ON outlets(type);
CREATE INDEX IF NOT EXISTS idx_outlets_is_active ON outlets(is_active);

-- ============================================
-- 4. CONSIGNMENT NOTES
-- Purchase receipts from suppliers (976 records from old system)
-- ============================================

CREATE TABLE IF NOT EXISTS consignment_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,  -- Original ID from old system (ConsignmentNoteId)
    supplier_id INTEGER,  -- References suppliers.legacy_id during migration
    supplier_uuid UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    note_number TEXT,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_owner_balance BOOLEAN DEFAULT FALSE,  -- Whether goods are on consignment
    total_amount DECIMAL(12,2) DEFAULT 0,
    status TEXT DEFAULT 'received',  -- received, processed, cancelled
    notes TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE consignment_notes IS 'Purchase receipts/consignment notes from suppliers. Populated from dbo_ConsignmentNote.json (976 records)';
COMMENT ON COLUMN consignment_notes.is_owner_balance IS 'If TRUE, goods are on consignment (not paid until sold)';
COMMENT ON COLUMN consignment_notes.legacy_id IS 'Original ConsignmentNoteId from old system';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_consignment_notes_legacy_id ON consignment_notes(legacy_id);
CREATE INDEX IF NOT EXISTS idx_consignment_notes_supplier_id ON consignment_notes(supplier_id);
CREATE INDEX IF NOT EXISTS idx_consignment_notes_supplier_uuid ON consignment_notes(supplier_uuid);
CREATE INDEX IF NOT EXISTS idx_consignment_notes_created_date ON consignment_notes(created_date);
CREATE INDEX IF NOT EXISTS idx_consignment_notes_status ON consignment_notes(status);

-- ============================================
-- 5. CONSIGNMENT NOTE PRODUCTS
-- Individual items in each consignment note (1973 records from old system)
-- ============================================

CREATE TABLE IF NOT EXISTS consignment_note_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,  -- Original ID from old system (ConsignmentNoteProductId)
    consignment_note_id INTEGER,  -- References consignment_notes.legacy_id during migration
    consignment_note_uuid UUID REFERENCES consignment_notes(id) ON DELETE CASCADE,
    product_id INTEGER,  -- References products.legacy_id during migration
    product_uuid UUID REFERENCES products(id) ON DELETE SET NULL,
    purchase_price DECIMAL(12,2) NOT NULL DEFAULT 0,  -- Cost price per unit
    count INTEGER NOT NULL DEFAULT 0,  -- Quantity received
    start_location_id INTEGER,  -- References locations.legacy_id during migration
    start_location_uuid UUID REFERENCES locations(id) ON DELETE SET NULL,
    sold_count INTEGER DEFAULT 0,  -- How many have been sold
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_consignment_note_products_legacy_id ON consignment_note_products(legacy_id);
CREATE INDEX IF NOT EXISTS idx_consignment_note_products_note_id ON consignment_note_products(consignment_note_id);
CREATE INDEX IF NOT EXISTS idx_consignment_note_products_note_uuid ON consignment_note_products(consignment_note_uuid);
CREATE INDEX IF NOT EXISTS idx_consignment_note_products_product_id ON consignment_note_products(product_id);
CREATE INDEX IF NOT EXISTS idx_consignment_note_products_product_uuid ON consignment_note_products(product_uuid);
CREATE INDEX IF NOT EXISTS idx_consignment_note_products_location_id ON consignment_note_products(start_location_id);
CREATE INDEX IF NOT EXISTS idx_consignment_note_products_received_date ON consignment_note_products(received_date);

-- ============================================
-- 6. PRODUCT LOCATIONS
-- Inventory counts by location (1080 records from old system)
-- ============================================

CREATE TABLE IF NOT EXISTS product_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,  -- Original ID from old system (ProductLocationId)
    product_id INTEGER,  -- References products.legacy_id during migration
    product_uuid UUID REFERENCES products(id) ON DELETE CASCADE,
    location_id INTEGER,  -- References locations.legacy_id during migration
    location_uuid UUID REFERENCES locations(id) ON DELETE CASCADE,
    count INTEGER NOT NULL DEFAULT 0,  -- Current quantity at this location
    storage_cell TEXT,  -- Specific storage location/shelf (e.g., "С", "О4")
    min_stock INTEGER DEFAULT 0,  -- Minimum stock level for this location
    max_stock INTEGER DEFAULT 0,  -- Maximum stock level for this location
    last_counted_at TIMESTAMP WITH TIME ZONE,  -- Last physical inventory count
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_uuid, location_uuid, storage_cell)
);

COMMENT ON TABLE product_locations IS 'Current inventory quantities by location. Populated from dbo_ProductLocation.json (1080 records)';
COMMENT ON COLUMN product_locations.storage_cell IS 'Specific storage cell/shelf code (e.g., "С", "О4")';
COMMENT ON COLUMN product_locations.legacy_id IS 'Original ProductLocationId from old system';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_locations_legacy_id ON product_locations(legacy_id);
CREATE INDEX IF NOT EXISTS idx_product_locations_product_id ON product_locations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_locations_product_uuid ON product_locations(product_uuid);
CREATE INDEX IF NOT EXISTS idx_product_locations_location_id ON product_locations(location_id);
CREATE INDEX IF NOT EXISTS idx_product_locations_location_uuid ON product_locations(location_uuid);
CREATE INDEX IF NOT EXISTS idx_product_locations_storage_cell ON product_locations(storage_cell);
CREATE INDEX IF NOT EXISTS idx_product_locations_count ON product_locations(count) WHERE count > 0;

-- ============================================
-- 7. WRITE OFFS
-- Inventory write-offs (246 records from old system)
-- ============================================

CREATE TABLE IF NOT EXISTS write_offs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,  -- Original ID from old system (WriteOffId)
    product_id INTEGER,  -- References products.legacy_id during migration
    product_uuid UUID REFERENCES products(id) ON DELETE SET NULL,
    count INTEGER NOT NULL DEFAULT 0,  -- Quantity written off
    purchase_price DECIMAL(12,2) NOT NULL DEFAULT 0,  -- Cost price at time of write-off
    consignment_note_id INTEGER,  -- References consignment_notes.legacy_id
    consignment_note_uuid UUID REFERENCES consignment_notes(id) ON DELETE SET NULL,
    type INTEGER NOT NULL DEFAULT 1,  -- 1=Damage, 2=Expiration, 3=Loss, 4=Other
    reason TEXT,  -- Detailed reason for write-off
    created_date TIMESTAMP WITH TIME ZONE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE write_offs IS 'Inventory write-offs for damaged, expired, or lost goods. Populated from dbo_WriteOff.json (246 records)';
COMMENT ON COLUMN write_offs.type IS 'Write-off type: 1=Damage, 2=Expiration, 3=Loss, 4=Other';
COMMENT ON COLUMN write_offs.purchase_price IS 'Cost price at time of write-off (for COGS calculation)';
COMMENT ON COLUMN write_offs.legacy_id IS 'Original WriteOffId from old system';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_write_offs_legacy_id ON write_offs(legacy_id);
CREATE INDEX IF NOT EXISTS idx_write_offs_product_id ON write_offs(product_id);
CREATE INDEX IF NOT EXISTS idx_write_offs_product_uuid ON write_offs(product_uuid);
CREATE INDEX IF NOT EXISTS idx_write_offs_consignment_note_id ON write_offs(consignment_note_id);
CREATE INDEX IF NOT EXISTS idx_write_offs_consignment_note_uuid ON write_offs(consignment_note_uuid);
CREATE INDEX IF NOT EXISTS idx_write_offs_type ON write_offs(type);
CREATE INDEX IF NOT EXISTS idx_write_offs_created_date ON write_offs(created_date);

-- ============================================
-- 8. USER ACTIVITY LOGS
-- Audit trail of user actions (10192 records from old system)
-- ============================================

CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id INTEGER UNIQUE,  -- Original ID from old system (UserActivityLogId)
    username TEXT NOT NULL,  -- Username from old system
    user_id UUID REFERENCES auth.users(id),  -- Mapped to new auth user if available
    operation TEXT NOT NULL,  -- Operation type: CreatedProduct, EditProduct, etc.
    entity_type TEXT,  -- Type of entity affected: product, order, supplier, etc.
    entity_id INTEGER,  -- ID of affected entity from old system
    entity_uuid UUID,  -- UUID of affected entity in new system
    created_date TIMESTAMP WITH TIME ZONE NOT NULL,
    data JSONB,  -- Full snapshot of data from old system
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE user_activity_logs IS 'Audit trail of user actions. Populated from dbo_UserActivityLog.json (10192 records)';
COMMENT ON COLUMN user_activity_logs.operation IS 'Operation type: CreatedProduct, EditProduct, DeletedProduct, etc.';
COMMENT ON COLUMN user_activity_logs.data IS 'Full JSON snapshot of the entity state at time of operation';
COMMENT ON COLUMN user_activity_logs.legacy_id IS 'Original UserActivityLogId from old system';

-- Create indexes
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
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE consignment_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE consignment_note_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE write_offs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts on re-run)
DROP POLICY IF EXISTS "Locations are readable by authenticated" ON locations;
DROP POLICY IF EXISTS "Locations are manageable by admins" ON locations;
DROP POLICY IF EXISTS "Outlets are readable by authenticated" ON outlets;
DROP POLICY IF EXISTS "Outlets are manageable by admins" ON outlets;
DROP POLICY IF EXISTS "Consignment notes viewable by authenticated" ON consignment_notes;
DROP POLICY IF EXISTS "Consignment notes manageable by authenticated" ON consignment_notes;
DROP POLICY IF EXISTS "Consignment note products viewable by authenticated" ON consignment_note_products;
DROP POLICY IF EXISTS "Product locations viewable by authenticated" ON product_locations;
DROP POLICY IF EXISTS "Write offs viewable by authenticated" ON write_offs;
DROP POLICY IF EXISTS "User activity logs viewable by admins" ON user_activity_logs;
DROP POLICY IF EXISTS "User activity logs viewable by own user" ON user_activity_logs;

-- Locations: readable by all authenticated, manageable by admins
CREATE POLICY "Locations are readable by authenticated" ON locations
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Locations are manageable by admins" ON locations
    FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Outlets: readable by all authenticated, manageable by admins
CREATE POLICY "Outlets are readable by authenticated" ON outlets
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Outlets are manageable by admins" ON outlets
    FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Consignment notes: viewable by authenticated users
CREATE POLICY "Consignment notes viewable by authenticated" ON consignment_notes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Consignment notes manageable by authenticated" ON consignment_notes
    FOR ALL TO authenticated 
    USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'))
    WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Consignment note products: viewable by authenticated
CREATE POLICY "Consignment note products viewable by authenticated" ON consignment_note_products
    FOR SELECT TO authenticated USING (true);

-- Product locations: viewable by authenticated
CREATE POLICY "Product locations viewable by authenticated" ON product_locations
    FOR SELECT TO authenticated USING (true);

-- Write offs: viewable by authenticated
CREATE POLICY "Write offs viewable by authenticated" ON write_offs
    FOR SELECT TO authenticated USING (true);

-- User activity logs: users can see their own, admins can see all
CREATE POLICY "User activity logs viewable by own user" ON user_activity_logs
    FOR SELECT TO authenticated 
    USING (user_id = auth.uid() OR username = (SELECT name FROM users WHERE id = auth.uid()));

CREATE POLICY "User activity logs viewable by admins" ON user_activity_logs
    FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
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

-- ============================================
-- VIEWS FOR CONVENIENT ACCESS
-- ============================================

-- View: Current inventory by location with product details
CREATE OR REPLACE VIEW inventory_by_location AS
SELECT 
    pl.id,
    pl.product_uuid,
    p.name as product_name,
    p.sku as product_sku,
    pl.location_uuid,
    l.name as location_name,
    l.type as location_type,
    pl.storage_cell,
    pl.count,
    pl.min_stock,
    pl.max_stock,
    pl.last_counted_at,
    pl.updated_at
FROM product_locations pl
LEFT JOIN products p ON pl.product_uuid = p.id
LEFT JOIN locations l ON pl.location_uuid = l.id
WHERE pl.count > 0;

-- View: Consignment note summary with totals
CREATE OR REPLACE VIEW consignment_note_summary AS
SELECT 
    cn.id,
    cn.legacy_id,
    cn.note_number,
    s.name as supplier_name,
    cn.created_date,
    cn.is_owner_balance,
    cn.status,
    COUNT(cnp.id) as total_items,
    SUM(cnp.count) as total_quantity,
    SUM(cnp.count * cnp.purchase_price) as total_cost,
    SUM(cnp.sold_count) as total_sold,
    SUM((cnp.count - cnp.sold_count) * cnp.purchase_price) as remaining_value
FROM consignment_notes cn
LEFT JOIN suppliers s ON cn.supplier_uuid = s.id
LEFT JOIN consignment_note_products cnp ON cn.id = cnp.consignment_note_uuid
GROUP BY cn.id, cn.legacy_id, cn.note_number, s.name, cn.created_date, cn.is_owner_balance, cn.status;

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
    SUM(wo.count * wo.purchase_price) as total_value
FROM write_offs wo
GROUP BY wo.type, DATE_TRUNC('month', wo.created_date);

-- ============================================
-- MIGRATION STATUS TABLE
-- Track migration progress for these tables
-- ============================================

CREATE TABLE IF NOT EXISTS migration_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL UNIQUE,
    legacy_count INTEGER,
    migrated_count INTEGER DEFAULT 0,
    last_migrated_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending',  -- pending, in_progress, completed, failed
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE migration_status IS 'Tracks migration progress for each table from old system';

-- Insert initial status records
INSERT INTO migration_status (table_name, legacy_count, status) VALUES
    ('manufacturers', 64, 'pending'),
    ('locations', 9, 'pending'),
    ('outlets', 3, 'pending'),
    ('consignment_notes', 976, 'pending'),
    ('consignment_note_products', 1973, 'pending'),
    ('product_locations', 1080, 'pending'),
    ('write_offs', 246, 'pending'),
    ('user_activity_logs', 10192, 'pending')
ON CONFLICT (table_name) DO NOTHING;

-- Enable RLS on migration_status
ALTER TABLE migration_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Migration status viewable by admins" ON migration_status;
CREATE POLICY "Migration status viewable by admins" ON migration_status
    FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
