import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onPress?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  icon,
  iconColor = colors.primary,
  onPress,
}) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  const getChangeBadgeStyle = (): ViewStyle[] => {
    const styleArray: ViewStyle[] = [styles.changeBadge];
    if (isPositive) styleArray.push(styles.changePositive);
    if (isNegative) styleArray.push(styles.changeNegative);
    return styleArray;
  };

  const getChangeTextStyle = (): TextStyle[] => {
    const styleArray: TextStyle[] = [styles.changeText];
    if (isPositive) styleArray.push(styles.changeTextPositive);
    if (isNegative) styleArray.push(styles.changeTextNegative);
    return styleArray;
  };

  return (
    <Card style={styles.card} onPress={onPress} variant="elevated">
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={icon} size={24} color={iconColor} />
        </View>
        {change !== undefined && (
          <View style={getChangeBadgeStyle()}>
            <Ionicons
              name={isPositive ? 'trending-up' : isNegative ? 'trending-down' : 'remove'}
              size={12}
              color={isPositive ? colors.success : isNegative ? colors.error : colors.textLight}
            />
            <Text style={getChangeTextStyle()}>
              {Math.abs(change).toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
  },
  changePositive: {
    backgroundColor: colors.successLight,
  },
  changeNegative: {
    backgroundColor: colors.errorLight,
  },
  changeText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textLight,
    marginLeft: 2,
  },
  changeTextPositive: {
    color: colors.success,
  },
  changeTextNegative: {
    color: colors.error,
  },
  value: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
