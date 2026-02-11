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

  // Calculate margin
  const margin = product.costPrice > 0
    ? Math.round(((product.price - product.costPrice) / product.price) * 100)
    : 0;
  const profit = product.price - (product.costPrice || 0);

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

        <View style={styles.skuRow}>
          <Text style={styles.sku}>SKU: {product.sku}</Text>
          {margin > 0 && (
            <View style={[styles.marginBadge, margin >= 40 ? styles.marginHigh : margin >= 25 ? styles.marginMedium : styles.marginLow]}>
              <Text style={[styles.marginText, margin >= 40 ? styles.marginTextHigh : margin >= 25 ? styles.marginTextMedium : styles.marginTextLow]}>
                {margin}%
              </Text>
            </View>
          )}
        </View>

        <View style={styles.priceRow}>
          {product.costPrice > 0 && (
            <Text style={styles.costPrice}>
              Себест.: {formatCurrency(product.costPrice)}
            </Text>
          )}
        </View>

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
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>
            {profit > 0 && (
              <Text style={styles.profitText}>+{formatCurrency(profit)}</Text>
            )}
          </View>
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
  skuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  sku: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  marginBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  marginHigh: {
    backgroundColor: `${colors.success}15`,
  },
  marginMedium: {
    backgroundColor: `${colors.warning}15`,
  },
  marginLow: {
    backgroundColor: `${colors.textLight}15`,
  },
  marginText: {
    fontSize: 10,
    fontWeight: '700',
  },
  marginTextHigh: {
    color: colors.success,
  },
  marginTextMedium: {
    color: colors.warning,
  },
  marginTextLow: {
    color: colors.textSecondary,
  },
  priceRow: {
    marginBottom: spacing.xs,
  },
  costPrice: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  profitText: {
    fontSize: typography.sizes.xs,
    color: colors.success,
    fontWeight: '500',
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
