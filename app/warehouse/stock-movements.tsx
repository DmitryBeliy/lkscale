import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { supabase } from '@/lib/supabase';
import { getDataState } from '@/store/dataStore';
import type { StockAdjustment, Location, Product } from '@/types';

interface StockMovement extends StockAdjustment {
  locationName?: string;
  product?: Product;
}

export default function StockMovementsScreen() {
  const insets = useSafeAreaInsets();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const loadMovements = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('stock_adjustments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const products = getDataState().products;

      const mappedMovements: StockMovement[] = (data || []).map((item) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        productSku: item.product_sku,
        adjustmentType: item.adjustment_type,
        quantityChange: item.quantity_change,
        previousStock: item.previous_stock,
        newStock: item.new_stock,
        unitCost: item.unit_cost,
        totalValue: item.total_value,
        reason: item.reason,
        referenceNumber: item.reference_number,
        createdAt: item.created_at,
        product: products.find((p) => p.id === item.product_id),
      }));

      setMovements(mappedMovements);
    } catch (error) {
      console.error('Error loading stock movements:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  useEffect(() => {
    if (selectedType) {
      setFilteredMovements(movements.filter((m) => m.adjustmentType === selectedType));
    } else {
      setFilteredMovements(movements);
    }
  }, [movements, selectedType]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadMovements();
  };

  const handleNewMovement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/warehouse/transfer');
  };

  const getMovementTypeIcon = (type: StockAdjustment['adjustmentType']) => {
    switch (type) {
      case 'transfer_in':
        return { icon: 'arrow-down', color: colors.success };
      case 'transfer_out':
        return { icon: 'arrow-up', color: colors.error };
      case 'write_off':
        return { icon: 'trash', color: colors.error };
      case 'damage':
        return { icon: 'alert-circle', color: colors.warning };
      case 'theft':
        return { icon: 'warning', color: colors.error };
      case 'count':
        return { icon: 'calculator', color: colors.info };
      case 'return':
        return { icon: 'return-up-back', color: colors.primary };
      default:
        return { icon: 'swap-horizontal', color: colors.textSecondary };
    }
  };

  const getMovementTypeLabel = (type: StockAdjustment['adjustmentType']) => {
    const labels: Record<string, string> = {
      transfer_in: 'Приход',
      transfer_out: 'Расход',
      write_off: 'Списание',
      damage: 'Брак',
      theft: 'Кража',
      count: 'Инвентаризация',
      return: 'Возврат',
      other: 'Другое',
    };
    return labels[type] || type;
  };

  const movementTypes = Array.from(new Set(movements.map((m) => m.adjustmentType)));

  const renderMovementItem = ({ item, index }: { item: StockMovement; index: number }) => {
    const typeInfo = getMovementTypeIcon(item.adjustmentType);
    const isPositive = item.quantityChange > 0;

    return (
      <Animated.View entering={SlideInRight.delay(index * 30).springify()}>
        <Pressable style={styles.movementCard}>
          <View style={[styles.typeIconContainer, { backgroundColor: `${typeInfo.color}15` }]}>
            <Ionicons name={typeInfo.icon as any} size={24} color={typeInfo.color} />
          </View>

          <View style={styles.movementInfo}>
            <Text style={styles.productName} numberOfLines={1}>
              {item.productName}
            </Text>
            <Text style={styles.productSku}>{item.productSku || 'Без SKU'}</Text>
            <View style={styles.movementMeta}>
              <View style={[styles.typeBadge, { backgroundColor: `${typeInfo.color}15` }]}>
                <Text style={[styles.typeBadgeText, { color: typeInfo.color }]}>
                  {getMovementTypeLabel(item.adjustmentType)}
                </Text>
              </View>
              <Text style={styles.dateText}>
                {new Date(item.createdAt).toLocaleDateString('ru-RU')}
              </Text>
            </View>
            {item.reason && (
              <Text style={styles.reasonText} numberOfLines={1}>
                {item.reason}
              </Text>
            )}
          </View>

          <View style={styles.movementStats}>
            <Text style={[styles.quantityChange, { color: isPositive ? colors.success : colors.error }]}>
              {isPositive ? '+' : ''}{item.quantityChange}
            </Text>
            <Text style={styles.stockInfo}>
              {item.previousStock} → {item.newStock}
            </Text>
            {item.totalValue !== undefined && (
              <Text style={styles.valueText}>
                {item.totalValue.toLocaleString('ru-RU')} ₽
              </Text>
            )}
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <EmptyState
      variant="default"
      title={selectedType ? 'Нет движений' : 'Нет движений запасов'}
      description={
        selectedType
          ? 'Нет движений выбранного типа'
          : 'Движения запасов будут отображаться здесь'
      }
      actionLabel="Создать перемещение"
      onAction={handleNewMovement}
    />
  );

  const renderLoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <Skeleton width={48} height={48} borderRadius={12} />
          <View style={styles.skeletonContent}>
            <Skeleton width="60%" height={18} />
            <Skeleton width="40%" height={14} style={{ marginTop: 6 }} />
            <Skeleton width="80%" height={12} style={{ marginTop: 6 }} />
          </View>
        </View>
      ))}
    </View>
  );

  // Calculate stats
  const today = new Date().toDateString();
  const todayMovements = movements.filter((m) => new Date(m.createdAt).toDateString() === today);
  const totalIn = movements.filter((m) => m.quantityChange > 0).reduce((sum, m) => sum + m.quantityChange, 0);
  const totalOut = movements.filter((m) => m.quantityChange < 0).reduce((sum, m) => sum + Math.abs(m.quantityChange), 0);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Движения запасов',
          headerLargeTitle: true,
          headerRight: () => (
            <Pressable onPress={handleNewMovement} style={styles.headerButton}>
              <Ionicons name="add" size={28} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      {/* Stats */}
      {!isLoading && (
        <Animated.View entering={FadeIn} style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.statValue}>{todayMovements.length}</Text>
            <Text style={styles.statLabel}>Сегодня</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="arrow-down-outline" size={20} color={colors.success} />
            <Text style={[styles.statValue, { color: colors.success }]}>+{totalIn}</Text>
            <Text style={styles.statLabel}>Приход</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="arrow-up-outline" size={20} color={colors.error} />
            <Text style={[styles.statValue, { color: colors.error }]}>-{totalOut}</Text>
            <Text style={styles.statLabel}>Расход</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="list-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.statValue}>{movements.length}</Text>
            <Text style={styles.statLabel}>Всего</Text>
          </View>
        </Animated.View>
      )}

      {/* Type Filter */}
      {!isLoading && movementTypes.length > 0 && (
        <Animated.View entering={FadeIn} style={styles.filterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={['all', ...movementTypes]}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.filterList}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.filterChip,
                  (selectedType === item || (item === 'all' && !selectedType)) && styles.filterChipActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedType(item === 'all' ? null : item);
                }}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    (selectedType === item || (item === 'all' && !selectedType)) && styles.filterChipTextActive,
                  ]}
                >
                  {item === 'all' ? 'Все' : getMovementTypeLabel(item)}
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
          data={filteredMovements}
          renderItem={renderMovementItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContainer,
            filteredMovements.length === 0 && styles.emptyListContainer,
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
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  skeletonContent: {
    flex: 1,
  },
  movementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.sm,
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  movementInfo: {
    flex: 1,
  },
  productName: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  productSku: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  movementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  typeBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  dateText: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  reasonText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 4,
  },
  movementStats: {
    alignItems: 'flex-end',
  },
  quantityChange: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
  },
  stockInfo: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  valueText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: '600',
    marginTop: 2,
  },
});
