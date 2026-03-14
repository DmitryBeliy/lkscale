/**
 * Order Store
 * Local state management for orders with subscription support
 */

import { useState, useEffect } from 'react';
import type { Order } from '@/types';
import type { DataState, Listener } from '@/store/core';

/** Order store state interface */
export interface OrderState {
  orders: Order[];
  isLoading: boolean;
}

/** Local store state */
let localState: OrderState = {
  orders: [],
  isLoading: false,
};

/** Local listeners */
const localListeners: Set<Listener> = new Set();

/** Notify local listeners */
const notifyListeners = () => {
  localListeners.forEach((listener) => listener());
};

/** Subscribe to order store changes */
export const subscribeOrderStore = (listener: Listener): (() => void) => {
  localListeners.add(listener);
  return () => {
    localListeners.delete(listener);
  };
};

/** Get current order state */
export const getOrderState = (): OrderState => ({ ...localState });

/** Set order state */
export const setOrderState = (updates: Partial<OrderState>) => {
  localState = { ...localState, ...updates };
  notifyListeners();
};

/** Update from global data state */
export const syncWithGlobalState = (globalState: DataState) => {
  setOrderState({
    orders: globalState.orders,
    isLoading: globalState.isLoading,
  });
};

/** React hook for order store */
export const useOrderStore = () => {
  const [state, setState] = useState<OrderState>(getOrderState());

  useEffect(() => {
    const unsubscribe = subscribeOrderStore(() => {
      setState(getOrderState());
    });
    return unsubscribe;
  }, []);

  return state;
};

/** React hook for single order */
export const useOrder = (orderId: string | null) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setIsLoading(false);
      return;
    }

    const updateOrder = () => {
      const currentState = getOrderState();
      const found = currentState.orders.find((o) => o.id === orderId);
      setOrder(found || null);
      setIsLoading(false);
    };

    updateOrder();
    const unsubscribe = subscribeOrderStore(updateOrder);
    return unsubscribe;
  }, [orderId]);

  return { order, isLoading };
};

/** React hook for orders by status */
export const useOrdersByStatus = (status: Order['status'] | 'all') => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const updateOrders = () => {
      const currentState = getOrderState();
      if (status === 'all') {
        setOrders(currentState.orders);
      } else {
        setOrders(currentState.orders.filter((o) => o.status === status));
      }
    };

    updateOrders();
    const unsubscribe = subscribeOrderStore(updateOrders);
    return unsubscribe;
  }, [status]);

  return orders;
};

/** React hook for customer orders */
export const useCustomerOrders = (customerId: string | null) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!customerId) {
      setOrders([]);
      return;
    }

    const updateOrders = () => {
      const currentState = getOrderState();
      setOrders(currentState.orders.filter((o) => o.customerId === customerId));
    };

    updateOrders();
    const unsubscribe = subscribeOrderStore(updateOrders);
    return unsubscribe;
  }, [customerId]);

  return orders;
};

/** React hook for pending orders count */
export const usePendingOrdersCount = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const currentState = getOrderState();
      setCount(
        currentState.orders.filter(
          (o) => o.status === 'pending' || o.status === 'processing'
        ).length
      );
    };

    updateCount();
    const unsubscribe = subscribeOrderStore(updateCount);
    return unsubscribe;
  }, []);

  return count;
};

/** React hook for today's revenue */
export const useTodayRevenue = () => {
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    const updateRevenue = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const currentState = getOrderState();
      const todayRevenue = currentState.orders
        .filter(
          (o) =>
            new Date(o.createdAt) >= today && o.status === 'completed'
        )
        .reduce((sum, o) => sum + o.totalAmount, 0);

      setRevenue(todayRevenue);
    };

    updateRevenue();
    const unsubscribe = subscribeOrderStore(updateRevenue);
    return unsubscribe;
  }, []);

  return revenue;
};

/** React hook for order statistics */
export const useOrderStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const updateStats = () => {
      const currentState = getOrderState();
      const orders = currentState.orders;

      const completed = orders.filter((o) => o.status === 'completed');
      const totalRevenue = completed.reduce((sum, o) => sum + o.totalAmount, 0);

      setStats({
        total: orders.length,
        pending: orders.filter((o) => o.status === 'pending').length,
        processing: orders.filter((o) => o.status === 'processing').length,
        completed: completed.length,
        cancelled: orders.filter((o) => o.status === 'cancelled').length,
        totalRevenue,
      });
    };

    updateStats();
    const unsubscribe = subscribeOrderStore(updateStats);
    return unsubscribe;
  }, []);

  return stats;
};
