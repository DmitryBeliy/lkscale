/**
 * Customer Actions
 * CRUD operations and business logic for customers
 */

import * as Haptics from 'expo-haptics';
import type { Customer } from '@/types';
import {
  createCustomer as createCustomerInSupabase,
  updateCustomerInDb,
  deleteCustomerFromDb,
} from '@/lib/supabaseDataService';
import { getCurrentUserId } from '@/store/authStore';
import type { DataState, Listener, CustomerMetrics } from '@/store/core';
import { cacheData } from '@/store/core';
import type {
  CustomerCreatePayload,
  CustomerUpdatePayload,
  CustomerSearchFilters,
  CustomerSegment,
  INACTIVE_THRESHOLD_DAYS,
  AT_RISK_THRESHOLD_DAYS,
} from './customerTypes';

// ============== STATE MANAGEMENT ==============

/** Global state reference - set by root store */
let globalState: DataState | null = null;
let globalSetState: ((updates: Partial<DataState>) => void) | null = null;
let globalListeners: Set<Listener> | null = null;
let globalGetOrders: (() => any[]) | null = null;

/** Initialize customer store with state references */
export const initCustomerStore = (
  state: DataState,
  setState: (updates: Partial<DataState>) => void,
  listeners: Set<Listener>,
  getOrders: () => any[]
) => {
  globalState = state;
  globalSetState = setState;
  globalListeners = listeners;
  globalGetOrders = getOrders;
};

/** Get current customers from global state */
const getCustomers = (): Customer[] => globalState?.customers || [];

/** Get orders helper */
const getOrders = (): any[] => globalGetOrders?.() || [];

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

// ============== CUSTOMER CRUD OPERATIONS ==============

/**
 * Create a new customer
 * Tries Supabase first, falls back to local creation
 */
export const createCustomer = async (
  customerData: CustomerCreatePayload
): Promise<Customer | null> => {
  const userId = getCurrentUserId();

  // Try Supabase first
  if (userId) {
    const result = await createCustomerInSupabase(customerData);
    if (result) {
      const currentCustomers = getCustomers();
      updateState({ customers: [result, ...currentCustomers] });
      await cacheData(globalState!);
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

  const currentCustomers = getCustomers();
  updateState({ customers: [newCustomer, ...currentCustomers] });
  await cacheData(globalState!);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  return newCustomer;
};

/**
 * Update an existing customer
 * Tries Supabase first, falls back to local update
 */
export const updateCustomer = async (
  customerId: string,
  updates: CustomerUpdatePayload
): Promise<Customer | null> => {
  const userId = getCurrentUserId();
  const currentCustomers = getCustomers();
  const index = currentCustomers.findIndex((c) => c.id === customerId);

  if (index === -1) return null;

  // Try Supabase first
  if (userId) {
    const result = await updateCustomerInDb(customerId, updates);
    if (result) {
      const newCustomers = [...currentCustomers];
      newCustomers[index] = result;
      updateState({ customers: newCustomers });
      await cacheData(globalState!);
      return result;
    }
  }

  // Fallback to local update
  const updatedCustomer: Customer = {
    ...currentCustomers[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const newCustomers = [...currentCustomers];
  newCustomers[index] = updatedCustomer;

  updateState({ customers: newCustomers });
  await cacheData(globalState!);
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  return updatedCustomer;
};

/**
 * Delete a customer
 * Tries Supabase first, falls back to local delete
 */
export const deleteCustomer = async (customerId: string): Promise<boolean> => {
  const userId = getCurrentUserId();

  // Try Supabase first
  if (userId) {
    const success = await deleteCustomerFromDb(customerId);
    if (success) {
      const currentCustomers = getCustomers();
      updateState({ customers: currentCustomers.filter((c) => c.id !== customerId) });
      await cacheData(globalState!);
      return true;
    }
  }

  // Fallback to local delete
  const currentCustomers = getCustomers();
  updateState({ customers: currentCustomers.filter((c) => c.id !== customerId) });
  await cacheData(globalState!);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  return true;
};

// ============== CUSTOMER QUERIES ==============

/**
 * Get customer by ID
 */
export const getCustomerById = (id: string): Customer | undefined => {
  return getCustomers().find((customer) => customer.id === id);
};

/**
 * Search customers
 */
export const searchCustomers = (query: string): Customer[] => {
  if (!query) return getCustomers();

  const lowerQuery = query.toLowerCase();
  return getCustomers().filter(
    (customer) =>
      customer.name.toLowerCase().includes(lowerQuery) ||
      (customer.phone && customer.phone.includes(query)) ||
      (customer.email && customer.email.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Advanced customer search with filters
 */
export const filterCustomers = (filters: CustomerSearchFilters): Customer[] => {
  let filtered = getCustomers();

  if (filters.query) {
    const lowerQuery = filters.query.toLowerCase();
    filtered = filtered.filter(
      (customer) =>
        customer.name.toLowerCase().includes(lowerQuery) ||
        (customer.phone && customer.phone.toLowerCase().includes(lowerQuery)) ||
        (customer.email && customer.email.toLowerCase().includes(lowerQuery))
    );
  }

  if (filters.minOrders !== undefined) {
    filtered = filtered.filter((c) => c.totalOrders >= filters.minOrders!);
  }

  if (filters.maxOrders !== undefined) {
    filtered = filtered.filter((c) => c.totalOrders <= filters.maxOrders!);
  }

  if (filters.minSpent !== undefined) {
    filtered = filtered.filter((c) => c.totalSpent >= filters.minSpent!);
  }

  if (filters.maxSpent !== undefined) {
    filtered = filtered.filter((c) => c.totalSpent <= filters.maxSpent!);
  }

  if (filters.hasEmail !== undefined) {
    filtered = filtered.filter((c) =>
      filters.hasEmail ? !!c.email : !c.email
    );
  }

  if (filters.hasPhone !== undefined) {
    filtered = filtered.filter((c) =>
      filters.hasPhone ? !!c.phone : !c.phone
    );
  }

  return filtered;
};

/**
 * Get top customers by revenue
 */
export const getTopCustomersByRevenue = (limit: number = 5): Customer[] => {
  return [...getCustomers()]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit);
};

/**
 * Get customers who haven't ordered in X days
 */
export const getInactiveCustomers = (days: number = 30): Customer[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return getCustomers().filter((c) => {
    if (!c.lastOrderDate) return true;
    return new Date(c.lastOrderDate) < cutoffDate;
  });
};

/**
 * Get customer segment
 */
export const getCustomerSegment = (customer: Customer): CustomerSegment => {
  if (!customer.lastOrderDate) return 'new';

  const daysSinceLastOrder = Math.floor(
    (Date.now() - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastOrder > 60) return 'at-risk';
  if (daysSinceLastOrder > 30) return 'inactive';
  if (customer.totalSpent > 300000 || customer.totalOrders > 20) return 'vip';
  if (customer.totalOrders <= 2) return 'new';
  return 'regular';
};

// ============== CUSTOMER METRICS ==============

/**
 * Calculate customer metrics from orders
 */
export const getCustomerMetrics = (customerId: string): CustomerMetrics | null => {
  const customer = getCustomerById(customerId);
  const orders = getOrders().filter((o) => o.customerId === customerId);

  if (!customer || orders.length === 0) {
    return null;
  }

  const completedOrders = orders.filter((o) => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgCheck = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  // Calculate top categories
  const categoryCount: Record<string, number> = {};
  completedOrders.forEach((o) => {
    o.items.forEach((item: any) => {
      // Category info would need to be fetched from products
      // Simplified version here
      categoryCount[item.productName] = (categoryCount[item.productName] || 0) + item.quantity;
    });
  });

  const topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  // Calculate days since last order
  const lastOrder = orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  const daysSinceLastOrder = lastOrder
    ? Math.floor(
        (Date.now() - new Date(lastOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      )
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

// ============== CUSTOMER STATISTICS ==============

/**
 * Get customer statistics
 */
export const getCustomerStatistics = () => {
  const customers = getCustomers();
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0);

  return {
    totalCustomers: customers.length,
    vipCustomers: customers.filter(
      (c) => c.totalSpent > 300000 || c.totalOrders > 20
    ).length,
    newCustomersThisMonth: customers.filter(
      (c) => new Date(c.createdAt) >= thisMonthStart
    ).length,
    activeCustomers: customers.filter(
      (c) => c.lastOrderDate && new Date(c.lastOrderDate) >= thirtyDaysAgo
    ).length,
    inactiveCustomers: customers.filter(
      (c) => !c.lastOrderDate || new Date(c.lastOrderDate) < thirtyDaysAgo
    ).length,
    averageOrdersPerCustomer: customers.length > 0 ? totalOrders / customers.length : 0,
    averageSpentPerCustomer: customers.length > 0 ? totalRevenue / customers.length : 0,
    totalRevenueFromCustomers: totalRevenue,
  };
};
