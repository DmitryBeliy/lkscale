/**
 * Subscription Service
 * Unified realtime subscription management for Supabase
 */

import * as Haptics from 'expo-haptics';
import {
  subscribeToProducts,
  subscribeToCustomers,
  subscribeToOrders,
  unsubscribeAll,
} from '@/lib/supabaseDataService';
import type { Product, Customer, Order } from '@/types';
import { logger } from '@/lib/logger';
import type { RealtimeEventType, EntityType } from './types';

/** Subscription cleanup function */
export type UnsubscribeFn = () => void;

/** Subscription entry for tracking */
interface SubscriptionEntry {
  entity: EntityType;
  cleanup: UnsubscribeFn | null;
}

/** Active subscriptions registry */
const activeSubscriptions: Map<EntityType, UnsubscribeFn | null> = new Map();

/** Callback registry for state updates */
type StateUpdateCallback<T> = (event: RealtimeEventType, data: T, oldData?: T) => void;

const productCallbacks: Set<StateUpdateCallback<Product>> = new Set();
const customerCallbacks: Set<StateUpdateCallback<Customer>> = new Set();
const orderCallbacks: Set<StateUpdateCallback<Order>> = new Set();

/**
 * Register callback for product changes
 */
export const onProductChange = (callback: StateUpdateCallback<Product>): UnsubscribeFn => {
  productCallbacks.add(callback);
  return () => productCallbacks.delete(callback);
};

/**
 * Register callback for customer changes
 */
export const onCustomerChange = (callback: StateUpdateCallback<Customer>): UnsubscribeFn => {
  customerCallbacks.add(callback);
  return () => customerCallbacks.delete(callback);
};

/**
 * Register callback for order changes
 */
export const onOrderChange = (callback: StateUpdateCallback<Order>): UnsubscribeFn => {
  orderCallbacks.add(callback);
  return () => orderCallbacks.delete(callback);
};

/**
 * Notify all registered callbacks for products
 */
const notifyProductCallbacks = (event: RealtimeEventType, product: Product, oldProduct?: Product) => {
  productCallbacks.forEach(cb => {
    try {
      cb(event, product, oldProduct);
    } catch (error) {
      logger.error('Error in product callback:', error);
    }
  });
};

/**
 * Notify all registered callbacks for customers
 */
const notifyCustomerCallbacks = (event: RealtimeEventType, customer: Customer, oldCustomer?: Customer) => {
  customerCallbacks.forEach(cb => {
    try {
      cb(event, customer, oldCustomer);
    } catch (error) {
      logger.error('Error in customer callback:', error);
    }
  });
};

/**
 * Notify all registered callbacks for orders
 */
const notifyOrderCallbacks = (event: RealtimeEventType, order: Order, oldOrder?: Order) => {
  orderCallbacks.forEach(cb => {
    try {
      cb(event, order, oldOrder);
    } catch (error) {
      logger.error('Error in order callback:', error);
    }
  });
};

/**
 * Initialize all realtime subscriptions
 */
export const initRealtimeSubscriptions = (): void => {
  // Cleanup existing subscriptions first
  cleanupRealtimeSubscriptions();

  // Subscribe to products changes
  const unsubProducts = subscribeToProducts((event, product, oldProduct) => {
    if (!product?.id) return;
    
    if (event === 'INSERT') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    notifyProductCallbacks(event as RealtimeEventType, product, oldProduct);
  });
  activeSubscriptions.set('products', unsubProducts);

  // Subscribe to customers changes
  const unsubCustomers = subscribeToCustomers((event, customer, oldCustomer) => {
    if (!customer?.id) return;
    
    if (event === 'INSERT') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    notifyCustomerCallbacks(event as RealtimeEventType, customer, oldCustomer);
  });
  activeSubscriptions.set('customers', unsubCustomers);

  // Subscribe to orders changes
  const unsubOrders = subscribeToOrders((event, order, oldOrder) => {
    if (!order?.id) return;
    
    if (event === 'INSERT') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    notifyOrderCallbacks(event as RealtimeEventType, order, oldOrder);
  });
  activeSubscriptions.set('orders', unsubOrders);
};

/**
 * Cleanup all realtime subscriptions
 */
export const cleanupRealtimeSubscriptions = (): void => {
  activeSubscriptions.forEach((cleanup) => {
    if (cleanup) cleanup();
  });
  activeSubscriptions.clear();
  
  // Also call the global unsubscribe from supabaseDataService
  unsubscribeAll();
};

/**
 * Cleanup specific entity subscription
 */
export const cleanupSubscription = (entity: EntityType): void => {
  const cleanup = activeSubscriptions.get(entity);
  if (cleanup) {
    cleanup();
    activeSubscriptions.delete(entity);
  }
};

/**
 * Check if subscriptions are active
 */
export const hasActiveSubscriptions = (): boolean => {
  return activeSubscriptions.size > 0;
};

/**
 * Get list of active subscription entities
 */
export const getActiveSubscriptionEntities = (): EntityType[] => {
  return Array.from(activeSubscriptions.keys());
};
