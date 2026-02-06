import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card, Button, StatusBadge } from '@/components/ui';
import { getOrderById } from '@/store/dataStore';
import { shareInvoice, getInvoiceSummary } from '@/services/documentExportService';
import { Order } from '@/types';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (id) {
      const foundOrder = getOrderById(id);
      setOrder(foundOrder || null);
    }
  }, [id]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const [isSharing, setIsSharing] = useState(false);

  const handleAction = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Действие', `${action} для заказа ${order?.orderNumber}`);
  };

  const handleShareInvoice = async () => {
    if (!order) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSharing(true);

    try {
      const success = await shareInvoice(order);
      if (!success) {
        // Fallback to clipboard
        const summary = getInvoiceSummary(order);
        await Clipboard.setStringAsync(summary);
        Alert.alert('Счёт скопирован', 'Счёт скопирован в буфер обмена');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось поделиться счётом');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyInvoice = async () => {
    if (!order) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const summary = getInvoiceSummary(order);
      await Clipboard.setStringAsync(summary);
      Alert.alert('Скопировано', 'Счёт скопирован в буфер обмена');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось скопировать счёт');
    }
  };

  if (!order) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Заказ не найден</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>Заказ не найден</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{order.orderNumber}</Text>
        <Pressable style={styles.moreButton} onPress={() => handleAction('Меню')}>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Card style={styles.statusCard}>
            <View style={styles.statusRow}>
              <StatusBadge status={order.status} />
              <Text style={styles.totalAmount}>{formatCurrency(order.totalAmount)}</Text>
            </View>
            <View style={styles.dateRow}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.dateText}>Создан: {formatDate(order.createdAt)}</Text>
            </View>
            {order.updatedAt !== order.createdAt && (
              <View style={styles.dateRow}>
                <Ionicons name="refresh-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.dateText}>Обновлён: {formatDate(order.updatedAt)}</Text>
              </View>
            )}
          </Card>
        </Animated.View>

        {/* Customer Info */}
        {order.customer && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Text style={styles.sectionTitle}>Клиент</Text>
            <Card style={styles.customerCard}>
              <View style={styles.customerRow}>
                <View style={styles.customerIcon}>
                  <Ionicons name="person" size={24} color={colors.primary} />
                </View>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>{order.customer.name}</Text>
                  {order.customer.phone && (
                    <Text style={styles.customerDetail}>{order.customer.phone}</Text>
                  )}
                </View>
                <Pressable
                  style={styles.callButton}
                  onPress={() => handleAction('Позвонить')}
                >
                  <Ionicons name="call" size={20} color={colors.primary} />
                </Pressable>
              </View>
              {order.customer.address && (
                <View style={styles.addressRow}>
                  <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
                  <Text style={styles.addressText}>{order.customer.address}</Text>
                </View>
              )}
            </Card>
          </Animated.View>
        )}

        {/* Order Items */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={styles.sectionTitle}>Товары ({order.itemsCount})</Text>
          <Card style={styles.itemsCard}>
            {order.items.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.itemRow,
                  index < order.items.length - 1 && styles.itemRowBorder,
                ]}
              >
                <View style={styles.itemIcon}>
                  <Ionicons name="cube-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.productName}</Text>
                  <Text style={styles.itemSku}>SKU: {item.sku}</Text>
                </View>
                <View style={styles.itemPricing}>
                  <Text style={styles.itemQuantity}>{item.quantity} шт.</Text>
                  <Text style={styles.itemPrice}>
                    {formatCurrency(item.price * item.quantity)}
                  </Text>
                </View>
              </View>
            ))}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Итого</Text>
              <Text style={styles.totalValue}>{formatCurrency(order.totalAmount)}</Text>
            </View>
          </Card>
        </Animated.View>

        {/* Notes */}
        {order.notes && (
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <Text style={styles.sectionTitle}>Примечания</Text>
            <Card>
              <Text style={styles.notesText}>{order.notes}</Text>
            </Card>
          </Animated.View>
        )}

        {/* Invoice Actions */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <Text style={styles.sectionTitle}>Документы</Text>
          <Card style={styles.invoiceCard}>
            <View style={styles.invoiceHeader}>
              <View style={styles.invoiceIcon}>
                <Ionicons name="document-text" size={24} color={colors.primary} />
              </View>
              <View style={styles.invoiceInfo}>
                <Text style={styles.invoiceTitle}>Счёт</Text>
                <Text style={styles.invoiceDescription}>
                  Поделитесь счётом с клиентом
                </Text>
              </View>
            </View>
            <View style={styles.invoiceActions}>
              <Pressable
                style={styles.invoiceActionButton}
                onPress={handleCopyInvoice}
              >
                <Ionicons name="copy-outline" size={20} color={colors.primary} />
                <Text style={styles.invoiceActionText}>Копировать</Text>
              </Pressable>
              <Pressable
                style={[styles.invoiceActionButton, styles.invoiceShareButton]}
                onPress={handleShareInvoice}
                disabled={isSharing}
              >
                {isSharing ? (
                  <ActivityIndicator size="small" color={colors.textInverse} />
                ) : (
                  <>
                    <Ionicons name="share-outline" size={20} color={colors.textInverse} />
                    <Text style={[styles.invoiceActionText, styles.invoiceShareText]}>
                      Поделиться
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </Card>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.actionsContainer}>
          {order.status === 'pending' && (
            <Button
              title="Принять в работу"
              onPress={() => handleAction('Принять')}
              style={styles.actionButton}
            />
          )}
          {order.status === 'processing' && (
            <Button
              title="Завершить заказ"
              onPress={() => handleAction('Завершить')}
              style={styles.actionButton}
            />
          )}
          <Button
            title="Связаться с клиентом"
            variant="outline"
            onPress={() => handleAction('Связаться')}
            style={styles.actionButton}
          />
        </Animated.View>
      </ScrollView>
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
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  moreButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  statusCard: {
    marginBottom: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalAmount: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.primary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  dateText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  customerCard: {
    marginBottom: spacing.lg,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  customerDetail: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing.sm,
  },
  addressText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.sizes.sm * 1.4,
  },
  itemsCard: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    color: colors.text,
  },
  itemSku: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginTop: 2,
  },
  itemPricing: {
    alignItems: 'flex-end',
  },
  itemQuantity: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  itemPrice: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
  },
  totalValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.primary,
  },
  notesText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.sizes.sm * 1.5,
  },
  invoiceCard: {
    marginBottom: spacing.lg,
  },
  invoiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  invoiceIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  invoiceDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  invoiceActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  invoiceActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`,
    gap: spacing.xs,
  },
  invoiceShareButton: {
    backgroundColor: colors.primary,
  },
  invoiceActionText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  invoiceShareText: {
    color: colors.textInverse,
  },
  actionsContainer: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  actionButton: {
    width: '100%',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
});
