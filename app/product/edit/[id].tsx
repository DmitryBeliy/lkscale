import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '@/components/ui';
import { LineChart } from '@/components/charts/SalesChart';
import { getProductById, updateProduct, getCategories } from '@/store/dataStore';
import { Product } from '@/types';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ProductEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [product, setProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'price' | 'stock'>('info');

  // Form state
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isActive, setIsActive] = useState(true);

  const categories = getCategories().filter((c) => c !== 'all');

  useEffect(() => {
    if (id) {
      const foundProduct = getProductById(id);
      if (foundProduct) {
        setProduct(foundProduct);
        setName(foundProduct.name);
        setSku(foundProduct.sku);
        setBarcode(foundProduct.barcode || '');
        setPrice(foundProduct.price.toString());
        setStock(foundProduct.stock.toString());
        setMinStock(foundProduct.minStock.toString());
        setDescription(foundProduct.description || '');
        setCategory(foundProduct.category);
        setIsActive(foundProduct.isActive);
      }
    }
  }, [id]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSave = async () => {
    if (!product) return;

    // Validation
    if (!name.trim()) {
      Alert.alert('Ошибка', 'Введите название товара');
      return;
    }
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Alert.alert('Ошибка', 'Введите корректную цену');
      return;
    }
    if (stock === '' || isNaN(parseInt(stock)) || parseInt(stock) < 0) {
      Alert.alert('Ошибка', 'Введите корректный остаток');
      return;
    }

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const updates: Partial<Product> = {
        name: name.trim(),
        sku: sku.trim(),
        barcode: barcode.trim() || undefined,
        price: parseFloat(price),
        stock: parseInt(stock),
        minStock: parseInt(minStock) || 10,
        description: description.trim() || undefined,
        category,
        isActive,
      };

      await updateProduct(product.id, updates);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Успешно', 'Товар обновлен', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить изменения');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTabChange = (tab: 'info' | 'price' | 'stock') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
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
      </View>
    );
  }

  // Prepare chart data
  const priceChartData = (product.priceHistory || []).map((h) => ({
    date: h.date,
    value: h.price,
  }));

  const stockChartData = (product.stockHistory || []).map((h) => ({
    date: h.date,
    value: h.stock,
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Редактирование
        </Text>
        <Pressable
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Text>
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'info' && styles.tabActive]}
          onPress={() => handleTabChange('info')}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={activeTab === 'info' ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>
            Информация
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'price' && styles.tabActive]}
          onPress={() => handleTabChange('price')}
        >
          <Ionicons
            name="pricetag-outline"
            size={20}
            color={activeTab === 'price' ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'price' && styles.tabTextActive]}>
            Цена
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'stock' && styles.tabActive]}
          onPress={() => handleTabChange('stock')}
        >
          <Ionicons
            name="cube-outline"
            size={20}
            color={activeTab === 'stock' ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'stock' && styles.tabTextActive]}>
            Остатки
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {activeTab === 'info' && (
            <Animated.View entering={FadeInDown.duration(300)}>
              {/* Product Image */}
              <Card style={styles.imageCard}>
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="cube" size={60} color={colors.primary} />
                </View>
                <Pressable style={styles.imageButton}>
                  <Ionicons name="camera-outline" size={20} color={colors.primary} />
                  <Text style={styles.imageButtonText}>Изменить фото</Text>
                </Pressable>
              </Card>

              {/* Basic Info */}
              <Card style={styles.formCard}>
                <Text style={styles.sectionTitle}>Основная информация</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Название товара *</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Введите название"
                    placeholderTextColor={colors.textLight}
                  />
                </View>

                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
                    <Text style={styles.inputLabel}>SKU</Text>
                    <TextInput
                      style={styles.input}
                      value={sku}
                      onChangeText={setSku}
                      placeholder="SKU-XXX"
                      placeholderTextColor={colors.textLight}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Штрих-код</Text>
                    <TextInput
                      style={styles.input}
                      value={barcode}
                      onChangeText={setBarcode}
                      placeholder="4601234567890"
                      placeholderTextColor={colors.textLight}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Описание</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Описание товара..."
                    placeholderTextColor={colors.textLight}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Категория</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryList}
                  >
                    {categories.map((cat) => (
                      <Pressable
                        key={cat}
                        style={[
                          styles.categoryChip,
                          category === cat && styles.categoryChipActive,
                        ]}
                        onPress={() => setCategory(cat)}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            category === cat && styles.categoryChipTextActive,
                          ]}
                        >
                          {cat}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.switchRow}>
                  <View>
                    <Text style={styles.inputLabel}>Статус товара</Text>
                    <Text style={styles.switchDescription}>
                      {isActive ? 'Товар активен и доступен для продажи' : 'Товар скрыт'}
                    </Text>
                  </View>
                  <Pressable
                    style={[styles.switch, isActive && styles.switchActive]}
                    onPress={() => setIsActive(!isActive)}
                  >
                    <View style={[styles.switchKnob, isActive && styles.switchKnobActive]} />
                  </Pressable>
                </View>
              </Card>
            </Animated.View>
          )}

          {activeTab === 'price' && (
            <Animated.View entering={FadeInDown.duration(300)}>
              {/* Price Input */}
              <Card style={styles.formCard}>
                <Text style={styles.sectionTitle}>Текущая цена</Text>

                <View style={styles.priceInputContainer}>
                  <TextInput
                    style={styles.priceInput}
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.textLight}
                  />
                  <Text style={styles.priceCurrency}>₽</Text>
                </View>

                <Text style={styles.priceHint}>
                  Предыдущая цена: {formatCurrency(product.price)}
                </Text>
              </Card>

              {/* Price History */}
              <Card style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <Text style={styles.sectionTitle}>История изменения цены</Text>
                  <View style={styles.chartBadge}>
                    <Text style={styles.chartBadgeText}>7 недель</Text>
                  </View>
                </View>

                {priceChartData.length > 0 ? (
                  <LineChart
                    data={priceChartData}
                    color={colors.primary}
                    height={150}
                    valuePrefix=""
                    valueSuffix=" ₽"
                  />
                ) : (
                  <View style={styles.noDataContainer}>
                    <Ionicons name="analytics-outline" size={40} color={colors.textLight} />
                    <Text style={styles.noDataText}>Нет данных об изменении цены</Text>
                  </View>
                )}
              </Card>
            </Animated.View>
          )}

          {activeTab === 'stock' && (
            <Animated.View entering={FadeInDown.duration(300)}>
              {/* Stock Input */}
              <Card style={styles.formCard}>
                <Text style={styles.sectionTitle}>Остатки на складе</Text>

                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
                    <Text style={styles.inputLabel}>Текущий остаток</Text>
                    <TextInput
                      style={styles.input}
                      value={stock}
                      onChangeText={setStock}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={colors.textLight}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Минимум</Text>
                    <TextInput
                      style={styles.input}
                      value={minStock}
                      onChangeText={setMinStock}
                      keyboardType="numeric"
                      placeholder="10"
                      placeholderTextColor={colors.textLight}
                    />
                  </View>
                </View>

                {parseInt(stock) <= parseInt(minStock) && (
                  <View style={styles.stockWarning}>
                    <Ionicons name="warning" size={18} color={colors.warning} />
                    <Text style={styles.stockWarningText}>
                      Остаток ниже минимального уровня!
                    </Text>
                  </View>
                )}
              </Card>

              {/* Stock History */}
              <Card style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <Text style={styles.sectionTitle}>История изменения остатков</Text>
                  <View style={styles.chartBadge}>
                    <Text style={styles.chartBadgeText}>14 дней</Text>
                  </View>
                </View>

                {stockChartData.length > 0 ? (
                  <LineChart
                    data={stockChartData}
                    color={colors.success}
                    height={150}
                    valuePrefix=""
                    valueSuffix=" шт"
                  />
                ) : (
                  <View style={styles.noDataContainer}>
                    <Ionicons name="bar-chart-outline" size={40} color={colors.textLight} />
                    <Text style={styles.noDataText}>Нет данных об изменении остатков</Text>
                  </View>
                )}
              </Card>

              {/* Recent Stock Changes */}
              {product.stockHistory && product.stockHistory.length > 0 && (
                <Card style={styles.historyCard}>
                  <Text style={styles.sectionTitle}>Последние изменения</Text>
                  {product.stockHistory.slice(-5).reverse().map((entry, index) => (
                    <View key={index} style={styles.historyItem}>
                      <View style={styles.historyIcon}>
                        <Ionicons
                          name={
                            entry.reason === 'sale' ? 'cart' :
                            entry.reason === 'restock' ? 'add-circle' :
                            entry.reason === 'return' ? 'arrow-undo' : 'create'
                          }
                          size={18}
                          color={entry.change > 0 ? colors.success : colors.error}
                        />
                      </View>
                      <View style={styles.historyInfo}>
                        <Text style={styles.historyReason}>
                          {entry.reason === 'sale' ? 'Продажа' :
                           entry.reason === 'restock' ? 'Пополнение' :
                           entry.reason === 'return' ? 'Возврат' : 'Корректировка'}
                        </Text>
                        <Text style={styles.historyDate}>
                          {new Date(entry.date).toLocaleDateString('ru-RU')}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.historyChange,
                          { color: entry.change > 0 ? colors.success : colors.error },
                        ]}
                      >
                        {entry.change > 0 ? '+' : ''}{entry.change} шт
                      </Text>
                    </View>
                  ))}
                </Card>
              )}
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  saveButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textInverse,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    gap: spacing.xs,
  },
  tabActive: {
    backgroundColor: `${colors.primary}15`,
  },
  tabText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  imageCard: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.lg,
    backgroundColor: `${colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  imageButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.primary,
  },
  formCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryList: {
    marginTop: spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.textInverse,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    marginTop: 2,
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    padding: 2,
  },
  switchActive: {
    backgroundColor: colors.success,
  },
  switchKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  switchKnobActive: {
    alignSelf: 'flex-end',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  priceInput: {
    flex: 1,
    fontSize: typography.sizes.xxxl,
    fontWeight: '700',
    color: colors.primary,
    paddingVertical: spacing.md,
  },
  priceCurrency: {
    fontSize: typography.sizes.xl,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  priceHint: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  chartCard: {
    marginBottom: spacing.md,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  chartBadge: {
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  chartBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: '500',
    color: colors.primary,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  noDataText: {
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  stockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  stockWarningText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    flex: 1,
  },
  historyCard: {
    marginBottom: spacing.md,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  historyInfo: {
    flex: 1,
  },
  historyReason: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.text,
  },
  historyDate: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  historyChange: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
});
