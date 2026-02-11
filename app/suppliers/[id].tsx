import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { SupplierIcon, PurchaseOrderIcon } from '@/components/warehouse/WarehouseIcons';
import { Button } from '@/components/ui/Button';
import {
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  getPurchaseOrders,
} from '@/services/warehouseService';
import type { Supplier, PurchaseOrder } from '@/types';

export default function SupplierDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;

    try {
      const [supplierData, ordersData] = await Promise.all([
        getSupplierById(id),
        getPurchaseOrders(),
      ]);

      setSupplier(supplierData);
      setPurchaseOrders(ordersData.filter((o) => o.supplierId === id));
    } catch (error) {
      console.error('Error loading supplier:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/suppliers/edit/${id}`);
  };

  const handleToggleActive = async () => {
    if (!supplier) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsUpdating(true);

    try {
      const updated = await updateSupplier(supplier.id, {
        isActive: !supplier.isActive,
      });
      if (updated) {
        setSupplier(updated);
      }
    } catch (error) {
      console.error('Error updating supplier:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Удалить поставщика',
      `Вы уверены, что хотите удалить "${supplier?.name}"? Это действие нельзя отменить.`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            if (supplier) {
              const success = await deleteSupplier(supplier.id);
              if (success) {
                router.back();
              }
            }
          },
        },
      ]
    );
  };

  const handleCall = () => {
    if (supplier?.phone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL(`tel:${supplier.phone}`);
    }
  };

  const handleEmail = () => {
    if (supplier?.email) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL(`mailto:${supplier.email}`);
    }
  };

  const handleWebsite = () => {
    if (supplier?.website) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      let url = supplier.website;
      if (!url.startsWith('http')) {
        url = `https://${url}`;
      }
      Linking.openURL(url);
    }
  };

  const handleNewOrder = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/warehouse/restock?supplierId=${id}`);
  };

  const calculateStats = () => {
    const totalOrders = purchaseOrders.length;
    const totalSpent = purchaseOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const completedOrders = purchaseOrders.filter(
      (o) => o.status === 'received'
    ).length;
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    return { totalOrders, totalSpent, completedOrders, avgOrderValue };
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!supplier) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={styles.errorText}>Поставщик не найден</Text>
        <Button title="Назад" onPress={() => router.back()} variant="secondary" />
      </View>
    );
  }

  const stats = calculateStats();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: supplier.name,
          headerRight: () => (
            <Pressable onPress={handleEdit} style={styles.headerButton}>
              <Ionicons name="create-outline" size={24} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <Animated.View entering={FadeIn} style={styles.headerCard}>
          <View style={styles.avatarContainer}>
            <SupplierIcon size={40} color={colors.primary} />
          </View>
          <Text style={styles.supplierName}>{supplier.name}</Text>
          {supplier.contactName && (
            <Text style={styles.contactName}>{supplier.contactName}</Text>
          )}
          {!supplier.isActive && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveBadgeText}>Неактивен</Text>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            {supplier.phone && (
              <Pressable style={styles.quickActionButton} onPress={handleCall}>
                <Ionicons name="call" size={24} color={colors.success} />
                <Text style={styles.quickActionText}>Позвонить</Text>
              </Pressable>
            )}
            {supplier.email && (
              <Pressable style={styles.quickActionButton} onPress={handleEmail}>
                <Ionicons name="mail" size={24} color={colors.primary} />
                <Text style={styles.quickActionText}>Написать</Text>
              </Pressable>
            )}
            {supplier.website && (
              <Pressable style={styles.quickActionButton} onPress={handleWebsite}>
                <Ionicons name="globe" size={24} color={colors.textSecondary} />
                <Text style={styles.quickActionText}>Сайт</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={SlideInUp.delay(100)} style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Статистика</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalOrders}</Text>
              <Text style={styles.statLabel}>Заказов</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {stats.totalSpent.toLocaleString('ru-RU')} ₽
              </Text>
              <Text style={styles.statLabel}>Всего закуплено</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.completedOrders}</Text>
              <Text style={styles.statLabel}>Выполнено</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {stats.avgOrderValue.toLocaleString('ru-RU', {
                  maximumFractionDigits: 0,
                })}{' '}
                ₽
              </Text>
              <Text style={styles.statLabel}>Средний чек</Text>
            </View>
          </View>
        </Animated.View>

        {/* Contact Info */}
        <Animated.View entering={SlideInUp.delay(150)} style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Контакты</Text>
          {supplier.phone && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>{supplier.phone}</Text>
            </View>
          )}
          {supplier.email && (
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>{supplier.email}</Text>
            </View>
          )}
          {supplier.address && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>{supplier.address}</Text>
            </View>
          )}
          {supplier.website && (
            <View style={styles.infoRow}>
              <Ionicons name="globe-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>{supplier.website}</Text>
            </View>
          )}
        </Animated.View>

        {/* Business Info */}
        <Animated.View entering={SlideInUp.delay(200)} style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Условия работы</Text>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              Срок поставки: {supplier.leadTimeDays} дней
            </Text>
          </View>
          {supplier.paymentTerms && (
            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                Условия оплаты: {supplier.paymentTerms}
              </Text>
            </View>
          )}
          {supplier.rating !== undefined && (
            <View style={styles.infoRow}>
              <Ionicons name="star" size={20} color={colors.warning} />
              <Text style={styles.infoText}>
                Рейтинг: {supplier.rating.toFixed(1)} / 5.0
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Notes */}
        {supplier.notes && (
          <Animated.View entering={SlideInUp.delay(250)} style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Заметки</Text>
            <Text style={styles.notesText}>{supplier.notes}</Text>
          </Animated.View>
        )}

        {/* Recent Orders */}
        {purchaseOrders.length > 0 && (
          <Animated.View entering={SlideInUp.delay(300)} style={styles.ordersCard}>
            <View style={styles.ordersHeader}>
              <Text style={styles.sectionTitle}>Последние заказы</Text>
              <Pressable onPress={() => router.push(`/suppliers/history/${id}`)}>
                <Text style={styles.seeAllText}>История закупок</Text>
              </Pressable>
            </View>
            {purchaseOrders.slice(0, 3).map((order) => (
              <Pressable
                key={order.id}
                style={styles.orderItem}
                onPress={() => router.push(`/warehouse/orders/${order.id}`)}
              >
                <View style={styles.orderIconContainer}>
                  <PurchaseOrderIcon size={20} color={colors.primary} />
                </View>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                  </Text>
                </View>
                <Text style={styles.orderAmount}>
                  {order.totalAmount.toLocaleString('ru-RU')} ₽
                </Text>
              </Pressable>
            ))}
          </Animated.View>
        )}

        {/* Actions */}
        <Animated.View entering={SlideInUp.delay(350)} style={styles.actionsContainer}>
          <Button
            title="Новый заказ поставщику"
            onPress={handleNewOrder}
            variant="primary"
            style={{ width: '100%' }}
          />
          <Button
            title={supplier.isActive ? 'Деактивировать' : 'Активировать'}
            onPress={handleToggleActive}
            variant="secondary"
            loading={isUpdating}
            style={{ width: '100%' }}
          />
          <Button
            title="Удалить поставщика"
            onPress={handleDelete}
            variant="ghost"
            style={{ width: '100%', borderColor: colors.error }}
          />
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
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  supplierName: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  contactName: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  inactiveBadge: {
    marginTop: spacing.sm,
    backgroundColor: colors.errorLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  inactiveBadgeText: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.lg,
  },
  quickActionButton: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  quickActionText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  statsCard: {
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statItem: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.sizes.md,
    color: colors.text,
    flex: 1,
  },
  notesText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: typography.sizes.md * 1.5,
  },
  ordersCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  ordersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAllText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.sm,
  },
  orderIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  orderDate: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  orderAmount: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  actionsContainer: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  deleteButton: {
    borderColor: colors.error,
  },
});
