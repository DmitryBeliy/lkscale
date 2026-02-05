import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Card, Button } from '@/components/ui';
import { BarcodeScanner, ScannerButton } from '@/components/BarcodeScanner';
import {
  getDataState,
  subscribeData,
  searchCustomers,
  searchProducts,
  getProductByBarcode,
  createOrder,
} from '@/store/dataStore';
import { Customer, Product, CartItem, NewOrderData } from '@/types';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

type Step = 'customer' | 'products' | 'payment' | 'review';

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Наличные', icon: 'cash-outline' },
  { id: 'card', label: 'Карта', icon: 'card-outline' },
  { id: 'transfer', label: 'Перевод', icon: 'swap-horizontal-outline' },
  { id: 'online', label: 'Онлайн', icon: 'globe-outline' },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function CreateOrderScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('customer');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Order data
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'online'>('cash');
  const [notes, setNotes] = useState('');

  // Search
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    const unsub = subscribeData(() => {
      const state = getDataState();
      setCustomers(state.customers);
      setProducts(state.products.filter((p) => p.isActive && p.stock > 0));
    });

    const state = getDataState();
    setCustomers(state.customers);
    setProducts(state.products.filter((p) => p.isActive && p.stock > 0));

    return () => unsub();
  }, []);

  const filteredCustomers = customerSearch
    ? searchCustomers(customerSearch)
    : customers;

  const filteredProducts = productSearch
    ? searchProducts(productSearch)
    : products;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 'customer') {
      router.back();
    } else if (step === 'products') {
      setStep('customer');
    } else if (step === 'payment') {
      setStep('products');
    } else {
      setStep('payment');
    }
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step === 'customer') {
      if (!selectedCustomer && !newCustomerName.trim()) {
        Alert.alert('Ошибка', 'Выберите или введите данные клиента');
        return;
      }
      setStep('products');
    } else if (step === 'products') {
      if (cart.length === 0) {
        Alert.alert('Ошибка', 'Добавьте хотя бы один товар');
        return;
      }
      setStep('payment');
    } else if (step === 'payment') {
      setStep('review');
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCustomer(customer);
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewCustomerAddress('');
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
  };

  const handleAddToCart = (product: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const existingItem = cart.find((item) => item.product.id === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        Alert.alert('Ошибка', 'Достигнут максимальный остаток товара');
        return;
      }
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart(
      cart
        .map((item) => {
          if (item.product.id === productId) {
            const newQuantity = item.quantity + delta;
            if (newQuantity <= 0) return null;
            if (newQuantity > item.product.stock) {
              Alert.alert('Ошибка', 'Достигнут максимальный остаток товара');
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const handleScanResult = (data: string) => {
    const product = getProductByBarcode(data);
    if (product) {
      handleAddToCart(product);
      Alert.alert('Товар добавлен', product.name);
    } else {
      Alert.alert('Товар не найден', `Штрих-код: ${data}`);
    }
  };

  const handleCreateOrder = async () => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const orderData: NewOrderData = {
        customerId: selectedCustomer?.id,
        customer: selectedCustomer
          ? {
              name: selectedCustomer.name,
              phone: selectedCustomer.phone,
              address: selectedCustomer.address,
            }
          : {
              name: newCustomerName.trim(),
              phone: newCustomerPhone.trim() || undefined,
              address: newCustomerAddress.trim() || undefined,
            },
        items: cart,
        paymentMethod,
        notes: notes.trim() || undefined,
      };

      const order = await createOrder(orderData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Заказ создан!',
        `Номер заказа: ${order.orderNumber}`,
        [{ text: 'OK', onPress: () => router.replace(`/order/${order.id}`) }]
      );
    } catch {
      Alert.alert('Ошибка', 'Не удалось создать заказ');
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getStepTitle = () => {
    switch (step) {
      case 'customer':
        return 'Клиент';
      case 'products':
        return 'Товары';
      case 'payment':
        return 'Оплата';
      case 'review':
        return 'Подтверждение';
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {['customer', 'products', 'payment', 'review'].map((s, index) => (
        <React.Fragment key={s}>
          <View
            style={[
              styles.stepDot,
              step === s && styles.stepDotActive,
              ['customer', 'products', 'payment', 'review'].indexOf(step) > index &&
                styles.stepDotCompleted,
            ]}
          >
            {['customer', 'products', 'payment', 'review'].indexOf(step) > index ? (
              <Ionicons name="checkmark" size={12} color={colors.textInverse} />
            ) : (
              <Text
                style={[
                  styles.stepNumber,
                  (step === s ||
                    ['customer', 'products', 'payment', 'review'].indexOf(step) > index) &&
                    styles.stepNumberActive,
                ]}
              >
                {index + 1}
              </Text>
            )}
          </View>
          {index < 3 && (
            <View
              style={[
                styles.stepLine,
                ['customer', 'products', 'payment', 'review'].indexOf(step) > index &&
                  styles.stepLineActive,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  const renderCustomerStep = () => (
    <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContent}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Ionicons name="search" size={20} color={colors.textLight} />
          <TextInput
            style={styles.searchTextInput}
            placeholder="Поиск клиента..."
            placeholderTextColor={colors.textLight}
            value={customerSearch}
            onChangeText={setCustomerSearch}
          />
        </View>
      </View>

      {/* Selected Customer */}
      {selectedCustomer && (
        <Card style={styles.selectedCustomerCard}>
          <View style={styles.selectedCustomerHeader}>
            <View style={styles.customerAvatar}>
              <Ionicons name="person" size={24} color={colors.primary} />
            </View>
            <View style={styles.selectedCustomerInfo}>
              <Text style={styles.selectedCustomerName}>{selectedCustomer.name}</Text>
              {selectedCustomer.phone && (
                <Text style={styles.selectedCustomerPhone}>{selectedCustomer.phone}</Text>
              )}
            </View>
            <Pressable onPress={handleClearCustomer}>
              <Ionicons name="close-circle" size={24} color={colors.textLight} />
            </Pressable>
          </View>
        </Card>
      )}

      {/* Customer List or New Customer Form */}
      {!selectedCustomer && (
        <>
          {/* New Customer Form */}
          <Card style={styles.newCustomerCard}>
            <Text style={styles.newCustomerTitle}>Или введите нового клиента</Text>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Имя клиента *"
                placeholderTextColor={colors.textLight}
                value={newCustomerName}
                onChangeText={setNewCustomerName}
              />
            </View>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Телефон"
                placeholderTextColor={colors.textLight}
                value={newCustomerPhone}
                onChangeText={setNewCustomerPhone}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Адрес"
                placeholderTextColor={colors.textLight}
                value={newCustomerAddress}
                onChangeText={setNewCustomerAddress}
              />
            </View>
          </Card>

          {/* Existing Customers */}
          <Text style={styles.listTitle}>Существующие клиенты</Text>
          {filteredCustomers.map((customer) => (
            <Pressable
              key={customer.id}
              style={styles.customerItem}
              onPress={() => handleSelectCustomer(customer)}
            >
              <View style={styles.customerAvatar}>
                <Ionicons name="person" size={20} color={colors.primary} />
              </View>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{customer.name}</Text>
                <Text style={styles.customerMeta}>
                  {customer.totalOrders} заказов • {formatCurrency(customer.totalSpent)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </Pressable>
          ))}
        </>
      )}
    </Animated.View>
  );

  const renderProductsStep = () => (
    <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContent}>
      {/* Search with Scanner */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInput, { flex: 1 }]}>
          <Ionicons name="search" size={20} color={colors.textLight} />
          <TextInput
            style={styles.searchTextInput}
            placeholder="Поиск товара..."
            placeholderTextColor={colors.textLight}
            value={productSearch}
            onChangeText={setProductSearch}
          />
        </View>
        <ScannerButton onPress={() => setShowScanner(true)} />
      </View>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <Card style={styles.cartSummary}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Корзина ({totalItems})</Text>
            <Text style={styles.cartTotal}>{formatCurrency(totalAmount)}</Text>
          </View>
          {cart.map((item) => (
            <View key={item.product.id} style={styles.cartItem}>
              <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemName} numberOfLines={1}>
                  {item.product.name}
                </Text>
                <Text style={styles.cartItemPrice}>
                  {formatCurrency(item.product.price)} × {item.quantity}
                </Text>
              </View>
              <View style={styles.cartItemActions}>
                <Pressable
                  style={styles.quantityButton}
                  onPress={() => handleUpdateQuantity(item.product.id, -1)}
                >
                  <Ionicons name="remove" size={18} color={colors.text} />
                </Pressable>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <Pressable
                  style={styles.quantityButton}
                  onPress={() => handleUpdateQuantity(item.product.id, 1)}
                >
                  <Ionicons name="add" size={18} color={colors.text} />
                </Pressable>
                <Pressable
                  style={styles.removeButton}
                  onPress={() => handleRemoveFromCart(item.product.id)}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </Pressable>
              </View>
            </View>
          ))}
        </Card>
      )}

      {/* Product List */}
      <Text style={styles.listTitle}>Товары</Text>
      {filteredProducts.map((product) => {
        const inCart = cart.find((item) => item.product.id === product.id);
        return (
          <Pressable
            key={product.id}
            style={styles.productItem}
            onPress={() => handleAddToCart(product)}
          >
            <View style={styles.productIcon}>
              <Ionicons name="cube" size={24} color={colors.primary} />
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={styles.productMeta}>
                {formatCurrency(product.price)} • {product.stock} шт.
              </Text>
            </View>
            {inCart ? (
              <View style={styles.inCartBadge}>
                <Text style={styles.inCartText}>{inCart.quantity}</Text>
              </View>
            ) : (
              <Ionicons name="add-circle" size={28} color={colors.primary} />
            )}
          </Pressable>
        );
      })}

      <BarcodeScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScanResult}
        title="Сканер товаров"
        description="Наведите на штрих-код товара"
      />
    </Animated.View>
  );

  const renderPaymentStep = () => (
    <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContent}>
      <Card style={styles.paymentCard}>
        <Text style={styles.paymentTitle}>Способ оплаты</Text>
        <View style={styles.paymentMethods}>
          {PAYMENT_METHODS.map((method) => (
            <Pressable
              key={method.id}
              style={[
                styles.paymentMethod,
                paymentMethod === method.id && styles.paymentMethodActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setPaymentMethod(method.id as typeof paymentMethod);
              }}
            >
              <Ionicons
                name={method.icon as any}
                size={24}
                color={paymentMethod === method.id ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.paymentMethodText,
                  paymentMethod === method.id && styles.paymentMethodTextActive,
                ]}
              >
                {method.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card style={styles.notesCard}>
        <Text style={styles.notesTitle}>Примечание к заказу</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Добавьте комментарий..."
          placeholderTextColor={colors.textLight}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />
      </Card>
    </Animated.View>
  );

  const renderReviewStep = () => (
    <Animated.View entering={FadeInRight.duration(300)} style={styles.stepContent}>
      {/* Customer */}
      <Card style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.reviewTitle}>Клиент</Text>
        </View>
        <Text style={styles.reviewValue}>
          {selectedCustomer?.name || newCustomerName}
        </Text>
        {(selectedCustomer?.phone || newCustomerPhone) && (
          <Text style={styles.reviewSubvalue}>
            {selectedCustomer?.phone || newCustomerPhone}
          </Text>
        )}
      </Card>

      {/* Products */}
      <Card style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Ionicons name="cube-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.reviewTitle}>Товары ({totalItems})</Text>
        </View>
        {cart.map((item) => (
          <View key={item.product.id} style={styles.reviewItem}>
            <Text style={styles.reviewItemName} numberOfLines={1}>
              {item.product.name}
            </Text>
            <Text style={styles.reviewItemQuantity}>×{item.quantity}</Text>
            <Text style={styles.reviewItemPrice}>
              {formatCurrency(item.product.price * item.quantity)}
            </Text>
          </View>
        ))}
        <View style={styles.reviewTotalRow}>
          <Text style={styles.reviewTotalLabel}>Итого</Text>
          <Text style={styles.reviewTotalValue}>{formatCurrency(totalAmount)}</Text>
        </View>
      </Card>

      {/* Payment */}
      <Card style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Ionicons name="card-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.reviewTitle}>Оплата</Text>
        </View>
        <Text style={styles.reviewValue}>
          {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}
        </Text>
      </Card>

      {notes && (
        <Card style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.reviewTitle}>Примечание</Text>
          </View>
          <Text style={styles.reviewValue}>{notes}</Text>
        </Card>
      )}
    </Animated.View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{getStepTitle()}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 'customer' && renderCustomerStep()}
        {step === 'products' && renderProductsStep()}
        {step === 'payment' && renderPaymentStep()}
        {step === 'review' && renderReviewStep()}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        {step === 'review' ? (
          <Button
            title="Создать заказ"
            onPress={handleCreateOrder}
            loading={isLoading}
            icon={<Ionicons name="checkmark-circle-outline" size={20} color={colors.textInverse} />}
            style={styles.actionButton}
          />
        ) : (
          <Button
            title="Продолжить"
            onPress={handleNext}
            icon={<Ionicons name="arrow-forward" size={20} color={colors.textInverse} />}
            style={styles.actionButton}
          />
        )}
      </View>
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
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepDotCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stepNumber: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textLight,
  },
  stepNumberActive: {
    color: colors.textInverse,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.xs,
  },
  stepLineActive: {
    backgroundColor: colors.success,
  },
  scrollView: {
    flex: 1,
  },
  stepContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.sm,
  },
  searchTextInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  selectedCustomerCard: {
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  selectedCustomerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  selectedCustomerInfo: {
    flex: 1,
  },
  selectedCustomerName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  selectedCustomerPhone: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  newCustomerCard: {
    marginBottom: spacing.md,
  },
  newCustomerTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.sm,
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
  listTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  customerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  customerName: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    color: colors.text,
  },
  customerMeta: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cartSummary: {
    marginBottom: spacing.md,
    backgroundColor: `${colors.primary}05`,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cartTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  cartTotal: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.text,
  },
  cartItemPrice: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  productIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  productName: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    color: colors.text,
  },
  productMeta: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  inCartBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inCartText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textInverse,
  },
  paymentCard: {
    marginBottom: spacing.md,
  },
  paymentTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  paymentMethod: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  paymentMethodActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  paymentMethodText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  paymentMethodTextActive: {
    color: colors.primary,
  },
  notesCard: {},
  notesTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  notesInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text,
    height: 80,
    textAlignVertical: 'top',
  },
  reviewCard: {
    marginBottom: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  reviewTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  reviewValue: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    color: colors.text,
  },
  reviewSubvalue: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  reviewItemName: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  reviewItemQuantity: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
  },
  reviewItemPrice: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.text,
    minWidth: 70,
    textAlign: 'right',
  },
  reviewTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  reviewTotalLabel: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  reviewTotalValue: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  bottomActions: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  actionButton: {
    width: '100%',
  },
});
