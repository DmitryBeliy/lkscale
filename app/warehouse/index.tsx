import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import {
  OperationGridCard,
  WarehouseScanner,
  warehouseColors,
} from '@/components/warehouse';
import {
  ScannerIcon,
  SupplierIcon,
  PurchaseOrderIcon,
  PriceTagIcon,
  ForecastIcon,
} from '@/components/warehouse/WarehouseIcons';
import { getSuppliers, getPurchaseOrders, getStockAdjustments } from '@/services/warehouseService';
import { getDataState, getProductByBarcode } from '@/store/dataStore';
import type { WarehouseOperation, Product } from '@/types';

export default function WarehouseScreen() {
  const insets = useSafeAreaInsets();
  const [showScanner, setShowScanner] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    totalSuppliers: 0,
    todayAdjustments: 0,
  });

  const loadStats = useCallback(async () => {
    try {
      const products = getDataState().products;
      const [suppliers, orders, adjustments] = await Promise.all([
        getSuppliers(),
        getPurchaseOrders(),
        getStockAdjustments(),
      ]);

      const today = new Date().toDateString();
      const todayAdjustments = adjustments.filter(
        (a) => new Date(a.createdAt).toDateString() === today
      ).length;

      setStats({
        totalProducts: products.length,
        lowStockProducts: products.filter((p: Product) => p.stock <= p.minStock).length,
        pendingOrders: orders.filter(
          (o) => o.status === 'pending' || o.status === 'ordered'
        ).length,
        totalSuppliers: suppliers.filter((s) => s.isActive).length,
        todayAdjustments,
      });
    } catch (error) {
      console.error('Error loading warehouse stats:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadStats();
  };

  const handleOperationPress = (operation: WarehouseOperation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push(`/warehouse/${operation}`);
  };

  const handleScannerOpen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowScanner(true);
  };

  const handleScan = async (data: string, type: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Try to find product by barcode
    const product = getProductByBarcode(data);
    if (product) {
      router.push(`/product/${product.id}`);
    } else {
      // Show option to create new product with this barcode
      router.push(`/warehouse/stock_in?barcode=${data}`);
    }
  };

  const handleQuickAction = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    switch (action) {
      case 'suppliers':
        router.push('/suppliers');
        break;
      case 'orders':
        router.push('/warehouse/orders');
        break;
      case 'price-tags':
        router.push('/warehouse/price-tags');
        break;
      case 'forecasts':
        router.push('/warehouse/forecasts');
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Склад',
          headerLargeTitle: true,
          headerRight: () => (
            <Pressable onPress={handleScannerOpen} style={styles.headerButton}>
              <ScannerIcon size={28} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Quick Scanner Button */}
        <Animated.View entering={FadeIn}>
          <Pressable
            style={styles.scannerBanner}
            onPress={handleScannerOpen}
          >
            <View style={styles.scannerIconContainer}>
              <ScannerIcon size={32} color={warehouseColors.scan} />
            </View>
            <View style={styles.scannerBannerContent}>
              <Text style={styles.scannerBannerTitle}>Быстрое сканирование</Text>
              <Text style={styles.scannerBannerSubtitle}>
                Найти товар или добавить на склад
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={warehouseColors.scan} />
          </Pressable>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View entering={SlideInUp.delay(100)} style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalProducts}</Text>
            <Text style={styles.statLabel}>Товаров</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.warning }]}>
              {stats.lowStockProducts}
            </Text>
            <Text style={styles.statLabel}>Мало на складе</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {stats.pendingOrders}
            </Text>
            <Text style={styles.statLabel}>Ожидают</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.todayAdjustments}</Text>
            <Text style={styles.statLabel}>Сегодня</Text>
          </View>
        </Animated.View>

        {/* Operations Grid */}
        <Animated.View entering={SlideInUp.delay(200)}>
          <Text style={styles.sectionTitle}>Складские операции</Text>
          <View style={styles.operationsGrid}>
            <OperationGridCard
              operation="stock_in"
              onPress={() => handleOperationPress('stock_in')}
            />
            <OperationGridCard
              operation="write_off"
              onPress={() => handleOperationPress('write_off')}
            />
          </View>
          <View style={styles.operationsGrid}>
            <OperationGridCard
              operation="transfer"
              onPress={() => handleOperationPress('transfer')}
            />
            <OperationGridCard
              operation="return"
              onPress={() => handleOperationPress('return')}
            />
          </View>
          <View style={styles.operationsGrid}>
            <OperationGridCard
              operation="adjustment"
              onPress={() => handleOperationPress('adjustment')}
            />
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={SlideInUp.delay(300)}>
          <Text style={styles.sectionTitle}>Быстрые действия</Text>
          <View style={styles.quickActionsContainer}>
            <Pressable
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('suppliers')}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <SupplierIcon size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickActionTitle}>Поставщики</Text>
              <Text style={styles.quickActionSubtitle}>
                {stats.totalSuppliers} активных
              </Text>
            </Pressable>

            <Pressable
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('orders')}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: `${colors.success}15` },
                ]}
              >
                <PurchaseOrderIcon size={24} color={colors.success} />
              </View>
              <Text style={styles.quickActionTitle}>Заказы</Text>
              <Text style={styles.quickActionSubtitle}>
                {stats.pendingOrders} в обработке
              </Text>
            </Pressable>

            <Pressable
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('price-tags')}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: `${colors.warning}15` },
                ]}
              >
                <PriceTagIcon size={24} color={colors.warning} />
              </View>
              <Text style={styles.quickActionTitle}>Ценники</Text>
              <Text style={styles.quickActionSubtitle}>Печать ценников</Text>
            </Pressable>

            <Pressable
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('forecasts')}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: `${warehouseColors.scan}15` },
                ]}
              >
                <ForecastIcon size={24} color={warehouseColors.scan} />
              </View>
              <Text style={styles.quickActionTitle}>Прогнозы</Text>
              <Text style={styles.quickActionSubtitle}>AI аналитика</Text>
            </Pressable>
          </View>
        </Animated.View>

        <View style={{ height: insets.bottom + spacing.lg }} />
      </ScrollView>

      {/* Scanner Modal */}
      <WarehouseScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
        title="Сканирование товара"
        description="Наведите на штрих-код для поиска или приемки"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  scannerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${warehouseColors.scan}15`,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: warehouseColors.scan,
    padding: spacing.md,
    gap: spacing.md,
  },
  scannerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerBannerContent: {
    flex: 1,
  },
  scannerBannerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: warehouseColors.scan,
  },
  scannerBannerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  operationsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickActionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  quickActionSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
