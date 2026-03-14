-- ============================================
-- DATA MIGRATION SERVICE FIXES
-- ============================================
-- Patch file for services/dataMigrationService.ts
-- Apply these changes to fix field mapping issues
-- ============================================

-- This file contains SQL equivalents and documentation for the TypeScript fixes
-- The actual TypeScript patches are documented below for manual application

/*
============================================
TYPE DEFINITION UPDATES
============================================

Add these fields to the OldProduct interface:

interface OldProduct {
  ProductId: number;
  VendorCode: string;
  Name: string;
  ManufacturerId: number | null;
  CategoryId: number | null;
  TypeId: number | null;
  PriceType: number;
  PriceTypeValue: string;
  CurrencyCode: string;
  Description: string | null;
  MinStock: number | null;
  IsArchive: boolean;
  ManufacturerBarcodes: string;
  PurchasePrice?: string;  // ADD THIS - purchase price from old system
}

interface OldOrder {
  OrderId: number;
  Status: number;
  CreatedDateUtc: string;
  OutletId: number;
  Username: string;
  Comment: string | null;
  PaymentType: number;
  LoyaltyCardNumber: string | null;
  Total?: string;  // ADD THIS - order total from old system
}

interface OldOrderProduct {
  OrderProductId: number;
  OrderId: number;
  ProductId: number;
  PurchasePrice: string;
  Price: string;
  Count: number;
  ConsignmentNoteId: number;
  RefundCount: number;
  ProductName?: string;  // ADD THIS - product name snapshot
}

============================================
PRODUCT MIGRATION FIXES
============================================

REPLACE the productsToInsert mapping in migrateProducts() with:

const productsToInsert = products.map(p => {
  const newId = this.generateUUID();
  this.state.products.set(p.ProductId, newId);
  
  const categoryName = p.CategoryId ? categoryNameMap.get(p.CategoryId) : null;
  const manufacturerName = p.ManufacturerId ? manufacturerNameMap.get(p.ManufacturerId) : null;
  
  // Parse price from string (handles both decimal and string formats)
  const price = this.parseDecimal(p.PriceTypeValue);
  const costPrice = this.parseDecimal(p.PurchasePrice);
  
  // Handle IsArchive - inverted logic: true = archived, so !IsArchive = is_active
  const isActive = !p.IsArchive;
  
  return {
    id: newId,
    name: p.Name?.trim() || 'Без названия',
    sku: p.VendorCode?.trim() || null,
    barcode: p.ManufacturerBarcodes?.trim() || null,
    price: price,
    cost_price: costPrice,
    stock: 0, // Will be calculated from product locations
    min_stock: p.MinStock || 0,
    category: categoryName || 'Без категории',
    category_id: p.CategoryId ? this.state.categories.get(p.CategoryId) : null,
    manufacturer: manufacturerName || null,
    manufacturer_id: p.ManufacturerId ? this.state.manufacturers.get(p.ManufacturerId) : null,
    description: p.Description || null,
    image_url: null,
    images: [],
    is_active: isActive,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: this.userId,
    legacy_id: p.ProductId,  // ADD THIS - track original ID
  };
});

============================================
ORDER MIGRATION FIXES
============================================

REPLACE the ordersToInsert mapping in migrateOrders() with:

for (const order of batch) {
  const newId = this.generateUUID();
  this.state.orders.set(order.OrderId, newId);

  const items = orderItemsMap.get(order.OrderId) || [];
  const orderItems = items.map(item => {
    const productId = this.state.products.get(item.ProductId);
    // Try to get product name from the map if not in item data
    const productName = item.ProductName || this.getProductNameByLegacyId(item.ProductId) || 'Unknown Product';
    return {
      id: this.generateUUID(),
      productId: productId || '',
      productName: productName,
      quantity: item.Count,
      price: this.parseDecimal(item.Price),
      sku: this.getProductSkuByLegacyId(item.ProductId) || '',
    };
  }).filter(item => item.productId);

  // Calculate totals from items if not provided
  const totalAmount = this.parseDecimal(order.Total) || 
    orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemsCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  // Extract customer info from Username field (format: "Name (Phone)")
  const customerInfo = this.parseCustomerFromUsername(order.Username);

  ordersToInsert.push({
    id: newId,
    order_number: `ORD-${order.OrderId}`,
    status: this.mapOrderStatus(order.Status),
    total_amount: totalAmount,
    items_count: itemsCount,
    customer_id: null, // Will be linked after customer extraction
    customer_name: customerInfo.name || order.Username || null,
    customer_phone: customerInfo.phone || null,
    customer_address: null,
    customer_email: null,
    notes: order.Comment,
    payment_method: this.mapPaymentMethod(order.PaymentType),
    items: orderItems as unknown as import('@/types/database').Json,
    created_at: order.CreatedDateUtc,
    updated_at: order.CreatedDateUtc,
    user_id: this.userId,
    legacy_id: order.OrderId,  // ADD THIS
    legacy_outlet_id: order.OutletId,  // ADD THIS
    legacy_username: order.Username,  // ADD THIS
    legacy_customer_id: null,  // Will be populated if customer created
  });
}

============================================
ADD HELPER METHODS
============================================

Add these helper methods to the DataMigrationService class:

// Helper to get product name by legacy ID
private getProductNameByLegacyId(legacyId: number): string | null {
  // This should be populated during product migration
  // Store in a separate map during product migration
  return null;
}

// Helper to get product SKU by legacy ID  
private getProductSkuByLegacyId(legacyId: number): string | null {
  return null;
}

// Parse customer name and phone from username field
private parseCustomerFromUsername(username: string): { name?: string; phone?: string } {
  if (!username) return {};
  
  // Handle format: "Name (Phone)" or "Name" or just phone
  const match = username.match(/^(.+?)\s*\((.+?)\)$/);
  if (match) {
    return {
      name: match[1].trim(),
      phone: match[2].trim(),
    };
  }
  
  // Check if it's just a phone number
  if (/^\+?\d{10,}$/.test(username.replace(/\s/g, ''))) {
    return { phone: username.trim() };
  }
  
  return { name: username.trim() };
}

============================================
CUSTOMER EXTRACTION FROM ORDERS
============================================

Add this new method to extract customers from order data:

async migrateCustomersFromOrders(): Promise<void> {
  safeLogger.info('Starting customer extraction from orders...');
  const orders = await this.loadJsonFile<OldOrder>('dbo_Order.json');
  
  // Extract unique customers from order usernames
  const customerMap = new Map<string, {
    name: string;
    phone?: string;
    orderCount: number;
    totalSpent: number;
    lastOrderDate: string;
    firstOrderDate: string;
  }>();

  for (const order of orders) {
    const customerInfo = this.parseCustomerFromUsername(order.Username);
    if (!customerInfo.name && !customerInfo.phone) continue;
    
    const key = customerInfo.phone || customerInfo.name || 'unknown';
    const existing = customerMap.get(key);
    
    const orderTotal = this.parseDecimal(order.Total);
    
    if (existing) {
      existing.orderCount++;
      existing.totalSpent += orderTotal;
      if (new Date(order.CreatedDateUtc) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = order.CreatedDateUtc;
      }
      if (new Date(order.CreatedDateUtc) < new Date(existing.firstOrderDate)) {
        existing.firstOrderDate = order.CreatedDateUtc;
      }
    } else {
      customerMap.set(key, {
        name: customerInfo.name || 'Клиент ' + (customerInfo.phone || ''),
        phone: customerInfo.phone,
        orderCount: 1,
        totalSpent: orderTotal,
        lastOrderDate: order.CreatedDateUtc,
        firstOrderDate: order.CreatedDateUtc,
      });
    }
  }

  // Insert customers
  const customersToInsert = Array.from(customerMap.values()).map(c => {
    const newId = this.generateUUID();
    return {
      id: newId,
      name: c.name,
      phone: c.phone || null,
      email: null,
      address: null,
      company: null,
      notes: `Migrated from orders. First order: ${c.firstOrderDate}`,
      total_orders: c.orderCount,
      total_spent: c.totalSpent,
      last_order_date: c.lastOrderDate,
      average_check: c.totalSpent / c.orderCount,
      top_categories: [],
      created_at: c.firstOrderDate,
      updated_at: new Date().toISOString(),
      user_id: this.userId,
      source: 'migrated_from_orders',
    };
  });

  for (let i = 0; i < customersToInsert.length; i += this.batchSize) {
    const batch = customersToInsert.slice(i, i + this.batchSize);
    const { error } = await supabase.from('customers').insert(batch);
    
    if (error) {
      safeLogger.error(`Error inserting customers batch ${i}:`, error);
      this.stats.customers.errors += batch.length;
    } else {
      this.stats.customers.migrated += batch.length;
    }
  }

  safeLogger.info(`Extracted ${this.stats.customers.migrated} customers from orders`);
}

============================================
STOCK ADJUSTMENT FIXES
============================================

Update the migrateStockData method to properly handle product locations:

async migrateStockData(): Promise<void> {
  safeLogger.info('Starting stock data migration...');
  
  // Migrate product locations as stock records
  const productLocations = await this.loadJsonFile<OldProductLocation>('dbo_ProductLocation.json');
  safeLogger.info(`Found ${productLocations.length} product location records`);

  // Aggregate stock by product
  const stockByProduct = new Map<number, {
    stock: number;
    locations: Array<{ locationId: number; count: number; cell?: string }>;
  }>();
  
  productLocations.forEach(pl => {
    const current = stockByProduct.get(pl.ProductId) || { stock: 0, locations: [] };
    current.stock += pl.Count;
    current.locations.push({
      locationId: pl.LocationId,
      count: pl.Count,
      cell: pl.StorageCell || undefined,
    });
    stockByProduct.set(pl.ProductId, current);
  });

  // Update product stock levels
  let updatedCount = 0;
  for (const [productId, data] of stockByProduct) {
    const newProductId = this.state.products.get(productId);
    if (newProductId) {
      const { error } = await supabase
        .from('products')
        .update({ 
          stock: data.stock,
          updated_at: new Date().toISOString(),
        })
        .eq('id', newProductId);
      
      if (error) {
        safeLogger.error(`Error updating stock for product ${productId}:`, error);
      } else {
        updatedCount++;
      }
    }
  }
  safeLogger.info(`Updated stock for ${updatedCount} products`);

  // Migrate write-offs as stock adjustments
  const writeOffs = await this.loadJsonFile<OldWriteOff>('dbo_WriteOff.json');
  this.stats.stockAdjustments.total = writeOffs.length;

  const adjustmentsToInsert = writeOffs.map(wo => {
    const productId = this.state.products.get(wo.ProductId);
    const purchasePrice = this.parseDecimal(wo.PurchasePrice);
    
    return {
      id: this.generateUUID(),
      product_id: productId,
      product_name: this.getProductNameByLegacyId(wo.ProductId) || '',
      product_sku: null,
      adjustment_type: this.mapWriteOffType(wo.Type),
      quantity_change: -wo.Count,
      previous_stock: 0, // Will be calculated
      new_stock: -wo.Count, // Will be calculated
      unit_cost: purchasePrice,
      total_value: purchasePrice * wo.Count,
      reason: 'Write-off from old system',
      reference_number: `WO-${wo.WriteOffId}`,
      created_at: wo.CreatedDateUtc,
      user_id: this.userId,
      legacy_id: wo.WriteOffId,  // ADD THIS
    };
  }).filter(a => a.product_id);

  for (let i = 0; i < adjustmentsToInsert.length; i += this.batchSize) {
    const batch = adjustmentsToInsert.slice(i, i + this.batchSize);
    const { error } = await supabase.from('stock_adjustments').insert(batch);
    
    if (error) {
      safeLogger.error(`Error inserting stock adjustments batch ${i}:`, error);
      this.stats.stockAdjustments.errors += batch.length;
    } else {
      this.stats.stockAdjustments.migrated += batch.length;
      if (this.stats.stockAdjustments.migrated % 50 === 0) {
        safeLogger.info(`Migrated ${this.stats.stockAdjustments.migrated}/${writeOffs.length} stock adjustments`);
      }
    }
  }

  safeLogger.info('Stock data migration completed');
}

*/
