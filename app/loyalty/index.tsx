import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
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
import { CustomerWithLoyalty, CustomerTier, Coupon, TIER_THRESHOLDS } from '@/types';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

// Premium tier colors with gold accents
const TIER_COLORS: Record<CustomerTier, { gradient: [string, string]; text: string; accent: string }> = {
  standard: { gradient: ['#9CA3AF', '#6B7280'], text: '#4B5563', accent: '#9CA3AF' },
  silver: { gradient: ['#94A3B8', '#64748B'], text: '#475569', accent: '#94A3B8' },
  gold: { gradient: ['#F59E0B', '#D97706'], text: '#B45309', accent: '#F59E0B' },
  vip: { gradient: ['#8B5CF6', '#7C3AED'], text: '#6D28D9', accent: '#8B5CF6' },
};

const TIER_ICONS: Record<CustomerTier, keyof typeof Ionicons.glyphMap> = {
  standard: 'person',
  silver: 'star-half',
  gold: 'star',
  vip: 'diamond',
};

interface CustomerCardProps {
  customer: CustomerWithLoyalty;
  index: number;
  onPress: () => void;
  formatCurrency: (amount: number) => string;
  t: any;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer, index, onPress, formatCurrency, t }) => {
  const tier = customer.loyalty?.tier || 'standard';
  const tierColors = TIER_COLORS[tier];
  const points = customer.loyalty?.bonusPoints || 0;
  const isChurning = customer.isChurning;

  return (
    <Animated.View entering={FadeInRight.delay(index * 80).duration(400)}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.customerCard, pressed && { opacity: 0.9 }]}>
        <View style={styles.customerHeader}>
          <LinearGradient colors={tierColors.gradient} style={styles.customerAvatar}>
            <Ionicons name={TIER_ICONS[tier]} size={20} color="#fff" />
          </LinearGradient>

          <View style={styles.customerInfo}>
            <View style={styles.customerNameRow}>
              <Text style={styles.customerName} numberOfLines={1}>{customer.name}</Text>
              {isChurning && (
                <View style={styles.churnBadge}>
                  <Ionicons name="warning" size={12} color={colors.error} />
                </View>
              )}
            </View>
            <Text style={styles.customerStats}>
              {customer.totalOrders} orders • {formatCurrency(customer.totalSpent)}
            </Text>
          </View>

          <View style={styles.pointsBadge}>
            <Ionicons name="gift" size={14} color={tierColors.accent} />
            <Text style={[styles.pointsText, { color: tierColors.accent }]}>{points}</Text>
          </View>
        </View>

        {/* Tier Progress */}
        <View style={styles.tierProgress}>
          <View style={styles.tierLabelRow}>
            <Text style={[styles.tierLabel, { color: tierColors.text }]}>
              {t.loyalty.tiers[tier]}
            </Text>
            {tier !== 'vip' && (
              <Text style={styles.nextTierText}>
                {formatCurrency(TIER_THRESHOLDS[getNextTier(tier)] - customer.totalSpent)} to {t.loyalty.tiers[getNextTier(tier)]}
              </Text>
            )}
          </View>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={tierColors.gradient}
              style={[styles.progressFill, { width: `${getTierProgress(customer.totalSpent)}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const getNextTier = (currentTier: CustomerTier): CustomerTier => {
  const tiers: CustomerTier[] = ['standard', 'silver', 'gold', 'vip'];
  const currentIndex = tiers.indexOf(currentTier);
  return tiers[Math.min(currentIndex + 1, tiers.length - 1)];
};

const getTierProgress = (totalSpent: number): number => {
  if (totalSpent >= TIER_THRESHOLDS.vip) return 100;
  if (totalSpent >= TIER_THRESHOLDS.gold) {
    return ((totalSpent - TIER_THRESHOLDS.gold) / (TIER_THRESHOLDS.vip - TIER_THRESHOLDS.gold)) * 100;
  }
  if (totalSpent >= TIER_THRESHOLDS.silver) {
    return ((totalSpent - TIER_THRESHOLDS.silver) / (TIER_THRESHOLDS.gold - TIER_THRESHOLDS.silver)) * 100;
  }
  return (totalSpent / TIER_THRESHOLDS.silver) * 100;
};

export default function LoyaltyDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { t, formatCurrency } = useLocalization();
  const [customers, setCustomers] = useState<CustomerWithLoyalty[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTier, setSelectedTier] = useState<CustomerTier | 'all'>('all');

  const user = getAuthState().user;

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      // Load customers with loyalty data
      const { data: customersData, error: customersError } = await (supabase as any)
        .from('customers')
        .select(`
          *,
          customer_loyalty (*)
        `)
        .eq('user_id', user.id)
        .order('total_spent', { ascending: false });

      if (customersError) throw customersError;

      const now = new Date();

      const transformedCustomers: CustomerWithLoyalty[] = (customersData || []).map((c: any) => {
        const lastVisit = c.last_order_date ? new Date(c.last_order_date) : null;
        const daysSinceLastVisit = lastVisit
          ? Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
          : null;

        const loyaltyData = c.customer_loyalty?.[0] || c.customer_loyalty;

        return {
          id: c.id,
          name: c.name || 'Unknown',
          phone: c.phone || undefined,
          email: c.email || undefined,
          address: c.address || undefined,
          company: c.company || undefined,
          notes: c.notes || undefined,
          totalOrders: c.total_orders || 0,
          totalSpent: c.total_spent || 0,
          lastOrderDate: c.last_order_date || undefined,
          averageCheck: c.average_check || 0,
          topCategories: c.top_categories || [],
          createdAt: c.created_at || new Date().toISOString(),
          updatedAt: c.updated_at || undefined,
          loyalty: loyaltyData ? {
            id: loyaltyData.id,
            customerId: loyaltyData.customer_id,
            ownerId: loyaltyData.owner_id,
            bonusPoints: loyaltyData.bonus_points || 0,
            lifetimePoints: loyaltyData.lifetime_points || 0,
            tier: loyaltyData.tier || 'standard',
            tierUpdatedAt: loyaltyData.tier_updated_at,
            favoriteProducts: loyaltyData.favorite_products || [],
            personalNotes: loyaltyData.personal_notes || undefined,
            lastVisitDate: loyaltyData.last_visit_date || undefined,
            visitCount: loyaltyData.visit_count || 0,
            createdAt: loyaltyData.created_at || new Date().toISOString(),
            updatedAt: loyaltyData.updated_at,
          } : undefined,
          daysSinceLastVisit: daysSinceLastVisit || undefined,
          isChurning: daysSinceLastVisit !== null && daysSinceLastVisit > 30,
        };
      });

      setCustomers(transformedCustomers);

      // Load active coupons
      const { data: couponsData, error: couponsError } = await (supabase as any)
        .from('coupons')
        .select('*')
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!couponsError && couponsData) {
        const transformedCoupons: Coupon[] = couponsData.map((c: any) => ({
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
      }
    } catch (error) {
      console.error('Error loading loyalty data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const filteredCustomers = selectedTier === 'all'
    ? customers
    : customers.filter((c) => c.loyalty?.tier === selectedTier);

  const vipCount = customers.filter((c) => c.loyalty?.tier === 'vip').length;
  const goldCount = customers.filter((c) => c.loyalty?.tier === 'gold').length;
  const churningCount = customers.filter((c) => c.isChurning).length;
  const totalPoints = customers.reduce((sum, c) => sum + (c.loyalty?.bonusPoints || 0), 0);

  const tierFilters: { value: CustomerTier | 'all'; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: 'all', label: t.common.all, icon: 'people' },
    { value: 'vip', label: 'VIP', icon: 'diamond' },
    { value: 'gold', label: t.loyalty.tiers.gold, icon: 'star' },
    { value: 'silver', label: t.loyalty.tiers.silver, icon: 'star-half' },
    { value: 'standard', label: t.loyalty.tiers.standard, icon: 'person' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>{t.loyalty.title}</Text>
        <Pressable onPress={() => router.push('/loyalty/coupons')} style={styles.couponButton}>
          <Ionicons name="ticket" size={22} color="#F59E0B" />
        </Pressable>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Stats Cards */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <LinearGradient colors={TIER_COLORS.vip.gradient} style={styles.statIcon}>
              <Ionicons name="diamond" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.statValue}>{vipCount}</Text>
            <Text style={styles.statLabel}>VIP</Text>
          </Card>

          <Card style={styles.statCard}>
            <LinearGradient colors={TIER_COLORS.gold.gradient} style={styles.statIcon}>
              <Ionicons name="star" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.statValue}>{goldCount}</Text>
            <Text style={styles.statLabel}>{t.loyalty.tiers.gold}</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${colors.error}15` }]}>
              <Ionicons name="alert-circle" size={20} color={colors.error} />
            </View>
            <Text style={[styles.statValue, { color: colors.error }]}>{churningCount}</Text>
            <Text style={styles.statLabel}>{t.loyalty.atRisk}</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${colors.success}15` }]}>
              <Ionicons name="gift" size={20} color={colors.success} />
            </View>
            <Text style={styles.statValue}>{totalPoints.toLocaleString()}</Text>
            <Text style={styles.statLabel}>{t.loyalty.bonusPoints}</Text>
          </Card>
        </Animated.View>

        {/* Active Coupons */}
        {coupons.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.coupons.title}</Text>
              <Pressable onPress={() => router.push('/loyalty/coupons')}>
                <Text style={styles.seeAllText}>{t.common.seeAll}</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.couponsScroll}>
              {coupons.map((coupon, index) => (
                <Pressable
                  key={coupon.id}
                  style={styles.couponCard}
                  onPress={() => router.push('/loyalty/coupons')}
                >
                  <LinearGradient
                    colors={['#F59E0B', '#D97706']}
                    style={styles.couponGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.couponContent}>
                      <Text style={styles.couponCode}>{coupon.code}</Text>
                      <Text style={styles.couponDiscount}>
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : formatCurrency(coupon.discountValue)} OFF
                      </Text>
                      <Text style={styles.couponUsage}>
                        {coupon.usageCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''} used
                      </Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              ))}
              <Pressable
                style={styles.addCouponCard}
                onPress={() => router.push('/loyalty/coupon/create')}
              >
                <Ionicons name="add" size={24} color={colors.textSecondary} />
                <Text style={styles.addCouponText}>{t.coupons.createCoupon}</Text>
              </Pressable>
            </ScrollView>
          </Animated.View>
        )}

        {/* Tier Filters */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.filtersSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tierFilters.map((filter) => (
              <Pressable
                key={filter.value}
                style={[
                  styles.filterChip,
                  selectedTier === filter.value && styles.filterChipActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedTier(filter.value);
                }}
              >
                <Ionicons
                  name={filter.icon}
                  size={16}
                  color={selectedTier === filter.value ? '#fff' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    selectedTier === filter.value && styles.filterChipTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Customer List */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <Text style={styles.sectionTitle}>
            {filteredCustomers.length} {t.customers.title.toLowerCase()}
          </Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{t.common.loading}</Text>
            </View>
          ) : filteredCustomers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>{t.customers.noCustomers}</Text>
            </View>
          ) : (
            filteredCustomers.map((customer, index) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                index={index}
                onPress={() => router.push(`/loyalty/customer/${customer.id}`)}
                formatCurrency={formatCurrency}
                t={t}
              />
            ))
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
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  couponButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: '#F59E0B15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  seeAllText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  couponsScroll: {
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  couponCard: {
    width: 140,
    height: 90,
    marginRight: spacing.sm,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  couponGradient: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  couponContent: {},
  couponCode: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  couponDiscount: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: '#fff',
    marginTop: 4,
  },
  couponUsage: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  addCouponCard: {
    width: 100,
    height: 90,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  addCouponText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  filtersSection: {
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
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
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  customerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  customerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  customerName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  churnBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: `${colors.error}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerStats: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  pointsText: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
  },
  tierProgress: {},
  tierLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  tierLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nextTierText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
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
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
