import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/store/authStore';
import { logger } from '@/lib/logger';
import * as Haptics from 'expo-haptics';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type {
  Product,
  Customer,
  Order,
  Supplier,
  Manufacturer,
  Location,
  KPIData,
  Activity,
  ProductCategory,
} from '@/types';

// Demo mode check - in a real app this would check if user is in demo mode
const isDemoUser = (): boolean => {
  const userId = getCurrentUserId();
  return !userId || userId.startsWith('demo-');
};

// Cache keys
const CACHE_KEYS = {
  products: '@lkscale_products',
  customers: '@lkscale_customers',
  orders: '@lkscale_orders',
  suppliers: '@lkscale_suppliers',
  manufacturers: '@lkscale_manufacturers',
  locations: '@lkscale_locations',
  categories: '@lkscale_categories',
  kpi: '@lkscale_kpi',
  activities: '@lkscale_activities',
  lastSync: '@lkscale_last_sync',
};

// Sync status type
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'offline';

export interface SyncState {
  status: SyncStatus;
  progress: number;
  currentEntity: string | null;
  lastSyncTime: string | null;
  error: string | null;
  isOffline: boolean;
}

// Sync state management
let syncState: SyncState = {
  status: 'idle',
  progress: 0,
  currentEntity: null,
  lastSyncTime: null,
  error: null,
  isOffline: false,
};

type SyncListener = (state: SyncState) => void;
const syncListeners: Set<SyncListener> = new Set();

const notifySyncListeners = () => {
  syncListeners.forEach((listener) => listener({ ...syncState }));
};

export const subscribeToSync = (listener: SyncListener): (() => void) => {
  syncListeners.add(listener);
  listener({ ...syncState });
  return () => {
    syncListeners.delete(listener);
  };
};

const setSyncState = (updates: Partial<SyncState>) => {
  syncState = { ...syncState, ...updates };
  notifySyncListeners();
};

// Realtime subscription channels
let channels: RealtimeChannel[] = [];

// Type definitions for DB rows
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

type DbSupplier = {
  id: string;
  user_id: string | null;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  notes: string | null;
  payment_terms: string | null;
  lead_time_days: number | null;
  rating: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

type DbManufacturer = {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

type DbLocation = {
  id: string;
  user_id: string | null;
  name: string;
  type: string | null;
  address: string | null;
  phone: string | null;
  manager_id: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

// DB to App type converters
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
  items: (db.items as Order['items']) || [],
  createdAt: db.created_at || new Date().toISOString(),
  updatedAt: db.updated_at || new Date().toISOString(),
});

const dbSupplierToSupplier = (db: DbSupplier): Supplier => ({
  id: db.id,
  name: db.name,
  contactName: db.contact_name || undefined,
  email: db.email || undefined,
  phone: db.phone || undefined,
  address: db.address || undefined,
  website: db.website || undefined,
  notes: db.notes || undefined,
  paymentTerms: db.payment_terms || undefined,
  leadTimeDays: db.lead_time_days || 0,
  rating: db.rating || undefined,
  isActive: db.is_active ?? true,
  createdAt: db.created_at || new Date().toISOString(),
  updatedAt: db.updated_at || undefined,
});

const dbManufacturerToManufacturer = (db: DbManufacturer): Manufacturer => ({
  id: db.id,
  name: db.name,
  description: db.description || undefined,
  website: db.website || undefined,
  logoUrl: db.logo_url || undefined,
  isActive: db.is_active ?? true,
  createdAt: db.created_at || new Date().toISOString(),
  updatedAt: db.updated_at || undefined,
});

const dbLocationToLocation = (db: DbLocation): Location => ({
  id: db.id,
  userId: db.user_id || undefined,
  name: db.name,
  type: (db.type as Location['type']) || 'warehouse',
  address: db.address || undefined,
  phone: db.phone || undefined,
  managerId: db.manager_id || undefined,
  isActive: db.is_active ?? true,
  createdAt: db.created_at || new Date().toISOString(),
  updatedAt: db.updated_at || undefined,
});

// ==================== SYNC FUNCTIONS ====================

export const syncProducts = async (): Promise<Product[]> => {
  const userId = getCurrentUserId();
  if (!userId || isDemoUser()) return [];

  setSyncState({ currentEntity: 'products', progress: 10 });

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error syncing products:', error);
    throw new Error(`Failed to sync products: ${error.message}`);
  }

  const products = (data || []).map(dbProductToProduct);
  await AsyncStorage.setItem(CACHE_KEYS.products, JSON.stringify(products));
  setSyncState({ progress: 20 });

  return products;
};

export const syncCustomers = async (): Promise<Customer[]> => {
  const userId = getCurrentUserId();
  if (!userId || isDemoUser()) return [];

  setSyncState({ currentEntity: 'customers', progress: 25 });

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error syncing customers:', error);
    throw new Error(`Failed to sync customers: ${error.message}`);
  }

  const customers = (data || []).map(dbCustomerToCustomer);
  await AsyncStorage.setItem(CACHE_KEYS.customers, JSON.stringify(customers));
  setSyncState({ progress: 40 });

  return customers;
};

export const syncOrders = async (): Promise<Order[]> => {
  const userId = getCurrentUserId();
  if (!userId || isDemoUser()) return [];

  setSyncState({ currentEntity: 'orders', progress: 45 });

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error syncing orders:', error);
    throw new Error(`Failed to sync orders: ${error.message}`);
  }

  const orders = (data || []).map(dbOrderToOrder);
  await AsyncStorage.setItem(CACHE_KEYS.orders, JSON.stringify(orders));
  setSyncState({ progress: 60 });

  return orders;
};

export const syncSuppliers = async (): Promise<Supplier[]> => {
  const userId = getCurrentUserId();
  if (!userId || isDemoUser()) return [];

  setSyncState({ currentEntity: 'suppliers', progress: 65 });

  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error syncing suppliers:', error);
    throw new Error(`Failed to sync suppliers: ${error.message}`);
  }

  const suppliers = (data || []).map(dbSupplierToSupplier);
  await AsyncStorage.setItem(CACHE_KEYS.suppliers, JSON.stringify(suppliers));
  setSyncState({ progress: 75 });

  return suppliers;
};

export const syncManufacturers = async (): Promise<Manufacturer[]> => {
  const userId = getCurrentUserId();
  if (!userId || isDemoUser()) return [];

  setSyncState({ currentEntity: 'manufacturers', progress: 80 });

  const { data, error } = await supabase
    .from('manufacturers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error syncing manufacturers:', error);
    throw new Error(`Failed to sync manufacturers: ${error.message}`);
  }

  const manufacturers = (data || []).map(dbManufacturerToManufacturer);
  await AsyncStorage.setItem(CACHE_KEYS.manufacturers, JSON.stringify(manufacturers));
  setSyncState({ progress: 85 });

  return manufacturers;
};

export const syncLocations = async (): Promise<Location[]> => {
  const userId = getCurrentUserId();
  if (!userId || isDemoUser()) return [];

  setSyncState({ currentEntity: 'locations', progress: 90 });

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error syncing locations:', error);
    throw new Error(`Failed to sync locations: ${error.message}`);
  }

  const locations = (data || []).map(dbLocationToLocation);
  await AsyncStorage.setItem(CACHE_KEYS.locations, JSON.stringify(locations));
  setSyncState({ progress: 95 });

  return locations;
};

export interface SyncAllResult {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  suppliers: Supplier[];
  manufacturers: Manufacturer[];
  locations: Location[];
  kpi: KPIData;
  activities: Activity[];
}

export const syncAll = async (): Promise<SyncAllResult> => {
  const userId = getCurrentUserId();
  const demo = isDemoUser();

  if (!userId || demo) {
    throw new Error('Cannot sync: user not authenticated or in demo mode');
  }

  setSyncState({ status: 'syncing', progress: 0, currentEntity: null, error: null });

  try {
    const [
      products,
      customers,
      orders,
      suppliers,
      manufacturers,
      locations,
    ] = await Promise.all([
      syncProducts(),
      syncCustomers(),
      syncOrders(),
      syncSuppliers(),
      syncManufacturers(),
      syncLocations(),
    ]);

    // Calculate KPI from real data
    const completedOrders = orders.filter((o) => o.status === 'completed');
    const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'processing');
    const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
    const totalSales = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const kpi: KPIData = {
      totalSales,
      salesChange: 0,
      activeOrders: pendingOrders.length,
      ordersChange: 0,
      balance: totalSales * 0.3,
      balanceChange: 0,
      lowStockItems: lowStockProducts.length,
    };

    // Generate activities
    const activities = generateActivitiesFromOrders(orders, products);

    // Save KPI and activities to cache
    await AsyncStorage.setItem(CACHE_KEYS.kpi, JSON.stringify(kpi));
    await AsyncStorage.setItem(CACHE_KEYS.activities, JSON.stringify(activities));
    await AsyncStorage.setItem(CACHE_KEYS.lastSync, new Date().toISOString());

    setSyncState({
      status: 'success',
      progress: 100,
      currentEntity: null,
      lastSyncTime: new Date().toISOString(),
      error: null,
      isOffline: false,
    });

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Haptics may fail on some devices
    }

    return {
      products,
      customers,
      orders,
      suppliers,
      manufacturers,
      locations,
      kpi,
      activities,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
    logger.error('Sync failed:', error);
    setSyncState({
      status: 'error',
      progress: 0,
      currentEntity: null,
      error: errorMessage,
    });
    throw error;
  }
};

// Generate activities from orders
const generateActivitiesFromOrders = (orders: Order[], products: Product[]): Activity[] => {
  const activities: Activity[] = [];
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  // Add recent orders as activities
  orders.slice(0, 5).forEach((order) => {
    if (order.status === 'completed') {
      activities.push({
        id: `act-${order.id}-completed`,
        type: 'order_completed',
        title: 'Заказ выполнен',
        description: `Заказ ${order.orderNumber} ${order.customer?.name ? `(${order.customer.name})` : ''} успешно доставлен`,
        timestamp: order.updatedAt,
      });
    } else if (order.status === 'pending' || order.status === 'processing') {
      activities.push({
        id: `act-${order.id}-created`,
        type: 'order_created',
        title: 'Новый заказ',
        description: `Получен заказ ${order.orderNumber} на сумму ${order.totalAmount.toLocaleString('ru-RU')} ₽`,
        timestamp: order.createdAt,
      });
    }
  });

  // Add low stock alerts
  lowStockProducts.slice(0, 3).forEach((product) => {
    activities.push({
      id: `act-lowstock-${product.id}`,
      type: 'stock_low',
      title: 'Низкий остаток',
      description: `${product.name} - осталось ${product.stock} шт. (мин. ${product.minStock})`,
      timestamp: new Date().toISOString(),
    });
  });

  // Sort by timestamp
  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// ==================== CACHE FUNCTIONS ====================

export interface CachedDataResult extends Partial<SyncAllResult> {
  lastSyncTime?: string | null;
}

export const loadCachedData = async (): Promise<CachedDataResult | null> => {
  try {
    const [
      products,
      customers,
      orders,
      suppliers,
      manufacturers,
      locations,
      kpi,
      activities,
      lastSync,
    ] = await Promise.all([
      AsyncStorage.getItem(CACHE_KEYS.products),
      AsyncStorage.getItem(CACHE_KEYS.customers),
      AsyncStorage.getItem(CACHE_KEYS.orders),
      AsyncStorage.getItem(CACHE_KEYS.suppliers),
      AsyncStorage.getItem(CACHE_KEYS.manufacturers),
      AsyncStorage.getItem(CACHE_KEYS.locations),
      AsyncStorage.getItem(CACHE_KEYS.kpi),
      AsyncStorage.getItem(CACHE_KEYS.activities),
      AsyncStorage.getItem(CACHE_KEYS.lastSync),
    ]);

    if (lastSync) {
      setSyncState({ lastSyncTime: lastSync });
    }

    return {
      products: products ? JSON.parse(products) : [],
      customers: customers ? JSON.parse(customers) : [],
      orders: orders ? JSON.parse(orders) : [],
      suppliers: suppliers ? JSON.parse(suppliers) : [],
      manufacturers: manufacturers ? JSON.parse(manufacturers) : [],
      locations: locations ? JSON.parse(locations) : [],
      kpi: kpi ? JSON.parse(kpi) : null,
      activities: activities ? JSON.parse(activities) : [],
      lastSyncTime: lastSync,
    };
  } catch (error) {
    logger.error('Error loading cached data:', error);
    return null;
  }
};

export const clearCache = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(CACHE_KEYS.products),
      AsyncStorage.removeItem(CACHE_KEYS.customers),
      AsyncStorage.removeItem(CACHE_KEYS.orders),
      AsyncStorage.removeItem(CACHE_KEYS.suppliers),
      AsyncStorage.removeItem(CACHE_KEYS.manufacturers),
      AsyncStorage.removeItem(CACHE_KEYS.locations),
      AsyncStorage.removeItem(CACHE_KEYS.kpi),
      AsyncStorage.removeItem(CACHE_KEYS.activities),
      AsyncStorage.removeItem(CACHE_KEYS.lastSync),
    ]);
    setSyncState({ lastSyncTime: null });
  } catch (error) {
    logger.error('Error clearing cache:', error);
  }
};

// ==================== REALTIME SUBSCRIPTIONS ====================

export type DataChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE';
export type DataChangeCallback<T> = (event: DataChangeEvent, data: T, oldData?: T) => void;

export const subscribeToProducts = (callback: DataChangeCallback<Product>): (() => void) => {
  const userId = getCurrentUserId();
  if (!userId || isDemoUser()) return () => {};

  const channel = supabase
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
        const event = payload.eventType as DataChangeEvent;
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

  channels.push(channel);

  return () => {
    supabase.removeChannel(channel);
    channels = channels.filter((c) => c !== channel);
  };
};

export const subscribeToCustomers = (callback: DataChangeCallback<Customer>): (() => void) => {
  const userId = getCurrentUserId();
  if (!userId || isDemoUser()) return () => {};

  const channel = supabase
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
        const event = payload.eventType as DataChangeEvent;
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

  channels.push(channel);

  return () => {
    supabase.removeChannel(channel);
    channels = channels.filter((c) => c !== channel);
  };
};

export const subscribeToOrders = (callback: DataChangeCallback<Order>): (() => void) => {
  const userId = getCurrentUserId();
  if (!userId || isDemoUser()) return () => {};

  const channel = supabase
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
        const event = payload.eventType as DataChangeEvent;
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

  channels.push(channel);

  return () => {
    supabase.removeChannel(channel);
    channels = channels.filter((c) => c !== channel);
  };
};

export const subscribeToSuppliers = (callback: DataChangeCallback<Supplier>): (() => void) => {
  const userId = getCurrentUserId();
  if (!userId || isDemoUser()) return () => {};

  const channel = supabase
    .channel('suppliers-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'suppliers',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const event = payload.eventType as DataChangeEvent;
        const newData = payload.new as DbSupplier;
        const oldData = payload.old as DbSupplier;

        if (event === 'DELETE') {
          callback(event, dbSupplierToSupplier({ ...oldData, name: oldData.name || '' }));
        } else {
          callback(event, dbSupplierToSupplier(newData), oldData ? dbSupplierToSupplier(oldData) : undefined);
        }
      }
    )
    .subscribe();

  channels.push(channel);

  return () => {
    supabase.removeChannel(channel);
    channels = channels.filter((c) => c !== channel);
  };
};

export const subscribeToManufacturers = (callback: DataChangeCallback<Manufacturer>): (() => void) => {
  if (isDemoUser()) return () => {};

  const channel = supabase
    .channel('manufacturers-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'manufacturers',
      },
      (payload) => {
        const event = payload.eventType as DataChangeEvent;
        const newData = payload.new as DbManufacturer;
        const oldData = payload.old as DbManufacturer;

        if (event === 'DELETE') {
          callback(event, dbManufacturerToManufacturer({ ...oldData, name: oldData.name || '' }));
        } else {
          callback(event, dbManufacturerToManufacturer(newData), oldData ? dbManufacturerToManufacturer(oldData) : undefined);
        }
      }
    )
    .subscribe();

  channels.push(channel);

  return () => {
    supabase.removeChannel(channel);
    channels = channels.filter((c) => c !== channel);
  };
};

export const subscribeToLocations = (callback: DataChangeCallback<Location>): (() => void) => {
  const userId = getCurrentUserId();
  if (!userId || isDemoUser()) return () => {};

  const channel = supabase
    .channel('locations-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'locations',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const event = payload.eventType as DataChangeEvent;
        const newData = payload.new as DbLocation;
        const oldData = payload.old as DbLocation;

        if (event === 'DELETE') {
          callback(event, dbLocationToLocation({ ...oldData, name: oldData.name || '' }));
        } else {
          callback(event, dbLocationToLocation(newData), oldData ? dbLocationToLocation(oldData) : undefined);
        }
      }
    )
    .subscribe();

  channels.push(channel);

  return () => {
    supabase.removeChannel(channel);
    channels = channels.filter((c) => c !== channel);
  };
};

export const unsubscribeAll = (): void => {
  channels.forEach((channel) => {
    supabase.removeChannel(channel);
  });
  channels = [];
};

// ==================== UTILITY FUNCTIONS ====================

export const getSyncStatus = (): SyncState => ({ ...syncState });

export const setOfflineStatus = (isOffline: boolean): void => {
  setSyncState({ isOffline, status: isOffline ? 'offline' : syncState.status });
};

export const forceSync = async (): Promise<SyncAllResult> => {
  return syncAll();
};

// Initialize sync service
export const initSyncService = async (): Promise<void> => {
  // Load cached data first for immediate display
  const cached = await loadCachedData();

  if (cached?.lastSyncTime) {
    setSyncState({ lastSyncTime: cached.lastSyncTime });
  }
};
