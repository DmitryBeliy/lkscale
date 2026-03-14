/**
 * PATCH INSTRUCTIONS for services/dataMigrationService.ts
 * 
 * These patches fix field mapping issues for migrated data.
 * Apply these changes to the dataMigrationService.ts file.
 */

// ============================================
// PATCH 1: Update OldProduct interface (around line 72)
// ============================================
// Add PurchasePrice field:
interface OldProduct {
  ProductId: number;
  VendorCode: string;
  Name: string;
  // ... other fields
  PurchasePrice?: string; // Purchase price from consignment notes
}

// ============================================
// PATCH 2: Update OldOrder interface (around line 115)
// ============================================
// Add Total field:
interface OldOrder {
  OrderId: number;
  Status: number;
  // ... other fields
  Total?: string; // Optional total from old system
}

// ============================================
// PATCH 3: Add product lookup maps to MigrationState (around line 45)
// ============================================
interface MigrationState {
  // ... existing fields
  productNames: Map<number, string>; // ADD THIS
  productSkus: Map<number, string>;  // ADD THIS
}

// ============================================
// PATCH 4: Add helper methods (after mapActivityActionType, around line 308)
// ============================================

/**
 * Parse customer name and phone from username field
 */
private parseCustomerFromUsername(username: string): { name?: string; phone?: string } {
  if (!username || username.trim() === '') {
    return {};
  }

  const trimmed = username.trim();

  // Handle format: "Name (Phone)"
  const match = trimmed.match(/^(.+?)\s*\((.+?)\)$/);
  if (match) {
    return {
      name: match[1].trim(),
      phone: match[2].trim(),
    };
  }

  // Check if it's just a phone number
  const cleanedPhone = trimmed.replace(/\s/g, '');
  if (/^[\+\d\s\-\(\)]{10,}$/.test(cleanedPhone) && /\d{10,}/.test(cleanedPhone)) {
    return { phone: trimmed };
  }

  return { name: trimmed };
}

private getProductNameByLegacyId(legacyId: number): string | null {
  return this.state.productNames.get(legacyId) || null;
}

private getProductSkuByLegacyId(legacyId: number): string | null {
  return this.state.productSkus.get(legacyId) || null;
}

// ============================================
// PATCH 5: Fix product mapping (around line 445)
// ============================================
// Add these lines to store product info for order migration:

this.state.productNames.set(p.ProductId, p.Name?.trim() || 'Без названия');
this.state.productSkus.set(p.ProductId, p.VendorCode?.trim() || '');

// Add legacy_id to the returned object:
return {
  // ... other fields
  legacy_id: p.ProductId,
};

// ============================================
// PATCH 6: Fix order items mapping (around line 520)
// ============================================
// Use stored product names instead of empty strings:

const orderItems = items.map(item => {
  const productId = this.state.products.get(item.ProductId);
  const productName = this.getProductNameByLegacyId(item.ProductId) || 'Unknown Product';
  const productSku = this.getProductSkuByLegacyId(item.ProductId) || '';

  return {
    id: this.generateUUID(),
    productId: productId || '',
    productName: productName,
    quantity: item.Count,
    price: this.parseDecimal(item.Price),
    sku: productSku,
  };
}).filter(item => item.productId && item.productId !== '');

// ============================================
// PATCH 7: Fix order customer data (around line 536)
// ============================================
// Parse customer from username:

const customerInfo = this.parseCustomerFromUsername(order.Username);

ordersToInsert.push({
  // ... other fields
  customer_name: customerInfo.name || order.Username || null,
  customer_phone: customerInfo.phone || null,
  legacy_id: order.OrderId,
  legacy_outlet_id: order.OutletId,
  legacy_username: order.Username,
});

// ============================================
// PATCH 8: Fix purchase order items (around line 645)
// ============================================

purchaseOrderItemsToInsert.push({
  // ... other fields
  product_name: this.getProductNameByLegacyId(item.ProductId) || '',
  product_sku: this.getProductSkuByLegacyId(item.ProductId) || null,
});

// ============================================
// PATCH 9: Fix stock adjustment mapping (around line 729)
// ============================================

return {
  // ... other fields
  product_name: this.getProductNameByLegacyId(wo.ProductId) || '',
  product_sku: this.getProductSkuByLegacyId(wo.ProductId) || null,
  legacy_id: wo.WriteOffId,
};

// ============================================
// PATCH 10: Add customer migration method
// ============================================

async migrateCustomersFromOrders(): Promise<void> {
  safeLogger.info('Starting customer extraction from orders...');
  const orders = await this.loadJsonFile<OldOrder>('dbo_Order.json');

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

    const key = customerInfo.phone || customerInfo.name || `customer_${order.OrderId}`;
    const existing = customerMap.get(key);
    const orderTotal = this.parseDecimal(order.Total);

    if (existing) {
      existing.orderCount++;
      existing.totalSpent += orderTotal;
      if (new Date(order.CreatedDateUtc) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = order.CreatedDateUtc;
      }
    } else {
      customerMap.set(key, {
        name: customerInfo.name || 'Клиент ' + (customerInfo.phone || key.substring(0, 10)),
        phone: customerInfo.phone,
        orderCount: 1,
        totalSpent: orderTotal,
        lastOrderDate: order.CreatedDateUtc,
        firstOrderDate: order.CreatedDateUtc,
      });
    }
  }

  // Insert customers in batches
  const customersToInsert = Array.from(customerMap.values()).map(c => ({
    id: this.generateUUID(),
    name: c.name,
    phone: c.phone || null,
    email: null,
    address: null,
    company: null,
    notes: `Migrated from orders. First order: ${c.firstOrderDate}`,
    total_orders: c.orderCount,
    total_spent: c.totalSpent,
    last_order_date: c.lastOrderDate,
    average_check: c.orderCount > 0 ? c.totalSpent / c.orderCount : 0,
    top_categories: [],
    created_at: c.firstOrderDate,
    updated_at: new Date().toISOString(),
    user_id: this.userId,
  }));

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

  safeLogger.info(`Extracted ${this.stats.customers.migrated} customers from ${orders.length} orders`);
}

// ============================================
// PATCH 11: Add customers to MigrationStats
// ============================================

export interface MigrationStats {
  // ... existing fields
  customers: { total: number; migrated: number; errors: number };
}

// ============================================
// PATCH 12: Initialize product lookup maps in constructor
// ============================================

this.state = {
  // ... existing fields
  productNames: new Map(),
  productSkus: new Map(),
};
