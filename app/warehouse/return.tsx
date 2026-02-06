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
import { ReturnIcon } from '@/components/warehouse/WarehouseIcons';
import { Button } from '@/components/ui/Button';
import { createStockAdjustment } from '@/services/warehouseService';
import { getDataState, getProductByBarcode, updateProduct } from '@/store/dataStore';
import type { Product } from '@/types';

interface ReturnItem {
  product: Product;
  quantity: number;
  condition: 'good' | 'damaged';
}

export default function ReturnScreen() {
  const insets = useSafeAreaInsets();
  const [showScanner, setShowScanner] = useState(false);
  const [items, setItems] = useState<ReturnItem[]>([]);
  const [returnReason, setReturnReason] = useState('');
  const [customerInfo, setCustomerInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScan = async (data: string, type: string) => {
    let product: Product | undefined = getProductByBarcode(data);
    if (!product) {
      product = getDataState().products.find((p: Product) => p.sku === data);
    }

    if (product) {
      const existingIndex = items.findIndex((i) => i.product.id === product.id);
      if (existingIndex >= 0) {
        const newItems = [...items];
        newItems[existingIndex].quantity += 1;
        setItems(newItems);
      } else {
        setItems([...items, { product, quantity: 1, condition: 'good' }]);
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
    if (newQty >= 1) {
      newItems[index].quantity = newQty;
      setItems(newItems);
    }
  };

  const handleConditionChange = (index: number, condition: 'good' | 'damaged') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newItems = [...items];
    newItems[index].condition = condition;
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      Alert.alert('Ошибка', 'Добавьте товары для возврата');
      return;
    }

    const goodItems = items.filter((i) => i.condition === 'good');
    const damagedItems = items.filter((i) => i.condition === 'damaged');

    Alert.alert(
      'Подтверждение возврата',
      `Принять возврат:\n• Годных: ${goodItems.reduce((sum, i) => sum + i.quantity, 0)} ед.\n• Поврежденных: ${damagedItems.reduce((sum, i) => sum + i.quantity, 0)} ед.`,
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Принять', onPress: performReturn },
      ]
    );
  };

  const performReturn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsSubmitting(true);

    try {
      const referenceNumber = `RET-${Date.now().toString(36).toUpperCase()}`;

      for (const item of items) {
        const previousStock = item.product.stock;

        if (item.condition === 'good') {
          // Return to stock
          const newStock = previousStock + item.quantity;

          await createStockAdjustment({
            productId: item.product.id,
            productName: item.product.name,
            productSku: item.product.sku,
            adjustmentType: 'return',
            quantityChange: item.quantity,
            previousStock,
            newStock,
            unitCost: item.product.costPrice,
            totalValue: item.quantity * item.product.costPrice,
            reason: `Возврат${customerInfo ? ` от: ${customerInfo}` : ''}${returnReason ? ` - ${returnReason}` : ''}`,
            referenceNumber,
          });

          // Update product stock
          await updateProduct(item.product.id, { stock: newStock });
        } else {
          // Damaged return - write off
          await createStockAdjustment({
            productId: item.product.id,
            productName: item.product.name,
            productSku: item.product.sku,
            adjustmentType: 'damage',
            quantityChange: 0, // Doesn't affect stock since it was already sold
            previousStock,
            newStock: previousStock,
            unitCost: item.product.costPrice,
            totalValue: item.quantity * item.product.costPrice,
            reason: `Поврежденный возврат${customerInfo ? ` от: ${customerInfo}` : ''}${returnReason ? ` - ${returnReason}` : ''}`,
            referenceNumber,
          });
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Успешно',
        `Возврат ${referenceNumber} оформлен`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error processing return:', error);
      Alert.alert('Ошибка', 'Не удалось оформить возврат');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderItem = ({ item, index }: { item: ReturnItem; index: number }) => (
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
      <Text style={styles.itemSku}>SKU: {item.product.sku}</Text>

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

        <View style={styles.conditionSelector}>
          <Pressable
            style={[
              styles.conditionOption,
              item.condition === 'good' && styles.conditionOptionGood,
            ]}
            onPress={() => handleConditionChange(index, 'good')}
          >
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={item.condition === 'good' ? colors.textInverse : colors.success}
            />
            <Text
              style={[
                styles.conditionText,
                item.condition === 'good' && styles.conditionTextActive,
              ]}
            >
              Годный
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.conditionOption,
              item.condition === 'damaged' && styles.conditionOptionDamaged,
            ]}
            onPress={() => handleConditionChange(index, 'damaged')}
          >
            <Ionicons
              name="warning"
              size={16}
              color={item.condition === 'damaged' ? colors.textInverse : colors.error}
            />
            <Text
              style={[
                styles.conditionText,
                item.condition === 'damaged' && styles.conditionTextActive,
              ]}
            >
              Брак
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );

  const goodCount = items.filter((i) => i.condition === 'good').reduce((sum, i) => sum + i.quantity, 0);
  const damagedCount = items.filter((i) => i.condition === 'damaged').reduce((sum, i) => sum + i.quantity, 0);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Возврат товара',
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
              <ReturnIcon size={32} color={warehouseColors.return} />
            </View>
            <View style={styles.scanButtonContent}>
              <Text style={styles.scanButtonTitle}>Сканировать для возврата</Text>
              <Text style={styles.scanButtonSubtitle}>
                Отсканируйте возвращаемые товары
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={warehouseColors.return}
            />
          </Pressable>
        </Animated.View>

        {/* Customer Info */}
        <Animated.View entering={FadeIn.delay(50)} style={styles.section}>
          <Text style={styles.sectionTitle}>Информация о возврате</Text>
          <TextInput
            style={styles.input}
            placeholder="Имя клиента или номер заказа"
            placeholderTextColor={colors.textLight}
            value={customerInfo}
            onChangeText={setCustomerInfo}
          />
          <TextInput
            style={[styles.input, { marginTop: spacing.sm }]}
            placeholder="Причина возврата"
            placeholderTextColor={colors.textLight}
            value={returnReason}
            onChangeText={setReturnReason}
          />
        </Animated.View>

        {/* Items List */}
        {items.length > 0 && (
          <Animated.View entering={FadeIn.delay(100)} style={styles.section}>
            <Text style={styles.sectionTitle}>
              Товары ({items.length} поз.)
            </Text>
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(_, index) => index.toString()}
              scrollEnabled={false}
            />
          </Animated.View>
        )}

        {/* Summary */}
        {items.length > 0 && (
          <Animated.View entering={FadeIn.delay(150)} style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={styles.summaryLabel}>Годных</Text>
                <Text style={[styles.summaryValue, { color: colors.success }]}>
                  {goodCount} шт.
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Ionicons name="warning" size={20} color={colors.error} />
                <Text style={styles.summaryLabel}>Брак</Text>
                <Text style={[styles.summaryValue, { color: colors.error }]}>
                  {damagedCount} шт.
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Submit */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.submitContainer}>
          <Button
            title="Оформить возврат"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={items.length === 0}
            style={{ width: '100%', backgroundColor: warehouseColors.return }}
          />
        </Animated.View>

        <View style={{ height: insets.bottom + spacing.lg }} />
      </ScrollView>

      {/* Scanner */}
      <WarehouseScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
        title="Сканирование возврата"
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
    backgroundColor: warehouseColors.returnBg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: warehouseColors.return,
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
    color: warehouseColors.return,
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
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  itemCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: warehouseColors.return,
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
  conditionSelector: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  conditionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  conditionOptionGood: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  conditionOptionDamaged: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  conditionText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  conditionTextActive: {
    color: colors.textInverse,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  summaryLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
  },
  submitContainer: {
    marginTop: spacing.md,
  },
});
