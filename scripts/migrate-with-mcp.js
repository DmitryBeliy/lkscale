#!/usr/bin/env node

/**
 * Lkscale ERP Database Migration Script
 * Uses Supabase REST API to migrate data from JSON files to Supabase
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const CONFIG = {
  projectId: 'onnncepenxxxfprqaodu',
  supabaseUrl: 'https://onnncepenxxxfprqaodu.supabase.co',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubm5jZXBlbnh4eGZwcnFhb2R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4MTk4NywiZXhwIjoyMDg4MDU3OTg3fQ.z0vhXCfPqFmN13kA0bJYu1xDBMQVxzk7hWNZUe_Ly7I',
  dataDir: path.join(__dirname, '..', 'docs', 'base', 'extracted_data'),
  batchSize: 100,
};

// ID mapping storage (old INT ID -> new UUID)
const idMappings = {
  manufacturers: new Map(),
  suppliers: new Map(),
  locations: new Map(),
  products: new Map(),
  consignmentNotes: new Map(),
  consignmentNoteProducts: new Map(),
  orders: new Map(),
  orderProducts: new Map(),
  writeOffs: new Map(),
  productLocations: new Map(),
  userActivityLogs: new Map(),
};

// Utility: Generate UUID from integer ID (deterministic)
function generateUUID(id, prefix) {
  const hash = crypto.createHash('md5').update(prefix + '_' + id).digest('hex');
  return hash.substring(0, 8) + '-' + hash.substring(8, 12) + '-' + hash.substring(12, 16) + '-' + hash.substring(16, 20) + '-' + hash.substring(20, 32);
}

// Utility: Delay for rate limiting
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Utility: Log with timestamp
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = level === 'error' ? '[ERROR]' : level === 'warn' ? '[WARN]' : '[INFO]';
  console.log(prefix + ' [' + timestamp + '] ' + message);
}

// Supabase REST API client
class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
  }

  async request(table, method, data = null, query = '') {
    const url = this.url + '/rest/v1/' + table + (query ? '?' + query : '');
    const headers = {
      'apikey': this.key,
      'Authorization': 'Bearer ' + this.key,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=minimal' : 'return=representation',
    };
    const options = { method: method, headers: headers };
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('HTTP ' + response.status + ': ' + errorText);
    }
    if (method === 'GET') {
      return await response.json();
    }
    return true;
  }

  async insert(table, records) {
    return this.request(table, 'POST', records);
  }

  async select(table, query = '') {
    return this.request(table, 'GET', null, query);
  }
}

// Load JSON data from file
function loadJSON(filename) {
  const filepath = path.join(CONFIG.dataDir, filename);
  log('Loading ' + filename + '...');
  const data = fs.readFileSync(filepath, 'utf8');
  const parsed = JSON.parse(data);
  log('Loaded ' + parsed.length + ' records from ' + filename);
  return parsed;
}

// Process records in batches
async function processBatches(records, batchSize, processor) {
  const total = records.length;
  let processed = 0;
  let errors = 0;
  for (let i = 0; i < total; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    try {
      await processor(batch);
      processed += batch.length;
      log('Progress: ' + processed + '/' + total + ' (' + Math.round((processed/total)*100) + '%)');
    } catch (error) {
      log('Batch error at ' + i + ': ' + error.message, 'error');
      errors += batch.length;
      for (const record of batch) {
        try {
          await processor([record]);
          processed++;
        } catch (innerError) {
          log('Record error: ' + innerError.message, 'error');
        }
      }
    }
    await delay(100);
  }
  return { processed: processed, errors: errors };
}

async function migrateManufacturers(client) {
  log('\n=== Migrating Manufacturers ===');
  const records = loadJSON('dbo_Manufacturer.json');
  const transform = (record) => {
    const id = generateUUID(record.ManufacturerId, 'manufacturer');
    idMappings.manufacturers.set(record.ManufacturerId, id);
    return { id: id, name: record.Name };
  };
  const result = await processBatches(records, CONFIG.batchSize, async (batch) => {
    await client.insert('manufacturers', batch.map(transform));
  });
  log('Manufacturers: ' + result.processed + ' migrated, ' + result.errors + ' errors');
}

async function migrateSuppliers(client) {
  log('\n=== Migrating Suppliers ===');
  const records = loadJSON('dbo_Supplier.json');
  const transform = (record) => {
    const id = generateUUID(record.SupplierId, 'supplier');
    idMappings.suppliers.set(record.SupplierId, id);
    return { id: id, name: record.Name };
  };
  const result = await processBatches(records, CONFIG.batchSize, async (batch) => {
    await client.insert('suppliers', batch.map(transform));
  });
  log('Suppliers: ' + result.processed + ' migrated, ' + result.errors + ' errors');
}

async function migrateLocations(client) {
  log('\n=== Migrating Locations ===');
  const records = loadJSON('dbo_Location.json');
  const transform = (record) => {
    const id = generateUUID(record.LocationId, 'location');
    idMappings.locations.set(record.LocationId, id);
    return { id: id, name: record.Name, type: record.Type || 1 };
  };
  const result = await processBatches(records, CONFIG.batchSize, async (batch) => {
    await client.insert('locations', batch.map(transform));
  });
  log('Locations: ' + result.processed + ' migrated, ' + result.errors + ' errors');
}

async function migrateProducts(client) {
  log('\n=== Migrating Products ===');
  const records = loadJSON('dbo_Product.json');
  const transform = (record) => {
    const id = generateUUID(record.ProductId, 'product');
    idMappings.products.set(record.ProductId, id);
    const manufacturerId = record.ManufacturerId ? idMappings.manufacturers.get(record.ManufacturerId) : null;
    return {
      id: id,
      vendor_code: record.VendorCode,
      name: record.Name,
      manufacturer_id: manufacturerId,
      category_id: record.CategoryId,
      type_id: record.TypeId,
      price_type: record.PriceType || 1,
      price_type_value: record.PriceTypeValue ? parseFloat(record.PriceTypeValue) : null,
      currency_code: record.CurrencyCode || 'RUB',
      description: record.Description,
      min_stock: record.MinStock,
      is_archive: record.IsArchive || false,
      manufacturer_barcodes: record.ManufacturerBarcodes,
    };
  };
  const result = await processBatches(records, CONFIG.batchSize, async (batch) => {
    await client.insert('products', batch.map(transform));
  });
  log('Products: ' + result.processed + ' migrated, ' + result.errors + ' errors');
}

async function migrateConsignmentNotes(client) {
  log('\n=== Migrating Consignment Notes ===');
  const records = loadJSON('dbo_ConsignmentNote.json');
  const transform = (record) => {
    const id = generateUUID(record.ConsignmentNoteId, 'consignment_note');
    idMappings.consignmentNotes.set(record.ConsignmentNoteId, id);
    const supplierId = record.SupplierId ? idMappings.suppliers.get(record.SupplierId) : null;
    return {
      id: id,
      supplier_id: supplierId,
      created_date: record.CreatedDateUtc,
      is_owner_balance: record.IsOwnerBalance !== false,
    };
  };
  const result = await processBatches(records, CONFIG.batchSize, async (batch) => {
    await client.insert('consignment_notes', batch.map(transform));
  });
  log('Consignment Notes: ' + result.processed + ' migrated, ' + result.errors + ' errors');
}

async function migrateConsignmentNoteProducts(client) {
  log('\n=== Migrating Consignment Note Products ===');
  const records = loadJSON('dbo_ConsignmentNoteProduct.json');
  const transform = (record) => {
    const id = generateUUID(record.ConsignmentNoteProductId, 'cnp');
    idMappings.consignmentNoteProducts.set(record.ConsignmentNoteProductId, id);
    return {
      id: id,
      consignment_note_id: record.ConsignmentNoteId ? idMappings.consignmentNotes.get(record.ConsignmentNoteId) : null,
      product_id: record.ProductId ? idMappings.products.get(record.ProductId) : null,
      purchase_price: record.PurchasePrice ? parseFloat(record.PurchasePrice) : null,
      count: record.Count || 0,
      start_location_id: record.StartLocationId ? idMappings.locations.get(record.StartLocationId) : null,
      sold_count: record.SoldCount || 0,
      received_date: record.ReceivedDateUtc,
    };
  };
  const result = await processBatches(records, CONFIG.batchSize, async (batch) => {
    await client.insert('consignment_note_products', batch.map(transform));
  });
  log('Consignment Note Products: ' + result.processed + ' migrated, ' + result.errors + ' errors');
}

async function migrateProductLocations(client) {
  log('\n=== Migrating Product Locations ===');
  const records = loadJSON('dbo_ProductLocation.json');
  const transform = (record) => {
    const id = generateUUID(record.ProductLocationId, 'pl');
    idMappings.productLocations.set(record.ProductLocationId, id);
    return {
      id: id,
      product_id: record.ProductId ? idMappings.products.get(record.ProductId) : null,
      location_id: record.LocationId ? idMappings.locations.get(record.LocationId) : null,
      count: record.Count || 0,
      storage_cell: record.StorageCell,
    };
  };
  const result = await processBatches(records, CONFIG.batchSize, async (batch) => {
    await client.insert('product_locations', batch.map(transform));
  });
  log('Product Locations: ' + result.processed + ' migrated, ' + result.errors + ' errors');
}

async function migrateWriteOffs(client) {
  log('\n=== Migrating Write Offs ===');
  const records = loadJSON('dbo_WriteOff.json');
  const transform = (record) => {
    const id = generateUUID(record.WriteOffId, 'writeoff');
    idMappings.writeOffs.set(record.WriteOffId, id);
    return {
      id: id,
      product_id: record.ProductId ? idMappings.products.get(record.ProductId) : null,
      count: record.Count || 0,
      purchase_price: record.PurchasePrice ? parseFloat(record.PurchasePrice) : null,
      consignment_note_id: record.ConsignmentNoteId ? idMappings.consignmentNotes.get(record.ConsignmentNoteId) : null,
      type: record.Type || 1,
      created_date: record.CreatedDateUtc,
    };
  };
  const result = await processBatches(records, CONFIG.batchSize, async (batch) => {
    await client.insert('write_offs', batch.map(transform));
  });
  log('Write Offs: ' + result.processed + ' migrated, ' + result.errors + ' errors');
}

async function migrateOrders(client) {
  log('\n=== Migrating Orders ===');
  const records = loadJSON('dbo_Order.json');
  const transform = (record) => {
    const id = generateUUID(record.OrderId, 'order');
    idMappings.orders.set(record.OrderId, id);
    return {
      id: id,
      status: record.Status || 1,
      created_date: record.CreatedDateUtc,
      outlet_id: record.OutletId,
      username: record.Username,
      comment: record.Comment,
      payment_type: record.PaymentType || 1,
      loyalty_card_number: record.LoyaltyCardNumber,
    };
  };
  const result = await processBatches(records, CONFIG.batchSize, async (batch) => {
    await client.insert('orders', batch.map(transform));
  });
  log('Orders: ' + result.processed + ' migrated, ' + result.errors + ' errors');
}

async function migrateOrderProducts(client) {
  log('\n=== Migrating Order Products ===');
  const records = loadJSON('dbo_OrderProduct.json');
  const transform = (record) => {
    const id = generateUUID(record.OrderProductId, 'op');
    idMappings.orderProducts.set(record.OrderProductId, id);
    return {
      id: id,
      order_id: record.OrderId ? idMappings.orders.get(record.OrderId) : null,
      product_id: record.ProductId ? idMappings.products.get(record.ProductId) : null,
      purchase_price: record.PurchasePrice ? parseFloat(record.PurchasePrice) : null,
      price: record.Price ? parseFloat(record.Price) : null,
      count: record.Count || 0,
      consignment_note_id: record.ConsignmentNoteId ? idMappings.consignmentNotes.get(record.ConsignmentNoteId) : null,
      refund_count: record.RefundCount || 0,
    };
  };
  const result = await processBatches(records, CONFIG.batchSize, async (batch) => {
    await client.insert('order_products', batch.map(transform));
  });
  log('Order Products: ' + result.processed + ' migrated, ' + result.errors + ' errors');
}

async function migrateUserActivityLogs(client) {
  log('\n=== Migrating User Activity Logs ===');
  const records = loadJSON('dbo_UserActivityLog.json');
  const transform = (record) => {
    const id = generateUUID(record.UserActivityLogId, 'ual');
    idMappings.userActivityLogs.set(record.UserActivityLogId, id);
    return {
      id: id,
      username: record.Username,
      operation: record.Operation,
      created_date: record.CreatedDateUtc,
      data: record.Data ? JSON.parse(record.Data) : null,
    };
  };
  const result = await processBatches(records, CONFIG.batchSize, async (batch) => {
    await client.insert('user_activity_logs', batch.map(transform));
  });
  log('User Activity Logs: ' + result.processed + ' migrated, ' + result.errors + ' errors');
}

function saveIdMappings() {
  const mappings = {};
  for (const [table, map] of Object.entries(idMappings)) {
    mappings[table] = Object.fromEntries(map);
  }
  const outputPath = path.join(__dirname, '..', 'id_mappings.json');
  fs.writeFileSync(outputPath, JSON.stringify(mappings, null, 2));
  log('\nID mappings saved to ' + outputPath);
}

async function runMigration() {
  log('========================================');
  log('Lkscale ERP Database Migration');
  log('========================================\n');
  
  const client = new SupabaseClient(CONFIG.supabaseUrl, CONFIG.serviceKey);
  
  try {
    log('Testing Supabase connection...');
    await client.select('manufacturers', 'limit=1');
    log('Connection successful\n');
    
    log('Step 1: Migrating reference data...');
    await migrateManufacturers(client);
    await migrateSuppliers(client);
    await migrateLocations(client);
    
    log('\nStep 2: Migrating products...');
    await migrateProducts(client);
    
    log('\nStep 3: Migrating inventory data...');
    await migrateConsignmentNotes(client);
    await migrateConsignmentNoteProducts(client);
    await migrateProductLocations(client);
    await migrateWriteOffs(client);
    
    log('\nStep 4: Migrating orders...');
    await migrateOrders(client);
    await migrateOrderProducts(client);
    
    log('\nStep 5: Migrating activity logs...');
    await migrateUserActivityLogs(client);
    
    saveIdMappings();
    
    log('\n========================================');
    log('Migration completed successfully!');
    log('========================================');
    
  } catch (error) {
    log('\nMigration failed: ' + error.message, 'error');
    console.error(error);
    process.exit(1);
  }
}

runMigration();
