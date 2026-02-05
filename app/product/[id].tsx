import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card, Button } from '@/components/ui';
import {
  getProductWithVariants,
  updateVariant,
  addVariant,
  deleteVariant,
  getTotalProductStock,
} from '@/store/dataStore';
import { ProductWithVariants, ProductVariant } from '@/types';
import { useLocalization } from '@/localization';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { t, formatCurrency } = useLocalization();
  const [product, setProduct] = useState<ProductWithVariants | null>(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [variantForm, setVariantForm] = useState({
    sku: '',
    size: '',
    color: '',
    price: '',
    stock: '',
  });

  const loadProduct = () => {
    if (id) {
      const foundProduct = getProductWithVariants(id);
      setProduct(foundProduct || null);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleAction = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Действие', `${action} для товара ${product?.name}`);
  };

  const handleAddVariant = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEditingVariant(null);
    setVariantForm({ sku: '', size: '', color: '', price: '', stock: '' });
    setShowVariantModal(true);
  };

  const handleEditVariant = (variant: ProductVariant) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingVariant(variant);
    setVariantForm({
      sku: variant.sku,
      size: variant.attributes.size || '',
      color: variant.attributes.color || '',
      price: String(variant.price),
      stock: String(variant.stock),
    });
    setShowVariantModal(true);
  };

  const handleDeleteVariant = (variant: ProductVariant) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      t.common.delete,
      `${t.common.confirm} ${variant.name}?`,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: async () => {
            await deleteVariant(variant.id);
            loadProduct();
          },
        },
      ]
    );
  };

  const handleSaveVariant = async () => {
    if (!product) return;

    const price = parseFloat(variantForm.price);
    const stock = parseInt(variantForm.stock, 10);

    if (isNaN(price) || isNaN(stock)) {
      Alert.alert(t.common.error, 'Invalid price or stock value');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (editingVariant) {
      await updateVariant(editingVariant.id, {
        sku: variantForm.sku,
        attributes: {
          size: variantForm.size || undefined,
          color: variantForm.color || undefined,
        },
        price,
        stock,
      });
    } else {
      const variantName = [
        product.name,
        variantForm.size,
        variantForm.color,
      ].filter(Boolean).join(' - ');

      await addVariant({
        productId: product.id,
        name: variantName,
        sku: variantForm.sku || `${product.sku}-${Date.now()}`,
        attributes: {
          size: variantForm.size || undefined,
          color: variantForm.color || undefined,
        },
        price,
        stock,
        isActive: true,
      });
    }

    setShowVariantModal(false);
    loadProduct();
  };

  if (!product) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{t.inventory.productNotFound}</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>{t.inventory.productNotFound}</Text>
        </View>
      </View>
    );
  }

  const totalStock = getTotalProductStock(product.id);
  const isLowStock = totalStock <= product.minStock;
  const isOutOfStock = totalStock === 0;
  const stockPercentage = Math.min((totalStock / product.minStock) * 100, 100);

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
                <Text style={styles.inactiveBadgeText}>{t.inventory.inactive}</Text>
              </View>
            )}
            {product.hasVariants && (
              <View style={styles.variantsBadge}>
                <Ionicons name="layers" size={14} color={colors.textInverse} />
                <Text style={styles.variantsBadgeText}>
                  {product.variants?.length} {t.inventory.variants.toLowerCase()}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Product Info */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Card style={styles.infoCard}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productSku}>{t.inventory.sku}: {product.sku}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{t.inventory.price}</Text>
              <Text style={styles.priceValue}>{formatCurrency(product.price)}</Text>
            </View>
            <View style={styles.categoryRow}>
              <Ionicons name="pricetag-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.categoryText}>{product.category}</Text>
            </View>
          </Card>
        </Animated.View>

        {/* Variants Section */}
        {product.hasVariants && product.variants && (
          <Animated.View entering={FadeInDown.delay(250).duration(400)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.inventory.variants}</Text>
              <Pressable style={styles.addVariantButton} onPress={handleAddVariant}>
                <Ionicons name="add" size={20} color={colors.primary} />
                <Text style={styles.addVariantText}>{t.inventory.addVariant}</Text>
              </Pressable>
            </View>

            {product.variants.map((variant, index) => (
              <Card
                key={variant.id}
                style={[
                  styles.variantCard,
                  !variant.isActive && styles.variantCardInactive,
                ]}
              >
                <View style={styles.variantHeader}>
                  <View style={styles.variantInfo}>
                    <Text style={styles.variantName}>{variant.name}</Text>
                    <Text style={styles.variantSku}>{variant.sku}</Text>
                  </View>
                  <View style={styles.variantActions}>
                    <Pressable
                      style={styles.variantActionButton}
                      onPress={() => handleEditVariant(variant)}
                    >
                      <Ionicons name="pencil" size={18} color={colors.primary} />
                    </Pressable>
                    <Pressable
                      style={styles.variantActionButton}
                      onPress={() => handleDeleteVariant(variant)}
                    >
                      <Ionicons name="trash" size={18} color={colors.error} />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.variantAttributes}>
                  {variant.attributes.size && (
                    <View style={styles.attributeChip}>
                      <Ionicons name="resize" size={14} color={colors.textSecondary} />
                      <Text style={styles.attributeText}>{variant.attributes.size}</Text>
                    </View>
                  )}
                  {variant.attributes.color && (
                    <View style={styles.attributeChip}>
                      <Ionicons name="color-palette" size={14} color={colors.textSecondary} />
                      <Text style={styles.attributeText}>{variant.attributes.color}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.variantStats}>
                  <View style={styles.variantStat}>
                    <Text style={styles.variantStatLabel}>{t.inventory.price}</Text>
                    <Text style={styles.variantStatValue}>{formatCurrency(variant.price)}</Text>
                  </View>
                  <View style={styles.variantStat}>
                    <Text style={styles.variantStatLabel}>{t.inventory.stock}</Text>
                    <Text
                      style={[
                        styles.variantStatValue,
                        variant.stock === 0 && styles.variantStatValueError,
                        variant.stock > 0 && variant.stock <= 5 && styles.variantStatValueWarning,
                      ]}
                    >
                      {variant.stock} шт.
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </Animated.View>
        )}

        {/* Add Variant Button (if no variants yet) */}
        {!product.hasVariants && (
          <Animated.View entering={FadeInDown.delay(250).duration(400)}>
            <Pressable style={styles.addFirstVariantCard} onPress={handleAddVariant}>
              <Ionicons name="layers-outline" size={32} color={colors.primary} />
              <Text style={styles.addFirstVariantTitle}>{t.inventory.addVariant}</Text>
              <Text style={styles.addFirstVariantDesc}>
                Добавьте варианты для размеров, цветов и т.д.
              </Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Stock Info */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={styles.sectionTitle}>{t.inventory.stock}</Text>
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
                <Text style={styles.stockLabel}>
                  {product.hasVariants ? 'Общий остаток' : 'Текущий остаток'}
                </Text>
                <Text
                  style={[
                    styles.stockValue,
                    isOutOfStock && styles.stockValueError,
                    isLowStock && !isOutOfStock && styles.stockValueWarning,
                  ]}
                >
                  {totalStock} шт.
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
                <Text style={styles.progressLabel}>{t.inventory.minStock}: {product.minStock}</Text>
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
            <Text style={styles.sectionTitle}>{t.inventory.description}</Text>
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
              <Text style={styles.statValue}>{formatCurrency(product.price * 24, true)}</Text>
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

      {/* Variant Modal */}
      <Modal
        visible={showVariantModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVariantModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + spacing.lg }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingVariant ? t.common.edit : t.inventory.addVariant}
              </Text>
              <Pressable onPress={() => setShowVariantModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.inventory.sku}</Text>
                <TextInput
                  style={styles.input}
                  value={variantForm.sku}
                  onChangeText={(text) => setVariantForm({ ...variantForm, sku: text })}
                  placeholder="SKU-001-M"
                  placeholderTextColor={colors.textLight}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>{t.inventory.size}</Text>
                  <TextInput
                    style={styles.input}
                    value={variantForm.size}
                    onChangeText={(text) => setVariantForm({ ...variantForm, size: text })}
                    placeholder="M, L, XL..."
                    placeholderTextColor={colors.textLight}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>{t.inventory.color}</Text>
                  <TextInput
                    style={styles.input}
                    value={variantForm.color}
                    onChangeText={(text) => setVariantForm({ ...variantForm, color: text })}
                    placeholder="Черный, Белый..."
                    placeholderTextColor={colors.textLight}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>{t.inventory.price}</Text>
                  <TextInput
                    style={styles.input}
                    value={variantForm.price}
                    onChangeText={(text) => setVariantForm({ ...variantForm, price: text })}
                    placeholder="5000"
                    placeholderTextColor={colors.textLight}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>{t.inventory.stock}</Text>
                  <TextInput
                    style={styles.input}
                    value={variantForm.stock}
                    onChangeText={(text) => setVariantForm({ ...variantForm, stock: text })}
                    placeholder="10"
                    placeholderTextColor={colors.textLight}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title={t.common.cancel}
                variant="outline"
                onPress={() => setShowVariantModal(false)}
                style={{ flex: 1 }}
              />
              <Button
                title={t.common.save}
                onPress={handleSaveVariant}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  variantsBadge: {
    position: 'absolute',
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  variantsBadgeText: {
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  addVariantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addVariantText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  variantCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  variantCardInactive: {
    opacity: 0.6,
  },
  variantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  variantInfo: {
    flex: 1,
  },
  variantName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  variantSku: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginTop: 2,
  },
  variantActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  variantActionButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  variantAttributes: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  attributeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  attributeText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  variantStats: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  variantStat: {
    flex: 1,
  },
  variantStatLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  variantStatValue: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  variantStatValueWarning: {
    color: colors.warning,
  },
  variantStatValueError: {
    color: colors.error,
  },
  addFirstVariantCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.borderLight,
  },
  addFirstVariantTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.primary,
    marginTop: spacing.sm,
  },
  addFirstVariantDesc: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  modalBody: {
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});
