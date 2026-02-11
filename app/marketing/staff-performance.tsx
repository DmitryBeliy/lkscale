import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTextGeneration } from '@fastshot/ai';
import { Card, Button } from '@/components/ui';
import { useLocalization } from '@/localization';
import { getAuthState } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { StaffPerformanceReport, TeamRole } from '@/types';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

const ROLE_COLORS: Record<TeamRole, { gradient: [string, string]; text: string }> = {
  admin: { gradient: ['#FF6B6B', '#EE5A5A'], text: '#FF6B6B' },
  cashier: { gradient: ['#4ECDC4', '#45B7AF'], text: '#4ECDC4' },
  stock_manager: { gradient: ['#9B59B6', '#8E44AD'], text: '#9B59B6' },
};

const ROLE_ICONS: Record<TeamRole, keyof typeof Ionicons.glyphMap> = {
  admin: 'shield-checkmark',
  cashier: 'cash',
  stock_manager: 'cube',
};

export default function StaffPerformanceScreen() {
  const insets = useSafeAreaInsets();
  const { t, formatCurrency } = useLocalization();
  const [performance, setPerformance] = useState<StaffPerformanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  const { generateText } = useTextGeneration();
  const user = getAuthState().user;

  const loadPerformanceData = useCallback(async () => {
    if (!user) return;

    try {
      // Load team members with their performance data
      const { data: membersData, error: membersError } = await (supabase as any)
        .from('team_members')
        .select('*')
        .eq('owner_id', user.id)
        .eq('status', 'active');

      if (membersError) throw membersError;

      // Load shifts for the last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data: shiftsData, error: shiftsError } = await (supabase as any)
        .from('shifts')
        .select('*')
        .eq('owner_id', user.id)
        .gte('started_at', thirtyDaysAgo);

      if (shiftsError) throw shiftsError;

      // Load stock adjustments for stock managers
      const { data: adjustmentsData } = await supabase
        .from('stock_adjustments')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo);

      // Calculate performance for each team member
      const performanceData: StaffPerformanceReport[] = (membersData || []).map((member: any) => {
        const memberShifts = (shiftsData || []).filter((s: any) => s.team_member_id === member.id);

        const totalSales = memberShifts.reduce((sum: number, s: any) => sum + (s.sales_amount || 0), 0);
        const totalOrders = memberShifts.reduce((sum: number, s: any) => sum + (s.sales_count || 0), 0);
        const totalMinutes = memberShifts.reduce((sum: number, s: any) => sum + (s.duration_minutes || 0), 0);
        const totalHours = totalMinutes / 60;

        const stockAdjustments = member.role === 'stock_manager'
          ? (adjustmentsData || []).filter((a: any) => a.team_member_id === member.id).length
          : 0;

        return {
          teamMemberId: member.id,
          teamMemberName: member.name || member.email.split('@')[0],
          role: member.role as TeamRole,
          totalSales,
          totalOrders,
          averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
          totalHoursWorked: totalHours,
          salesPerHour: totalHours > 0 ? totalSales / totalHours : 0,
          stockAdjustments: stockAdjustments > 0 ? stockAdjustments : undefined,
          rank: 0,
          improvement: Math.random() * 40 - 10, // Mock improvement data
        };
      });

      // Sort by total sales and assign ranks
      performanceData.sort((a, b) => b.totalSales - a.totalSales);
      performanceData.forEach((p, i) => (p.rank = i + 1));

      setPerformance(performanceData);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadPerformanceData();
  }, [loadPerformanceData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPerformanceData();
  }, [loadPerformanceData]);

  const generateAIInsights = async () => {
    if (performance.length === 0) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setGeneratingInsights(true);

    try {
      const topPerformer = performance[0];
      const performanceSummary = performance
        .slice(0, 5)
        .map((p) => `${p.teamMemberName} (${p.role}): ${formatCurrency(p.totalSales)} sales, ${p.totalHoursWorked.toFixed(1)} hours`)
        .join('; ');

      const prompt = `Analyze this team performance data and provide brief insights (in Russian, 3-4 sentences max):
${performanceSummary}

Top performer: ${topPerformer.teamMemberName} with ${formatCurrency(topPerformer.totalSales)} in sales.

Provide actionable recommendations for improving overall team performance.`;

      const response = await generateText(prompt);
      setAiInsights(response || 'AI insights generated');
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setGeneratingInsights(false);
    }
  };

  const totalTeamSales = performance.reduce((sum, p) => sum + p.totalSales, 0);
  const totalTeamOrders = performance.reduce((sum, p) => sum + p.totalOrders, 0);
  const totalTeamHours = performance.reduce((sum, p) => sum + p.totalHoursWorked, 0);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: 'trophy', color: '#F59E0B', label: '1st' };
    if (rank === 2) return { icon: 'medal', color: '#94A3B8', label: '2nd' };
    if (rank === 3) return { icon: 'ribbon', color: '#CD7F32', label: '3rd' };
    return { icon: 'person', color: colors.textSecondary, label: `#${rank}` };
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>{t.staffPerformance.title}</Text>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={12} color="#F59E0B" />
            <Text style={styles.aiBadgeText}>AI Powered</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Team Summary */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.summaryCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.summaryTitle}>Team Performance (Last 30 Days)</Text>
            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryValue}>{formatCurrency(totalTeamSales)}</Text>
                <Text style={styles.summaryLabel}>{t.staffPerformance.totalSales}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryStat}>
                <Text style={styles.summaryValue}>{totalTeamOrders}</Text>
                <Text style={styles.summaryLabel}>{t.staffPerformance.ordersProcessed}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryStat}>
                <Text style={styles.summaryValue}>{totalTeamHours.toFixed(0)}h</Text>
                <Text style={styles.summaryLabel}>{t.staffPerformance.hoursWorked}</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* AI Insights */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Card style={styles.insightsCard}>
            <View style={styles.insightsHeader}>
              <Ionicons name="sparkles" size={20} color="#F59E0B" />
              <Text style={styles.insightsTitle}>AI Insights</Text>
            </View>

            {aiInsights ? (
              <Text style={styles.insightsText}>{aiInsights}</Text>
            ) : (
              <Text style={styles.insightsPlaceholder}>
                Generate AI-powered insights to understand your team performance better.
              </Text>
            )}

            <Button
              title={aiInsights ? 'Refresh Insights' : 'Generate Insights'}
              variant="outline"
              size="sm"
              onPress={generateAIInsights}
              loading={generatingInsights}
              icon={<Ionicons name="sparkles" size={16} color="#F59E0B" />}
              style={styles.insightsButton}
              textStyle={{ color: '#F59E0B' }}
            />
          </Card>
        </Animated.View>

        {/* Leaderboard */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Text style={styles.sectionTitle}>{t.staffPerformance.topSellers}</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>{t.common.loading}</Text>
            </View>
          ) : performance.length === 0 ? (
            <Card style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyTitle}>No team members</Text>
              <Text style={styles.emptySubtitle}>Add team members to track performance</Text>
            </Card>
          ) : (
            performance.map((member, index) => {
              const roleColors = ROLE_COLORS[member.role];
              const rankBadge = getRankBadge(member.rank);

              return (
                <Animated.View key={member.teamMemberId} entering={FadeInRight.delay(index * 80).duration(400)}>
                  <Card style={[styles.memberCard, member.rank <= 3 && styles.topMemberCard]}>
                    <View style={styles.memberHeader}>
                      {/* Rank Badge */}
                      <View style={[styles.rankBadge, { backgroundColor: `${rankBadge.color}20` }]}>
                        <Ionicons name={rankBadge.icon as any} size={16} color={rankBadge.color} />
                        <Text style={[styles.rankText, { color: rankBadge.color }]}>{rankBadge.label}</Text>
                      </View>

                      {/* Member Info */}
                      <LinearGradient colors={roleColors.gradient} style={styles.memberAvatar}>
                        <Ionicons name={ROLE_ICONS[member.role]} size={16} color="#fff" />
                      </LinearGradient>

                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{member.teamMemberName}</Text>
                        <Text style={styles.memberRole}>
                          {t.team.roles[member.role === 'stock_manager' ? 'stockManager' : member.role]}
                        </Text>
                      </View>

                      {/* Improvement Badge */}
                      <View
                        style={[
                          styles.improvementBadge,
                          {
                            backgroundColor:
                              member.improvement >= 0 ? `${colors.success}15` : `${colors.error}15`,
                          },
                        ]}
                      >
                        <Ionicons
                          name={member.improvement >= 0 ? 'trending-up' : 'trending-down'}
                          size={12}
                          color={member.improvement >= 0 ? colors.success : colors.error}
                        />
                        <Text
                          style={[
                            styles.improvementText,
                            { color: member.improvement >= 0 ? colors.success : colors.error },
                          ]}
                        >
                          {member.improvement >= 0 ? '+' : ''}{member.improvement.toFixed(0)}%
                        </Text>
                      </View>
                    </View>

                    {/* Performance Stats */}
                    <View style={styles.memberStats}>
                      <View style={styles.memberStat}>
                        <Text style={styles.memberStatValue}>{formatCurrency(member.totalSales)}</Text>
                        <Text style={styles.memberStatLabel}>{t.staffPerformance.totalSales}</Text>
                      </View>
                      <View style={styles.memberStat}>
                        <Text style={styles.memberStatValue}>{member.totalOrders}</Text>
                        <Text style={styles.memberStatLabel}>Orders</Text>
                      </View>
                      <View style={styles.memberStat}>
                        <Text style={styles.memberStatValue}>{member.totalHoursWorked.toFixed(1)}h</Text>
                        <Text style={styles.memberStatLabel}>Hours</Text>
                      </View>
                      <View style={styles.memberStat}>
                        <Text style={[styles.memberStatValue, { color: colors.success }]}>
                          {formatCurrency(member.salesPerHour)}
                        </Text>
                        <Text style={styles.memberStatLabel}>/hour</Text>
                      </View>
                    </View>

                    {member.stockAdjustments !== undefined && (
                      <View style={styles.stockAdjustments}>
                        <Ionicons name="swap-horizontal" size={14} color={colors.textSecondary} />
                        <Text style={styles.stockAdjustmentsText}>
                          {member.stockAdjustments} {t.staffPerformance.stockAdjustments.toLowerCase()}
                        </Text>
                      </View>
                    )}
                  </Card>
                </Animated.View>
              );
            })
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  aiBadgeText: {
    fontSize: typography.sizes.xs,
    color: '#F59E0B',
    fontWeight: '500',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  summaryCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: '#fff',
    marginBottom: spacing.md,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: '#fff',
  },
  summaryLabel: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: spacing.md,
  },
  insightsCard: {
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#F59E0B30',
    backgroundColor: '#F59E0B05',
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  insightsTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: '#F59E0B',
  },
  insightsText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  insightsPlaceholder: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  insightsButton: {
    borderColor: '#F59E0B',
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  memberCard: {
    marginBottom: spacing.sm,
  },
  topMemberCard: {
    borderWidth: 2,
    borderColor: '#F59E0B30',
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    marginRight: spacing.sm,
  },
  rankText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  memberName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  memberRole: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 2,
  },
  improvementText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  memberStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  memberStat: {
    alignItems: 'center',
  },
  memberStatValue: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  memberStatLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  stockAdjustments: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  stockAdjustmentsText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
});
