/**
 * Product Actions
 * CRUD operations and business logic for products
 */

import * as Haptics from 'expo-haptics';
import type { Product, ProductVariant, ProductWithVariants } from '@/types';
import {
  createProduct as createProductInSupabase,
  updateProductInDb,
  deleteProductFromDb,
} from '@/lib/supabaseDataService';
import { getCurrentUserId } from '@/store/authStore';
import type { Listener, DataState } from '@/store/core';
import { cacheData } from '@/store/core';
import type {
  ProductCreatePayload,
  ProductUpdatePayload,
  VariantCreatePayload,
  VariantUpdatePayload,
  BatchProductUpdatePayload,
  ProductSearchFilters,
} from './productTypes';

// ============== STATE MANAGEMENT ==============

/** Global state reference - set by root store */
let globalState: DataState | null = null;
let globalSetState: ((updates: Partial<DataState>) => void) | null = null;
let globalListeners: Set<Listener> | null = null;

/** Initialize product store with state references */
export const initProductStore = (
  state: DataState,
  setState: (updates: Partial<DataState>) => void,
  listeners: Set<Listener>
) => {
  globalState = state;
  globalSetState = setState;
  globalListeners = listeners;
};

/** Get current products from global state */
const getProducts = (): Product[] => globalState?.products || [];

/** Get current variants from global state */
const getVariants = (): ProductVariant[] => globalState?.variants || [];

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

// ============== CALCULATION UTILITIES ==============

/**
 * Calculate margin percentage
 */
export const calculateMargin = (price: number, costPrice: number): number => {
  if (price <= 0) return 0;
  return Math.round(((price - costPrice) / price) * 100);
};

/**
 * Calculate profit amount
 */
export const calculateProfit = (price: number, costPrice: number): number => {
  return price - costPrice;
};

// ============== PRODUCT CRUD OPERATIONS ==============

/**
 * Create a new product
 * Tries Supabase first, falls back to local creation
 */
export const createProduct = async (
  productData: ProductCreatePayload
): Promise<Product | null> => {
  const userId = getCurrentUserId();

  // Try Supabase first
  if (userId) {
    const result = await createProductInSupabase(productData);
    if (result) {
      const currentProducts = getProducts();
      updateState({ products: [result, ...currentProducts] });
      await cacheData(globalState!);
      return result;
    }
  }

  // Fallback to local creation
  const newProduct: Product = {
    id: `product-${Date.now()}`,
    ...productData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const currentProducts = getProducts();
  updateState({ products: [newProduct, ...currentProducts] });
  await cacheData(globalState!);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  return newProduct;
};

/**
 * Update an existing product
 * Tries Supabase first, falls back to local update
 */
export const updateProduct = async (
  productId: string,
  updates: ProductUpdatePayload
): Promise<Product | null> => {
  const userId = getCurrentUserId();
  const currentProducts = getProducts();
  const index = currentProducts.findIndex((p) => p.id === productId);

  if (index === -1) return null;

  const currentProduct = currentProducts[index];

  // Try Supabase first
  if (userId) {
    const result = await updateProductInDb(productId, updates);
    if (result) {
      const newProducts = [...currentProducts];
      newProducts[index] = result;
      updateState({ products: newProducts });
      await cacheData(globalState!);
      return result;
    }
  }

  // Fallback to local update
  const updatedProduct: Product = {
    ...currentProduct,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // If price changed, add to price history
  if (updates.price && updates.price !== currentProduct.price) {
    updatedProduct.priceHistory = [
      ...(currentProduct.priceHistory || []),
      { date: new Date().toISOString(), price: updates.price },
    ];
  }

  // If stock changed, add to stock history
  if (updates.stock !== undefined && updates.stock !== currentProduct.stock) {
    const change = updates.stock - currentProduct.stock;
    updatedProduct.stockHistory = [
      ...(currentProduct.stockHistory || []),
      {
        date: new Date().toISOString(),
        stock: updates.stock,
        change,
        reason: change > 0 ? 'restock' : 'adjustment',
      },
    ];
  }

  const newProducts = [...currentProducts];
  newProducts[index] = updatedProduct;

  updateState({ products: newProducts });
  await cacheData(globalState!);
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  return updatedProduct;
};

/**
 * Delete a product
 * Tries Supabase first, falls back to local delete
 */
export const deleteProduct = async (productId: string): Promise<boolean> => {
  const userId = getCurrentUserId();

  // Try Supabase first
  if (userId) {
    const success = await deleteProductFromDb(productId);
    if (success) {
      const currentProducts = getProducts();
      updateState({ products: currentProducts.filter((p) => p.id !== productId) });
      await cacheData(globalState!);
      return true;
    }
  }

  // Fallback to local delete
  const currentProducts = getProducts();
  updateState({ products: currentProducts.filter((p) => p.id !== productId) });
  await cacheData(globalState!);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  return true;
};

// ============== PRODUCT QUERIES ==============

/**
 * Get product by ID
 */
export const getProductById = (id: string): Product | undefined => {
  return getProducts().find((product) => product.id === id);
};

/**
 * Get product by barcode
 */
export const getProductByBarcode = (barcode: string): Product | undefined => {
  return getProducts().find((product) => product.barcode === barcode);
};

/**
 * Get product by SKU
 */
export const getProductBySku = (sku: string): Product | undefined => {
  return getProducts().find(
    (product) => product.sku.toLowerCase() === sku.toLowerCase()
  );
};

/**
 * Search products with filters
 */
export const searchProducts = (
  query?: string,
  categoryFilter?: string
): Product[] => {
  let filtered = getProducts();

  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.sku.toLowerCase().includes(lowerQuery) ||
        (product.barcode && product.barcode.includes(query))
    );
  }

  if (categoryFilter && categoryFilter !== 'all') {
    filtered = filtered.filter((product) => product.category === categoryFilter);
  }

  return filtered;
};

/**
 * Advanced product search with multiple filters
 */
export const filterProducts = (filters: ProductSearchFilters): Product[] => {
  let filtered = getProducts();

  if (filters.query) {
    const lowerQuery = filters.query.toLowerCase();
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.sku.toLowerCase().includes(lowerQuery) ||
        (product.barcode && product.barcode.toLowerCase().includes(lowerQuery))
    );
  }

  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter((p) => p.category === filters.category);
  }

  if (filters.categoryId) {
    filtered = filtered.filter((p) => p.categoryId === filters.categoryId);
  }

  if (filters.isActive !== undefined) {
    filtered = filtered.filter((p) => p.isActive === filters.isActive);
  }

  if (filters.minStock !== undefined) {
    filtered = filtered.filter((p) => p.stock >= filters.minStock!);
  }

  if (filters.maxStock !== undefined) {
    filtered = filtered.filter((p) => p.stock <= filters.maxStock!);
  }

  if (filters.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.price >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
  }

  return filtered;
};

/**
 * Get all unique categories
 */
export const getCategories = (): string[] => {
  const categories = new Set(getProducts().map((p) => p.category));
  return ['all', ...Array.from(categories)];
};

/**
 * Get low stock products
 */
export const getLowStockProducts = (): Product[] => {
  return getProducts().filter((p) => p.stock <= p.minStock);
};

/**
 * Get products with margin calculations
 */
export const getProductsWithMargins = (): (Product & { margin: number; profit: number })[] => {
  return getProducts().map((p) => ({
    ...p,
    margin: calculateMargin(p.price, p.costPrice),
    profit: calculateProfit(p.price, p.costPrice),
  }));
};

/**
 * Get highest margin products
 */
export const getHighestMarginProducts = (limit: number = 5): (Product & { margin: number; profit: number })[] => {
  return getProductsWithMargins()
    .sort((a, b) => (b.margin || 0) - (a.margin || 0))
    .slice(0, limit);
};

// ============== VARIANT OPERATIONS ==============

/**
 * Get variants for a product
 */
export const getVariantsByProductId = (productId: string): ProductVariant[] => {
  return getVariants().filter((v) => v.productId === productId);
};

/**
 * Get a single variant by ID
 */
export const getVariantById = (variantId: string): ProductVariant | undefined => {
  return getVariants().find((v) => v.id === variantId);
};

/**
 * Check if product has variants
 */
export const productHasVariants = (productId: string): boolean => {
  return getVariants().some((v) => v.productId === productId);
};

/**
 * Get product with variants
 */
export const getProductWithVariants = (productId: string): ProductWithVariants | undefined => {
  const product = getProductById(productId);
  if (!product) return undefined;

  const variants = getVariantsByProductId(productId);
  return {
    ...product,
    variants: variants.length > 0 ? variants : undefined,
    hasVariants: variants.length > 0,
  };
};

/**
 * Get all products with their variants
 */
export const getAllProductsWithVariants = (): ProductWithVariants[] => {
  const products = getProducts();
  return products.map((product) => {
    const variants = getVariantsByProductId(product.id);
    return {
      ...product,
      variants: variants.length > 0 ? variants : undefined,
      hasVariants: variants.length > 0,
    };
  });
};

/**
 * Add a new variant
 */
export const addVariant = async (
  variant: VariantCreatePayload
): Promise<ProductVariant> => {
  const newVariant: ProductVariant = {
    ...variant,
    id: `var-${Date.now()}`,
  };

  const currentVariants = getVariants();
  updateState({ variants: [...currentVariants, newVariant] });
  await cacheData(globalState!);
  return newVariant;
};

/**
 * Update a variant
 */
export const updateVariant = async (
  variantId: string,
  updates: VariantUpdatePayload
): Promise<ProductVariant | null> => {
  const currentVariants = getVariants();
  const index = currentVariants.findIndex((v) => v.id === variantId);
  if (index === -1) return null;

  const updatedVariant: ProductVariant = {
    ...currentVariants[index],
    ...updates,
  };

  const newVariants = [...currentVariants];
  newVariants[index] = updatedVariant;

  updateState({ variants: newVariants });
  await cacheData(globalState!);
  return updatedVariant;
};

/**
 * Delete a variant
 */
export const deleteVariant = async (variantId: string): Promise<boolean> => {
  const currentVariants = getVariants();
  const index = currentVariants.findIndex((v) => v.id === variantId);
  if (index === -1) return false;

  updateState({ variants: currentVariants.filter((v) => v.id !== variantId) });
  await cacheData(globalState!);
  return true;
};

/**
 * Get total stock including variants
 */
export const getTotalProductStock = (productId: string): number => {
  const variants = getVariantsByProductId(productId);
  if (variants.length > 0) {
    return variants.reduce((sum, v) => sum + v.stock, 0);
  }
  const product = getProductById(productId);
  return product?.stock || 0;
};

// ============== BATCH OPERATIONS ==============

/**
 * Batch update products
 */
export const batchUpdateProducts = async (
  productIds: string[],
  updates: BatchProductUpdatePayload
): Promise<Product[]> => {
  const currentProducts = getProducts();
  const updatedProducts: Product[] = [];

  for (const productId of productIds) {
    const index = currentProducts.findIndex((p) => p.id === productId);
    if (index === -1) continue;

    const currentProduct = currentProducts[index];
    const productUpdates: Partial<Product> = {
      category: updates.category,
      categoryId: updates.categoryId,
      isActive: updates.isActive,
      updatedAt: new Date().toISOString(),
    };

    // Handle stock adjustment
    if (updates.stockAdjustment !== undefined) {
      const newStock = Math.max(0, currentProduct.stock + updates.stockAdjustment);
      productUpdates.stock = newStock;

      // Add to stock history
      productUpdates.stockHistory = [
        ...(currentProduct.stockHistory || []),
        {
          date: new Date().toISOString(),
          stock: newStock,
          change: updates.stockAdjustment,
          reason: updates.stockAdjustment > 0 ? 'restock' : 'adjustment',
        },
      ];
    }

    const updatedProduct: Product = {
      ...currentProduct,
      ...productUpdates,
    };

    currentProducts[index] = updatedProduct;
    updatedProducts.push(updatedProduct);
  }

  updateState({ products: [...currentProducts] });
  await cacheData(globalState!);
  return updatedProducts;
};

/**
 * Batch update variant stock
 */
export const batchUpdateVariantStock = async (
  variantIds: string[],
  stockAdjustment: number
): Promise<ProductVariant[]> => {
  const currentVariants = getVariants();
  const updatedVariants: ProductVariant[] = [];

  for (const variantId of variantIds) {
    const index = currentVariants.findIndex((v) => v.id === variantId);
    if (index === -1) continue;

    const currentVariant = currentVariants[index];
    const newStock = Math.max(0, currentVariant.stock + stockAdjustment);

    const updatedVariant: ProductVariant = {
      ...currentVariant,
      stock: newStock,
    };

    currentVariants[index] = updatedVariant;
    updatedVariants.push(updatedVariant);
  }

  updateState({ variants: [...currentVariants] });
  await cacheData(globalState!);
  return updatedVariants;
};
