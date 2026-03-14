#!/usr/bin/env node
/**
 * Lkscale ERP Data Migration Script
 * Migrates data from JSON files to Supabase PostgreSQL database
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase credentials
const SUPABASE_URL = 'https://onnncepenxxxfprqaodu.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubm5jZXBlbnh4eGZwcnFhb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4MTk4NywiZXhwIjoyMDg4MDU3OTg3fQ.z0vhXCfPqFmN13kA0bJYu1xDBMQVxzk7hWNZUe_Ly7I';

// Data directory
const DATA_DIR = join(__dirname, '..', 'docs', 'base', 'extracted_data');

// Initialize Supabase client with service role for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Generate UUID from legacy ID using MD5 hash
 * @param {number|string} id - Legacy ID
 * @param {string} prefix - Table prefix for uniqueness
 * @returns {string} UUID v4 format string
 */
function generateUUID(id, prefix) {
  const hash = crypto.createHash('md5').update(`${prefix}:${id}`).digest('hex');
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
}

/**
 * Read and parse JSON file
 * @param {string} filename - JSON file name
 * @returns {Array} Parsed JSON data
 */
function readJSON(filename) {
  const filepath = join(DATA_DIR, filename);
  console.log(`Reading ${filename}...`);
  const data = readFileSync(filepath, 'utf-8');
  return JSON.parse(data);
}

/**
 * Map location type from legacy to new schema
 * @param {number} type - Legacy type (1=shop, 2=warehouse, 3=customer)
 * @returns {string} New type value
 */
function mapLocationType(type) {
  const types = {
    1: 'shop',
    2: 'warehouse',
    3: 'customer'
  };
  return types[type] || 'shop';
}

/**
 * Map order status from legacy to new schema
 * @param {number} status - Legacy status
 * @returns {string} New status value
 */
function mapOrderStatus(status) {
  const statuses = {
    0: 'completed',
    1: 'pending',
    2: 'cancelled',
    3: 'refunded'
  };
  return statuses[status] || 'pending';
}

/**
 * Map payment type from legacy to new schema
 * @param {number} type - Legacy payment type
 * @returns {string} New payment method value
 */
function mapPaymentMethod(type) {
  const methods = {
    1: 'cash',
    2: 'card',
    3: 'transfer'
  };
  return methods[type] || 'cash';
}

/**
 * Sleep function for rate limiting
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Insert data in batches with error handling for duplicates
 * @param {string} table - Table name
 * @param {Array} data - Array of records to insert
 * @param {number} batchSize - Batch size for inserts
 */
async function insertBatches(table, data, batchSize = 100) {
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    try {
      const { data: result, error } = await supabase
        .from(table)
        .upsert(batch, { 
          onConflict: 'id',
          ignoreDuplicates: true 
        });

      if (error) {
        // Check for duplicate key errors
        if (error.code === '23505' || error.message?.includes('duplicate')) {
          console.log(`  ⚠️  Some records in ${table} batch ${Math.floor(i/batchSize) + 1} already exist, skipping duplicates`);
          skipped += batch.length;
        } else {
          console.error(`  ❌ Error inserting ${table} batch ${Math.floor(i/batchSize) + 1}:`, error.message);
          errors += batch.length;
        }
      } else {
        inserted += batch.length;
        process.stdout.write(`  ✓ ${table}: ${inserted}/${data.length} inserted\r`);
      }
    } catch (err) {
      console.error(`  ❌ Exception in ${table} batch ${Math.floor(i/batchSize) + 1}:`, err.message);
      errors += batch.length;
    }

    // Small delay to avoid overwhelming the database
    await sleep(50);
  }

  console.log(`  ✓ ${table}: ${inserted} inserted, ${skipped} skipped, ${errors} errors`);
  return { inserted, skipped, errors };
}

/**
 * Migrate manufacturers
 */
async function migrateManufacturers() {
  console.log('\n📦 Migrating Manufacturers...');
  const data = readJSON('dbo_Manufacturer.json');
  
  const mapped = data.map(item => ({
    id: generateUUID(item.ManufacturerId, 'manufacturer'),
    legacy_id: item.ManufacturerId.toString(),
    name: item.Name,
    is_active: true
  }));

  return insertBatches('manufacturers', mapped);
}

/**
 * Migrate suppliers
 */
async function migrateSuppliers() {
  console.log('\n📦 Migrating Suppliers...');
  const data = readJSON('dbo_Supplier.json');
  
  const mapped = data.map(item => ({
    id: generateUUID(item.SupplierId, 'supplier'),
    legacy_id: item.SupplierId.toString(),
    name: item.Name,
    is_active: true
  }));

  return insertBatches('suppliers', mapped);
}

/**
 * Migrate locations
 */
async function migrateLocations() {
  console.log('\n📦 Migrating Locations...');
  const data = readJSON('dbo_Location.json');
  
  const mapped = data.map(item => ({
    id: generateUUID(item.LocationId, 'location'),
    legacy_id: item.LocationId.toString(),
    name: item.Name,
    type: mapLocationType(item.Type),
    is_active: true
  }));

  return insertBatches('locations', mapped);
}

/**
 * Migrate products
 */
async function migrateProducts() {
  console.log('\n📦 Migrating Products...');
  const data = readJSON('dbo_Product.json');
  
  const mapped = data.map(item => {
    // Parse price and cost price
    const price = parseFloat(item.PriceTypeValue) || 0;
    
    // Note: PurchasePrice is not in the Product table, it's in OrderProduct
    // We'll set cost_price as null here, it can be updated later if needed
    
    return {
      id: generateUUID(item.ProductId, 'product'),
      legacy_id: item.ProductId.toString(),
      name: item.Name,
      sku: item.VendorCode || null,
      price: price,
      cost_price: null, // Will be calculated from order data if needed
      description: item.Description || null,
      min_stock: item.MinStock ? parseInt(item.MinStock) : 0,
      is_active: !item.IsArchive,
      barcode: item.ManufacturerBarcodes || null,
      unit: 'pcs' // Default unit
    };
  });

  return insertBatches('products', mapped, 50); // Smaller batch for products
}

/**
 * Calculate order totals from OrderProduct data
 * @returns {Map<number, number>} Map of OrderId -> Total amount
 */
function calculateOrderTotals() {
  console.log('\n📊 Calculating order totals...');
  const orderProducts = readJSON('dbo_OrderProduct.json');
  const totals = new Map();

  for (const item of orderProducts) {
    const orderId = item.OrderId;
    const price = parseFloat(item.Price) || 0;
    const count = parseInt(item.Count) || 0;
    const refundCount = parseInt(item.RefundCount) || 0;
    
    // Calculate net count (excluding refunds)
    const netCount = Math.max(0, count - refundCount);
    const lineTotal = price * netCount;

    if (totals.has(orderId)) {
      totals.set(orderId, totals.get(orderId) + lineTotal);
    } else {
      totals.set(orderId, lineTotal);
    }
  }

  console.log(`  Calculated totals for ${totals.size} orders`);
  return totals;
}

/**
 * Migrate orders
 */
async function migrateOrders() {
  console.log('\n📦 Migrating Orders...');
  const data = readJSON('dbo_Order.json');
  const orderTotals = calculateOrderTotals();
  
  const mapped = data.map(item => {
    // Parse the timestamp and convert to ISO format
    const createdAt = item.CreatedDateUtc ? new Date(item.CreatedDateUtc).toISOString() : new Date().toISOString();
    
    // Get total from calculated map or default to 0
    const totalAmount = orderTotals.get(item.OrderId) || 0;
    
    // Map username to customer name (or use a generic name if empty)
    const customerName = item.Username || 'Unknown Customer';

    return {
      id: generateUUID(item.OrderId, 'order'),
      legacy_id: item.OrderId.toString(),
      customer_name: customerName,
      total_amount: totalAmount,
      status: mapOrderStatus(item.Status),
      created_at: createdAt,
      payment_method: mapPaymentMethod(item.PaymentType)
    };
  });

  return insertBatches('orders', mapped, 100);
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('🚀 Starting Lkscale ERP Data Migration\n');
  console.log('=====================================');

  const startTime = Date.now();
  const stats = {
    manufacturers: { inserted: 0, skipped: 0, errors: 0 },
    suppliers: { inserted: 0, skipped: 0, errors: 0 },
    locations: { inserted: 0, skipped: 0, errors: 0 },
    products: { inserted: 0, skipped: 0, errors: 0 },
    orders: { inserted: 0, skipped: 0, errors: 0 }
  };

  try {
    // Test connection
    console.log('Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase.from('manufacturers').select('count').limit(1);
    if (testError) {
      console.error('❌ Failed to connect to Supabase:', testError.message);
      process.exit(1);
    }
    console.log('✓ Connected to Supabase\n');

    // Run migrations in order (reference tables first)
    stats.manufacturers = await migrateManufacturers();
    stats.suppliers = await migrateSuppliers();
    stats.locations = await migrateLocations();
    stats.products = await migrateProducts();
    stats.orders = await migrateOrders();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n=====================================');
    console.log('✅ Migration completed successfully!');
    console.log(`⏱️  Duration: ${duration}s`);
    console.log('\n📊 Summary:');
    console.log(`  Manufacturers: ${stats.manufacturers.inserted} inserted, ${stats.manufacturers.skipped} skipped`);
    console.log(`  Suppliers:     ${stats.suppliers.inserted} inserted, ${stats.suppliers.skipped} skipped`);
    console.log(`  Locations:     ${stats.locations.inserted} inserted, ${stats.locations.skipped} skipped`);
    console.log(`  Products:      ${stats.products.inserted} inserted, ${stats.products.skipped} skipped`);
    console.log(`  Orders:        ${stats.orders.inserted} inserted, ${stats.orders.skipped} skipped`);
    console.log('\n=====================================\n');

  } catch (error) {
    console.error('\n❌ Migration failed with error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export { runMigration, generateUUID };
