import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { WarehouseScanner } from '@/components/warehouse';
import { PriceTagIcon, BarcodeGenIcon } from '@/components/warehouse/WarehouseIcons';
import { Button } from '@/components/ui/Button';
import { generateInternalBarcode } from '@/services/warehouseService';
import { getDataState, getProductByBarcode } from '@/store/dataStore';
import type { Product } from '@/types';

type TagSize = 'small' | 'medium' | 'large';

interface SelectedProduct {
  product: Product;
  copies: number;
}

export default function PriceTagsScreen() {
  const insets = useSafeAreaInsets();
  const [showScanner, setShowScanner] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [tagSize, setTagSize] = useState<TagSize>('medium');
  const [showBarcode, setShowBarcode] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleScan = async (data: string, type: string) => {
    let product: Product | undefined = getProductByBarcode(data);
    if (!product) {
      product = getDataState().products.find((p: Product) => p.sku === data);
    }

    if (product) {
      const existingIndex = selectedProducts.findIndex(
        (sp) => sp.product.id === product.id
      );
      if (existingIndex >= 0) {
        const newSelected = [...selectedProducts];
        newSelected[existingIndex].copies += 1;
        setSelectedProducts(newSelected);
      } else {
        setSelectedProducts([
          ...selectedProducts,
          { product, copies: 1 },
        ]);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Ошибка', `Товар с кодом ${data} не найден`);
    }
  };

  const handleCopiesChange = (index: number, delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newSelected = [...selectedProducts];
    newSelected[index].copies = Math.max(1, newSelected[index].copies + delta);
    setSelectedProducts(newSelected);
  };

  const handleRemoveProduct = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const handleGenerateBarcode = async (product: Product, index: number) => {
    if (product.barcode) {
      Alert.alert('Внимание', 'У товара уже есть штрих-код');
      return;
    }

    Alert.alert(
      'Генерация штрих-кода',
      `Создать внутренний штрих-код для "${product.name}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Создать',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const barcode = await generateInternalBarcode(product.id);
            if (barcode) {
              // Update product in local state
              const newSelected = [...selectedProducts];
              newSelected[index].product = {
                ...newSelected[index].product,
                barcode,
              };
              setSelectedProducts(newSelected);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
      ]
    );
  };

  const getTotalCopies = () => {
    return selectedProducts.reduce((sum, sp) => sum + sp.copies, 0);
  };

  const generatePriceTagsHTML = (): string => {
    const tagDimensions = {
      small: { width: '50mm', height: '30mm', fontSize: '10px', barcodeHeight: '20px' },
      medium: { width: '70mm', height: '40mm', fontSize: '12px', barcodeHeight: '30px' },
      large: { width: '90mm', height: '50mm', fontSize: '14px', barcodeHeight: '40px' },
    };

    const dims = tagDimensions[tagSize];

    let tagsHTML = '';
    selectedProducts.forEach((sp) => {
      for (let i = 0; i < sp.copies; i++) {
        tagsHTML += `
          <div class="tag" style="width: ${dims.width}; height: ${dims.height};">
            <div class="name" style="font-size: calc(${dims.fontSize} * 1.2);">${sp.product.name}</div>
            <div class="price" style="font-size: calc(${dims.fontSize} * 2);">${sp.product.price.toLocaleString('ru-RU')} ₽</div>
            ${sp.product.category ? `<div class="category" style="font-size: ${dims.fontSize};">${sp.product.category}</div>` : ''}
            ${showBarcode && (sp.product.barcode || sp.product.sku) ? `
              <div class="barcode" style="font-size: ${dims.fontSize}; height: ${dims.barcodeHeight};">
                <div class="barcode-lines"></div>
                <div class="barcode-text">${sp.product.barcode || sp.product.sku}</div>
              </div>
            ` : ''}
          </div>
        `;
      }
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Ценники</title>
  <style>
    @page {
      size: A4;
      margin: 10mm;
    }
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 10mm;
    }
    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 5mm;
    }
    .tag {
      border: 1px solid #333;
      border-radius: 3mm;
      padding: 3mm;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .name {
      font-weight: bold;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .price {
      font-weight: bold;
      text-align: center;
      color: #c00;
    }
    .category {
      text-align: center;
      color: #666;
    }
    .barcode {
      text-align: center;
      margin-top: 2mm;
    }
    .barcode-lines {
      background: repeating-linear-gradient(
        90deg,
        #000 0px,
        #000 2px,
        #fff 2px,
        #fff 4px
      );
      height: 60%;
      margin-bottom: 1mm;
    }
    .barcode-text {
      font-family: monospace;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div class="tags-container">
    ${tagsHTML}
  </div>
</body>
</html>
    `;
  };

  const handleGeneratePDF = async () => {
    if (selectedProducts.length === 0) {
      Alert.alert('Ошибка', 'Добавьте товары для печати');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsGenerating(true);

    try {
      const html = generatePriceTagsHTML();

      // Generate PDF using expo-print
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      // Check if sharing is available
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Сохранить или отправить ценники',
          UTI: 'com.adobe.pdf',
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        // Fallback: open print dialog directly
        await Print.printAsync({ uri });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Готово', 'PDF создан и отправлен на печать');
      }
    } catch (error) {
      console.error('Error generating price tags:', error);
      Alert.alert('Ошибка', 'Не удалось создать ценники');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintDirectly = async () => {
    if (selectedProducts.length === 0) {
      Alert.alert('Ошибка', 'Добавьте товары для печати');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsGenerating(true);

    try {
      const html = generatePriceTagsHTML();
      await Print.printAsync({ html });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error printing price tags:', error);
      Alert.alert('Ошибка', 'Не удалось отправить на печать');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderProductItem = ({
    item,
    index,
  }: {
    item: SelectedProduct;
    index: number;
  }) => (
    <Animated.View
      entering={SlideInRight.delay(index * 50)}
      style={styles.productCard}
    >
      <View style={styles.productHeader}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.product.name}
        </Text>
        <Pressable onPress={() => handleRemoveProduct(index)} hitSlop={10}>
          <Ionicons name="close-circle" size={24} color={colors.error} />
        </Pressable>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productSku}>SKU: {item.product.sku}</Text>
        <Text style={styles.productPrice}>
          {item.product.price.toLocaleString('ru-RU')} ₽
        </Text>
      </View>

      {!item.product.barcode && (
        <Pressable
          style={styles.generateBarcodeButton}
          onPress={() => handleGenerateBarcode(item.product, index)}
        >
          <BarcodeGenIcon size={18} color={colors.primary} />
          <Text style={styles.generateBarcodeText}>Создать штрих-код</Text>
        </Pressable>
      )}

      <View style={styles.copiesRow}>
        <Text style={styles.copiesLabel}>Копий:</Text>
        <View style={styles.copiesControl}>
          <Pressable
            style={styles.copiesButton}
            onPress={() => handleCopiesChange(index, -1)}
          >
            <Ionicons name="remove" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.copiesText}>{item.copies}</Text>
          <Pressable
            style={styles.copiesButton}
            onPress={() => handleCopiesChange(index, 1)}
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
          title: 'Печать ценников',
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
      >
        {/* Scan Button */}
        <Animated.View entering={FadeIn}>
          <Pressable
            style={styles.scanButton}
            onPress={() => setShowScanner(true)}
          >
            <View style={styles.scanButtonIcon}>
              <PriceTagIcon size={32} color={colors.warning} />
            </View>
            <View style={styles.scanButtonContent}>
              <Text style={styles.scanButtonTitle}>Добавить товары</Text>
              <Text style={styles.scanButtonSubtitle}>
                Сканируйте или выберите из списка
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.warning} />
          </Pressable>
        </Animated.View>

        {/* Settings */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.section}>
          <Text style={styles.sectionTitle}>Настройки ценников</Text>

          <Text style={styles.settingLabel}>Размер ценника</Text>
          <View style={styles.sizeOptions}>
            {(['small', 'medium', 'large'] as TagSize[]).map((size) => (
              <Pressable
                key={size}
                style={[
                  styles.sizeOption,
                  tagSize === size && styles.sizeOptionActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setTagSize(size);
                }}
              >
                <Text
                  style={[
                    styles.sizeOptionText,
                    tagSize === size && styles.sizeOptionTextActive,
                  ]}
                >
                  {size === 'small'
                    ? 'Малый'
                    : size === 'medium'
                    ? 'Средний'
                    : 'Большой'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.toggleOption}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowBarcode(!showBarcode);
            }}
          >
            <View style={styles.toggleContent}>
              <BarcodeGenIcon size={20} color={colors.textSecondary} />
              <Text style={styles.toggleText}>Показывать штрих-код</Text>
            </View>
            <Ionicons
              name={showBarcode ? 'checkbox' : 'square-outline'}
              size={24}
              color={showBarcode ? colors.primary : colors.textLight}
            />
          </Pressable>
        </Animated.View>

        {/* Selected Products */}
        {selectedProducts.length > 0 && (
          <Animated.View entering={FadeIn.delay(150)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Выбрано товаров ({selectedProducts.length})
              </Text>
              <Text style={styles.totalCopies}>
                Всего ценников: {getTotalCopies()}
              </Text>
            </View>

            <FlatList
              data={selectedProducts}
              renderItem={renderProductItem}
              keyExtractor={(_, index) => index.toString()}
              scrollEnabled={false}
            />
          </Animated.View>
        )}

        {/* Generate Buttons */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.submitContainer}>
          <Button
            title={`Экспорт PDF (${getTotalCopies()} ценников)`}
            onPress={handleGeneratePDF}
            loading={isGenerating}
            disabled={selectedProducts.length === 0}
            style={{ width: '100%' }}
            icon={<Ionicons name="document" size={20} color={colors.textInverse} />}
          />
          <Button
            title="Печать напрямую"
            onPress={handlePrintDirectly}
            variant="outline"
            loading={isGenerating}
            disabled={selectedProducts.length === 0}
            style={{ width: '100%', marginTop: spacing.sm }}
            icon={<Ionicons name="print" size={20} color={colors.primary} />}
          />
        </Animated.View>

        <View style={{ height: insets.bottom + spacing.lg }} />
      </ScrollView>

      {/* Scanner */}
      <WarehouseScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
        title="Добавить товар"
        description="Сканируйте штрих-код для добавления"
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
    backgroundColor: `${colors.warning}15`,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.warning,
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
    color: colors.warning,
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
  totalCopies: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  settingLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  sizeOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sizeOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  sizeOptionActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  sizeOptionText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  sizeOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toggleText: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  productCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  productName: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.sm,
  },
  productInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  productSku: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  productPrice: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.primary,
  },
  generateBarcodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.primary}10`,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  generateBarcodeText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  copiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  copiesLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  copiesControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  copiesButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copiesText: {
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
