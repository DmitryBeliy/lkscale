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
import { ChurnRiskCustomer, CustomerTier, MarketingCampaign } from '@/types';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

const TIER_COLORS: Record<CustomerTier, string> = {
  standard: '#6B7280',
  silver: '#64748B',
  gold: '#F59E0B',
  vip: '#8B5CF6',
};

export default function MarketingDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { t, formatCurrency } = useLocalization();
  const [churnRiskCustomers, setChurnRiskCustomers] = useState<ChurnRiskCustomer[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const user = getAuthState().user;

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      // Load customers at churn risk (30+ days since last visit)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data: customersData, error: customersError } = await (supabase as any)
        .from('customers')
        .select(`
          *,
          customer_loyalty (*)
        `)
        .eq('user_id', user.id)
        .lt('last_order_date', thirtyDaysAgo)
        .order('total_spent', { ascending: false })
        .limit(10);

      if (!customersError && customersData) {
        const now = new Date();
        const churnCustomers: ChurnRiskCustomer[] = customersData.map((c: any) => {
          const lastVisit = c.last_order_date ? new Date(c.last_order_date) : null;
          const daysSince = lastVisit
            ? Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
            : 999;

          const loyaltyData = c.customer_loyalty?.[0] || c.customer_loyalty;

          return {
            customerId: c.id,
            customerName: c.name || 'Unknown',
            daysSinceLastVisit: daysSince,
            totalSpent: c.total_spent || 0,
            tier: loyaltyData?.tier || 'standard',
            favoriteProducts: loyaltyData?.favorite_products || [],
            churnProbability: Math.min(0.95, daysSince / 100),
          };
        });
        setChurnRiskCustomers(churnCustomers);
      }

      // Load recent campaigns
      const { data: campaignsData, error: campaignsError } = await (supabase as any)
        .from('marketing_campaigns')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!campaignsError && campaignsData) {
        const transformedCampaigns: MarketingCampaign[] = campaignsData.map((c: any) => ({
          id: c.id,
          ownerId: c.owner_id,
          name: c.name,
          campaignType: c.campaign_type as MarketingCampaign['campaignType'],
          status: c.status as MarketingCampaign['status'],
          targetCustomers: c.target_customers || [],
          targetTier: c.target_tier || [],
          aiGenerated: c.ai_generated || false,
          messageTemplate: c.message_template || undefined,
          offerDetails: c.offer_details || undefined,
          stats: c.stats || { sent: 0, opened: 0, converted: 0 },
          scheduledAt: c.scheduled_at || undefined,
          completedAt: c.completed_at || undefined,
          createdAt: c.created_at || new Date().toISOString(),
          updatedAt: c.updated_at,
        }));
        setCampaigns(transformedCampaigns);
      }
    } catch (error) {
      console.error('Error loading marketing data:', error);
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

  const getCampaignTypeIcon = (type: MarketingCampaign['campaignType']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'churn_prevention': return 'warning';
      case 'win_back': return 'heart';
      case 'vip_rewards': return 'diamond';
      case 'seasonal': return 'calendar';
      default: return 'megaphone';
    }
  };

  const getCampaignTypeColor = (type: MarketingCampaign['campaignType']): string => {
    switch (type) {
      case 'churn_prevention': return colors.error;
      case 'win_back': return '#EC4899';
      case 'vip_rewards': return '#8B5CF6';
      case 'seasonal': return colors.success;
      default: return colors.primary;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>{t.marketing.title}</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* AI-Powered Tools Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles.sectionTitle}>AI-Powered Tools</Text>
          <View style={styles.toolsGrid}>
            <Pressable
              style={styles.toolCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/marketing/churn-analysis');
              }}
            >
              <LinearGradient colors={[colors.error, '#DC2626']} style={styles.toolIcon}>
                <Ionicons name="warning" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.toolTitle}>{t.loyalty.churnRisk}</Text>
              <Text style={styles.toolDesc}>Identify at-risk customers</Text>
              <View style={styles.toolBadge}>
                <Ionicons name="sparkles" size={12} color="#F59E0B" />
                <Text style={styles.toolBadgeText}>AI</Text>
              </View>
            </Pressable>

            <Pressable
              style={styles.toolCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/marketing/staff-performance');
              }}
            >
              <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.toolIcon}>
                <Ionicons name="people" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.toolTitle}>{t.staffPerformance.title}</Text>
              <Text style={styles.toolDesc}>Analyze team performance</Text>
              <View style={styles.toolBadge}>
                <Ionicons name="sparkles" size={12} color="#F59E0B" />
                <Text style={styles.toolBadgeText}>AI</Text>
              </View>
            </Pressable>
          </View>
        </Animated.View>

        {/* Churn Risk Alert */}
        {churnRiskCustomers.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <Pressable
              onPress={() => router.push('/marketing/churn-analysis')}
            >
              <Card style={[styles.alertCard, { borderLeftColor: colors.error }]}>
                <View style={styles.alertHeader}>
                  <View style={[styles.alertIcon, { backgroundColor: `${colors.error}15` }]}>
                    <Ionicons name="alert-circle" size={20} color={colors.error} />
                  </View>
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertTitle}>{churnRiskCustomers.length} customers at risk</Text>
                    <Text style={styles.alertDesc}>Not visited in 30+ days</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                </View>

                <View style={styles.alertCustomers}>
                  {churnRiskCustomers.slice(0, 3).map((customer, index) => (
                    <View key={customer.customerId} style={styles.alertCustomerChip}>
                      <View style={[styles.alertCustomerDot, { backgroundColor: TIER_COLORS[customer.tier] }]} />
                      <Text style={styles.alertCustomerName} numberOfLines={1}>
                        {customer.customerName}
                      </Text>
                      <Text style={styles.alertCustomerDays}>{customer.daysSinceLastVisit}d</Text>
                    </View>
                  ))}
                  {churnRiskCustomers.length > 3 && (
                    <View style={styles.alertMoreBadge}>
                      <Text style={styles.alertMoreText}>+{churnRiskCustomers.length - 3}</Text>
                    </View>
                  )}
                </View>
              </Card>
            </Pressable>
          </Animated.View>
        )}

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <Pressable
              style={styles.actionCard}
              onPress={() => router.push('/loyalty/coupon/create')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#F59E0B15' }]}>
                <Ionicons name="ticket" size={22} color="#F59E0B" />
              </View>
              <Text style={styles.actionLabel}>{t.coupons.createCoupon}</Text>
            </Pressable>

            <Pressable
              style={styles.actionCard}
              onPress={() => router.push('/loyalty')}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name="gift" size={22} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>{t.loyalty.title}</Text>
            </Pressable>

            <Pressable
              style={styles.actionCard}
              onPress={() => router.push('/customers')}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${colors.success}15` }]}>
                <Ionicons name="people" size={22} color={colors.success} />
              </View>
              <Text style={styles.actionLabel}>{t.nav.customers}</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Recent Campaigns */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.marketing.campaigns}</Text>
          </View>

          {campaigns.length === 0 ? (
            <Card style={styles.emptyState}>
              <Ionicons name="megaphone-outline" size={40} color={colors.textLight} />
              <Text style={styles.emptyTitle}>{t.marketing.noCampaigns}</Text>
              <Text style={styles.emptySubtitle}>Create your first campaign</Text>
            </Card>
          ) : (
            campaigns.map((campaign, index) => (
              <Animated.View key={campaign.id} entering={FadeInRight.delay(index * 80).duration(400)}>
                <Card style={styles.campaignCard}>
                  <View style={styles.campaignHeader}>
                    <View
                      style={[
                        styles.campaignIcon,
                        { backgroundColor: `${getCampaignTypeColor(campaign.campaignType)}15` },
                      ]}
                    >
                      <Ionicons
                        name={getCampaignTypeIcon(campaign.campaignType)}
                        size={18}
                        color={getCampaignTypeColor(campaign.campaignType)}
                      />
                    </View>
                    <View style={styles.campaignInfo}>
                      <View style={styles.campaignNameRow}>
                        <Text style={styles.campaignName}>{campaign.name}</Text>
                        {campaign.aiGenerated && (
                          <View style={styles.aiBadge}>
                            <Ionicons name="sparkles" size={10} color="#F59E0B" />
                          </View>
                        )}
                      </View>
                      <Text style={styles.campaignType}>
                        {t.marketing[campaign.campaignType.replace('_', '') as keyof typeof t.marketing] || campaign.campaignType}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            campaign.status === 'active'
                              ? `${colors.success}15`
                              : campaign.status === 'completed'
                              ? `${colors.textSecondary}15`
                              : `${colors.warning}15`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              campaign.status === 'active'
                                ? colors.success
                                : campaign.status === 'completed'
                                ? colors.textSecondary
                                : colors.warning,
                          },
                        ]}
                      >
                        {campaign.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.campaignStats}>
                    <View style={styles.campaignStat}>
                      <Text style={styles.campaignStatValue}>{campaign.stats.sent}</Text>
                      <Text style={styles.campaignStatLabel}>{t.marketing.sent}</Text>
                    </View>
                    <View style={styles.campaignStat}>
                      <Text style={styles.campaignStatValue}>{campaign.stats.opened}</Text>
                      <Text style={styles.campaignStatLabel}>{t.marketing.opened}</Text>
                    </View>
                    <View style={styles.campaignStat}>
                      <Text style={[styles.campaignStatValue, { color: colors.success }]}>
                        {campaign.stats.converted}
                      </Text>
                      <Text style={styles.campaignStatLabel}>{t.marketing.converted}</Text>
                    </View>
                  </View>
                </Card>
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
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  toolsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  toolCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    position: 'relative',
    ...shadows.sm,
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  toolTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  toolDesc: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  toolBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B15',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 2,
  },
  toolBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F59E0B',
  },
  alertCard: {
    borderLeftWidth: 4,
    marginBottom: spacing.lg,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  alertTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  alertDesc: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  alertCustomers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  alertCustomerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  alertCustomerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  alertCustomerName: {
    fontSize: typography.sizes.xs,
    fontWeight: '500',
    color: colors.text,
    maxWidth: 80,
  },
  alertCustomerDays: {
    fontSize: typography.sizes.xs,
    color: colors.error,
    fontWeight: '600',
  },
  alertMoreBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.full,
  },
  alertMoreText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  campaignCard: {
    marginBottom: spacing.sm,
  },
  campaignHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  campaignIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  campaignInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  campaignNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  campaignName: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  aiBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F59E0B15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  campaignType: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  campaignStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  campaignStat: {
    alignItems: 'center',
  },
  campaignStatValue: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  campaignStatLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
