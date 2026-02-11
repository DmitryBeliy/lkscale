import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button, Input } from '@/components/ui';
import { useLocalization } from '@/localization';
import { getAuthState } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { CouponDiscountType, CustomerTier } from '@/types';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

export default function CreateCouponScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLocalization();
  const [loading, setLoading] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<CouponDiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minPurchase, setMinPurchase] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [isSingleUse, setIsSingleUse] = useState(false);
  const [hasExpiry, setHasExpiry] = useState(false);
  const [selectedTiers, setSelectedTiers] = useState<CustomerTier[]>([]);

  const user = getAuthState().user;

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleTier = (tier: CustomerTier) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    );
  };

  const handleCreate = async () => {
    if (!code.trim()) {
      Alert.alert(t.common.error, 'Please enter a coupon code');
      return;
    }
    if (!name.trim()) {
      Alert.alert(t.common.error, 'Please enter a coupon name');
      return;
    }
    if (!discountValue || parseFloat(discountValue) <= 0) {
      Alert.alert(t.common.error, 'Please enter a valid discount value');
      return;
    }
    if (discountType === 'percentage' && parseFloat(discountValue) > 100) {
      Alert.alert(t.common.error, 'Percentage discount cannot exceed 100%');
      return;
    }

    if (!user) return;

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Check if code already exists
      const { data: existing } = await (supabase as any)
        .from('coupons')
        .select('id')
        .eq('owner_id', user.id)
        .eq('code', code.toUpperCase().trim())
        .single();

      if (existing) {
        Alert.alert(t.common.error, 'A coupon with this code already exists');
        setLoading(false);
        return;
      }

      const validUntil = hasExpiry
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        : null;

      const { error } = await (supabase as any).from('coupons').insert({
        owner_id: user.id,
        code: code.toUpperCase().trim(),
        name: name.trim(),
        description: description.trim() || null,
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        min_purchase_amount: minPurchase ? parseFloat(minPurchase) : 0,
        max_discount_amount: maxDiscount ? parseFloat(maxDiscount) : null,
        usage_limit: usageLimit ? parseInt(usageLimit) : null,
        is_single_use: isSingleUse,
        customer_tier: selectedTiers.length > 0 ? selectedTiers : [],
        valid_from: new Date().toISOString(),
        valid_until: validUntil,
        is_active: true,
      });

      if (error) throw error;

      // Log activity
      await (supabase as any).from('activity_logs').insert({
        owner_id: user.id,
        actor_name: user.name || user.email,
        action_type: 'coupon_created',
        description: `Created coupon ${code.toUpperCase()}`,
        entity_type: 'coupon',
        entity_name: code.toUpperCase(),
      });

      Alert.alert(t.common.success, 'Coupon created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error creating coupon:', error);
      Alert.alert(t.common.error, 'Failed to create coupon');
    } finally {
      setLoading(false);
    }
  };

  const TIERS: { value: CustomerTier; label: string; color: string }[] = [
    { value: 'standard', label: t.loyalty.tiers.standard, color: '#6B7280' },
    { value: 'silver', label: t.loyalty.tiers.silver, color: '#64748B' },
    { value: 'gold', label: t.loyalty.tiers.gold, color: '#F59E0B' },
    { value: 'vip', label: 'VIP', color: '#8B5CF6' },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>{t.coupons.createCoupon}</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Coupon Preview */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.previewCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.previewContent}>
              <Text style={styles.previewCode}>{code || 'CODE'}</Text>
              <Text style={styles.previewDiscount}>
                {discountValue || '0'}{discountType === 'percentage' ? '%' : '₽'} OFF
              </Text>
            </View>
            <View style={styles.previewDash} />
          </LinearGradient>
        </Animated.View>

        {/* Code Input */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.inputLabel}>{t.coupons.couponCode} *</Text>
          <View style={styles.codeInputRow}>
            <Input
              placeholder="e.g., SUMMER20"
              value={code}
              onChangeText={(text) => setCode(text.toUpperCase())}
              autoCapitalize="characters"
              style={styles.codeInput}
            />
            <Pressable style={styles.generateButton} onPress={generateCode}>
              <Ionicons name="dice" size={20} color="#fff" />
            </Pressable>
          </View>
        </Animated.View>

        {/* Name Input */}
        <Animated.View entering={FadeInDown.delay(350).duration(500)}>
          <Text style={styles.inputLabel}>Name *</Text>
          <Input
            placeholder="e.g., Summer Sale Discount"
            value={name}
            onChangeText={setName}
          />
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Text style={styles.inputLabel}>Description (optional)</Text>
          <Input
            placeholder="Describe this coupon..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={2}
          />
        </Animated.View>

        {/* Discount Type */}
        <Animated.View entering={FadeInDown.delay(450).duration(500)}>
          <Text style={styles.inputLabel}>{t.coupons.discountType}</Text>
          <View style={styles.typeSelector}>
            <Pressable
              style={[styles.typeOption, discountType === 'percentage' && styles.typeOptionActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDiscountType('percentage');
              }}
            >
              <Ionicons
                name="trending-down"
                size={20}
                color={discountType === 'percentage' ? '#fff' : colors.textSecondary}
              />
              <Text style={[styles.typeOptionText, discountType === 'percentage' && styles.typeOptionTextActive]}>
                {t.coupons.percentage}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.typeOption, discountType === 'fixed' && styles.typeOptionActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDiscountType('fixed');
              }}
            >
              <Ionicons
                name="cash"
                size={20}
                color={discountType === 'fixed' ? '#fff' : colors.textSecondary}
              />
              <Text style={[styles.typeOptionText, discountType === 'fixed' && styles.typeOptionTextActive]}>
                {t.coupons.fixedAmount}
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Discount Value */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <Text style={styles.inputLabel}>
            {t.coupons.discountValue} * ({discountType === 'percentage' ? '%' : '₽'})
          </Text>
          <Input
            placeholder={discountType === 'percentage' ? 'e.g., 20' : 'e.g., 500'}
            value={discountValue}
            onChangeText={setDiscountValue}
            keyboardType="numeric"
          />
        </Animated.View>

        {/* Min Purchase */}
        <Animated.View entering={FadeInDown.delay(550).duration(500)}>
          <Text style={styles.inputLabel}>{t.coupons.minPurchase} (₽, optional)</Text>
          <Input
            placeholder="e.g., 1000"
            value={minPurchase}
            onChangeText={setMinPurchase}
            keyboardType="numeric"
          />
        </Animated.View>

        {/* Usage Settings */}
        <Animated.View entering={FadeInDown.delay(600).duration(500)}>
          <Card style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{t.coupons.usageLimit}</Text>
                <Text style={styles.settingDesc}>Leave empty for unlimited use</Text>
              </View>
              <Input
                placeholder="∞"
                value={usageLimit}
                onChangeText={setUsageLimit}
                keyboardType="numeric"
                style={styles.limitInput}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{t.coupons.singleUse}</Text>
                <Text style={styles.settingDesc}>Each customer can use once</Text>
              </View>
              <Switch
                value={isSingleUse}
                onValueChange={setIsSingleUse}
                trackColor={{ false: colors.border, true: `${colors.primary}50` }}
                thumbColor={isSingleUse ? colors.primary : colors.textLight}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Expiration</Text>
                <Text style={styles.settingDesc}>Set an expiry date (30 days)</Text>
              </View>
              <Switch
                value={hasExpiry}
                onValueChange={setHasExpiry}
                trackColor={{ false: colors.border, true: `${colors.primary}50` }}
                thumbColor={hasExpiry ? colors.primary : colors.textLight}
              />
            </View>
          </Card>
        </Animated.View>

        {/* Target Tiers */}
        <Animated.View entering={FadeInDown.delay(650).duration(500)}>
          <Text style={styles.inputLabel}>{t.coupons.targetCustomers}</Text>
          <Text style={styles.inputHint}>Leave empty for all customers</Text>
          <View style={styles.tiersGrid}>
            {TIERS.map((tier) => (
              <Pressable
                key={tier.value}
                style={[
                  styles.tierChip,
                  selectedTiers.includes(tier.value) && { backgroundColor: tier.color, borderColor: tier.color },
                ]}
                onPress={() => toggleTier(tier.value)}
              >
                <Text
                  style={[
                    styles.tierChipText,
                    selectedTiers.includes(tier.value) && { color: '#fff' },
                  ]}
                >
                  {tier.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Create Button */}
        <Animated.View entering={FadeInDown.delay(700).duration(500)}>
          <Button
            title={t.coupons.createCoupon}
            onPress={handleCreate}
            loading={loading}
            icon={<Ionicons name="checkmark" size={20} color="#fff" />}
            style={styles.createButton}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  previewCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewContent: {},
  previewCode: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 2,
  },
  previewDiscount: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: spacing.xs,
  },
  previewDash: {
    width: 2,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: spacing.md,
    borderStyle: 'dashed',
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  inputHint: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  codeInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  codeInput: {
    flex: 1,
  },
  generateButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    gap: spacing.sm,
    ...shadows.sm,
  },
  typeOptionActive: {
    backgroundColor: '#F59E0B',
  },
  typeOptionText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  typeOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  inputPrefix: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  settingsCard: {
    marginTop: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  settingDesc: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  limitInput: {
    width: 80,
    textAlign: 'center',
  },
  tiersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tierChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tierChipText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  createButton: {
    marginTop: spacing.xl,
    backgroundColor: '#F59E0B',
  },
});
