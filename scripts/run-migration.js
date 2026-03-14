#!/usr/bin/env node

/**
 * Data Migration Script
 * Migrates data from extracted JSON files to Supabase
 * 
 * Usage:
 *   node scripts/run-migration.js
 * 
 * Required environment variables in .env:
 *   SUPABASE_URL=<your-supabase-url>
 *   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
 *   MIGRATION_USER_ID=<target-user-id-for-data>
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  batchSize: 100,
  dataDir: path.join(__dirname, '../docs/base/extracted_data'),
  files: {
    manufacturers: 'dbo_Manufacturer.json',
    suppliers: 'dbo_Supplier.json',
    categories: 'dbo_ProductCategory.json',
    products: 'dbo_Product.json',
    locations: 'dbo_Location.json',
    outlets: 'dbo_Outlet.json',
    orders: 'dbo_Order.json',
    orderProducts: 'dbo_OrderProduct.json',
    consignmentNotes: 'dbo_ConsignmentNote.json',
    consignmentNoteProducts: 'dbo_ConsignmentNoteProduct.json',
    productLocations: 'dbo_ProductLocation.json',
    writeOffs: 'dbo_WriteOff.json',
    activityLogs: 'dbo_UserActivityLog.json',
  },
};

// ============================================================================
// ID MAPPING STORE
// ============================================================================

class IdMappingStore {
  constructor() {
    this.manufacturers = new Map();
    this.categories = new Map();
    this.suppliers = new Map();
    this.products = new Map();
    this.locations = new Map();
    this.outlets = new Map();
    this.orders = new Map();
    this.purchaseOrders = new Map();
  }

  generateUUID() {
    return crypto.randomUUID();
  }

  toJSON() {
    const mapToRecord = (map) => {
      const record = {};
      map.forEach((value, key) => {
        record[key] = value;
      });
      return record;
    };

    return {
      manufacturers: mapToRecord(this.manufacturers),
      categories: mapToRecord(this.categories),
      suppliers: mapToRecord(this.suppliers),
      products: mapToRecord(this.products),
      locations: mapToRecord(this.locations),
      outlets: mapToRecord(this.outlets),
      orders: mapToRecord(this.orders),
      purchaseOrders: mapToRecord(this.purchaseOrders),
    };
  }
}

// ============================================================================
// STATISTICS
// ============================================================================

class MigrationStats {
  constructor() {
    this.manufacturers = { total: 0, migrated: 0, errors: 0 };
    this.categories = { total: 0, migrated: 0, errors: 0 };
    this.suppliers = { total: 0, migrated: 0, errors: 0 };
    this.products = { total: 0, migrated: 0, errors: 0 };
    this.locations = { total: 0, migrated: 0, errors: 0 };
    this.outlets = { total: 0, migrated: 0, errors: 0 };
    this.orders = { total: 0, migrated: 0, errors: 0 };
    this.purchaseOrders = { total: 0, migrated: 0, errors: 0 };
    this.purchaseOrderItems = { total: 0, migrated: 0, errors: 0 };
    this.stockAdjustments = { total: 0, migrated: 0, errors: 0 };
    this.activityLogs = { total: 0, migrated: 0, errors: 0 };
    this.startTime = null;
    this.endTime = null;
  }

  start() {
    this.startTime = Date.now();
  }

  end() {
    this.endTime = Date.now();
  }

  get duration() {
    if (!this.startTime) return 0;
    const end = this.endTime || Date.now();
    return ((end - this.startTime) / 1000).toFixed(2);
  }

  get totalRecords() {
    return Object.values(this).reduce((sum, s) => {
      if (s && typeof s === 'object' && 'migrated' in s) {
        return sum + s.migrated;
      }
      return sum;
    }, 0);
  }

  get totalErrors() {
    return Object.values(this).reduce((sum, s) => {
      if (s && typeof s === 'object' && 'errors' in s) {
        return sum + s.errors;
      }
      return sum;
    }, 0);
  }

  get successRate() {
    const total = this.totalRecords + this.totalErrors;
    return total > 0 ? (((this.totalRecords - this.totalErrors) / total) * 100).toFixed(2) : '0.00';
  }

  printReport() {
    console.log('\n========================================');
    console.log('    DATA MIGRATION REPORT');
    console.log('========================================');
    console.log(`Generated: ${new Date().toISOString()}`);
    console.log(`Duration: ${this.duration} seconds`);
    console.log('');
    console.log('MIGRATION STATISTICS:');
    console.log('---------------------');
    console.log(`Manufacturers:     ${this.pad(this.manufacturers.migrated)}/${this.pad(this.manufacturers.total)} (errors: ${this.manufacturers.errors})`);
    console.log(`Categories:        ${this.pad(this.categories.migrated)}/${this.pad(this.categories.total)} (errors: ${this.categories.errors})`);
    console.log(`Suppliers:         ${this.pad(this.suppliers.migrated)}/${this.pad(this.suppliers.total)} (errors: ${this.suppliers.errors})`);
    console.log(`Products:          ${this.pad(this.products.migrated)}/${this.pad(this.products.total)} (errors: ${this.products.errors})`);
    console.log(`Locations:         ${this.pad(this.locations.migrated)}/${this.pad(this.locations.total)} (errors: ${this.locations.errors})`);
    console.log(`Outlets:           ${this.pad(this.outlets.migrated)}/${this.pad(this.outlets.total)} (errors: ${this.outlets.errors})`);
    console.log(`Orders:            ${this.pad(this.orders.migrated)}/${this.pad(this.orders.total)} (errors: ${this.orders.errors})`);
    console.log(`Purchase Orders:   ${this.pad(this.purchaseOrders.migrated)}/${this.pad(this.purchaseOrders.total)} (errors: ${this.purchaseOrders.errors})`);
    console.log(`PO Items:          ${this.pad(this.purchaseOrderItems.migrated)}/${this.pad(this.purchaseOrderItems.total)} (errors: ${this.purchaseOrderItems.errors})`);
    console.log(`Stock Adjustments: ${this.pad(this.stockAdjustments.migrated)}/${this.pad(this.stockAdjustments.total)} (errors: ${this.stockAdjustments.errors})`);
    console.log(`Activity Logs:     ${this.pad(this.activityLogs.migrated)}/${this.pad(this.activityLogs.total)} (errors: ${this.activityLogs.errors})`);
    console.log('');
    console.log('SUMMARY:');
    console.log('--------');
    console.log(`Total Records Migrated: ${this.totalRecords}`);
    console.log(`Total Errors: ${this.totalErrors}`);
    console.log(`Success Rate: ${this.successRate}%`);
    console.log('========================================\n');
  }

  pad(num) {
    return num.toString().padStart(5, ' ');
  }
}

// ============================================================================
// DATA MIGRATOR
// ============================================================================

class DataMigrator {
  constructor(supabase, userId) {
    this.supabase = supabase;
    this.userId = userId;
    this.idMap = new IdMappingStore();
    this.stats = new MigrationStats();
    this.batchSize = CONFIG.batchSize;
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  loadJsonFile(filename) {
    const filepath = path.join(CONFIG.dataDir, filename);
    try {
      const data = fs.readFileSync(filepath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Failed to load ${filename}:`, error.message);
      return [];
    }
  }

  parseDecimal(value) {
    if (!value) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  mapOrderStatus(oldStatus) {
    switch (oldStatus) {
      case 1: return 'completed';
      case 2: return 'pending';
      case 3: return 'processing';
      case 4: return 'cancelled';
      default: return 'pending';
    }
  }

  mapPaymentMethod(oldType) {
    switch (oldType) {
      case 1: return 'cash';
      case 2: return 'card';
      case 3: return 'transfer';
      case 4: return 'online';
      default: return 'cash';
    }
  }

  mapWriteOffType(oldType) {
    switch (oldType) {
      case 1: return 'write_off';
      case 2: return 'damage';
      case 3: return 'theft';
      case 4: return 'count';
      default: return 'other';
    }
  }

  mapActivityActionType(oldOperation) {
    const mapping = {
      'CreatedProduct': 'product_created',
      'EditProduct': 'product_updated',
      'DeleteProduct': 'product_deleted',
      'CreatedOrder': 'order_created',
      'EditOrder': 'order_updated',
      'DeleteOrder': 'order_deleted',
      'CreatedConsignmentNote': 'purchase_order_created',
      'EditConsignmentNote': 'purchase_order_updated',
      'CreatedWriteOff': 'stock_adjusted',
      'EditWriteOff': 'stock_adjusted',
    };
    return mapping[oldOperation] || 'other';
  }

  async insertBatch(table, records, statsKey) {
    const { data, error } = await this.supabase
      .from(table)
      .insert(records)
      .select();

    if (error) {
      console.error(`Error inserting into ${table}:`, error.message);
      this.stats[statsKey].errors += records.length;
      return null;
    }

    this.stats[statsKey].migrated += records.length;
    return data;
  }

  // ============================================================================
  // STEP 1: REFERENCE DATA (Manufacturers, Categories, Suppliers, Locations, Outlets)
  // ============================================================================

  async migrateManufacturers() {
    console.log('\n[Step 1.1] Migrating manufacturers...');
    const manufacturers = this.loadJsonFile(CONFIG.files.manufacturers);
    this.stats.manufacturers.total = manufacturers.length;

    // Build ID mapping and prepare records
    const records = manufacturers.map(m => {
      const newId = this.idMap.generateUUID();
      this.idMap.manufacturers.set(m.ManufacturerId, newId);
      return {
        id: newId,
        name: m.Name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });

    // Insert in batches
    for (let i = 0; i < records.length; i += this.batchSize) {
      const batch = records.slice(i, i + this.batchSize);
      await this.insertBatch('manufacturers', batch, 'manufacturers');
      process.stdout.write(`\r  Progress: ${Math.min(i + batch.length, records.length)}/${records.length}`);
    }
    console.log('');
    console.log(`  Migrated ${this.stats.manufacturers.migrated} manufacturers`);
  }

  async migrateCategories() {
    console.log('\n[Step 1.2] Migrating categories...');
    const categories = this.loadJsonFile(CONFIG.files.categories);
    this.stats.categories.total = categories.length;

    const records = categories.map(c => {
      const newId = this.idMap.generateUUID();
      this.idMap.categories.set(c.ProductCategoryId, newId);
      return {
        id: newId,
        name: c.Name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });

    for (let i = 0; i < records.length; i += this.batchSize) {
      const batch = records.slice(i, i + this.batchSize);
      await this.insertBatch('categories', batch, 'categories');
      process.stdout.write(`\r  Progress: ${Math.min(i + batch.length, records.length)}/${records.length}`);
    }
    console.log('');
    console.log(`  Migrated ${this.stats.categories.migrated} categories`);
  }

  async migrateSuppliers() {
    console.log('\n[Step 1.3] Migrating suppliers...');
    const suppliers = this.loadJsonFile(CONFIG.files.suppliers);
    this.stats.suppliers.total = suppliers.length;

    const records = suppliers.map(s => {
      const newId = this.idMap.generateUUID();
      this.idMap.suppliers.set(s.SupplierId, newId);
      return {
        id: newId,
        name: s.Name,
        contact_name: null,
        email: null,
        phone: null,
        address: null,
        website: null,
        notes: null,
        payment_terms: null,
        lead_time_days: 7,
        rating: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: this.userId,
      };
    });

    for (let i = 0; i < records.length; i += this.batchSize) {
      const batch = records.slice(i, i + this.batchSize);
      await this.insertBatch('suppliers', batch, 'suppliers');
      process.stdout.write(`\r  Progress: ${Math.min(i + batch.length, records.length)}/${records.length}`);
    }
    console.log('');
    console.log(`  Migrated ${this.stats.suppliers.migrated} suppliers`);
  }

  async migrateLocations() {
    console.log('\n[Step 1.4] Migrating locations...');
    const locations = this.loadJsonFile(CONFIG.files.locations);
    this.stats.locations.total = locations.length;

    const records = locations.map(l => {
      const newId = this.idMap.generateUUID();
      this.idMap.locations.set(l.LocationId, newId);
      return {
        id: newId,
        name: l.Name,
        type: l.Type === 1 ? 'warehouse' : l.Type === 2 ? 'store' : 'other',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: this.userId,
      };
    });

    for (let i = 0; i < records.length; i += this.batchSize) {
      const batch = records.slice(i, i + this.batchSize);
      await this.insertBatch('locations', batch, 'locations');
      process.stdout.write(`\r  Progress: ${Math.min(i + batch.length, records.length)}/${records.length}`);
    }
    console.log('');
    console.log(`  Migrated ${this.stats.locations.migrated} locations`);
  }

  async migrateOutlets() {
    console.log('\n[Step 1.5] Migrating outlets...');
    const outlets = this.loadJsonFile(CONFIG.files.outlets);
    this.stats.outlets.total = outlets.length;

    const records = outlets.map(o => {
      const newId = this.idMap.generateUUID();
      this.idMap.outlets.set(o.OutletId, newId);
      return {
        id: newId,
        name: o.Name,
        type: o.Type === 1 ? 'physical' : o.Type === 2 ? 'online' : 'marketplace',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: this.userId,
      };
    });

    for (let i = 0; i < records.length; i += this.batchSize) {
      const batch = records.slice(i, i + this.batchSize);
      await this.insertBatch('outlets', batch, 'outlets');
      process.stdout.write(`\r  Progress: ${Math.min(i + batch.length, records.length)}/${records.length}`);
    }
    console.log('');
    console.log(`  Migrated ${this.stats.outlets.migrated} outlets`);
  }

  // ============================================================================
  // STEP 2: PRODUCTS
  // ============================================================================

  async migrateProducts() {
    console.log('\n[Step 2] Migrating products...');
    const products = this.loadJsonFile(CONFIG.files.products);
    const categories = this.loadJsonFile(CONFIG.files.categories);
    const manufacturers = this.loadJsonFile(CONFIG.files.manufacturers);
    this.stats.products.total = products.length;

    // Build name maps for reference
    const categoryNameMap = new Map(categories.map(c => [c.ProductCategoryId, c.Name]));
    const manufacturerNameMap = new Map(manufacturers.map(m => [m.ManufacturerId, m.Name]));

    const records = products.map(p => {
      const newId = this.idMap.generateUUID();
      this.idMap.products.set(p.ProductId, newId);

      const categoryName = p.CategoryId ? categoryNameMap.get(p.CategoryId) : null;
      const manufacturerName = p.ManufacturerId ? manufacturerNameMap.get(p.ManufacturerId) : null;

      return {
        id: newId,
        name: p.Name,
        sku: p.VendorCode || null,
        barcode: p.ManufacturerBarcodes || null,
        price: this.parseDecimal(p.PriceTypeValue),
        cost_price: 0,
        stock: 0,
        min_stock: p.MinStock || 0,
        category: categoryName || 'Без категории',
        category_id: p.CategoryId ? this.idMap.categories.get(p.CategoryId) : null,
        manufacturer: manufacturerName || null,
        manufacturer_id: p.ManufacturerId ? this.idMap.manufacturers.get(p.ManufacturerId) : null,
        description: p.Description,
        image_url: null,
        images: null,
        is_active: !p.IsArchive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: this.userId,
      };
    });

    for (let i = 0; i < records.length; i += this.batchSize) {
      const batch = records.slice(i, i + this.batchSize);
      await this.insertBatch('products', batch, 'products');
      process.stdout.write(`\r  Progress: ${Math.min(i + batch.length, records.length)}/${records.length}`);
    }
    console.log('');
    console.log(`  Migrated ${this.stats.products.migrated} products`);
  }

  // ============================================================================
  // STEP 3: ORDERS WITH ITEMS
  // ============================================================================

  async migrateOrders() {
    console.log('\n[Step 3] Migrating orders with items...');
    const orders = this.loadJsonFile(CONFIG.files.orders);
    const orderProducts = this.loadJsonFile(CONFIG.files.orderProducts);
    this.stats.orders.total = orders.length;

    // Build order items map
    const orderItemsMap = new Map();
    orderProducts.forEach(op => {
      if (!orderItemsMap.has(op.OrderId)) {
        orderItemsMap.set(op.OrderId, []);
      }
      orderItemsMap.get(op.OrderId).push(op);
    });

    // Process orders in batches
    for (let i = 0; i < orders.length; i += this.batchSize) {
      const batch = orders.slice(i, i + this.batchSize);
      const ordersToInsert = [];

      for (const order of batch) {
        const newId = this.idMap.generateUUID();
        this.idMap.orders.set(order.OrderId, newId);

        const items = orderItemsMap.get(order.OrderId) || [];
        const orderItems = items.map(item => {
          const productId = this.idMap.products.get(item.ProductId);
          return {
            id: this.idMap.generateUUID(),
            productId: productId || '',
            productName: '',
            quantity: item.Count,
            price: this.parseDecimal(item.Price),
            sku: '',
          };
        }).filter(item => item.productId);

        const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemsCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);

        ordersToInsert.push({
          id: newId,
          order_number: `ORD-${order.OrderId}`,
          status: this.mapOrderStatus(order.Status),
          total_amount: totalAmount,
          items_count: itemsCount,
          customer_id: null,
          customer_name: null,
          customer_phone: null,
          customer_address: null,
          notes: order.Comment,
          payment_method: this.mapPaymentMethod(order.PaymentType),
          items: orderItems,
          created_at: order.CreatedDateUtc,
          updated_at: order.CreatedDateUtc,
          user_id: this.userId,
        });
      }

      const { error } = await this.supabase.from('orders').insert(ordersToInsert);
      if (error) {
        console.error(`\nError inserting orders batch:`, error.message);
        this.stats.orders.errors += batch.length;
      } else {
        this.stats.orders.migrated += batch.length;
      }

      process.stdout.write(`\r  Progress: ${Math.min(i + batch.length, orders.length)}/${orders.length}`);
    }
    console.log('');
    console.log(`  Migrated ${this.stats.orders.migrated} orders`);
  }

  // ============================================================================
  // STEP 4: CONSIGNMENT NOTES (Purchase Orders) WITH PRODUCTS
  // ============================================================================

  async migratePurchaseOrders() {
    console.log('\n[Step 4] Migrating purchase orders with items...');
    const consignmentNotes = this.loadJsonFile(CONFIG.files.consignmentNotes);
    const consignmentNoteProducts = this.loadJsonFile(CONFIG.files.consignmentNoteProducts);
    this.stats.purchaseOrders.total = consignmentNotes.length;
    this.stats.purchaseOrderItems.total = consignmentNoteProducts.length;

    // Build items map
    const itemsMap = new Map();
    consignmentNoteProducts.forEach(cnp => {
      if (!itemsMap.has(cnp.ConsignmentNoteId)) {
        itemsMap.set(cnp.ConsignmentNoteId, []);
      }
      itemsMap.get(cnp.ConsignmentNoteId).push(cnp);
    });

    // Process purchase orders in batches
    for (let i = 0; i < consignmentNotes.length; i += this.batchSize) {
      const batch = consignmentNotes.slice(i, i + this.batchSize);
      const purchaseOrdersToInsert = [];
      const purchaseOrderItemsToInsert = [];

      for (const cn of batch) {
        const newId = this.idMap.generateUUID();
        this.idMap.purchaseOrders.set(cn.ConsignmentNoteId, newId);

        const items = itemsMap.get(cn.ConsignmentNoteId) || [];
        const totalAmount = items.reduce((sum, item) =>
          sum + (this.parseDecimal(item.PurchasePrice) * item.Count), 0
        );
        const totalItems = items.reduce((sum, item) => sum + item.Count, 0);

        purchaseOrdersToInsert.push({
          id: newId,
          order_number: `PO-${cn.ConsignmentNoteId}`,
          supplier_id: this.idMap.suppliers.get(cn.SupplierId),
          status: 'received',
          total_amount: totalAmount,
          total_items: totalItems,
          notes: null,
          expected_date: null,
          received_date: cn.CreatedDateUtc,
          created_at: cn.CreatedDateUtc,
          updated_at: cn.CreatedDateUtc,
          user_id: this.userId,
        });

        items.forEach(item => {
          const productId = this.idMap.products.get(item.ProductId);
          purchaseOrderItemsToInsert.push({
            id: this.idMap.generateUUID(),
            purchase_order_id: newId,
            product_id: productId,
            product_name: '',
            product_sku: null,
            quantity_ordered: item.Count,
            quantity_received: item.Count,
            unit_cost: this.parseDecimal(item.PurchasePrice),
            total_cost: this.parseDecimal(item.PurchasePrice) * item.Count,
            created_at: item.ReceivedDateUtc,
          });
        });
      }

      // Insert purchase orders
      const { error: poError } = await this.supabase.from('purchase_orders').insert(purchaseOrdersToInsert);
      if (poError) {
        console.error(`\nError inserting purchase orders:`, poError.message);
        this.stats.purchaseOrders.errors += batch.length;
      } else {
        this.stats.purchaseOrders.migrated += batch.length;
      }

      // Insert purchase order items
      if (purchaseOrderItemsToInsert.length > 0) {
        const { error: itemError } = await this.supabase.from('purchase_order_items').insert(purchaseOrderItemsToInsert);
        if (itemError) {
          console.error(`\nError inserting purchase order items:`, itemError.message);
          this.stats.purchaseOrderItems.errors += purchaseOrderItemsToInsert.length;
        } else {
          this.stats.purchaseOrderItems.migrated += purchaseOrderItemsToInsert.length;
        }
      }

      process.stdout.write(`\r  Progress: ${Math.min(i + batch.length, consignmentNotes.length)}/${consignmentNotes.length}`);
    }
    console.log('');
    console.log(`  Migrated ${this.stats.purchaseOrders.migrated} purchase orders`);
    console.log(`  Migrated ${this.stats.purchaseOrderItems.migrated} purchase order items`);
  }

  // ============================================================================
  // STEP 5: STOCK DATA (Product Locations + Write-offs)
  // ============================================================================

  async migrateStockData() {
    console.log('\n[Step 5] Migrating stock data...');

    // Migrate product locations as stock records
    const productLocations = this.loadJsonFile(CONFIG.files.productLocations);
    console.log(`  Found ${productLocations.length} product location records`);

    // Aggregate stock by product
    const stockByProduct = new Map();
    productLocations.forEach(pl => {
      const current = stockByProduct.get(pl.ProductId) || 0;
      stockByProduct.set(pl.ProductId, current + pl.Count);
    });

    // Update product stock levels
    let updatedCount = 0;
    console.log('  Updating product stock levels...');
    for (const [productId, stock] of stockByProduct) {
      const newProductId = this.idMap.products.get(productId);
      if (newProductId) {
        const { error } = await this.supabase
          .from('products')
          .update({ stock })
          .eq('id', newProductId);

        if (error) {
          console.error(`\n  Error updating stock for product ${productId}:`, error.message);
        } else {
          updatedCount++;
        }
      }
      if (updatedCount % 100 === 0) {
        process.stdout.write(`\r  Updated: ${updatedCount}/${stockByProduct.size}`);
      }
    }
    console.log(`\r  Updated stock for ${updatedCount} products`);

    // Migrate write-offs as stock adjustments
    const writeOffs = this.loadJsonFile(CONFIG.files.writeOffs);
    this.stats.stockAdjustments.total = writeOffs.length;

    const adjustmentsToInsert = writeOffs.map(wo => {
      const productId = this.idMap.products.get(wo.ProductId);
      const purchasePrice = this.parseDecimal(wo.PurchasePrice);

      return {
        id: this.idMap.generateUUID(),
        product_id: productId,
        product_name: '',
        product_sku: null,
        adjustment_type: this.mapWriteOffType(wo.Type),
        quantity_change: -wo.Count,
        previous_stock: 0,
        new_stock: 0,
        unit_cost: purchasePrice,
        total_value: purchasePrice * wo.Count,
        reason: 'Write-off from old system',
        reference_number: `WO-${wo.WriteOffId}`,
        created_at: wo.CreatedDateUtc,
        user_id: this.userId,
      };
    }).filter(a => a.product_id);

    for (let i = 0; i < adjustmentsToInsert.length; i += this.batchSize) {
      const batch = adjustmentsToInsert.slice(i, i + this.batchSize);
      await this.insertBatch('stock_adjustments', batch, 'stockAdjustments');
      process.stdout.write(`\r  Progress: ${Math.min(i + batch.length, adjustmentsToInsert.length)}/${adjustmentsToInsert.length}`);
    }
    console.log('');
    console.log(`  Migrated ${this.stats.stockAdjustments.migrated} stock adjustments`);
  }

  // ============================================================================
  // STEP 6: ACTIVITY LOGS
  // ============================================================================

  async migrateActivityLogs() {
    console.log('\n[Step 6] Migrating activity logs...');
    const activityLogs = this.loadJsonFile(CONFIG.files.activityLogs);
    this.stats.activityLogs.total = activityLogs.length;

    // Process in batches
    const records = activityLogs.map(log => {
      let entityId = null;
      let entityType = 'other';

      // Try to extract entity info from Data JSON
      try {
        const data = JSON.parse(log.Data);
        if (data.product?.id) {
          entityId = this.idMap.products.get(data.product.id);
          entityType = 'product';
        } else if (data.order?.id) {
          entityId = this.idMap.orders.get(data.order.id);
          entityType = 'order';
        }
      } catch {
        // Ignore parse errors
      }

      return {
        id: this.idMap.generateUUID(),
        user_id: this.userId,
        username: log.Username,
        action_type: this.mapActivityActionType(log.Operation),
        entity_type: entityType,
        entity_id: entityId,
        details: log.Data,
        ip_address: null,
        user_agent: null,
        created_at: log.CreatedDateUtc,
      };
    });

    for (let i = 0; i < records.length; i += this.batchSize) {
      const batch = records.slice(i, i + this.batchSize);
      await this.insertBatch('user_activity_logs', batch, 'activityLogs');
      process.stdout.write(`\r  Progress: ${Math.min(i + batch.length, records.length)}/${records.length}`);
    }
    console.log('');
    console.log(`  Migrated ${this.stats.activityLogs.migrated} activity logs`);
  }

  // ============================================================================
  // MAIN MIGRATION
  // ============================================================================

  async run() {
    console.log('========================================');
    console.log('    DATA MIGRATION STARTED');
    console.log('========================================');
    console.log(`User ID: ${this.userId}`);
    console.log(`Batch Size: ${this.batchSize}`);
    console.log('');

    this.stats.start();

    try {
      // Step 1: Reference data (no dependencies)
      await this.migrateManufacturers();
      await this.migrateCategories();
      await this.migrateSuppliers();
      await this.migrateLocations();
      await this.migrateOutlets();

      // Step 2: Products (depends on manufacturers, categories)
      await this.migrateProducts();

      // Step 3: Orders (depends on products, outlets)
      await this.migrateOrders();

      // Step 4: Purchase orders (depends on suppliers, products)
      await this.migratePurchaseOrders();

      // Step 5: Stock data (depends on products, purchase orders)
      await this.migrateStockData();

      // Step 6: Activity logs (no dependencies)
      await this.migrateActivityLogs();

      this.stats.end();

      console.log('\n========================================');
      console.log('    MIGRATION COMPLETED SUCCESSFULLY');
      console.log('========================================');

      this.stats.printReport();

      // Save ID mappings to file for reference
      const mappingsPath = path.join(__dirname, 'migration-id-mappings.json');
      fs.writeFileSync(mappingsPath, JSON.stringify(this.idMap.toJSON(), null, 2));
      console.log(`ID mappings saved to: ${mappingsPath}`);

    } catch (error) {
      this.stats.end();
      console.error('\n========================================');
      console.error('    MIGRATION FAILED');
      console.error('========================================');
      console.error(error);
      process.exit(1);
    }
  }
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

async function main() {
  // Validate environment variables
  const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const userId = process.env.MIGRATION_USER_ID;

  if (!supabaseUrl) {
    console.error('Error: SUPABASE_URL or EXPO_PUBLIC_SUPABASE_URL environment variable is required');
    process.exit(1);
  }

  if (!supabaseKey) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    console.error('Note: Use the service role key, not the anon key, for admin privileges');
    process.exit(1);
  }

  if (!userId) {
    console.error('Error: MIGRATION_USER_ID environment variable is required');
    console.error('This is the user ID that will own all migrated data');
    process.exit(1);
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Test connection
  console.log('Testing Supabase connection...');
  const { data, error } = await supabase.from('products').select('count').limit(1);
  if (error && !error.message.includes('does not exist')) {
    console.error('Failed to connect to Supabase:', error.message);
    process.exit(1);
  }
  console.log('Connected to Supabase successfully\n');

  // Run migration
  const migrator = new DataMigrator(supabase, userId);
  await migrator.run();
}

// Run main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
