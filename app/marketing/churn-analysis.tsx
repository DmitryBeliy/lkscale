import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
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
import { ChurnRiskCustomer, CustomerTier, TIER_THRESHOLDS } from '@/types';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

const TIER_COLORS: Record<CustomerTier, { gradient: [string, string]; text: string }> = {
  standard: { gradient: ['#9CA3AF', '#6B7280'], text: '#4B5563' },
  silver: { gradient: ['#94A3B8', '#64748B'], text: '#475569' },
  gold: { gradient: ['#F59E0B', '#D97706'], text: '#B45309' },
  vip: { gradient: ['#8B5CF6', '#7C3AED'], text: '#6D28D9' },
};

interface CustomerWithOffer extends ChurnRiskCustomer {
  aiOffer?: string;
  isGenerating?: boolean;
}

export default function ChurnAnalysisScreen() {
  const insets = useSafeAreaInsets();
  const { t, formatCurrency } = useLocalization();
  const [customers, setCustomers] = useState<CustomerWithOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  const { generateText, isLoading: aiLoading } = useTextGeneration();

  const user = getAuthState().user;

  const loadChurnRiskCustomers = useCallback(async () => {
    if (!user) return;

    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data: customersData, error } = await (supabase as any)
        .from('customers')
        .select(`
          *,
          customer_loyalty (*)
        `)
        .eq('user_id', user.id)
        .lt('last_order_date', thirtyDaysAgo)
        .order('total_spent', { ascending: false });

      if (error) throw error;

      const now = new Date();
      const churnCustomers: CustomerWithOffer[] = (customersData || []).map((c: any) => {
        const lastVisit = c.last_order_date ? new Date(c.last_order_date) : null;
        const loyaltyData = c.customer_loyalty?.[0] || c.customer_loyalty;
        const daysSince = lastVisit
          ? Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        // Calculate churn probability based on days and tier
        let churnProb = Math.min(0.95, daysSince / 100);
        if (loyaltyData?.tier === 'vip') churnProb *= 0.7;
        else if (loyaltyData?.tier === 'gold') churnProb *= 0.85;

        return {
          customerId: c.id,
          customerName: c.name || 'Unknown',
          daysSinceLastVisit: daysSince,
          totalSpent: c.total_spent || 0,
          tier: loyaltyData?.tier || 'standard',
          favoriteProducts: loyaltyData?.favorite_products || [],
          churnProbability: churnProb,
        };
      });

      // Sort by churn probability
      churnCustomers.sort((a, b) => b.churnProbability - a.churnProbability);

      setCustomers(churnCustomers);
    } catch (error) {
      console.error('Error loading churn risk customers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadChurnRiskCustomers();
  }, [loadChurnRiskCustomers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadChurnRiskCustomers();
  }, [loadChurnRiskCustomers]);

  const generatePersonalizedOffer = async (customer: CustomerWithOffer) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setGeneratingFor(customer.customerId);

    try {
      const prompt = `Generate a short, personalized win-back offer message (in Russian, 2-3 sentences max) for a customer named "${customer.customerName}" who is a ${customer.tier} tier customer. They have spent ${customer.totalSpent} rubles total and haven't visited in ${customer.daysSinceLastVisit} days. ${customer.favoriteProducts.length > 0 ? `Their favorite products include: ${customer.favoriteProducts.join(', ')}.` : ''} Make it warm, personal, and include a specific discount or offer to encourage them to return.`;

      const response = await generateText(prompt);

      setCustomers((prev) =>
        prev.map((c) =>
          c.customerId === customer.customerId ? { ...c, aiOffer: response || 'Offer generated' } : c
        )
      );
    } catch (error) {
      console.error('Error generating offer:', error);
      Alert.alert(t.common.error, 'Failed to generate personalized offer');
    } finally {
      setGeneratingFor(null);
    }
  };

  const getRiskLevel = (probability: number): { label: string; color: string } => {
    if (probability >= 0.7) return { label: 'High Risk', color: colors.error };
    if (probability >= 0.5) return { label: 'Medium Risk', color: colors.warning };
    return { label: 'Low Risk', color: colors.success };
  };

  const highRisk = customers.filter((c) => c.churnProbability >= 0.7);
  const mediumRisk = customers.filter((c) => c.churnProbability >= 0.5 && c.churnProbability < 0.7);
  const lowRisk = customers.filter((c) => c.churnProbability < 0.5);
  const totalAtRiskValue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>{t.loyalty.churnRisk}</Text>
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
        {/* Summary Stats */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.statsGrid}>
          <Card style={[styles.statCard, { borderTopColor: colors.error }]}>
            <Ionicons name="warning" size={24} color={colors.error} />
            <Text style={styles.statValue}>{highRisk.length}</Text>
            <Text style={styles.statLabel}>High Risk</Text>
          </Card>
          <Card style={[styles.statCard, { borderTopColor: colors.warning }]}>
            <Ionicons name="alert-circle" size={24} color={colors.warning} />
            <Text style={styles.statValue}>{mediumRisk.length}</Text>
            <Text style={styles.statLabel}>Medium Risk</Text>
          </Card>
          <Card style={[styles.statCard, { borderTopColor: colors.success }]}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            <Text style={styles.statValue}>{lowRisk.length}</Text>
            <Text style={styles.statLabel}>Low Risk</Text>
          </Card>
        </Animated.View>

        {/* Total Value at Risk */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Card style={styles.valueCard}>
            <View style={styles.valueHeader}>
              <Ionicons name="trending-down" size={20} color={colors.error} />
              <Text style={styles.valueTitle}>Total Customer Value at Risk</Text>
            </View>
            <Text style={styles.valueAmount}>{formatCurrency(totalAtRiskValue)}</Text>
            <Text style={styles.valueDesc}>
              Lifetime value of {customers.length} customers who have not visited in 30+ days
            </Text>
          </Card>
        </Animated.View>

        {/* Customer List */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Text style={styles.sectionTitle}>
            {customers.length} {t.loyalty.atRisk} Customers
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>{t.common.loading}</Text>
            </View>
          ) : customers.length === 0 ? (
            <Card style={styles.emptyState}>
              <Ionicons name="happy-outline" size={48} color={colors.success} />
              <Text style={styles.emptyTitle}>Great news!</Text>
              <Text style={styles.emptySubtitle}>No customers at churn risk</Text>
            </Card>
          ) : (
            customers.map((customer, index) => {
              const risk = getRiskLevel(customer.churnProbability);
              const tierColors = TIER_COLORS[customer.tier];
              const isGenerating = generatingFor === customer.customerId;

              return (
                <Animated.View key={customer.customerId} entering={FadeInRight.delay(index * 60).duration(400)}>
                  <Card style={styles.customerCard}>
                    <View style={styles.customerHeader}>
                      <LinearGradient colors={tierColors.gradient} style={styles.customerAvatar}>
                        <Text style={styles.customerInitial}>
                          {customer.customerName.charAt(0).toUpperCase()}
                        </Text>
                      </LinearGradient>

                      <View style={styles.customerInfo}>
                        <View style={styles.customerNameRow}>
                          <Text style={styles.customerName}>{customer.customerName}</Text>
                          <View style={[styles.tierBadge, { backgroundColor: `${tierColors.gradient[0]}20` }]}>
                            <Text style={[styles.tierText, { color: tierColors.text }]}>
                              {t.loyalty.tiers[customer.tier]}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.customerStats}>
                          {formatCurrency(customer.totalSpent)} • {customer.daysSinceLastVisit} days inactive
                        </Text>
                      </View>

                      <View style={[styles.riskBadge, { backgroundColor: `${risk.color}15` }]}>
                        <View style={[styles.riskDot, { backgroundColor: risk.color }]} />
                        <Text style={[styles.riskText, { color: risk.color }]}>
                          {Math.round(customer.churnProbability * 100)}%
                        </Text>
                      </View>
                    </View>

                    {/* Churn Probability Bar */}
                    <View style={styles.probabilitySection}>
                      <View style={styles.probabilityBar}>
                        <View
                          style={[
                            styles.probabilityFill,
                            {
                              width: `${customer.churnProbability * 100}%`,
                              backgroundColor: risk.color,
                            },
                          ]}
                        />
                      </View>
                    </View>

                    {/* AI Generated Offer */}
                    {customer.aiOffer && (
                      <View style={styles.offerContainer}>
                        <View style={styles.offerHeader}>
                          <Ionicons name="sparkles" size={14} color="#F59E0B" />
                          <Text style={styles.offerTitle}>AI-Generated Offer</Text>
                        </View>
                        <Text style={styles.offerText}>{customer.aiOffer}</Text>
                      </View>
                    )}

                    {/* Actions */}
                    <View style={styles.customerActions}>
                      <Button
                        title={customer.aiOffer ? 'Regenerate Offer' : t.marketing.generateWithAI}
                        variant="outline"
                        size="sm"
                        onPress={() => generatePersonalizedOffer(customer)}
                        loading={isGenerating}
                        icon={<Ionicons name="sparkles" size={16} color="#F59E0B" />}
                        style={styles.generateButton}
                        textStyle={{ color: '#F59E0B' }}
                      />
                      <Pressable
                        style={styles.viewButton}
                        onPress={() => router.push(`/loyalty/customer/${customer.customerId}`)}
                      >
                        <Text style={styles.viewButtonText}>View</Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                      </Pressable>
                    </View>
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
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 3,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  valueCard: {
    marginBottom: spacing.lg,
    backgroundColor: `${colors.error}08`,
    borderWidth: 1,
    borderColor: `${colors.error}20`,
  },
  valueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  valueTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.error,
  },
  valueAmount: {
    fontSize: typography.sizes.xxxl,
    fontWeight: '700',
    color: colors.error,
  },
  valueDesc: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
    color: colors.success,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  customerCard: {
    marginBottom: spacing.md,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerInitial: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: '#fff',
  },
  customerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  customerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  customerName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  tierBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  tierText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  customerStats: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  riskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  riskText: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
  },
  probabilitySection: {
    marginTop: spacing.md,
  },
  probabilityBar: {
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  probabilityFill: {
    height: '100%',
    borderRadius: 2,
  },
  offerContainer: {
    marginTop: spacing.md,
    backgroundColor: '#F59E0B10',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  offerTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: '#F59E0B',
  },
  offerText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
  customerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  generateButton: {
    borderColor: '#F59E0B',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  viewButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.primary,
  },
});
