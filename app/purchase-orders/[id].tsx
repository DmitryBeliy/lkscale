import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import {
  getPurchaseOrderById,
  updatePurchaseOrderStatus,
  receivePurchaseOrderItems,
} from '@/services/warehouseService';
import type { PurchaseOrder, PurchaseOrderItem } from '@/types';

export default function PurchaseOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!id) return;

    try {
      const data = await getPurchaseOrderById(id);
      setOrder(data);
    } catch (error) {
      console.error('Error loading purchase order:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleStatusChange = async (newStatus: PurchaseOrder['status']) => {
    if (!order) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsUpdating(true);

    try {
      const success = await updatePurchaseOrderStatus(order.id, newStatus);
      if (success) {
        await loadOrder();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReceiveItems = () => {
    if (!order) return;

    Alert.alert(
      'Получение товаров',
      'Отметить все товары как полученные?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Получить',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setIsUpdating(true);

            const itemsToReceive = order.items.map((item) => ({
              itemId: item.id,
              quantityReceived: item.quantityOrdered,
            }));

            try {
              const success = await receivePurchaseOrderItems(order.id, itemsToReceive);
              if (success) {
                await loadOrder();
              }
            } catch (error) {
              console.error('Error receiving items:', error);
            } finally {
              setIsUpdating(false);
            }
          },
        },
      ]
    );
  };

  const getStatusIcon = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'draft':
        return { icon: 'document-outline', color: colors.textLight, label: 'Черновик' };
      case 'pending':
        return { icon: 'time-outline', color: colors.warning, label: 'В ожидании' };
      case 'ordered':
        return { icon: 'cart-outline', color: colors.primary, label: 'Заказано' };
      case 'partial':
        return { icon: 'git-pull-request-outline', color: colors.info, label: 'Частично' };
      case 'received':
        return { icon: 'checkmark-circle', color: colors.success, label: 'Получено' };
      case 'cancelled':
        return { icon: 'close-circle', color: colors.error, label: 'Отменено' };
      default:
        return { icon: 'help-circle', color: colors.textLight, label: status };
    }
  };

  const renderOrderItem = (item: PurchaseOrderItem, index: number) => {
    const isReceived = item.quantityReceived >= item.quantityOrdered;

    return (
      <Animated.View
        key={item.id}
        entering={SlideInUp.delay(index * 50)}
        style={[styles.itemCard, isReceived && styles.itemCardReceived]}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.itemName} numberOfLines={1}>{item.productName}</Text>
          {item.productSku && <Text style={styles.itemSku}>SKU: {item.productSku}</Text>}
        </View>

        <View style={styles.itemStats}>
          <View style={styles.itemStat}>
            <Text style={styles.itemStatLabel}>Заказано</Text>
            <Text style={styles.itemStatValue}>{item.quantityOrdered}</Text>
          </View>
          <View style={styles.itemStat}>
            <Text style={styles.itemStatLabel}>Получено</Text>
            <Text
              style={[
                styles.itemStatValue,
                isReceived ? styles.itemStatValueReceived : styles.itemStatValuePending,
              ]}
            >
              {item.quantityReceived}
            </Text>
          </View>
          <View style={styles.itemStat}>
            <Text style={styles.itemStatLabel}>Цена</Text>
            <Text style={styles.itemStatValue}>{item.unitCost.toLocaleString('ru-RU')} ₽</Text>
          </View>
          <View style={styles.itemStat}>
            <Text style={styles.itemStatLabel}>Сумма</Text>
            <Text style={styles.itemStatValue}>{item.totalCost.toLocaleString('ru-RU')} ₽</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={styles.errorText}>Заказ не найден</Text>
        <Button title="Назад" onPress={() => router.back()} variant="secondary" />
      </View>
    );
  }

  const statusInfo = getStatusIcon(order.status);
  const canReceive = order.status === 'pending' || order.status === 'ordered' || order.status === 'partial';
  const canCancel = order.status !== 'received' && order.status !== 'cancelled';

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Заказ ${order.orderNumber}` }} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <Animated.View entering={FadeIn} style={styles.statusCard}>
          <View style={[styles.statusIconContainer, { backgroundColor: `${statusInfo.color}15` }]}>
            <Ionicons name={statusInfo.icon as any} size={32} color={statusInfo.color} />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>Статус</Text>
            <Text style={[styles.statusValue, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
          <Text style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleDateString('ru-RU')}
          </Text>
        </Animated.View>

        {/* Supplier Card */}
        {order.supplier && (
          <Animated.View entering={SlideInUp.delay(100)} style={styles.supplierCard}>
            <Text style={styles.sectionTitle}>Поставщик</Text>
            <View style={styles.supplierRow}>
              <Ionicons name="business-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.supplierName}>{order.supplier.name}</Text>
            </View>
            {order.supplier.contactName && (
              <View style={styles.supplierRow}>
                <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.supplierContact}>{order.supplier.contactName}</Text>
              </View>
            )}
            {order.supplier.phone && (
              <View style={styles.supplierRow}>
                <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.supplierContact}>{order.supplier.phone}</Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* Summary Card */}
        <Animated.View entering={SlideInUp.delay(150)} style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Сводка</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Позиций</Text>
            <Text style={styles.summaryValue}>{order.totalItems}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Общая сумма</Text>
            <Text style={styles.summaryValue}>{order.totalAmount.toLocaleString('ru-RU')} ₽</Text>
          </View>
          {order.expectedDate && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ожидается</Text>
              <Text style={styles.summaryValue}>
                {new Date(order.expectedDate).toLocaleDateString('ru-RU')}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Notes */}
        {order.notes && (
          <Animated.View entering={SlideInUp.delay(200)} style={styles.notesCard}>
            <Text style={styles.sectionTitle}>Примечания</Text>
            <Text style={styles.notesText}>{order.notes}</Text>
          </Animated.View>
        )}

        {/* Items */}
        <Animated.View entering={SlideInUp.delay(250)} style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Товары ({order.items.length})</Text>
          {order.items.map((item, index) => renderOrderItem(item, index))}
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={SlideInUp.delay(300)} style={styles.actionsContainer}>
          {canReceive && (
            <Button
              title={isUpdating ? 'Обновление...' : 'Отметить как полученные'}
              onPress={handleReceiveItems}
              loading={isUpdating}
              style={{ width: '100%' }}
            />
          )}

          {canCancel && (
            <Button
              title="Отменить заказ"
              onPress={() => handleStatusChange('cancelled')}
              variant="ghost"
              style={{ width: '100%', borderColor: colors.error }}
            />
          )}

          {order.status === 'draft' && (
            <Button
              title="Отправить заказ"
              onPress={() => handleStatusChange('ordered')}
              variant="secondary"
              style={{ width: '100%' }}
            />
          )}
        </Animated.View>

        <View style={{ height: insets.bottom + spacing.lg }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  statusIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  statusLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  statusValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    marginTop: 2,
  },
  orderDate: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  supplierCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  supplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  supplierName: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  supplierContact: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
  notesCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  notesText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: typography.sizes.md * 1.5,
  },
  itemsSection: {
    gap: spacing.sm,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  itemCardReceived: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  itemHeader: {
    marginBottom: spacing.sm,
  },
  itemName: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  itemSku: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  itemStat: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  itemStatLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  itemStatValue: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  itemStatValueReceived: {
    color: colors.success,
  },
  itemStatValuePending: {
    color: colors.warning,
  },
  actionsContainer: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
