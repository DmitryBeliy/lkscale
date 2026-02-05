import React, { useEffect, useState, useCallback } from 'react';
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
import { ActivityItem } from '@/components/ActivityItem';
import { SyncStatusIndicator } from '@/components/SyncStatusIndicator';
import { getAuthState, subscribeAuth } from '@/store/authStore';
import {
  getDataState,
  subscribeData,
  fetchData,
} from '@/store/dataStore';
import {
  getNotificationState,
  subscribeNotifications,
  hasUnreadAIInsights,
} from '@/store/notificationStore';
import { useAIInsights } from '@/services/aiInsights';
import { useLocalization } from '@/localization';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { KPIData, Activity, SalesDataPoint } from '@/types';

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

  const {
    insights: aiInsights,
    isLoading: loadingInsights,
    generateInsights,
  } = useAIInsights();

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
  }, [generateInsights]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchData();
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
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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

        {/* Sales Chart */}
        <Animated.View entering={FadeInDown.delay(150).duration(500)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.dashboard.sales}</Text>
            <Pressable onPress={() => handleQuickAction('assistant')}>
              <View style={styles.aiAnalyzeButton}>
                <Ionicons name="sparkles" size={14} color={colors.primary} />
                <Text style={styles.aiAnalyzeText}>{t.dashboard.aiAnalysis}</Text>
              </View>
            </Pressable>
          </View>
          {isLoading ? (
            <SkeletonCard lines={5} />
          ) : (
            <SalesChart weekData={salesData.week} monthData={salesData.month} />
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
                  value={formatCurrency(kpi?.totalSales || 0, true)}
                  change={kpi?.salesChange}
                  icon="trending-up"
                  iconColor={colors.success}
                />
                <KPICard
                  title={t.dashboard.activeOrders}
                  value={`${kpi?.activeOrders || 0}`}
                  change={kpi?.ordersChange}
                  icon="cart"
                  iconColor={colors.primary}
                />
              </View>
              <View style={styles.kpiRow}>
                <KPICard
                  title={t.dashboard.balance}
                  value={formatCurrency(kpi?.balance || 0, true)}
                  change={kpi?.balanceChange}
                  icon="wallet"
                  iconColor={colors.warning}
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

        {/* AI Insights */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
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
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
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
        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
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
            ) : (
              activities.slice(0, 5).map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
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
    gap: spacing.sm,
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
});
