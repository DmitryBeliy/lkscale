import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ProductCard } from '@/components/ProductCard';
import { SkeletonListLoader } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { Card, Button } from '@/components/ui';
import { BarcodeScanner, ScannerButton } from '@/components/BarcodeScanner';
import { StockInIcon } from '@/components/warehouse/WarehouseIcons';
import {
  getDataState,
  subscribeData,
  fetchData,
  searchProducts,
  getCategories,
  getLowStockProducts,
  getProductByBarcode,
  getProductBySku,
  productHasVariants,
  batchUpdateProducts,
} from '@/store/dataStore';
import { shareStockReport, getStockReportSummary, generateStockReport } from '@/services/documentExportService';
import { Product } from '@/types';
import { useLocalization } from '@/localization';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

export default function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const { t, formatCurrency, language } = useLocalization();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);

  // Batch update mode state
  const [batchMode, setBatchMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchAction, setBatchAction] = useState<'stock' | 'category' | 'status'>('stock');
  const [batchStockAdjustment, setBatchStockAdjustment] = useState('');
  const [batchCategory, setBatchCategory] = useState('');

  // Stock report state
  const [showReportModal, setShowReportModal] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    const unsub = subscribeData(() => {
      const state = getDataState();
      setProducts(state.products);
      setIsLoading(state.isLoading);
      setCategories(getCategories());
      setLowStockCount(getLowStockProducts().length);
    });

    fetchData();

    return () => unsub();
  }, []);

  useEffect(() => {
    let filtered = searchProducts(searchQuery, activeCategory);
    if (showLowStockOnly) {
      filtered = filtered.filter((p) => p.stock <= p.minStock);
    }
    setFilteredProducts(filtered);
  }, [products, searchQuery, activeCategory, showLowStockOnly]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchData();
    setRefreshing(false);
  }, []);

  const handleCategoryPress = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveCategory(category);
    setShowLowStockOnly(false);
  };

  const handleLowStockToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowLowStockOnly(!showLowStockOnly);
    if (!showLowStockOnly) {
      setActiveCategory('all');
    }
  };

  const handleProductPress = (productId: string) => {
    if (batchMode) {
      toggleProductSelection(productId);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push(`/product/${productId}`);
    }
  };

  const handleScan = (data: string, type: string) => {
    // Try to find product by barcode first, then by SKU
    let product = getProductByBarcode(data);
    if (!product) {
      product = getProductBySku(data);
    }

    if (product) {
      router.push(`/product/${product.id}`);
    } else {
      // If not found, set it as search query
      Alert.alert(
        t.inventory.productNotFound,
        `${t.inventory.productNotFound} "${data}". ${t.inventory.useForSearch}`,
        [
          { text: t.common.cancel, style: 'cancel' },
          { text: t.common.search, onPress: () => setSearchQuery(data) },
        ]
      );
    }
  };

  // Batch mode functions
  const toggleBatchMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (batchMode) {
      setBatchMode(false);
      setSelectedProducts(new Set());
    } else {
      setBatchMode(true);
    }
  };

  const toggleProductSelection = (productId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const selectAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const allIds = new Set(filteredProducts.map((p) => p.id));
    setSelectedProducts(allIds);
  };

  const deselectAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedProducts(new Set());
  };

  const openBatchModal = (action: 'stock' | 'category' | 'status') => {
    if (selectedProducts.size === 0) {
      Alert.alert(t.common.error, t.inventory.selectProducts);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBatchAction(action);
    setBatchStockAdjustment('');
    setBatchCategory('');
    setShowBatchModal(true);
  };

  const handleBatchUpdate = async () => {
    if (selectedProducts.size === 0) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const productIds = Array.from(selectedProducts);

    try {
      if (batchAction === 'stock') {
        const adjustment = parseInt(batchStockAdjustment, 10);
        if (isNaN(adjustment)) {
          Alert.alert(t.common.error, 'Invalid stock value');
          return;
        }
        await batchUpdateProducts(productIds, { stockAdjustment: adjustment });
      } else if (batchAction === 'category') {
        if (!batchCategory) {
          Alert.alert(t.common.error, 'Select a category');
          return;
        }
        await batchUpdateProducts(productIds, { category: batchCategory });
      } else if (batchAction === 'status') {
        // Toggle active status
        const firstProduct = products.find((p) => p.id === productIds[0]);
        const newStatus = firstProduct ? !firstProduct.isActive : false;
        await batchUpdateProducts(productIds, { isActive: newStatus });
      }

      setShowBatchModal(false);
      setBatchMode(false);
      setSelectedProducts(new Set());
      Alert.alert(t.common.success, `${productIds.length} ${t.inventory.productsSelected}`);
    } catch (error) {
      Alert.alert(t.common.error, 'Failed to update products');
    }
  };

  const getCategoryLabel = (category: string) => {
    if (category === 'all') return t.common.all;
    return category;
  };

  // Stock Report functions
  const handleOpenReportModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowReportModal(true);
  };

  const handleShareReport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsGeneratingReport(true);

    try {
      const success = await shareStockReport(products);
      if (!success) {
        // Fallback to clipboard
        const summary = getStockReportSummary(products);
        await Clipboard.setStringAsync(summary);
        Alert.alert('Отчёт скопирован', 'Отчёт скопирован в буфер обмена');
      }
      setShowReportModal(false);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сгенерировать отчёт');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleCopyReport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const summary = getStockReportSummary(products);
      await Clipboard.setStringAsync(summary);
      Alert.alert('Скопировано', 'Краткий отчёт скопирован в буфер обмена');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось скопировать отчёт');
    }
  };

  const getReportPreview = () => {
    if (products.length === 0) return null;
    const report = generateStockReport(products);
    return report;
  };

  const getTotalStock = () => {
    return products.reduce((sum, p) => sum + p.stock, 0);
  };

  const renderProductItem = ({ item, index }: { item: Product; index: number }) => {
    const isSelected = selectedProducts.has(item.id);
    const hasVariants = productHasVariants(item.id);

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
        <Pressable
          onPress={() => handleProductPress(item.id)}
          onLongPress={() => {
            if (!batchMode) {
              setBatchMode(true);
              toggleProductSelection(item.id);
            }
          }}
        >
          <View style={[
            styles.productWrapper,
            batchMode && isSelected && styles.productWrapperSelected,
          ]}>
            {batchMode && (
              <View style={[
                styles.selectionCheckbox,
                isSelected && styles.selectionCheckboxSelected,
              ]}>
                {isSelected && (
                  <Ionicons name="checkmark" size={16} color={colors.textInverse} />
                )}
              </View>
            )}
            <View style={{ flex: 1 }}>
              <ProductCard
                product={item}
                onPress={() => handleProductPress(item.id)}
                showVariantBadge={hasVariants}
              />
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <EmptyState
      variant="products"
      title={searchQuery || activeCategory !== 'all' || showLowStockOnly ? t.inventory.noProducts : (language === 'ru' ? 'Нет товаров' : 'No Products')}
      description={
        searchQuery || activeCategory !== 'all' || showLowStockOnly
          ? (language === 'ru' ? 'Попробуйте изменить параметры поиска' : 'Try different search criteria')
          : (language === 'ru' ? 'Добавьте товары для управления складом и продажами' : 'Add products to manage inventory and sales')
      }
      actionLabel={!searchQuery && activeCategory === 'all' ? (language === 'ru' ? 'Добавить товар' : 'Add Product') : undefined}
      onAction={!searchQuery && activeCategory === 'all' ? () => router.push('/warehouse/stock_in') : undefined}
    />
  );

  const renderHeader = () => (
    <>
      {/* Stats Summary */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Ionicons name="cube" size={24} color={colors.primary} />
          <Text style={styles.statValue}>{products.length}</Text>
          <Text style={styles.statLabel}>{t.inventory.products}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Ionicons name="layers" size={24} color={colors.success} />
          <Text style={styles.statValue}>{getTotalStock()}</Text>
          <Text style={styles.statLabel}>{t.inventory.inStock}</Text>
        </Card>
        <Pressable onPress={handleLowStockToggle}>
          <Card
            style={[styles.statCard, showLowStockOnly ? styles.statCardActive : null]}
          >
            <Ionicons
              name="warning"
              size={24}
              color={showLowStockOnly ? colors.textInverse : colors.warning}
            />
            <Text
              style={showLowStockOnly ? [styles.statValue, styles.statValueActive] : styles.statValue}
            >
              {lowStockCount}
            </Text>
            <Text
              style={showLowStockOnly ? [styles.statLabel, styles.statLabelActive] : styles.statLabel}
            >
              {t.inventory.lowStockLabel}
            </Text>
          </Card>
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Ionicons name="search" size={20} color={colors.textLight} />
          <TextInput
            style={styles.searchTextInput}
            placeholder={t.inventory.searchPlaceholder}
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textLight} />
            </Pressable>
          )}
          <Pressable
            style={styles.searchScanButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setScannerVisible(true);
            }}
          >
            <Ionicons name="scan" size={22} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      {/* Category Filters */}
      {!showLowStockOnly && (
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            data={categories}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.filterChip,
                  activeCategory === item && styles.filterChipActive,
                ]}
                onPress={() => handleCategoryPress(item)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    activeCategory === item && styles.filterChipTextActive,
                  ]}
                >
                  {getCategoryLabel(item)}
                </Text>
              </Pressable>
            )}
          />
        </View>
      )}

      {showLowStockOnly && (
        <View style={styles.lowStockBanner}>
          <Ionicons name="warning" size={20} color={colors.warning} />
          <Text style={styles.lowStockBannerText}>
            Показаны товары с низким запасом
          </Text>
          <Pressable onPress={handleLowStockToggle}>
            <Text style={styles.clearFilterText}>{t.common.clear}</Text>
          </Pressable>
        </View>
      )}

      {/* Batch Mode Banner */}
      {batchMode && (
        <View style={styles.batchModeBanner}>
          <View style={styles.batchModeInfo}>
            <Ionicons name="checkbox" size={20} color={colors.primary} />
            <Text style={styles.batchModeText}>
              {selectedProducts.size} {t.inventory.productsSelected}
            </Text>
          </View>
          <View style={styles.batchModeActions}>
            <Pressable onPress={selectAll} style={styles.batchModeAction}>
              <Text style={styles.batchModeActionText}>{t.common.all}</Text>
            </Pressable>
            <Pressable onPress={deselectAll} style={styles.batchModeAction}>
              <Text style={styles.batchModeActionText}>{t.common.clear}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Offline Banner */}
      <OfflineBanner />

      {/* Barcode Scanner */}
      <BarcodeScanner
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={handleScan}
        title={t.inventory.scanProduct}
        description="Наведите камеру на штрих-код товара"
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t.nav.inventory}</Text>
        <View style={styles.headerActions}>
          <Pressable
            style={[styles.headerButton, styles.warehouseButton]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/warehouse');
            }}
          >
            <StockInIcon size={20} color={colors.textInverse} />
          </Pressable>
          <Pressable
            style={styles.headerButton}
            onPress={handleOpenReportModal}
          >
            <Ionicons name="document-text-outline" size={22} color={colors.text} />
          </Pressable>
          <Pressable
            style={[styles.headerButton, batchMode && styles.headerButtonActive]}
            onPress={toggleBatchMode}
          >
            <Ionicons
              name={batchMode ? 'close' : 'checkbox-outline'}
              size={22}
              color={batchMode ? colors.textInverse : colors.text}
            />
          </Pressable>
          <ScannerButton
            onPress={() => setScannerVisible(true)}
            variant="secondary"
            size="medium"
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.statsRow}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.skeletonStat} />
            ))}
          </View>
          <SkeletonListLoader count={4} type="product" />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}

      {/* Batch Actions Bottom Bar */}
      {batchMode && selectedProducts.size > 0 && (
        <View style={[styles.batchActionsBar, { paddingBottom: insets.bottom + spacing.sm }]}>
          <Pressable style={styles.batchActionButton} onPress={() => openBatchModal('stock')}>
            <Ionicons name="add-circle" size={24} color={colors.primary} />
            <Text style={styles.batchActionLabel}>{t.inventory.stock}</Text>
          </Pressable>
          <Pressable style={styles.batchActionButton} onPress={() => openBatchModal('category')}>
            <Ionicons name="folder" size={24} color={colors.primary} />
            <Text style={styles.batchActionLabel}>{t.inventory.category}</Text>
          </Pressable>
          <Pressable style={styles.batchActionButton} onPress={() => openBatchModal('status')}>
            <Ionicons name="toggle" size={24} color={colors.primary} />
            <Text style={styles.batchActionLabel}>Статус</Text>
          </Pressable>
        </View>
      )}

      {/* Batch Update Modal */}
      <Modal
        visible={showBatchModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBatchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + spacing.lg }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.inventory.batchUpdate}</Text>
              <Pressable onPress={() => setShowBatchModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>
                {selectedProducts.size} {t.inventory.productsSelected}
              </Text>

              {batchAction === 'stock' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Изменение остатка (+ или -)
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={batchStockAdjustment}
                    onChangeText={setBatchStockAdjustment}
                    placeholder="+10 или -5"
                    placeholderTextColor={colors.textLight}
                    keyboardType="numeric"
                  />
                  <Text style={styles.inputHint}>
                    Используйте + для добавления, - для уменьшения
                  </Text>
                </View>
              )}

              {batchAction === 'category' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t.inventory.category}</Text>
                  <View style={styles.categoryPicker}>
                    {categories.filter((c) => c !== 'all').map((cat) => (
                      <Pressable
                        key={cat}
                        style={[
                          styles.categoryOption,
                          batchCategory === cat && styles.categoryOptionActive,
                        ]}
                        onPress={() => setBatchCategory(cat)}
                      >
                        <Text
                          style={[
                            styles.categoryOptionText,
                            batchCategory === cat && styles.categoryOptionTextActive,
                          ]}
                        >
                          {cat}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {batchAction === 'status' && (
                <View style={styles.statusInfo}>
                  <Ionicons name="information-circle" size={24} color={colors.primary} />
                  <Text style={styles.statusInfoText}>
                    Статус выбранных товаров будет изменён на противоположный
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.modalFooter}>
              <Button
                title={t.common.cancel}
                variant="outline"
                onPress={() => setShowBatchModal(false)}
                style={{ flex: 1 }}
              />
              <Button
                title={t.inventory.updateSelected}
                onPress={handleBatchUpdate}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Stock Report Modal */}
      <Modal
        visible={showReportModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + spacing.lg }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Отчёт по складу</Text>
              <Pressable onPress={() => setShowReportModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              {(() => {
                const report = getReportPreview();
                if (!report) {
                  return (
                    <View style={styles.reportEmptyState}>
                      <Ionicons name="cube-outline" size={48} color={colors.textLight} />
                      <Text style={styles.reportEmptyText}>Нет товаров для отчёта</Text>
                    </View>
                  );
                }
                return (
                  <>
                    <View style={styles.reportSummary}>
                      <View style={styles.reportSummaryRow}>
                        <View style={styles.reportSummaryItem}>
                          <Text style={styles.reportSummaryLabel}>Товаров</Text>
                          <Text style={styles.reportSummaryValue}>{report.totalItems}</Text>
                        </View>
                        <View style={styles.reportSummaryItem}>
                          <Text style={styles.reportSummaryLabel}>Низкий остаток</Text>
                          <Text style={[styles.reportSummaryValue, styles.reportWarning]}>
                            {report.lowStockItems}
                          </Text>
                        </View>
                        <View style={styles.reportSummaryItem}>
                          <Text style={styles.reportSummaryLabel}>Нет в наличии</Text>
                          <Text style={[styles.reportSummaryValue, styles.reportDanger]}>
                            {report.outOfStockItems}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.reportDivider} />

                      <View style={styles.reportValueRow}>
                        <View style={styles.reportValueItem}>
                          <Text style={styles.reportValueLabel}>Себестоимость</Text>
                          <Text style={styles.reportValueAmount}>
                            {formatCurrency(report.totalCostValue)}
                          </Text>
                        </View>
                        <View style={styles.reportValueItem}>
                          <Text style={styles.reportValueLabel}>Розничная стоимость</Text>
                          <Text style={[styles.reportValueAmount, styles.reportValueHighlight]}>
                            {formatCurrency(report.totalRetailValue)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.reportProfitRow}>
                        <View style={styles.reportProfitIcon}>
                          <Ionicons name="trending-up" size={20} color={colors.success} />
                        </View>
                        <Text style={styles.reportProfitLabel}>Потенциальная прибыль:</Text>
                        <Text style={styles.reportProfitValue}>
                          {formatCurrency(report.potentialProfit)}
                        </Text>
                      </View>
                    </View>
                  </>
                );
              })()}
            </View>

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.reportCopyButton}
                onPress={handleCopyReport}
              >
                <Ionicons name="copy-outline" size={20} color={colors.primary} />
                <Text style={styles.reportCopyText}>Копировать</Text>
              </Pressable>
              <Pressable
                style={styles.reportShareButton}
                onPress={handleShareReport}
                disabled={isGeneratingReport || products.length === 0}
              >
                {isGeneratingReport ? (
                  <ActivityIndicator size="small" color={colors.textInverse} />
                ) : (
                  <>
                    <Ionicons name="share-outline" size={20} color={colors.textInverse} />
                    <Text style={styles.reportShareText}>Поделиться отчётом</Text>
                  </>
                )}
              </Pressable>
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
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  headerButtonActive: {
    backgroundColor: colors.primary,
  },
  warehouseButton: {
    backgroundColor: colors.success,
  },
  loadingContainer: {
    padding: spacing.md,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statCardActive: {
    backgroundColor: colors.warning,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
  },
  statValueActive: {
    color: colors.textInverse,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statLabelActive: {
    color: colors.textInverse,
  },
  skeletonStat: {
    flex: 1,
    height: 80,
    backgroundColor: colors.skeleton,
    borderRadius: borderRadius.lg,
  },
  searchContainer: {
    marginBottom: spacing.sm,
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
    paddingVertical: 4,
  },
  searchScanButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: `${colors.primary}15`,
  },
  filtersContainer: {
    marginBottom: spacing.md,
  },
  filtersList: {
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.textInverse,
  },
  lowStockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  lowStockBannerText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  clearFilterText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  batchModeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${colors.primary}15`,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  batchModeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  batchModeText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  batchModeActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  batchModeAction: {
    paddingHorizontal: spacing.sm,
  },
  batchModeActionText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.primary,
  },
  productWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  productWrapperSelected: {
    backgroundColor: `${colors.primary}10`,
    borderRadius: borderRadius.lg,
  },
  selectionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.borderLight,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionCheckboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  batchActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.lg,
  },
  batchActionButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  batchActionLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text,
    marginTop: spacing.xs,
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
  modalSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
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
  inputHint: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryOptionText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  categoryOptionTextActive: {
    color: colors.textInverse,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  statusInfoText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.sizes.sm * 1.5,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  // Report Modal Styles
  reportEmptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  reportEmptyText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  reportSummary: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  reportSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reportSummaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  reportSummaryLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  reportSummaryValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  reportWarning: {
    color: colors.warning,
  },
  reportDanger: {
    color: colors.error,
  },
  reportDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  reportValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  reportValueItem: {
    flex: 1,
  },
  reportValueLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  reportValueAmount: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
  },
  reportValueHighlight: {
    color: colors.primary,
  },
  reportProfitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.success}15`,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  reportProfitIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.success}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportProfitLabel: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  reportProfitValue: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.success,
  },
  reportCopyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`,
    gap: spacing.sm,
  },
  reportCopyText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.primary,
  },
  reportShareButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    gap: spacing.sm,
  },
  reportShareText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textInverse,
  },
});
