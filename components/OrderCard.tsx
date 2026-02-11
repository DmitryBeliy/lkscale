import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { StatusBadge } from './ui/StatusBadge';
import { Order } from '@/types';
import { colors, spacing, typography } from '@/constants/theme';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      {order.customer && (
        <View style={styles.customerRow}>
          <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.customerName}>{order.customer.name}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.itemsInfo}>
          <Ionicons name="cube-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.itemsText}>{order.itemsCount} товар(ов)</Text>
        </View>
        <Text style={styles.amount}>{formatCurrency(order.totalAmount)}</Text>
      </View>

      <View style={styles.chevron}>
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  orderNumber: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  date: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  customerName: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  itemsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  itemsText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  amount: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  chevron: {
    position: 'absolute',
    right: spacing.md,
    top: '50%',
    marginTop: -10,
  },
});
