import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { WarehouseScanner, warehouseColors } from '@/components/warehouse';
import { AdjustmentIcon } from '@/components/warehouse/WarehouseIcons';
import { Button } from '@/components/ui/Button';
import { createStockAdjustment } from '@/services/warehouseService';
import { getDataState, getProductByBarcode, updateProduct } from '@/store/dataStore';
import type { Product, StockAdjustmentType } from '@/types';

interface AdjustmentItem {
  product: Product;
  actualCount: number;
  difference: number;
  reason: string;
}

export default function StockAdjustmentScreen() {
  const insets = useSafeAreaInsets();
  const [showScanner, setShowScanner] = useState(false);
  const [items, setItems] = useState<AdjustmentItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [auditNotes, setAuditNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleScan = async (data: string, type: string) => {
    findAndAddProduct(data);
  };

  const findAndAddProduct = (query: string) => {
    let product: Product | undefined = getProductByBarcode(query);
    if (!product) {
      product = getDataState().products.find(
        (p: Product) => p.sku?.toLowerCase() === query.toLowerCase() ||
                        p.barcode?.toLowerCase() === query.toLowerCase()
      );
    }

    if (product) {
      const existingIndex = items.findIndex((i) => i.product.id === product!.id);
      if (existingIndex >= 0) {
        Alert.alert('Внимание', 'Товар уже добавлен в список');
        return;
      }

      setItems([
        ...items,
        {
          product,
          actualCount: product.stock,
          difference: 0,
          reason: '',
        },
      ]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Ошибка', `Товар с кодом "${query}" не найден`);
    }
  };

  const handleActualCountChange = (index: number, text: string) => {
    const value = parseInt(text, 10);
    const newItems = [...items];

    if (isNaN(value) || value < 0) {
      newItems[index].actualCount = 0;
    } else {
      newItems[index].actualCount = value;
    }

    newItems[index].difference = newItems[index].actualCount - newItems[index].product.stock;
    setItems(newItems);
  };

  const handleQuickAdjust = (index: number, delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newItems = [...items];
    const newCount = Math.max(0, newItems[index].actualCount + delta);
    newItems[index].actualCount = newCount;
    newItems[index].difference = newCount - newItems[index].product.stock;
    setItems(newItems);
  };

  const handleReasonChange = (index: number, reason: string) => {
    const newItems = [...items];
    newItems[index].reason = reason;
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setItems(items.filter((_, i) => i !== index));
  };

  const getDifferenceColor = (diff: number) => {
    if (diff > 0) return colors.success;
    if (diff < 0) return colors.error;
    return colors.textSecondary;
  };

  const getDifferenceIcon = (diff: number) => {
    if (diff > 0) return 'trending-up';
    if (diff < 0) return 'trending-down';
    return 'remove';
  };

  const calculateSummary = () => {
    const itemsWithDiff = items.filter((i) => i.difference !== 0);
    const totalIncrease = items.reduce((sum, i) => sum + (i.difference > 0 ? i.difference : 0), 0);
    const totalDecrease = Math.abs(items.reduce((sum, i) => sum + (i.difference < 0 ? i.difference : 0), 0));
    const totalValueChange = items.reduce(
      (sum, i) => sum + i.difference * i.product.costPrice,
      0
    );

    return { itemsWithDiff: itemsWithDiff.length, totalIncrease, totalDecrease, totalValueChange };
  };

  const handleSubmit = async () => {
    const summary = calculateSummary();

    if (items.length === 0) {
      Alert.alert('Ошибка', 'Добавьте товары для корректировки');
      return;
    }

    if (summary.itemsWithDiff === 0) {
      Alert.alert('Внимание', 'Нет товаров с изменениями');
      return;
    }

    const message = `
Будет скорректировано: ${summary.itemsWithDiff} позиций
• Увеличение: +${summary.totalIncrease} ед.
• Уменьшение: -${summary.totalDecrease} ед.
• Изменение стоимости: ${summary.totalValueChange >= 0 ? '+' : ''}${summary.totalValueChange.toLocaleString('ru-RU')} ₽

Продолжить?
    `.trim();

    Alert.alert('Подтверждение корректировки', message, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Применить',
        style: 'default',
        onPress: performAdjustment,
      },
    ]);
  };

  const performAdjustment = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsSubmitting(true);

    try {
      const referenceNumber = `ADJ-${Date.now().toString(36).toUpperCase()}`;
      let successCount = 0;

      for (const item of items) {
        if (item.difference === 0) continue;

        const adjustmentType: StockAdjustmentType = item.difference > 0 ? 'count' : 'count';

        await createStockAdjustment({
          productId: item.product.id,
          productName: item.product.name,
          productSku: item.product.sku,
          adjustmentType,
          quantityChange: item.difference,
          previousStock: item.product.stock,
          newStock: item.actualCount,
          unitCost: item.product.costPrice,
          totalValue: Math.abs(item.difference * item.product.costPrice),
          reason: item.reason || auditNotes || 'Инвентаризация',
          referenceNumber,
        });

        await updateProduct(item.product.id, {
          stock: item.actualCount,
        });

        successCount++;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Успешно',
        `Корректировка ${referenceNumber} выполнена\nОбработано ${successCount} позиций`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating adjustment:', error);
      Alert.alert('Ошибка', 'Не удалось выполнить корректировку');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderItem = ({ item, index }: { item: AdjustmentItem; index: number }) => (
    <Animated.View
      entering={SlideInRight.delay(index * 50)}
      style={styles.itemCard}
    >
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.product.name}
          </Text>
          <Text style={styles.itemSku}>
            SKU: {item.product.sku}
          </Text>
        </View>
        <Pressable onPress={() => handleRemoveItem(index)} hitSlop={10}>
          <Ionicons name="close-circle" size={24} color={colors.error} />
        </Pressable>
      </View>

      {/* Stock Comparison */}
      <View style={styles.stockComparison}>
        {/* System Stock */}
        <View style={styles.stockColumn}>
          <Text style={styles.stockLabel}>По системе</Text>
          <Text style={styles.systemStock}>{item.product.stock}</Text>
        </View>

        {/* Arrow */}
        <View style={styles.arrowContainer}>
          <Ionicons
            name={getDifferenceIcon(item.difference) as keyof typeof Ionicons.glyphMap}
            size={24}
            color={getDifferenceColor(item.difference)}
          />
        </View>

        {/* Actual Count */}
        <View style={styles.stockColumn}>
          <Text style={styles.stockLabel}>Факт</Text>
          <View style={styles.actualCountContainer}>
            <Pressable
              style={styles.quickButton}
              onPress={() => handleQuickAdjust(index, -1)}
            >
              <Ionicons name="remove" size={20} color={colors.text} />
            </Pressable>
            <TextInput
              style={styles.actualCountInput}
              value={String(item.actualCount)}
              onChangeText={(text) => handleActualCountChange(index, text)}
              keyboardType="numeric"
              selectTextOnFocus
            />
            <Pressable
              style={styles.quickButton}
              onPress={() => handleQuickAdjust(index, 1)}
            >
              <Ionicons name="add" size={20} color={colors.text} />
            </Pressable>
          </View>
        </View>

        {/* Difference */}
        <View style={styles.stockColumn}>
          <Text style={styles.stockLabel}>Разница</Text>
          <Text
            style={[
              styles.differenceValue,
              { color: getDifferenceColor(item.difference) },
            ]}
          >
            {item.difference > 0 ? '+' : ''}{item.difference}
          </Text>
        </View>
      </View>

      {/* Reason Input */}
      <TextInput
        style={styles.reasonInput}
        placeholder="Причина расхождения (опционально)"
        placeholderTextColor={colors.textLight}
        value={item.reason}
        onChangeText={(text) => handleReasonChange(index, text)}
      />

      {/* Value Impact */}
      {item.difference !== 0 && (
        <View style={[
          styles.valueImpact,
          { backgroundColor: item.difference > 0 ? `${colors.success}10` : `${colors.error}10` }
        ]}>
          <Ionicons
            name={item.difference > 0 ? 'trending-up' : 'trending-down'}
            size={16}
            color={item.difference > 0 ? colors.success : colors.error}
          />
          <Text style={[
            styles.valueImpactText,
            { color: item.difference > 0 ? colors.success : colors.error }
          ]}>
            {item.difference > 0 ? '+' : ''}{(item.difference * item.product.costPrice).toLocaleString('ru-RU')} ₽
          </Text>
        </View>
      )}
    </Animated.View>
  );

  const summary = calculateSummary();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Инвентаризация',
          headerRight: () => (
            <Pressable
              onPress={() => setShowScanner(true)}
              style={styles.headerButton}
            >
              <Ionicons name="scan" size={24} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info Banner */}
        <Animated.View entering={FadeIn} style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={styles.infoBannerText}>
            Введите фактическое количество товара. Система автоматически рассчитает расхождение.
          </Text>
        </Animated.View>

        {/* Scan Button */}
        <Animated.View entering={FadeIn.delay(50)}>
          <Pressable
            style={styles.scanButton}
            onPress={() => setShowScanner(true)}
          >
            <View style={styles.scanButtonIcon}>
              <AdjustmentIcon size={32} color={warehouseColors.adjustment} />
            </View>
            <View style={styles.scanButtonContent}>
              <Text style={styles.scanButtonTitle}>
                Сканировать товар
              </Text>
              <Text style={styles.scanButtonSubtitle}>
                Или введите код вручную
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={warehouseColors.adjustment}
            />
          </Pressable>
        </Animated.View>

        {/* Search Input */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск по названию, SKU или штрих-коду"
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => {
              if (searchQuery) {
                findAndAddProduct(searchQuery);
                setSearchQuery('');
              }
            }}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textLight} />
            </Pressable>
          )}
        </Animated.View>

        {/* Items List */}
        {items.length > 0 && (
          <Animated.View entering={FadeIn.delay(150)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Товары для проверки ({items.length})
              </Text>
              {items.length > 0 && (
                <Pressable onPress={() => setItems([])}>
                  <Text style={styles.clearAllText}>Очистить все</Text>
                </Pressable>
              )}
            </View>
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(_, index) => index.toString()}
              scrollEnabled={false}
            />
          </Animated.View>
        )}

        {/* Empty State */}
        {items.length === 0 && (
          <Animated.View entering={FadeIn.delay(200)} style={styles.emptyState}>
            <AdjustmentIcon size={64} color={colors.textLight} />
            <Text style={styles.emptyTitle}>Добавьте товары</Text>
            <Text style={styles.emptyText}>
              Сканируйте штрих-коды или найдите товары через поиск
            </Text>
          </Animated.View>
        )}

        {/* Audit Notes */}
        {items.length > 0 && (
          <Animated.View entering={FadeIn.delay(250)} style={styles.section}>
            <Text style={styles.sectionTitle}>Комментарий к инвентаризации</Text>
            <TextInput
              style={[styles.searchInput, styles.notesInput]}
              placeholder="Общие заметки или причина проведения..."
              placeholderTextColor={colors.textLight}
              value={auditNotes}
              onChangeText={setAuditNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </Animated.View>
        )}

        {/* Summary */}
        {items.length > 0 && (
          <Animated.View entering={FadeIn.delay(300)} style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Итоги инвентаризации</Text>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{items.length}</Text>
                <Text style={styles.summaryLabel}>Проверено</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.success }]}>
                  +{summary.totalIncrease}
                </Text>
                <Text style={styles.summaryLabel}>Излишек</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.error }]}>
                  -{summary.totalDecrease}
                </Text>
                <Text style={styles.summaryLabel}>Недостача</Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Изменение стоимости</Text>
              <Text
                style={[
                  styles.totalValue,
                  { color: summary.totalValueChange >= 0 ? colors.success : colors.error },
                ]}
              >
                {summary.totalValueChange >= 0 ? '+' : ''}
                {summary.totalValueChange.toLocaleString('ru-RU')} ₽
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Submit */}
        {items.length > 0 && (
          <Animated.View entering={FadeIn.delay(350)} style={styles.submitContainer}>
            <Button
              title="Применить корректировки"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={summary.itemsWithDiff === 0}
              style={{
                width: '100%',
                backgroundColor: summary.itemsWithDiff > 0 ? warehouseColors.adjustment : colors.textLight,
              }}
            />
          </Animated.View>
        )}

        <View style={{ height: insets.bottom + spacing.lg }} />
      </ScrollView>

      {/* Scanner */}
      <WarehouseScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
        title="Сканирование для инвентаризации"
        description="Наведите на штрих-код товара"
        mode="continuous"
        scanDelay={1500}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${colors.primary}10`,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  infoBannerText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.primary,
    lineHeight: typography.sizes.sm * 1.4,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${warehouseColors.adjustment}15`,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: warehouseColors.adjustment,
    padding: spacing.md,
    gap: spacing.md,
  },
  scanButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonContent: {
    flex: 1,
  },
  scanButtonTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: warehouseColors.adjustment,
  },
  scanButtonSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
    paddingVertical: 4,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  clearAllText: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: warehouseColors.adjustment,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  itemName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  itemSku: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  stockComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  stockColumn: {
    alignItems: 'center',
    flex: 1,
  },
  stockLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  systemStock: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  arrowContainer: {
    paddingHorizontal: spacing.sm,
  },
  actualCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: warehouseColors.adjustment,
  },
  quickButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actualCountInput: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
    minWidth: 50,
    textAlign: 'center',
    paddingVertical: 4,
  },
  differenceValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
  },
  reasonInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  valueImpact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  valueImpactText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  summaryTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  summaryLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  totalValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
  },
  submitContainer: {
    marginTop: spacing.md,
  },
});
