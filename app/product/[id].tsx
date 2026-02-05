import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card, Button } from '@/components/ui';
import { getProductById } from '@/store/dataStore';
import { Product } from '@/types';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (id) {
      const foundProduct = getProductById(id);
      setProduct(foundProduct || null);
    }
  }, [id]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleAction = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Действие', `${action} для товара ${product?.name}`);
  };

  if (!product) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Товар не найден</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>Товар не найден</Text>
        </View>
      </View>
    );
  }

  const isLowStock = product.stock <= product.minStock;
  const isOutOfStock = product.stock === 0;
  const stockPercentage = Math.min((product.stock / product.minStock) * 100, 100);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>
        <Pressable style={styles.moreButton} onPress={() => handleAction('Редактировать')}>
          <Ionicons name="create-outline" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Product Image */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={styles.imageContainer}>
            <View style={styles.imagePlaceholder}>
              <Ionicons name="cube" size={80} color={colors.primary} />
            </View>
            {!product.isActive && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveBadgeText}>Неактивен</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Product Info */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Card style={styles.infoCard}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productSku}>SKU: {product.sku}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Цена</Text>
              <Text style={styles.priceValue}>{formatCurrency(product.price)}</Text>
            </View>
            <View style={styles.categoryRow}>
              <Ionicons name="pricetag-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.categoryText}>{product.category}</Text>
            </View>
          </Card>
        </Animated.View>

        {/* Stock Info */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={styles.sectionTitle}>Остатки на складе</Text>
          <Card
            style={[
              styles.stockCard,
              isLowStock && !isOutOfStock ? styles.stockCardWarning : null,
              isOutOfStock ? styles.stockCardError : null,
            ]}
          >
            <View style={styles.stockHeader}>
              <View style={styles.stockIconContainer}>
                <Ionicons
                  name={isOutOfStock ? 'close-circle' : isLowStock ? 'warning' : 'checkmark-circle'}
                  size={32}
                  color={isOutOfStock ? colors.error : isLowStock ? colors.warning : colors.success}
                />
              </View>
              <View style={styles.stockInfo}>
                <Text style={styles.stockLabel}>Текущий остаток</Text>
                <Text
                  style={[
                    styles.stockValue,
                    isOutOfStock && styles.stockValueError,
                    isLowStock && !isOutOfStock && styles.stockValueWarning,
                  ]}
                >
                  {product.stock} шт.
                </Text>
              </View>
            </View>

            {/* Stock Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${stockPercentage}%` },
                    isOutOfStock && styles.progressFillError,
                    isLowStock && !isOutOfStock && styles.progressFillWarning,
                  ]}
                />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>0</Text>
                <Text style={styles.progressLabel}>Мин: {product.minStock}</Text>
              </View>
            </View>

            {isLowStock && (
              <View style={styles.stockAlert}>
                <Ionicons name="information-circle" size={18} color={colors.warning} />
                <Text style={styles.stockAlertText}>
                  {isOutOfStock
                    ? 'Товар закончился! Необходимо пополнить запасы.'
                    : `Осталось меньше минимального запаса (${product.minStock} шт.)`}
                </Text>
              </View>
            )}
          </Card>
        </Animated.View>

        {/* Description */}
        {product.description && (
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <Text style={styles.sectionTitle}>Описание</Text>
            <Card>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </Card>
          </Animated.View>
        )}

        {/* Quick Stats */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <Text style={styles.sectionTitle}>Статистика</Text>
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Ionicons name="analytics" size={24} color={colors.primary} />
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>Продаж за месяц</Text>
            </Card>
            <Card style={styles.statCard}>
              <Ionicons name="cash" size={24} color={colors.success} />
              <Text style={styles.statValue}>{formatCurrency(product.price * 24)}</Text>
              <Text style={styles.statLabel}>Выручка</Text>
            </Card>
          </View>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.actionsContainer}>
          <Button
            title="Пополнить запасы"
            onPress={() => handleAction('Пополнить')}
            style={styles.actionButton}
            icon={<Ionicons name="add-circle-outline" size={20} color={colors.textInverse} />}
          />
          <Button
            title="Редактировать товар"
            variant="outline"
            onPress={() => handleAction('Редактировать')}
            style={styles.actionButton}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  headerSpacer: {
    width: 40,
  },
  moreButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
  },
  imagePlaceholder: {
    width: 160,
    height: 160,
    borderRadius: borderRadius.xl,
    backgroundColor: `${colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveBadge: {
    position: 'absolute',
    top: 8,
    right: '25%',
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  inactiveBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textInverse,
  },
  infoCard: {
    marginBottom: spacing.lg,
  },
  productName: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  productSku: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  priceLabel: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  priceValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.primary,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  categoryText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  stockCard: {
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  stockCardWarning: {
    borderLeftColor: colors.warning,
  },
  stockCardError: {
    borderLeftColor: colors.error,
  },
  stockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stockIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stockInfo: {
    flex: 1,
  },
  stockLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  stockValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.success,
  },
  stockValueWarning: {
    color: colors.warning,
  },
  stockValueError: {
    color: colors.error,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: borderRadius.full,
  },
  progressFillWarning: {
    backgroundColor: colors.warning,
  },
  progressFillError: {
    backgroundColor: colors.error,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  progressLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  stockAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warningLight,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  stockAlertText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text,
    lineHeight: typography.sizes.sm * 1.4,
  },
  descriptionText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.sizes.sm * 1.6,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  actionsContainer: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    width: '100%',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
});
