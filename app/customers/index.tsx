import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card, SkeletonCard } from '@/components/ui';
import {
  getDataState,
  subscribeData,
  fetchData,
} from '@/store/dataStore';
import { useLocalization } from '@/localization';
import { Customer, CustomerValueTag, CustomerWithValue } from '@/types';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

// AI-based customer value tag calculation
const calculateCustomerValueTag = (customer: Customer): CustomerValueTag => {
  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  // VIP: High spenders with many orders
  if (customer.totalSpent >= 100000 && customer.totalOrders >= 10) {
    return 'vip';
  }

  // High Value: Significant spending
  if (customer.totalSpent >= 50000) {
    return 'high_value';
  }

  // New: Joined within last 30 days
  if (daysSinceCreation <= 30) {
    return 'new';
  }

  // Inactive: No orders in last 60 days (simulated based on order count)
  if (customer.totalOrders <= 1 && daysSinceCreation > 60) {
    return 'inactive';
  }

  // Regular: Active customers
  return 'regular';
};

const getValueTagInfo = (tag: CustomerValueTag, t: any) => {
  switch (tag) {
    case 'vip':
      return { label: t.customers.vip, color: colors.warning, icon: 'star' };
    case 'high_value':
      return { label: t.customers.highValue, color: colors.success, icon: 'trending-up' };
    case 'new':
      return { label: t.customers.new, color: colors.primary, icon: 'sparkles' };
    case 'inactive':
      return { label: t.customers.inactive, color: colors.textLight, icon: 'time' };
    case 'regular':
    default:
      return { label: t.customers.regular, color: colors.textSecondary, icon: 'person' };
  }
};

interface CustomerCardProps {
  customer: CustomerWithValue;
  onPress: () => void;
  formatCurrency: (amount: number) => string;
  t: any;
}

const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onPress,
  formatCurrency,
  t,
}) => {
  const tagInfo = getValueTagInfo(customer.valueTag, t);

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.customerCard}>
        <View style={styles.customerHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {customer.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{customer.name}</Text>
            {customer.email && (
              <Text style={styles.customerEmail}>{customer.email}</Text>
            )}
          </View>
          <View style={[styles.valueTag, { backgroundColor: `${tagInfo.color}15` }]}>
            <Ionicons name={tagInfo.icon as any} size={12} color={tagInfo.color} />
            <Text style={[styles.valueTagText, { color: tagInfo.color }]}>
              {tagInfo.label}
            </Text>
          </View>
        </View>

        <View style={styles.customerStats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{customer.totalOrders}</Text>
            <Text style={styles.statLabel}>{t.customers.totalOrders}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatCurrency(customer.totalSpent)}</Text>
            <Text style={styles.statLabel}>{t.customers.totalSpent}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatCurrency(customer.averageOrderValue)}</Text>
            <Text style={styles.statLabel}>Средний чек</Text>
          </View>
        </View>

        <View style={styles.customerFooter}>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </View>
      </Card>
    </Pressable>
  );
};

export default function CustomersScreen() {
  const insets = useSafeAreaInsets();
  const { t, formatCurrency } = useLocalization();
  const [customers, setCustomers] = useState<CustomerWithValue[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerWithValue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<CustomerValueTag | 'all'>('all');

  useEffect(() => {
    const unsub = subscribeData(() => {
      const state = getDataState();
      const customersWithValue: CustomerWithValue[] = state.customers.map((c) => ({
        ...c,
        valueTag: calculateCustomerValueTag(c),
        averageOrderValue: c.totalOrders > 0 ? c.totalSpent / c.totalOrders : 0,
      }));
      setCustomers(customersWithValue);
      setIsLoading(state.isLoading);
    });

    fetchData();
    return () => unsub();
  }, []);

  useEffect(() => {
    let filtered = customers;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          (c.email && c.email.toLowerCase().includes(query)) ||
          (c.phone && c.phone.includes(query))
      );
    }

    if (filterTag !== 'all') {
      filtered = filtered.filter((c) => c.valueTag === filterTag);
    }

    // Sort by total spent (VIP/high value first)
    filtered.sort((a, b) => b.totalSpent - a.totalSpent);

    setFilteredCustomers(filtered);
  }, [customers, searchQuery, filterTag]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchData();
    setRefreshing(false);
  }, []);

  const handleCustomerPress = (customerId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/customers/${customerId}`);
  };

  const handleFilterPress = (tag: CustomerValueTag | 'all') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilterTag(tag);
  };

  const filterTags: { tag: CustomerValueTag | 'all'; label: string }[] = [
    { tag: 'all', label: t.common.all },
    { tag: 'vip', label: t.customers.vip },
    { tag: 'high_value', label: t.customers.highValue },
    { tag: 'regular', label: t.customers.regular },
    { tag: 'new', label: t.customers.new },
    { tag: 'inactive', label: t.customers.inactive },
  ];

  const getTagCount = (tag: CustomerValueTag | 'all') => {
    if (tag === 'all') return customers.length;
    return customers.filter((c) => c.valueTag === tag).length;
  };

  const renderHeader = () => (
    <>
      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Ionicons name="search" size={20} color={colors.textLight} />
          <TextInput
            style={styles.searchTextInput}
            placeholder={t.customers.searchPlaceholder}
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textLight} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter Tags */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={filterTags}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
          keyExtractor={(item) => item.tag}
          renderItem={({ item }) => {
            const count = getTagCount(item.tag);
            return (
              <Pressable
                style={[
                  styles.filterChip,
                  filterTag === item.tag && styles.filterChipActive,
                ]}
                onPress={() => handleFilterPress(item.tag)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterTag === item.tag && styles.filterChipTextActive,
                  ]}
                >
                  {item.label} ({count})
                </Text>
              </Pressable>
            );
          }}
        />
      </View>
    </>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color={colors.textLight} />
      <Text style={styles.emptyTitle}>{t.customers.noCustomers}</Text>
    </View>
  );

  const renderItem = ({ item, index }: { item: CustomerWithValue; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <CustomerCard
        customer={item}
        onPress={() => handleCustomerPress(item.id)}
        formatCurrency={formatCurrency}
        t={t}
      />
    </Animated.View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>{t.customers.title}</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{customers.length}</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} lines={3} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
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
  headerBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  headerBadgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.textInverse,
  },
  loadingContainer: {
    padding: spacing.md,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
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
  customerCard: {
    marginBottom: spacing.md,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.textInverse,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  customerEmail: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  valueTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  valueTagText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  customerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes.md,
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
    height: 30,
    backgroundColor: colors.borderLight,
  },
  customerFooter: {
    position: 'absolute',
    right: spacing.md,
    top: '50%',
    marginTop: -10,
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
});
