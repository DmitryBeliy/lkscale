import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/store/authStore';
import { Product, Customer, Order, OrderItem } from '@/types';
import { logger } from '@/lib/logger';
import { RealtimeChannel } from '@supabase/supabase-js';
import * as Haptics from 'expo-haptics';

// Type for DB conversions
type DbProduct = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  price: number;
  cost_price: number | null;
  stock: number | null;
  min_stock: number | null;
  category: string | null;
  category_id: string | null;
  description: string | null;
  image_url: string | null;
  images: string[] | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  user_id: string | null;
};

type DbCustomer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  company: string | null;
  notes: string | null;
  avatar_url: string | null;
  total_orders: number | null;
  total_spent: number | null;
  last_order_date: string | null;
  average_check: number | null;
  top_categories: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  user_id: string | null;
};

type DbOrder = {
  id: string;
  order_number: string | null;
  status: string | null;
  total_amount: number | null;
  items_count: number | null;
  customer_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  notes: string | null;
  payment_method: string | null;
  items: unknown;
  created_at: string | null;
  updated_at: string | null;
  user_id: string | null;
};

// Convert DB product to app product
const dbProductToProduct = (db: DbProduct): Product => ({
  id: db.id,
  name: db.name,
  sku: db.sku || '',
  barcode: db.barcode || undefined,
  price: db.price,
  costPrice: db.cost_price || 0,
  stock: db.stock || 0,
  minStock: db.min_stock || 0,
  category: db.category || 'Без категории',
  categoryId: db.category_id || undefined,
  description: db.description || undefined,
  image: db.image_url || undefined,
  images: db.images || undefined,
  isActive: db.is_active ?? true,
  createdAt: db.created_at || new Date().toISOString(),
  updatedAt: db.updated_at || new Date().toISOString(),
});

// Convert app product to DB product
const productToDbProduct = (product: Partial<Product>, userId: string): Partial<DbProduct> => ({
  name: product.name,
  sku: product.sku,
  barcode: product.barcode || null,
  price: product.price,
  cost_price: product.costPrice,
  stock: product.stock,
  min_stock: product.minStock,
  category: product.category,
  category_id: product.categoryId || null,
  description: product.description || null,
  image_url: product.image || null,
  images: product.images || null,
  is_active: product.isActive,
  user_id: userId,
});

// Convert DB customer to app customer
const dbCustomerToCustomer = (db: DbCustomer): Customer => ({
  id: db.id,
  name: db.name,
  phone: db.phone || undefined,
  email: db.email || undefined,
  address: db.address || undefined,
  company: db.company || undefined,
  notes: db.notes || undefined,
  totalOrders: db.total_orders || 0,
  totalSpent: db.total_spent || 0,
  lastOrderDate: db.last_order_date || undefined,
  averageCheck: db.average_check || undefined,
  topCategories: db.top_categories || undefined,
  createdAt: db.created_at || new Date().toISOString(),
  updatedAt: db.updated_at || new Date().toISOString(),
});

// Convert app customer to DB customer
const customerToDbCustomer = (customer: Partial<Customer>, userId: string): Partial<DbCustomer> => ({
  name: customer.name,
  phone: customer.phone || null,
  email: customer.email || null,
  address: customer.address || null,
  company: customer.company || null,
  notes: customer.notes || null,
  avatar_url: undefined,
  total_orders: customer.totalOrders,
  total_spent: customer.totalSpent,
  last_order_date: customer.lastOrderDate || null,
  average_check: customer.averageCheck || null,
  top_categories: customer.topCategories || null,
  user_id: userId,
});

// Convert DB order to app order
const dbOrderToOrder = (db: DbOrder): Order => ({
  id: db.id,
  orderNumber: db.order_number || '',
  status: (db.status || 'pending') as Order['status'],
  totalAmount: db.total_amount || 0,
  itemsCount: db.items_count || 0,
  customerId: db.customer_id || undefined,
  customer: db.customer_name ? {
    name: db.customer_name,
    phone: db.customer_phone || undefined,
    address: db.customer_address || undefined,
  } : undefined,
  notes: db.notes || undefined,
  paymentMethod: (db.payment_method || 'cash') as Order['paymentMethod'],
  items: (db.items as OrderItem[]) || [],
  createdAt: db.created_at || new Date().toISOString(),
  updatedAt: db.updated_at || new Date().toISOString(),
});

// ============== PRODUCTS ==============

export const fetchProducts = async (): Promise<Product[]> => {
  const userId = getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error fetching products:', error);
    return [];
  }

  return (data || []).map(dbProductToProduct);
};

export const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> => {
  const userId = getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('products')
    .insert({
      name: product.name,
      sku: product.sku || '',
      barcode: product.barcode || null,
      price: product.price,
      cost_price: product.costPrice || 0,
      stock: product.stock || 0,
      min_stock: product.minStock || 0,
      category: product.category || 'Без категории',
      category_id: product.categoryId || null,
      description: product.description || null,
      image_url: product.image || null,
      images: product.images || null,
      is_active: product.isActive ?? true,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    logger.error('Error creating product:', error);
    return null;
  }

  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  return dbProductToProduct(data);
};

export const updateProductInDb = async (productId: string, updates: Partial<Product>): Promise<Product | null> => {
  const userId = getCurrentUserId();
  if (!userId) return null;

  const dbUpdates: Record<string, unknown> = {};

  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.sku !== undefined) dbUpdates.sku = updates.sku;
  if (updates.barcode !== undefined) dbUpdates.barcode = updates.barcode || null;
  if (updates.price !== undefined) dbUpdates.price = updates.price;
  if (updates.costPrice !== undefined) dbUpdates.cost_price = updates.costPrice;
  if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
  if (updates.minStock !== undefined) dbUpdates.min_stock = updates.minStock;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId || null;
  if (updates.description !== undefined) dbUpdates.description = updates.description || null;
  if (updates.image !== undefined) dbUpdates.image_url = updates.image || null;
  if (updates.images !== undefined) dbUpdates.images = updates.images || null;
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

  const { data, error } = await supabase
    .from('products')
    .update(dbUpdates)
    .eq('id', productId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    logger.error('Error updating product:', error);
    return null;
  }

  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  return dbProductToProduct(data);
};

export const deleteProductFromDb = async (productId: string): Promise<boolean> => {
  const userId = getCurrentUserId();
  if (!userId) return false;

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('user_id', userId);

  if (error) {
    logger.error('Error deleting product:', error);
    return false;
  }

  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  return true;
};

// ============== CUSTOMERS ==============

export const fetchCustomers = async (): Promise<Customer[]> => {
  const userId = getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error fetching customers:', error);
    return [];
  }

  return (data || []).map(dbCustomerToCustomer);
};

export const createCustomer = async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer | null> => {
  const userId = getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('customers')
    .insert({
      name: customer.name,
      phone: customer.phone || null,
      email: customer.email || null,
      address: customer.address || null,
      company: customer.company || null,
      notes: customer.notes || null,
      avatar_url: null,
      total_orders: customer.totalOrders || 0,
      total_spent: customer.totalSpent || 0,
      last_order_date: customer.lastOrderDate || null,
      average_check: customer.averageCheck || null,
      top_categories: customer.topCategories || null,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    logger.error('Error creating customer:', error);
    return null;
  }

  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  return dbCustomerToCustomer(data);
};

export const updateCustomerInDb = async (customerId: string, updates: Partial<Customer>): Promise<Customer | null> => {
  const userId = getCurrentUserId();
  if (!userId) return null;

  const dbUpdates: Record<string, unknown> = {};

  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone || null;
  if (updates.email !== undefined) dbUpdates.email = updates.email || null;
  if (updates.address !== undefined) dbUpdates.address = updates.address || null;
  if (updates.company !== undefined) dbUpdates.company = updates.company || null;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;
  if (updates.totalOrders !== undefined) dbUpdates.total_orders = updates.totalOrders;
  if (updates.totalSpent !== undefined) dbUpdates.total_spent = updates.totalSpent;
  if (updates.lastOrderDate !== undefined) dbUpdates.last_order_date = updates.lastOrderDate || null;
  if (updates.averageCheck !== undefined) dbUpdates.average_check = updates.averageCheck || null;
  if (updates.topCategories !== undefined) dbUpdates.top_categories = updates.topCategories || null;

  const { data, error } = await supabase
    .from('customers')
    .update(dbUpdates)
    .eq('id', customerId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    logger.error('Error updating customer:', error);
    return null;
  }

  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  return dbCustomerToCustomer(data);
};

export const deleteCustomerFromDb = async (customerId: string): Promise<boolean> => {
  const userId = getCurrentUserId();
  if (!userId) return false;

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', customerId)
    .eq('user_id', userId);

  if (error) {
    logger.error('Error deleting customer:', error);
    return false;
  }

  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  return true;
};

// ============== ORDERS ==============

export const fetchOrders = async (): Promise<Order[]> => {
  const userId = getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error fetching orders:', error);
    return [];
  }

  return (data || []).map(dbOrderToOrder);
};

export const createOrderInDb = async (
  order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Order | null> => {
  const userId = getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('orders')
    .insert({
      order_number: order.orderNumber,
      status: order.status,
      total_amount: order.totalAmount,
      items_count: order.itemsCount,
      customer_id: order.customerId || null,
      customer_name: order.customer?.name || null,
      customer_phone: order.customer?.phone || null,
      customer_address: order.customer?.address || null,
      notes: order.notes || null,
      payment_method: order.paymentMethod,
      items: JSON.parse(JSON.stringify(order.items)), // Cast to JSON-compatible type
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    logger.error('Error creating order:', error);
    return null;
  }

  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  return dbOrderToOrder(data);
};

export const updateOrderInDb = async (orderId: string, updates: Partial<Order>): Promise<Order | null> => {
  const userId = getCurrentUserId();
  if (!userId) return null;

  const dbUpdates: Record<string, unknown> = {};

  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;
  if (updates.paymentMethod !== undefined) dbUpdates.payment_method = updates.paymentMethod;

  const { data, error } = await supabase
    .from('orders')
    .update(dbUpdates)
    .eq('id', orderId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    logger.error('Error updating order:', error);
    return null;
  }

  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  return dbOrderToOrder(data);
};

export const deleteOrderFromDb = async (orderId: string): Promise<boolean> => {
  const userId = getCurrentUserId();
  if (!userId) return false;

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId)
    .eq('user_id', userId);

  if (error) {
    logger.error('Error deleting order:', error);
    return false;
  }

  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  return true;
};

// ============== IMAGE UPLOAD ==============

export const uploadProductImage = async (
  productId: string,
  base64Data: string
): Promise<string | null> => {
  const userId = getCurrentUserId();
  if (!userId) return null;

  const fileName = `${userId}/${productId}/${Date.now()}.jpg`;
  const { url, error } = await uploadBase64File('products', fileName, base64Data, 'image/jpeg');

  if (error) {
    logger.error('Error uploading product image:', error);
    return null;
  }

  // Update the product's image_url in the database
  if (url) {
    await supabase
      .from('products')
      .update({ image_url: url })
      .eq('id', productId)
      .eq('user_id', userId);
  }

  return url;
};

export const uploadCustomerAvatar = async (
  customerId: string,
  base64Data: string
): Promise<string | null> => {
  const userId = getCurrentUserId();
  if (!userId) return null;

  const fileName = `${userId}/${customerId}/${Date.now()}.jpg`;
  const { url, error } = await uploadBase64File('avatars', fileName, base64Data, 'image/jpeg');

  if (error) {
    logger.error('Error uploading customer avatar:', error);
    return null;
  }

  // Update the customer's avatar_url in the database
  if (url) {
    await supabase
      .from('customers')
      .update({ avatar_url: url })
      .eq('id', customerId)
      .eq('user_id', userId);
  }

  return url;
};

// Upload product image without ID (for new products)
export const uploadNewProductImage = async (
  base64Data: string
): Promise<string | null> => {
  const userId = getCurrentUserId();
  if (!userId) return null;

  const fileName = `${userId}/temp/${Date.now()}.jpg`;
  const { url, error } = await uploadBase64File('products', fileName, base64Data, 'image/jpeg');

  if (error) {
    logger.error('Error uploading product image:', error);
    return null;
  }

  return url;
};

// ============== REALTIME SUBSCRIPTIONS ==============

let productsChannel: RealtimeChannel | null = null;
let customersChannel: RealtimeChannel | null = null;
let ordersChannel: RealtimeChannel | null = null;

type RealtimeCallback<T> = (event: 'INSERT' | 'UPDATE' | 'DELETE', data: T, oldData?: T) => void;

export const subscribeToProducts = (callback: RealtimeCallback<Product>): (() => void) => {
  const userId = getCurrentUserId();
  if (!userId) return () => {};

  productsChannel = supabase
    .channel('products-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'products',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const event = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
        const newData = payload.new as DbProduct;
        const oldData = payload.old as DbProduct;

        if (event === 'DELETE') {
          callback(event, dbProductToProduct({ ...oldData, name: oldData.name || '' }));
        } else {
          callback(event, dbProductToProduct(newData), oldData ? dbProductToProduct(oldData) : undefined);
        }
      }
    )
    .subscribe();

  return () => {
    if (productsChannel) {
      supabase.removeChannel(productsChannel);
      productsChannel = null;
    }
  };
};

export const subscribeToCustomers = (callback: RealtimeCallback<Customer>): (() => void) => {
  const userId = getCurrentUserId();
  if (!userId) return () => {};

  customersChannel = supabase
    .channel('customers-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'customers',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const event = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
        const newData = payload.new as DbCustomer;
        const oldData = payload.old as DbCustomer;

        if (event === 'DELETE') {
          callback(event, dbCustomerToCustomer({ ...oldData, name: oldData.name || '' }));
        } else {
          callback(event, dbCustomerToCustomer(newData), oldData ? dbCustomerToCustomer(oldData) : undefined);
        }
      }
    )
    .subscribe();

  return () => {
    if (customersChannel) {
      supabase.removeChannel(customersChannel);
      customersChannel = null;
    }
  };
};

export const subscribeToOrders = (callback: RealtimeCallback<Order>): (() => void) => {
  const userId = getCurrentUserId();
  if (!userId) return () => {};

  ordersChannel = supabase
    .channel('orders-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const event = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
        const newData = payload.new as DbOrder;
        const oldData = payload.old as DbOrder;

        if (event === 'DELETE') {
          callback(event, dbOrderToOrder({ ...oldData, id: oldData.id || '' }));
        } else {
          callback(event, dbOrderToOrder(newData), oldData ? dbOrderToOrder(oldData) : undefined);
        }
      }
    )
    .subscribe();

  return () => {
    if (ordersChannel) {
      supabase.removeChannel(ordersChannel);
      ordersChannel = null;
    }
  };
};

export const unsubscribeAll = () => {
  if (productsChannel) {
    supabase.removeChannel(productsChannel);
    productsChannel = null;
  }
  if (customersChannel) {
    supabase.removeChannel(customersChannel);
    customersChannel = null;
  }
  if (ordersChannel) {
    supabase.removeChannel(ordersChannel);
    ordersChannel = null;
  }
};

// ============== ANALYTICS ==============

export const getOrdersForPeriod = async (startDate: Date, endDate: Date): Promise<Order[]> => {
  const userId = getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error fetching orders for period:', error);
    return [];
  }

  return (data || []).map(dbOrderToOrder);
};

export const calculateRevenueForPeriod = async (startDate: Date, endDate: Date): Promise<{
  revenue: number;
  ordersCount: number;
  completedOrders: number;
}> => {
  const orders = await getOrdersForPeriod(startDate, endDate);
  const completedOrders = orders.filter(o => o.status === 'completed');
  const revenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return {
    revenue,
    ordersCount: orders.length,
    completedOrders: completedOrders.length,
  };
};

export const calculateProfitForPeriod = async (
  startDate: Date,
  endDate: Date,
  products: Product[]
): Promise<number> => {
  const orders = await getOrdersForPeriod(startDate, endDate);
  const completedOrders = orders.filter(o => o.status === 'completed');

  let profit = 0;
  for (const order of completedOrders) {
    for (const item of order.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const itemProfit = (item.price - product.costPrice) * item.quantity;
        profit += itemProfit;
      }
    }
  }

  return profit;
};

// Generate order number
export const generateOrderNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const { count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  const orderNum = (count || 0) + 1;
  return `ORD-${year}-${String(orderNum).padStart(3, '0')}`;
};

// ============== LIVE ANALYTICS FOR AI ==============

export interface LiveAnalyticsData {
  period: 'today' | 'week' | 'month';
  revenue: number;
  profit: number;
  ordersCount: number;
  completedOrders: number;
  averageOrderValue: number;
  topSellingProducts: {
    name: string;
    quantitySold: number;
    revenue: number;
    profit: number;
  }[];
  lowStockAlerts: {
    name: string;
    currentStock: number;
    minStock: number;
    daysUntilStockout: number | null;
  }[];
}

// Get live analytics for a specific period
export const getLiveAnalytics = async (
  period: 'today' | 'week' | 'month',
  products: Product[]
): Promise<LiveAnalyticsData> => {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  const orders = await getOrdersForPeriod(startDate, now);
  const completedOrders = orders.filter(o => o.status === 'completed');

  // Calculate revenue
  const revenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Calculate profit based on product cost prices
  let profit = 0;
  const productSales: Record<string, { quantity: number; revenue: number; profit: number; name: string }> = {};

  for (const order of completedOrders) {
    for (const item of order.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const itemProfit = (item.price - product.costPrice) * item.quantity;
        profit += itemProfit;

        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.productName,
            quantity: 0,
            revenue: 0,
            profit: 0,
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
        productSales[item.productId].profit += itemProfit;
      }
    }
  }

  // Top selling products sorted by revenue
  const topSellingProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(p => ({
      name: p.name,
      quantitySold: p.quantity,
      revenue: p.revenue,
      profit: p.profit,
    }));

  // Calculate low stock alerts with estimated days until stockout
  const lowStockAlerts = products
    .filter(p => p.stock <= p.minStock && p.isActive)
    .map(p => {
      // Estimate daily sales rate
      const productSalesData = productSales[p.id];
      const periodDays = period === 'today' ? 1 : period === 'week' ? 7 : 30;
      const dailySalesRate = productSalesData ? productSalesData.quantity / periodDays : null;
      const daysUntilStockout = dailySalesRate && dailySalesRate > 0
        ? Math.floor(p.stock / dailySalesRate)
        : null;

      return {
        name: p.name,
        currentStock: p.stock,
        minStock: p.minStock,
        daysUntilStockout,
      };
    })
    .sort((a, b) => (a.daysUntilStockout ?? 999) - (b.daysUntilStockout ?? 999));

  const averageOrderValue = completedOrders.length > 0 ? revenue / completedOrders.length : 0;

  return {
    period,
    revenue,
    profit,
    ordersCount: orders.length,
    completedOrders: completedOrders.length,
    averageOrderValue,
    topSellingProducts,
    lowStockAlerts,
  };
};

// Get comparison data between two periods
export const getPeriodComparison = async (
  products: Product[]
): Promise<{
  thisWeek: { revenue: number; orders: number; profit: number };
  lastWeek: { revenue: number; orders: number; profit: number };
  growthPercent: number;
}> => {
  const now = new Date();
  const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const lastWeekEnd = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const thisWeekOrders = await getOrdersForPeriod(thisWeekStart, now);
  const lastWeekOrders = await getOrdersForPeriod(lastWeekStart, lastWeekEnd);

  const calculateMetrics = (orders: Order[]) => {
    const completed = orders.filter(o => o.status === 'completed');
    const revenue = completed.reduce((sum, o) => sum + o.totalAmount, 0);
    let profit = 0;
    for (const order of completed) {
      for (const item of order.items) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          profit += (item.price - product.costPrice) * item.quantity;
        }
      }
    }
    return { revenue, orders: completed.length, profit };
  };

  const thisWeek = calculateMetrics(thisWeekOrders);
  const lastWeek = calculateMetrics(lastWeekOrders);

  const growthPercent = lastWeek.revenue > 0
    ? Math.round(((thisWeek.revenue - lastWeek.revenue) / lastWeek.revenue) * 100)
    : thisWeek.revenue > 0 ? 100 : 0;

  return { thisWeek, lastWeek, growthPercent };
};
