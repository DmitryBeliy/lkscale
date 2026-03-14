import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  RefreshControl,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { getPurchaseOrders } from '@/services/warehouseService';
import type { PurchaseOrder } from '@/types';

export default function PurchaseOrdersScreen() {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const data = await getPurchaseOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading purchase orders:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    let filtered = orders;

    if (selectedStatus) {
      filtered = filtered.filter((o) => o.status === selectedStatus);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(query) ||
          o.supplier?.name?.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, searchQuery, selectedStatus]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadOrders();
  };

  const handleOrderPress = (orderId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/purchase-orders/${orderId}`);
  };

  const handleNewOrder = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/warehouse/stock_in');
  };

  const getStatusIcon = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'draft':
        return { icon: 'document-outline', color: colors.textLight };
      case 'pending':
        return { icon: 'time-outline', color: colors.warning };
      case 'ordered':
        return { icon: 'cart-outline', color: colors.primary };
      case 'partial':
        return { icon: 'git-pull-request-outline', color: colors.info };
      case 'received':
        return { icon: 'checkmark-circle', color: colors.success };
      case 'cancelled':
        return { icon: 'close-circle', color: colors.error };
      default:
        return { icon: 'help-circle', color: colors.textLight };
    }
  };

  const getStatusLabel = (status: PurchaseOrder['status']) => {
    const labels: Record<string, string> = {
      draft: 'Черновик',
      pending: 'В ожидании',
      ordered: 'Заказано',
      partial: 'Частично',
      received: 'Получено',
      cancelled: 'Отменено',
    };
    return labels[status] || status;
  };

  const statuses = Array.from(new Set(orders.map((o) => o.status)));

  const renderOrderItem = ({ item, index }: { item: PurchaseOrder; index: number }) => {
    const statusInfo = getStatusIcon(item.status);

    return (
      <Animated.View entering={SlideInRight.delay(index * 30).springify()}>
        <Pressable style={styles.orderCard} onPress={() => handleOrderPress(item.id)}>
          <View style={styles.orderHeader}>
            <View style={styles.orderNumberContainer}>
              <Text style={styles.orderNumber}>{item.orderNumber}</Text>
              <Text style={styles.orderDate}>
                {new Date(item.createdAt).toLocaleDateString('ru-RU')}
              </Text>
            </View>            
            <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}15` }]}>
              <Ionicons name={statusInfo.icon as any} size={14} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </View>

          <View style={styles.orderBody}>
            {item.supplier && (
              <View style={styles.supplierRow}>
                <Ionicons name="business-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.supplierName}>{item.supplier.name}</Text>
              </View>
            )}

            <View style={styles.orderStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Позиций</Text>
                <Text style={styles.statValue}>{item.totalItems}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Сумма</Text>
                <Text style={styles.statValue}>{item.totalAmount.toLocaleString('ru-RU')} ₽</Text>
              </View>
            </View>
          </View>

          {item.notes && (
            <View style={styles.notesRow}>
              <Ionicons name="document-text-outline" size={14} color={colors.textLight} />
              <Text style={styles.notesText} numberOfLines={1}>{item.notes}</Text>
            </View>
          )}
        </Pressable>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <EmptyState
      variant="default"
      title={searchQuery || selectedStatus ? 'Ничего не найдено' : 'Нет заказов'}
      description={
        searchQuery || selectedStatus
          ? 'Попробуйте изменить параметры поиска'
          : 'Создайте первый заказ поставщику'
      }
      actionLabel={!searchQuery && !selectedStatus ? 'Создать заказ' : undefined}
      onAction={!searchQuery && !selectedStatus ? handleNewOrder : undefined}
    />
  );

  const renderLoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <Skeleton width="50%" height={20} />
          <Skeleton width="30%" height={16} style={{ marginTop: 8 }} />
          <View style={styles.skeletonRow}>
            <Skeleton width="45%" height={40} />
            <Skeleton width="45%" height={40} />
          </View>
        </View>
      ))}
    </View>
  );

  // Calculate stats
  const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingCount = orders.filter((o) => o.status === 'pending' || o.status === 'ordered').length;
  const receivedCount = orders.filter((o) => o.status === 'received').length;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Заказы поставщикам',
          headerLargeTitle: true,
          headerRight: () => (
            <Pressable onPress={handleNewOrder} style={styles.headerButton}>
              <Ionicons name="add" size={28} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      {/* Stats */}
      {!isLoading && (
        <Animated.View entering={FadeIn} style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{orders.length}</Text>
            <Text style={styles.statLabel}>Всего заказов</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalAmount.toLocaleString('ru-RU')} ₽</Text>
            <Text style={styles.statLabel}>Общая сумма</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.warning }]}>{pendingCount}</Text>
            <Text style={styles.statLabel}>В ожидании</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.success }]}>{receivedCount}</Text>
            <Text style={styles.statLabel}>Получено</Text>
          </View>
        </Animated.View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск по номеру или поставщику..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textLight} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Status Filter */}
      {!isLoading && statuses.length > 0 && (
        <Animated.View entering={FadeIn} style={styles.filterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={['all', ...statuses]}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.filterList}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.filterChip,
                  (selectedStatus === item || (item === 'all' && !selectedStatus)) &&
                    styles.filterChipActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedStatus(item === 'all' ? null : item);
                }}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    (selectedStatus === item || (item === 'all' && !selectedStatus)) &&
                      styles.filterChipTextActive,
                  ]}
                >
                  {item === 'all' ? 'Все' : getStatusLabel(item)}
                </Text>
              </Pressable>
            )}
          />
        </Animated.View>
      )}

      {/* Content */}
      {isLoading ? (
        renderLoadingSkeleton()
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContainer,
            filteredOrders.length === 0 && styles.emptyListContainer,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
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
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
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
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  filterContainer: {
    marginBottom: spacing.sm,
  },
  filterList: {
    paddingHorizontal: spacing.md,
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
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  emptyListContainer: {
    flex: 1,
  },
  skeletonContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  skeletonCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  orderNumberContainer: {
    flex: 1,
  },
  orderNumber: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  orderDate: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  orderBody: {
    gap: spacing.sm,
  },
  supplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  supplierName: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  orderStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statItem: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    flex: 1,
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  notesText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    flex: 1,
  },
});
