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
import type { StockAdjustment } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface StockMovementCardProps {
  movement: StockAdjustment;
  onPress?: () => void;
  showProduct?: boolean;
}

export const StockMovementCard: React.FC<StockMovementCardProps> = ({
  movement,
  onPress,
  showProduct = true,
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
    onPress?.();
  };

  const getMovementTypeIcon = (type: StockAdjustment['adjustmentType']) => {
    switch (type) {
      case 'transfer_in':
        return { icon: 'arrow-down', color: colors.success, label: 'Приход' };
      case 'transfer_out':
        return { icon: 'arrow-up', color: colors.error, label: 'Расход' };
      case 'write_off':
        return { icon: 'trash', color: colors.error, label: 'Списание' };
      case 'damage':
        return { icon: 'alert-circle', color: colors.warning, label: 'Брак' };
      case 'theft':
        return { icon: 'warning', color: colors.error, label: 'Кража' };
      case 'count':
        return { icon: 'calculator', color: colors.info, label: 'Инвентаризация' };
      case 'return':
        return { icon: 'return-up-back', color: colors.primary, label: 'Возврат' };
      default:
        return { icon: 'swap-horizontal', color: colors.textSecondary, label: 'Другое' };
    }
  };

  const typeInfo = getMovementTypeIcon(movement.adjustmentType);
  const isPositive = movement.quantityChange > 0;

  return (
    <AnimatedPressable
      style={[animatedStyle, styles.card]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onPress}
    >
      <Animated.View entering={FadeIn} style={styles.content}>
        <View style={styles.leftSection}>
          <View style={[styles.iconContainer, { backgroundColor: `${typeInfo.color}15` }]}>
            <Ionicons name={typeInfo.icon as any} size={24} color={typeInfo.color} />
          </View>
        </View>

        <View style={styles.mainSection}>
          {showProduct && (
            <Text style={styles.productName} numberOfLines={1}>
              {movement.productName}
            </Text>
          )}

          {movement.productSku && (
            <Text style={styles.productSku}>SKU: {movement.productSku}</Text>
          )}

          <View style={styles.metaRow}>
            <View style={[styles.typeBadge, { backgroundColor: `${typeInfo.color}15` }]}>
              <Text style={[styles.typeBadgeText, { color: typeInfo.color }]}>
                {typeInfo.label}
              </Text>
            </View>
            <Text style={styles.dateText}>
              {new Date(movement.createdAt).toLocaleDateString('ru-RU')}
            </Text>
          </View>

          {movement.reason && (
            <Text style={styles.reason} numberOfLines={1}>
              {movement.reason}
            </Text>
          )}
        </View>

        <View style={styles.rightSection}>
          <Text style={[styles.quantityChange, { color: isPositive ? colors.success : colors.error }]}>
            {isPositive ? '+' : ''}{movement.quantityChange}
          </Text>
          <Text style={styles.stockInfo}>
            {movement.previousStock} → {movement.newStock}
          </Text>
          {movement.totalValue !== undefined && (
            <Text style={styles.valueText}>
              {movement.totalValue.toLocaleString('ru-RU')} ₽
            </Text>
          )}
        </View>
      </Animated.View>
    </AnimatedPressable>
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainSection: {
    flex: 1,
    gap: 2,
  },
  productName: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  productSku: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  typeBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  dateText: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  reason: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 4,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  quantityChange: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
  },
  stockInfo: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  valueText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default StockMovementCard;
