/**
 * Core types for the store
 * Contains shared types, state interfaces and utility types
 */

import type {
  Order,
  Product,
  Customer,
  KPIData,
  Activity,
  SalesDataPoint,
  ProductCategory,
  ProductVariant,
} from '@/types';

/** Generic listener type for store subscriptions */
export type Listener = () => void;

/** Data state interface - central state container */
export interface DataState {
  orders: Order[];
  products: Product[];
  customers: Customer[];
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

/** Cache keys for AsyncStorage */
export const CACHE_KEYS = {
  ORDERS: '@lkscale_orders',
  PRODUCTS: '@lkscale_products',
  CUSTOMERS: '@lkscale_customers',
  KPI: '@lkscale_kpi',
  ACTIVITIES: '@lkscale_activities',
  LAST_SYNC: '@lkscale_last_sync',
  VARIANTS: '@lkscale_variants',
} as const;

/** Realtime event types */
export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE';

/** Realtime subscription callback */
export type RealtimeCallback<T> = (
  event: RealtimeEventType,
  data: T,
  oldData?: T
) => void;

/** Entity type for subscriptions */
export type EntityType = 'products' | 'customers' | 'orders';

/** Store action result */
export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/** Pagination options */
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/** Search filters */
export interface SearchFilters {
  query?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

/** Customer metrics result */
export interface CustomerMetrics {
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  avgCheck: number;
  topCategories: string[];
  daysSinceLastOrder: number | null;
  lastOrderDate: string | undefined;
}

/** Product margin info */
export interface ProductMarginInfo {
  margin: number;
  profit: number;
}

/** Business summary for AI/analytics */
export interface BusinessSummary {
  kpi: KPIData | null;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: {
    name: string;
    stock: number;
    minStock: number;
    margin: number;
  }[];
  totalCustomers: number;
  topProducts: {
    name: string;
    sold: number;
    revenue: number;
    margin: number;
    profit: number;
  }[];
  highestMarginProducts: {
    name: string;
    price: number;
    costPrice: number;
    margin: number;
    profit: number;
  }[];
  topCustomers: {
    name: string;
    totalSpent: number;
    totalOrders: number;
    avgCheck: number;
    lastOrderDate: string | undefined;
  }[];
  inactiveCustomers: {
    name: string;
    lastOrderDate: string | undefined;
    totalSpent: number;
  }[];
  weekSales: number;
  monthSales: number;
  avgOrderValue: number;
  avgMargin: number;
}
