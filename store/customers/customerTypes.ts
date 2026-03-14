/**
 * Customer Types
 * Type definitions specific to customer store module
 */

import type { Customer } from '@/types';

/** Customer search filters */
export interface CustomerSearchFilters {
  query?: string;
  minOrders?: number;
  maxOrders?: number;
  minSpent?: number;
  maxSpent?: number;
  hasEmail?: boolean;
  hasPhone?: boolean;
  topCategories?: string[];
}

/** Customer sort options */
export type CustomerSortField = 
  | 'name' 
  | 'totalSpent' 
  | 'totalOrders' 
  | 'lastOrderDate' 
  | 'createdAt' 
  | 'averageCheck';

export type CustomerSortOrder = 'asc' | 'desc';

export interface CustomerSortOptions {
  field: CustomerSortField;
  order: CustomerSortOrder;
}

/** Customer create payload */
export type CustomerCreatePayload = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;

/** Customer update payload */
export type CustomerUpdatePayload = Partial<Omit<Customer, 'id' | 'createdAt'>>;

/** Customer statistics */
export interface CustomerStatistics {
  totalCustomers: number;
  vipCustomers: number;
  newCustomersThisMonth: number;
  activeCustomers: number; // Ordered in last 30 days
  inactiveCustomers: number; // No orders in last 30 days
  averageOrdersPerCustomer: number;
  averageSpentPerCustomer: number;
  totalRevenueFromCustomers: number;
}

/** Customer summary for lists */
export interface CustomerSummary {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  averageCheck: number;
  status: 'active' | 'inactive' | 'vip' | 'new';
}

/** Customer metrics calculated from orders */
export interface CalculatedCustomerMetrics {
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageCheck: number;
  topCategories: string[];
  daysSinceLastOrder: number | null;
  lastOrderDate: string | undefined;
  customerLifetimeValue: number;
}

/** Customer segment for marketing */
export type CustomerSegment = 'vip' | 'regular' | 'new' | 'inactive' | 'at-risk';

/** Customer with segment info */
export interface CustomerWithSegment extends Customer {
  segment: CustomerSegment;
  daysSinceLastOrder: number | null;
}

/** Inactive customer threshold (days) */
export const INACTIVE_THRESHOLD_DAYS = 30;

/** At-risk customer threshold (days) */
export const AT_RISK_THRESHOLD_DAYS = 60;
