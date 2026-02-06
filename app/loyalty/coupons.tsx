import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button } from '@/components/ui';
import { useLocalization } from '@/localization';
import { getAuthState } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { Coupon } from '@/types';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

interface CouponCardProps {
  coupon: Coupon;
  index: number;
  onPress: () => void;
  onToggle: () => void;
  onDelete: () => void;
  formatCurrency: (amount: number) => string;
  t: any;
}

const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  index,
  onPress,
  onToggle,
  onDelete,
  formatCurrency,
  t,
}) => {
  const isExpired = coupon.validUntil && new Date(coupon.validUntil) < new Date();
  const isLimitReached = coupon.usageLimit && coupon.usageCount >= coupon.usageLimit;

  const getStatusColor = () => {
    if (isExpired) return colors.error;
    if (!coupon.isActive) return colors.textSecondary;
    if (isLimitReached) return colors.warning;
    return colors.success;
  };

  const getStatusLabel = () => {
    if (isExpired) return t.coupons.expired;
    if (!coupon.isActive) return t.coupons.inactive;
    if (isLimitReached) return 'Limit reached';
    return t.coupons.active;
  };

  return (
    <Animated.View entering={FadeInRight.delay(index * 80).duration(400)}>
      <Pressable onPress={onPress}>
        <Card style={[styles.couponCard, !coupon.isActive && styles.couponCardInactive]}>
          <View style={styles.couponHeader}>
            <View style={styles.couponCodeContainer}>
              <LinearGradient
                colors={coupon.isActive && !isExpired ? ['#F59E0B', '#D97706'] : [colors.textSecondary, colors.textLight]}
                style={styles.couponIcon}
              >
                <Ionicons name="ticket" size={20} color="#fff" />
              </LinearGradient>
              <View>
                <Text style={styles.couponCode}>{coupon.code}</Text>
                <Text style={styles.couponName}>{coupon.name}</Text>
              </View>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}15` }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
              <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusLabel()}</Text>
            </View>
          </View>

          <View style={styles.couponDetails}>
            <View style={styles.discountBadge}>
              <Text style={styles.discountValue}>
                {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : formatCurrency(coupon.discountValue)}
              </Text>
              <Text style={styles.discountLabel}>OFF</Text>
            </View>

            <View style={styles.couponStats}>
              <View style={styles.couponStat}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.couponStatText}>
                  {coupon.usageCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''} {t.coupons.usages.toLowerCase()}
                </Text>
              </View>
              {coupon.minPurchaseAmount > 0 && (
                <View style={styles.couponStat}>
                  <Ionicons name="cart-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.couponStatText}>
                    Min: {formatCurrency(coupon.minPurchaseAmount)}
                  </Text>
                </View>
              )}
              {coupon.validUntil && (
                <View style={styles.couponStat}>
                  <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.couponStatText}>
                    Until: {new Date(coupon.validUntil).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.couponActions}>
            <Pressable
              style={[styles.actionButton, coupon.isActive ? styles.deactivateButton : styles.activateButton]}
              onPress={onToggle}
            >
              <Ionicons
                name={coupon.isActive ? 'pause-circle' : 'play-circle'}
                size={18}
                color={coupon.isActive ? colors.warning : colors.success}
              />
              <Text style={[styles.actionText, { color: coupon.isActive ? colors.warning : colors.success }]}>
                {coupon.isActive ? 'Deactivate' : 'Activate'}
              </Text>
            </Pressable>

            <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={onDelete}>
              <Ionicons name="trash-outline" size={18} color={colors.error} />
              <Text style={[styles.actionText, { color: colors.error }]}>{t.common.delete}</Text>
            </Pressable>
          </View>
        </Card>
      </Pressable>
    </Animated.View>
  );
};

export default function CouponsScreen() {
  const insets = useSafeAreaInsets();
  const { t, formatCurrency } = useLocalization();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const user = getAuthState().user;

  const loadCoupons = useCallback(async () => {
    if (!user) return;

    try {
      let query = (supabase as any)
        .from('coupons')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (filter === 'active') {
        query = query.eq('is_active', true);
      } else if (filter === 'inactive') {
        query = query.eq('is_active', false);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedCoupons: Coupon[] = (data || []).map((c: any) => ({
        id: c.id,
        ownerId: c.owner_id,
        code: c.code,
        name: c.name,
        description: c.description || undefined,
        discountType: c.discount_type as Coupon['discountType'],
        discountValue: c.discount_value,
        minPurchaseAmount: c.min_purchase_amount || 0,
        maxDiscountAmount: c.max_discount_amount || undefined,
        usageLimit: c.usage_limit || undefined,
        usageCount: c.usage_count || 0,
        isSingleUse: c.is_single_use || false,
        customerTier: c.customer_tier || [],
        customerIds: c.customer_ids || [],
        validFrom: c.valid_from,
        validUntil: c.valid_until || undefined,
        isActive: c.is_active,
        createdAt: c.created_at || new Date().toISOString(),
        updatedAt: c.updated_at,
      }));

      setCoupons(transformedCoupons);
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, filter]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCoupons();
  }, [loadCoupons]);

  const handleToggleCoupon = async (coupon: Coupon) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await (supabase as any)
        .from('coupons')
        .update({ is_active: !coupon.isActive, updated_at: new Date().toISOString() })
        .eq('id', coupon.id);

      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !c.isActive } : c))
      );
    } catch (error) {
      console.error('Error toggling coupon:', error);
      Alert.alert(t.common.error, 'Failed to update coupon');
    }
  };

  const handleDeleteCoupon = (coupon: Coupon) => {
    Alert.alert(
      t.common.delete,
      `Delete coupon "${coupon.code}"?`,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await (supabase as any).from('coupons').delete().eq('id', coupon.id);
              setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error deleting coupon:', error);
              Alert.alert(t.common.error, 'Failed to delete coupon');
            }
          },
        },
      ]
    );
  };

  const activeCount = coupons.filter((c) => c.isActive).length;
  const totalUsage = coupons.reduce((sum, c) => sum + c.usageCount, 0);

  const filters: { value: 'all' | 'active' | 'inactive'; label: string }[] = [
    { value: 'all', label: t.common.all },
    { value: 'active', label: t.coupons.active },
    { value: 'inactive', label: t.coupons.inactive },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>{t.coupons.title}</Text>
        <Pressable onPress={() => router.push('/loyalty/coupon/create')} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </Animated.View>

      {/* Stats */}
      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.statsRow}>
        <Card style={styles.miniStatCard}>
          <Text style={styles.miniStatValue}>{coupons.length}</Text>
          <Text style={styles.miniStatLabel}>Total</Text>
        </Card>
        <Card style={[styles.miniStatCard, { backgroundColor: `${colors.success}10` }]}>
          <Text style={[styles.miniStatValue, { color: colors.success }]}>{activeCount}</Text>
          <Text style={styles.miniStatLabel}>{t.coupons.active}</Text>
        </Card>
        <Card style={styles.miniStatCard}>
          <Text style={styles.miniStatValue}>{totalUsage}</Text>
          <Text style={styles.miniStatLabel}>{t.coupons.usages}</Text>
        </Card>
      </Animated.View>

      {/* Filters */}
      <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.filtersRow}>
        {filters.map((f) => (
          <Pressable
            key={f.value}
            style={[styles.filterTab, filter === f.value && styles.filterTabActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setFilter(f.value);
            }}
          >
            <Text style={[styles.filterTabText, filter === f.value && styles.filterTabTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </Animated.View>

      {/* Coupons List */}
      <FlatList
        data={coupons}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <CouponCard
            coupon={item}
            index={index}
            onPress={() => {}}
            onToggle={() => handleToggleCoupon(item)}
            onDelete={() => handleDeleteCoupon(item)}
            formatCurrency={formatCurrency}
            t={t}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{t.common.loading}</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.emptyIcon}>
                <Ionicons name="ticket-outline" size={40} color="#fff" />
              </LinearGradient>
              <Text style={styles.emptyTitle}>{t.coupons.noCoupons}</Text>
              <Text style={styles.emptySubtitle}>Create your first coupon to boost sales</Text>
              <Button
                title={t.coupons.createCoupon}
                onPress={() => router.push('/loyalty/coupon/create')}
                icon={<Ionicons name="add" size={20} color="#fff" />}
                style={styles.createButton}
              />
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  miniStatCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  miniStatValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  miniStatLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    ...shadows.sm,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  couponCard: {
    marginBottom: spacing.md,
  },
  couponCardInactive: {
    opacity: 0.7,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  couponCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  couponIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponCode: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 1,
  },
  couponName: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  couponDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  discountBadge: {
    backgroundColor: '#F59E0B15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  discountValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: '#F59E0B',
  },
  discountLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: '#D97706',
  },
  couponStats: {
    flex: 1,
    gap: spacing.xs,
  },
  couponStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  couponStatText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  couponActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  activateButton: {
    backgroundColor: `${colors.success}15`,
  },
  deactivateButton: {
    backgroundColor: `${colors.warning}15`,
  },
  deleteButton: {
    backgroundColor: `${colors.error}15`,
  },
  actionText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
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
    marginBottom: spacing.lg,
  },
  createButton: {
    backgroundColor: '#F59E0B',
  },
});
