import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { useTextGeneration } from '@fastshot/ai';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { warehouseColors } from '@/components/warehouse';
import {
  ForecastIcon,
  SupplierIcon,
  PricingAlertIcon,
} from '@/components/warehouse/WarehouseIcons';
import { Button } from '@/components/ui/Button';
import { getSuppliers, getPurchaseOrders } from '@/services/warehouseService';
import { getDataState } from '@/store/dataStore';
import type {
  Product,
  Supplier,
  PurchaseOrder,
  ProcurementForecast,
  SupplierPerformance,
  PricingAlert,
} from '@/types';

type Tab = 'forecasts' | 'suppliers' | 'pricing';

export default function ForecastsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>('forecasts');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);

  // AI-generated insights
  const [forecasts, setForecasts] = useState<ProcurementForecast[]>([]);
  const [supplierPerformance, setSupplierPerformance] = useState<SupplierPerformance[]>([]);
  const [pricingAlerts, setPricingAlerts] = useState<PricingAlert[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');

  const { generateText, isLoading: isAiLoading } = useTextGeneration();

  const loadData = useCallback(async () => {
    try {
      const [productsData, suppliersData, ordersData] = await Promise.all([
        Promise.resolve(getDataState().products),
        getSuppliers(),
        getPurchaseOrders(),
      ]);

      setProducts(productsData);
      setSuppliers(suppliersData);
      setOrders(ordersData);

      // Calculate forecasts
      calculateForecasts(productsData, ordersData);
      calculateSupplierPerformance(suppliersData, ordersData);
      calculatePricingAlerts(productsData, ordersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-generate AI summary when data is loaded and there are actionable items
  useEffect(() => {
    if (!isLoading && !aiSummary && !isAiLoading) {
      const hasActionableItems = forecasts.length > 0 || pricingAlerts.length > 0;
      if (hasActionableItems) {
        // Auto-generate summary after a short delay
        const timer = setTimeout(() => {
          generateAISummary();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, forecasts.length, pricingAlerts.length]);

  const calculateForecasts = (products: Product[], orders: PurchaseOrder[]) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const forecasts: ProcurementForecast[] = products
      .filter((p) => p.isActive && p.stock > 0)
      .map((product) => {
        // Calculate sales velocity from orders
        const productOrders = orders.filter((o) =>
          o.items.some((item) => item.productId === product.id)
        );

        let totalSold = 0;
        productOrders.forEach((order) => {
          const item = order.items.find((i) => i.productId === product.id);
          if (item) totalSold += item.quantityOrdered;
        });

        const avgDailySales = totalSold / 30 || 0.1; // Default to minimal sales
        const daysUntilStockout =
          avgDailySales > 0 ? Math.floor(product.stock / avgDailySales) : 999;

        const recommendedOrderDate = new Date();
        recommendedOrderDate.setDate(
          recommendedOrderDate.getDate() + Math.max(0, daysUntilStockout - 7)
        );

        const recommendedQuantity = Math.ceil(avgDailySales * 30); // 30 days supply

        return {
          productId: product.id,
          productName: product.name,
          currentStock: product.stock,
          avgDailySales,
          daysUntilStockout,
          recommendedOrderDate: recommendedOrderDate.toISOString(),
          recommendedQuantity,
          confidence: Math.min(0.95, 0.5 + productOrders.length * 0.05),
        };
      })
      .filter((f) => f.daysUntilStockout <= 14)
      .sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);

    setForecasts(forecasts);
  };

  const calculateSupplierPerformance = (
    suppliers: Supplier[],
    orders: PurchaseOrder[]
  ) => {
    const performance: SupplierPerformance[] = suppliers
      .filter((s) => s.isActive)
      .map((supplier) => {
        const supplierOrders = orders.filter((o) => o.supplierId === supplier.id);
        const totalOrders = supplierOrders.length;
        const totalSpent = supplierOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const completedOrders = supplierOrders.filter(
          (o) => o.status === 'received'
        ).length;

        // Calculate average lead time
        let avgLeadTime = supplier.leadTimeDays;
        const deliveredOrders = supplierOrders.filter(
          (o) => o.receivedDate && o.createdAt
        );
        if (deliveredOrders.length > 0) {
          const totalDays = deliveredOrders.reduce((sum, o) => {
            const created = new Date(o.createdAt);
            const received = new Date(o.receivedDate!);
            return sum + Math.floor((received.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          }, 0);
          avgLeadTime = Math.round(totalDays / deliveredOrders.length);
        }

        const onTimeDeliveryRate =
          totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

        // Calculate avg margin based on products from this supplier
        const avgMargin = 25; // Placeholder

        let profitability: 'high' | 'medium' | 'low' = 'medium';
        if (avgMargin > 30) profitability = 'high';
        else if (avgMargin < 15) profitability = 'low';

        let recommendation: string | undefined;
        if (onTimeDeliveryRate >= 90 && avgMargin > 25) {
          recommendation = 'Отличный поставщик! Рекомендуем увеличить объемы.';
        } else if (onTimeDeliveryRate < 70) {
          recommendation = 'Низкая надежность поставок. Рассмотрите альтернативы.';
        } else if (avgMargin < 15) {
          recommendation = 'Низкая маржинальность. Пересмотрите условия.';
        }

        return {
          supplierId: supplier.id,
          supplierName: supplier.name,
          totalOrders,
          totalSpent,
          avgLeadTime,
          onTimeDeliveryRate,
          avgMargin,
          profitability,
          recommendation,
        };
      })
      .sort((a, b) => b.totalOrders - a.totalOrders);

    setSupplierPerformance(performance);
  };

  const calculatePricingAlerts = (products: Product[], orders: PurchaseOrder[]) => {
    const TARGET_MARGIN = 30; // 30% target margin

    const alerts: PricingAlert[] = products
      .filter((p) => p.isActive && p.costPrice > 0)
      .map((product) => {
        const currentMargin =
          ((product.price - product.costPrice) / product.price) * 100;
        const marginDiff = currentMargin - TARGET_MARGIN;

        let priority: 'high' | 'medium' | 'low' = 'low';
        if (currentMargin < 10) priority = 'high';
        else if (currentMargin < 20) priority = 'medium';

        const suggestedPrice = product.costPrice / (1 - TARGET_MARGIN / 100);

        return {
          productId: product.id,
          productName: product.name,
          currentCost: product.costPrice,
          previousCost: product.costPrice, // Would need historical data
          costChange: 0,
          costChangePercent: 0,
          currentMargin,
          targetMargin: TARGET_MARGIN,
          suggestedPrice,
          currentPrice: product.price,
          priority,
        };
      })
      .filter((a) => a.currentMargin < TARGET_MARGIN)
      .sort((a, b) => a.currentMargin - b.currentMargin);

    setPricingAlerts(alerts);
  };

  const generateAISummary = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Prepare detailed analysis data
    const urgentProducts = forecasts.filter(f => f.daysUntilStockout <= 3);
    const criticalMarginProducts = pricingAlerts.filter(a => a.currentMargin < 15);
    const topSupplier = supplierPerformance[0];
    const lowPerformingSuppliers = supplierPerformance.filter(s => s.onTimeDeliveryRate < 70);

    const prompt = `Ты — эксперт по управлению складом и закупками. Проанализируй данные и предоставь конкретные рекомендации на русском языке.

📦 ЗАПАСЫ:
- Товаров с критически низким запасом (≤3 дней): ${urgentProducts.length}
${urgentProducts.slice(0, 3).map(f => `  • ${f.productName}: осталось ${f.currentStock} шт., хватит на ${f.daysUntilStockout} дн.`).join('\n')}
- Товаров требующих пополнения (≤14 дней): ${forecasts.length}

💰 МАРЖИНАЛЬНОСТЬ:
- Товаров с критически низкой маржой (<15%): ${criticalMarginProducts.length}
${criticalMarginProducts.slice(0, 3).map(a => `  • ${a.productName}: маржа ${a.currentMargin.toFixed(0)}%, рекомендуемая цена ${a.suggestedPrice.toLocaleString('ru-RU')} ₽`).join('\n')}
- Всего товаров ниже целевой маржи (30%): ${pricingAlerts.length}

🏭 ПОСТАВЩИКИ:
${topSupplier ? `- Лучший поставщик: ${topSupplier.supplierName} (${topSupplier.onTimeDeliveryRate.toFixed(0)}% вовремя)` : '- Нет данных о поставщиках'}
${lowPerformingSuppliers.length > 0 ? `- Проблемные поставщики: ${lowPerformingSuppliers.map(s => s.supplierName).join(', ')}` : ''}

Дай краткий план действий (максимум 150 слов):
1. ⚡ Срочные действия (на сегодня)
2. 📈 Ценовые рекомендации
3. 🔄 Оптимизация поставок`;

    const result = await generateText(prompt);
    if (result) {
      setAiSummary(result);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleTabChange = (tab: Tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <Pressable
        style={[styles.tab, activeTab === 'forecasts' && styles.tabActive]}
        onPress={() => handleTabChange('forecasts')}
      >
        <ForecastIcon
          size={20}
          color={activeTab === 'forecasts' ? colors.primary : colors.textSecondary}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'forecasts' && styles.tabTextActive,
          ]}
        >
          Прогнозы
        </Text>
        {forecasts.length > 0 && (
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{forecasts.length}</Text>
          </View>
        )}
      </Pressable>

      <Pressable
        style={[styles.tab, activeTab === 'suppliers' && styles.tabActive]}
        onPress={() => handleTabChange('suppliers')}
      >
        <SupplierIcon
          size={20}
          color={activeTab === 'suppliers' ? colors.primary : colors.textSecondary}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'suppliers' && styles.tabTextActive,
          ]}
        >
          Поставщики
        </Text>
      </Pressable>

      <Pressable
        style={[styles.tab, activeTab === 'pricing' && styles.tabActive]}
        onPress={() => handleTabChange('pricing')}
      >
        <PricingAlertIcon
          size={20}
          color={activeTab === 'pricing' ? colors.warning : colors.textSecondary}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'pricing' && styles.tabTextActive,
          ]}
        >
          Цены
        </Text>
        {pricingAlerts.length > 0 && (
          <View style={[styles.tabBadge, { backgroundColor: colors.warning }]}>
            <Text style={styles.tabBadgeText}>{pricingAlerts.length}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );

  const renderForecastsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabDescription}>
        Товары, которые закончатся в ближайшие 14 дней
      </Text>

      {forecasts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle" size={48} color={colors.success} />
          <Text style={styles.emptyTitle}>Все в порядке!</Text>
          <Text style={styles.emptyText}>
            Нет товаров, требующих срочного пополнения
          </Text>
        </View>
      ) : (
        forecasts.map((forecast, index) => (
          <Animated.View
            key={forecast.productId}
            entering={SlideInUp.delay(index * 50)}
            style={[
              styles.forecastCard,
              forecast.daysUntilStockout <= 3 && styles.forecastCardUrgent,
            ]}
          >
            <View style={styles.forecastHeader}>
              <Text style={styles.forecastName} numberOfLines={1}>
                {forecast.productName}
              </Text>
              <View
                style={[
                  styles.daysBadge,
                  forecast.daysUntilStockout <= 3 && styles.daysBadgeUrgent,
                ]}
              >
                <Text
                  style={[
                    styles.daysBadgeText,
                    forecast.daysUntilStockout <= 3 && styles.daysBadgeTextUrgent,
                  ]}
                >
                  {forecast.daysUntilStockout} дн.
                </Text>
              </View>
            </View>

            <View style={styles.forecastDetails}>
              <View style={styles.forecastDetail}>
                <Text style={styles.detailLabel}>На складе</Text>
                <Text style={styles.detailValue}>{forecast.currentStock} шт.</Text>
              </View>
              <View style={styles.forecastDetail}>
                <Text style={styles.detailLabel}>Продаж/день</Text>
                <Text style={styles.detailValue}>
                  ~{forecast.avgDailySales.toFixed(1)}
                </Text>
              </View>
              <View style={styles.forecastDetail}>
                <Text style={styles.detailLabel}>Заказать</Text>
                <Text style={[styles.detailValue, { color: colors.primary }]}>
                  {forecast.recommendedQuantity} шт.
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.orderButton}
              onPress={() =>
                router.push(`/warehouse/stock_in?productId=${forecast.productId}`)
              }
            >
              <Text style={styles.orderButtonText}>Создать заказ</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </Pressable>
          </Animated.View>
        ))
      )}
    </View>
  );

  const renderSuppliersTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabDescription}>
        Анализ эффективности работы с поставщиками
      </Text>

      {supplierPerformance.length === 0 ? (
        <View style={styles.emptyState}>
          <SupplierIcon size={48} color={colors.textLight} />
          <Text style={styles.emptyTitle}>Нет данных</Text>
          <Text style={styles.emptyText}>
            Добавьте поставщиков для анализа
          </Text>
        </View>
      ) : (
        supplierPerformance.map((perf, index) => (
          <Animated.View
            key={perf.supplierId}
            entering={SlideInUp.delay(index * 50)}
            style={styles.supplierCard}
          >
            <View style={styles.supplierHeader}>
              <View style={styles.supplierInfo}>
                <Text style={styles.supplierName}>{perf.supplierName}</Text>
                <View
                  style={[
                    styles.profitabilityBadge,
                    perf.profitability === 'high' && styles.profitabilityHigh,
                    perf.profitability === 'low' && styles.profitabilityLow,
                  ]}
                >
                  <Text
                    style={[
                      styles.profitabilityText,
                      perf.profitability === 'high' && { color: colors.success },
                      perf.profitability === 'low' && { color: colors.error },
                    ]}
                  >
                    {perf.profitability === 'high'
                      ? 'Высокая прибыльность'
                      : perf.profitability === 'low'
                      ? 'Низкая прибыльность'
                      : 'Средняя прибыльность'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.supplierStats}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{perf.totalOrders}</Text>
                <Text style={styles.statLabel}>Заказов</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {perf.totalSpent.toLocaleString('ru-RU')} ₽
                </Text>
                <Text style={styles.statLabel}>Закупки</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{perf.avgLeadTime} дн.</Text>
                <Text style={styles.statLabel}>Ср. срок</Text>
              </View>
              <View style={styles.statBox}>
                <Text
                  style={[
                    styles.statValue,
                    perf.onTimeDeliveryRate >= 80
                      ? { color: colors.success }
                      : perf.onTimeDeliveryRate < 60
                      ? { color: colors.error }
                      : { color: colors.warning },
                  ]}
                >
                  {perf.onTimeDeliveryRate.toFixed(0)}%
                </Text>
                <Text style={styles.statLabel}>Вовремя</Text>
              </View>
            </View>

            {perf.recommendation && (
              <View style={styles.recommendation}>
                <Ionicons name="bulb" size={16} color={colors.primary} />
                <Text style={styles.recommendationText}>
                  {perf.recommendation}
                </Text>
              </View>
            )}
          </Animated.View>
        ))
      )}
    </View>
  );

  const renderPricingTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabDescription}>
        Товары с маржинальностью ниже целевой (30%)
      </Text>

      {pricingAlerts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle" size={48} color={colors.success} />
          <Text style={styles.emptyTitle}>Отлично!</Text>
          <Text style={styles.emptyText}>
            Все товары имеют достаточную маржинальность
          </Text>
        </View>
      ) : (
        pricingAlerts.map((alert, index) => (
          <Animated.View
            key={alert.productId}
            entering={SlideInUp.delay(index * 50)}
            style={[
              styles.alertCard,
              alert.priority === 'high' && styles.alertCardHigh,
            ]}
          >
            <View style={styles.alertHeader}>
              <Text style={styles.alertName} numberOfLines={1}>
                {alert.productName}
              </Text>
              {alert.priority === 'high' && (
                <Ionicons name="warning" size={20} color={colors.error} />
              )}
            </View>

            <View style={styles.alertDetails}>
              <View style={styles.alertDetail}>
                <Text style={styles.alertLabel}>Текущая маржа</Text>
                <Text
                  style={[
                    styles.alertValue,
                    { color: alert.currentMargin < 15 ? colors.error : colors.warning },
                  ]}
                >
                  {alert.currentMargin.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.alertDetail}>
                <Text style={styles.alertLabel}>Текущая цена</Text>
                <Text style={styles.alertValue}>
                  {alert.currentPrice.toLocaleString('ru-RU')} ₽
                </Text>
              </View>
              <View style={styles.alertDetail}>
                <Text style={styles.alertLabel}>Рекомендуемая</Text>
                <Text style={[styles.alertValue, { color: colors.success }]}>
                  {alert.suggestedPrice.toLocaleString('ru-RU', {
                    maximumFractionDigits: 0,
                  })}{' '}
                  ₽
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.adjustButton}
              onPress={() => router.push(`/product/edit/${alert.productId}`)}
            >
              <Text style={styles.adjustButtonText}>Изменить цену</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.warning} />
            </Pressable>
          </Animated.View>
        ))
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Анализ данных...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'AI Аналитика',
          headerLargeTitle: true,
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
        {/* AI Summary Card */}
        <Animated.View entering={FadeIn} style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIcon}>
              <Ionicons name="sparkles" size={24} color={colors.primary} />
            </View>
            <Text style={styles.summaryTitle}>AI Рекомендации</Text>
          </View>

          {aiSummary ? (
            <Text style={styles.summaryText}>{aiSummary}</Text>
          ) : (
            <Text style={styles.summaryPlaceholder}>
              Нажмите кнопку ниже для получения персонализированных рекомендаций
              на основе анализа ваших данных
            </Text>
          )}

          <Button
            title={aiSummary ? 'Обновить анализ' : 'Получить рекомендации'}
            onPress={generateAISummary}
            loading={isAiLoading}
            variant={aiSummary ? 'secondary' : 'primary'}
            style={{ width: '100%' }}
          />
        </Animated.View>

        {/* Tabs */}
        {renderTabs()}

        {/* Tab Content */}
        {activeTab === 'forecasts' && renderForecastsTab()}
        {activeTab === 'suppliers' && renderSuppliersTab()}
        {activeTab === 'pricing' && renderPricingTab()}

        <View style={{ height: insets.bottom + spacing.lg }} />
      </ScrollView>
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
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  summaryText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    lineHeight: typography.sizes.sm * 1.6,
    marginBottom: spacing.md,
  },
  summaryPlaceholder: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.sizes.sm * 1.5,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  tabsContainer: {
    flexDirection: 'row',
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
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
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
  tabBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textInverse,
  },
  tabContent: {
    gap: spacing.sm,
  },
  tabDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.sm,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  forecastCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    ...shadows.sm,
  },
  forecastCardUrgent: {
    borderLeftColor: colors.error,
  },
  forecastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  forecastName: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.sm,
  },
  daysBadge: {
    backgroundColor: `${colors.warning}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  daysBadgeUrgent: {
    backgroundColor: `${colors.error}20`,
  },
  daysBadgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.warning,
  },
  daysBadgeTextUrgent: {
    color: colors.error,
  },
  forecastDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  forecastDetail: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.primary}10`,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  orderButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  supplierCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  supplierHeader: {
    marginBottom: spacing.md,
  },
  supplierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  supplierName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  profitabilityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
  },
  profitabilityHigh: {
    backgroundColor: `${colors.success}15`,
  },
  profitabilityLow: {
    backgroundColor: `${colors.error}15`,
  },
  profitabilityText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  supplierStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${colors.primary}10`,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  recommendationText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.primary,
    lineHeight: typography.sizes.sm * 1.4,
  },
  alertCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    ...shadows.sm,
  },
  alertCardHigh: {
    borderLeftColor: colors.error,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  alertName: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.sm,
  },
  alertDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  alertDetail: {
    alignItems: 'center',
  },
  alertLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  alertValue: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  adjustButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.warning}15`,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  adjustButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.warning,
  },
});
