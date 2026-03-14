/**
 * Order Types
 * Type definitions specific to order store module
 */

import type { Order, CartItem, Customer, Product } from '@/types';

/** Order status filter */
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'all';

/** Order search filters */
export interface OrderSearchFilters {
  query?: string;
  status?: OrderStatus;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: string;
}

/** Order sort options */
export type OrderSortField = 
  | 'createdAt' 
  | 'updatedAt' 
  | 'totalAmount' 
  | 'orderNumber'
  | 'status';

export type OrderSortOrder = 'asc' | 'desc';

export interface OrderSortOptions {
  field: OrderSortField;
  order: OrderSortOrder;
}

/** New order data payload */
export interface NewOrderData {
  customerId: string;
  customer: {
    name: string;
    phone: string;
    address?: string;
  };
  items: CartItem[];
  notes?: string;
  paymentMethod: 'card' | 'cash' | 'transfer' | 'online';
}

/** Order update payload */
export type OrderUpdatePayload = Partial<Pick<Order, 'status' | 'notes' | 'paymentMethod'>>;

/** Order statistics */
export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  todayOrders: number;
  todayRevenue: number;
}

/** Order summary for lists */
export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: Order['status'];
  totalAmount: number;
  itemsCount: number;
  customerName: string;
  customerPhone: string;
  createdAt: string;
  paymentMethod?: string;
}

/** Daily order metrics */
export interface DailyOrderMetrics {
  date: string;
  orders: number;
  revenue: number;
  items: number;
}

/** Order item with full product info */
export interface OrderItemWithProduct {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  sku: string;
  product?: Product;
}

/** Order with expanded details */
export interface OrderWithDetails extends Order {
  items: OrderItemWithProduct[];
  customerDetails?: Customer;
}
