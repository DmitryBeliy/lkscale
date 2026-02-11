import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { SupplierIcon } from './WarehouseIcons';
import type { Supplier } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SupplierCardProps {
  supplier: Supplier;
  onPress: () => void;
  onCall?: () => void;
  onEmail?: () => void;
  showQuickActions?: boolean;
}

export const SupplierCard: React.FC<SupplierCardProps> = ({
  supplier,
  onPress,
  onCall,
  onEmail,
  showQuickActions = true,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const handleCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCall?.();
  };

  const handleEmail = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onEmail?.();
  };

  const renderRating = () => {
    if (!supplier.rating) return null;
    const fullStars = Math.floor(supplier.rating);
    const hasHalfStar = supplier.rating % 1 >= 0.5;

    return (
      <View style={styles.ratingContainer}>
        {[...Array(5)].map((_, i) => (
          <Ionicons
            key={i}
            name={
              i < fullStars
                ? 'star'
                : i === fullStars && hasHalfStar
                ? 'star-half'
                : 'star-outline'
            }
            size={14}
            color={colors.warning}
          />
        ))}
        <Text style={styles.ratingText}>{supplier.rating.toFixed(1)}</Text>
      </View>
    );
  };

  return (
    <AnimatedPressable
      style={[animatedStyle, styles.card]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View entering={FadeIn} style={styles.content}>
        <View style={styles.leftSection}>
          <View
            style={[
              styles.avatarContainer,
              !supplier.isActive && styles.inactiveAvatar,
            ]}
          >
            <SupplierIcon
              size={28}
              color={supplier.isActive ? colors.primary : colors.textLight}
            />
          </View>
        </View>

        <View style={styles.mainSection}>
          <View style={styles.headerRow}>
            <Text style={styles.name} numberOfLines={1}>
              {supplier.name}
            </Text>
            {!supplier.isActive && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveBadgeText}>Неактивен</Text>
              </View>
            )}
          </View>

          {supplier.contactName && (
            <Text style={styles.contactName} numberOfLines={1}>
              {supplier.contactName}
            </Text>
          )}

          <View style={styles.infoRow}>
            {supplier.leadTimeDays && (
              <View style={styles.infoBadge}>
                <Ionicons
                  name="time-outline"
                  size={12}
                  color={colors.textSecondary}
                />
                <Text style={styles.infoBadgeText}>
                  {supplier.leadTimeDays} дн.
                </Text>
              </View>
            )}
            {supplier.paymentTerms && (
              <View style={styles.infoBadge}>
                <Ionicons
                  name="card-outline"
                  size={12}
                  color={colors.textSecondary}
                />
                <Text style={styles.infoBadgeText} numberOfLines={1}>
                  {supplier.paymentTerms}
                </Text>
              </View>
            )}
          </View>

          {renderRating()}

          {supplier.totalOrders !== undefined && supplier.totalOrders > 0 && (
            <View style={styles.statsRow}>
              <Text style={styles.statsText}>
                Заказов: {supplier.totalOrders}
              </Text>
              {supplier.totalSpent !== undefined && (
                <Text style={styles.statsText}>
                  Сумма: {supplier.totalSpent.toLocaleString('ru-RU')} ₽
                </Text>
              )}
            </View>
          )}
        </View>

        {showQuickActions && (
          <View style={styles.actionsSection}>
            {supplier.phone && (
              <Pressable
                style={styles.actionButton}
                onPress={handleCall}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="call-outline" size={20} color={colors.success} />
              </Pressable>
            )}
            {supplier.email && (
              <Pressable
                style={styles.actionButton}
                onPress={handleEmail}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="mail-outline" size={20} color={colors.primary} />
              </Pressable>
            )}
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textLight}
            />
          </View>
        )}
      </Animated.View>
    </AnimatedPressable>
  );
};

// Compact supplier card for selection lists
interface SupplierSelectCardProps {
  supplier: Supplier;
  selected?: boolean;
  onSelect: () => void;
}

export const SupplierSelectCard: React.FC<SupplierSelectCardProps> = ({
  supplier,
  selected = false,
  onSelect,
}) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect();
  };

  return (
    <Pressable
      style={[
        styles.selectCard,
        selected && styles.selectCardSelected,
      ]}
      onPress={handlePress}
    >
      <View style={styles.selectIconContainer}>
        <SupplierIcon
          size={24}
          color={selected ? colors.primary : colors.textSecondary}
        />
      </View>
      <View style={styles.selectContent}>
        <Text
          style={[
            styles.selectName,
            selected && styles.selectNameSelected,
          ]}
          numberOfLines={1}
        >
          {supplier.name}
        </Text>
        {supplier.leadTimeDays && (
          <Text style={styles.selectSubtext}>
            Срок поставки: {supplier.leadTimeDays} дн.
          </Text>
        )}
      </View>
      {selected && (
        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  content: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  leftSection: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveAvatar: {
    backgroundColor: colors.borderLight,
  },
  mainSection: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  inactiveBadge: {
    backgroundColor: colors.errorLight,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  inactiveBadgeText: {
    fontSize: typography.sizes.xs,
    color: colors.error,
    fontWeight: '600',
  },
  contactName: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 2,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  infoBadgeText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  ratingText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginLeft: 4,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 4,
  },
  statsText: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Select card styles
  selectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  selectCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}08`,
  },
  selectIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectContent: {
    flex: 1,
  },
  selectName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  selectNameSelected: {
    color: colors.primary,
  },
  selectSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default SupplierCard;
