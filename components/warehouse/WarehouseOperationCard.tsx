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
import { warehouseColors } from './WarehouseButton';
import {
  StockInIcon,
  WriteOffIcon,
  TransferIcon,
  ReturnIcon,
  AdjustmentIcon,
} from './WarehouseIcons';
import type { WarehouseOperation } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface WarehouseOperationCardProps {
  operation: WarehouseOperation;
  onPress: () => void;
  count?: number;
  description?: string;
  disabled?: boolean;
}

const operationConfig: Record<
  WarehouseOperation,
  {
    title: string;
    description: string;
    icon: React.FC<{ size: number; color: string }>;
    color: string;
    bgColor: string;
  }
> = {
  stock_in: {
    title: 'Приемка',
    description: 'Принять товар на склад',
    icon: StockInIcon,
    color: warehouseColors.stockIn,
    bgColor: warehouseColors.stockInBg,
  },
  write_off: {
    title: 'Списание',
    description: 'Списать поврежденный товар',
    icon: WriteOffIcon,
    color: warehouseColors.writeOff,
    bgColor: warehouseColors.writeOffBg,
  },
  transfer: {
    title: 'Перемещение',
    description: 'Переместить между складами',
    icon: TransferIcon,
    color: warehouseColors.transfer,
    bgColor: warehouseColors.transferBg,
  },
  return: {
    title: 'Возврат',
    description: 'Оформить возврат товара',
    icon: ReturnIcon,
    color: warehouseColors.return,
    bgColor: warehouseColors.returnBg,
  },
  adjustment: {
    title: 'Инвентаризация',
    description: 'Корректировка остатков',
    icon: AdjustmentIcon,
    color: warehouseColors.adjustment,
    bgColor: warehouseColors.adjustmentBg,
  },
};

export const WarehouseOperationCard: React.FC<WarehouseOperationCardProps> = ({
  operation,
  onPress,
  count,
  description,
  disabled = false,
}) => {
  const scale = useSharedValue(1);
  const config = operationConfig[operation];
  const IconComponent = config.icon;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onPress();
  };

  return (
    <AnimatedPressable
      style={[
        animatedStyle,
        styles.card,
        { backgroundColor: config.bgColor, borderColor: config.color },
        disabled && styles.disabled,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View entering={FadeIn.delay(100)} style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${config.color}20` },
          ]}
        >
          <IconComponent size={32} color={config.color} />
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: config.color }]}>
            {config.title}
          </Text>
          <Text style={styles.description}>
            {description || config.description}
          </Text>
        </View>

        {count !== undefined && count > 0 && (
          <View
            style={[styles.badge, { backgroundColor: config.color }]}
          >
            <Text style={styles.badgeText}>{count}</Text>
          </View>
        )}

        <Ionicons
          name="chevron-forward"
          size={24}
          color={config.color}
          style={styles.chevron}
        />
      </Animated.View>
    </AnimatedPressable>
  );
};

// Grid variant for dashboard view
interface OperationGridCardProps {
  operation: WarehouseOperation;
  onPress: () => void;
  todayCount?: number;
}

export const OperationGridCard: React.FC<OperationGridCardProps> = ({
  operation,
  onPress,
  todayCount,
}) => {
  const scale = useSharedValue(1);
  const config = operationConfig[operation];
  const IconComponent = config.icon;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onPress();
  };

  return (
    <AnimatedPressable
      style={[
        animatedStyle,
        styles.gridCard,
        { borderColor: config.color, borderWidth: 2 },
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View
        style={[
          styles.gridIconContainer,
          { backgroundColor: config.bgColor },
        ]}
      >
        <IconComponent size={40} color={config.color} />
      </View>
      <Text style={[styles.gridTitle, { color: config.color }]}>
        {config.title}
      </Text>
      {todayCount !== undefined && (
        <Text style={styles.gridCount}>Сегодня: {todayCount}</Text>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  badgeText: {
    color: colors.textInverse,
    fontSize: typography.sizes.xs,
    fontWeight: '700',
  },
  chevron: {
    marginLeft: spacing.xs,
  },
  // Grid styles
  gridCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    ...shadows.sm,
  },
  gridIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  gridTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    marginBottom: 4,
  },
  gridCount: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
});

export default WarehouseOperationCard;
