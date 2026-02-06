import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/localization';
import { PRICING_PLANS, SubscriptionTier } from '@/types/enterprise';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, typography, borderRadius, shadows, isDark } = useTheme();
  const { t, formatCurrency } = useLocalization();

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>('pro');

  const handleSubscribe = (tier: SubscriptionTier) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // In a real app, this would trigger RevenueCat purchase flow
    router.back();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: insets.top + spacing.sm,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-end',
    },
    headerContent: {
      alignItems: 'center',
      marginTop: spacing.md,
    },
    crown: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255,215,0,0.3)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    headerTitle: {
      fontSize: typography.sizes.xxxl,
      fontWeight: '700',
      color: '#fff',
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: typography.sizes.md,
      color: 'rgba(255,255,255,0.8)',
      textAlign: 'center',
      marginTop: spacing.sm,
      paddingHorizontal: spacing.lg,
    },
    scrollContent: {
      padding: spacing.md,
      paddingBottom: insets.bottom + spacing.xxl,
    },
    billingToggle: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.xs,
      marginBottom: spacing.lg,
    },
    billingOption: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      gap: spacing.xs,
    },
    billingOptionActive: {
      backgroundColor: colors.primary,
    },
    billingText: {
      fontSize: typography.sizes.md,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    billingTextActive: {
      color: '#fff',
    },
    saveBadge: {
      backgroundColor: colors.success,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.full,
    },
    saveBadgeText: {
      fontSize: typography.sizes.xs,
      fontWeight: '700',
      color: '#fff',
    },
    planCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 2,
      borderColor: 'transparent',
      ...shadows.md,
    },
    planCardHighlighted: {
      borderColor: colors.primary,
    },
    planCardSelected: {
      backgroundColor: `${colors.primary}08`,
    },
    popularBadge: {
      position: 'absolute',
      top: -12,
      alignSelf: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
    },
    popularBadgeText: {
      fontSize: typography.sizes.xs,
      fontWeight: '700',
      color: '#fff',
    },
    planHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    planIcon: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    planName: {
      fontSize: typography.sizes.xl,
      fontWeight: '700',
      color: colors.text,
    },
    planDescription: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    planPrice: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: spacing.md,
    },
    priceAmount: {
      fontSize: typography.sizes.xxxl,
      fontWeight: '700',
      color: colors.text,
    },
    pricePeriod: {
      fontSize: typography.sizes.md,
      color: colors.textSecondary,
      marginLeft: spacing.xs,
    },
    originalPrice: {
      fontSize: typography.sizes.md,
      color: colors.textLight,
      textDecorationLine: 'line-through',
      marginLeft: spacing.sm,
    },
    featureList: {
      marginBottom: spacing.md,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    featureIcon: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm,
    },
    featureText: {
      fontSize: typography.sizes.sm,
      color: colors.text,
      flex: 1,
    },
    ctaButton: {
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctaButtonPrimary: {
      backgroundColor: colors.primary,
    },
    ctaButtonOutline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.border,
    },
    ctaButtonText: {
      fontSize: typography.sizes.md,
      fontWeight: '700',
      color: '#fff',
    },
    ctaButtonTextOutline: {
      color: colors.text,
    },
    footer: {
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    footerText: {
      fontSize: typography.sizes.xs,
      color: colors.textLight,
      textAlign: 'center',
    },
    footerLink: {
      fontSize: typography.sizes.xs,
      color: colors.primary,
      marginTop: spacing.sm,
    },
  });

  const getPlanIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free':
        return { icon: 'leaf', color: colors.textSecondary, bg: `${colors.textSecondary}15` };
      case 'basic':
        return { icon: 'rocket', color: colors.primary, bg: `${colors.primary}15` };
      case 'pro':
        return { icon: 'diamond', color: colors.gold, bg: `${colors.gold}15` };
      case 'enterprise':
        return { icon: 'business', color: colors.chart5, bg: `${colors.chart5}15` };
      default:
        return { icon: 'star', color: colors.primary, bg: `${colors.primary}15` };
    }
  };

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      <LinearGradient
        colors={isDark ? ['#1a1a2e', '#16213e'] : [colors.primary, '#1a68d1']}
        style={styles.header}
      >
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color="#fff" />
        </Pressable>

        <Animated.View entering={FadeIn.delay(100).duration(500)} style={styles.headerContent}>
          <View style={styles.crown}>
            <Ionicons name="diamond" size={40} color={colors.gold} />
          </View>
          <Text style={styles.headerTitle}>MaGGaz12 Pro</Text>
          <Text style={styles.headerSubtitle}>
            Разблокируйте все возможности для роста вашего бизнеса
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Billing Period Toggle */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={styles.billingToggle}>
            <Pressable
              style={[styles.billingOption, billingPeriod === 'monthly' && styles.billingOptionActive]}
              onPress={() => setBillingPeriod('monthly')}
            >
              <Text style={[styles.billingText, billingPeriod === 'monthly' && styles.billingTextActive]}>
                {t.subscription.monthlyBilling}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.billingOption, billingPeriod === 'yearly' && styles.billingOptionActive]}
              onPress={() => setBillingPeriod('yearly')}
            >
              <Text style={[styles.billingText, billingPeriod === 'yearly' && styles.billingTextActive]}>
                {t.subscription.yearlyBilling}
              </Text>
              {billingPeriod !== 'yearly' && (
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>-17%</Text>
                </View>
              )}
            </Pressable>
          </View>
        </Animated.View>

        {/* Pricing Plans */}
        {PRICING_PLANS.filter(plan => plan.tier !== 'free').map((plan, index) => {
          const isSelected = selectedPlan === plan.tier;
          const iconConfig = getPlanIcon(plan.tier);
          const price = billingPeriod === 'monthly' ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12);
          const yearlyTotal = plan.yearlyPrice;

          return (
            <Animated.View
              key={plan.tier}
              entering={FadeInDown.delay(300 + index * 100).duration(400)}
            >
              <Pressable
                style={[
                  styles.planCard,
                  plan.highlighted && styles.planCardHighlighted,
                  isSelected && styles.planCardSelected,
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedPlan(plan.tier);
                }}
              >
                {plan.highlighted && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>{t.subscription.popularChoice}</Text>
                  </View>
                )}

                <View style={styles.planHeader}>
                  <View style={[styles.planIcon, { backgroundColor: iconConfig.bg }]}>
                    <Ionicons name={iconConfig.icon as any} size={24} color={iconConfig.color} />
                  </View>
                  <View>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planDescription}>{plan.description}</Text>
                  </View>
                </View>

                <View style={styles.planPrice}>
                  <Text style={styles.priceAmount}>
                    {price === 0 ? 'Бесплатно' : `${price.toLocaleString('ru-RU')} ₽`}
                  </Text>
                  {price > 0 && (
                    <Text style={styles.pricePeriod}>/мес</Text>
                  )}
                  {billingPeriod === 'yearly' && price > 0 && plan.monthlyPrice !== price && (
                    <Text style={styles.originalPrice}>
                      {plan.monthlyPrice.toLocaleString('ru-RU')} ₽
                    </Text>
                  )}
                </View>

                <View style={styles.featureList}>
                  {plan.features.map((feature, i) => (
                    <View key={i} style={styles.featureItem}>
                      <View style={[styles.featureIcon, { backgroundColor: `${colors.success}15` }]}>
                        <Ionicons name="checkmark" size={14} color={colors.success} />
                      </View>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <Pressable
                  style={[
                    styles.ctaButton,
                    isSelected ? styles.ctaButtonPrimary : styles.ctaButtonOutline,
                  ]}
                  onPress={() => handleSubscribe(plan.tier)}
                >
                  <Text style={[
                    styles.ctaButtonText,
                    !isSelected && styles.ctaButtonTextOutline,
                  ]}>
                    {plan.tier === 'enterprise' ? t.subscription.contactSales : t.subscription.subscribe}
                  </Text>
                </Pressable>

                {billingPeriod === 'yearly' && price > 0 && (
                  <Text style={{ fontSize: typography.sizes.xs, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }}>
                    {yearlyTotal.toLocaleString('ru-RU')} ₽/год • 7 {t.subscription.trialDays}
                  </Text>
                )}
              </Pressable>
            </Animated.View>
          );
        })}

        {/* Footer */}
        <Animated.View entering={FadeInDown.delay(700).duration(400)} style={styles.footer}>
          <Text style={styles.footerText}>
            Отмена подписки возможна в любое время.{'\n'}
            Автоматическое продление после окончания периода.
          </Text>
          <Pressable>
            <Text style={styles.footerLink}>Условия использования и Политика конфиденциальности</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
