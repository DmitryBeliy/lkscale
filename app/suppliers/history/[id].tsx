import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { SupplierIcon, PurchaseOrderIcon, InboundIcon } from '@/components/warehouse/WarehouseIcons';
import {
  getSupplierById,
  getPurchaseOrders,
} from '@/services/warehouseService';
import type { Supplier, PurchaseOrder } from '@/types';

interface PriceHistory {
  productId: string;
  productName: string;
  prices: {
    date: string;
    price: number;
    orderNumber: string;
  }[];
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
}

export default function SupplierPurchaseHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'prices'>('orders');

  const loadData = useCallback(async () => {
    if (!id) return;

    try {
      const [supplierData, ordersData] = await Promise.all([
        getSupplierById(id),
        getPurchaseOrders(),
      ]);

      setSupplier(supplierData);
      const supplierOrders = ordersData
        .filter((o) => o.supplierId === id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPurchaseOrders(supplierOrders);

      // Calculate price history
      calculatePriceHistory(supplierOrders);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const calculatePriceHistory = (orders: PurchaseOrder[]) => {
    const productPrices: Record<string, PriceHistory> = {};

    // Process orders from oldest to newest
    const sortedOrders = [...orders].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sortedOrders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.productId;
        if (!productId) return;

        if (!productPrices[productId]) {
          productPrices[productId] = {
            productId: productId,
            productName: item.productName,
            prices: [],
            currentPrice: 0,
            priceChange: 0,
            priceChangePercent: 0,
          };
        }

        productPrices[productId].prices.push({
          date: order.createdAt,
          price: item.unitCost,
          orderNumber: order.orderNumber,
        });
      });
    });

    // Calculate price changes
    Object.values(productPrices).forEach((product) => {
      if (product.prices.length > 0) {
        const latestPrice = product.prices[product.prices.length - 1].price;
        product.currentPrice = latestPrice;

        if (product.prices.length > 1) {
          const previousPrice = product.prices[product.prices.length - 2].price;
          product.priceChange = latestPrice - previousPrice;
          product.priceChangePercent = previousPrice > 0
            ? ((latestPrice - previousPrice) / previousPrice) * 100
            : 0;
        }
      }
    });

    // Sort by price change (most increased first)
    const sorted = Object.values(productPrices).sort(
      (a, b) => Math.abs(b.priceChangePercent) - Math.abs(a.priceChangePercent)
    );

    setPriceHistory(sorted);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTabChange = (tab: 'orders' | 'prices') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return colors.success;
      case 'ordered':
      case 'pending':
        return colors.primary;
      case 'partial':
        return colors.warning;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Черновик';
      case 'pending':
        return 'Ожидание';
      case 'ordered':
        return 'Заказано';
      case 'partial':
        return 'Частично';
      case 'received':
        return 'Получено';
      case 'cancelled':
        return 'Отменено';
      default:
        return status;
    }
  };

  const renderOrderItem = ({ item, index }: { item: PurchaseOrder; index: number }) => (
    <Animated.View entering={SlideInUp.delay(index * 50)}>
      <Pressable
        style={styles.orderCard}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push(`/warehouse/orders/${item.id}`);
        }}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderIconContainer}>
            <PurchaseOrderIcon size={20} color={colors.primary} />
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            <Text style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.orderStat}>
            <Text style={styles.orderStatLabel}>Товаров</Text>
            <Text style={styles.orderStatValue}>{item.totalItems}</Text>
          </View>
          <View style={styles.orderStat}>
            <Text style={styles.orderStatLabel}>Сумма</Text>
            <Text style={styles.orderStatValue}>
              {item.totalAmount.toLocaleString('ru-RU')} ₽
            </Text>
          </View>
          {item.receivedDate && (
            <View style={styles.orderStat}>
              <Text style={styles.orderStatLabel}>Получено</Text>
              <Text style={styles.orderStatValue}>
                {new Date(item.receivedDate).toLocaleDateString('ru-RU')}
              </Text>
            </View>
          )}
        </View>

        {/* Order Items Preview */}
        <View style={styles.itemsPreview}>
          {item.items.slice(0, 3).map((orderItem, i) => (
            <View key={i} style={styles.itemPreviewRow}>
              <Text style={styles.itemPreviewName} numberOfLines={1}>
                {orderItem.productName}
              </Text>
              <Text style={styles.itemPreviewQty}>×{orderItem.quantityOrdered}</Text>
              <Text style={styles.itemPreviewPrice}>
                {orderItem.unitCost.toLocaleString('ru-RU')} ₽
              </Text>
            </View>
          ))}
          {item.items.length > 3 && (
            <Text style={styles.moreItems}>+{item.items.length - 3} ещё...</Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );

  const renderPriceItem = ({ item, index }: { item: PriceHistory; index: number }) => (
    <Animated.View entering={SlideInUp.delay(index * 50)}>
      <View style={styles.priceCard}>
        <View style={styles.priceHeader}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.productName}
          </Text>
          <View style={styles.priceInfo}>
            <Text style={styles.currentPrice}>
              {item.currentPrice.toLocaleString('ru-RU')} ₽
            </Text>
            {item.priceChange !== 0 && (
              <View
                style={[
                  styles.priceChangeBadge,
                  item.priceChange > 0 ? styles.priceIncrease : styles.priceDecrease,
                ]}
              >
                <Ionicons
                  name={item.priceChange > 0 ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={item.priceChange > 0 ? colors.error : colors.success}
                />
                <Text
                  style={[
                    styles.priceChangeText,
                    { color: item.priceChange > 0 ? colors.error : colors.success },
                  ]}
                >
                  {item.priceChangePercent > 0 ? '+' : ''}
                  {item.priceChangePercent.toFixed(1)}%
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Price History Timeline */}
        <View style={styles.priceTimeline}>
          {item.prices.slice(-5).map((price, i) => (
            <View key={i} style={styles.timelineItem}>
              <View style={styles.timelineDot}>
                {i === item.prices.slice(-5).length - 1 && (
                  <View style={styles.timelineDotActive} />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineDate}>
                  {new Date(price.date).toLocaleDateString('ru-RU', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <Text style={styles.timelinePrice}>
                  {price.price.toLocaleString('ru-RU')} ₽
                </Text>
              </View>
              {i < item.prices.slice(-5).length - 1 && (
                <View style={styles.timelineLine} />
              )}
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!supplier) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={styles.errorText}>Поставщик не найден</Text>
      </View>
    );
  }

  const totalSpent = purchaseOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrderValue = purchaseOrders.length > 0 ? totalSpent / purchaseOrders.length : 0;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'История закупок',
          headerLargeTitle: false,
        }}
      />

      {/* Summary Header */}
      <Animated.View entering={FadeIn} style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.avatarSmall}>
            <SupplierIcon size={24} color={colors.primary} />
          </View>
          <Text style={styles.supplierNameSmall}>{supplier.name}</Text>
        </View>
        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>{purchaseOrders.length}</Text>
            <Text style={styles.summaryLabel}>Заказов</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>
              {totalSpent.toLocaleString('ru-RU')} ₽
            </Text>
            <Text style={styles.summaryLabel}>Всего</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>
              {avgOrderValue.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
            </Text>
            <Text style={styles.summaryLabel}>Средний чек</Text>
          </View>
        </View>
      </Animated.View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'orders' && styles.tabActive]}
          onPress={() => handleTabChange('orders')}
        >
          <InboundIcon
            size={18}
            color={activeTab === 'orders' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}
          >
            Заказы ({purchaseOrders.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'prices' && styles.tabActive]}
          onPress={() => handleTabChange('prices')}
        >
          <Ionicons
            name="trending-up"
            size={18}
            color={activeTab === 'prices' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[styles.tabText, activeTab === 'prices' && styles.tabTextActive]}
          >
            Цены ({priceHistory.length})
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      {activeTab === 'orders' ? (
        <FlatList
          data={purchaseOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing.lg },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <PurchaseOrderIcon size={48} color={colors.textLight} />
              <Text style={styles.emptyTitle}>Нет заказов</Text>
              <Text style={styles.emptyText}>
                История закупок у этого поставщика пуста
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={priceHistory}
          keyExtractor={(item) => item.productId}
          renderItem={renderPriceItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing.lg },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="analytics-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyTitle}>Нет данных</Text>
              <Text style={styles.emptyText}>
                Недостаточно данных для анализа цен
              </Text>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supplierNameSmall: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryStat: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  summaryLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    ...shadows.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    borderRadius: borderRadius.md,
  },
  tabActive: {
    backgroundColor: `${colors.primary}15`,
  },
  tabText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  orderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  orderDate: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  orderDetails: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.lg,
  },
  orderStat: {
    flex: 1,
  },
  orderStatLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  orderStatValue: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  itemsPreview: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  itemPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemPreviewName: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  itemPreviewQty: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  itemPreviewPrice: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.text,
    minWidth: 80,
    textAlign: 'right',
  },
  moreItems: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  priceCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  productName: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.sm,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  priceChangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
    gap: 4,
  },
  priceIncrease: {
    backgroundColor: `${colors.error}15`,
  },
  priceDecrease: {
    backgroundColor: `${colors.success}15`,
  },
  priceChangeText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  priceTimeline: {
    paddingLeft: spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    marginTop: 4,
    zIndex: 1,
  },
  timelineDotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  timelineContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    paddingBottom: spacing.sm,
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 16,
    bottom: 0,
    width: 2,
    backgroundColor: colors.borderLight,
  },
  timelineDate: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  timelinePrice: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
