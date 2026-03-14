import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  Order,
  Product,
  KPIData,
  Activity,
  Customer,
  SalesDataPoint,
  ProductCategory,
  CartItem,
  NewOrderData,
  ProductVariant,
  ProductWithVariants,
  Supplier,
  Manufacturer,
  Location,
} from '@/types';
import { logger } from '@/lib/logger';
import {
  fetchProducts as fetchProductsFromDb,
  fetchCustomers as fetchCustomersFromDb,
  fetchOrders as fetchOrdersFromDb,
  createProduct as createProductInSupabase,
  updateProductInDb,
  deleteProductFromDb,
  createCustomer as createCustomerInSupabase,
  updateCustomerInDb,
  deleteCustomerFromDb,
  createOrderInDb,
  updateOrderInDb,
  subscribeToProducts,
  subscribeToCustomers,
  subscribeToOrders,
  unsubscribeAll,
  generateOrderNumber,
} from '@/lib/supabaseDataService';
import {
  syncAll,
  syncProducts,
  syncCustomers,
  syncOrders,
  syncSuppliers,
  syncManufacturers,
  syncLocations,
  loadCachedData as loadSyncCachedData,
  subscribeToSync,
  getSyncStatus,
  SyncAllResult,
} from '@/services/syncService';
import { getCurrentUserId } from '@/store/authStore';

const ORDERS_CACHE_KEY = '@lkscale_orders';
const PRODUCTS_CACHE_KEY = '@lkscale_products';
const CUSTOMERS_CACHE_KEY = '@lkscale_customers';
const SUPPLIERS_CACHE_KEY = '@lkscale_suppliers';
const MANUFACTURERS_CACHE_KEY = '@lkscale_manufacturers';
const LOCATIONS_CACHE_KEY = '@lkscale_locations';
const KPI_CACHE_KEY = '@lkscale_kpi';
const ACTIVITIES_CACHE_KEY = '@lkscale_activities';
const LAST_SYNC_KEY = '@lkscale_last_sync';
const VARIANTS_CACHE_KEY = '@lkscale_variants';

// Realtime subscription cleanup functions
let unsubProducts: (() => void) | null = null;
let unsubCustomers: (() => void) | null = null;
let unsubOrders: (() => void) | null = null;

// Store state
type Listener = () => void;
const listeners: Set<Listener> = new Set();

interface DataState {
  orders: Order[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  manufacturers: Manufacturer[];
  locations: Location[];
  categories: ProductCategory[];
  variants: ProductVariant[];
  kpi: KPIData | null;
  activities: Activity[];
  salesData: {
    week: SalesDataPoint[];
    month: SalesDataPoint[];
  };
  isLoading: boolean;
  lastSync: string | null;
  isOffline: boolean;
}

let dataState: DataState = {
  orders: [],
  products: [],
  customers: [],
  suppliers: [],
  manufacturers: [],
  locations: [],
  categories: [],
  variants: [],
  kpi: null,
  activities: [],
  salesData: {
    week: [],
    month: [],
  },
  isLoading: true,
  lastSync: null,
  isOffline: false,
};

export const getDataState = () => dataState;

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

export const subscribeData = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const setDataState = (updates: Partial<DataState>) => {
  dataState = { ...dataState, ...updates };
  notifyListeners();
};

// Generate sales data from real orders
const generateSalesDataFromOrders = (orders: Order[], period: 'week' | 'month'): SalesDataPoint[] => {
  const data: SalesDataPoint[] = [];
  const now = new Date();
  const days = period === 'week' ? 7 : 30;
  const labels = period === 'week'
    ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    : [];

  // Group orders by date
  const ordersByDate: Record<string, Order[]> = {};
  orders.filter(o => o.status === 'completed').forEach(order => {
    const date = new Date(order.createdAt).toISOString().split('T')[0];
    if (!ordersByDate[date]) ordersByDate[date] = [];
    ordersByDate[date].push(order);
  });

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayOrders = ordersByDate[dateStr] || [];

    const sales = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const ordersCount = dayOrders.length;

    data.push({
      date: date.toISOString(),
      label: period === 'week' ? labels[(date.getDay() + 6) % 7] : `${date.getDate()}`,
      sales,
      orders: ordersCount,
    });
  }

  return data;
};

// Cache functions
export const cacheData = async () => {
  try {
    await Promise.all([
      AsyncStorage.setItem(ORDERS_CACHE_KEY, JSON.stringify(dataState.orders)),
      AsyncStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(dataState.products)),
      AsyncStorage.setItem(CUSTOMERS_CACHE_KEY, JSON.stringify(dataState.customers)),
      AsyncStorage.setItem(SUPPLIERS_CACHE_KEY, JSON.stringify(dataState.suppliers)),
      AsyncStorage.setItem(MANUFACTURERS_CACHE_KEY, JSON.stringify(dataState.manufacturers)),
      AsyncStorage.setItem(LOCATIONS_CACHE_KEY, JSON.stringify(dataState.locations)),
      AsyncStorage.setItem(VARIANTS_CACHE_KEY, JSON.stringify(dataState.variants)),
      AsyncStorage.setItem(KPI_CACHE_KEY, JSON.stringify(dataState.kpi)),
      AsyncStorage.setItem(ACTIVITIES_CACHE_KEY, JSON.stringify(dataState.activities)),
      AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString()),
    ]);
  } catch (error) {
    logger.error('Error caching data:', error);
  }
};

// Load cached data
export const loadCachedData = async () => {
  try {
    // First try to load from new sync service cache
    const syncCached = await loadSyncCachedData();
    if (syncCached) {
      const weekData = generateSalesDataFromOrders(syncCached.orders || [], 'week');
      const monthData = generateSalesDataFromOrders(syncCached.orders || [], 'month');

      setDataState({
        orders: syncCached.orders || [],
        products: syncCached.products || [],
        customers: syncCached.customers || [],
        suppliers: syncCached.suppliers || [],
        manufacturers: syncCached.manufacturers || [],
        locations: syncCached.locations || [],
        categories: [],
        variants: [],
        kpi: syncCached.kpi || null,
        activities: syncCached.activities || [],
        salesData: {
          week: weekData,
          month: monthData,
        },
        lastSync: syncCached.lastSyncTime || null,
        isLoading: false,
        isOffline: true,
      });

      return true;
    }

    // Fallback to legacy cache
    const [orders, products, customers, variants, kpi, activities, lastSync] = await Promise.all([
      AsyncStorage.getItem(ORDERS_CACHE_KEY),
      AsyncStorage.getItem(PRODUCTS_CACHE_KEY),
      AsyncStorage.getItem(CUSTOMERS_CACHE_KEY),
      AsyncStorage.getItem(VARIANTS_CACHE_KEY),
      AsyncStorage.getItem(KPI_CACHE_KEY),
      AsyncStorage.getItem(ACTIVITIES_CACHE_KEY),
      AsyncStorage.getItem(LAST_SYNC_KEY),
    ]);

    const parsedOrders: Order[] = orders ? JSON.parse(orders) : [];

    setDataState({
      orders: parsedOrders,
      products: products ? JSON.parse(products) : [],
      customers: customers ? JSON.parse(customers) : [],
      categories: [],
      variants: variants ? JSON.parse(variants) : [],
      kpi: kpi ? JSON.parse(kpi) : null,
      activities: activities ? JSON.parse(activities) : [],
      salesData: {
        week: generateSalesDataFromOrders(parsedOrders, 'week'),
        month: generateSalesDataFromOrders(parsedOrders, 'month'),
      },
      lastSync,
      isLoading: false,
      isOffline: true,
    });

    return true;
  } catch (error) {
    logger.error('Error loading cached data:', error);
    return false;
  }
};

// Initialize realtime subscriptions
const initRealtimeSubscriptions = () => {
  // Cleanup existing subscriptions
  if (unsubProducts) unsubProducts();
  if (unsubCustomers) unsubCustomers();
  if (unsubOrders) unsubOrders();

  // Subscribe to products changes
  unsubProducts = subscribeToProducts((event, product) => {
    if (!product?.id) return;

    const currentProducts = [...dataState.products];

    if (event === 'INSERT') {
      if (!currentProducts.find(p => p.id === product.id)) {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
        setDataState({ products: [product, ...currentProducts] });
      }
    } else if (event === 'UPDATE') {
      const index = currentProducts.findIndex(p => p.id === product.id);
      if (index !== -1) {
        currentProducts[index] = product;
        setDataState({ products: currentProducts });
      }
    } else if (event === 'DELETE') {
      setDataState({ products: currentProducts.filter(p => p.id !== product.id) });
    }
  });

  // Subscribe to customers changes
  unsubCustomers = subscribeToCustomers((event, customer) => {
    if (!customer?.id) return;

    const currentCustomers = [...dataState.customers];

    if (event === 'INSERT') {
      if (!currentCustomers.find(c => c.id === customer.id)) {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
        setDataState({ customers: [customer, ...currentCustomers] });
      }
    } else if (event === 'UPDATE') {
      const index = currentCustomers.findIndex(c => c.id === customer.id);
      if (index !== -1) {
        currentCustomers[index] = customer;
        setDataState({ customers: currentCustomers });
      }
    } else if (event === 'DELETE') {
      setDataState({ customers: currentCustomers.filter(c => c.id !== customer.id) });
    }
  });

  // Subscribe to orders changes
  unsubOrders = subscribeToOrders((event, order) => {
    if (!order?.id) return;

    const currentOrders = [...dataState.orders];

    if (event === 'INSERT') {
      if (!currentOrders.find(o => o.id === order.id)) {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
        setDataState({ orders: [order, ...currentOrders] });
      }
    } else if (event === 'UPDATE') {
      const index = currentOrders.findIndex(o => o.id === order.id);
      if (index !== -1) {
        currentOrders[index] = order;
        setDataState({ orders: currentOrders });
      }
    } else if (event === 'DELETE') {
      setDataState({ orders: currentOrders.filter(o => o.id !== order.id) });
    }
  });
};

// Cleanup realtime subscriptions
export const cleanupRealtimeSubscriptions = () => {
  if (unsubProducts) unsubProducts();
  if (unsubCustomers) unsubCustomers();
  if (unsubOrders) unsubOrders();
  unsubProducts = null;
  unsubCustomers = null;
  unsubOrders = null;
  unsubscribeAll();
};

// Fetch all data using sync service
export const fetchData = async () => {
  setDataState({ isLoading: true });

  const userId = getCurrentUserId();

  try {
    if (userId) {
      // Use new sync service for real users
      const result = await syncAll();

      setDataState({
        orders: result.orders,
        products: result.products,
        customers: result.customers,
        suppliers: result.suppliers,
        manufacturers: result.manufacturers,
        locations: result.locations,
        categories: [],
        variants: [],
        kpi: result.kpi,
        activities: result.activities,
        salesData: {
          week: generateSalesDataFromOrders(result.orders, 'week'),
          month: generateSalesDataFromOrders(result.orders, 'month'),
        },
        isLoading: false,
        lastSync: new Date().toISOString(),
        isOffline: false,
      });

      // Initialize realtime subscriptions
      initRealtimeSubscriptions();

      await cacheData();
    } else {
      // No user, try to load cached data
      const hasCached = await loadCachedData();
      if (!hasCached) {
        setDataState({
          orders: [],
          products: [],
          customers: [],
          suppliers: [],
          manufacturers: [],
          locations: [],
          categories: [],
          variants: [],
          kpi: null,
          activities: [],
          salesData: { week: [], month: [] },
          isLoading: false,
          lastSync: null,
          isOffline: true,
        });
      }
    }
  } catch (error) {
    logger.error('Error fetching data:', error);
    // Try to load cached data
    const hasCached = await loadCachedData();
    if (!hasCached) {
      setDataState({
        orders: [],
        products: [],
        customers: [],
        suppliers: [],
        manufacturers: [],
        locations: [],
        categories: [],
        variants: [],
        kpi: null,
        activities: [],
        salesData: { week: [], month: [] },
        isLoading: false,
        lastSync: null,
        isOffline: true,
      });
    }
  }
};

// Individual sync functions for specific entities
export const refreshProducts = async (): Promise<Product[]> => {
  const userId = getCurrentUserId();
  if (!userId) return dataState.products;

  try {
    const products = await syncProducts();
    setDataState({ products });
    await cacheData();
    return products;
  } catch (error) {
    logger.error('Error refreshing products:', error);
    return dataState.products;
  }
};

export const refreshCustomers = async (): Promise<Customer[]> => {
  const userId = getCurrentUserId();
  if (!userId) return dataState.customers;

  try {
    const customers = await syncCustomers();
    setDataState({ customers });
    await cacheData();
    return customers;
  } catch (error) {
    logger.error('Error refreshing customers:', error);
    return dataState.customers;
  }
};

export const refreshOrders = async (): Promise<Order[]> => {
  const userId = getCurrentUserId();
  if (!userId) return dataState.orders;

  try {
    const orders = await syncOrders();
    setDataState({
      orders,
      salesData: {
        week: generateSalesDataFromOrders(orders, 'week'),
        month: generateSalesDataFromOrders(orders, 'month'),
      },
    });
    await cacheData();
    return orders;
  } catch (error) {
    logger.error('Error refreshing orders:', error);
    return dataState.orders;
  }
};

export const refreshSuppliers = async (): Promise<Supplier[]> => {
  const userId = getCurrentUserId();
  if (!userId) return dataState.suppliers;

  try {
    const suppliers = await syncSuppliers();
    setDataState({ suppliers });
    await cacheData();
    return suppliers;
  } catch (error) {
    logger.error('Error refreshing suppliers:', error);
    return dataState.suppliers;
  }
};

export const refreshManufacturers = async (): Promise<Manufacturer[]> => {
  const userId = getCurrentUserId();
  if (!userId) return dataState.manufacturers;

  try {
    const manufacturers = await syncManufacturers();
    setDataState({ manufacturers });
    await cacheData();
    return manufacturers;
  } catch (error) {
    logger.error('Error refreshing manufacturers:', error);
    return dataState.manufacturers;
  }
};

export const refreshLocations = async (): Promise<Location[]> => {
  const userId = getCurrentUserId();
  if (!userId) return dataState.locations;

  try {
    const locations = await syncLocations();
    setDataState({ locations });
    await cacheData();
    return locations;
  } catch (error) {
    logger.error('Error refreshing locations:', error);
    return dataState.locations;
  }
};

// Getters
export const getOrderById = (id: string): Order | undefined => {
  return dataState.orders.find((order) => order.id === id);
};

export const getOrderByNumber = (orderNumber: string): Order | undefined => {
  return dataState.orders.find((order) =>
    order.orderNumber.toLowerCase() === orderNumber.toLowerCase()
  );
};

export const getProductById = (id: string): Product | undefined => {
  return dataState.products.find((product) => product.id === id);
};

export const getProductByBarcode = (barcode: string): Product | undefined => {
  return dataState.products.find((product) => product.barcode === barcode);
};

export const getProductBySku = (sku: string): Product | undefined => {
  return dataState.products.find((product) =>
    product.sku.toLowerCase() === sku.toLowerCase()
  );
};

export const getCustomerById = (id: string): Customer | undefined => {
  return dataState.customers.find((customer) => customer.id === id);
};

export const getSupplierById = (id: string): Supplier | undefined => {
  return dataState.suppliers.find((supplier) => supplier.id === id);
};

export const getManufacturerById = (id: string): Manufacturer | undefined => {
  return dataState.manufacturers.find((m) => m.id === id);
};

export const getLocationById = (id: string): Location | undefined => {
  return dataState.locations.find((l) => l.id === id);
};

// Search functions
export const searchOrders = (query: string, statusFilter?: string): Order[] => {
  let filtered = dataState.orders;

  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(lowerQuery) ||
        order.customer?.name.toLowerCase().includes(lowerQuery)
    );
  }

  if (statusFilter && statusFilter !== 'all') {
    filtered = filtered.filter((order) => order.status === statusFilter);
  }

  return filtered;
};

export const searchProducts = (query: string, categoryFilter?: string): Product[] => {
  let filtered = dataState.products;

  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.sku.toLowerCase().includes(lowerQuery) ||
        (product.barcode && product.barcode.includes(query))
    );
  }

  if (categoryFilter && categoryFilter !== 'all') {
    filtered = filtered.filter((product) => product.category === categoryFilter);
  }

  return filtered;
};

export const searchCustomers = (query: string): Customer[] => {
  if (!query) return dataState.customers;

  const lowerQuery = query.toLowerCase();
  return dataState.customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(lowerQuery) ||
      (customer.phone && customer.phone.includes(query)) ||
      (customer.email && customer.email.toLowerCase().includes(lowerQuery))
  );
};

export const searchSuppliers = (query: string): Supplier[] => {
  if (!query) return dataState.suppliers;

  const lowerQuery = query.toLowerCase();
  return dataState.suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(lowerQuery) ||
      (supplier.contactName && supplier.contactName.toLowerCase().includes(lowerQuery)) ||
      (supplier.phone && supplier.phone.includes(query)) ||
      (supplier.email && supplier.email.toLowerCase().includes(lowerQuery))
  );
};

export const getCategories = (): string[] => {
  const categories = new Set(dataState.products.map((p) => p.category));
  return ['all', ...Array.from(categories)];
};

export const getLowStockProducts = (): Product[] => {
  return dataState.products.filter((p) => p.stock <= p.minStock);
};

// Product CRUD operations
export const updateProduct = async (productId: string, updates: Partial<Product>): Promise<Product | null> => {
  const userId = getCurrentUserId();

  if (userId) {
    const result = await updateProductInDb(productId, updates);
    if (result) {
      const index = dataState.products.findIndex((p) => p.id === productId);
      if (index !== -1) {
        const newProducts = [...dataState.products];
        newProducts[index] = result;
        setDataState({ products: newProducts });
        await cacheData();
      }
      return result;
    }
  }

  // Fallback to local update
  const index = dataState.products.findIndex((p) => p.id === productId);
  if (index === -1) return null;

  const currentProduct = dataState.products[index];
  const updatedProduct: Product = {
    ...currentProduct,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const newProducts = [...dataState.products];
  newProducts[index] = updatedProduct;

  setDataState({ products: newProducts });
  await cacheData();

  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
  return updatedProduct;
};

export const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> => {
  const userId = getCurrentUserId();

  if (userId) {
    const result = await createProductInSupabase(productData);
    if (result) {
      setDataState({ products: [result, ...dataState.products] });
      await cacheData();
      return result;
    }
  }

  // Fallback to local creation
  const newProduct: Product = {
    id: `product-${Date.now()}`,
    ...productData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  setDataState({ products: [newProduct, ...dataState.products] });
  await cacheData();
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {}
  return newProduct;
};

export const deleteProduct = async (productId: string): Promise<boolean> => {
  const userId = getCurrentUserId();

  if (userId) {
    const success = await deleteProductFromDb(productId);
    if (success) {
      setDataState({ products: dataState.products.filter(p => p.id !== productId) });
      await cacheData();
      return true;
    }
  }

  // Fallback to local delete
  setDataState({ products: dataState.products.filter(p => p.id !== productId) });
  await cacheData();
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {}
  return true;
};

// Customer CRUD operations
export const createCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer | null> => {
  const userId = getCurrentUserId();

  if (userId) {
    const result = await createCustomerInSupabase(customerData);
    if (result) {
      setDataState({ customers: [result, ...dataState.customers] });
      await cacheData();
      return result;
    }
  }

  // Fallback to local creation
  const newCustomer: Customer = {
    id: `customer-${Date.now()}`,
    ...customerData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  setDataState({ customers: [newCustomer, ...dataState.customers] });
  await cacheData();
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {}
  return newCustomer;
};

export const updateCustomer = async (customerId: string, updates: Partial<Customer>): Promise<Customer | null> => {
  const userId = getCurrentUserId();

  if (userId) {
    const result = await updateCustomerInDb(customerId, updates);
    if (result) {
      const index = dataState.customers.findIndex((c) => c.id === customerId);
      if (index !== -1) {
        const newCustomers = [...dataState.customers];
        newCustomers[index] = result;
        setDataState({ customers: newCustomers });
        await cacheData();
      }
      return result;
    }
  }

  // Fallback to local update
  const index = dataState.customers.findIndex((c) => c.id === customerId);
  if (index === -1) return null;

  const updatedCustomer: Customer = {
    ...dataState.customers[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const newCustomers = [...dataState.customers];
  newCustomers[index] = updatedCustomer;

  setDataState({ customers: newCustomers });
  await cacheData();
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
  return updatedCustomer;
};

export const deleteCustomer = async (customerId: string): Promise<boolean> => {
  const userId = getCurrentUserId();

  if (userId) {
    const success = await deleteCustomerFromDb(customerId);
    if (success) {
      setDataState({ customers: dataState.customers.filter(c => c.id !== customerId) });
      await cacheData();
      return true;
    }
  }

  setDataState({ customers: dataState.customers.filter(c => c.id !== customerId) });
  await cacheData();
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {}
  return true;
};

// Order creation
export const createOrder = async (orderData: NewOrderData): Promise<Order> => {
  const userId = getCurrentUserId();
  const totalAmount = orderData.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  let newOrderNumber: string;

  if (userId) {
    newOrderNumber = await generateOrderNumber();
  } else {
    newOrderNumber = `ORD-${new Date().getFullYear()}-${String(dataState.orders.length + 1).padStart(3, '0')}`;
  }

  const newOrder: Order = {
    id: `order-${Date.now()}`,
    orderNumber: newOrderNumber,
    status: 'pending',
    totalAmount,
    itemsCount: orderData.items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customerId: orderData.customerId,
    customer: orderData.customer,
    items: orderData.items.map((item, index) => ({
      id: `item-${Date.now()}-${index}`,
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      sku: item.product.sku,
    })),
    notes: orderData.notes,
    paymentMethod: orderData.paymentMethod,
  };

  if (userId) {
    const dbOrder = await createOrderInDb(newOrder);
    if (dbOrder) {
      // Update stock for each product
      const stockUpdates = orderData.items.map(item =>
        updateProduct(item.product.id, {
          stock: Math.max(0, item.product.stock - item.quantity),
        }).catch(err => {
          logger.error(`Failed to update stock for product ${item.product.id}:`, err);
          return null;
        })
      );
      await Promise.all(stockUpdates);

      setDataState({
        orders: [dbOrder, ...dataState.orders],
        kpi: dataState.kpi
          ? {
              ...dataState.kpi,
              activeOrders: dataState.kpi.activeOrders + 1,
            }
          : null,
      });

      await cacheData();
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      return dbOrder;
    }
  }

  // Fallback to local creation
  for (const item of orderData.items) {
    await updateProduct(item.product.id, {
      stock: Math.max(0, item.product.stock - item.quantity),
    });
  }

  const newOrders = [newOrder, ...dataState.orders];
  const newActivities: Activity[] = [
    {
      id: `activity-${Date.now()}`,
      type: 'order_created',
      title: 'Новый заказ',
      description: `Создан заказ ${newOrderNumber} на сумму ${totalAmount.toLocaleString('ru-RU')} ₽`,
      timestamp: new Date().toISOString(),
    },
    ...dataState.activities,
  ];

  setDataState({
    orders: newOrders,
    activities: newActivities,
    kpi: dataState.kpi
      ? {
          ...dataState.kpi,
          activeOrders: dataState.kpi.activeOrders + 1,
        }
      : null,
  });

  await cacheData();
  return newOrder;
};

// Calculate margin percentage
export const calculateMargin = (price: number, costPrice: number): number => {
  if (price <= 0) return 0;
  return Math.round(((price - costPrice) / price) * 100);
};

// Calculate profit
export const calculateProfit = (price: number, costPrice: number): number => {
  return price - costPrice;
};

// Get products with margin calculations
export const getProductsWithMargins = (): Product[] => {
  return dataState.products.map((p) => ({
    ...p,
    margin: calculateMargin(p.price, p.costPrice),
    profit: calculateProfit(p.price, p.costPrice),
  }));
};

// Get top customers by revenue
export const getTopCustomersByRevenue = (limit: number = 5): Customer[] => {
  return [...dataState.customers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit);
};

// Get customers who haven't ordered in X days
export const getInactiveCustomers = (days: number = 30): Customer[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return dataState.customers.filter((c) => {
    if (!c.lastOrderDate) return true;
    return new Date(c.lastOrderDate) < cutoffDate;
  });
};

// Get products by margin (highest margin)
export const getHighestMarginProducts = (limit: number = 5): Product[] => {
  return getProductsWithMargins()
    .sort((a, b) => (b.margin || 0) - (a.margin || 0))
    .slice(0, limit);
};

// Get customer order history
export const getCustomerOrders = (customerId: string): Order[] => {
  return dataState.orders.filter((o) => o.customerId === customerId);
};

// Calculate customer metrics
export const getCustomerMetrics = (customerId: string) => {
  const customer = getCustomerById(customerId);
  const orders = getCustomerOrders(customerId);

  if (!customer || orders.length === 0) {
    return null;
  }

  const completedOrders = orders.filter((o) => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgCheck = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  // Calculate top categories
  const categoryCount: Record<string, number> = {};
  completedOrders.forEach((o) => {
    o.items.forEach((item) => {
      const product = getProductById(item.productId);
      if (product) {
        categoryCount[product.category] = (categoryCount[product.category] || 0) + item.quantity;
      }
    });
  });

  const topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  // Calculate days since last order
  const lastOrder = orders.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  const daysSinceLastOrder = lastOrder
    ? Math.floor((Date.now() - new Date(lastOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    totalOrders: orders.length,
    completedOrders: completedOrders.length,
    totalRevenue,
    avgCheck,
    topCategories,
    daysSinceLastOrder,
    lastOrderDate: lastOrder?.createdAt,
  };
};

// Get business summary for AI
export const getBusinessSummary = () => {
  const { orders, products, kpi, customers } = dataState;

  const completedOrders = orders.filter((o) => o.status === 'completed');
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  const topProducts = products
    .map((p) => {
      const orderItems = orders.flatMap((o) => o.items).filter((i) => i.productId === p.id);
      const totalSold = orderItems.reduce((sum, i) => sum + i.quantity, 0);
      const revenue = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const margin = calculateMargin(p.price, p.costPrice);
      const profit = calculateProfit(p.price, p.costPrice) * totalSold;
      return { product: p, totalSold, revenue, margin, profit };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const highestMarginProducts = getProductsWithMargins()
    .sort((a, b) => (b.margin || 0) - (a.margin || 0))
    .slice(0, 5);

  const topCustomers = [...customers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  const inactiveCustomers = getInactiveCustomers(30);

  // Calculate total profit margin
  const totalCost = products.reduce((sum, p) => sum + p.costPrice * p.stock, 0);
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const avgMargin = totalValue > 0 ? calculateMargin(totalValue, totalCost) : 0;

  return {
    kpi,
    totalOrders: orders.length,
    completedOrders: completedOrders.length,
    pendingOrders: pendingOrders.length,
    totalProducts: products.length,
    lowStockProducts: lowStockProducts.map((p) => ({
      name: p.name,
      stock: p.stock,
      minStock: p.minStock,
      margin: calculateMargin(p.price, p.costPrice),
    })),
    totalCustomers: customers.length,
    topProducts: topProducts.map((t) => ({
      name: t.product.name,
      sold: t.totalSold,
      revenue: t.revenue,
      margin: t.margin,
      profit: t.profit,
    })),
    highestMarginProducts: highestMarginProducts.map((p) => ({
      name: p.name,
      price: p.price,
      costPrice: p.costPrice,
      margin: p.margin,
      profit: p.profit,
    })),
    topCustomers: topCustomers.map((c) => ({
      name: c.name,
      totalSpent: c.totalSpent,
      totalOrders: c.totalOrders,
      avgCheck: c.averageCheck || (c.totalOrders > 0 ? Math.round(c.totalSpent / c.totalOrders) : 0),
      lastOrderDate: c.lastOrderDate,
    })),
    inactiveCustomers: inactiveCustomers.map((c) => ({
      name: c.name,
      lastOrderDate: c.lastOrderDate,
      totalSpent: c.totalSpent,
    })),
    weekSales: dataState.salesData.week.reduce((sum, d) => sum + d.sales, 0),
    monthSales: dataState.salesData.month.reduce((sum, d) => sum + d.sales, 0),
    avgOrderValue: completedOrders.length > 0
      ? completedOrders.reduce((sum, o) => sum + o.totalAmount, 0) / completedOrders.length
      : 0,
    avgMargin,
  };
};

// ============== PRODUCT VARIANTS ==============

export const getVariantsByProductId = (productId: string): ProductVariant[] => {
  return dataState.variants.filter((v) => v.productId === productId);
};

export const getVariantById = (variantId: string): ProductVariant | undefined => {
  return dataState.variants.find((v) => v.id === variantId);
};

export const productHasVariants = (productId: string): boolean => {
  return dataState.variants.some((v) => v.productId === productId);
};

export const getProductWithVariants = (productId: string): ProductWithVariants | undefined => {
  const product = getProductById(productId);
  if (!product) return undefined;

  const variants = getVariantsByProductId(productId);
  return {
    ...product,
    variants: variants.length > 0 ? variants : undefined,
    hasVariants: variants.length > 0,
  };
};

export const getAllProductsWithVariants = (): ProductWithVariants[] => {
  return dataState.products.map((product) => {
    const variants = getVariantsByProductId(product.id);
    return {
      ...product,
      variants: variants.length > 0 ? variants : undefined,
      hasVariants: variants.length > 0,
    };
  });
};

export const addVariant = async (variant: Omit<ProductVariant, 'id'>): Promise<ProductVariant> => {
  const newVariant: ProductVariant = {
    ...variant,
    id: `var-${Date.now()}`,
  };

  const newVariants = [...dataState.variants, newVariant];
  setDataState({ variants: newVariants });
  await cacheData();
  return newVariant;
};

export const updateVariant = async (variantId: string, updates: Partial<ProductVariant>): Promise<ProductVariant | null> => {
  const index = dataState.variants.findIndex((v) => v.id === variantId);
  if (index === -1) return null;

  const updatedVariant: ProductVariant = {
    ...dataState.variants[index],
    ...updates,
  };

  const newVariants = [...dataState.variants];
  newVariants[index] = updatedVariant;
  setDataState({ variants: newVariants });
  await cacheData();
  return updatedVariant;
};

export const deleteVariant = async (variantId: string): Promise<boolean> => {
  const index = dataState.variants.findIndex((v) => v.id === variantId);
  if (index === -1) return false;

  const newVariants = dataState.variants.filter((v) => v.id !== variantId);
  setDataState({ variants: newVariants });
  await cacheData();
  return true;
};

export const getTotalProductStock = (productId: string): number => {
  const variants = getVariantsByProductId(productId);
  if (variants.length > 0) {
    return variants.reduce((sum, v) => sum + v.stock, 0);
  }
  const product = getProductById(productId);
  return product?.stock || 0;
};

// ============== BATCH UPDATE ==============

export const batchUpdateProducts = async (
  productIds: string[],
  updates: Partial<Pick<Product, 'category' | 'categoryId' | 'isActive'>> & { stockAdjustment?: number }
): Promise<Product[]> => {
  const updatedProducts: Product[] = [];

  for (const productId of productIds) {
    const index = dataState.products.findIndex((p) => p.id === productId);
    if (index === -1) continue;

    const currentProduct = dataState.products[index];
    const productUpdates: Partial<Product> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.stockAdjustment !== undefined) {
      const newStock = Math.max(0, currentProduct.stock + updates.stockAdjustment);
      productUpdates.stock = newStock;
    }

    delete (productUpdates as Record<string, unknown>).stockAdjustment;

    const updatedProduct: Product = {
      ...currentProduct,
      ...productUpdates,
    };

    dataState.products[index] = updatedProduct;
    updatedProducts.push(updatedProduct);
  }

  setDataState({ products: [...dataState.products] });
  await cacheData();
  return updatedProducts;
};

export const batchUpdateVariantStock = async (
  variantIds: string[],
  stockAdjustment: number
): Promise<ProductVariant[]> => {
  const updatedVariants: ProductVariant[] = [];

  for (const variantId of variantIds) {
    const index = dataState.variants.findIndex((v) => v.id === variantId);
    if (index === -1) continue;

    const currentVariant = dataState.variants[index];
    const newStock = Math.max(0, currentVariant.stock + stockAdjustment);

    const updatedVariant: ProductVariant = {
      ...currentVariant,
      stock: newStock,
    };

    dataState.variants[index] = updatedVariant;
    updatedVariants.push(updatedVariant);
  }

  setDataState({ variants: [...dataState.variants] });
  await cacheData();
  return updatedVariants;
};

// Re-export sync service functions
export {
  syncAll,
  syncProducts,
  syncCustomers,
  syncOrders,
  syncSuppliers,
  syncManufacturers,
  syncLocations,
  subscribeToSync,
  getSyncStatus,
} from '@/services/syncService';
export type { SyncStatus, SyncState, SyncAllResult } from '@/services/syncService';
