import React, { useState, useCallback } from 'react';
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
import { WriteOffIcon } from '@/components/warehouse/WarehouseIcons';
import { Button } from '@/components/ui/Button';
import { createStockAdjustment } from '@/services/warehouseService';
import { getDataState, getProductByBarcode, updateProduct } from '@/store/dataStore';
import type { Product, StockAdjustmentType } from '@/types';

interface WriteOffItem {
  product: Product;
  quantity: number;
  reason: StockAdjustmentType;
  notes: string;
}

const WRITE_OFF_REASONS: { type: StockAdjustmentType; label: string; icon: string }[] = [
  { type: 'damage', label: 'Повреждение', icon: 'alert-circle' },
  { type: 'theft', label: 'Кража', icon: 'warning' },
  { type: 'count', label: 'Инвентаризация', icon: 'calculator' },
  { type: 'write_off', label: 'Просрочка', icon: 'time' },
  { type: 'other', label: 'Другое', icon: 'ellipsis-horizontal' },
];

export default function WriteOffScreen() {
  const insets = useSafeAreaInsets();
  const [showScanner, setShowScanner] = useState(false);
  const [items, setItems] = useState<WriteOffItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalReason, setGlobalReason] = useState<StockAdjustmentType>('damage');
  const [globalNotes, setGlobalNotes] = useState('');

  const handleScan = async (data: string, type: string) => {
    let product: Product | undefined = getProductByBarcode(data);
    if (!product) {
      product = getDataState().products.find((p: Product) => p.sku === data);
    }

    if (product) {
      const existingIndex = items.findIndex((i) => i.product.id === product.id);
      if (existingIndex >= 0) {
        const newItems = [...items];
        if (newItems[existingIndex].quantity < newItems[existingIndex].product.stock) {
          newItems[existingIndex].quantity += 1;
          setItems(newItems);
        } else {
          Alert.alert(
            'Внимание',
            'Нельзя списать больше, чем есть на складе'
          );
        }
      } else {
        if (product.stock > 0) {
          setItems([
            ...items,
            {
              product,
              quantity: 1,
              reason: globalReason,
              notes: '',
            },
          ]);
        } else {
          Alert.alert('Внимание', 'Товара нет на складе');
        }
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Ошибка', `Товар с кодом ${data} не найден`);
    }
  };

  const handleQuantityChange = (index: number, delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newItems = [...items];
    const newQty = newItems[index].quantity + delta;
    if (newQty >= 1 && newQty <= newItems[index].product.stock) {
      newItems[index].quantity = newQty;
      setItems(newItems);
    }
  };

  const handleReasonChange = (index: number, reason: StockAdjustmentType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newItems = [...items];
    newItems[index].reason = reason;
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotalValue = () => {
    return items.reduce(
      (sum, item) => sum + item.quantity * item.product.costPrice,
      0
    );
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      Alert.alert('Ошибка', 'Добавьте товары для списания');
      return;
    }

    Alert.alert(
      'Подтверждение списания',
      `Будет списано ${items.reduce((sum, i) => sum + i.quantity, 0)} ед. товара на сумму ${calculateTotalValue().toLocaleString('ru-RU')} ₽. Продолжить?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Списать',
          style: 'destructive',
          onPress: performWriteOff,
        },
      ]
    );
  };

  const performWriteOff = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsSubmitting(true);

    try {
      const referenceNumber = `WO-${Date.now().toString(36).toUpperCase()}`;

      for (const item of items) {
        const previousStock = item.product.stock;
        const newStock = previousStock - item.quantity;

        await createStockAdjustment({
          productId: item.product.id,
          productName: item.product.name,
          productSku: item.product.sku,
          adjustmentType: item.reason,
          quantityChange: -item.quantity,
          previousStock,
          newStock,
          unitCost: item.product.costPrice,
          totalValue: item.quantity * item.product.costPrice,
          reason: item.notes || globalNotes || undefined,
          referenceNumber,
        });

        // Update product stock
        await updateProduct(item.product.id, {
          stock: newStock,
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Успешно',
        `Списание ${referenceNumber} выполнено`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating write-off:', error);
      Alert.alert('Ошибка', 'Не удалось выполнить списание');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderItem = ({ item, index }: { item: WriteOffItem; index: number }) => (
    <Animated.View
      entering={SlideInRight.delay(index * 50)}
      style={styles.itemCard}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.product.name}
        </Text>
        <Pressable onPress={() => handleRemoveItem(index)} hitSlop={10}>
          <Ionicons name="close-circle" size={24} color={colors.error} />
        </Pressable>
      </View>
      <Text style={styles.itemSku}>
        SKU: {item.product.sku} • На складе: {item.product.stock} шт.
      </Text>

      <View style={styles.itemRow}>
        <View style={styles.quantityControl}>
          <Pressable
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(index, -1)}
          >
            <Ionicons name="remove" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <Pressable
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(index, 1)}
          >
            <Ionicons name="add" size={20} color={colors.text} />
          </Pressable>
        </View>

        <Text style={styles.itemValue}>
          -{(item.quantity * item.product.costPrice).toLocaleString('ru-RU')} ₽
        </Text>
      </View>

      {/* Reason Selection */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.reasonScrollView}
      >
        {WRITE_OFF_REASONS.map((reason) => (
          <Pressable
            key={reason.type}
            style={[
              styles.reasonChip,
              item.reason === reason.type && styles.reasonChipActive,
            ]}
            onPress={() => handleReasonChange(index, reason.type)}
          >
            <Ionicons
              name={reason.icon as keyof typeof Ionicons.glyphMap}
              size={14}
              color={
                item.reason === reason.type
                  ? colors.textInverse
                  : colors.textSecondary
              }
            />
            <Text
              style={[
                styles.reasonChipText,
                item.reason === reason.type && styles.reasonChipTextActive,
              ]}
            >
              {reason.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Списание товара',
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
        {/* Scan Button */}
        <Animated.View entering={FadeIn}>
          <Pressable
            style={styles.scanButton}
            onPress={() => setShowScanner(true)}
          >
            <View style={styles.scanButtonIcon}>
              <WriteOffIcon size={32} color={warehouseColors.writeOff} />
            </View>
            <View style={styles.scanButtonContent}>
              <Text style={styles.scanButtonTitle}>
                Сканировать для списания
              </Text>
              <Text style={styles.scanButtonSubtitle}>
                Отсканируйте товары для списания
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={warehouseColors.writeOff}
            />
          </Pressable>
        </Animated.View>

        {/* Manual Entry */}
        <Animated.View entering={FadeIn.delay(50)} style={styles.section}>
          <TextInput
            style={styles.manualInput}
            placeholder="Введите штрих-код или SKU"
            placeholderTextColor={colors.textLight}
            onSubmitEditing={(e) => {
              if (e.nativeEvent.text) {
                handleScan(e.nativeEvent.text, 'manual');
              }
            }}
            returnKeyType="search"
          />
        </Animated.View>

        {/* Global Settings */}
        {items.length === 0 && (
          <Animated.View entering={FadeIn.delay(100)} style={styles.section}>
            <Text style={styles.sectionTitle}>Причина списания по умолчанию</Text>
            <View style={styles.reasonGrid}>
              {WRITE_OFF_REASONS.map((reason) => (
                <Pressable
                  key={reason.type}
                  style={[
                    styles.reasonOption,
                    globalReason === reason.type && styles.reasonOptionActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setGlobalReason(reason.type);
                  }}
                >
                  <Ionicons
                    name={reason.icon as keyof typeof Ionicons.glyphMap}
                    size={24}
                    color={
                      globalReason === reason.type
                        ? warehouseColors.writeOff
                        : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.reasonOptionText,
                      globalReason === reason.type && styles.reasonOptionTextActive,
                    ]}
                  >
                    {reason.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Items List */}
        {items.length > 0 && (
          <Animated.View entering={FadeIn.delay(150)} style={styles.section}>
            <Text style={styles.sectionTitle}>
              Товары для списания ({items.length})
            </Text>
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(_, index) => index.toString()}
              scrollEnabled={false}
            />
          </Animated.View>
        )}

        {/* Notes */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.section}>
          <Text style={styles.sectionTitle}>Комментарий</Text>
          <TextInput
            style={[styles.manualInput, styles.notesInput]}
            placeholder="Причина списания или дополнительная информация..."
            placeholderTextColor={colors.textLight}
            value={globalNotes}
            onChangeText={setGlobalNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </Animated.View>

        {/* Summary */}
        {items.length > 0 && (
          <Animated.View entering={FadeIn.delay(250)} style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Позиций</Text>
              <Text style={styles.summaryValue}>{items.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Всего единиц</Text>
              <Text style={styles.summaryValue}>
                {items.reduce((sum, i) => sum + i.quantity, 0)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Списывается на</Text>
              <Text style={styles.summaryTotalValue}>
                {calculateTotalValue().toLocaleString('ru-RU')} ₽
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Submit */}
        <Animated.View entering={FadeIn.delay(300)} style={styles.submitContainer}>
          <Button
            title="Выполнить списание"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={items.length === 0}
            style={{ width: '100%', backgroundColor: warehouseColors.writeOff }}
          />
        </Animated.View>

        <View style={{ height: insets.bottom + spacing.lg }} />
      </ScrollView>

      {/* Scanner */}
      <WarehouseScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
        title="Сканирование для списания"
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
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: warehouseColors.writeOffBg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: warehouseColors.writeOff,
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
    color: warehouseColors.writeOff,
  },
  scanButtonSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  manualInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  reasonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  reasonOption: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  reasonOptionActive: {
    borderColor: warehouseColors.writeOff,
    backgroundColor: warehouseColors.writeOffBg,
  },
  reasonOptionText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  reasonOptionTextActive: {
    color: warehouseColors.writeOff,
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: warehouseColors.writeOff,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  itemName: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.sm,
  },
  itemSku: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    minWidth: 36,
    textAlign: 'center',
  },
  itemValue: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: warehouseColors.writeOff,
  },
  reasonScrollView: {
    marginTop: spacing.xs,
  },
  reasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reasonChipActive: {
    backgroundColor: warehouseColors.writeOff,
    borderColor: warehouseColors.writeOff,
  },
  reasonChipText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  reasonChipTextActive: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  summaryTotalLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  summaryTotalValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: warehouseColors.writeOff,
  },
  submitContainer: {
    marginTop: spacing.md,
  },
});
