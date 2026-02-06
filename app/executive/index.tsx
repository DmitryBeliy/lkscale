import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/localization';
import { Card } from '@/components/ui';
import {
  SalesTrendChart,
  CategoryPieChart,
  ExpenseBarChart,
  ProfitGauge,
  ExecutiveMetricCard,
} from '@/components/charts/ExecutiveCharts';
import {
  getFinancialSummary,
  getSalesTrends,
  getCategoryPerformance,
  getStorePerformance,
  mockStores,
} from '@/services/enterpriseService';
import { SalesTrend, CategoryPerformance, StorePerformance, FinancialSummary } from '@/types/enterprise';

type TimePeriod = '7days' | '30days' | 'quarter' | 'year';

export default function ExecutiveDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, typography, borderRadius, shadows, isDark } = useTheme();
  const { t, formatCurrency } = useLocalization();

  const [refreshing, setRefreshing] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30days');
  const [salesTrends, setSalesTrends] = useState<SalesTrend[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformance[]>([]);
  const [storePerformance, setStorePerformance] = useState<StorePerformance[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);

  const loadData = useCallback(() => {
    const days = timePeriod === '7days' ? 7 : timePeriod === '30days' ? 30 : timePeriod === 'quarter' ? 90 : 365;
    setSalesTrends(getSalesTrends(days));
    setCategoryPerformance(getCategoryPerformance());
    setStorePerformance(getStorePerformance());
    setFinancialSummary(getFinancialSummary(timePeriod === 'quarter' ? 'quarter' : timePeriod === 'year' ? 'year' : 'month'));
  }, [timePeriod]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await new Promise(resolve => setTimeout(resolve, 500));
    loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleNavigation = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(route as never);
  };

  const timePeriodOptions: { key: TimePeriod; label: string }[] = [
    { key: '7days', label: '7 дней' },
    { key: '30days', label: '30 дней' },
    { key: 'quarter', label: 'Квартал' },
    { key: 'year', label: 'Год' },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: spacing.md,
      paddingTop: insets.top + spacing.sm,
      paddingBottom: spacing.md,
    },
    headerGradient: {
      borderBottomLeftRadius: borderRadius.xl,
      borderBottomRightRadius: borderRadius.xl,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: typography.sizes.xl,
      fontWeight: '700',
      color: '#fff',
    },
    headerSubtitle: {
      fontSize: typography.sizes.sm,
      color: 'rgba(255,255,255,0.8)',
      marginTop: 2,
    },
    headerActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollContent: {
      padding: spacing.md,
      paddingBottom: spacing.xxl,
    },
    periodSelector: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.xs,
      marginBottom: spacing.lg,
      ...shadows.sm,
    },
    periodButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    periodButtonActive: {
      backgroundColor: colors.primary,
    },
    periodButtonText: {
      fontSize: typography.sizes.sm,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    periodButtonTextActive: {
      color: '#fff',
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: '600',
      color: colors.text,
    },
    seeAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    seeAllText: {
      fontSize: typography.sizes.sm,
      color: colors.primary,
      fontWeight: '500',
    },
    metricsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    gaugeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: spacing.md,
    },
    storeCard: {
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    storeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    storeName: {
      fontSize: typography.sizes.md,
      fontWeight: '600',
      color: colors.text,
    },
    storeMetrics: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    storeMetric: {
      alignItems: 'center',
    },
    storeMetricValue: {
      fontSize: typography.sizes.lg,
      fontWeight: '700',
      color: colors.text,
    },
    storeMetricLabel: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    quickActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    quickAction: {
      flex: 1,
      minWidth: '45%',
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.surface,
      alignItems: 'center',
      ...shadows.sm,
    },
    quickActionIcon: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    quickActionText: {
      fontSize: typography.sizes.sm,
      fontWeight: '500',
      color: colors.text,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      {/* Premium Header with Gradient */}
      <LinearGradient
        colors={isDark ? [colors.card, colors.background] : [colors.primary, colors.primaryDark]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.headerTitle}>{t.executive.dashboard}</Text>
              <Text style={styles.headerSubtitle}>MaGGaz12 Enterprise</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable style={styles.headerButton} onPress={() => handleNavigation('/cfo')}>
                <Ionicons name="sparkles" size={20} color="#fff" />
              </Pressable>
              <Pressable style={styles.headerButton} onPress={() => handleNavigation('/finance')}>
                <Ionicons name="wallet" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Time Period Selector */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={styles.periodSelector}>
            {timePeriodOptions.map((option) => (
              <Pressable
                key={option.key}
                style={[
                  styles.periodButton,
                  timePeriod === option.key && styles.periodButtonActive,
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setTimePeriod(option.key);
                }}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    timePeriod === option.key && styles.periodButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Key Metrics */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.section}>
          <View style={styles.metricsRow}>
            <ExecutiveMetricCard
              title={t.executive.grossProfit}
              value={formatCurrency(financialSummary?.grossRevenue || 0, true)}
              change={financialSummary?.previousPeriod?.growth}
              icon="trending-up"
              color={colors.success}
            />
            <ExecutiveMetricCard
              title={t.executive.netProfit}
              value={formatCurrency(financialSummary?.netProfit || 0, true)}
              change={12.5}
              icon="wallet"
              color={colors.primary}
            />
          </View>
          <View style={styles.metricsRow}>
            <ExecutiveMetricCard
              title={t.finance.expenses}
              value={formatCurrency(financialSummary?.totalExpenses || 0, true)}
              change={-5.2}
              icon="remove-circle"
              color={colors.error}
            />
            <ExecutiveMetricCard
              title={t.analytics.margin}
              value={`${(financialSummary?.netMargin || 0).toFixed(1)}%`}
              change={2.3}
              icon="analytics"
              color={colors.warning}
            />
          </View>
        </Animated.View>

        {/* Profit Margins */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.executive.profitMargins}</Text>
          </View>
          <Card>
            <View style={styles.gaugeContainer}>
              <ProfitGauge
                value={financialSummary?.grossMargin || 0}
                label="Валовая"
                color={colors.success}
                size={90}
              />
              <ProfitGauge
                value={(financialSummary?.grossMargin || 0) - 15}
                label="Операционная"
                color={colors.warning}
                size={90}
              />
              <ProfitGauge
                value={financialSummary?.netMargin || 0}
                label="Чистая"
                color={colors.primary}
                size={90}
              />
            </View>
          </Card>
        </Animated.View>

        {/* Sales Trends Chart */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.executive.salesTrends}</Text>
          </View>
          <SalesTrendChart data={salesTrends} showProfit height={220} />
        </Animated.View>

        {/* Category Performance */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.executive.categoryPerformance}</Text>
          </View>
          <CategoryPieChart data={categoryPerformance} size={160} showLegend />
        </Animated.View>

        {/* Expense Breakdown */}
        <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.executive.operatingExpenses}</Text>
            <Pressable style={styles.seeAllButton} onPress={() => handleNavigation('/finance')}>
              <Text style={styles.seeAllText}>{t.common.seeAll}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </Pressable>
          </View>
          <ExpenseBarChart data={financialSummary?.operatingExpenses || {
            rent: 0, salaries: 0, utilities: 0, taxes: 0, inventory: 0, marketing: 0,
            equipment: 0, supplies: 0, insurance: 0, maintenance: 0, delivery: 0, banking: 0, other: 0
          }} height={180} />
        </Animated.View>

        {/* Store Performance */}
        {mockStores.length > 1 && (
          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.enterprise.storePerformance}</Text>
              <Pressable style={styles.seeAllButton} onPress={() => handleNavigation('/stores')}>
                <Text style={styles.seeAllText}>{t.common.seeAll}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </Pressable>
            </View>
            {storePerformance.slice(0, 3).map((store, i) => (
              <Card key={store.storeId} style={styles.storeCard}>
                <View style={styles.storeHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: borderRadius.sm,
                        backgroundColor: `${colors.primary}15`,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: spacing.sm,
                      }}
                    >
                      <Ionicons name="storefront" size={18} color={colors.primary} />
                    </View>
                    <Text style={styles.storeName}>{store.storeName}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons
                      name={store.growth >= 0 ? 'trending-up' : 'trending-down'}
                      size={16}
                      color={store.growth >= 0 ? colors.success : colors.error}
                    />
                    <Text
                      style={{
                        fontSize: typography.sizes.sm,
                        fontWeight: '600',
                        color: store.growth >= 0 ? colors.success : colors.error,
                        marginLeft: 4,
                      }}
                    >
                      {store.growth >= 0 ? '+' : ''}{store.growth.toFixed(1)}%
                    </Text>
                  </View>
                </View>
                <View style={styles.storeMetrics}>
                  <View style={styles.storeMetric}>
                    <Text style={styles.storeMetricValue}>{formatCurrency(store.revenue, true)}</Text>
                    <Text style={styles.storeMetricLabel}>Выручка</Text>
                  </View>
                  <View style={styles.storeMetric}>
                    <Text style={styles.storeMetricValue}>{formatCurrency(store.profit, true)}</Text>
                    <Text style={styles.storeMetricLabel}>Прибыль</Text>
                  </View>
                  <View style={styles.storeMetric}>
                    <Text style={styles.storeMetricValue}>{store.orders}</Text>
                    <Text style={styles.storeMetricLabel}>Заказы</Text>
                  </View>
                  <View style={styles.storeMetric}>
                    <Text style={styles.storeMetricValue}>{formatCurrency(store.averageOrderValue, true)}</Text>
                    <Text style={styles.storeMetricLabel}>Ср. чек</Text>
                  </View>
                </View>
              </Card>
            ))}
          </Animated.View>
        )}

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(450).duration(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.dashboard.quickActions}</Text>
          </View>
          <View style={styles.quickActions}>
            <Pressable style={styles.quickAction} onPress={() => handleNavigation('/cfo')}>
              <View style={[styles.quickActionIcon, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name="sparkles" size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickActionText}>{t.aiCfo.virtualCFO}</Text>
            </Pressable>
            <Pressable style={styles.quickAction} onPress={() => handleNavigation('/finance')}>
              <View style={[styles.quickActionIcon, { backgroundColor: `${colors.success}15` }]}>
                <Ionicons name="wallet" size={24} color={colors.success} />
              </View>
              <Text style={styles.quickActionText}>{t.finance.expenses}</Text>
            </Pressable>
            <Pressable style={styles.quickAction} onPress={() => handleNavigation('/stores')}>
              <View style={[styles.quickActionIcon, { backgroundColor: `${colors.warning}15` }]}>
                <Ionicons name="business" size={24} color={colors.warning} />
              </View>
              <Text style={styles.quickActionText}>{t.enterprise.stores}</Text>
            </Pressable>
            <Pressable style={styles.quickAction} onPress={() => handleNavigation('/paywall')}>
              <View style={[styles.quickActionIcon, { backgroundColor: `${colors.gold}15` }]}>
                <Ionicons name="diamond" size={24} color={colors.gold} />
              </View>
              <Text style={styles.quickActionText}>{t.subscription.upgrade}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
