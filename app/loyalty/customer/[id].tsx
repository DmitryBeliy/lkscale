import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button } from '@/components/ui';
import { useLocalization } from '@/localization';
import { getAuthState } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { CustomerWithLoyalty, CustomerTier, PointsTransaction, TIER_THRESHOLDS, POINTS_EARNING_RATE } from '@/types';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

const TIER_COLORS: Record<CustomerTier, { gradient: [string, string]; text: string; bg: string }> = {
  standard: { gradient: ['#9CA3AF', '#6B7280'], text: '#4B5563', bg: '#9CA3AF15' },
  silver: { gradient: ['#94A3B8', '#64748B'], text: '#475569', bg: '#94A3B815' },
  gold: { gradient: ['#F59E0B', '#D97706'], text: '#B45309', bg: '#F59E0B15' },
  vip: { gradient: ['#8B5CF6', '#7C3AED'], text: '#6D28D9', bg: '#8B5CF615' },
};

const TIER_ICONS: Record<CustomerTier, keyof typeof Ionicons.glyphMap> = {
  standard: 'person',
  silver: 'star-half',
  gold: 'star',
  vip: 'diamond',
};

export default function CustomerLoyaltyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { t, formatCurrency, formatDate } = useLocalization();
  const [customer, setCustomer] = useState<CustomerWithLoyalty | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [personalNotes, setPersonalNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [loading, setLoading] = useState(true);

  const user = getAuthState().user;

  const loadCustomerData = useCallback(async () => {
    if (!user || !id) return;

    try {
      // Load customer with loyalty data
      const { data: customerData, error: customerError } = await (supabase as any)
        .from('customers')
        .select(`
          *,
          customer_loyalty (*)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (customerError) throw customerError;

      const now = new Date();
      const lastVisit = customerData.last_order_date ? new Date(customerData.last_order_date) : null;
      const daysSinceLastVisit = lastVisit
        ? Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      const loyaltyData = customerData.customer_loyalty?.[0] || customerData.customer_loyalty;

      const transformedCustomer: CustomerWithLoyalty = {
        id: customerData.id,
        name: customerData.name || 'Unknown',
        phone: customerData.phone || undefined,
        email: customerData.email || undefined,
        address: customerData.address || undefined,
        company: customerData.company || undefined,
        notes: customerData.notes || undefined,
        totalOrders: customerData.total_orders || 0,
        totalSpent: customerData.total_spent || 0,
        lastOrderDate: customerData.last_order_date || undefined,
        averageCheck: customerData.average_check || 0,
        topCategories: customerData.top_categories || [],
        createdAt: customerData.created_at || new Date().toISOString(),
        updatedAt: customerData.updated_at || undefined,
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

      setCustomer(transformedCustomer);
      setPersonalNotes(transformedCustomer.loyalty?.personalNotes || '');

      // Load points transactions
      const { data: transactionsData } = await (supabase as any)
        .from('points_transactions')
        .select('*')
        .eq('customer_id', id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (transactionsData) {
        const transformedTransactions: PointsTransaction[] = transactionsData.map((t: any) => ({
          id: t.id,
          customerId: t.customer_id,
          ownerId: t.owner_id,
          points: t.points,
          transactionType: t.transaction_type as PointsTransaction['transactionType'],
          orderId: t.order_id || undefined,
          description: t.description || undefined,
          createdAt: t.created_at || new Date().toISOString(),
        }));
        setTransactions(transformedTransactions);
      }
    } catch (error) {
      console.error('Error loading customer:', error);
      Alert.alert(t.common.error, 'Failed to load customer data');
    } finally {
      setLoading(false);
    }
  }, [user, id, t]);

  useEffect(() => {
    loadCustomerData();
  }, [loadCustomerData]);

  const handleSaveNotes = async () => {
    if (!user || !customer) return;

    try {
      if (customer.loyalty) {
        await (supabase as any)
          .from('customer_loyalty')
          .update({ personal_notes: personalNotes, updated_at: new Date().toISOString() })
          .eq('id', customer.loyalty.id);
      } else {
        await (supabase as any).from('customer_loyalty').insert({
          customer_id: customer.id,
          owner_id: user.id,
          personal_notes: personalNotes,
        });
      }

      setIsEditingNotes(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error saving notes:', error);
      Alert.alert(t.common.error, 'Failed to save notes');
    }
  };

  const handleAdjustPoints = (amount: number) => {
    Alert.prompt(
      amount > 0 ? 'Add Points' : 'Remove Points',
      'Enter the number of points:',
      async (inputPoints) => {
        const points = parseInt(inputPoints);
        if (isNaN(points) || points <= 0) {
          Alert.alert(t.common.error, 'Please enter a valid number');
          return;
        }

        const finalPoints = amount > 0 ? points : -points;

        try {
          // Add points transaction
          await (supabase as any).from('points_transactions').insert({
            customer_id: customer!.id,
            owner_id: user!.id,
            points: finalPoints,
            transaction_type: 'adjusted',
            description: amount > 0 ? 'Manual addition' : 'Manual deduction',
          });

          // Update customer loyalty points
          if (customer?.loyalty) {
            const newPoints = Math.max(0, customer.loyalty.bonusPoints + finalPoints);
            await (supabase as any)
              .from('customer_loyalty')
              .update({
                bonus_points: newPoints,
                lifetime_points: amount > 0 ? customer.loyalty.lifetimePoints + points : customer.loyalty.lifetimePoints,
              })
              .eq('id', customer.loyalty.id);
          }

          loadCustomerData();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
          console.error('Error adjusting points:', error);
          Alert.alert(t.common.error, 'Failed to adjust points');
        }
      },
      'plain-text'
    );
  };

  if (loading || !customer) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t.common.loading}</Text>
        </View>
      </View>
    );
  }

  const tier = customer.loyalty?.tier || 'standard';
  const tierColors = TIER_COLORS[tier];
  const points = customer.loyalty?.bonusPoints || 0;
  const lifetimePoints = customer.loyalty?.lifetimePoints || 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{t.loyalty.title}</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Customer Header Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Card style={[styles.profileCard, { borderTopWidth: 4, borderTopColor: tierColors.gradient[0] }]}>
            <View style={styles.profileHeader}>
              <LinearGradient colors={tierColors.gradient} style={styles.avatar}>
                <Ionicons name={TIER_ICONS[tier]} size={32} color="#fff" />
              </LinearGradient>
              <View style={styles.profileInfo}>
                <Text style={styles.customerName}>{customer.name}</Text>
                {customer.phone && (
                  <Text style={styles.customerContact}>{customer.phone}</Text>
                )}
                {customer.email && (
                  <Text style={styles.customerContact}>{customer.email}</Text>
                )}
              </View>
            </View>

            {/* Tier Badge */}
            <View style={[styles.tierBadge, { backgroundColor: tierColors.bg }]}>
              <Ionicons name={TIER_ICONS[tier]} size={16} color={tierColors.gradient[0]} />
              <Text style={[styles.tierBadgeText, { color: tierColors.text }]}>
                {t.loyalty.tiers[tier].toUpperCase()}
              </Text>
            </View>

            {/* Churn Warning */}
            {customer.isChurning && (
              <View style={styles.churnWarning}>
                <Ionicons name="alert-circle" size={18} color={colors.error} />
                <Text style={styles.churnWarningText}>
                  {customer.daysSinceLastVisit} days since last visit - {t.loyalty.atRisk}
                </Text>
              </View>
            )}
          </Card>
        </Animated.View>

        {/* Points Card */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.pointsCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.pointsHeader}>
              <Ionicons name="gift" size={28} color="#fff" />
              <Text style={styles.pointsTitle}>{t.loyalty.bonusPoints}</Text>
            </View>
            <Text style={styles.pointsValue}>{points.toLocaleString()}</Text>
            <Text style={styles.lifetimePoints}>
              {t.loyalty.lifetimePoints}: {lifetimePoints.toLocaleString()}
            </Text>

            <View style={styles.pointsActions}>
              <Pressable
                style={styles.pointsAction}
                onPress={() => handleAdjustPoints(1)}
              >
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.pointsActionText}>Add</Text>
              </Pressable>
              <Pressable
                style={styles.pointsAction}
                onPress={() => handleAdjustPoints(-1)}
              >
                <Ionicons name="remove-circle" size={20} color="#fff" />
                <Text style={styles.pointsActionText}>Remove</Text>
              </Pressable>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{customer.totalOrders}</Text>
            <Text style={styles.statLabel}>{t.customers.totalOrders}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{formatCurrency(customer.totalSpent)}</Text>
            <Text style={styles.statLabel}>{t.customers.totalSpent}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{formatCurrency(customer.averageCheck || 0)}</Text>
            <Text style={styles.statLabel}>{t.staffPerformance.avgOrderValue}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{customer.loyalty?.visitCount || 0}</Text>
            <Text style={styles.statLabel}>{t.loyalty.visitCount}</Text>
          </Card>
        </Animated.View>

        {/* Favorite Products / Preferences */}
        {customer.loyalty?.favoriteProducts && customer.loyalty.favoriteProducts.length > 0 && (
          <Animated.View entering={FadeInDown.delay(500).duration(500)}>
            <Text style={styles.sectionTitle}>{t.loyalty.preferences}</Text>
            <Card style={styles.preferencesCard}>
              <View style={styles.preferencesHeader}>
                <Ionicons name="heart" size={18} color={colors.error} />
                <Text style={styles.preferencesTitle}>Favorite Products</Text>
              </View>
              <View style={styles.favoritesList}>
                {customer.loyalty.favoriteProducts.slice(0, 5).map((product, index) => (
                  <View key={index} style={styles.favoriteItem}>
                    <LinearGradient
                      colors={['#F59E0B', '#D97706']}
                      style={styles.favoriteRank}
                    >
                      <Text style={styles.favoriteRankText}>{index + 1}</Text>
                    </LinearGradient>
                    <Text style={styles.favoriteName}>{product}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Top Categories */}
        {customer.topCategories && customer.topCategories.length > 0 && (
          <Animated.View entering={FadeInDown.delay(550).duration(500)}>
            <Text style={styles.sectionTitle}>{t.loyalty.topCategories}</Text>
            <View style={styles.categoriesGrid}>
              {customer.topCategories.slice(0, 4).map((category, index) => (
                <View key={index} style={styles.categoryChip}>
                  <Ionicons name="pricetag" size={14} color={colors.primary} />
                  <Text style={styles.categoryText}>{category}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Personal Notes */}
        <Animated.View entering={FadeInDown.delay(600).duration(500)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.loyalty.personalNotes}</Text>
            {!isEditingNotes && (
              <Pressable onPress={() => setIsEditingNotes(true)}>
                <Ionicons name="create-outline" size={20} color={colors.primary} />
              </Pressable>
            )}
          </View>
          <Card style={styles.notesCard}>
            {isEditingNotes ? (
              <>
                <TextInput
                  style={styles.notesInput}
                  value={personalNotes}
                  onChangeText={setPersonalNotes}
                  placeholder="Add notes about this customer..."
                  multiline
                  numberOfLines={4}
                />
                <View style={styles.notesActions}>
                  <Button
                    title={t.common.cancel}
                    variant="outline"
                    size="sm"
                    onPress={() => {
                      setIsEditingNotes(false);
                      setPersonalNotes(customer.loyalty?.personalNotes || '');
                    }}
                  />
                  <Button
                    title={t.common.save}
                    size="sm"
                    onPress={handleSaveNotes}
                  />
                </View>
              </>
            ) : (
              <Text style={styles.notesText}>
                {personalNotes || 'No notes yet. Tap edit to add preferences, allergies, or special requests.'}
              </Text>
            )}
          </Card>
        </Animated.View>

        {/* Points History */}
        <Animated.View entering={FadeInDown.delay(700).duration(500)}>
          <Text style={styles.sectionTitle}>{t.loyalty.pointsHistory}</Text>
          {transactions.length === 0 ? (
            <Card style={styles.emptyHistory}>
              <Ionicons name="receipt-outline" size={32} color={colors.textLight} />
              <Text style={styles.emptyHistoryText}>No transactions yet</Text>
            </Card>
          ) : (
            transactions.map((tx, index) => (
              <Animated.View key={tx.id} entering={FadeInRight.delay(index * 50).duration(300)}>
                <View style={styles.transactionItem}>
                  <View
                    style={[
                      styles.transactionIcon,
                      {
                        backgroundColor:
                          tx.transactionType === 'earned' || tx.transactionType === 'bonus'
                            ? `${colors.success}15`
                            : tx.transactionType === 'spent'
                            ? `${colors.error}15`
                            : `${colors.textSecondary}15`,
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        tx.transactionType === 'earned' || tx.transactionType === 'bonus'
                          ? 'add'
                          : tx.transactionType === 'spent'
                          ? 'remove'
                          : 'swap-horizontal'
                      }
                      size={16}
                      color={
                        tx.transactionType === 'earned' || tx.transactionType === 'bonus'
                          ? colors.success
                          : tx.transactionType === 'spent'
                          ? colors.error
                          : colors.textSecondary
                      }
                    />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDesc}>{tx.description || tx.transactionType}</Text>
                    <Text style={styles.transactionDate}>{formatDate(tx.createdAt, 'short')}</Text>
                  </View>
                  <Text
                    style={[
                      styles.transactionPoints,
                      {
                        color:
                          tx.points > 0
                            ? colors.success
                            : tx.points < 0
                            ? colors.error
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {tx.points > 0 ? '+' : ''}{tx.points}
                  </Text>
                </View>
              </Animated.View>
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
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
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
  profileCard: {
    marginBottom: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  customerName: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  customerContact: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  tierBadgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    letterSpacing: 1,
  },
  churnWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.error}15`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  churnWarningText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.error,
    fontWeight: '500',
  },
  pointsCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  pointsTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: '#fff',
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
  },
  lifetimePoints: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  pointsActions: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  pointsAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.full,
  },
  pointsActionText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
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
  preferencesCard: {
    marginBottom: spacing.lg,
  },
  preferencesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  preferencesTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  favoritesList: {
    gap: spacing.sm,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  favoriteRank: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteRankText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: '#fff',
  },
  favoriteName: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  categoryText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  notesCard: {
    marginBottom: spacing.lg,
  },
  notesText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.sm,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  notesActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyHistoryText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  transactionDesc: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.text,
    textTransform: 'capitalize',
  },
  transactionDate: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  transactionPoints: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
  },
});
