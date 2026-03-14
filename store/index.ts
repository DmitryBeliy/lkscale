/**
 * Root Store
 * Central state management with modular architecture
 * Provides backward compatibility with legacy dataStore.ts
 */

import * as Haptics from 'expo-haptics';
import type {
  Order,
  Product,
  Customer,
} from '@/types';
import { logger } from '@/lib/logger';
import {
  fetchProducts as fetchProductsFromDb,
  fetchCustomers as fetchCustomersFromDb,
  fetchOrders as fetchOrdersFromDb,
  calculateRevenueForPeriod,
  calculateProfitForPeriod,
} from '@/lib/supabaseDataService';
import { getCurrentUserId } from '@/store/authStore';

// Import core modules
import type { DataState, Listener, BusinessSummary } from './core';
import {
  CACHE_KEYS,
  cacheData as cacheDataService,
  loadCachedData as loadCachedDataService,
  initRealtimeSubscriptions,
  cleanupRealtimeSubscriptions,
  onProductChange,
  onCustomerChange,
  onOrderChange,
} from './core';

// Import mocks
import {
  mockOrders,
  mockProducts,
  mockCustomers,
  mockCategories,
  mockVariants,
  mockKPI,
  mockActivities,
  generateSalesData,
} from './mocks';

// Import product module
import {
  initProductStore,
  syncWithGlobalState as syncProductState,
  calculateMargin,
  calculateProfit,
} from './products';

// Import order module
import {
  initOrderStore,
  syncWithGlobalState as syncOrderState,
} from './orders';

// Import customer module
import {
  initCustomerStore,
  syncWithGlobalState as syncCustomerState,
} from './customers';

// ============== GLOBAL STATE ==============

/** Central data state */
let dataState: DataState = {
  orders: [],
  products: [],
  customers: [],
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

/** Global listeners */
const listeners: Set<Listener> = new Set();

/** Notify all listeners */
const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

/** Update global state */
const setDataState = (updates: Partial<DataState>) => {
  dataState = { ...dataState, ...updates };
  notifyListeners();

  // Sync with module-specific stores
  syncProductState(dataState);
  syncOrderState(dataState);
  syncCustomerState(dataState);
};

/** Get current state */
export const getDataState = (): DataState => ({ ...dataState });

/** Subscribe to state changes */
export const subscribeData = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// ============== INITIALIZE MODULES ==============

// Initialize module stores with global state references
initProductStore(dataState, setDataState, listeners);
initOrderStore(dataState, setDataState, listeners);
initCustomerStore(dataState, setDataState, listeners, () => dataState.orders);

// ============== REALTIME SUBSCRIPTION HANDLERS ==============

// Handle realtime product changes
onProductChange((event, product) => {
  const currentProducts = [...dataState.products];

  if (event === 'INSERT') {
    if (!currentProducts.find((p) => p.id === product.id)) {
      setDataState({ products: [product, ...currentProducts] });
    }
  } else if (event === 'UPDATE') {
    const index = currentProducts.findIndex((p) => p.id === product.id);
    if (index !== -1) {
      currentProducts[index] = product;
      setDataState({ products: currentProducts });
    }
  } else if (event === 'DELETE') {
    setDataState({ products: currentProducts.filter((p) => p.id !== product.id) });
  }
});

// Handle realtime customer changes
onCustomerChange((event, customer) => {
  const currentCustomers = [...dataState.customers];

  if (event === 'INSERT') {
    if (!currentCustomers.find((c) => c.id === customer.id)) {
      setDataState({ customers: [customer, ...currentCustomers] });
    }
  } else if (event === 'UPDATE') {
    const index = currentCustomers.findIndex((c) => c.id === customer.id);
    if (index !== -1) {
      currentCustomers[index] = customer;
      setDataState({ customers: currentCustomers });
    }
  } else if (event === 'DELETE') {
    setDataState({ customers: currentCustomers.filter((c) => c.id !== customer.id) });
  }
});

// Handle realtime order changes
onOrderChange((event, order) => {
  const currentOrders = [...dataState.orders];

  if (event === 'INSERT') {
    if (!currentOrders.find((o) => o.id === order.id)) {
      setDataState({ orders: [order, ...currentOrders] });
    }
  } else if (event === 'UPDATE') {
    const index = currentOrders.findIndex((o) => o.id === order.id);
    if (index !== -1) {
      currentOrders[index] = order;
      setDataState({ orders: currentOrders });
    }
  } else if (event === 'DELETE') {
    setDataState({ orders: currentOrders.filter((o) => o.id !== order.id) });
  }
});

// ============== DATA FETCHING ==============

/**
 * Generate activities from orders and products
 */
const generateActivitiesFromOrders = (
  orders: Order[],
  products: Product[]
): Activity[] => {
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
  return activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

/**
 * Fetch all data from Supabase or use mock data
 */
export const fetchData = async (): Promise<void> => {
  setDataState({ isLoading: true });

  const userId = getCurrentUserId();

  try {
    if (userId) {
      // Fetch from Supabase for real users
      const [products, customers, orders] = await Promise.all([
        fetchProductsFromDb(),
        fetchCustomersFromDb(),
        fetchOrdersFromDb(),
      ]);

      // Calculate KPI from real data
      const completedOrders = orders.filter((o) => o.status === 'completed');
      const pendingOrders = orders.filter(
        (o) => o.status === 'pending' || o.status === 'processing'
      );
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

      setDataState({
        orders,
        products,
        customers,
        categories: mockCategories,
        variants: mockVariants,
        kpi,
        activities: generateActivitiesFromOrders(orders, products),
        salesData: {
          week: generateSalesData('week'),
          month: generateSalesData('month'),
        },
        isLoading: false,
        lastSync: new Date().toISOString(),
        isOffline: false,
      });

      // Initialize realtime subscriptions
      initRealtimeSubscriptions();

      await cacheDataService(dataState);
    } else {
      // Use mock data for demo mode or when not authenticated
      setDataState({
        orders: mockOrders,
        products: mockProducts,
        customers: mockCustomers,
        categories: mockCategories,
        variants: mockVariants,
        kpi: mockKPI,
        activities: mockActivities,
        salesData: {
          week: generateSalesData('week'),
          month: generateSalesData('month'),
        },
        isLoading: false,
        lastSync: new Date().toISOString(),
        isOffline: false,
      });

      await cacheDataService(dataState);
    }
  } catch (error) {
    logger.error('Error fetching data:', error);
    // Try to load cached data
    const cachedData = await loadCachedDataService();
    if (cachedData) {
      setDataState({
        ...cachedData,
        categories: mockCategories,
        salesData: {
          week: generateSalesData('week'),
          month: generateSalesData('month'),
        },
        isLoading: false,
      });
    } else {
      // Fallback to mock data
      setDataState({
        orders: mockOrders,
        products: mockProducts,
        customers: mockCustomers,
        categories: mockCategories,
        variants: mockVariants,
        kpi: mockKPI,
        activities: mockActivities,
        salesData: {
          week: generateSalesData('week'),
          month: generateSalesData('month'),
        },
        isLoading: false,
        lastSync: null,
        isOffline: true,
      });
    }
  }
};

// ============== CACHE OPERATIONS ==============

/** Cache data to AsyncStorage (wrapper with current state) */
const cacheStateData = async (): Promise<void> => {
  await cacheDataService(dataState);
};

/** Load cached data (wrapper with mock data injection) */
const loadCachedStateData = async (): Promise<boolean> => {
  const cachedData = await loadCachedDataService();
  if (cachedData) {
    setDataState({
      ...cachedData,
      categories: mockCategories,
      salesData: {
        week: generateSalesData('week'),
        month: generateSalesData('month'),
      },
    });
    return true;
  }
  return false;
};

// Note: cacheData and loadCachedData are exported via 'export * from ./core' below

// ============== BUSINESS SUMMARY ==============

/**
 * Get business summary for AI/analytics
 */
export const getBusinessSummary = (): BusinessSummary => {
  const { orders, products, kpi, salesData, customers } = dataState;

  const completedOrders = orders.filter((o) => o.status === 'completed');
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  const topProducts = products
    .map((p) => {
      const orderItems = orders
        .flatMap((o) => o.items)
        .filter((i) => i.productId === p.id);
      const totalSold = orderItems.reduce((sum, i) => sum + i.quantity, 0);
      const revenue = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const margin = calculateMargin(p.price, p.costPrice);
      const profit = calculateProfit(p.price, p.costPrice) * totalSold;
      return { product: p, totalSold, revenue, margin, profit };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const highestMarginProducts = products
    .map((p) => ({
      ...p,
      margin: calculateMargin(p.price, p.costPrice),
      profit: calculateProfit(p.price, p.costPrice),
    }))
    .sort((a, b) => (b.margin || 0) - (a.margin || 0))
    .slice(0, 5);

  const topCustomers = [...customers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  const inactiveCustomers = customers.filter((c) => {
    if (!c.lastOrderDate) return true;
    const daysSinceLastOrder = Math.floor(
      (Date.now() - new Date(c.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceLastOrder > 30;
  });

  const weekSales = salesData.week.reduce((sum, d) => sum + d.sales, 0);
  const monthSales = salesData.month.reduce((sum, d) => sum + d.sales, 0);

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
    weekSales,
    monthSales,
    avgOrderValue:
      completedOrders.length > 0
        ? completedOrders.reduce((sum, o) => sum + o.totalAmount, 0) / completedOrders.length
        : 0,
    avgMargin,
  };
};

// ============== EXPORTS FOR BACKWARD COMPATIBILITY ==============

// Re-export all mock data for backward compatibility
export {
  mockOrders,
  mockProducts,
  mockCustomers,
  mockCategories,
  mockVariants,
  mockKPI,
  mockActivities,
  generatePriceHistory,
  generateStockHistory,
  generateSalesData,
} from './mocks';

// Re-export all product actions for backward compatibility
export {
  // CRUD
  createProduct,
  updateProduct,
  deleteProduct,
  // Queries
  getProductById,
  getProductByBarcode,
  getProductBySku,
  searchProducts,
  filterProducts,
  getCategories,
  getLowStockProducts,
  // Variants
  getVariantsByProductId,
  getVariantById,
  productHasVariants,
  getProductWithVariants,
  getAllProductsWithVariants,
  addVariant,
  updateVariant,
  deleteVariant,
  getTotalProductStock,
  // Margins
  getProductsWithMargins,
  getHighestMarginProducts,
  calculateMargin,
  calculateProfit,
  // Batch
  batchUpdateProducts,
  batchUpdateVariantStock,
  // Hooks
  useProductStore,
  useProduct,
  useProductVariants,
  useLowStockProducts,
  useProductsCount,
} from './products';

// Re-export all order actions for backward compatibility
export {
  // CRUD
  createOrder,
  updateOrder,
  cancelOrder,
  completeOrder,
  // Queries
  getOrderById,
  getOrderByNumber,
  searchOrders,
  filterOrders,
  getCustomerOrders,
  getOrdersByStatus,
  getPendingOrders,
  getCompletedOrders,
  getTodayOrders,
  // Statistics
  getOrderStatistics,
  getAverageOrderValue,
  // Mock
  refreshOrders,
  // Hooks
  useOrderStore,
  useOrder,
  useOrdersByStatus,
  useCustomerOrders,
  usePendingOrdersCount,
  useTodayRevenue,
  useOrderStats,
} from './orders';

// Re-export all customer actions for backward compatibility
export {
  // CRUD
  createCustomer,
  updateCustomer,
  deleteCustomer,
  // Queries
  getCustomerById,
  searchCustomers,
  filterCustomers,
  getTopCustomersByRevenue,
  getInactiveCustomers,
  // Segments
  getCustomerSegment,
  // Metrics
  getCustomerMetrics,
  getCustomerStatistics,
  // Hooks
  useCustomerStore,
  useCustomer,
  useCustomerSearch,
  useTopCustomers,
  useInactiveCustomers,
  useCustomerStats,
} from './customers';

// Re-export auth
export * from './auth';

// Re-export core types
export * from './core';

// Legacy exports for direct compatibility
// Note: cleanupRealtimeSubscriptions already exported via 'export * from' above
