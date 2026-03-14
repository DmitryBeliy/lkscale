/**
 * PATCH INSTRUCTIONS for types/database.ts
 * 
 * These patches ensure database types match migrated data structure.
 */

// ============================================
// PATCH 1: Add legacy_id fields to products table
// ============================================

// In the products.Row interface, add:
legacy_id: number | null;

// In the products.Insert interface, add:
legacy_id?: number | null;

// In the products.Update interface, add:
legacy_id?: number | null;

// ============================================
// PATCH 2: Add legacy_id fields to orders table
// ============================================

// In the orders.Row interface, add:
legacy_id: number | null;
legacy_outlet_id: number | null;
legacy_username: string | null;
legacy_customer_id: number | null;

// In the orders.Insert interface, add:
legacy_id?: number | null;
legacy_outlet_id?: number | null;
legacy_username?: string | null;
legacy_customer_id?: number | null;

// In the orders.Update interface, add:
legacy_id?: number | null;
legacy_outlet_id?: number | null;
legacy_username?: string | null;
legacy_customer_id?: number | null;

// ============================================
// PATCH 3: Add legacy_id fields to suppliers table
// ============================================

// In the suppliers.Row interface, add:
legacy_id: number | null;

// In the suppliers.Insert interface, add:
legacy_id?: number | null;

// In the suppliers.Update interface, add:
legacy_id?: number | null;

// ============================================
// PATCH 4: Add legacy_id fields to purchase_orders table
// ============================================

// In the purchase_orders.Row interface, add:
legacy_id: number | null;

// In the purchase_orders.Insert interface, add:
legacy_id?: number | null;

// In the purchase_orders.Update interface, add:
legacy_id?: number | null;

// ============================================
// PATCH 5: Add legacy_id fields to stock_adjustments table
// ============================================

// In the stock_adjustments.Row interface, add:
legacy_id: number | null;

// In the stock_adjustments.Insert interface, add:
legacy_id?: number | null;

// In the stock_adjustments.Update interface, add:
legacy_id?: number | null;

// ============================================
// PATCH 6: Make user_id nullable in all tables for migrated data
// ============================================

// Ensure user_id is nullable (string | null) in:
// - products.Row: user_id: string | null
// - orders.Row: user_id: string | null  
// - customers.Row: user_id: string | null
// - suppliers.Row: user_id: string | null
// - purchase_orders.Row: user_id: string | null
// - stock_adjustments.Row: user_id: string | null

// And in the corresponding Insert/Update interfaces:
// user_id?: string | null

// ============================================
// PATCH 7: Add additional product fields
// ============================================

// In the products.Row interface, ensure these fields exist:
manufacturer_id: string | null;
unit: string | null;
compare_at_price: number | null;
has_variants: boolean | null;
is_featured: boolean | null;
seo_title: string | null;
seo_description: string | null;
slug: string | null;
tags: string[] | null;
attributes: Json | null;
metadata: Json | null;
deleted_at: string | null;

// ============================================
// PATCH 8: Add additional order fields
// ============================================

// In the orders.Row interface, ensure these fields exist:
customer_email: string | null;

// ============================================
// COMPLETE TYPE DEFINITIONS FOR REFERENCE
// ============================================

/*

Full updated products type:

products: {
  Row: {
    id: string
    name: string
    sku: string | null
    barcode: string | null
    price: number
    cost_price: number | null
    stock: number | null
    min_stock: number | null
    category: string | null
    category_id: string | null
    manufacturer_id: string | null
    description: string | null
    image_url: string | null
    images: string[] | null
    is_active: boolean | null
    unit: string | null
    compare_at_price: number | null
    has_variants: boolean | null
    is_featured: boolean | null
    seo_title: string | null
    seo_description: string | null
    slug: string | null
    tags: string[] | null
    attributes: Json | null
    metadata: Json | null
    deleted_at: string | null
    created_at: string | null
    updated_at: string | null
    user_id: string | null
    legacy_id: number | null
  }
  Insert: {
    // ... all fields optional except required ones
    legacy_id?: number | null
  }
  Update: {
    // ... all fields optional
    legacy_id?: number | null
  }
}

Full updated orders type:

orders: {
  Row: {
    id: string
    order_number: string | null
    status: string | null
    total_amount: number | null
    items_count: number | null
    customer_id: string | null
    customer_name: string | null
    customer_phone: string | null
    customer_address: string | null
    customer_email: string | null
    notes: string | null
    payment_method: string | null
    items: Json | null
    created_at: string | null
    updated_at: string | null
    user_id: string | null
    legacy_id: number | null
    legacy_outlet_id: number | null
    legacy_username: string | null
    legacy_customer_id: number | null
  }
  Insert: {
    // ... all fields optional
    legacy_id?: number | null
    legacy_outlet_id?: number | null
    legacy_username?: string | null
    legacy_customer_id?: number | null
  }
  Update: {
    // ... all fields optional
    legacy_id?: number | null
    legacy_outlet_id?: number | null
    legacy_username?: string | null
    legacy_customer_id?: number | null
  }
}

*/
