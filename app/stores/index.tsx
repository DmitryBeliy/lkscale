import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/localization';
import { mockStores, getStorePerformance } from '@/services/enterpriseService';
import { Store, StorePerformance } from '@/types/enterprise';

export default function StoresScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, typography, borderRadius, shadows, isDark } = useTheme();
  const { t, formatCurrency } = useLocalization();

  const [stores, setStores] = useState<Store[]>(mockStores);
  const [storePerformance] = useState<StorePerformance[]>(getStorePerformance());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const [newStore, setNewStore] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    managerName: '',
  });

  const [transfer, setTransfer] = useState({
    fromStoreId: '',
    toStoreId: '',
    productName: '',
    quantity: '',
    notes: '',
  });

  const getPerformanceForStore = (storeId: string): StorePerformance | undefined => {
    return storePerformance.find(p => p.storeId === storeId);
  };

  const handleAddStore = () => {
    if (!newStore.name || !newStore.code) {
      Alert.alert(t.common.error, 'Заполните обязательные поля');
      return;
    }

    const store: Store = {
      id: `store-${Date.now()}`,
      ownerId: 'user-1',
      name: newStore.name,
      code: newStore.code.toUpperCase(),
      address: newStore.address,
      phone: newStore.phone,
      managerName: newStore.managerName,
      isMain: false,
      isActive: true,
      timezone: 'Europe/Moscow',
      currency: 'RUB',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setStores([...stores, store]);
    setShowAddModal(false);
    setNewStore({ name: '', code: '', address: '', phone: '', managerName: '' });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleTransfer = () => {
    if (!transfer.fromStoreId || !transfer.toStoreId || !transfer.productName || !transfer.quantity) {
      Alert.alert(t.common.error, 'Заполните все поля');
      return;
    }

    // In production, this would make an API call
    Alert.alert(
      t.common.success,
      `Перемещение ${transfer.quantity} шт. товара "${transfer.productName}" создано`,
      [{ text: 'OK' }]
    );

    setShowTransferModal(false);
    setTransfer({ fromStoreId: '', toStoreId: '', productName: '', quantity: '', notes: '' });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: insets.top + spacing.sm,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: typography.sizes.xxl,
      fontWeight: '700',
      color: '#fff',
    },
    addButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    summaryCards: {
      flexDirection: 'row',
      marginTop: spacing.lg,
      gap: spacing.sm,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      alignItems: 'center',
    },
    summaryValue: {
      fontSize: typography.sizes.xxl,
      fontWeight: '700',
      color: '#fff',
    },
    summaryLabel: {
      fontSize: typography.sizes.xs,
      color: 'rgba(255,255,255,0.8)',
      marginTop: 4,
    },
    scrollContent: {
      padding: spacing.md,
      paddingBottom: insets.bottom + spacing.xxl,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      gap: spacing.sm,
      ...shadows.sm,
    },
    actionButtonText: {
      fontSize: typography.sizes.sm,
      fontWeight: '600',
      color: colors.primary,
    },
    sectionTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md,
    },
    storeCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    storeCardMain: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    mainBadge: {
      position: 'absolute',
      top: -10,
      right: spacing.md,
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.full,
    },
    mainBadgeText: {
      fontSize: typography.sizes.xs,
      fontWeight: '700',
      color: '#fff',
    },
    storeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    storeInfo: {
      flex: 1,
    },
    storeName: {
      fontSize: typography.sizes.lg,
      fontWeight: '700',
      color: colors.text,
    },
    storeCode: {
      fontSize: typography.sizes.sm,
      color: colors.primary,
      fontWeight: '600',
      marginTop: 2,
    },
    storeAddress: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    storeStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusText: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
    },
    metricsRow: {
      flexDirection: 'row',
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    metric: {
      flex: 1,
      alignItems: 'center',
    },
    metricValue: {
      fontSize: typography.sizes.md,
      fontWeight: '700',
      color: colors.text,
    },
    metricLabel: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    metricGrowth: {
      fontSize: typography.sizes.xs,
      fontWeight: '600',
      marginTop: 2,
    },
    storeActions: {
      flexDirection: 'row',
      marginTop: spacing.md,
      gap: spacing.sm,
    },
    storeActionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm,
      gap: spacing.xs,
    },
    storeActionText: {
      fontSize: typography.sizes.sm,
      fontWeight: '600',
      color: colors.primary,
    },
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: borderRadius.xxl,
      borderTopRightRadius: borderRadius.xxl,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: insets.bottom + spacing.lg,
      maxHeight: '85%',
    },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: spacing.md,
    },
    modalTitle: {
      fontSize: typography.sizes.xl,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.lg,
    },
    inputLabel: {
      fontSize: typography.sizes.sm,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      fontSize: typography.sizes.md,
      color: colors.text,
      marginBottom: spacing.md,
    },
    selectInput: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      marginBottom: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    selectText: {
      fontSize: typography.sizes.md,
      color: colors.text,
    },
    selectPlaceholder: {
      color: colors.textLight,
    },
    storeSelectList: {
      marginBottom: spacing.md,
    },
    storeSelectItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.xs,
      backgroundColor: colors.background,
    },
    storeSelectItemSelected: {
      backgroundColor: `${colors.primary}15`,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    storeSelectName: {
      fontSize: typography.sizes.md,
      color: colors.text,
      flex: 1,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.md,
    },
    modalButton: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    modalButtonCancel: {
      backgroundColor: colors.background,
    },
    modalButtonSubmit: {
      backgroundColor: colors.primary,
    },
    modalButtonText: {
      fontSize: typography.sizes.md,
      fontWeight: '600',
    },
    modalButtonTextCancel: {
      color: colors.text,
    },
    modalButtonTextSubmit: {
      color: '#fff',
    },
  });

  const totalRevenue = storePerformance.reduce((sum, s) => sum + s.revenue, 0);
  const totalOrders = storePerformance.reduce((sum, s) => sum + s.orders, 0);

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      <LinearGradient
        colors={isDark ? ['#1a1a2e', '#16213e'] : [colors.primary, '#1a68d1']}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>{t.enterprise.storesManagement}</Text>
          <Pressable style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Ionicons name="add" size={24} color="#fff" />
          </Pressable>
        </View>

        <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{stores.length}</Text>
            <Text style={styles.summaryLabel}>{t.enterprise.activeStores}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{(totalRevenue / 1000000).toFixed(1)}M</Text>
            <Text style={styles.summaryLabel}>{t.executive.grossRevenue}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalOrders}</Text>
            <Text style={styles.summaryLabel}>{t.common.orders}</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={styles.actionButtons}>
            <Pressable
              style={styles.actionButton}
              onPress={() => setShowTransferModal(true)}
            >
              <Ionicons name="swap-horizontal" size={20} color={colors.primary} />
              <Text style={styles.actionButtonText}>{t.enterprise.stockTransfer}</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push('/executive')}
            >
              <Ionicons name="stats-chart" size={20} color={colors.primary} />
              <Text style={styles.actionButtonText}>{t.enterprise.consolidatedReport}</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Stores List */}
        <Text style={styles.sectionTitle}>{t.enterprise.yourStores}</Text>

        {stores.map((store, index) => {
          const performance = getPerformanceForStore(store.id);

          return (
            <Animated.View
              key={store.id}
              entering={FadeInDown.delay(200 + index * 100).duration(400)}
            >
              <Pressable
                style={[styles.storeCard, store.isMain && styles.storeCardMain]}
                onPress={() => {
                  setSelectedStore(store);
                  Haptics.selectionAsync();
                }}
              >
                {store.isMain && (
                  <View style={styles.mainBadge}>
                    <Text style={styles.mainBadgeText}>{t.enterprise.mainStore}</Text>
                  </View>
                )}

                <View style={styles.storeHeader}>
                  <View style={styles.storeInfo}>
                    <Text style={styles.storeName}>{store.name}</Text>
                    <Text style={styles.storeCode}>#{store.code}</Text>
                    {store.address && (
                      <Text style={styles.storeAddress} numberOfLines={1}>
                        📍 {store.address}
                      </Text>
                    )}
                  </View>
                  <View style={styles.storeStatus}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: store.isActive ? colors.success : colors.error }
                    ]} />
                    <Text style={styles.statusText}>
                      {store.isActive ? t.common.active : 'Неактивен'}
                    </Text>
                  </View>
                </View>

                {performance && (
                  <View style={styles.metricsRow}>
                    <View style={styles.metric}>
                      <Text style={styles.metricValue}>
                        {formatCurrency(performance.revenue)}
                      </Text>
                      <Text style={styles.metricLabel}>{t.executive.revenue}</Text>
                      <Text style={[
                        styles.metricGrowth,
                        { color: performance.growth >= 0 ? colors.success : colors.error }
                      ]}>
                        {performance.growth >= 0 ? '↑' : '↓'} {Math.abs(performance.growth).toFixed(1)}%
                      </Text>
                    </View>
                    <View style={styles.metric}>
                      <Text style={styles.metricValue}>
                        {formatCurrency(performance.profit)}
                      </Text>
                      <Text style={styles.metricLabel}>{t.executive.profit}</Text>
                    </View>
                    <View style={styles.metric}>
                      <Text style={styles.metricValue}>{performance.orders}</Text>
                      <Text style={styles.metricLabel}>{t.common.orders}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.storeActions}>
                  <Pressable style={styles.storeActionBtn}>
                    <Ionicons name="eye" size={16} color={colors.primary} />
                    <Text style={styles.storeActionText}>{t.common.details}</Text>
                  </Pressable>
                  <Pressable style={styles.storeActionBtn}>
                    <Ionicons name="cube" size={16} color={colors.primary} />
                    <Text style={styles.storeActionText}>{t.enterprise.inventory}</Text>
                  </Pressable>
                  <Pressable style={styles.storeActionBtn}>
                    <Ionicons name="settings" size={16} color={colors.primary} />
                    <Text style={styles.storeActionText}>{t.common.settings}</Text>
                  </Pressable>
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Add Store Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddModal(false)}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t.enterprise.addStore}</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>{t.enterprise.storeName} *</Text>
              <TextInput
                style={styles.input}
                value={newStore.name}
                onChangeText={(text) => setNewStore({ ...newStore, name: text })}
                placeholder="Магазин Север"
                placeholderTextColor={colors.textLight}
              />

              <Text style={styles.inputLabel}>{t.enterprise.storeCode} *</Text>
              <TextInput
                style={styles.input}
                value={newStore.code}
                onChangeText={(text) => setNewStore({ ...newStore, code: text.toUpperCase() })}
                placeholder="NORTH"
                placeholderTextColor={colors.textLight}
                autoCapitalize="characters"
              />

              <Text style={styles.inputLabel}>{t.enterprise.storeAddress}</Text>
              <TextInput
                style={styles.input}
                value={newStore.address}
                onChangeText={(text) => setNewStore({ ...newStore, address: text })}
                placeholder="г. Москва, ул. Примерная, д. 1"
                placeholderTextColor={colors.textLight}
              />

              <Text style={styles.inputLabel}>{t.enterprise.storePhone}</Text>
              <TextInput
                style={styles.input}
                value={newStore.phone}
                onChangeText={(text) => setNewStore({ ...newStore, phone: text })}
                placeholder="+7 (999) 123-45-67"
                placeholderTextColor={colors.textLight}
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>{t.enterprise.storeManager}</Text>
              <TextInput
                style={styles.input}
                value={newStore.managerName}
                onChangeText={(text) => setNewStore({ ...newStore, managerName: text })}
                placeholder="Имя Фамилия"
                placeholderTextColor={colors.textLight}
              />

              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>
                    {t.common.cancel}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.modalButtonSubmit]}
                  onPress={handleAddStore}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextSubmit]}>
                    {t.common.add}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Stock Transfer Modal */}
      <Modal
        visible={showTransferModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTransferModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowTransferModal(false)}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t.enterprise.stockTransfer}</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>{t.enterprise.transferFrom}</Text>
              <View style={styles.storeSelectList}>
                {stores.map(store => (
                  <Pressable
                    key={`from-${store.id}`}
                    style={[
                      styles.storeSelectItem,
                      transfer.fromStoreId === store.id && styles.storeSelectItemSelected,
                    ]}
                    onPress={() => setTransfer({ ...transfer, fromStoreId: store.id })}
                  >
                    <Text style={styles.storeSelectName}>{store.name}</Text>
                    {transfer.fromStoreId === store.id && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    )}
                  </Pressable>
                ))}
              </View>

              <Text style={styles.inputLabel}>{t.enterprise.transferTo}</Text>
              <View style={styles.storeSelectList}>
                {stores.filter(s => s.id !== transfer.fromStoreId).map(store => (
                  <Pressable
                    key={`to-${store.id}`}
                    style={[
                      styles.storeSelectItem,
                      transfer.toStoreId === store.id && styles.storeSelectItemSelected,
                    ]}
                    onPress={() => setTransfer({ ...transfer, toStoreId: store.id })}
                  >
                    <Text style={styles.storeSelectName}>{store.name}</Text>
                    {transfer.toStoreId === store.id && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    )}
                  </Pressable>
                ))}
              </View>

              <Text style={styles.inputLabel}>{t.enterprise.productName}</Text>
              <TextInput
                style={styles.input}
                value={transfer.productName}
                onChangeText={(text) => setTransfer({ ...transfer, productName: text })}
                placeholder="Название товара"
                placeholderTextColor={colors.textLight}
              />

              <Text style={styles.inputLabel}>{t.enterprise.quantity}</Text>
              <TextInput
                style={styles.input}
                value={transfer.quantity}
                onChangeText={(text) => setTransfer({ ...transfer, quantity: text })}
                placeholder="10"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>{t.enterprise.transferNotes}</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                value={transfer.notes}
                onChangeText={(text) => setTransfer({ ...transfer, notes: text })}
                placeholder="Примечания к перемещению..."
                placeholderTextColor={colors.textLight}
                multiline
              />

              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setShowTransferModal(false)}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>
                    {t.common.cancel}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.modalButtonSubmit]}
                  onPress={handleTransfer}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextSubmit]}>
                    {t.enterprise.createTransfer}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
