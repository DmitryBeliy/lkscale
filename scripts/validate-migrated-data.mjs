#!/usr/bin/env node

/**
 * Data Validation Script for Migrated Data
 * 
 * This script connects to Supabase and validates the integrity of migrated data.
 * Run with: node scripts/validate-migrated-data.mjs
 * 
 * Required environment variables:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY for read-only validation)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[PASS]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[FAIL]${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.magenta}${'='.repeat(60)}${colors.reset}\n${colors.magenta}${msg}${colors.reset}\n${colors.magenta}${'='.repeat(60)}${colors.reset}`),
};

// Validation results
const results = {
  products: { errors: [], warnings: [], info: [] },
  orders: { errors: [], warnings: [], info: [] },
  customers: { errors: [], warnings: [], info: [] },
  suppliers: { errors: [], warnings: [], info: [] },
  stock: { errors: [], warnings: [], info: [] },
};

// Initialize Supabase client
function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    log.error('Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env variables.');
    process.exit(1);
  }
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

// Validation helpers
async function countRecords(supabase, table, conditions = {}) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  
  Object.entries(conditions).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });
  
  const { count, error } = await query;
  return { count: count || 0, error };
}

async function fetchRecords(supabase, table, columns = '*', limit = 1000, conditions = {}) {
  let query = supabase.from(table).select(columns).limit(limit);
  
  Object.entries(conditions).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });
  
  const { data, error } = await query;
  return { data: data || [], error };
}

// ============================================
// PRODUCT VALIDATION
// ============================================

async function validateProducts(supabase) {
  log.header('VALIDATING PRODUCTS');
  
  // Count total products
  const { count: totalProducts, error: countError } = await countRecords(supabase, 'products');
  if (countError) {
    results.products.errors.push(`Failed to count products: ${countError.message}`);
    log.error(`Failed to count products: ${countError.message}`);
    return;
  }
  
  log.info(`Total products in database: ${totalProducts}`);
  results.products.info.push(`Total products: ${totalProducts}`);
  
  // Count migrated products (with legacy_id)
  const { count: migratedProducts } = await countRecords(supabase, 'products', { legacy_id: 'not.null' });
  log.info(`Migrated products (with legacy_id): ${migratedProducts}`);
  results.products.info.push(`Migrated products: ${migratedProducts}`);
  
  // Fetch products for validation
  const { data: products, error: fetchError } = await fetchRecords(supabase, 'products', '*', 1000);
  if (fetchError) {
    results.products.errors.push(`Failed to fetch products: ${fetchError.message}`);
    log.error(`Failed to fetch products: ${fetchError.message}`);
    return;
  }
  
  // Validate each product
  let invalidPriceCount = 0;
  let invalidStockCount = 0;
  let duplicateSkuCount = 0;
  let missingNameCount = 0;
  let inactiveCount = 0;
  
  const skuMap = new Map();
  
  for (const product of products) {
    // Check for missing name
    if (!product.name || product.name.trim() === '' || product.name === 'Unknown Product') {
      missingNameCount++;
      results.products.warnings.push(`Product ${product.id} has missing or invalid name`);
    }
    
    // Check for invalid price
    const price = parseFloat(product.price);
    if (isNaN(price) || price < 0) {
      invalidPriceCount++;
      results.products.errors.push(`Product ${product.id} has invalid price: ${product.price}`);
    }
    
    // Check for invalid stock
    const stock = parseInt(product.stock);
    if (isNaN(stock) || stock < 0) {
      invalidStockCount++;
      results.products.warnings.push(`Product ${product.id} has invalid stock: ${product.stock}`);
    }
    
    // Check for inactive products
    if (product.is_active === false) {
      inactiveCount++;
    }
    
    // Check for duplicate SKUs
    if (product.sku) {
      const normalizedSku = product.sku.toLowerCase().trim();
      if (skuMap.has(normalizedSku)) {
        duplicateSkuCount++;
        results.products.warnings.push(`Duplicate SKU "${product.sku}" found on products: ${skuMap.get(normalizedSku)} and ${product.id}`);
      } else {
        skuMap.set(normalizedSku, product.id);
      }
    }
  }
  
  // Report findings
  if (missingNameCount > 0) {
    log.warning(`${missingNameCount} products have missing or invalid names`);
  }
  
  if (invalidPriceCount > 0) {
    log.error(`${invalidPriceCount} products have invalid prices`);
  } else {
    log.success('All products have valid prices');
  }
  
  if (invalidStockCount > 0) {
    log.warning(`${invalidStockCount} products have invalid stock values`);
  }
  
  if (duplicateSkuCount > 0) {
    log.warning(`${duplicateSkuCount} products have duplicate SKUs`);
  }
  
  log.info(`${inactiveCount} products are marked as inactive (archived)`);
  
  // Check for orphaned products (no orders, no stock movements)
  const { data: orderItems } = await supabase
    .from('orders')
    .select('items')
    .limit(1000);
  
  const productIdsWithOrders = new Set();
  orderItems?.forEach(order => {
    const items = order.items || [];
    items.forEach(item => {
      if (item.productId) {
        productIdsWithOrders.add(item.productId);
      }
    });
  });
  
  const orphanedProducts = products.filter(p => 
    !productIdsWithOrders.has(p.id) && 
    parseInt(p.stock || 0) === 0 &&
    p.legacy_id // Only consider migrated products
  );
  
  if (orphanedProducts.length > 0) {
    log.warning(`${orphanedProducts.length} migrated products have no orders and zero stock`);
    results.products.warnings.push(`${orphanedProducts.length} products may be orphaned (no orders, zero stock)`);
  }
}

// ============================================
// ORDER VALIDATION
// ============================================

async function validateOrders(supabase) {
  log.header('VALIDATING ORDERS');
  
  // Count total orders
  const { count: totalOrders, error: countError } = await countRecords(supabase, 'orders');
  if (countError) {
    results.orders.errors.push(`Failed to count orders: ${countError.message}`);
    log.error(`Failed to count orders: ${countError.message}`);
    return;
  }
  
  log.info(`Total orders in database: ${totalOrders}`);
  results.orders.info.push(`Total orders: ${totalOrders}`);
  
  // Count migrated orders
  const { count: migratedOrders } = await countRecords(supabase, 'orders', { legacy_id: 'not.null' });
  log.info(`Migrated orders (with legacy_id): ${migratedOrders}`);
  results.orders.info.push(`Migrated orders: ${migratedOrders}`);
  
  // Count orders by status
  const { data: statusCounts } = await supabase
    .from('orders')
    .select('status, count(*)')
    .group('status');
  
  log.info('Orders by status:');
  statusCounts?.forEach(s => {
    log.info(`  - ${s.status || 'null'}: ${s.count}`);
  });
  
  // Fetch orders for validation
  const { data: orders, error: fetchError } = await fetchRecords(supabase, 'orders', '*', 1000);
  if (fetchError) {
    results.orders.errors.push(`Failed to fetch orders: ${fetchError.message}`);
    log.error(`Failed to fetch orders: ${fetchError.message}`);
    return;
  }
  
  // Validate each order
  let invalidTotalCount = 0;
  let emptyItemsCount = 0;
  let invalidDateCount = 0;
  let missingCustomerCount = 0;
  
  for (const order of orders) {
    // Check for invalid total
    const total = parseFloat(order.total_amount);
    if (isNaN(total) || total < 0) {
      invalidTotalCount++;
      results.orders.errors.push(`Order ${order.id} has invalid total: ${order.total_amount}`);
    }
    
    // Check for empty items
    const items = order.items || [];
    if (!Array.isArray(items) || items.length === 0) {
      emptyItemsCount++;
      results.orders.warnings.push(`Order ${order.id} has no items`);
    }
    
    // Check for invalid dates
    if (!order.created_at || isNaN(new Date(order.created_at).getTime())) {
      invalidDateCount++;
      results.orders.errors.push(`Order ${order.id} has invalid created_at date`);
    }
    
    // Check for missing customer info
    if (!order.customer_name && !order.customer_id) {
      missingCustomerCount++;
      results.orders.warnings.push(`Order ${order.id} has no customer information`);
    }
  }
  
  if (invalidTotalCount > 0) {
    log.error(`${invalidTotalCount} orders have invalid totals`);
  } else {
    log.success('All orders have valid totals');
  }
  
  if (emptyItemsCount > 0) {
    log.warning(`${emptyItemsCount} orders have no items`);
  }
  
  if (invalidDateCount > 0) {
    log.error(`${invalidDateCount} orders have invalid dates`);
  }
  
  if (missingCustomerCount > 0) {
    log.warning(`${missingCustomerCount} orders have no customer information`);
  }
  
  // Check for orphaned order items (products not found)
  const { data: allProducts } = await supabase.from('products').select('id');
  const productIds = new Set(allProducts?.map(p => p.id) || []);
  
  let orphanedItemsCount = 0;
  orders.forEach(order => {
    const items = order.items || [];
    items.forEach(item => {
      if (item.productId && !productIds.has(item.productId)) {
        orphanedItemsCount++;
        results.orders.errors.push(`Order ${order.id} references non-existent product: ${item.productId}`);
      }
    });
  });
  
  if (orphanedItemsCount > 0) {
    log.error(`${orphanedItemsCount} order items reference non-existent products`);
  } else {
    log.success('All order items reference valid products');
  }
}

// ============================================
// CUSTOMER VALIDATION
// ============================================

async function validateCustomers(supabase) {
  log.header('VALIDATING CUSTOMERS');
  
  // Count total customers
  const { count: totalCustomers, error: countError } = await countRecords(supabase, 'customers');
  if (countError) {
    results.customers.errors.push(`Failed to count customers: ${countError.message}`);
    log.error(`Failed to count customers: ${countError.message}`);
    return;
  }
  
  log.info(`Total customers in database: ${totalCustomers}`);
  results.customers.info.push(`Total customers: ${totalCustomers}`);
  
  // Fetch customers for validation
  const { data: customers, error: fetchError } = await fetchRecords(supabase, 'customers', '*', 1000);
  if (fetchError) {
    results.customers.errors.push(`Failed to fetch customers: ${fetchError.message}`);
    log.error(`Failed to fetch customers: ${fetchError.message}`);
    return;
  }
  
  // Validate each customer
  let missingNameCount = 0;
  let invalidPhoneCount = 0;
  let duplicatePhoneCount = 0;
  
  const phoneMap = new Map();
  
  for (const customer of customers) {
    // Check for missing name
    if (!customer.name || customer.name.trim() === '') {
      missingNameCount++;
      results.customers.errors.push(`Customer ${customer.id} has no name`);
    }
    
    // Check phone format
    if (customer.phone) {
      const cleanedPhone = customer.phone.replace(/\s/g, '');
      if (!/^\+?\d{10,}$/.test(cleanedPhone)) {
        invalidPhoneCount++;
        results.customers.warnings.push(`Customer ${customer.id} has unusual phone format: ${customer.phone}`);
      }
      
      // Check for duplicate phones
      const normalizedPhone = cleanedPhone.toLowerCase();
      if (phoneMap.has(normalizedPhone)) {
        duplicatePhoneCount++;
        results.customers.warnings.push(`Duplicate phone "${customer.phone}" on customers: ${phoneMap.get(normalizedPhone)} and ${customer.id}`);
      } else {
        phoneMap.set(normalizedPhone, customer.id);
      }
    }
  }
  
  if (missingNameCount > 0) {
    log.error(`${missingNameCount} customers have no name`);
  } else {
    log.success('All customers have names');
  }
  
  if (invalidPhoneCount > 0) {
    log.warning(`${invalidPhoneCount} customers have unusual phone formats`);
  }
  
  if (duplicatePhoneCount > 0) {
    log.warning(`${duplicatePhoneCount} customers have duplicate phone numbers`);
  }
  
  // Check for customers without orders
  const { data: ordersWithCustomers } = await supabase
    .from('orders')
    .select('customer_id, customer_name')
    .not('customer_id', 'is', null);
  
  const customerIdsWithOrders = new Set(ordersWithCustomers?.map(o => o.customer_id) || []);
  const customerNamesWithOrders = new Set(ordersWithCustomers?.map(o => o.customer_name?.toLowerCase().trim()).filter(Boolean) || []);
  
  const customersWithoutOrders = customers.filter(c => 
    !customerIdsWithOrders.has(c.id) && 
    !customerNamesWithOrders.has(c.name?.toLowerCase().trim())
  );
  
  if (customersWithoutOrders.length > 0) {
    log.warning(`${customersWithoutOrders.length} customers have no orders`);
    results.customers.info.push(`${customersWithoutOrders.length} customers have no orders (may be extracted from migrated order usernames)`);
  }
}

// ============================================
// SUPPLIER VALIDATION
// ============================================

async function validateSuppliers(supabase) {
  log.header('VALIDATING SUPPLIERS');
  
  // Count total suppliers
  const { count: totalSuppliers, error: countError } = await countRecords(supabase, 'suppliers');
  if (countError) {
    results.suppliers.errors.push(`Failed to count suppliers: ${countError.message}`);
    log.error(`Failed to count suppliers: ${countError.message}`);
    return;
  }
  
  log.info(`Total suppliers in database: ${totalSuppliers}`);
  results.suppliers.info.push(`Total suppliers: ${totalSuppliers}`);
  
  // Count migrated suppliers
  const { count: migratedSuppliers } = await countRecords(supabase, 'suppliers', { legacy_id: 'not.null' });
  log.info(`Migrated suppliers (with legacy_id): ${migratedSuppliers}`);
  results.suppliers.info.push(`Migrated suppliers: ${migratedSuppliers}`);
}

// ============================================
// STOCK VALIDATION
// ============================================

async function validateStock(supabase) {
  log.header('VALIDATING STOCK DATA');
  
  // Check for negative stock
  const { data: negativeStock, error: negError } = await supabase
    .from('products')
    .select('id, name, stock')
    .lt('stock', 0);
  
  if (negError) {
    results.stock.errors.push(`Failed to check for negative stock: ${negError.message}`);
  } else if (negativeStock?.length > 0) {
    log.error(`${negativeStock.length} products have negative stock`);
    negativeStock.forEach(p => {
      results.stock.errors.push(`Product ${p.id} (${p.name}) has negative stock: ${p.stock}`);
    });
  } else {
    log.success('No products have negative stock');
  }
  
  // Check for low stock
  const { data: lowStock, error: lowError } = await supabase
    .from('products')
    .select('id, name, stock, min_stock')
    .lte('stock', supabase.raw('min_stock'))
    .gt('stock', 0);
  
  if (!lowError && lowStock) {
    log.warning(`${lowStock.length} products have low stock (below minimum)`);
    results.stock.info.push(`${lowStock.length} products have low stock`);
  }
  
  // Check for out of stock
  const { data: outOfStock, error: outError } = await supabase
    .from('products')
    .select('id, name')
    .eq('stock', 0)
    .eq('is_active', true);
  
  if (!outError && outOfStock) {
    log.warning(`${outOfStock.length} active products are out of stock`);
    results.stock.info.push(`${outOfStock.length} active products are out of stock`);
  }
  
  // Validate stock adjustments
  const { count: adjustmentCount } = await countRecords(supabase, 'stock_adjustments');
  log.info(`${adjustmentCount} stock adjustment records`);
  results.stock.info.push(`${adjustmentCount} stock adjustments`);
}

// ============================================
// SUMMARY REPORT
// ============================================

function generateSummary() {
  log.header('VALIDATION SUMMARY');
  
  const allErrors = [
    ...results.products.errors,
    ...results.orders.errors,
    ...results.customers.errors,
    ...results.suppliers.errors,
    ...results.stock.errors,
  ];
  
  const allWarnings = [
    ...results.products.warnings,
    ...results.orders.warnings,
    ...results.customers.warnings,
    ...results.suppliers.warnings,
    ...results.stock.warnings,
  ];
  
  log.info(`Total Errors: ${allErrors.length}`);
  log.info(`Total Warnings: ${allWarnings.length}`);
  
  if (allErrors.length === 0 && allWarnings.length === 0) {
    log.success('All validations passed! No issues found.');
  } else if (allErrors.length === 0) {
    log.warning('All critical validations passed, but some warnings were found.');
  } else {
    log.error('Some validations failed. Please review the issues above.');
  }
  
  // Suggest fixes
  log.header('SUGGESTED FIXES');
  
  if (results.products.errors.some(e => e.includes('invalid price'))) {
    log.info('To fix invalid product prices:');
    log.info('  UPDATE products SET price = 0 WHERE price IS NULL OR price < 0;');
  }
  
  if (results.orders.errors.some(e => e.includes('non-existent product'))) {
    log.info('To fix orphaned order items:');
    log.info('  - Review order items referencing deleted products');
    log.info('  - Either restore the products or remove the orphaned items');
  }
  
  if (results.stock.errors.some(e => e.includes('negative stock'))) {
    log.info('To fix negative stock:');
    log.info('  UPDATE products SET stock = 0 WHERE stock < 0;');
  }
  
  // Save report to file
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalErrors: allErrors.length,
      totalWarnings: allWarnings.length,
    },
    results,
  };
  
  const reportPath = join(process.cwd(), 'migration-validation-report.json');
  try {
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log.info(`Detailed report saved to: ${reportPath}`);
  } catch (e) {
    log.warning(`Could not save report to file: ${e.message}`);
  }
  
  return allErrors.length === 0;
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log(`${colors.cyan}
╔════════════════════════════════════════════════════════════╗
║     LKSCALE ERP - Migrated Data Validation Script          ║
║                                                            ║
║  This script validates data integrity after migration      ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  const supabase = getSupabaseClient();
  
  try {
    // Run validations
    await validateProducts(supabase);
    await validateOrders(supabase);
    await validateCustomers(supabase);
    await validateSuppliers(supabase);
    await validateStock(supabase);
    
    // Generate summary
    const success = generateSummary();
    
    process.exit(success ? 0 : 1);
  } catch (error) {
    log.error(`Unexpected error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

main();
