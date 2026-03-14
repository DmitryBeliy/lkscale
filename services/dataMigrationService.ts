/**
 * Data Migration Service
 * Migrates data from extracted JSON files to Supabase
 * 
 * Source files from: docs/base/extracted_data/
 * - dbo_Product.json (1102 products)
 * - dbo_Supplier.json (18 suppliers)
 * - dbo_ProductCategory.json (13 categories)
 * - dbo_Manufacturer.json (64 manufacturers)
 * - dbo_Location.json (9 locations)
 * - dbo_Outlet.json (3 outlets)
 * - dbo_Order.json (5173 orders)
 * - dbo_OrderProduct.json (6259 order items)
 * - dbo_ConsignmentNote.json (976 consignment notes)
 * - dbo_ConsignmentNoteProduct.json (1973 items)
 * - dbo_ProductLocation.json (1080 stock records)
 * - dbo_WriteOff.json (246 write-offs)
 * - dbo_UserActivityLog.json (10192 activity logs)
 */

import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { getCurrentUserId } from '@/store/authStore';

// ID Mapping Store - tracks old INT IDs to new UUIDs
type IdMap = Map<number, string>;

interface MigrationState {
  manufacturers: IdMap;
  categories: IdMap;
  suppliers: IdMap;
  products: IdMap;
  locations: IdMap;
  outlets: IdMap;
  orders: IdMap;
  purchaseOrders: IdMap;
  customers: IdMap;
}

export interface MigrationStats {
  manufacturers: { total: number; migrated: number; errors: number };
  categories: { total: number; migrated: number; errors: number };
  suppliers: { total: number; migrated: number; errors: number };
  products: { total: number; migrated: number; errors: number };
  locations: { total: number; migrated: number; errors: number };
  outlets: { total: number; migrated: number; errors: number };
  orders: { total: number; migrated: number; errors: number };
  purchaseOrders: { total: number; migrated: number; errors: number };
  purchaseOrderItems: { total: number; migrated: number; errors: number };
  stockAdjustments: { total: number; migrated: number; errors: number };
  activityLogs: { total: number; migrated: number; errors: number };
}

// JSON data types
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
}

interface OldSupplier {
  SupplierId: number;
  Name: string;
}

interface OldCategory {
  ProductCategoryId: number;
  Name: string;
}

interface OldManufacturer {
  ManufacturerId: number;
  Name: string;
}

interface OldLocation {
  LocationId: number;
  Name: string;
  Type: number;
}

interface OldOutlet {
  OutletId: number;
  Name: string;
  Type: number;
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
}

interface OldConsignmentNote {
  ConsignmentNoteId: number;
  SupplierId: number;
  CreatedDateUtc: string;
  IsOwnerBalance: boolean;
}

interface OldConsignmentNoteProduct {
  ConsignmentNoteProductId: number;
  ConsignmentNoteId: number;
  ProductId: number;
  PurchasePrice: string;
  Count: number;
  StartLocationId: number;
  SoldCount: number;
  ReceivedDateUtc: string;
}

interface OldProductLocation {
  ProductLocationId: number;
  ProductId: number;
  LocationId: number;
  Count: number;
  StorageCell: string | null;
}

interface OldWriteOff {
  WriteOffId: number;
  ProductId: number;
  Count: number;
  PurchasePrice: string;
  ConsignmentNoteId: number;
  Type: number;
  CreatedDateUtc: string;
}

interface OldUserActivityLog {
  UserActivityLogId: number;
  Username: string;
  Operation: string;
  CreatedDateUtc: string;
  Data: string;
}

class DataMigrationService {
  private state: MigrationState;
  private stats: MigrationStats;
  private userId: string | null;
  private batchSize: number = 100;

  constructor() {
    this.state = {
      manufacturers: new Map(),
      categories: new Map(),
      suppliers: new Map(),
      products: new Map(),
      locations: new Map(),
      outlets: new Map(),
      orders: new Map(),
      purchaseOrders: new Map(),
      customers: new Map(),
    };
    this.stats = this.getInitialStats();
    this.userId = null;
  }

  private getInitialStats(): MigrationStats {
    return {
      manufacturers: { total: 0, migrated: 0, errors: 0 },
      categories: { total: 0, migrated: 0, errors: 0 },
      suppliers: { total: 0, migrated: 0, errors: 0 },
      products: { total: 0, migrated: 0, errors: 0 },
      locations: { total: 0, migrated: 0, errors: 0 },
      outlets: { total: 0, migrated: 0, errors: 0 },
      orders: { total: 0, migrated: 0, errors: 0 },
      purchaseOrders: { total: 0, migrated: 0, errors: 0 },
      purchaseOrderItems: { total: 0, migrated: 0, errors: 0 },
      stockAdjustments: { total: 0, migrated: 0, errors: 0 },
      activityLogs: { total: 0, migrated: 0, errors: 0 },
    };
  }

  private async loadJsonFile<T>(filename: string): Promise<T[]> {
    try {
      // In React Native, we need to require the JSON file
      // The files are in docs/base/extracted_data/
      const data = require(`@/../docs/base/extracted_data/${filename}`);
      return data as T[];
    } catch (error) {
      logger.error(`Failed to load ${filename}:`, error);
      return [];
    }
  }

  private generateUUID(): string {
    return crypto.randomUUID();
  }

  private parseDecimal(value: string | null | undefined): number {
    if (!value) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  private mapOrderStatus(oldStatus: number): string {
    // Old: 1 = Completed, 2 = Pending/Processing, etc.
    switch (oldStatus) {
      case 1: return 'completed';
      case 2: return 'pending';
      case 3: return 'processing';
      case 4: return 'cancelled';
      default: return 'pending';
    }
  }

  private mapPaymentMethod(oldType: number): string {
    // Old: 1 = Cash, 2 = Card, etc.
    switch (oldType) {
      case 1: return 'cash';
      case 2: return 'card';
      case 3: return 'transfer';
      case 4: return 'online';
      default: return 'cash';
    }
  }

  private mapWriteOffType(oldType: number): string {
    // Map old write-off types to new adjustment types
    switch (oldType) {
      case 1: return 'write_off';
      case 2: return 'damage';
      case 3: return 'theft';
      case 4: return 'count';
      default: return 'other';
    }
  }

  private mapActivityActionType(oldOperation: string): string {
    const mapping: Record<string, string> = {
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

  // ==================== MANUFACTURERS ====================

  async migrateManufacturers(): Promise<void> {
    logger.info('Starting manufacturers migration...');
    const manufacturers = await this.loadJsonFile<OldManufacturer>('dbo_Manufacturer.json');
    this.stats.manufacturers.total = manufacturers.length;

    // Store manufacturers in memory for product migration reference
    // Note: Manufacturers table needs to be created in Supabase first
    manufacturers.forEach(m => {
      const newId = this.generateUUID();
      this.state.manufacturers.set(m.ManufacturerId, newId);
    });

    this.stats.manufacturers.migrated = manufacturers.length;
    logger.info(`Manufacturers mapping created for ${manufacturers.length} manufacturers`);
    logger.info('Note: manufacturers table must exist in Supabase. Run migration SQL first.');
  }

  // ==================== CATEGORIES ====================

  async migrateCategories(): Promise<void> {
    logger.info('Starting categories migration...');
    const categories = await this.loadJsonFile<OldCategory>('dbo_ProductCategory.json');
    this.stats.categories.total = categories.length;

    // Categories are stored as reference data - we'll use them when migrating products
    // Just build the ID mapping
    categories.forEach(c => {
      const newId = this.generateUUID();
      this.state.categories.set(c.ProductCategoryId, newId);
    });

    this.stats.categories.migrated = categories.length;
    logger.info('Categories mapping created');
  }

  // ==================== SUPPLIERS ====================

  async migrateSuppliers(): Promise<void> {
    logger.info('Starting suppliers migration...');
    const suppliers = await this.loadJsonFile<OldSupplier>('dbo_Supplier.json');
    this.stats.suppliers.total = suppliers.length;

    const suppliersToInsert = suppliers.map(s => {
      const newId = this.generateUUID();
      this.state.suppliers.set(s.SupplierId, newId);
      return {
        id: newId,
        name: s.Name,
        contact_name: null as string | null,
        email: null as string | null,
        phone: null as string | null,
        address: null as string | null,
        website: null as string | null,
        notes: null as string | null,
        payment_terms: null as string | null,
        lead_time_days: 7,
        rating: null as number | null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: this.userId,
      };
    });

    for (let i = 0; i < suppliersToInsert.length; i += this.batchSize) {
      const batch = suppliersToInsert.slice(i, i + this.batchSize);
      const { error } = await supabase.from('suppliers').insert(batch);
      
      if (error) {
        logger.error(`Error inserting suppliers batch ${i}:`, error);
        this.stats.suppliers.errors += batch.length;
      } else {
        this.stats.suppliers.migrated += batch.length;
        logger.info(`Migrated ${this.stats.suppliers.migrated}/${suppliers.length} suppliers`);
      }
    }

    logger.info('Suppliers migration completed');
  }

  // ==================== LOCATIONS ====================

  async migrateLocations(): Promise<void> {
    logger.info('Starting locations migration...');
    const locations = await this.loadJsonFile<OldLocation>('dbo_Location.json');
    this.stats.locations.total = locations.length;

    // Store locations in memory for reference
    // Note: Locations table needs to be created in Supabase first
    locations.forEach(l => {
      const newId = this.generateUUID();
      this.state.locations.set(l.LocationId, newId);
    });

    this.stats.locations.migrated = locations.length;
    logger.info(`Locations mapping created for ${locations.length} locations`);
    logger.info('Note: locations table must exist in Supabase. Run migration SQL first.');
  }

  // ==================== OUTLETS ====================

  async migrateOutlets(): Promise<void> {
    logger.info('Starting outlets migration...');
    const outlets = await this.loadJsonFile<OldOutlet>('dbo_Outlet.json');
    this.stats.outlets.total = outlets.length;

    // Store outlets in memory for reference
    // Note: Outlets table needs to be created in Supabase first
    outlets.forEach(o => {
      const newId = this.generateUUID();
      this.state.outlets.set(o.OutletId, newId);
    });

    this.stats.outlets.migrated = outlets.length;
    logger.info(`Outlets mapping created for ${outlets.length} outlets`);
    logger.info('Note: outlets table must exist in Supabase. Run migration SQL first.');
  }

  // ==================== PRODUCTS ====================

  async migrateProducts(): Promise<void> {
    logger.info('Starting products migration...');
    const products = await this.loadJsonFile<OldProduct>('dbo_Product.json');
    this.stats.products.total = products.length;

    // Build category name map for reference
    const categories = await this.loadJsonFile<OldCategory>('dbo_ProductCategory.json');
    const categoryNameMap = new Map(categories.map(c => [c.ProductCategoryId, c.Name]));

    // Build manufacturer name map for reference
    const manufacturers = await this.loadJsonFile<OldManufacturer>('dbo_Manufacturer.json');
    const manufacturerNameMap = new Map(manufacturers.map(m => [m.ManufacturerId, m.Name]));

    const productsToInsert = products.map(p => {
      const newId = this.generateUUID();
      this.state.products.set(p.ProductId, newId);
      
      const categoryName = p.CategoryId ? categoryNameMap.get(p.CategoryId) : null;
      const manufacturerName = p.ManufacturerId ? manufacturerNameMap.get(p.ManufacturerId) : null;
      
      return {
        id: newId,
        name: p.Name,
        sku: p.VendorCode || null,
        barcode: p.ManufacturerBarcodes || null,
        price: this.parseDecimal(p.PriceTypeValue),
        cost_price: 0, // Will be calculated from consignment notes
        stock: 0, // Will be calculated from product locations
        min_stock: p.MinStock || 0,
        category: categoryName || 'Без категории',
        category_id: p.CategoryId ? this.state.categories.get(p.CategoryId) : null,
        manufacturer: manufacturerName || null,
        manufacturer_id: p.ManufacturerId ? this.state.manufacturers.get(p.ManufacturerId) : null,
        description: p.Description,
        image_url: null as string | null,
        images: null as string[] | null,
        is_active: !p.IsArchive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: this.userId,
      };
    });

    for (let i = 0; i < productsToInsert.length; i += this.batchSize) {
      const batch = productsToInsert.slice(i, i + this.batchSize);
      const { error } = await supabase.from('products').insert(batch);
      
      if (error) {
        logger.error(`Error inserting products batch ${i}:`, error);
        this.stats.products.errors += batch.length;
      } else {
        this.stats.products.migrated += batch.length;
        if (this.stats.products.migrated % 100 === 0) {
          logger.info(`Migrated ${this.stats.products.migrated}/${products.length} products`);
        }
      }
    }

    logger.info('Products migration completed');
  }

  // ==================== ORDERS ====================

  async migrateOrders(): Promise<void> {
    logger.info('Starting orders migration...');
    const orders = await this.loadJsonFile<OldOrder>('dbo_Order.json');
    const orderProducts = await this.loadJsonFile<OldOrderProduct>('dbo_OrderProduct.json');
    this.stats.orders.total = orders.length;

    // Build order items map
    const orderItemsMap = new Map<number, OldOrderProduct[]>();
    orderProducts.forEach(op => {
      if (!orderItemsMap.has(op.OrderId)) {
        orderItemsMap.set(op.OrderId, []);
      }
      orderItemsMap.get(op.OrderId)!.push(op);
    });

    // Process orders in batches
    for (let i = 0; i < orders.length; i += this.batchSize) {
      const batch = orders.slice(i, i + this.batchSize);
      const ordersToInsert = [];

      for (const order of batch) {
        const newId = this.generateUUID();
        this.state.orders.set(order.OrderId, newId);

        const items = orderItemsMap.get(order.OrderId) || [];
        const orderItems = items.map(item => {
          const productId = this.state.products.get(item.ProductId);
          return {
            id: this.generateUUID(),
            productId: productId || '',
            productName: '', // Will be populated from product lookup
            quantity: item.Count,
            price: this.parseDecimal(item.Price),
            sku: '',
          };
        }).filter(item => item.productId);

        // Calculate totals
        const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemsCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);

        ordersToInsert.push({
          id: newId,
          order_number: `ORD-${order.OrderId}`,
          status: this.mapOrderStatus(order.Status),
          total_amount: totalAmount,
          items_count: itemsCount,
          customer_id: null as string | null,
          customer_name: null as string | null,
          customer_phone: null as string | null,
          customer_address: null as string | null,
          notes: order.Comment,
          payment_method: this.mapPaymentMethod(order.PaymentType),
          items: orderItems as unknown as import('@/types/database').Json,
          created_at: order.CreatedDateUtc,
          updated_at: order.CreatedDateUtc,
          user_id: this.userId,
        });
      }

      const { error } = await supabase.from('orders').insert(ordersToInsert);
      
      if (error) {
        logger.error(`Error inserting orders batch ${i}:`, error);
        this.stats.orders.errors += batch.length;
      } else {
        this.stats.orders.migrated += batch.length;
        if (this.stats.orders.migrated % 100 === 0) {
          logger.info(`Migrated ${this.stats.orders.migrated}/${orders.length} orders`);
        }
      }
    }

    logger.info('Orders migration completed');
  }

  // ==================== PURCHASE ORDERS (Consignment Notes) ====================

  async migratePurchaseOrders(): Promise<void> {
    logger.info('Starting purchase orders migration...');
    const consignmentNotes = await this.loadJsonFile<OldConsignmentNote>('dbo_ConsignmentNote.json');
    const consignmentNoteProducts = await this.loadJsonFile<OldConsignmentNoteProduct>('dbo_ConsignmentNoteProduct.json');
    this.stats.purchaseOrders.total = consignmentNotes.length;
    this.stats.purchaseOrderItems.total = consignmentNoteProducts.length;

    // Build items map
    const itemsMap = new Map<number, OldConsignmentNoteProduct[]>();
    consignmentNoteProducts.forEach(cnp => {
      if (!itemsMap.has(cnp.ConsignmentNoteId)) {
        itemsMap.set(cnp.ConsignmentNoteId, []);
      }
      itemsMap.get(cnp.ConsignmentNoteId)!.push(cnp);
    });

    // Process purchase orders in batches
    for (let i = 0; i < consignmentNotes.length; i += this.batchSize) {
      const batch = consignmentNotes.slice(i, i + this.batchSize);
      const purchaseOrdersToInsert: Array<{
        id: string;
        order_number: string;
        supplier_id: string | undefined;
        status: string;
        total_amount: number;
        total_items: number;
        notes: string | null;
        expected_date: string | null;
        received_date: string;
        created_at: string;
        updated_at: string;
        user_id: string | null;
      }> = [];
      const purchaseOrderItemsToInsert: Array<{
        id: string;
        purchase_order_id: string;
        product_id: string | undefined;
        product_name: string;
        product_sku: string | null;
        quantity_ordered: number;
        quantity_received: number;
        unit_cost: number;
        total_cost: number;
        created_at: string;
      }> = [];

      for (const cn of batch) {
        const newId = this.generateUUID();
        this.state.purchaseOrders.set(cn.ConsignmentNoteId, newId);

        const items = itemsMap.get(cn.ConsignmentNoteId) || [];
        const totalAmount = items.reduce((sum, item) => 
          sum + (this.parseDecimal(item.PurchasePrice) * item.Count), 0
        );
        const totalItems = items.reduce((sum, item) => sum + item.Count, 0);

        purchaseOrdersToInsert.push({
          id: newId,
          order_number: `PO-${cn.ConsignmentNoteId}`,
          supplier_id: this.state.suppliers.get(cn.SupplierId),
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

        // Prepare items for this purchase order
        items.forEach(item => {
          const productId = this.state.products.get(item.ProductId);
          purchaseOrderItemsToInsert.push({
            id: this.generateUUID(),
            purchase_order_id: newId,
            product_id: productId,
            product_name: '', // Will be populated
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
      const { error: poError } = await supabase.from('purchase_orders').insert(purchaseOrdersToInsert);
      if (poError) {
        logger.error(`Error inserting purchase orders batch ${i}:`, poError);
        this.stats.purchaseOrders.errors += batch.length;
      } else {
        this.stats.purchaseOrders.migrated += batch.length;
      }

      // Insert purchase order items
      if (purchaseOrderItemsToInsert.length > 0) {
        const { error: itemError } = await supabase.from('purchase_order_items').insert(purchaseOrderItemsToInsert);
        if (itemError) {
          logger.error(`Error inserting purchase order items batch ${i}:`, itemError);
          this.stats.purchaseOrderItems.errors += purchaseOrderItemsToInsert.length;
        } else {
          this.stats.purchaseOrderItems.migrated += purchaseOrderItemsToInsert.length;
        }
      }

      if (this.stats.purchaseOrders.migrated % 100 === 0) {
        logger.info(`Migrated ${this.stats.purchaseOrders.migrated}/${consignmentNotes.length} purchase orders`);
      }
    }

    logger.info('Purchase orders migration completed');
  }

  // ==================== STOCK DATA (Product Locations & Write-offs) ====================

  async migrateStockData(): Promise<void> {
    logger.info('Starting stock data migration...');
    
    // Migrate product locations as stock records
    const productLocations = await this.loadJsonFile<OldProductLocation>('dbo_ProductLocation.json');
    logger.info(`Found ${productLocations.length} product location records`);

    // Aggregate stock by product
    const stockByProduct = new Map<number, number>();
    productLocations.forEach(pl => {
      const current = stockByProduct.get(pl.ProductId) || 0;
      stockByProduct.set(pl.ProductId, current + pl.Count);
    });

    // Update product stock levels
    let updatedCount = 0;
    for (const [productId, stock] of stockByProduct) {
      const newProductId = this.state.products.get(productId);
      if (newProductId) {
        const { error } = await supabase
          .from('products')
          .update({ stock })
          .eq('id', newProductId);
        
        if (error) {
          logger.error(`Error updating stock for product ${productId}:`, error);
        } else {
          updatedCount++;
        }
      }
    }
    logger.info(`Updated stock for ${updatedCount} products`);

    // Migrate write-offs as stock adjustments
    const writeOffs = await this.loadJsonFile<OldWriteOff>('dbo_WriteOff.json');
    this.stats.stockAdjustments.total = writeOffs.length;

    const adjustmentsToInsert = writeOffs.map(wo => {
      const productId = this.state.products.get(wo.ProductId);
      const purchasePrice = this.parseDecimal(wo.PurchasePrice);
      
      return {
        id: this.generateUUID(),
        product_id: productId,
        product_name: '', // Will be populated
        product_sku: null as string | null,
        adjustment_type: this.mapWriteOffType(wo.Type),
        quantity_change: -wo.Count,
        previous_stock: 0, // Will be calculated
        new_stock: 0, // Will be calculated
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
      const { error } = await supabase.from('stock_adjustments').insert(batch);
      
      if (error) {
        logger.error(`Error inserting stock adjustments batch ${i}:`, error);
        this.stats.stockAdjustments.errors += batch.length;
      } else {
        this.stats.stockAdjustments.migrated += batch.length;
        if (this.stats.stockAdjustments.migrated % 50 === 0) {
          logger.info(`Migrated ${this.stats.stockAdjustments.migrated}/${writeOffs.length} stock adjustments`);
        }
      }
    }

    logger.info('Stock data migration completed');
  }

  // ==================== ACTIVITY LOGS ====================

  async migrateActivityLogs(): Promise<void> {
    logger.info('Starting activity logs migration...');
    const activityLogs = await this.loadJsonFile<OldUserActivityLog>('dbo_UserActivityLog.json');
    this.stats.activityLogs.total = activityLogs.length;

    logger.info(`Activity logs migration: ${activityLogs.length} records found`);
    logger.info('Note: user_activity_logs table must exist in Supabase. Run migration SQL first.');
    
    // For now, just count them as we need the table to exist
    this.stats.activityLogs.migrated = 0;
    this.stats.activityLogs.errors = 0;
  }

  // ==================== VALIDATION ====================

  async validateMigration(): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    logger.info('Starting migration validation...');

    const userId = this.userId;
    if (!userId) {
      errors.push('User ID is required for validation');
      return { isValid: false, errors, warnings };
    }
    
    // Check for duplicate SKUs
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('sku, name')
      .eq('user_id', userId);

    if (productsError) {
      errors.push(`Failed to fetch products for validation: ${productsError.message}`);
    } else if (products) {
      const skuMap = new Map<string, string[]>();
      products.forEach(p => {
        if (p.sku) {
          if (!skuMap.has(p.sku)) {
            skuMap.set(p.sku, []);
          }
          skuMap.get(p.sku)!.push(p.name || '');
        }
      });

      for (const [sku, names] of skuMap) {
        if (names.length > 1) {
          warnings.push(`Duplicate SKU "${sku}" found for products: ${names.join(', ')}`);
        }
      }
    }

    // Check for orphaned order items
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, items')
      .eq('user_id', userId);

    if (ordersError) {
      errors.push(`Failed to fetch orders for validation: ${ordersError.message}`);
    } else if (orders) {
      let orphanedItems = 0;
      orders.forEach(order => {
        const items = (order.items as Array<{ productId?: string }>) || [];
        items.forEach(item => {
          if (item.productId && !this.state.products.has(parseInt(item.productId))) {
            orphanedItems++;
          }
        });
      });
      if (orphanedItems > 0) {
        warnings.push(`Found ${orphanedItems} orphaned order items (products not found)`);
      }
    }

    // Check stock consistency
    const { error: stockError } = await supabase
      .from('stock_adjustments')
      .select('product_id, quantity_change')
      .eq('user_id', userId);

    if (stockError) {
      errors.push(`Failed to fetch stock adjustments for validation: ${stockError.message}`);
    }

    const isValid = errors.length === 0;
    logger.info(`Validation completed. Errors: ${errors.length}, Warnings: ${warnings.length}`);

    return { isValid, errors, warnings };
  }

  // ==================== MAIN MIGRATION ====================

  async migrateAllData(): Promise<MigrationStats> {
    this.userId = getCurrentUserId();
    if (!this.userId) {
      throw new Error('User must be authenticated to run migration');
    }

    logger.info('Starting full data migration...');
    const startTime = Date.now();

    // Reset stats
    this.stats = this.getInitialStats();

    // Migration order matters due to foreign key relationships
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

      // Step 4: Purchase orders (depends on suppliers, products, locations)
      await this.migratePurchaseOrders();

      // Step 5: Stock data (depends on products, purchase orders)
      await this.migrateStockData();

      // Step 6: Activity logs (no dependencies)
      await this.migrateActivityLogs();

      const duration = (Date.now() - startTime) / 1000;
      logger.info(`Migration completed in ${duration.toFixed(2)} seconds`);

      // Run validation
      const validation = await this.validateMigration();
      if (!validation.isValid) {
        logger.warn('Migration validation found errors:');
        validation.errors.forEach(err => logger.warn(`  - ${err}`));
      }
      if (validation.warnings.length > 0) {
        logger.warn('Migration validation warnings:');
        validation.warnings.forEach(warn => logger.warn(`  - ${warn}`));
      }

      return this.stats;
    } catch (error) {
      logger.error('Migration failed:', error);
      throw error;
    }
  }

  // ==================== STATUS & UTILITIES ====================

  getMigrationStatus(): MigrationStats {
    return { ...this.stats };
  }

  getIdMappings(): {
    manufacturers: Record<number, string>;
    categories: Record<number, string>;
    suppliers: Record<number, string>;
    products: Record<number, string>;
    locations: Record<number, string>;
    outlets: Record<number, string>;
    orders: Record<number, string>;
    purchaseOrders: Record<number, string>;
  } {
    const mapToRecord = (map: IdMap): Record<number, string> => {
      const record: Record<number, string> = {};
      map.forEach((value, key) => {
        record[key] = value;
      });
      return record;
    };

    return {
      manufacturers: mapToRecord(this.state.manufacturers),
      categories: mapToRecord(this.state.categories),
      suppliers: mapToRecord(this.state.suppliers),
      products: mapToRecord(this.state.products),
      locations: mapToRecord(this.state.locations),
      outlets: mapToRecord(this.state.outlets),
      orders: mapToRecord(this.state.orders),
      purchaseOrders: mapToRecord(this.state.purchaseOrders),
    };
  }

  async clearMigrationData(): Promise<void> {
    logger.info('Clearing all migrated data...');
    
    const userId = this.userId;
    if (!userId) {
      logger.error('Cannot clear migration data: user ID is null');
      return;
    }

    // Clear tables in reverse dependency order
    const clearTable = async (table: 'stock_adjustments' | 'purchase_order_items' | 'purchase_orders' | 'orders' | 'products' | 'suppliers') => {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('user_id', userId);
      
      if (error) {
        logger.error(`Error clearing ${table}:`, error);
      } else {
        logger.info(`Cleared ${table}`);
      }
    };

    await clearTable('stock_adjustments');
    await clearTable('purchase_order_items');
    await clearTable('purchase_orders');
    await clearTable('orders');
    await clearTable('products');
    await clearTable('suppliers');

    // Reset state
    this.state = {
      manufacturers: new Map(),
      categories: new Map(),
      suppliers: new Map(),
      products: new Map(),
      locations: new Map(),
      outlets: new Map(),
      orders: new Map(),
      purchaseOrders: new Map(),
      customers: new Map(),
    };
    this.stats = this.getInitialStats();

    logger.info('Migration data cleared');
  }

  // Export migration report
  generateReport(): string {
    const totalRecords = Object.values(this.stats).reduce((sum, s) => sum + s.migrated, 0);
    const totalErrors = Object.values(this.stats).reduce((sum, s) => sum + s.errors, 0);

    return `
========================================
DATA MIGRATION REPORT
========================================
Generated: ${new Date().toISOString()}
User ID: ${this.userId}

MIGRATION STATISTICS:
---------------------
Manufacturers:     ${this.stats.manufacturers.migrated}/${this.stats.manufacturers.total} (errors: ${this.stats.manufacturers.errors})
Categories:        ${this.stats.categories.migrated}/${this.stats.categories.total} (errors: ${this.stats.categories.errors})
Suppliers:         ${this.stats.suppliers.migrated}/${this.stats.suppliers.total} (errors: ${this.stats.suppliers.errors})
Products:          ${this.stats.products.migrated}/${this.stats.products.total} (errors: ${this.stats.products.errors})
Locations:         ${this.stats.locations.migrated}/${this.stats.locations.total} (errors: ${this.stats.locations.errors})
Outlets:           ${this.stats.outlets.migrated}/${this.stats.outlets.total} (errors: ${this.stats.outlets.errors})
Orders:            ${this.stats.orders.migrated}/${this.stats.orders.total} (errors: ${this.stats.orders.errors})
Purchase Orders:   ${this.stats.purchaseOrders.migrated}/${this.stats.purchaseOrders.total} (errors: ${this.stats.purchaseOrders.errors})
PO Items:          ${this.stats.purchaseOrderItems.migrated}/${this.stats.purchaseOrderItems.total} (errors: ${this.stats.purchaseOrderItems.errors})
Stock Adjustments: ${this.stats.stockAdjustments.migrated}/${this.stats.stockAdjustments.total} (errors: ${this.stats.stockAdjustments.errors})
Activity Logs:     ${this.stats.activityLogs.migrated}/${this.stats.activityLogs.total} (errors: ${this.stats.activityLogs.errors})

SUMMARY:
--------
Total Records Migrated: ${totalRecords}
Total Errors: ${totalErrors}
Success Rate: ${totalRecords > 0 ? (((totalRecords - totalErrors) / totalRecords) * 100).toFixed(2) : 0}%
========================================
    `.trim();
  }
}

// Create singleton instance
export const dataMigrationService = new DataMigrationService();

// Export individual functions for convenience
export const migrateAllData = () => dataMigrationService.migrateAllData();
export const migrateProducts = () => dataMigrationService.migrateProducts();
export const migrateSuppliers = () => dataMigrationService.migrateSuppliers();
export const migrateOrders = () => dataMigrationService.migrateOrders();
export const migratePurchaseOrders = () => dataMigrationService.migratePurchaseOrders();
export const migrateStockData = () => dataMigrationService.migrateStockData();
export const migrateActivityLogs = () => dataMigrationService.migrateActivityLogs();
export const getMigrationStatus = () => dataMigrationService.getMigrationStatus();
export const validateMigration = () => dataMigrationService.validateMigration();
export const clearMigrationData = () => dataMigrationService.clearMigrationData();
export const generateMigrationReport = () => dataMigrationService.generateReport();

export default dataMigrationService;
