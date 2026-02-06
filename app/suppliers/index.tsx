import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Linking,
  RefreshControl,
  Alert,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { SupplierCard } from '@/components/warehouse';
import { SupplierIcon } from '@/components/warehouse/WarehouseIcons';
import { Skeleton } from '@/components/ui/Skeleton';
import { getSuppliers, deleteSupplier } from '@/services/warehouseService';
import type { Supplier } from '@/types';

export default function SuppliersScreen() {
  const insets = useSafeAreaInsets();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const loadSuppliers = useCallback(async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  useEffect(() => {
    let filtered = suppliers;

    // Filter by active status
    if (!showInactive) {
      filtered = filtered.filter((s) => s.isActive);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.contactName?.toLowerCase().includes(query) ||
          s.email?.toLowerCase().includes(query) ||
          s.phone?.includes(query)
      );
    }

    setFilteredSuppliers(filtered);
  }, [suppliers, searchQuery, showInactive]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadSuppliers();
  };

  const handleAddSupplier = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/suppliers/create');
  };

  const handleSupplierPress = (supplier: Supplier) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/suppliers/${supplier.id}`);
  };

  const handleCall = (supplier: Supplier) => {
    if (supplier.phone) {
      Linking.openURL(`tel:${supplier.phone}`);
    }
  };

  const handleEmail = (supplier: Supplier) => {
    if (supplier.email) {
      Linking.openURL(`mailto:${supplier.email}`);
    }
  };

  const handleDelete = (supplier: Supplier) => {
    Alert.alert(
      'Удалить поставщика',
      `Вы уверены, что хотите удалить "${supplier.name}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            const success = await deleteSupplier(supplier.id);
            if (success) {
              setSuppliers((prev) => prev.filter((s) => s.id !== supplier.id));
            }
          },
        },
      ]
    );
  };

  const toggleInactive = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowInactive(!showInactive);
  };

  const renderSupplierItem = ({ item, index }: { item: Supplier; index: number }) => (
    <Animated.View
      entering={SlideInRight.delay(index * 50).springify()}
    >
      <SupplierCard
        supplier={item}
        onPress={() => handleSupplierPress(item)}
        onCall={() => handleCall(item)}
        onEmail={() => handleEmail(item)}
      />
    </Animated.View>
  );

  const renderEmptyState = () => (
    <Animated.View entering={FadeIn} style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <SupplierIcon size={64} color={colors.textLight} />
      </View>
      <Text style={styles.emptyTitle}>Нет поставщиков</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? 'Попробуйте изменить поисковый запрос'
          : 'Добавьте первого поставщика для управления закупками'}
      </Text>
      {!searchQuery && (
        <Pressable style={styles.emptyButton} onPress={handleAddSupplier}>
          <Ionicons name="add" size={20} color={colors.textInverse} />
          <Text style={styles.emptyButtonText}>Добавить поставщика</Text>
        </Pressable>
      )}
    </Animated.View>
  );

  const renderLoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonRow}>
            <Skeleton width={52} height={52} borderRadius={14} />
            <View style={styles.skeletonContent}>
              <Skeleton width="60%" height={18} />
              <Skeleton width="40%" height={14} style={{ marginTop: 6 }} />
              <Skeleton width="80%" height={12} style={{ marginTop: 6 }} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const activeCount = suppliers.filter((s) => s.isActive).length;
  const inactiveCount = suppliers.filter((s) => !s.isActive).length;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Поставщики',
          headerLargeTitle: true,
          headerRight: () => (
            <Pressable onPress={handleAddSupplier} style={styles.headerButton}>
              <Ionicons name="add" size={28} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск поставщика..."
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

        <Pressable
          style={[
            styles.filterButton,
            showInactive && styles.filterButtonActive,
          ]}
          onPress={toggleInactive}
        >
          <Ionicons
            name={showInactive ? 'eye' : 'eye-off-outline'}
            size={18}
            color={showInactive ? colors.primary : colors.textSecondary}
          />
        </Pressable>
      </View>

      {/* Stats */}
      {!isLoading && suppliers.length > 0 && (
        <Animated.View entering={FadeIn} style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{activeCount}</Text>
            <Text style={styles.statLabel}>Активных</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{inactiveCount}</Text>
            <Text style={styles.statLabel}>Неактивных</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{suppliers.length}</Text>
            <Text style={styles.statLabel}>Всего</Text>
          </View>
        </Animated.View>
      )}

      {/* Content */}
      {isLoading ? (
        renderLoadingSkeleton()
      ) : (
        <FlatList
          data={filteredSuppliers}
          renderItem={renderSupplierItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContainer,
            filteredSuppliers.length === 0 && styles.emptyListContainer,
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
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
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  filterButtonActive: {
    backgroundColor: `${colors.primary}15`,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: colors.border,
    alignSelf: 'center',
  },
  listContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  emptyButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textInverse,
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
    gap: spacing.md,
  },
  skeletonContent: {
    flex: 1,
  },
});
