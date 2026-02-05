import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { Product } from '@/types';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  showVariantBadge?: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, showVariantBadge }) => {
  const isLowStock = product.stock <= product.minStock;
  const isOutOfStock = product.stock === 0;

  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Ionicons name="cube" size={32} color={colors.primary} />
        {showVariantBadge && (
          <View style={styles.variantBadge}>
            <Ionicons name="layers" size={10} color={colors.textInverse} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {product.name}
          </Text>
          {!product.isActive && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveText}>Неактивен</Text>
            </View>
          )}
        </View>

        <Text style={styles.sku}>SKU: {product.sku}</Text>

        <View style={styles.footer}>
          <View style={styles.stockContainer}>
            <Ionicons
              name={isOutOfStock ? 'close-circle' : isLowStock ? 'warning' : 'checkmark-circle'}
              size={16}
              color={isOutOfStock ? colors.error : isLowStock ? colors.warning : colors.success}
            />
            <Text
              style={[
                styles.stockText,
                isOutOfStock && styles.stockError,
                isLowStock && styles.stockWarning,
              ]}
            >
              {isOutOfStock ? 'Нет в наличии' : `${product.stock} шт.`}
            </Text>
          </View>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
        </View>
      </View>

      <View style={styles.chevron}>
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingRight: spacing.xl,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    position: 'relative',
  },
  variantBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  inactiveBadge: {
    backgroundColor: colors.errorLight,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  inactiveText: {
    fontSize: typography.sizes.xs,
    color: colors.error,
    fontWeight: '500',
  },
  sku: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stockText: {
    fontSize: typography.sizes.sm,
    color: colors.success,
    fontWeight: '500',
  },
  stockWarning: {
    color: colors.warning,
  },
  stockError: {
    color: colors.error,
  },
  price: {
    fontSize: typography.sizes.md,
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
