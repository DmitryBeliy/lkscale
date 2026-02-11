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
import { TransferIcon } from '@/components/warehouse/WarehouseIcons';
import { Button } from '@/components/ui/Button';
import { createStockAdjustment } from '@/services/warehouseService';
import { getDataState, getProductByBarcode, updateProduct } from '@/store/dataStore';
import type { Product } from '@/types';

interface TransferItem {
  product: Product;
  quantity: number;
}

export default function TransferScreen() {
  const insets = useSafeAreaInsets();
  const [showScanner, setShowScanner] = useState(false);
  const [items, setItems] = useState<TransferItem[]>([]);
  const [destination, setDestination] = useState('');
  const [notes, setNotes] = useState('');
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
        if (newItems[existingIndex].quantity < newItems[existingIndex].product.stock) {
          newItems[existingIndex].quantity += 1;
          setItems(newItems);
        } else {
          Alert.alert('Внимание', 'Нельзя переместить больше, чем есть на складе');
        }
      } else {
        if (product.stock > 0) {
          setItems([...items, { product, quantity: 1 }]);
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

  const handleRemoveItem = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      Alert.alert('Ошибка', 'Добавьте товары для перемещения');
      return;
    }

    if (!destination.trim()) {
      Alert.alert('Ошибка', 'Укажите место назначения');
      return;
    }

    Alert.alert(
      'Подтверждение',
      `Переместить ${items.reduce((sum, i) => sum + i.quantity, 0)} ед. товара на "${destination}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Переместить', onPress: performTransfer },
      ]
    );
  };

  const performTransfer = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsSubmitting(true);

    try {
      const referenceNumber = `TR-${Date.now().toString(36).toUpperCase()}`;

      for (const item of items) {
        const previousStock = item.product.stock;
        const newStock = previousStock - item.quantity;

        // Transfer out from current location
        await createStockAdjustment({
          productId: item.product.id,
          productName: item.product.name,
          productSku: item.product.sku,
          adjustmentType: 'transfer_out',
          quantityChange: -item.quantity,
          previousStock,
          newStock,
          unitCost: item.product.costPrice,
          totalValue: item.quantity * item.product.costPrice,
          reason: `Перемещение на: ${destination}`,
          referenceNumber,
        });

        // Update product stock
        await updateProduct(item.product.id, { stock: newStock });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Успешно',
        `Перемещение ${referenceNumber} выполнено`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error creating transfer:', error);
      Alert.alert('Ошибка', 'Не удалось выполнить перемещение');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderItem = ({ item, index }: { item: TransferItem; index: number }) => (
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
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Перемещение товара',
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
              <TransferIcon size={32} color={warehouseColors.transfer} />
            </View>
            <View style={styles.scanButtonContent}>
              <Text style={styles.scanButtonTitle}>Сканировать для перемещения</Text>
              <Text style={styles.scanButtonSubtitle}>
                Отсканируйте товары для перемещения
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={warehouseColors.transfer}
            />
          </Pressable>
        </Animated.View>

        {/* Destination */}
        <Animated.View entering={FadeIn.delay(50)} style={styles.section}>
          <Text style={styles.sectionTitle}>Место назначения</Text>
          <TextInput
            style={styles.input}
            placeholder="Склад 2 / Магазин / Филиал..."
            placeholderTextColor={colors.textLight}
            value={destination}
            onChangeText={setDestination}
          />
        </Animated.View>

        {/* Items List */}
        {items.length > 0 && (
          <Animated.View entering={FadeIn.delay(100)} style={styles.section}>
            <Text style={styles.sectionTitle}>
              Товары для перемещения ({items.length})
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
        <Animated.View entering={FadeIn.delay(150)} style={styles.section}>
          <Text style={styles.sectionTitle}>Комментарий</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Дополнительная информация..."
            placeholderTextColor={colors.textLight}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </Animated.View>

        {/* Submit */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.submitContainer}>
          <Button
            title="Выполнить перемещение"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={items.length === 0 || !destination.trim()}
            style={{ width: '100%', backgroundColor: warehouseColors.transfer }}
          />
        </Animated.View>

        <View style={{ height: insets.bottom + spacing.lg }} />
      </ScrollView>

      {/* Scanner */}
      <WarehouseScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
        title="Сканирование для перемещения"
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
    backgroundColor: warehouseColors.transferBg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: warehouseColors.transfer,
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
    color: warehouseColors.transfer,
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
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  itemCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: warehouseColors.transfer,
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
  submitContainer: {
    marginTop: spacing.md,
  },
});
