/**
 * Order Actions
 * CRUD operations and business logic for orders
 */

import * as Haptics from 'expo-haptics';
import type { Order, Activity } from '@/types';
import {
  createOrderInDb,
  generateOrderNumber,
} from '@/lib/supabaseDataService';
import { getCurrentUserId } from '@/store/authStore';
import type { DataState, Listener } from '@/store/core';
import { cacheData } from '@/store/core';
import type { NewOrderData, OrderUpdatePayload, OrderSearchFilters } from './orderTypes';

// ============== STATE MANAGEMENT ==============

/** Global state reference - set by root store */
let globalState: DataState | null = null;
let globalSetState: ((updates: Partial<DataState>) => void) | null = null;
let globalListeners: Set<Listener> | null = null;

/** Initialize order store with state references */
export const initOrderStore = (
  state: DataState,
  setState: (updates: Partial<DataState>) => void,
  listeners: Set<Listener>
) => {
  globalState = state;
  globalSetState = setState;
  globalListeners = listeners;
};

/** Get current orders from global state */
const getOrders = (): Order[] => globalState?.orders || [];

/** Get current activities from global state */
const getActivities = (): Activity[] => globalState?.activities || [];

/** Get current KPI from global state */
const getKPI = () => globalState?.kpi;

/** Update state helper */
const updateState = (updates: Partial<DataState>) => {
  if (globalSetState) {
    globalSetState(updates);
  }
};

/** Notify listeners helper */
const notifyListeners = () => {
  globalListeners?.forEach((listener) => listener());
};

// ============== ORDER CRUD OPERATIONS ==============

/**
 * Create a new order
 * Tries Supabase first, falls back to local creation
 */
export const createOrder = async (orderData: NewOrderData): Promise<Order> => {
  const userId = getCurrentUserId();
  const currentOrders = getOrders();
  const currentActivities = getActivities();
  const currentKPI = getKPI();

  const totalAmount = orderData.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  let newOrderNumber: string;

  if (userId) {
    // Generate order number from Supabase
    newOrderNumber = await generateOrderNumber();
  } else {
    newOrderNumber = `ORD-2025-${String(currentOrders.length + 1).padStart(3, '0')}`;
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

  // Create in Supabase
  if (userId) {
    const dbOrder = await createOrderInDb(newOrder);
    if (dbOrder) {
      updateState({
        orders: [dbOrder, ...currentOrders],
        kpi: currentKPI
          ? {
              ...currentKPI,
              activeOrders: currentKPI.activeOrders + 1,
            }
          : null,
      });

      await cacheData(globalState!);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return dbOrder;
    }
  }

  // Fallback to local creation
  const newActivities: Activity[] = [
    {
      id: `activity-${Date.now()}`,
      type: 'order_created',
      title: 'Новый заказ',
      description: `Создан заказ ${newOrderNumber} на сумму ${totalAmount.toLocaleString('ru-RU')} ₽`,
      timestamp: new Date().toISOString(),
    },
    ...currentActivities,
  ];

  updateState({
    orders: [newOrder, ...currentOrders],
    activities: newActivities,
    kpi: currentKPI
      ? {
          ...currentKPI,
          activeOrders: currentKPI.activeOrders + 1,
        }
      : null,
  });

  await cacheData(globalState!);
  return newOrder;
};

/**
 * Update an existing order
 */
export const updateOrder = async (
  orderId: string,
  updates: OrderUpdatePayload
): Promise<Order | null> => {
  const currentOrders = getOrders();
  const index = currentOrders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  const updatedOrder: Order = {
    ...currentOrders[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const newOrders = [...currentOrders];
  newOrders[index] = updatedOrder;

  updateState({ orders: newOrders });
  await cacheData(globalState!);
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  return updatedOrder;
};

/**
 * Cancel an order
 */
export const cancelOrder = async (orderId: string, reason?: string): Promise<Order | null> => {
  const currentOrders = getOrders();
  const currentKPI = getKPI();
  const index = currentOrders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  const order = currentOrders[index];
  if (order.status === 'cancelled') return order;

  const updatedOrder: Order = {
    ...order,
    status: 'cancelled',
    notes: reason ? `${order.notes || ''} (Отмена: ${reason})`.trim() : order.notes,
    updatedAt: new Date().toISOString(),
  };

  const newOrders = [...currentOrders];
  newOrders[index] = updatedOrder;

  // Restore stock for cancelled order items
  // Note: This should be handled by productActions.updateProduct

  updateState({
    orders: newOrders,
    kpi: currentKPI
      ? {
          ...currentKPI,
          activeOrders: Math.max(0, currentKPI.activeOrders - 1),
        }
      : null,
  });

  await cacheData(globalState!);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  return updatedOrder;
};

/**
 * Complete an order
 */
export const completeOrder = async (orderId: string): Promise<Order | null> => {
  const currentOrders = getOrders();
  const currentKPI = getKPI();
  const index = currentOrders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  const order = currentOrders[index];
  if (order.status === 'completed') return order;

  const wasActive = order.status === 'pending' || order.status === 'processing';

  const updatedOrder: Order = {
    ...order,
    status: 'completed',
    updatedAt: new Date().toISOString(),
  };

  const newOrders = [...currentOrders];
  newOrders[index] = updatedOrder;

  updateState({
    orders: newOrders,
    kpi: currentKPI
      ? {
          ...currentKPI,
          totalSales: currentKPI.totalSales + order.totalAmount,
          activeOrders: wasActive
            ? Math.max(0, currentKPI.activeOrders - 1)
            : currentKPI.activeOrders,
        }
      : null,
  });

  await cacheData(globalState!);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  return updatedOrder;
};

// ============== ORDER QUERIES ==============

/**
 * Get order by ID
 */
export const getOrderById = (id: string): Order | undefined => {
  return getOrders().find((order) => order.id === id);
};

/**
 * Get order by order number
 */
export const getOrderByNumber = (orderNumber: string): Order | undefined => {
  return getOrders().find(
    (order) => order.orderNumber.toLowerCase() === orderNumber.toLowerCase()
  );
};

/**
 * Search orders with filters
 */
export const searchOrders = (
  query?: string,
  statusFilter?: string
): Order[] => {
  let filtered = getOrders();

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

/**
 * Advanced order search with filters
 */
export const filterOrders = (filters: OrderSearchFilters): Order[] => {
  let filtered = getOrders();

  if (filters.query) {
    const lowerQuery = filters.query.toLowerCase();
    filtered = filtered.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(lowerQuery) ||
        order.customer?.name.toLowerCase().includes(lowerQuery)
    );
  }

  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter((o) => o.status === filters.status);
  }

  if (filters.customerId) {
    filtered = filtered.filter((o) => o.customerId === filters.customerId);
  }

  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom);
    filtered = filtered.filter((o) => new Date(o.createdAt) >= fromDate);
  }

  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo);
    toDate.setHours(23, 59, 59, 999);
    filtered = filtered.filter((o) => new Date(o.createdAt) <= toDate);
  }

  if (filters.minAmount !== undefined) {
    filtered = filtered.filter((o) => o.totalAmount >= filters.minAmount!);
  }

  if (filters.maxAmount !== undefined) {
    filtered = filtered.filter((o) => o.totalAmount <= filters.maxAmount!);
  }

  if (filters.paymentMethod) {
    filtered = filtered.filter((o) => o.paymentMethod === filters.paymentMethod);
  }

  return filtered;
};

/**
 * Get customer orders
 */
export const getCustomerOrders = (customerId: string): Order[] => {
  return getOrders().filter((o) => o.customerId === customerId);
};

/**
 * Get orders by status
 */
export const getOrdersByStatus = (status: Order['status']): Order[] => {
  return getOrders().filter((o) => o.status === status);
};

/**
 * Get pending orders
 */
export const getPendingOrders = (): Order[] => {
  return getOrders().filter((o) => o.status === 'pending' || o.status === 'processing');
};

/**
 * Get completed orders
 */
export const getCompletedOrders = (): Order[] => {
  return getOrders().filter((o) => o.status === 'completed');
};

/**
 * Get today's orders
 */
export const getTodayOrders = (): Order[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return getOrders().filter((o) => new Date(o.createdAt) >= today);
};

// ============== ORDER STATISTICS ==============

/**
 * Get order statistics
 */
export const getOrderStatistics = () => {
  const orders = getOrders();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completed = orders.filter((o) => o.status === 'completed');
  const todayOrders = orders.filter((o) => new Date(o.createdAt) >= today);

  const totalRevenue = completed.reduce((sum, o) => sum + o.totalAmount, 0);
  const todayRevenue = todayOrders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === 'pending').length,
    processingOrders: orders.filter((o) => o.status === 'processing').length,
    completedOrders: completed.length,
    cancelledOrders: orders.filter((o) => o.status === 'cancelled').length,
    totalRevenue,
    averageOrderValue: completed.length > 0 ? totalRevenue / completed.length : 0,
    todayOrders: todayOrders.length,
    todayRevenue,
  };
};

/**
 * Calculate average order value
 */
export const getAverageOrderValue = (): number => {
  const completed = getOrders().filter((o) => o.status === 'completed');
  if (completed.length === 0) return 0;
  return completed.reduce((sum, o) => sum + o.totalAmount, 0) / completed.length;
};

// ============== MOCK REFRESH (for development) ==============

/**
 * Refresh orders from mock data
 * Used for development/testing
 */
export const refreshOrders = async (): Promise<Order[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  // Import mock data dynamically to avoid circular dependencies
  const { mockOrders } = await import('@/store/mocks');
  return mockOrders;
};
