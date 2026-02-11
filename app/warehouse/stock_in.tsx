import React, { useState, useEffect, useCallback } from 'react';
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
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { WarehouseScanner, warehouseColors, SupplierSelectCard } from '@/components/warehouse';
import { StockInIcon } from '@/components/warehouse/WarehouseIcons';
import { Button } from '@/components/ui/Button';
import {
  getSuppliers,
  createPurchaseOrder,
  generatePurchaseOrderNumber,
  receivePurchaseOrderItems,
} from '@/services/warehouseService';
import { getDataState, getProductByBarcode, getProductById, updateProduct } from '@/store/dataStore';
import type { Product, Supplier, PurchaseOrderItem } from '@/types';

interface CartItem {
  product: Product;
  quantity: number;
  unitCost: number;
}

export default function StockInScreen() {
  const { barcode, supplierId: initialSupplierId } = useLocalSearchParams<{
    barcode?: string;
    supplierId?: string;
  }>();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<'scan' | 'supplier' | 'review'>('scan');
  const [showScanner, setShowScanner] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    const suppliersData = await getSuppliers();
    setSuppliers(suppliersData.filter((s) => s.isActive));

    // Pre-select supplier if provided
    if (initialSupplierId) {
      const supplier = suppliersData.find((s) => s.id === initialSupplierId);
      if (supplier) {
        setSelectedSupplier(supplier);
        setStep('scan');
      }
    }

    // Handle initial barcode
    if (barcode) {
      handleScan(barcode, 'manual');
    }
  }, [initialSupplierId, barcode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleScan = async (data: string, type: string) => {
    // Try to find product
    let product: Product | undefined = getProductByBarcode(data);
    if (!product) {
      product = getDataState().products.find((p: Product) => p.sku === data);
    }

    if (product) {
      // Add to cart or increment quantity
      const existingIndex = cart.findIndex((c) => c.product.id === product.id);
      if (existingIndex >= 0) {
        const newCart = [...cart];
        newCart[existingIndex].quantity += 1;
        setCart(newCart);
      } else {
        setCart([
          ...cart,
          {
            product,
            quantity: 1,
            unitCost: product.costPrice,
          },
        ]);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'Товар не найден',
        `Штрих-код ${data} не найден в базе. Создать новый товар?`,
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Создать',
            onPress: () => router.push(`/product/create?barcode=${data}`),
          },
        ]
      );
    }
  };

  const handleQuantityChange = (index: number, delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newCart = [...cart];
    newCart[index].quantity = Math.max(1, newCart[index].quantity + delta);
    setCart(newCart);
  };

  const handleCostChange = (index: number, cost: string) => {
    const newCart = [...cart];
    newCart[index].unitCost = parseFloat(cost) || 0;
    setCart(newCart);
  };

  const handleRemoveItem = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  };

  const calculateTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleSubmit = async () => {
    if (cart.length === 0) {
      Alert.alert('Ошибка', 'Добавьте товары для приемки');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsSubmitting(true);

    try {
      const orderNumber = await generatePurchaseOrderNumber();

      const items: Omit<PurchaseOrderItem, 'id'>[] = cart.map((item) => ({
        purchaseOrderId: '',
        productId: item.product.id,
        productName: item.product.name,
        productSku: item.product.sku,
        quantityOrdered: item.quantity,
        quantityReceived: item.quantity, // Immediate receipt
        unitCost: item.unitCost,
        totalCost: item.quantity * item.unitCost,
      }));

      const order = await createPurchaseOrder({
        orderNumber,
        supplierId: selectedSupplier?.id,
        status: 'received',
        totalAmount: calculateTotal(),
        totalItems: calculateTotalItems(),
        items: items as PurchaseOrderItem[],
        receivedDate: new Date().toISOString(),
      });

      if (order) {
        // Update product stocks
        for (const item of cart) {
          const currentProduct = getProductById(item.product.id);
          if (currentProduct) {
            const newStock = currentProduct.stock + item.quantity;

            // Calculate weighted average cost
            const currentValue = currentProduct.stock * currentProduct.costPrice;
            const newValue = item.quantity * item.unitCost;
            const newAvgCost =
              newStock > 0 ? (currentValue + newValue) / newStock : item.unitCost;

            await updateProduct(item.product.id, {
              stock: newStock,
              costPrice: newAvgCost,
            });
          }
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Успешно',
          `Приемка ${orderNumber} выполнена.\nПринято ${calculateTotalItems()} ед. товара на сумму ${calculateTotal().toLocaleString('ru-RU')} ₽`,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error creating purchase order:', error);
      Alert.alert('Ошибка', 'Не удалось создать приемку');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCartItem = ({ item, index }: { item: CartItem; index: number }) => (
    <Animated.View
      entering={SlideInRight.delay(index * 50)}
      style={styles.cartItem}
    >
      <View style={styles.cartItemHeader}>
        <Text style={styles.cartItemName} numberOfLines={1}>
          {item.product.name}
        </Text>
        <Pressable onPress={() => handleRemoveItem(index)} hitSlop={10}>
          <Ionicons name="close-circle" size={24} color={colors.error} />
        </Pressable>
      </View>
      <Text style={styles.cartItemSku}>SKU: {item.product.sku}</Text>

      <View style={styles.cartItemRow}>
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

        <View style={styles.costInput}>
          <Text style={styles.costLabel}>Цена:</Text>
          <TextInput
            style={styles.costTextInput}
            value={item.unitCost.toString()}
            onChangeText={(v) => handleCostChange(index, v)}
            keyboardType="numeric"
            selectTextOnFocus
          />
          <Text style={styles.costCurrency}>₽</Text>
        </View>

        <Text style={styles.itemTotal}>
          {(item.quantity * item.unitCost).toLocaleString('ru-RU')} ₽
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Приемка товара',
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
        {/* Supplier Selection */}
        <Animated.View entering={FadeIn} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Поставщик</Text>
            {selectedSupplier && (
              <Pressable
                onPress={() => setSelectedSupplier(null)}
                hitSlop={10}
              >
                <Text style={styles.changeText}>Изменить</Text>
              </Pressable>
            )}
          </View>

          {selectedSupplier ? (
            <View style={styles.selectedSupplier}>
              <Ionicons name="business" size={24} color={colors.primary} />
              <View style={styles.selectedSupplierInfo}>
                <Text style={styles.selectedSupplierName}>
                  {selectedSupplier.name}
                </Text>
                {selectedSupplier.contactName && (
                  <Text style={styles.selectedSupplierContact}>
                    {selectedSupplier.contactName}
                  </Text>
                )}
              </View>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            </View>
          ) : (
            <View style={styles.supplierList}>
              <TextInput
                style={styles.searchInput}
                placeholder="Поиск поставщика..."
                placeholderTextColor={colors.textLight}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {filteredSuppliers.slice(0, 5).map((supplier) => (
                <SupplierSelectCard
                  key={supplier.id}
                  supplier={supplier}
                  selected={false}
                  onSelect={() => setSelectedSupplier(supplier)}
                />
              ))}
              <Pressable
                style={styles.skipSupplier}
                onPress={() => setStep('scan')}
              >
                <Text style={styles.skipSupplierText}>
                  Пропустить выбор поставщика
                </Text>
              </Pressable>
            </View>
          )}
        </Animated.View>

        {/* Scan Area */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.section}>
          <Text style={styles.sectionTitle}>Товары для приемки</Text>

          <Pressable
            style={styles.scanButton}
            onPress={() => setShowScanner(true)}
          >
            <View style={styles.scanButtonIcon}>
              <StockInIcon size={32} color={warehouseColors.stockIn} />
            </View>
            <View style={styles.scanButtonContent}>
              <Text style={styles.scanButtonTitle}>Сканировать товар</Text>
              <Text style={styles.scanButtonSubtitle}>
                Или введите штрих-код вручную
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={warehouseColors.stockIn} />
          </Pressable>

          {/* Manual Barcode Entry */}
          <View style={styles.manualEntry}>
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
          </View>
        </Animated.View>

        {/* Cart */}
        {cart.length > 0 && (
          <Animated.View entering={FadeIn.delay(200)} style={styles.section}>
            <Text style={styles.sectionTitle}>
              Корзина ({cart.length} поз., {calculateTotalItems()} ед.)
            </Text>
            <FlatList
              data={cart}
              renderItem={renderCartItem}
              keyExtractor={(_, index) => index.toString()}
              scrollEnabled={false}
            />
          </Animated.View>
        )}

        {/* Summary */}
        {cart.length > 0 && (
          <Animated.View entering={FadeIn.delay(300)} style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Позиций</Text>
              <Text style={styles.summaryValue}>{cart.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Всего единиц</Text>
              <Text style={styles.summaryValue}>{calculateTotalItems()}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Итого</Text>
              <Text style={styles.summaryTotalValue}>
                {calculateTotal().toLocaleString('ru-RU')} ₽
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Submit Button */}
        <Animated.View entering={FadeIn.delay(400)} style={styles.submitContainer}>
          <Button
            title="Оформить приемку"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={cart.length === 0}
            style={{ width: '100%' }}
          />
        </Animated.View>

        <View style={{ height: insets.bottom + spacing.lg }} />
      </ScrollView>

      {/* Scanner Modal */}
      <WarehouseScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
        title="Сканирование для приемки"
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
  changeText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  selectedSupplier: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}10`,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  selectedSupplierInfo: {
    flex: 1,
  },
  selectedSupplierName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  selectedSupplierContact: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  supplierList: {
    gap: spacing.sm,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  skipSupplier: {
    padding: spacing.sm,
    alignItems: 'center',
  },
  skipSupplierText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: warehouseColors.stockInBg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: warehouseColors.stockIn,
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
    color: warehouseColors.stockIn,
  },
  scanButtonSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  manualEntry: {
    marginTop: spacing.md,
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
  cartItem: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  cartItemName: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.sm,
  },
  cartItemSku: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
  costInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  costLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  costTextInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: typography.sizes.sm,
    color: colors.text,
    textAlign: 'right',
  },
  costCurrency: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  itemTotal: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
    minWidth: 80,
    textAlign: 'right',
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
    color: warehouseColors.stockIn,
  },
  submitContainer: {
    marginTop: spacing.md,
  },
});
