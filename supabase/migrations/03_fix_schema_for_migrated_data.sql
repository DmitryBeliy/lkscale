-- ============================================
-- SCHEMA FIXES FOR MIGRATED DATA
-- ============================================
-- This migration adds missing columns, indexes, and constraints
-- to support data migrated from the old system
-- ============================================

-- ============================================
-- 1. ADD LEGACY ID COLUMNS FOR TRACKING
-- ============================================

-- Add legacy_id to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS legacy_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_products_legacy_id ON products(legacy_id);

-- Add legacy_id to orders table  
ALTER TABLE orders ADD COLUMN IF NOT EXISTS legacy_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_orders_legacy_id ON orders(legacy_id);

-- Add legacy_id to customers table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS legacy_customer_id INTEGER;

-- Add legacy_id to suppliers table
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS legacy_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_suppliers_legacy_id ON suppliers(legacy_id);

-- Add legacy_id to purchase_orders table (for consignment notes)
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS legacy_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_purchase_orders_legacy_id ON purchase_orders(legacy_id);

-- Add legacy_id to stock_adjustments table (for write-offs)
ALTER TABLE stock_adjustments ADD COLUMN IF NOT EXISTS legacy_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_legacy_id ON stock_adjustments(legacy_id);

-- ============================================
-- 2. ENSURE ALL REQUIRED COLUMNS EXIST
-- ============================================

-- Products table - ensure all columns from old system exist
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS manufacturer_id UUID REFERENCES manufacturers(id),
  ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'шт',
  ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS has_variants BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Orders table - ensure customer data columns exist
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS legacy_outlet_id INTEGER,
  ADD COLUMN IF NOT EXISTS legacy_username TEXT,
  ADD COLUMN IF NOT EXISTS legacy_comment TEXT,
  ADD COLUMN IF NOT EXISTS legacy_payment_type INTEGER;

-- Customers table - ensure all tracking columns
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS legacy_orders_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'migrated';

-- ============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_manufacturer_id ON products(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

-- Suppliers indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON suppliers(is_active);

-- Purchase orders indexes
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);

-- Stock adjustments indexes
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_product_id ON stock_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_adjustment_type ON stock_adjustments(adjustment_type);

-- ============================================
-- 4. UPDATE RLS POLICIES FOR MIGRATED DATA
-- ============================================

-- Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own products" ON products;
DROP POLICY IF EXISTS "Users can insert their own products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;
DROP POLICY IF EXISTS "Allow system to insert migrated products" ON products;

DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Users can delete their own orders" ON orders;
DROP POLICY IF EXISTS "Allow system to insert migrated orders" ON orders;

DROP POLICY IF EXISTS "Users can view their own customers" ON customers;
DROP POLICY IF EXISTS "Users can insert their own customers" ON customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON customers;

DROP POLICY IF EXISTS "Users can view their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can insert their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete their own suppliers" ON suppliers;

-- Products policies - allow access to migrated data (user_id can be NULL for migrated data)
CREATE POLICY "Users can view their own products" ON products
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" ON products
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" ON products
  FOR DELETE USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own orders" ON orders
  FOR DELETE USING (auth.uid() = user_id);

-- Customers policies
CREATE POLICY "Users can view their own customers" ON customers
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own customers" ON customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers" ON customers
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers" ON customers
  FOR DELETE USING (auth.uid() = user_id);

-- Suppliers policies
CREATE POLICY "Users can view their own suppliers" ON suppliers
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own suppliers" ON suppliers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suppliers" ON suppliers
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suppliers" ON suppliers
  FOR DELETE USING (auth.uid() = user_id);

-- Purchase orders policies
CREATE POLICY "Users can view their own purchase_orders" ON purchase_orders
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own purchase_orders" ON purchase_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchase_orders" ON purchase_orders
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id);

-- Stock adjustments policies
CREATE POLICY "Users can view their own stock_adjustments" ON stock_adjustments
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own stock_adjustments" ON stock_adjustments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Manufacturers policies (global reference data)
CREATE POLICY "Anyone can view manufacturers" ON manufacturers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage manufacturers" ON manufacturers
  FOR ALL USING (auth.role() = 'authenticated');

-- Locations policies
CREATE POLICY "Users can view their own locations" ON locations
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own locations" ON locations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 5. CREATE FUNCTIONS FOR DATA MIGRATION HELPERS
-- ============================================

-- Function to safely parse decimal values from strings
CREATE OR REPLACE FUNCTION parse_decimal(value TEXT)
RETURNS NUMERIC AS $$
BEGIN
  RETURN CASE 
    WHEN value IS NULL OR value = '' THEN 0
    WHEN value ~ '^[0-9]+\.?[0-9]*$' THEN value::NUMERIC
    ELSE 0
  END;
EXCEPTION WHEN OTHERS THEN
  RETURN 0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to map old order status to new status
CREATE OR REPLACE FUNCTION map_order_status(old_status INTEGER)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE old_status
    WHEN 1 THEN 'completed'
    WHEN 2 THEN 'pending'
    WHEN 3 THEN 'processing'
    WHEN 4 THEN 'cancelled'
    ELSE 'pending'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to map old payment type to new payment method
CREATE OR REPLACE FUNCTION map_payment_method(old_type INTEGER)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE old_type
    WHEN 1 THEN 'cash'
    WHEN 2 THEN 'card'
    WHEN 3 THEN 'transfer'
    WHEN 4 THEN 'online'
    ELSE 'cash'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to generate UUID from legacy ID (deterministic)
CREATE OR REPLACE FUNCTION legacy_to_uuid(legacy_id INTEGER, entity_type TEXT)
RETURNS UUID AS $$
BEGIN
  -- Generate a UUID v5 using a namespace and the legacy ID
  RETURN uuid_generate_v5(
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid,  -- DNS namespace
    entity_type || ':' || legacy_id::text
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 6. CREATE VIEW FOR MIGRATED DATA VALIDATION
-- ============================================

CREATE OR REPLACE VIEW migrated_data_summary AS
SELECT 
  'products' as entity_type,
  COUNT(*) as total_count,
  COUNT(legacy_id) as migrated_count,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as system_imported_count
FROM products
UNION ALL
SELECT 
  'orders' as entity_type,
  COUNT(*) as total_count,
  COUNT(legacy_id) as migrated_count,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as system_imported_count
FROM orders
UNION ALL
SELECT 
  'customers' as entity_type,
  COUNT(*) as total_count,
  0 as migrated_count,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as system_imported_count
FROM customers
UNION ALL
SELECT 
  'suppliers' as entity_type,
  COUNT(*) as total_count,
  COUNT(legacy_id) as migrated_count,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as system_imported_count
FROM suppliers
UNION ALL
SELECT 
  'purchase_orders' as entity_type,
  COUNT(*) as total_count,
  COUNT(legacy_id) as migrated_count,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as system_imported_count
FROM purchase_orders
UNION ALL
SELECT 
  'stock_adjustments' as entity_type,
  COUNT(*) as total_count,
  COUNT(legacy_id) as migrated_count,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as system_imported_count
FROM stock_adjustments;

-- ============================================
-- 7. CREATE TRIGGER TO UPDATE TIMESTAMPS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all main tables
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. GRANT PERMISSIONS
-- ============================================

-- Grant necessary permissions for authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON customers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON suppliers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON purchase_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON purchase_order_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON stock_adjustments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON manufacturers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON locations TO authenticated;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant view permissions
GRANT SELECT ON migrated_data_summary TO authenticated;

-- ============================================
-- 9. ADD COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN products.legacy_id IS 'Original ProductId from the old system (dbo_Product.json)';
COMMENT ON COLUMN orders.legacy_id IS 'Original OrderId from the old system (dbo_Order.json)';
COMMENT ON COLUMN orders.legacy_customer_id IS 'Original customer reference from old order data';
COMMENT ON COLUMN suppliers.legacy_id IS 'Original SupplierId from the old system (dbo_Supplier.json)';
COMMENT ON COLUMN purchase_orders.legacy_id IS 'Original ConsignmentNoteId from the old system (dbo_ConsignmentNote.json)';
COMMENT ON COLUMN stock_adjustments.legacy_id IS 'Original WriteOffId from the old system (dbo_WriteOff.json)';

COMMENT ON TABLE products IS 'Products table with migrated data from old ERP system';
COMMENT ON TABLE orders IS 'Orders table with migrated data from old ERP system';

-- ============================================
-- Migration Complete
-- ============================================
