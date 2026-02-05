import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Activity } from '@/types';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

interface ActivityItemProps {
  activity: Activity;
}

const getActivityConfig = (type: Activity['type']) => {
  switch (type) {
    case 'order_created':
      return {
        icon: 'cart-outline' as const,
        color: colors.primary,
        bgColor: '#e3f2fd',
      };
    case 'order_completed':
      return {
        icon: 'checkmark-circle-outline' as const,
        color: colors.success,
        bgColor: colors.successLight,
      };
    case 'stock_low':
      return {
        icon: 'warning-outline' as const,
        color: colors.warning,
        bgColor: colors.warningLight,
      };
    case 'payment_received':
      return {
        icon: 'wallet-outline' as const,
        color: colors.success,
        bgColor: colors.successLight,
      };
    default:
      return {
        icon: 'ellipse-outline' as const,
        color: colors.textLight,
        bgColor: colors.background,
      };
  }
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));

  if (minutes < 60) {
    return `${minutes} мин. назад`;
  }
  if (hours < 24) {
    return `${hours} ч. назад`;
  }
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
};

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const config = getActivityConfig(activity.type);

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
        <Ionicons name={config.icon} size={20} color={config.color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{activity.title}</Text>
        <Text style={styles.description} numberOfLines={1}>
          {activity.description}
        </Text>
      </View>
      <Text style={styles.time}>{formatTime(activity.timestamp)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  description: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  time: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
});
