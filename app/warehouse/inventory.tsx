import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { getDataState } from '@/store/dataStore';
import type { Product } from '@/types';

interface InventoryItem extends Product {
  location?: string;
  shelfLocation?: string;
  lastCountDate?: string;
}

export default function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showOutOfStock, setShowOutOfStock] = useState(false);

  const loadInventory = useCallback(async () => {
    try {
      const products = getDataState().products;
      // Enhance products with inventory-specific data
      const enhancedProducts: InventoryItem[] = products.map((p) => ({
        ...p,
        location: 'Основной склад',
        shelfLocation: p.sku ? `A-${p.sku.slice(0, 2)}` : undefined,
      }));
      setInventory(enhancedProducts);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  useEffect(() => {
    let filtered = inventory;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query) ||
          item.barcode?.includes(query) ||
          item.shelfLocation?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (!showOutOfStock) {
      filtered = filtered.filter((item) => item.stock > 0);
    }

    setFilteredInventory(filtered);
  }, [inventory, searchQuery, selectedCategory, showOutOfStock]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadInventory();
  };

  const handleProductPress = (productId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/product/${productId}`);
  };

  const handleCountStock = (productId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/warehouse/adjustment?productId=${productId}`);
  };

  const categories = Array.from(new Set(inventory.map((item) => item.category)));

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: 'Нет в наличии', color: colors.error };
    if (stock <= minStock) return { label: 'Низкий запас', color: colors.warning };
    return { label: 'В наличии', color: colors.success };
  };

  const renderInventoryItem = ({ item, index }: { item: InventoryItem; index: number }) => {
    const status = getStockStatus(item.stock, item.minStock);
    const stockValue = item.stock * item.costPrice;

    return (
      <Animated.View entering={SlideInRight.delay(index * 30).springify()}>
        <Pressable
          style={styles.inventoryCard}
          onPress={() => handleProductPress(item.id)}
          onLongPress={() => handleCountStock(item.id)}
        >
          <View style={styles.cardHeader}>
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.productSku}>SKU: {item.sku}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${status.color}15` }]}>
              <View style={[styles.statusDot, { backgroundColor: status.color }]} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.stockInfo}>
              <View style={styles.stockItem}>
                <Text style={styles.stockLabel}>На складе</Text>
                <Text style={styles.stockValue}>{item.stock}</Text>
              </View>
              <View style={styles.stockItem}>
                <Text style={styles.stockLabel}>Минимум</Text>
                <Text style={[styles.stockValue, item.stock <= item.minStock && styles.stockWarning]}>
                  {item.minStock}
                </Text>
              </View>
              <View style={styles.stockItem}>
                <Text style={styles.stockLabel}>Себестоимость</Text>
                <Text style={styles.stockValue}>{item.costPrice.toLocaleString('ru-RU')} ₽</Text>
              </View>
              <View style={styles.stockItem}>
                <Text style={styles.stockLabel}>Стоимость запаса</Text>
                <Text style={styles.stockValue}>{stockValue.toLocaleString('ru-RU')} ₽</Text>
              </View>
            </View>

            {item.shelfLocation && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.locationText}>
                  {item.location} • {item.shelfLocation}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.cardFooter}>
            <Pressable
              style={styles.actionButton}
              onPress={() => handleCountStock(item.id)}
            >
              <Ionicons name="calculator-outline" size={18} color={colors.primary} />
              <Text style={styles.actionButtonText}>Пересчёт</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push(`/warehouse/transfer?productId=${item.id}`)}
            >
              <Ionicons name="swap-horizontal-outline" size={18} color={colors.primary} />
              <Text style={styles.actionButtonText}>Перемещение</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push(`/warehouse/adjustment?productId=${item.id}`)}
            >
              <Ionicons name="create-outline" size={18} color={colors.primary} />
              <Text style={styles.actionButtonText}>Корректировка</Text>
            </Pressable>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <EmptyState
      variant="products"
      title={searchQuery ? 'Ничего не найдено' : 'Нет товаров'}
      description={
        searchQuery
          ? 'Попробуйте изменить поисковый запрос'
          : 'Добавьте товары для управления инвентарём'
      }
      actionLabel={!searchQuery ? 'Добавить товар' : undefined}
      onAction={!searchQuery ? () => router.push('/warehouse/stock_in') : undefined}
    />
  );

  const renderLoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <Skeleton width="70%" height={20} />
          <Skeleton width="40%" height={16} style={{ marginTop: 8 }} />
          <View style={styles.skeletonRow}>
            <Skeleton width="22%" height={40} />
            <Skeleton width="22%" height={40} />
            <Skeleton width="22%" height={40} />
            <Skeleton width="22%" height={40} />
          </View>
        </View>
      ))}
    </View>
  );

  const totalStockValue = inventory.reduce((sum, item) => sum + item.stock * item.costPrice, 0);
  const totalItems = inventory.length;
  const outOfStockCount = inventory.filter((item) => item.stock === 0).length;
  const lowStockCount = inventory.filter((item) => item.stock > 0 && item.stock <= item.minStock).length;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Инвентаризация',
          headerLargeTitle: true,
        }}
      />

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск по названию, SKU, штрих-коду..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textLight} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Category Filter */}
      {!isLoading && categories.length > 0 && (
        <Animated.View entering={FadeIn} style={styles.categoryContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={['all', ...categories]}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.categoryChip,
                  (selectedCategory === item || (item === 'all' && !selectedCategory)) &&
                    styles.categoryChipActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCategory(item === 'all' ? null : item);
                }}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    (selectedCategory === item || (item === 'all' && !selectedCategory)) &&
                      styles.categoryChipTextActive,
                  ]}
                >
                  {item === 'all' ? 'Все' : item}
                </Text>
              </Pressable>
            )}
          />
        </Animated.View>
      )}

      {/* Stats */}
      {!isLoading && (
        <Animated.View entering={FadeIn} style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalItems}</Text>
            <Text style={styles.statLabel}>Позиций</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalStockValue.toLocaleString('ru-RU')} ₽</Text>
            <Text style={styles.statLabel}>Стоимость</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.warning }]}>{lowStockCount}</Text>
            <Text style={styles.statLabel}>Низкий запас</Text>
          </View>
          <Pressable style={styles.statCard} onPress={() => setShowOutOfStock(!showOutOfStock)}>
            <Text style={[styles.statValue, { color: showOutOfStock ? colors.error : colors.text }]}>
              {outOfStockCount}
            </Text>
            <Text style={styles.statLabel}>{showOutOfStock ? 'Показаны' : 'Нет в наличии'}</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Content */}
      {isLoading ? (
        renderLoadingSkeleton()
      ) : (
        <FlatList
          data={filteredInventory}
          renderItem={renderInventoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContainer,
            filteredInventory.length === 0 && styles.emptyListContainer,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  categoryContainer: {
    marginBottom: spacing.sm,
  },
  categoryList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  emptyListContainer: {
    flex: 1,
  },
  skeletonContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  skeletonCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  inventoryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  productSku: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: spacing.sm,
  },
  stockInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stockItem: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  stockLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  stockValue: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  stockWarning: {
    color: colors.warning,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  locationText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: `${colors.primary}10`,
    borderRadius: borderRadius.md,
  },
  actionButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: '600',
  },
});
