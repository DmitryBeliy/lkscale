/**
 * Product Store
 * Local state management for products with subscription support
 */

import { useState, useEffect, useCallback } from 'react';
import type { Product, ProductVariant } from '@/types';
import type { DataState, Listener } from '@/store/core';

/** Product store state interface */
export interface ProductState {
  products: Product[];
  variants: ProductVariant[];
  isLoading: boolean;
}

/** Local store state */
let localState: ProductState = {
  products: [],
  variants: [],
  isLoading: false,
};

/** Local listeners */
const localListeners: Set<Listener> = new Set();

/** Notify local listeners */
const notifyListeners = () => {
  localListeners.forEach((listener) => listener());
};

/** Subscribe to product store changes */
export const subscribeProductStore = (listener: Listener): (() => void) => {
  localListeners.add(listener);
  return () => {
    localListeners.delete(listener);
  };
};

/** Get current product state */
export const getProductState = (): ProductState => ({ ...localState });

/** Set product state */
export const setProductState = (updates: Partial<ProductState>) => {
  localState = { ...localState, ...updates };
  notifyListeners();
};

/** Update from global data state */
export const syncWithGlobalState = (globalState: DataState) => {
  setProductState({
    products: globalState.products,
    variants: globalState.variants,
    isLoading: globalState.isLoading,
  });
};

/** React hook for product store */
export const useProductStore = () => {
  const [state, setState] = useState<ProductState>(getProductState());

  useEffect(() => {
    const unsubscribe = subscribeProductStore(() => {
      setState(getProductState());
    });
    return unsubscribe;
  }, []);

  return state;
};

/** React hook for single product */
export const useProduct = (productId: string | null) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setIsLoading(false);
      return;
    }

    const updateProduct = () => {
      const currentState = getProductState();
      const found = currentState.products.find((p) => p.id === productId);
      setProduct(found || null);
      setIsLoading(false);
    };

    updateProduct();
    const unsubscribe = subscribeProductStore(updateProduct);
    return unsubscribe;
  }, [productId]);

  return { product, isLoading };
};

/** React hook for product variants */
export const useProductVariants = (productId: string | null) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [hasVariants, setHasVariants] = useState(false);

  useEffect(() => {
    if (!productId) {
      setVariants([]);
      setHasVariants(false);
      return;
    }

    const updateVariants = () => {
      const currentState = getProductState();
      const productVariants = currentState.variants.filter(
        (v) => v.productId === productId
      );
      setVariants(productVariants);
      setHasVariants(productVariants.length > 0);
    };

    updateVariants();
    const unsubscribe = subscribeProductStore(updateVariants);
    return unsubscribe;
  }, [productId]);

  return { variants, hasVariants };
};

/** React hook for filtered products */
export const useFilteredProducts = (
  filterFn: (product: Product) => boolean
) => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const updateFiltered = useCallback(() => {
    const currentState = getProductState();
    setFilteredProducts(currentState.products.filter(filterFn));
  }, [filterFn]);

  useEffect(() => {
    updateFiltered();
    const unsubscribe = subscribeProductStore(updateFiltered);
    return unsubscribe;
  }, [updateFiltered]);

  return filteredProducts;
};

/** React hook for low stock products */
export const useLowStockProducts = () => {
  return useFilteredProducts((product) => product.stock <= product.minStock);
};

/** React hook for active products count */
export const useProductsCount = () => {
  const [count, setCount] = useState({ total: 0, active: 0, lowStock: 0 });

  useEffect(() => {
    const updateCount = () => {
      const currentState = getProductState();
      const products = currentState.products;
      setCount({
        total: products.length,
        active: products.filter((p) => p.isActive).length,
        lowStock: products.filter((p) => p.stock <= p.minStock).length,
      });
    };

    updateCount();
    const unsubscribe = subscribeProductStore(updateCount);
    return unsubscribe;
  }, []);

  return count;
};
