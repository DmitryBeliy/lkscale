import { supabase } from '@/lib/supabase';
import type {
  Supplier,
  ProductSupplier,
  PurchaseOrder,
  PurchaseOrderItem,
  StockAdjustment,
  StockAdjustmentType,
  PurchaseHistoryEntry,
  Product,
} from '@/types';
import { logger } from '@/lib/logger';

// Helper to get current user ID
const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
};

// ============================================
// SUPPLIER OPERATIONS
// ============================================

export const getSuppliers = async (): Promise<Supplier[]> => {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('user_id', userId)
    .order('name');

  if (error) {
    logger.error('Error fetching suppliers:', error);
    return [];
  }

  return (data || []).map(convertDbSupplier);
};

export const getSupplierById = async (id: string): Promise<Supplier | null> => {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    logger.error('Error fetching supplier:', error);
    return null;
  }

  return convertDbSupplier(data);
};

export const createSupplier = async (
  supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Supplier | null> => {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      user_id: userId,
      name: supplier.name,
      contact_name: supplier.contactName,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      website: supplier.website,
      notes: supplier.notes,
      payment_terms: supplier.paymentTerms,
      lead_time_days: supplier.leadTimeDays,
      rating: supplier.rating,
      is_active: supplier.isActive,
    })
    .select()
    .single();

  if (error) {
    logger.error('Error creating supplier:', error);
    return null;
  }

  return convertDbSupplier(data);
};

export const updateSupplier = async (
  id: string,
  updates: Partial<Supplier>
): Promise<Supplier | null> => {
  const { data, error } = await supabase
    .from('suppliers')
    .update({
      name: updates.name,
      contact_name: updates.contactName,
      email: updates.email,
      phone: updates.phone,
      address: updates.address,
      website: updates.website,
      notes: updates.notes,
      payment_terms: updates.paymentTerms,
      lead_time_days: updates.leadTimeDays,
      rating: updates.rating,
      is_active: updates.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    logger.error('Error updating supplier:', error);
    return null;
  }

  return convertDbSupplier(data);
};

export const deleteSupplier = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id);

  if (error) {
    logger.error('Error deleting supplier:', error);
    return false;
  }

  return true;
};

// ============================================
// PRODUCT-SUPPLIER LINKING
// ============================================

export const getProductSuppliers = async (productId: string): Promise<ProductSupplier[]> => {
  const { data, error } = await supabase
    .from('product_suppliers')
    .select(`
      *,
      suppliers (*)
    `)
    .eq('product_id', productId);

  if (error) {
    logger.error('Error fetching product suppliers:', error);
    return [];
  }

  return (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    productId: item.product_id as string,
    supplierId: item.supplier_id as string,
    supplierSku: item.supplier_sku as string | undefined,
    costPrice: item.cost_price as number | undefined,
    minOrderQuantity: (item.min_order_quantity as number) || 1,
    isPreferred: (item.is_preferred as boolean) || false,
    lastOrderDate: item.last_order_date as string | undefined,
    supplier: item.suppliers ? convertDbSupplier(item.suppliers as Record<string, unknown>) : undefined,
  }));
};

export const linkProductToSupplier = async (
  productId: string,
  supplierId: string,
  costPrice?: number,
  supplierSku?: string,
  isPreferred?: boolean
): Promise<boolean> => {
  const { error } = await supabase
    .from('product_suppliers')
    .upsert({
      product_id: productId,
      supplier_id: supplierId,
      cost_price: costPrice,
      supplier_sku: supplierSku,
      is_preferred: isPreferred,
    }, {
      onConflict: 'product_id,supplier_id',
    });

  if (error) {
    logger.error('Error linking product to supplier:', error);
    return false;
  }

  return true;
};

export const unlinkProductFromSupplier = async (
  productId: string,
  supplierId: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('product_suppliers')
    .delete()
    .eq('product_id', productId)
    .eq('supplier_id', supplierId);

  if (error) {
    logger.error('Error unlinking product from supplier:', error);
    return false;
  }

  return true;
};

// ============================================
// PURCHASE ORDER OPERATIONS
// ============================================

export const getPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('purchase_orders')
    .select(`
      *,
      suppliers (*),
      purchase_order_items (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error fetching purchase orders:', error);
    return [];
  }

  return (data || []).map(convertDbPurchaseOrder);
};

export const getPurchaseOrderById = async (id: string): Promise<PurchaseOrder | null> => {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select(`
      *,
      suppliers (*),
      purchase_order_items (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    logger.error('Error fetching purchase order:', error);
    return null;
  }

  return convertDbPurchaseOrder(data);
};

export const generatePurchaseOrderNumber = async (): Promise<string> => {
  const date = new Date();
  const prefix = 'PO';
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${datePart}-${randomPart}`;
};

export const createPurchaseOrder = async (
  order: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>
): Promise<PurchaseOrder | null> => {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  // Create the order
  const { data: orderData, error: orderError } = await supabase
    .from('purchase_orders')
    .insert({
      user_id: userId,
      supplier_id: order.supplierId,
      order_number: order.orderNumber,
      status: order.status,
      total_amount: order.totalAmount,
      total_items: order.totalItems,
      notes: order.notes,
      expected_date: order.expectedDate,
    })
    .select()
    .single();

  if (orderError) {
    logger.error('Error creating purchase order:', orderError);
    return null;
  }

  // Create order items
  if (order.items && order.items.length > 0) {
    const itemsToInsert = order.items.map((item) => ({
      purchase_order_id: orderData.id,
      product_id: item.productId,
      product_name: item.productName,
      product_sku: item.productSku,
      quantity_ordered: item.quantityOrdered,
      quantity_received: item.quantityReceived,
      unit_cost: item.unitCost,
      total_cost: item.totalCost,
    }));

    const { error: itemsError } = await supabase
      .from('purchase_order_items')
      .insert(itemsToInsert);

    if (itemsError) {
      logger.error('Error creating purchase order items:', itemsError);
    }
  }

  return getPurchaseOrderById(orderData.id);
};

export const updatePurchaseOrderStatus = async (
  id: string,
  status: PurchaseOrder['status'],
  receivedDate?: string
): Promise<boolean> => {
  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (receivedDate) {
    updates.received_date = receivedDate;
  }

  const { error } = await supabase
    .from('purchase_orders')
    .update(updates)
    .eq('id', id);

  if (error) {
    logger.error('Error updating purchase order status:', error);
    return false;
  }

  return true;
};

export const receivePurchaseOrderItems = async (
  orderId: string,
  receivedItems: { itemId: string; quantityReceived: number }[]
): Promise<boolean> => {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  // Update each item
  for (const item of receivedItems) {
    const { data: itemData, error: itemError } = await supabase
      .from('purchase_order_items')
      .update({ quantity_received: item.quantityReceived })
      .eq('id', item.itemId)
      .select('product_id, quantity_ordered, quantity_received, unit_cost')
      .single();

    if (itemError) {
      logger.error('Error updating item:', itemError);
      continue;
    }

    // Update product stock if fully or partially received
    if (itemData.product_id && item.quantityReceived > 0) {
      // Get current product stock
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock, cost_price')
        .eq('id', itemData.product_id)
        .single();

      if (!productError && product) {
        const newStock = (product.stock || 0) + item.quantityReceived;

        // Calculate new average cost
        const currentValue = (product.stock || 0) * (product.cost_price || 0);
        const newValue = item.quantityReceived * itemData.unit_cost;
        const newAvgCost = (currentValue + newValue) / newStock;

        await supabase
          .from('products')
          .update({
            stock: newStock,
            cost_price: newAvgCost,
            last_purchase_date: new Date().toISOString(),
            last_purchase_cost: itemData.unit_cost,
            updated_at: new Date().toISOString(),
          })
          .eq('id', itemData.product_id);
      }
    }
  }

  // Check if all items are received to update order status
  const order = await getPurchaseOrderById(orderId);
  if (order) {
    const allReceived = order.items.every(
      (item) => item.quantityReceived >= item.quantityOrdered
    );
    const someReceived = order.items.some((item) => item.quantityReceived > 0);

    let newStatus: PurchaseOrder['status'] = order.status;
    if (allReceived) {
      newStatus = 'received';
    } else if (someReceived) {
      newStatus = 'partial';
    }

    if (newStatus !== order.status) {
      await updatePurchaseOrderStatus(
        orderId,
        newStatus,
        allReceived ? new Date().toISOString() : undefined
      );
    }
  }

  return true;
};

// ============================================
// STOCK ADJUSTMENT OPERATIONS
// ============================================

export const getStockAdjustments = async (
  productId?: string,
  type?: StockAdjustmentType
): Promise<StockAdjustment[]> => {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  let query = supabase
    .from('stock_adjustments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (productId) {
    query = query.eq('product_id', productId);
  }

  if (type) {
    query = query.eq('adjustment_type', type);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Error fetching stock adjustments:', error);
    return [];
  }

  return (data || []).map(convertDbStockAdjustment);
};

export const createStockAdjustment = async (
  adjustment: Omit<StockAdjustment, 'id' | 'createdAt'>
): Promise<StockAdjustment | null> => {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  // Create the adjustment record
  const { data, error } = await supabase
    .from('stock_adjustments')
    .insert({
      user_id: userId,
      product_id: adjustment.productId,
      product_name: adjustment.productName,
      product_sku: adjustment.productSku,
      adjustment_type: adjustment.adjustmentType,
      quantity_change: adjustment.quantityChange,
      previous_stock: adjustment.previousStock,
      new_stock: adjustment.newStock,
      unit_cost: adjustment.unitCost,
      total_value: adjustment.totalValue,
      reason: adjustment.reason,
      reference_number: adjustment.referenceNumber,
    })
    .select()
    .single();

  if (error) {
    logger.error('Error creating stock adjustment:', error);
    return null;
  }

  // Update the product stock
  if (adjustment.productId) {
    const { error: updateError } = await supabase
      .from('products')
      .update({
        stock: adjustment.newStock,
        updated_at: new Date().toISOString(),
      })
      .eq('id', adjustment.productId);

    if (updateError) {
      logger.error('Error updating product stock:', updateError);
    }
  }

  return convertDbStockAdjustment(data);
};

// ============================================
// PURCHASE HISTORY
// ============================================

export const getProductPurchaseHistory = async (
  productId: string
): Promise<PurchaseHistoryEntry[]> => {
  const { data, error } = await supabase
    .from('purchase_order_items')
    .select(`
      *,
      purchase_orders (
        id,
        created_at,
        supplier_id,
        suppliers (name)
      )
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error fetching purchase history:', error);
    return [];
  }

  return (data || []).map((item: Record<string, unknown>) => {
    const po = item.purchase_orders as Record<string, unknown> | null;
    const supplier = po?.suppliers as Record<string, unknown> | null;

    return {
      id: item.id as string,
      date: (po?.created_at as string) || (item.created_at as string),
      supplierId: po?.supplier_id as string | undefined,
      supplierName: supplier?.name as string | undefined,
      quantity: item.quantity_ordered as number,
      unitCost: item.unit_cost as number,
      totalCost: item.total_cost as number,
      purchaseOrderId: po?.id as string | undefined,
    };
  });
};

// ============================================
// INTERNAL BARCODE GENERATION
// ============================================

export const generateInternalBarcode = async (
  productId: string
): Promise<string | null> => {
  // Generate a unique internal barcode
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const barcode = `INT-${timestamp}-${randomPart}`;

  const { error } = await supabase
    .from('products')
    .update({
      internal_barcode: barcode,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId);

  if (error) {
    logger.error('Error generating internal barcode:', error);
    return null;
  }

  return barcode;
};

export const getProductByInternalBarcode = async (
  barcode: string
): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`barcode.eq.${barcode},internal_barcode.eq.${barcode}`)
    .single();

  if (error) {
    logger.error('Error fetching product by barcode:', error);
    return null;
  }

  return data ? convertDbProduct(data) : null;
};

// ============================================
// HELPERS
// ============================================

function convertDbSupplier(data: Record<string, unknown>): Supplier {
  return {
    id: data.id as string,
    name: data.name as string,
    contactName: data.contact_name as string | undefined,
    email: data.email as string | undefined,
    phone: data.phone as string | undefined,
    address: data.address as string | undefined,
    website: data.website as string | undefined,
    notes: data.notes as string | undefined,
    paymentTerms: data.payment_terms as string | undefined,
    leadTimeDays: (data.lead_time_days as number) || 7,
    rating: data.rating as number | undefined,
    isActive: (data.is_active as boolean) ?? true,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string | undefined,
  };
}

function convertDbPurchaseOrder(data: Record<string, unknown>): PurchaseOrder {
  const items = (data.purchase_order_items as Record<string, unknown>[] || []).map(
    (item) => ({
      id: item.id as string,
      purchaseOrderId: item.purchase_order_id as string,
      productId: item.product_id as string | undefined,
      productName: item.product_name as string,
      productSku: item.product_sku as string | undefined,
      quantityOrdered: item.quantity_ordered as number,
      quantityReceived: (item.quantity_received as number) || 0,
      unitCost: item.unit_cost as number,
      totalCost: item.total_cost as number,
    })
  );

  return {
    id: data.id as string,
    orderNumber: data.order_number as string,
    supplierId: data.supplier_id as string | undefined,
    supplier: data.suppliers
      ? convertDbSupplier(data.suppliers as Record<string, unknown>)
      : undefined,
    status: (data.status as PurchaseOrder['status']) || 'draft',
    totalAmount: (data.total_amount as number) || 0,
    totalItems: (data.total_items as number) || 0,
    notes: data.notes as string | undefined,
    expectedDate: data.expected_date as string | undefined,
    receivedDate: data.received_date as string | undefined,
    items,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string | undefined,
  };
}

function convertDbStockAdjustment(data: Record<string, unknown>): StockAdjustment {
  return {
    id: data.id as string,
    productId: data.product_id as string | undefined,
    productName: data.product_name as string,
    productSku: data.product_sku as string | undefined,
    adjustmentType: data.adjustment_type as StockAdjustmentType,
    quantityChange: data.quantity_change as number,
    previousStock: data.previous_stock as number,
    newStock: data.new_stock as number,
    unitCost: data.unit_cost as number | undefined,
    totalValue: data.total_value as number | undefined,
    reason: data.reason as string | undefined,
    referenceNumber: data.reference_number as string | undefined,
    createdAt: data.created_at as string,
  };
}

function convertDbProduct(data: Record<string, unknown>): Product {
  return {
    id: data.id as string,
    name: data.name as string,
    sku: data.sku as string,
    barcode: data.barcode as string | undefined,
    price: data.price as number,
    costPrice: (data.cost_price as number) || 0,
    stock: (data.stock as number) || 0,
    minStock: (data.min_stock as number) || 0,
    category: (data.category as string) || '',
    categoryId: data.category_id as string | undefined,
    image: data.image_url as string | undefined,
    images: data.images as string[] | undefined,
    description: data.description as string | undefined,
    isActive: (data.is_active as boolean) ?? true,
    createdAt: data.created_at as string | undefined,
    updatedAt: data.updated_at as string | undefined,
  };
}

export default {
  // Suppliers
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  // Product-Supplier linking
  getProductSuppliers,
  linkProductToSupplier,
  unlinkProductFromSupplier,
  // Purchase Orders
  getPurchaseOrders,
  getPurchaseOrderById,
  generatePurchaseOrderNumber,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  receivePurchaseOrderItems,
  // Stock Adjustments
  getStockAdjustments,
  createStockAdjustment,
  // Purchase History
  getProductPurchaseHistory,
  // Barcodes
  generateInternalBarcode,
  getProductByInternalBarcode,
};
