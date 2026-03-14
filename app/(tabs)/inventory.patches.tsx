/**
 * PATCH INSTRUCTIONS for app/(tabs)/inventory.tsx
 * 
 * These patches handle products without images and other migrated data edge cases.
 */

// ============================================
// PATCH 1: Handle products without images in ProductCard
// ============================================

// In the ProductCard component usage, ensure it handles missing images gracefully.
// The ProductCard component should already handle this, but verify the prop types:

// Ensure ProductCard accepts optional image:
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    minStock: number;
    category: string;
    image?: string; // Optional
    images?: string[]; // Optional
    isActive: boolean;
  };
  onPress: () => void;
  showVariantBadge?: boolean;
}

// ============================================
// PATCH 2: Safe product filtering with null checks
// ============================================

// Replace the filteredProducts useMemo (around line 84) with safer version:

const filteredProducts = useMemo(() => {
  let filtered = searchProducts(searchQuery, activeCategory);
  
  // Filter out null/undefined products
  filtered = filtered.filter((p): p is Product => 
    p != null && typeof p === 'object' && p.id != null
  );
  
  if (showLowStockOnly) {
    filtered = filtered.filter((p) => {
      const stock = Number(p.stock) ?? 0;
      const minStock = Number(p.minStock) ?? 0;
      return stock <= minStock;
    });
  }
  return filtered;
}, [products, searchQuery, activeCategory, showLowStockOnly]);

// ============================================
// PATCH 3: Safe category extraction
// ============================================

// In getCategories function in dataStore.ts, ensure safe category handling:

export const getCategories = (): string[] => {
  const categories = new Set<string>();
  dataState.products.forEach((p) => {
    if (p?.category) {
      categories.add(p.category);
    }
  });
  return ['all', ...Array.from(categories)];
};

// ============================================
// PATCH 4: Handle missing product images in renderProductItem
// ============================================

// Update renderProductItem to handle missing data:

const renderProductItem = ({ item, index }: { item: Product; index: number }) => {
  // Skip rendering invalid products
  if (!item?.id) return null;
  
  const isSelected = selectedProducts.has(item.id);
  const hasVariants = productHasVariants(item.id);

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <Pressable
        onPress={() => handleProductPress(item.id)}
        onLongPress={() => {
          if (!batchMode) {
            setBatchMode(true);
            toggleProductSelection(item.id);
          }
        }}
      >
        <View style={[
          styles.productWrapper,
          batchMode && isSelected && styles.productWrapperSelected,
        ]}>
          {batchMode && (
            <View style={[
              styles.selectionCheckbox,
              isSelected && styles.selectionCheckboxSelected,
            ]}>
              {isSelected && (
                <Ionicons name="checkmark" size={16} color={colors.textInverse} />
              )}
            </View>
          )}
          <View style={{ flex: 1 }}>
            <ProductCard
              product={{
                ...item,
                // Ensure all required fields have fallbacks
                name: item.name || 'Без названия',
                sku: item.sku || '',
                price: Number(item.price) || 0,
                stock: Number(item.stock) || 0,
                minStock: Number(item.minStock) || 0,
                category: item.category || 'Без категории',
                isActive: item.isActive ?? true,
              }}
              onPress={() => handleProductPress(item.id)}
              showVariantBadge={hasVariants}
            />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ============================================
// PATCH 5: Safe getTotalStock calculation
// ============================================

const getTotalStock = () => {
  return products.reduce((sum, p) => {
    const stock = Number(p?.stock) ?? 0;
    return sum + (isNaN(stock) ? 0 : Math.max(0, stock));
  }, 0);
};

// ============================================
// PATCH 6: Safe low stock count
// ============================================

// Update the lowStockCount calculation (around line 75):

useEffect(() => {
  const unsub = subscribeData(() => {
    const state = getDataState();
    setProducts(state.products || []);
    setIsLoading(state.isLoading);
    setCategories(getCategories());
    // Safe low stock calculation
    const lowStock = (state.products || []).filter((p) => {
      const stock = Number(p?.stock) ?? 0;
      const minStock = Number(p?.minStock) ?? 0;
      return !isNaN(stock) && !isNaN(minStock) && stock <= minStock;
    });
    setLowStockCount(lowStock.length);
  });

  fetchData();

  return () => unsub();
}, []);
