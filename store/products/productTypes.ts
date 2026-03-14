/**
 * Product Types
 * Type definitions specific to product store module
 */

import type { Product, ProductVariant, ProductWithVariants } from '@/types';

/** Product search filters */
export interface ProductSearchFilters {
  query?: string;
  category?: string;
  categoryId?: string;
  isActive?: boolean;
  minStock?: number;
  maxStock?: number;
  minPrice?: number;
  maxPrice?: number;
}

/** Product sort options */
export type ProductSortField = 
  | 'name' 
  | 'price' 
  | 'stock' 
  | 'createdAt' 
  | 'updatedAt' 
  | 'category';

export type ProductSortOrder = 'asc' | 'desc';

export interface ProductSortOptions {
  field: ProductSortField;
  order: ProductSortOrder;
}

/** Product with calculated margin fields */
export type ProductWithMargins = Product & {
  margin: number;
  profit: number;
};

/** Product update payload */
export type ProductUpdatePayload = Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>;

/** Product create payload */
export type ProductCreatePayload = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

/** Variant create payload */
export type VariantCreatePayload = Omit<ProductVariant, 'id'>;

/** Variant update payload */
export type VariantUpdatePayload = Partial<Omit<ProductVariant, 'id' | 'productId'>>;

/** Batch update payload for products */
export interface BatchProductUpdatePayload {
  category?: string;
  categoryId?: string;
  isActive?: boolean;
  stockAdjustment?: number;
}

/** Batch update payload for variants */
export interface BatchVariantUpdatePayload {
  stockAdjustment: number;
}

/** Product statistics */
export interface ProductStatistics {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
  totalCost: number;
  averageMargin: number;
}

/** Stock adjustment entry */
export interface StockAdjustment {
  productId: string;
  variantId?: string;
  change: number;
  reason: 'sale' | 'restock' | 'adjustment' | 'return' | 'transfer';
  notes?: string;
  timestamp: string;
}
