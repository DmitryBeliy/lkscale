/**
 * Customer Store
 * Local state management for customers with subscription support
 */

import { useState, useEffect } from 'react';
import type { Customer } from '@/types';
import type { DataState, Listener } from '@/store/core';

/** Customer store state interface */
export interface CustomerState {
  customers: Customer[];
  isLoading: boolean;
}

/** Local store state */
let localState: CustomerState = {
  customers: [],
  isLoading: false,
};

/** Local listeners */
const localListeners: Set<Listener> = new Set();

/** Notify local listeners */
const notifyListeners = () => {
  localListeners.forEach((listener) => listener());
};

/** Subscribe to customer store changes */
export const subscribeCustomerStore = (listener: Listener): (() => void) => {
  localListeners.add(listener);
  return () => {
    localListeners.delete(listener);
  };
};

/** Get current customer state */
export const getCustomerState = (): CustomerState => ({ ...localState });

/** Set customer state */
export const setCustomerState = (updates: Partial<CustomerState>) => {
  localState = { ...localState, ...updates };
  notifyListeners();
};

/** Update from global data state */
export const syncWithGlobalState = (globalState: DataState) => {
  setCustomerState({
    customers: globalState.customers,
    isLoading: globalState.isLoading,
  });
};

/** React hook for customer store */
export const useCustomerStore = () => {
  const [state, setState] = useState<CustomerState>(getCustomerState());

  useEffect(() => {
    const unsubscribe = subscribeCustomerStore(() => {
      setState(getCustomerState());
    });
    return unsubscribe;
  }, []);

  return state;
};

/** React hook for single customer */
export const useCustomer = (customerId: string | null) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!customerId) {
      setCustomer(null);
      setIsLoading(false);
      return;
    }

    const updateCustomer = () => {
      const currentState = getCustomerState();
      const found = currentState.customers.find((c) => c.id === customerId);
      setCustomer(found || null);
      setIsLoading(false);
    };

    updateCustomer();
    const unsubscribe = subscribeCustomerStore(updateCustomer);
    return unsubscribe;
  }, [customerId]);

  return { customer, isLoading };
};

/** React hook for customer search */
export const useCustomerSearch = (query: string) => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const updateCustomers = () => {
      const currentState = getCustomerState();
      if (!query) {
        setCustomers(currentState.customers);
      } else {
        const lowerQuery = query.toLowerCase();
        setCustomers(
          currentState.customers.filter(
            (customer) =>
              customer.name.toLowerCase().includes(lowerQuery) ||
              (customer.phone && customer.phone.includes(query)) ||
              (customer.email && customer.email.toLowerCase().includes(lowerQuery))
          )
        );
      }
    };

    updateCustomers();
    const unsubscribe = subscribeCustomerStore(updateCustomers);
    return unsubscribe;
  }, [query]);

  return customers;
};

/** React hook for top customers by revenue */
export const useTopCustomers = (limit: number = 5) => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const updateCustomers = () => {
      const currentState = getCustomerState();
      setCustomers(
        [...currentState.customers]
          .sort((a, b) => b.totalSpent - a.totalSpent)
          .slice(0, limit)
      );
    };

    updateCustomers();
    const unsubscribe = subscribeCustomerStore(updateCustomers);
    return unsubscribe;
  }, [limit]);

  return customers;
};

/** React hook for inactive customers */
export const useInactiveCustomers = (days: number = 30) => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const updateCustomers = () => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const currentState = getCustomerState();
      setCustomers(
        currentState.customers.filter((c) => {
          if (!c.lastOrderDate) return true;
          return new Date(c.lastOrderDate) < cutoffDate;
        })
      );
    };

    updateCustomers();
    const unsubscribe = subscribeCustomerStore(updateCustomers);
    return unsubscribe;
  }, [days]);

  return customers;
};

/** React hook for customer statistics */
export const useCustomerStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    vip: 0,
    newThisMonth: 0,
    active: 0,
    inactive: 0,
  });

  useEffect(() => {
    const updateStats = () => {
      const currentState = getCustomerState();
      const customers = currentState.customers;
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      setStats({
        total: customers.length,
        vip: customers.filter(
          (c) => c.totalSpent > 300000 || c.totalOrders > 20
        ).length,
        newThisMonth: customers.filter(
          (c) => new Date(c.createdAt) >= thisMonthStart
        ).length,
        active: customers.filter(
          (c) => c.lastOrderDate && new Date(c.lastOrderDate) >= thirtyDaysAgo
        ).length,
        inactive: customers.filter(
          (c) => !c.lastOrderDate || new Date(c.lastOrderDate) < thirtyDaysAgo
        ).length,
      });
    };

    updateStats();
    const unsubscribe = subscribeCustomerStore(updateStats);
    return unsubscribe;
  }, []);

  return stats;
};
