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
import { ActivityLogEntry, ActivityActionType } from '@/types';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

const ACTION_CONFIG: Record<ActivityActionType, { icon: keyof typeof Ionicons.glyphMap; color: string; bgColor: string }> = {
  order_created: { icon: 'add-circle', color: colors.success, bgColor: `${colors.success}15` },
  order_completed: { icon: 'checkmark-circle', color: colors.success, bgColor: `${colors.success}15` },
  order_cancelled: { icon: 'close-circle', color: colors.error, bgColor: `${colors.error}15` },
  order_deleted: { icon: 'trash', color: colors.error, bgColor: `${colors.error}15` },
  product_created: { icon: 'cube', color: colors.primary, bgColor: `${colors.primary}15` },
  product_updated: { icon: 'create', color: colors.primary, bgColor: `${colors.primary}15` },
  product_deleted: { icon: 'trash', color: colors.error, bgColor: `${colors.error}15` },
  price_changed: { icon: 'pricetag', color: '#F59E0B', bgColor: '#F59E0B15' },
  stock_adjusted: { icon: 'swap-horizontal', color: '#8B5CF6', bgColor: '#8B5CF615' },
  customer_created: { icon: 'person-add', color: colors.primary, bgColor: `${colors.primary}15` },
  customer_updated: { icon: 'person', color: colors.primary, bgColor: `${colors.primary}15` },
  coupon_created: { icon: 'ticket', color: '#EC4899', bgColor: '#EC489915' },
  coupon_used: { icon: 'ticket', color: colors.success, bgColor: `${colors.success}15` },
  shift_started: { icon: 'log-in', color: colors.success, bgColor: `${colors.success}15` },
  shift_ended: { icon: 'log-out', color: colors.textSecondary, bgColor: `${colors.textSecondary}15` },
  team_member_invited: { icon: 'mail', color: colors.primary, bgColor: `${colors.primary}15` },
  team_member_updated: { icon: 'person', color: colors.primary, bgColor: `${colors.primary}15` },
  team_member_removed: { icon: 'person-remove', color: colors.error, bgColor: `${colors.error}15` },
  settings_changed: { icon: 'settings', color: colors.textSecondary, bgColor: `${colors.textSecondary}15` },
  other: { icon: 'ellipsis-horizontal', color: colors.textSecondary, bgColor: `${colors.textSecondary}15` },
};

interface ActivityItemProps {
  item: ActivityLogEntry;
  index: number;
  formatDate: (date: string | Date, format?: 'short' | 'long' | 'relative') => string;
  t: any;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ item, index, formatDate, t }) => {
  const config = ACTION_CONFIG[item.actionType] || ACTION_CONFIG.other;
  const actionKey = item.actionType.replace(/_/g, '') as string;

  return (
    <Animated.View entering={FadeInRight.delay(index * 50).duration(300)}>
      <View style={styles.activityItem}>
        <View style={[styles.activityIcon, { backgroundColor: config.bgColor }]}>
          <Ionicons name={config.icon} size={18} color={config.color} />
        </View>

        <View style={styles.activityContent}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityActor}>{item.actorName}</Text>
            {item.actorRole && (
              <View style={styles.actorRoleBadge}>
                <Text style={styles.actorRoleText}>{item.actorRole}</Text>
              </View>
            )}
          </View>
          <Text style={styles.activityDescription}>{item.description}</Text>
          {item.entityName && (
            <Text style={styles.activityEntity}>→ {item.entityName}</Text>
          )}
          <Text style={styles.activityTime}>{formatDate(item.createdAt, 'relative')}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

export default function ActivityLogScreen() {
  const insets = useSafeAreaInsets();
  const { t, formatDate } = useLocalization();
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<ActivityActionType | 'all'>('all');

  const user = getAuthState().user;

  const loadActivities = useCallback(async () => {
    if (!user) return;

    try {
      let query = (supabase as any)
        .from('activity_logs')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (filterType !== 'all') {
        query = query.eq('action_type', filterType);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedActivities: ActivityLogEntry[] = (data || []).map((a: any) => ({
        id: a.id,
        ownerId: a.owner_id,
        teamMemberId: a.team_member_id || undefined,
        actorName: a.actor_name,
        actorRole: a.actor_role || undefined,
        actionType: a.action_type as ActivityActionType,
        description: a.description,
        entityType: a.entity_type || undefined,
        entityId: a.entity_id || undefined,
        entityName: a.entity_name || undefined,
        oldValue: a.old_value || undefined,
        newValue: a.new_value || undefined,
        metadata: a.metadata || undefined,
        createdAt: a.created_at,
      }));

      setActivities(transformedActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, filterType]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadActivities();
  }, [loadActivities]);

  const filterOptions: { value: ActivityActionType | 'all'; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: 'all', label: t.activityLog.allActivity, icon: 'list' },
    { value: 'order_created', label: t.activityLog.actions.orderCreated, icon: 'add-circle' },
    { value: 'price_changed', label: t.activityLog.actions.priceChanged, icon: 'pricetag' },
    { value: 'stock_adjusted', label: t.activityLog.actions.stockAdjusted, icon: 'swap-horizontal' },
  ];

  const groupActivitiesByDate = (items: ActivityLogEntry[]) => {
    const groups: { [key: string]: ActivityLogEntry[] } = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    items.forEach((item) => {
      const itemDate = new Date(item.createdAt).toDateString();
      let key = itemDate;
      if (itemDate === today) key = t.notifications.today;
      else if (itemDate === yesterday) key = t.notifications.yesterday;

      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return Object.entries(groups).map(([date, items]) => ({ date, items }));
  };

  const groupedActivities = groupActivitiesByDate(activities);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>{t.activityLog.title}</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      {/* Filters */}
      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <FlatList
          horizontal
          data={filterOptions}
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.filterChip,
                filterType === item.value && styles.filterChipActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFilterType(item.value);
              }}
            >
              <Ionicons
                name={item.icon}
                size={16}
                color={filterType === item.value ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.filterChipText,
                  filterType === item.value && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </Animated.View>

      {/* Activity List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t.common.loading}</Text>
        </View>
      ) : activities.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="time-outline" size={48} color={colors.textLight} />
          </View>
          <Text style={styles.emptyTitle}>{t.activityLog.noActivity}</Text>
        </View>
      ) : (
        <FlatList
          data={groupedActivities}
          keyExtractor={(item) => item.date}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          renderItem={({ item: group }) => (
            <View style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{group.date}</Text>
              {group.items.map((activity, index) => (
                <ActivityItem
                  key={activity.id}
                  item={activity}
                  index={index}
                  formatDate={formatDate}
                  t={t}
                />
              ))}
            </View>
          )}
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
  filtersContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    gap: spacing.xs,
    ...shadows.sm,
  },
  filterChipActive: {
    backgroundColor: `${colors.primary}15`,
  },
  filterChipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  dateGroup: {
    marginBottom: spacing.lg,
  },
  dateHeader: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  activityActor: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  actorRoleBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.borderLight,
  },
  actorRoleText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  activityDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  activityEntity: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    marginTop: 2,
  },
  activityTime: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
});
