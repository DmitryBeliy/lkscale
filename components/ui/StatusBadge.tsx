import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, typography } from '@/constants/theme';

type StatusType = 'pending' | 'processing' | 'completed' | 'cancelled';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
}

const statusConfig: Record<StatusType, { label: string; color: string; bgColor: string }> = {
  pending: {
    label: 'Ожидает',
    color: colors.warning,
    bgColor: colors.warningLight,
  },
  processing: {
    label: 'В работе',
    color: colors.primary,
    bgColor: '#e3f2fd',
  },
  completed: {
    label: 'Выполнен',
    color: colors.success,
    bgColor: colors.successLight,
  },
  cancelled: {
    label: 'Отменён',
    color: colors.error,
    bgColor: colors.errorLight,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = statusConfig[status];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bgColor },
        size === 'sm' && styles.badgeSm,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text
        style={[
          styles.text,
          { color: config.color },
          size === 'sm' && styles.textSm,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  text: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  textSm: {
    fontSize: typography.sizes.xs,
  },
});
