import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card, SkeletonKPICard, SkeletonCard } from '@/components/ui';
import { KPICard } from '@/components/KPICard';
import { SalesChart } from '@/components/charts/SalesChart';
import {
  TimePeriodSelector,
  RevenueVsProfitChart,
  CategoryPieChart,
  EmptyState,
} from '@/components/charts/AnalyticsCharts';
import { ActivityItem } from '@/components/ActivityItem';
import { SyncStatusIndicator } from '@/components/SyncStatusIndicator';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { getAuthState, subscribeAuth } from '@/store/authStore';
import {
  getDataState,
  subscribeData,
  fetchData,
  syncAll,
} from '@/store/dataStore';
import {
  getNotificationState,
  subscribeNotifications,
  hasUnreadAIInsights,
} from '@/store/notificationStore';
import {
  generateRevenueVsProfitData,
  generateCategorySalesData,
  calculateAdvancedMetrics,
} from '@/services/analyticsService';
import { useAIInsights } from '@/services/aiInsights';
import { useLocalization } from '@/localization';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { KPIData, Activity, SalesDataPoint, TimePeriod, RevenueVsProfitData, CategorySalesData } from '@/types';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { t, formatCurrency } = useLocalization();
  const [user, setUser] = useState(getAuthState().user);
  const [kpi, setKpi] = useState<KPIData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [salesData, setSalesData] = useState<{ week: SalesDataPoint[]; month: SalesDataPoint[] }>({
    week: [],
    month: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [hasAIInsight, setHasAIInsight] = useState(false);

  // Analytics state
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('7days');
  const [revenueData, setRevenueData] = useState<RevenueVsProfitData[]>([]);
  const [categoryData, setCategoryData] = useState<CategorySalesData[]>([]);

  const {
    insights: aiInsights,
    isLoading: loadingInsights,
    generateInsights,
  } = useAIInsights();

  // Calculate analytics when data changes
  const updateAnalytics = useCallback(() => {
    const state = getDataState();
    if (state.orders.length > 0 && state.products.length > 0) {
      const revData = generateRevenueVsProfitData(state.orders, state.products, timePeriod);
      const catData = generateCategorySalesData(state.orders, state.products, timePeriod);
      setRevenueData(revData);
      setCategoryData(catData);
    }
  }, [timePeriod]);

  useEffect(() => {
    const unsubAuth = subscribeAuth(() => {
      setUser(getAuthState().user);
    });

    const unsubData = subscribeData(() => {
      const state = getDataState();
      setKpi(state.kpi);
      setActivities(state.activities);
      setSalesData(state.salesData);
      setIsLoading(state.isLoading);

      // Generate AI insights when data is loaded
      if (!state.isLoading && state.kpi) {
        generateInsights({
          kpi: state.kpi,
          orders: state.orders,
          products: state.products,
        });
        updateAnalytics();
      }
    });

    const unsubNotifications = subscribeNotifications(() => {
      const state = getNotificationState();
      setUnreadNotifications(state.unreadCount);
      setHasAIInsight(hasUnreadAIInsights());
    });

    // Initial state
    const notificationState = getNotificationState();
    setUnreadNotifications(notificationState.unreadCount);
    setHasAIInsight(hasUnreadAIInsights());

    fetchData();

    return () => {
      unsubAuth();
      unsubData();
      unsubNotifications();
    };
  }, [generateInsights, updateAnalytics]);

  // Update analytics when time period changes
  useEffect(() => {
    updateAnalytics();
  }, [timePeriod, updateAnalytics]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      // Try to use syncAll first for full data sync
      await syncAll();
    } catch {
      // Fallback to fetchData if syncAll fails
      await fetchData();
    }
    setRefreshing(false);
  }, []);

  const handleQuickAction = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    switch (action) {
      case 'orders':
        router.push('/(tabs)/orders');
        break;
      case 'inventory':
        router.push('/(tabs)/inventory');
        break;
      case 'profile':
        router.push('/(tabs)/profile');
        break;
      case 'newOrder':
        router.push('/order/create');
        break;
      case 'assistant':
        router.push('/(tabs)/assistant');
        break;
      case 'customers':
        router.push('/customers/');
        break;
      case 'notifications':
        router.push('/notifications');
        break;
      case 'settings':
        router.push('/settings/store');
        break;
    }
  };

  // Calculate advanced metrics for display
  const advancedMetrics = useMemo(() => {
    const state = getDataState();
    return calculateAdvancedMetrics(state.orders, state.products, timePeriod);
  }, [timePeriod]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Offline Banner */}
      <OfflineBanner />

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
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={28} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.greeting}>{t.dashboard.greeting}</Text>
              <Text style={styles.userName}>{user?.name || 'Пользователь'}!</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <SyncStatusIndicator />
            <Pressable
              style={styles.settingsButton}
              onPress={() => handleQuickAction('settings')}
            >
              <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              style={styles.notificationButton}
              onPress={() => handleQuickAction('notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
              {unreadNotifications > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </Animated.View>

        {/* AI Insight Banner */}
        {hasAIInsight && (
          <Animated.View entering={FadeInDown.delay(120).duration(500)}>
            <Pressable
              style={styles.aiInsightBanner}
              onPress={() => handleQuickAction('notifications')}
            >
              <View style={styles.aiInsightIcon}>
                <Ionicons name="sparkles" size={20} color={colors.primary} />
              </View>
              <Text style={styles.aiInsightText}>{t.dashboard.aiInsightAvailable}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.primary} />
            </Pressable>
          </Animated.View>
        )}

        {/* Time Period Selector */}
        <Animated.View entering={FadeInDown.delay(140).duration(500)}>
          <TimePeriodSelector selected={timePeriod} onSelect={setTimePeriod} />
        </Animated.View>

        {/* Revenue vs Profit Chart */}
        <Animated.View entering={FadeInDown.delay(160).duration(500)} style={styles.chartSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.analytics.revenueVsProfit}</Text>
            <Pressable onPress={() => handleQuickAction('assistant')}>
              <View style={styles.aiAnalyzeButton}>
                <Ionicons name="sparkles" size={14} color={colors.primary} />
                <Text style={styles.aiAnalyzeText}>{t.dashboard.aiAnalysis}</Text>
              </View>
            </Pressable>
          </View>
          {isLoading ? (
            <SkeletonCard lines={6} />
          ) : revenueData.length > 0 ? (
            <RevenueVsProfitChart data={revenueData} />
          ) : (
            <Card style={styles.emptyChartCard}>
              <EmptyState
                icon="analytics-outline"
                title={t.analytics.noDataForPeriod}
                description={t.emptyStates.noOrdersDesc}
                action={{
                  label: t.dashboard.newOrder,
                  onPress: () => handleQuickAction('newOrder'),
                }}
              />
            </Card>
          )}
        </Animated.View>

        {/* Sales by Category */}
        <Animated.View entering={FadeInDown.delay(180).duration(500)} style={styles.chartSection}>
          <Text style={styles.sectionTitle}>{t.analytics.salesByCategory}</Text>
          {isLoading ? (
            <SkeletonCard lines={5} />
          ) : categoryData.length > 0 ? (
            <CategoryPieChart data={categoryData} />
          ) : (
            <Card style={styles.emptyChartCard}>
              <EmptyState
                icon="pie-chart-outline"
                title={t.analytics.noDataForPeriod}
                description={t.emptyStates.noOrdersDesc}
              />
            </Card>
          )}
        </Animated.View>

        {/* KPI Cards */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles.sectionTitle}>{t.dashboard.metrics}</Text>
          {isLoading ? (
            <View style={styles.kpiRow}>
              <View style={styles.kpiCardSkeleton}>
                <SkeletonKPICard />
              </View>
              <View style={styles.kpiCardSkeleton}>
                <SkeletonKPICard />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.kpiRow}>
                <KPICard
                  title={t.dashboard.totalSales}
                  value={formatCurrency(advancedMetrics.totalRevenue, true)}
                  change={kpi?.salesChange}
                  icon="trending-up"
                  iconColor={colors.success}
                />
                <KPICard
                  title={t.analytics.profit}
                  value={formatCurrency(advancedMetrics.totalProfit, true)}
                  icon="wallet"
                  iconColor={colors.warning}
                  subtitle={`${t.analytics.margin}: ${advancedMetrics.profitMargin.toFixed(1)}%`}
                />
              </View>
              <View style={styles.kpiRow}>
                <KPICard
                  title={t.dashboard.activeOrders}
                  value={`${advancedMetrics.totalOrders}`}
                  change={kpi?.ordersChange}
                  icon="cart"
                  iconColor={colors.primary}
                />
                <KPICard
                  title={t.dashboard.lowStock}
                  value={`${kpi?.lowStockItems || 0} ${t.dashboard.lowStockItems}`}
                  icon="warning"
                  iconColor={colors.error}
                  onPress={() => handleQuickAction('inventory')}
                />
              </View>
            </>
          )}
        </Animated.View>

        {/* Traditional Sales Chart */}
        <Animated.View entering={FadeInDown.delay(220).duration(500)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.dashboard.sales}</Text>
          </View>
          {isLoading ? (
            <SkeletonCard lines={5} />
          ) : (
            <SalesChart weekData={salesData.week} monthData={salesData.month} />
          )}
        </Animated.View>

        {/* AI Insights */}
        <Animated.View entering={FadeInDown.delay(260).duration(500)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.dashboard.smartTips}</Text>
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={14} color={colors.primary} />
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>
          </View>

          {loadingInsights || isLoading ? (
            <SkeletonCard lines={2} />
          ) : (
            aiInsights.map((insight) => (
              <Card key={insight.id} style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <View
                    style={[
                      styles.insightIcon,
                      insight.type === 'recommendation' && styles.insightIconRecommendation,
                      insight.type === 'alert' && styles.insightIconAlert,
                    ]}
                  >
                    <Ionicons
                      name={
                        insight.type === 'trend'
                          ? 'analytics'
                          : insight.type === 'recommendation'
                          ? 'bulb'
                          : 'alert-circle'
                      }
                      size={18}
                      color={
                        insight.type === 'trend'
                          ? colors.primary
                          : insight.type === 'recommendation'
                          ? colors.warning
                          : colors.error
                      }
                    />
                  </View>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                </View>
                <Text style={styles.insightDescription}>{insight.description}</Text>
                {insight.actionable && (
                  <Pressable
                    style={styles.insightAction}
                    onPress={() => handleQuickAction('inventory')}
                  >
                    <Text style={styles.insightActionText}>{insight.action}</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                  </Pressable>
                )}
              </Card>
            ))
          )}
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.sectionTitle}>{t.dashboard.quickActions}</Text>
          <View style={styles.quickActions}>
            <Pressable
              style={[styles.quickActionCard, styles.primaryAction]}
              onPress={() => handleQuickAction('newOrder')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name="add-circle" size={24} color={colors.textInverse} />
              </View>
              <Text style={[styles.quickActionText, { color: colors.textInverse }]}>{t.dashboard.newOrder}</Text>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
            </Pressable>

            <Pressable
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('orders')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name="receipt" size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickActionText}>{t.dashboard.myOrders}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </Pressable>

            <Pressable
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('customers')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: `${colors.success}15` }]}>
                <Ionicons name="people" size={24} color={colors.success} />
              </View>
              <Text style={styles.quickActionText}>{t.nav.customers}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </Pressable>

            <Pressable
              style={styles.quickActionCard}
              onPress={() => handleQuickAction('inventory')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: `${colors.warning}15` }]}>
                <Ionicons name="cube" size={24} color={colors.warning} />
              </View>
              <Text style={styles.quickActionText}>{t.dashboard.warehouse}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </Pressable>
          </View>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View entering={FadeInDown.delay(340).duration(500)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.dashboard.recentActivity}</Text>
            <Pressable onPress={() => handleQuickAction('orders')}>
              <Text style={styles.seeAllText}>{t.common.seeAll}</Text>
            </Pressable>
          </View>

          <Card style={styles.activityCard}>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} lines={2} />
              ))
            ) : activities.length > 0 ? (
              activities.slice(0, 5).map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <EmptyState
                icon="time-outline"
                title={t.emptyStates.noOrders}
                description={t.emptyStates.noOrdersDesc}
              />
            )}
          </Card>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  greeting: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textInverse,
  },
  aiInsightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}10`,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  aiInsightIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  aiInsightText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.text,
  },
  chartSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  seeAllText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  aiAnalyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  aiAnalyzeText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.primary,
  },
  kpiRow: {
    flexDirection: 'row',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.xs,
  },
  kpiCardSkeleton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  aiBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.primary,
  },
  insightCard: {
    marginBottom: spacing.sm,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  insightIconRecommendation: {
    backgroundColor: `${colors.warning}15`,
  },
  insightIconAlert: {
    backgroundColor: `${colors.error}15`,
  },
  insightTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  insightDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.sizes.sm * 1.5,
  },
  insightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  insightActionText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.primary,
    marginRight: spacing.xs,
  },
  quickActions: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  primaryAction: {
    backgroundColor: colors.primary,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  quickActionText: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  activityCard: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  emptyChartCard: {
    paddingVertical: spacing.md,
  },
});
