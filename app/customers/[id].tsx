import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card, Button } from '@/components/ui';
import { getCustomerById, getDataState, searchOrders } from '@/store/dataStore';
import { useLocalization } from '@/localization';
import { Customer, Order, CustomerValueTag } from '@/types';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

// AI-based customer value tag calculation
const calculateCustomerValueTag = (customer: Customer): CustomerValueTag => {
  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (customer.totalSpent >= 100000 && customer.totalOrders >= 10) {
    return 'vip';
  }
  if (customer.totalSpent >= 50000) {
    return 'high_value';
  }
  if (daysSinceCreation <= 30) {
    return 'new';
  }
  if (customer.totalOrders <= 1 && daysSinceCreation > 60) {
    return 'inactive';
  }
  return 'regular';
};

const getValueTagInfo = (tag: CustomerValueTag, t: any) => {
  switch (tag) {
    case 'vip':
      return { label: t.customers.vip, color: colors.warning, icon: 'star', description: 'Высокая ценность и лояльность' };
    case 'high_value':
      return { label: t.customers.highValue, color: colors.success, icon: 'trending-up', description: 'Значительные расходы' };
    case 'new':
      return { label: t.customers.new, color: colors.primary, icon: 'sparkles', description: 'Недавно присоединился' };
    case 'inactive':
      return { label: t.customers.inactive, color: colors.textLight, icon: 'time', description: 'Требует реактивации' };
    case 'regular':
    default:
      return { label: t.customers.regular, color: colors.textSecondary, icon: 'person', description: 'Активный клиент' };
  }
};

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'completed':
      return colors.success;
    case 'pending':
      return colors.warning;
    case 'processing':
      return colors.primary;
    case 'cancelled':
      return colors.error;
    default:
      return colors.textSecondary;
  }
};

const getStatusLabel = (status: Order['status'], t: any) => {
  switch (status) {
    case 'completed':
      return t.orders.completed;
    case 'pending':
      return t.orders.pending;
    case 'processing':
      return t.orders.processing;
    case 'cancelled':
      return t.orders.cancelled;
    default:
      return status;
  }
};

export default function CustomerDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, formatCurrency, formatDate } = useLocalization();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [valueTag, setValueTag] = useState<CustomerValueTag>('regular');

  useEffect(() => {
    if (id) {
      const foundCustomer = getCustomerById(id);
      if (foundCustomer) {
        setCustomer(foundCustomer);
        setValueTag(calculateCustomerValueTag(foundCustomer));

        // Get customer orders
        const state = getDataState();
        const orders = state.orders.filter((o) => o.customerId === id);
        setCustomerOrders(orders);
      }
    }
  }, [id]);

  const handleCall = () => {
    if (customer?.phone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const phoneNumber = customer.phone.replace(/[^0-9+]/g, '');
      Linking.openURL(`tel:${phoneNumber}`).catch(() => {
        Alert.alert(t.common.error, 'Не удалось открыть телефон');
      });
    }
  };

  const handleEmail = () => {
    if (customer?.email) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Linking.openURL(`mailto:${customer.email}`).catch(() => {
        Alert.alert(t.common.error, 'Не удалось открыть почту');
      });
    }
  };

  const handleWhatsApp = () => {
    if (customer?.phone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const phoneNumber = customer.phone.replace(/[^0-9]/g, '');
      Linking.openURL(`whatsapp://send?phone=${phoneNumber}`).catch(() => {
        Alert.alert(t.common.error, 'WhatsApp не установлен');
      });
    }
  };

  const handleOrderPress = (orderId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/order/${orderId}`);
  };

  if (!customer) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>{t.customers.title}</Text>
        </View>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textLight} />
          <Text style={styles.errorText}>Клиент не найден</Text>
        </View>
      </View>
    );
  }

  const tagInfo = getValueTagInfo(valueTag, t);
  const avgOrderValue = customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>{t.customers.title}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Customer Profile Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Card style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {customer.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.customerName}>{customer.name}</Text>
                <Text style={styles.customerSince}>
                  {t.customers.since} {formatDate(customer.createdAt, 'long').split(',')[0]}
                </Text>
              </View>
            </View>

            {/* AI Value Tag */}
            <View style={[styles.valueTagCard, { backgroundColor: `${tagInfo.color}10` }]}>
              <View style={[styles.valueTagIcon, { backgroundColor: `${tagInfo.color}20` }]}>
                <Ionicons name={tagInfo.icon as any} size={20} color={tagInfo.color} />
              </View>
              <View style={styles.valueTagContent}>
                <View style={styles.valueTagHeader}>
                  <Text style={[styles.valueTagLabel, { color: tagInfo.color }]}>
                    {tagInfo.label}
                  </Text>
                  <View style={styles.aiBadge}>
                    <Ionicons name="sparkles" size={10} color={colors.primary} />
                    <Text style={styles.aiBadgeText}>AI</Text>
                  </View>
                </View>
                <Text style={styles.valueTagDescription}>{tagInfo.description}</Text>
              </View>
            </View>

            {/* Contact Info */}
            {customer.phone && (
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.contactText}>{customer.phone}</Text>
              </View>
            )}
            {customer.email && (
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.contactText}>{customer.email}</Text>
              </View>
            )}
            {customer.address && (
              <View style={styles.contactItem}>
                <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.contactText}>{customer.address}</Text>
              </View>
            )}
          </Card>
        </Animated.View>

        {/* Quick Contact */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles.sectionTitle}>{t.customers.quickContact}</Text>
          <View style={styles.quickContactRow}>
            <Pressable
              style={[styles.quickContactButton, !customer.phone && styles.quickContactDisabled]}
              onPress={handleCall}
              disabled={!customer.phone}
            >
              <View style={[styles.quickContactIcon, { backgroundColor: `${colors.success}15` }]}>
                <Ionicons name="call" size={24} color={colors.success} />
              </View>
              <Text style={styles.quickContactLabel}>{t.customers.call}</Text>
            </Pressable>

            <Pressable
              style={[styles.quickContactButton, !customer.email && styles.quickContactDisabled]}
              onPress={handleEmail}
              disabled={!customer.email}
            >
              <View style={[styles.quickContactIcon, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name="mail" size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickContactLabel}>{t.customers.email}</Text>
            </Pressable>

            <Pressable
              style={[styles.quickContactButton, !customer.phone && styles.quickContactDisabled]}
              onPress={handleWhatsApp}
              disabled={!customer.phone}
            >
              <View style={[styles.quickContactIcon, { backgroundColor: `${colors.success}15` }]}>
                <Ionicons name="logo-whatsapp" size={24} color={colors.success} />
              </View>
              <Text style={styles.quickContactLabel}>{t.customers.whatsapp}</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.sectionTitle}>{t.customers.customerValue}</Text>
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Ionicons name="receipt" size={24} color={colors.primary} />
              <Text style={styles.statValue}>{customer.totalOrders}</Text>
              <Text style={styles.statLabel}>{t.customers.totalOrders}</Text>
            </Card>
            <Card style={styles.statCard}>
              <Ionicons name="cash" size={24} color={colors.success} />
              <Text style={styles.statValue}>{formatCurrency(customer.totalSpent)}</Text>
              <Text style={styles.statLabel}>{t.customers.totalSpent}</Text>
            </Card>
            <Card style={styles.statCard}>
              <Ionicons name="calculator" size={24} color={colors.warning} />
              <Text style={styles.statValue}>{formatCurrency(avgOrderValue)}</Text>
              <Text style={styles.statLabel}>Средний чек</Text>
            </Card>
          </View>
        </Animated.View>

        {/* Purchase History */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Text style={styles.sectionTitle}>{t.customers.purchaseHistory}</Text>
          {customerOrders.length === 0 ? (
            <Card style={styles.emptyOrdersCard}>
              <Ionicons name="cart-outline" size={40} color={colors.textLight} />
              <Text style={styles.emptyOrdersText}>Нет заказов</Text>
            </Card>
          ) : (
            <Card style={styles.ordersCard}>
              {customerOrders.map((order, index) => (
                <Pressable
                  key={order.id}
                  style={[
                    styles.orderItem,
                    index < customerOrders.length - 1 && styles.orderItemBorder,
                  ]}
                  onPress={() => handleOrderPress(order.id)}
                >
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                  </View>
                  <View style={styles.orderRight}>
                    <Text style={styles.orderAmount}>{formatCurrency(order.totalAmount)}</Text>
                    <View
                      style={[
                        styles.orderStatus,
                        { backgroundColor: `${getStatusColor(order.status)}15` },
                      ]}
                    >
                      <Text style={[styles.orderStatusText, { color: getStatusColor(order.status) }]}>
                        {getStatusLabel(order.status, t)}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
                </Pressable>
              ))}
            </Card>
          )}
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  profileCard: {
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.textInverse,
  },
  profileInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  customerSince: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  valueTagCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  valueTagIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  valueTagContent: {
    flex: 1,
  },
  valueTagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  valueTagLabel: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    gap: 2,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  valueTagDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  contactText: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  quickContactRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickContactButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  quickContactDisabled: {
    opacity: 0.5,
  },
  quickContactIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickContactLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  ordersCard: {
    paddingVertical: spacing.xs,
  },
  emptyOrdersCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyOrdersText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  orderItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  orderDate: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  orderRight: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
  },
  orderAmount: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  orderStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginTop: 4,
  },
  orderStatusText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
});
