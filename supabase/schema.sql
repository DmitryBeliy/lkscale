-- ============================================
-- Lkscale ERP - Supabase Database Schema
-- ============================================
-- Full schema for production-ready ERP system
-- Includes: users, companies, orders, products, inventory, suppliers, etc.
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS & TYPES
-- ============================================

-- Order status enum
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled', 'refunded');

-- Payment method enum
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'transfer', 'online');

-- Payment status enum
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'partial', 'failed', 'refunded');

-- User role enum
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'manager', 'cashier', 'viewer');

-- Inventory transaction type
CREATE TYPE inventory_transaction_type AS ENUM (
  'sale', 'purchase', 'adjustment', 'return', 'transfer_in', 'transfer_out', 'write_off'
);

-- Subscription tier enum
CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'business', 'enterprise');

-- Notification type enum
CREATE TYPE notification_type AS ENUM (
  'new_order', 'order_completed', 'low_stock', 'payment_received', 'system', 'alert'
);

-- ============================================
-- COMPANIES / ORGANIZATIONS
-- ============================================

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  
  -- Address
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Russia',
  postal_code VARCHAR(20),
  
  -- Business info
  tax_id VARCHAR(50),
  registration_number VARCHAR(100),
  
  -- Settings
  currency VARCHAR(3) DEFAULT 'RUB',
  currency_symbol VARCHAR(5) DEFAULT '₽',
  timezone VARCHAR(50) DEFAULT 'Europe/Moscow',
  language VARCHAR(10) DEFAULT 'ru',
  
  -- Subscription
  subscription_tier subscription_tier DEFAULT 'free',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Limits (based on tier)
  max_users INTEGER DEFAULT 1,
  max_products INTEGER DEFAULT 100,
  max_storage_mb INTEGER DEFAULT 100,
  
  -- Features
  features JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- USERS & PROFILES
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  
  -- Personal info
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  avatar_url TEXT,
  
  -- Role & permissions
  role user_role DEFAULT 'viewer',
  permissions JSONB DEFAULT '{}'::jsonb,
  
  -- Preferences
  language VARCHAR(10) DEFAULT 'ru',
  timezone VARCHAR(50) DEFAULT 'Europe/Moscow',
  notifications_enabled BOOLEAN DEFAULT true,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CATEGORIES
-- ============================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  icon VARCHAR(100),
  
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_category_name_per_company UNIQUE (company_id, name)
);

-- ============================================
-- PRODUCTS
-- ============================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  
  -- Basic info
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  barcode VARCHAR(100),
  description TEXT,
  
  -- Pricing
  price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(12, 2) DEFAULT 0,
  compare_at_price DECIMAL(12, 2),
  
  -- Inventory
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  max_stock INTEGER,
  unit VARCHAR(20) DEFAULT 'шт',
  
  -- Variants
  has_variants BOOLEAN DEFAULT false,
  
  -- Media
  image_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- SEO
  seo_title VARCHAR(255),
  seo_description TEXT,
  slug VARCHAR(255),
  
  -- Metadata
  tags JSONB DEFAULT '[]'::jsonb,
  attributes JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT unique_sku_per_company UNIQUE (company_id, sku),
  CONSTRAINT unique_barcode_per_company UNIQUE (company_id, barcode),
  CONSTRAINT price_positive CHECK (price >= 0),
  CONSTRAINT cost_price_positive CHECK (cost_price >= 0)
);

-- ============================================
-- PRODUCT VARIANTS
-- ============================================

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  barcode VARCHAR(100),
  
  -- Attributes (color, size, etc.)
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Pricing
  price DECIMAL(12, 2),
  cost_price DECIMAL(12, 2),
  
  -- Inventory
  stock INTEGER DEFAULT 0,
  
  -- Media
  image_url TEXT,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_variant_sku UNIQUE (sku),
  CONSTRAINT unique_variant_barcode UNIQUE (barcode)
);

-- ============================================
-- CUSTOMERS
-- ============================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Personal info
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  
  -- Company info (for B2B)
  company_name VARCHAR(255),
  tax_id VARCHAR(50),
  
  -- Address
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Russia',
  postal_code VARCHAR(20),
  
  -- Segment
  segment VARCHAR(50) DEFAULT 'new',
  tags JSONB DEFAULT '[]'::jsonb,
  
  -- Notes
  notes TEXT,
  
  -- Computed fields (updated via triggers)
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(12, 2) DEFAULT 0,
  average_order_value DECIMAL(12, 2) DEFAULT 0,
  last_order_date TIMESTAMP WITH TIME ZONE,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- ORDERS
-- ============================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- Order info
  order_number VARCHAR(50) NOT NULL,
  status order_status DEFAULT 'pending',
  
  -- Customer snapshot (for history)
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_email VARCHAR(255),
  shipping_address TEXT,
  
  -- Financial
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  discount_code VARCHAR(50),
  shipping_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  -- Payment
  payment_method payment_method,
  payment_status payment_status DEFAULT 'pending',
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes
  notes TEXT,
  internal_notes TEXT,
  
  -- Metadata
  source VARCHAR(50) DEFAULT 'app',
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT unique_order_number_per_company UNIQUE (company_id, order_number),
  CONSTRAINT total_amount_positive CHECK (total_amount >= 0)
);

-- ============================================
-- ORDER ITEMS
-- ============================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  
  -- Product snapshot
  product_name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  barcode VARCHAR(100),
  
  -- Pricing
  unit_price DECIMAL(12, 2) NOT NULL,
  cost_price DECIMAL(12, 2) DEFAULT 0,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  
  -- Calculated
  total_price DECIMAL(12, 2) GENERATED ALWAYS AS 
    ((unit_price * quantity) - discount_amount) STORED,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SUPPLIERS
-- ============================================

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Basic info
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  
  -- Contact person
  contact_name VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  
  -- Address
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Russia',
  postal_code VARCHAR(20),
  
  -- Business info
  tax_id VARCHAR(50),
  registration_number VARCHAR(100),
  payment_terms VARCHAR(100),
  
  -- Rating
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PURCHASE ORDERS
-- ============================================

CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
  
  po_number VARCHAR(50) NOT NULL,
  status order_status DEFAULT 'pending',
  
  -- Financial
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  -- Delivery
  expected_delivery_date DATE,
  received_at TIMESTAMP WITH TIME ZONE,
  
  -- Payment
  payment_status payment_status DEFAULT 'pending',
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_po_number_per_company UNIQUE (company_id, po_number)
);

-- ============================================
-- PURCHASE ORDER ITEMS
-- ============================================

CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  product_name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  
  unit_price DECIMAL(12, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  received_quantity INTEGER DEFAULT 0,
  
  total_price DECIMAL(12, 2) GENERATED ALWAYS AS (unit_price * quantity) STORED,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INVENTORY TRANSACTIONS
-- ============================================

CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  
  -- Transaction info
  type inventory_transaction_type NOT NULL,
  quantity INTEGER NOT NULL,
  
  -- References
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
  
  -- Stock levels (snapshot)
  stock_before INTEGER NOT NULL,
  stock_after INTEGER NOT NULL,
  
  -- Cost/Price
  unit_cost DECIMAL(12, 2),
  unit_price DECIMAL(12, 2),
  
  -- Notes
  reason TEXT,
  notes TEXT,
  
  -- User who made the transaction
  performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- WAREHOUSES / LOCATIONS
-- ============================================

CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  
  address TEXT,
  city VARCHAR(100),
  phone VARCHAR(50),
  
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- WAREHOUSE STOCK
-- ============================================

CREATE TABLE warehouse_stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  
  quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
  
  min_stock INTEGER DEFAULT 0,
  max_stock INTEGER,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_warehouse_product_variant UNIQUE (warehouse_id, product_id, variant_id)
);

-- ============================================
-- STAFF / EMPLOYEES
-- ============================================

CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  
  -- Employment
  employee_id VARCHAR(50),
  position VARCHAR(100),
  department VARCHAR(100),
  hire_date DATE,
  
  -- Salary
  salary DECIMAL(12, 2),
  salary_type VARCHAR(20) DEFAULT 'monthly',
  
  -- Schedule
  work_schedule JSONB DEFAULT '{}'::jsonb,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SHIFT SCHEDULE
-- ============================================

CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  is_published BOOLEAN DEFAULT false,
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  
  -- Link
  action_url TEXT,
  entity_type VARCHAR(50),
  entity_id UUID,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Priority
  priority VARCHAR(20) DEFAULT 'normal',
  
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AUDIT LOG
-- ============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  
  old_data JSONB,
  new_data JSONB,
  
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Companies
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_subscription ON companies(subscription_tier);

-- Profiles
CREATE INDEX idx_profiles_company ON profiles(company_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Categories
CREATE INDEX idx_categories_company ON categories(company_id);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- Products
CREATE INDEX idx_products_company ON products(company_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(company_id, is_active) WHERE is_active = true;
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('russian', name));

-- Product variants
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);
CREATE INDEX idx_variants_barcode ON product_variants(barcode);

-- Customers
CREATE INDEX idx_customers_company ON customers(company_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_name ON customers USING gin(to_tsvector('russian', 
  COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')));

-- Orders
CREATE INDEX idx_orders_company ON orders(company_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_payment ON orders(payment_status);

-- Order items
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Suppliers
CREATE INDEX idx_suppliers_company ON suppliers(company_id);
CREATE INDEX idx_suppliers_name ON suppliers USING gin(to_tsvector('russian', name));

-- Purchase orders
CREATE INDEX idx_purchase_orders_company ON purchase_orders(company_id);
CREATE INDEX idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);

-- Inventory transactions
CREATE INDEX idx_inventory_transactions_company ON inventory_transactions(company_id);
CREATE INDEX idx_inventory_transactions_product ON inventory_transactions(product_id);
CREATE INDEX idx_inventory_transactions_type ON inventory_transactions(type);
CREATE INDEX idx_inventory_transactions_created ON inventory_transactions(created_at);

-- Warehouses
CREATE INDEX idx_warehouses_company ON warehouses(company_id);

-- Warehouse stock
CREATE INDEX idx_warehouse_stock_warehouse ON warehouse_stock(warehouse_id);
CREATE INDEX idx_warehouse_stock_product ON warehouse_stock(product_id);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Audit logs
CREATE INDEX idx_audit_logs_company ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warehouses_updated_at
  BEFORE UPDATE ON warehouses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at
  BEFORE UPDATE ON shifts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update customer stats after order change
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'completed' THEN
    UPDATE customers SET
      total_orders = total_orders + 1,
      total_spent = total_spent + NEW.total_amount,
      last_order_date = NEW.completed_at,
      average_order_value = (total_spent + NEW.total_amount) / NULLIF(total_orders + 1, 0)
    WHERE id = NEW.customer_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'completed' AND NEW.status = 'completed' THEN
    UPDATE customers SET
      total_orders = total_orders + 1,
      total_spent = total_spent + NEW.total_amount,
      last_order_date = NEW.completed_at,
      average_order_value = (total_spent + NEW.total_amount) / NULLIF(total_orders + 1, 0)
    WHERE id = NEW.customer_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'completed' AND NEW.status = 'cancelled' THEN
    UPDATE customers SET
      total_orders = GREATEST(0, total_orders - 1),
      total_spent = GREATEST(0, total_spent - OLD.total_amount),
      average_order_value = CASE 
        WHEN total_orders > 1 THEN (total_spent - OLD.total_amount) / NULLIF(total_orders - 1, 0)
        ELSE 0
      END
    WHERE id = OLD.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_stats_on_order
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

-- Update product stock after inventory transaction
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.variant_id IS NOT NULL THEN
    UPDATE product_variants 
    SET stock = NEW.stock_after,
        updated_at = NOW()
    WHERE id = NEW.variant_id;
  ELSE
    UPDATE products 
    SET stock = NEW.stock_after,
        updated_at = NOW()
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_stock_on_transaction
  AFTER INSERT ON inventory_transactions
  FOR EACH ROW EXECUTE FUNCTION update_product_stock();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  prefix TEXT;
  year TEXT;
  next_number INTEGER;
BEGIN
  IF NEW.order_number IS NULL THEN
    prefix := 'ORD-';
    year := TO_CHAR(NOW(), 'YYYY');
    
    SELECT COALESCE(MAX(NULLIF(regexp_replace(order_number, '^ORD-\d{4}-', ''), '')), '0')::INTEGER + 1
    INTO next_number
    FROM orders
    WHERE company_id = NEW.company_id
      AND order_number LIKE prefix || year || '-%';
    
    NEW.order_number := prefix || year || '-' || LPAD(next_number::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_order_number_before_insert
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Set order completed_at timestamp
CREATE OR REPLACE FUNCTION set_order_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    NEW.cancelled_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_timestamps
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_order_completed_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's company
CREATE OR REPLACE FUNCTION get_current_user_company()
RETURNS UUID AS $$
DECLARE
  company_id UUID;
BEGIN
  SELECT p.company_id INTO company_id
  FROM profiles p
  WHERE p.id = auth.uid();
  RETURN company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is owner/admin
CREATE OR REPLACE FUNCTION is_company_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role user_role;
BEGIN
  SELECT p.role INTO user_role
  FROM profiles p
  WHERE p.id = auth.uid();
  RETURN user_role IN ('owner', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Companies policies
CREATE POLICY companies_select_own ON companies
  FOR SELECT USING (id = get_current_user_company());

CREATE POLICY companies_update_own ON companies
  FOR UPDATE USING (id = get_current_user_company() AND is_company_admin());

-- Profiles policies
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY profiles_select_company ON profiles
  FOR SELECT USING (company_id = get_current_user_company());

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY profiles_insert_admin ON profiles
  FOR INSERT WITH CHECK (is_company_admin());

CREATE POLICY profiles_update_admin ON profiles
  FOR UPDATE USING (
    company_id = get_current_user_company() AND is_company_admin()
  );

-- Categories policies
CREATE POLICY categories_select_company ON categories
  FOR SELECT USING (company_id = get_current_user_company());

CREATE POLICY categories_insert_company ON categories
  FOR INSERT WITH CHECK (company_id = get_current_user_company() AND is_company_admin());

CREATE POLICY categories_update_company ON categories
  FOR UPDATE USING (company_id = get_current_user_company() AND is_company_admin());

CREATE POLICY categories_delete_company ON categories
  FOR DELETE USING (company_id = get_current_user_company() AND is_company_admin());

-- Products policies
CREATE POLICY products_select_company ON products
  FOR SELECT USING (company_id = get_current_user_company() AND deleted_at IS NULL);

CREATE POLICY products_insert_company ON products
  FOR INSERT WITH CHECK (company_id = get_current_user_company());

CREATE POLICY products_update_company ON products
  FOR UPDATE USING (company_id = get_current_user_company());

CREATE POLICY products_delete_company ON products
  FOR DELETE USING (company_id = get_current_user_company() AND is_company_admin());

-- Product variants policies
CREATE POLICY variants_select_company ON product_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products p 
      WHERE p.id = product_variants.product_id 
      AND p.company_id = get_current_user_company()
    )
  );

CREATE POLICY variants_insert_company ON product_variants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM products p 
      WHERE p.id = product_variants.product_id 
      AND p.company_id = get_current_user_company()
    )
  );

CREATE POLICY variants_update_company ON product_variants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM products p 
      WHERE p.id = product_variants.product_id 
      AND p.company_id = get_current_user_company()
    )
  );

-- Customers policies
CREATE POLICY customers_select_company ON customers
  FOR SELECT USING (company_id = get_current_user_company() AND deleted_at IS NULL);

CREATE POLICY customers_insert_company ON customers
  FOR INSERT WITH CHECK (company_id = get_current_user_company());

CREATE POLICY customers_update_company ON customers
  FOR UPDATE USING (company_id = get_current_user_company());

CREATE POLICY customers_delete_company ON customers
  FOR DELETE USING (company_id = get_current_user_company() AND is_company_admin());

-- Orders policies
CREATE POLICY orders_select_company ON orders
  FOR SELECT USING (company_id = get_current_user_company());

CREATE POLICY orders_insert_company ON orders
  FOR INSERT WITH CHECK (company_id = get_current_user_company());

CREATE POLICY orders_update_company ON orders
  FOR UPDATE USING (company_id = get_current_user_company());

CREATE POLICY orders_delete_company ON orders
  FOR DELETE USING (company_id = get_current_user_company() AND is_company_admin());

-- Order items policies (inherit from orders)
CREATE POLICY order_items_select_company ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o 
      WHERE o.id = order_items.order_id 
      AND o.company_id = get_current_user_company()
    )
  );

CREATE POLICY order_items_insert_company ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o 
      WHERE o.id = order_items.order_id 
      AND o.company_id = get_current_user_company()
    )
  );

-- Suppliers policies
CREATE POLICY suppliers_select_company ON suppliers
  FOR SELECT USING (company_id = get_current_user_company());

CREATE POLICY suppliers_insert_company ON suppliers
  FOR INSERT WITH CHECK (company_id = get_current_user_company());

CREATE POLICY suppliers_update_company ON suppliers
  FOR UPDATE USING (company_id = get_current_user_company());

-- Purchase orders policies
CREATE POLICY purchase_orders_select_company ON purchase_orders
  FOR SELECT USING (company_id = get_current_user_company());

CREATE POLICY purchase_orders_insert_company ON purchase_orders
  FOR INSERT WITH CHECK (company_id = get_current_user_company());

CREATE POLICY purchase_orders_update_company ON purchase_orders
  FOR UPDATE USING (company_id = get_current_user_company());

-- Inventory transactions policies
CREATE POLICY inventory_transactions_select_company ON inventory_transactions
  FOR SELECT USING (company_id = get_current_user_company());

CREATE POLICY inventory_transactions_insert_company ON inventory_transactions
  FOR INSERT WITH CHECK (company_id = get_current_user_company());

-- Warehouses policies
CREATE POLICY warehouses_select_company ON warehouses
  FOR SELECT USING (company_id = get_current_user_company());

CREATE POLICY warehouses_insert_company ON warehouses
  FOR INSERT WITH CHECK (company_id = get_current_user_company() AND is_company_admin());

-- Warehouse stock policies
CREATE POLICY warehouse_stock_select_company ON warehouse_stock
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM warehouses w 
      WHERE w.id = warehouse_stock.warehouse_id 
      AND w.company_id = get_current_user_company()
    )
  );

-- Notifications policies
CREATE POLICY notifications_select_user ON notifications
  FOR SELECT USING (user_id = auth.uid() OR (user_id IS NULL AND company_id = get_current_user_company()));

CREATE POLICY notifications_update_user ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Audit logs policies (read-only for admins)
CREATE POLICY audit_logs_select_admin ON audit_logs
  FOR SELECT USING (company_id = get_current_user_company() AND is_company_admin());

-- Staff policies
CREATE POLICY staff_select_company ON staff
  FOR SELECT USING (company_id = get_current_user_company());

CREATE POLICY staff_insert_company ON staff
  FOR INSERT WITH CHECK (company_id = get_current_user_company() AND is_company_admin());

CREATE POLICY staff_update_company ON staff
  FOR UPDATE USING (company_id = get_current_user_company() AND is_company_admin());

-- Shifts policies
CREATE POLICY shifts_select_company ON shifts
  FOR SELECT USING (company_id = get_current_user_company());

CREATE POLICY shifts_insert_company ON shifts
  FOR INSERT WITH CHECK (company_id = get_current_user_company());

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('product-images', 'product-images', true),
  ('company-logos', 'company-logos', true),
  ('user-avatars', 'user-avatars', true),
  ('documents', 'documents', false),
  ('exports', 'exports', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY product_images_select ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY product_images_insert ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY product_images_delete ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

-- ============================================
-- VIEWS
-- ============================================

-- Low stock products view
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
  p.id,
  p.company_id,
  p.name,
  p.sku,
  p.stock,
  p.min_stock,
  (p.stock - p.min_stock) as stock_difference,
  c.name as category_name
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.stock <= p.min_stock 
  AND p.is_active = true
  AND p.deleted_at IS NULL;

-- Daily sales summary view
CREATE OR REPLACE VIEW daily_sales_summary AS
SELECT 
  o.company_id,
  DATE(o.created_at) as sale_date,
  COUNT(*) as order_count,
  SUM(o.total_amount) as total_sales,
  SUM(o.tax_amount) as total_tax,
  SUM(o.discount_amount) as total_discounts,
  AVG(o.total_amount) as average_order_value
FROM orders o
WHERE o.status = 'completed'
GROUP BY o.company_id, DATE(o.created_at);

-- Top selling products view
CREATE OR REPLACE VIEW top_selling_products AS
SELECT 
  p.id,
  p.company_id,
  p.name,
  p.sku,
  COUNT(DISTINCT oi.order_id) as times_ordered,
  SUM(oi.quantity) as total_quantity_sold,
  SUM(oi.total_price) as total_revenue,
  AVG(oi.unit_price) as average_price
FROM products p
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
WHERE o.status = 'completed'
GROUP BY p.id, p.company_id, p.name, p.sku;

-- Customer lifetime value view
CREATE OR REPLACE VIEW customer_lifetime_value AS
SELECT 
  c.id,
  c.company_id,
  c.first_name,
  c.last_name,
  c.email,
  c.total_orders,
  c.total_spent,
  c.average_order_value,
  c.last_order_date,
  CASE 
    WHEN c.total_spent >= 50000 THEN 'vip'
    WHEN c.total_spent >= 10000 THEN 'high_value'
    WHEN c.last_order_date >= NOW() - INTERVAL '30 days' THEN 'active'
    WHEN c.last_order_date >= NOW() - INTERVAL '90 days' THEN 'at_risk'
    ELSE 'inactive'
  END as segment
FROM customers c
WHERE c.is_active = true AND c.deleted_at IS NULL;
