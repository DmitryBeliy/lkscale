import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ProductCard } from '@/components/ProductCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { BarcodeScanner, ScannerButton } from '@/components/BarcodeScanner';
import {
  getDataState,
  subscribeData,
  fetchData,
  searchProducts,
  getCategories,
  getLowStockProducts,
  getProductByBarcode,
  getProductBySku,
} from '@/store/dataStore';
import { Product } from '@/types';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

export default function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);

  useEffect(() => {
    const unsub = subscribeData(() => {
      const state = getDataState();
      setProducts(state.products);
      setIsLoading(state.isLoading);
      setCategories(getCategories());
      setLowStockCount(getLowStockProducts().length);
    });

    fetchData();

    return () => unsub();
  }, []);

  useEffect(() => {
    let filtered = searchProducts(searchQuery, activeCategory);
    if (showLowStockOnly) {
      filtered = filtered.filter((p) => p.stock <= p.minStock);
    }
    setFilteredProducts(filtered);
  }, [products, searchQuery, activeCategory, showLowStockOnly]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchData();
    setRefreshing(false);
  }, []);

  const handleCategoryPress = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveCategory(category);
    setShowLowStockOnly(false);
  };

  const handleLowStockToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowLowStockOnly(!showLowStockOnly);
    if (!showLowStockOnly) {
      setActiveCategory('all');
    }
  };

  const handleProductPress = (productId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/product/${productId}`);
  };

  const handleScan = (data: string, type: string) => {
    // Try to find product by barcode first, then by SKU
    let product = getProductByBarcode(data);
    if (!product) {
      product = getProductBySku(data);
    }

    if (product) {
      router.push(`/product/${product.id}`);
    } else {
      // If not found, set it as search query
      Alert.alert(
        'Товар не найден',
        `Товар со штрих-кодом или SKU "${data}" не найден. Хотите использовать это значение для поиска?`,
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Искать', onPress: () => setSearchQuery(data) },
        ]
      );
    }
  };

  const getCategoryLabel = (category: string) => {
    if (category === 'all') return 'Все';
    return category;
  };

  const getTotalStock = () => {
    return products.reduce((sum, p) => sum + p.stock, 0);
  };

  const renderProductItem = ({ item, index }: { item: Product; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <ProductCard product={item} onPress={() => handleProductPress(item.id)} />
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="cube-outline" size={64} color={colors.textLight} />
      <Text style={styles.emptyTitle}>Товаров не найдено</Text>
      <Text style={styles.emptyDescription}>
        {searchQuery || activeCategory !== 'all' || showLowStockOnly
          ? 'Попробуйте изменить параметры поиска'
          : 'Здесь появятся ваши товары'}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <>
      {/* Stats Summary */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Ionicons name="cube" size={24} color={colors.primary} />
          <Text style={styles.statValue}>{products.length}</Text>
          <Text style={styles.statLabel}>Товаров</Text>
        </Card>
        <Card style={styles.statCard}>
          <Ionicons name="layers" size={24} color={colors.success} />
          <Text style={styles.statValue}>{getTotalStock()}</Text>
          <Text style={styles.statLabel}>На складе</Text>
        </Card>
        <Pressable onPress={handleLowStockToggle}>
          <Card
            style={[styles.statCard, showLowStockOnly ? styles.statCardActive : null]}
          >
            <Ionicons
              name="warning"
              size={24}
              color={showLowStockOnly ? colors.textInverse : colors.warning}
            />
            <Text
              style={showLowStockOnly ? [styles.statValue, styles.statValueActive] : styles.statValue}
            >
              {lowStockCount}
            </Text>
            <Text
              style={showLowStockOnly ? [styles.statLabel, styles.statLabelActive] : styles.statLabel}
            >
              Мало
            </Text>
          </Card>
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Ionicons name="search" size={20} color={colors.textLight} />
          <TextInput
            style={styles.searchTextInput}
            placeholder="Поиск по названию или SKU..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textLight} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Category Filters */}
      {!showLowStockOnly && (
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            data={categories}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.filterChip,
                  activeCategory === item && styles.filterChipActive,
                ]}
                onPress={() => handleCategoryPress(item)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    activeCategory === item && styles.filterChipTextActive,
                  ]}
                >
                  {getCategoryLabel(item)}
                </Text>
              </Pressable>
            )}
          />
        </View>
      )}

      {showLowStockOnly && (
        <View style={styles.lowStockBanner}>
          <Ionicons name="warning" size={20} color={colors.warning} />
          <Text style={styles.lowStockBannerText}>
            Показаны товары с низким запасом
          </Text>
          <Pressable onPress={handleLowStockToggle}>
            <Text style={styles.clearFilterText}>Сбросить</Text>
          </Pressable>
        </View>
      )}
    </>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Barcode Scanner */}
      <BarcodeScanner
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={handleScan}
        title="Сканировать товар"
        description="Наведите камеру на штрих-код товара"
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Склад</Text>
        <ScannerButton
          onPress={() => setScannerVisible(true)}
          variant="secondary"
          size="medium"
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.statsRow}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.skeletonStat} />
            ))}
          </View>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} lines={2} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  loadingContainer: {
    padding: spacing.md,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statCardActive: {
    backgroundColor: colors.warning,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
  },
  statValueActive: {
    color: colors.textInverse,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statLabelActive: {
    color: colors.textInverse,
  },
  skeletonStat: {
    flex: 1,
    height: 80,
    backgroundColor: colors.skeleton,
    borderRadius: borderRadius.lg,
  },
  searchContainer: {
    marginBottom: spacing.sm,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.sm,
  },
  searchTextInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
    marginLeft: spacing.sm,
    paddingVertical: 4,
  },
  filtersContainer: {
    marginBottom: spacing.md,
  },
  filtersList: {
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.textInverse,
  },
  lowStockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  lowStockBannerText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  clearFilterText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
