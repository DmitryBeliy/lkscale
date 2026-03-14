/**
 * Cache Service
 * Handles all AsyncStorage operations for data persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DataState } from './types';
import { CACHE_KEYS } from './types';
import { logger } from '@/lib/logger';

/**
 * Save all data to cache
 */
export const cacheData = async (state: DataState): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.setItem(CACHE_KEYS.ORDERS, JSON.stringify(state.orders)),
      AsyncStorage.setItem(CACHE_KEYS.PRODUCTS, JSON.stringify(state.products)),
      AsyncStorage.setItem(CACHE_KEYS.CUSTOMERS, JSON.stringify(state.customers)),
      AsyncStorage.setItem(CACHE_KEYS.VARIANTS, JSON.stringify(state.variants)),
      AsyncStorage.setItem(CACHE_KEYS.KPI, JSON.stringify(state.kpi)),
      AsyncStorage.setItem(CACHE_KEYS.ACTIVITIES, JSON.stringify(state.activities)),
      AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString()),
    ]);
  } catch (error) {
    logger.error('Error caching data:', error);
  }
};

/**
 * Load cached data from AsyncStorage
 * Returns partial state that can be merged
 */
export const loadCachedData = async (): Promise<Partial<DataState> | null> => {
  try {
    const [orders, products, customers, variants, kpi, activities, lastSync] = await Promise.all([
      AsyncStorage.getItem(CACHE_KEYS.ORDERS),
      AsyncStorage.getItem(CACHE_KEYS.PRODUCTS),
      AsyncStorage.getItem(CACHE_KEYS.CUSTOMERS),
      AsyncStorage.getItem(CACHE_KEYS.VARIANTS),
      AsyncStorage.getItem(CACHE_KEYS.KPI),
      AsyncStorage.getItem(CACHE_KEYS.ACTIVITIES),
      AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC),
    ]);

    return {
      orders: orders ? JSON.parse(orders) : [],
      products: products ? JSON.parse(products) : [],
      customers: customers ? JSON.parse(customers) : [],
      variants: variants ? JSON.parse(variants) : [],
      kpi: kpi ? JSON.parse(kpi) : null,
      activities: activities ? JSON.parse(activities) : [],
      lastSync,
      isLoading: false,
      isOffline: true,
    };
  } catch (error) {
    logger.error('Error loading cached data:', error);
    return null;
  }
};

/**
 * Clear all cached data
 */
export const clearCache = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(CACHE_KEYS.ORDERS),
      AsyncStorage.removeItem(CACHE_KEYS.PRODUCTS),
      AsyncStorage.removeItem(CACHE_KEYS.CUSTOMERS),
      AsyncStorage.removeItem(CACHE_KEYS.VARIANTS),
      AsyncStorage.removeItem(CACHE_KEYS.KPI),
      AsyncStorage.removeItem(CACHE_KEYS.ACTIVITIES),
      AsyncStorage.removeItem(CACHE_KEYS.LAST_SYNC),
    ]);
  } catch (error) {
    logger.error('Error clearing cache:', error);
  }
};

/**
 * Cache specific entity data
 */
export const cacheEntity = async <T>(key: string, data: T): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    logger.error(`Error caching entity ${key}:`, error);
  }
};

/**
 * Load specific entity from cache
 */
export const loadCachedEntity = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Error loading cached entity ${key}:`, error);
    return null;
  }
};
