/**
 * PATCH INSTRUCTIONS for app/(tabs)/index.tsx (Dashboard)
 * 
 * These patches handle null values in stats for migrated data.
 */

// ============================================
// PATCH 1: Safe KPI display with null checks
// ============================================

// Update the KPI card rendering (around line 316):

<View style={styles.kpiRow}>
  <KPICard
    title={t.dashboard.totalSales}
    value={formatCurrency(advancedMetrics?.totalRevenue ?? kpi?.totalSales ?? 0, true)}
    change={kpi?.salesChange ?? 0}
    icon="trending-up"
    iconColor={colors.success}
  />
  <KPICard
    title={t.analytics.profit}
    value={formatCurrency(advancedMetrics?.totalProfit ?? 0, true)}
    icon="wallet"
    iconColor={colors.warning}
    subtitle={`${t.analytics.margin}: ${(advancedMetrics?.profitMargin ?? 0).toFixed(1)}%`}
  />
</View>

<View style={styles.kpiRow}>
  <KPICard
    title={t.dashboard.activeOrders}
    value={`${advancedMetrics?.totalOrders ?? kpi?.activeOrders ?? 0}`}
    change={kpi?.ordersChange ?? 0}
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

// ============================================
// PATCH 2: Safe analytics data calculation
// ============================================

// Wrap analytics update in try-catch and add null checks:

const updateAnalytics = useCallback(() => {
  try {
    const state = getDataState();
    if (!state?.orders?.length || !state?.products?.length) {
      setRevenueData([]);
      setCategoryData([]);
      return;
    }
    
    const revData = generateRevenueVsProfitData(state.orders, state.products, timePeriod);
    const catData = generateCategorySalesData(state.orders, state.products, timePeriod);
    
    setRevenueData(revData || []);
    setCategoryData(catData || []);
  } catch (error) {
    logger.error('Error updating analytics:', error);
    setRevenueData([]);
    setCategoryData([]);
  }
}, [timePeriod]);

// ============================================
// PATCH 3: Safe user name display
// ============================================

// Update the user name display (around line 207):

<Text style={styles.userName}>
  {user?.name?.trim() || 'Пользователь'}!
</Text>

// ============================================
// PATCH 4: Safe activity items rendering
// ============================================

// Update activity rendering (around line 487):

{isLoading ? (
  Array.from({ length: 3 }).map((_, i) => (
    <SkeletonCard key={i} lines={2} />
  ))
) : activities?.length > 0 ? (
  activities
    .filter((a): a is Activity => a != null && a.id != null)
    .slice(0, 5)
    .map((activity) => (
      <ActivityItem key={activity.id} activity={activity} />
    ))
) : (
  <EmptyState
    icon="time-outline"
    title={t.emptyStates.noOrders}
    description={t.emptyStates.noOrdersDesc}
  />
)}

// ============================================
// PATCH 5: Safe AI insights rendering
// ============================================

// Update AI insights rendering (around line 378):

{!loadingInsights && !isLoading && Array.isArray(aiInsights) && aiInsights.length > 0 ? (
  aiInsights
    .filter((insight): insight is NonNullable<typesof insight> => insight != null && insight.id != null)
    .map((insight) => (
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
          <Text style={styles.insightTitle}>{insight.title || 'Insight'}</Text>
        </View>
        <Text style={styles.insightDescription}>
          {insight.description || 'No description available'}
        </Text>
        {insight.actionable && insight.action && (
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
) : null}

// ============================================
// PATCH 6: Safe sales chart data
// ============================================

// Update sales chart rendering (around line 361):

{isLoading ? (
  <SkeletonCard lines={5} />
) : salesData?.week?.length > 0 || salesData?.month?.length > 0 ? (
  <SalesChart 
    weekData={salesData.week || []} 
    monthData={salesData.month || []} 
  />
) : (
  <Card style={styles.emptyChartCard}>
    <EmptyState
      icon="analytics-outline"
      title={t.analytics.noDataForPeriod}
      description={t.emptyStates.noOrdersDesc}
    />
  </Card>
)}
