import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui';
import { useLocalization } from '@/localization';
import { getAuthState } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { Shift, TeamMember } from '@/types';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

interface ShiftWithMember extends Shift {
  memberName?: string;
  memberEmail?: string;
}

export default function ShiftsScreen() {
  const insets = useSafeAreaInsets();
  const { t, formatCurrency, formatDate } = useLocalization();
  const [shifts, setShifts] = useState<ShiftWithMember[]>([]);
  const [activeShifts, setActiveShifts] = useState<ShiftWithMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const user = getAuthState().user;

  const loadShifts = useCallback(async () => {
    if (!user) return;

    try {
      // Load all shifts with team member info
      const { data: shiftsData, error: shiftsError } = await (supabase as any)
        .from('shifts')
        .select(`
          *,
          team_members (
            name,
            email
          )
        `)
        .eq('owner_id', user.id)
        .order('started_at', { ascending: false })
        .limit(50);

      if (shiftsError) throw shiftsError;

      const transformedShifts: ShiftWithMember[] = (shiftsData || []).map((s: any) => ({
        id: s.id,
        ownerId: s.owner_id,
        teamMemberId: s.team_member_id,
        startedAt: s.started_at,
        endedAt: s.ended_at || undefined,
        durationMinutes: s.duration_minutes || undefined,
        breakMinutes: s.break_minutes || 0,
        notes: s.notes || undefined,
        salesCount: s.sales_count || 0,
        salesAmount: s.sales_amount || 0,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
        memberName: s.team_members?.name,
        memberEmail: s.team_members?.email,
      }));

      // Separate active and completed shifts
      const active = transformedShifts.filter((s) => !s.endedAt);
      const completed = transformedShifts.filter((s) => s.endedAt);

      setActiveShifts(active);
      setShifts(completed);
    } catch (error) {
      console.error('Error loading shifts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadShifts();
  }, [loadShifts]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTimeRange = (start: string, end?: string) => {
    const startTime = new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!end) return `${startTime} - ...`;
    const endTime = new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${startTime} - ${endTime}`;
  };

  const totalHoursToday = [...activeShifts, ...shifts]
    .filter((s) => {
      const shiftDate = new Date(s.startedAt).toDateString();
      const today = new Date().toDateString();
      return shiftDate === today;
    })
    .reduce((sum, s) => {
      if (s.durationMinutes) return sum + s.durationMinutes;
      if (!s.endedAt) {
        const now = new Date();
        const start = new Date(s.startedAt);
        return sum + Math.floor((now.getTime() - start.getTime()) / 60000);
      }
      return sum;
    }, 0);

  const totalSalesToday = [...activeShifts, ...shifts]
    .filter((s) => {
      const shiftDate = new Date(s.startedAt).toDateString();
      const today = new Date().toDateString();
      return shiftDate === today;
    })
    .reduce((sum, s) => sum + s.salesAmount, 0);

  const renderShiftItem = ({ item, index }: { item: ShiftWithMember; index: number }) => {
    const isActive = !item.endedAt;

    return (
      <Animated.View entering={FadeInRight.delay(index * 50).duration(300)}>
        <Card style={[styles.shiftCard, isActive && styles.activeShiftCard]}>
          <View style={styles.shiftHeader}>
            <View style={styles.memberInfo}>
              <LinearGradient
                colors={isActive ? [colors.success, '#00B86B'] : [colors.textSecondary, colors.textLight]}
                style={styles.memberAvatar}
              >
                <Text style={styles.memberInitial}>
                  {(item.memberName || item.memberEmail || 'U').charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
              <View>
                <Text style={styles.memberName}>{item.memberName || item.memberEmail?.split('@')[0]}</Text>
                <Text style={styles.shiftTime}>
                  {formatDate(item.startedAt, 'short')} • {formatTimeRange(item.startedAt, item.endedAt)}
                </Text>
              </View>
            </View>

            <View style={[styles.shiftStatus, { backgroundColor: isActive ? `${colors.success}15` : colors.borderLight }]}>
              {isActive && (
                <View style={styles.activeDot} />
              )}
              <Text style={[styles.shiftStatusText, { color: isActive ? colors.success : colors.textSecondary }]}>
                {isActive ? 'Active' : 'Completed'}
              </Text>
            </View>
          </View>

          <View style={styles.shiftStats}>
            <View style={styles.shiftStat}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.shiftStatValue}>
                {item.durationMinutes ? formatDuration(item.durationMinutes) : '...'}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.shiftStat}>
              <Ionicons name="receipt-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.shiftStatValue}>{item.salesCount} orders</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.shiftStat}>
              <Ionicons name="cash-outline" size={16} color={colors.success} />
              <Text style={[styles.shiftStatValue, { color: colors.success, fontWeight: '600' }]}>
                {formatCurrency(item.salesAmount)}
              </Text>
            </View>
          </View>
        </Card>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>{t.team.shiftsHistory}</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <FlatList
        data={[...activeShifts, ...shifts]}
        keyExtractor={(item) => item.id}
        renderItem={renderShiftItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListHeaderComponent={
          <>
            {/* Today Summary */}
            <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Today Summary</Text>
              <View style={styles.summaryCards}>
                <Card style={styles.summaryCard}>
                  <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.summaryIcon}>
                    <Ionicons name="people" size={20} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.summaryValue}>{activeShifts.length}</Text>
                  <Text style={styles.summaryLabel}>Active Now</Text>
                </Card>

                <Card style={styles.summaryCard}>
                  <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.summaryIcon}>
                    <Ionicons name="time" size={20} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.summaryValue}>{formatDuration(totalHoursToday)}</Text>
                  <Text style={styles.summaryLabel}>Total Hours</Text>
                </Card>

                <Card style={styles.summaryCard}>
                  <LinearGradient colors={[colors.success, '#00B86B']} style={styles.summaryIcon}>
                    <Ionicons name="trending-up" size={20} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.summaryValue}>{formatCurrency(totalSalesToday)}</Text>
                  <Text style={styles.summaryLabel}>Sales Today</Text>
                </Card>
              </View>
            </Animated.View>

            {/* Active Shifts Section Header */}
            {activeShifts.length > 0 && (
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.activeDotLarge} />
                  <Text style={styles.sectionTitle}>{t.team.currentShift}</Text>
                </View>
                <Text style={styles.sectionSubtitle}>{activeShifts.length} active</Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{t.common.loading}</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="calendar-outline" size={48} color={colors.textLight} />
              </View>
              <Text style={styles.emptyTitle}>No shifts recorded</Text>
              <Text style={styles.emptySubtitle}>Shift data will appear here</Text>
            </View>
          )
        }
      />
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
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  summarySection: {
    marginBottom: spacing.lg,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  summaryValue: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  summaryLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  activeDotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
  },
  shiftCard: {
    marginBottom: spacing.sm,
  },
  activeShiftCard: {
    borderWidth: 2,
    borderColor: colors.success,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInitial: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: '#fff',
  },
  memberName: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  shiftTime: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  shiftStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  shiftStatusText: {
    fontSize: typography.sizes.xs,
    fontWeight: '500',
  },
  shiftStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  shiftStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  shiftStatValue: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.borderLight,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
