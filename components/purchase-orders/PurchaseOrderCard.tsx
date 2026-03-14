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
import type { PurchaseOrder } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PurchaseOrderCardProps {
  order: PurchaseOrder;
  onPress: () => void;
  showSupplier?: boolean;
}

export const PurchaseOrderCard: React.FC<PurchaseOrderCardProps> = ({
  order,
  onPress,
  showSupplier = true,
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

  const getStatusIcon = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'draft':
        return { icon: 'document-outline', color: colors.textLight, label: 'Черновик' };
      case 'pending':
        return { icon: 'time-outline', color: colors.warning, label: 'В ожидании' };
      case 'ordered':
        return { icon: 'cart-outline', color: colors.primary, label: 'Заказано' };
      case 'partial':
        return { icon: 'git-pull-request-outline', color: colors.info, label: 'Частично' };
      case 'received':
        return { icon: 'checkmark-circle', color: colors.success, label: 'Получено' };
      case 'cancelled':
        return { icon: 'close-circle', color: colors.error, label: 'Отменено' };
      default:
        return { icon: 'help-circle', color: colors.textLight, label: status };
    }
  };

  const statusInfo = getStatusIcon(order.status);

  return (
    <AnimatedPressable
      style={[animatedStyle, styles.card]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View entering={FadeIn} style={styles.content}>
        <View style={styles.header}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <Text style={styles.orderDate}>
              {new Date(order.createdAt).toLocaleDateString('ru-RU')}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}15` }]}>
            <Ionicons name={statusInfo.icon as any} size={14} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {showSupplier && order.supplier && (
          <View style={styles.supplierRow}>
            <Ionicons name="business-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.supplierName} numberOfLines={1}>{order.supplier.name}</Text>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Позиций</Text>
            <Text style={styles.statValue}>{order.totalItems}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Сумма</Text>
            <Text style={styles.statValue}>{order.totalAmount.toLocaleString('ru-RU')} ₽</Text>
          </View>
        </View>

        {order.notes && (
          <View style={styles.notesRow}>
            <Ionicons name="document-text-outline" size={14} color={colors.textLight} />
            <Text style={styles.notesText} numberOfLines={1}>{order.notes}</Text>
          </View>
        )}
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
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  orderDate: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  supplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  supplierName: {
    fontSize: typography.sizes.md,
    color: colors.text,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statItem: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    flex: 1,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  notesText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    flex: 1,
  },
});

export default PurchaseOrderCard;
