import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import type { Location } from '@/types';

export default function LocationsScreen() {
  const insets = useSafeAreaInsets();
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationType, setNewLocationType] = useState<Location['type']>('warehouse');

  const loadLocations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;

      const mappedLocations: Location[] = (data || []).map((item) => ({
        id: item.id,
        userId: item.user_id,
        name: item.name,
        type: item.type || 'warehouse',
        address: item.address,
        phone: item.phone,
        managerId: item.manager_id,
        isActive: item.is_active ?? true,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      setLocations(mappedLocations);
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  useEffect(() => {
    let filtered = locations;

    if (!showInactive) {
      filtered = filtered.filter((l) => l.isActive);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(query) ||
          l.address?.toLowerCase().includes(query) ||
          l.phone?.includes(query)
      );
    }

    setFilteredLocations(filtered);
  }, [locations, searchQuery, showInactive]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadLocations();
  };

  const handleAddLocation = async () => {
    if (!newLocationName.trim()) {
      Alert.alert('Ошибка', 'Введите название локации');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('locations')
        .insert({
          user_id: user.id,
          name: newLocationName.trim(),
          type: newLocationType,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      const newLocation: Location = {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        type: data.type,
        address: data.address,
        phone: data.phone,
        managerId: data.manager_id,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setLocations((prev) => [...prev, newLocation]);
      setShowAddModal(false);
      setNewLocationName('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error adding location:', error);
      Alert.alert('Ошибка', 'Не удалось добавить локацию');
    }
  };

  const handleToggleActive = async (location: Location) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const { error } = await supabase
        .from('locations')
        .update({ is_active: !location.isActive })
        .eq('id', location.id);

      if (error) throw error;

      setLocations((prev) =>
        prev.map((l) => (l.id === location.id ? { ...l, isActive: !l.isActive } : l))
      );
    } catch (error) {
      console.error('Error toggling location status:', error);
    }
  };

  const handleLocationPress = (location: Location) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to location details or edit
    Alert.alert(
      location.name,
      'Выберите действие',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: location.isActive ? 'Деактивировать' : 'Активировать',
          onPress: () => handleToggleActive(location),
        },
        {
          text: 'Перемещение',
          onPress: () => router.push(`/warehouse/transfer?locationId=${location.id}`),
        },
      ]
    );
  };

  const getLocationTypeIcon = (type: Location['type']) => {
    switch (type) {
      case 'warehouse':
        return 'cube';
      case 'store':
        return 'storefront';
      case 'office':
        return 'business';
      default:
        return 'location';
    }
  };

  const getLocationTypeLabel = (type: Location['type']) => {
    switch (type) {
      case 'warehouse':
        return 'Склад';
      case 'store':
        return 'Магазин';
      case 'office':
        return 'Офис';
      default:
        return 'Другое';
    }
  };

  const renderLocationItem = ({ item, index }: { item: Location; index: number }) => (
    <Animated.View entering={SlideInRight.delay(index * 50).springify()}>
      <Pressable
        style={[styles.locationCard, !item.isActive && styles.locationCardInactive]}
        onPress={() => handleLocationPress(item)}
      >
        <View style={styles.locationIconContainer}>
          <Ionicons
            name={getLocationTypeIcon(item.type)}
            size={28}
            color={item.isActive ? colors.primary : colors.textLight}
          />
        </View>
        <View style={styles.locationInfo}>
          <Text style={styles.locationName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.locationMeta}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{getLocationTypeLabel(item.type)}</Text>
            </View>
            {!item.isActive && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveBadgeText}>Неактивна</Text>
              </View>
            )}
          </View>
          {item.address && (
            <Text style={styles.locationAddress} numberOfLines={1}>
              <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
              {' '}{item.address}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      </Pressable>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <EmptyState
      variant="default"
      title={searchQuery ? 'Ничего не найдено' : 'Нет локаций'}
      description={
        searchQuery
          ? 'Попробуйте изменить поисковый запрос'
          : 'Добавьте склады, магазины или офисы для управления запасами'
      }
      actionLabel={!searchQuery ? 'Добавить локацию' : undefined}
      onAction={!searchQuery ? () => setShowAddModal(true) : undefined}
    />
  );

  const renderLoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <Skeleton width={52} height={52} borderRadius={14} />
          <View style={styles.skeletonContent}>
            <Skeleton width="60%" height={18} />
            <Skeleton width="40%" height={14} style={{ marginTop: 6 }} />
          </View>
        </View>
      ))}
    </View>
  );

  const activeCount = locations.filter((l) => l.isActive).length;
  const inactiveCount = locations.filter((l) => !l.isActive).length;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Локации',
          headerLargeTitle: true,
          headerRight: () => (
            <Pressable onPress={() => setShowAddModal(true)} style={styles.headerButton}>
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
            placeholder="Поиск локации..."
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
          style={[styles.filterButton, showInactive && styles.filterButtonActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowInactive(!showInactive);
          }}
        >
          <Ionicons
            name={showInactive ? 'eye' : 'eye-off-outline'}
            size={18}
            color={showInactive ? colors.primary : colors.textSecondary}
          />
        </Pressable>
      </View>

      {/* Stats */}
      {!isLoading && locations.length > 0 && (
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
            <Text style={styles.statValue}>{locations.length}</Text>
            <Text style={styles.statLabel}>Всего</Text>
          </View>
        </Animated.View>
      )}

      {/* Content */}
      {isLoading ? (
        renderLoadingSkeleton()
      ) : (
        <FlatList
          data={filteredLocations}
          renderItem={renderLocationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContainer,
            filteredLocations.length === 0 && styles.emptyListContainer,
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

      {/* Add Location Modal */}
      {showAddModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + spacing.lg }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Новая локация</Text>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Название</Text>
                <TextInput
                  style={styles.input}
                  value={newLocationName}
                  onChangeText={setNewLocationName}
                  placeholder="Например: Основной склад"
                  placeholderTextColor={colors.textLight}
                  autoFocus
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Тип</Text>
                <View style={styles.typeSelector}>
                  {(['warehouse', 'store', 'office', 'other'] as const).map((type) => (
                    <Pressable
                      key={type}
                      style={[
                        styles.typeOption,
                        newLocationType === type && styles.typeOptionActive,
                      ]}
                      onPress={() => setNewLocationType(type)}
                    >
                      <Ionicons
                        name={getLocationTypeIcon(type)}
                        size={20}
                        color={newLocationType === type ? colors.primary : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.typeOptionText,
                          newLocationType === type && styles.typeOptionTextActive,
                        ]}
                      >
                        {getLocationTypeLabel(type)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Button
                title="Отмена"
                variant="outline"
                onPress={() => setShowAddModal(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Добавить"
                onPress={handleAddLocation}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
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
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.sm,
  },
  locationCardInactive: {
    opacity: 0.7,
  },
  locationIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  locationMeta: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 4,
  },
  typeBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  typeBadgeText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  inactiveBadge: {
    backgroundColor: colors.errorLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  inactiveBadgeText: {
    fontSize: typography.sizes.xs,
    color: colors.error,
    fontWeight: '600',
  },
  locationAddress: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 4,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
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
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  typeOptionActive: {
    backgroundColor: `${colors.primary}15`,
    borderColor: colors.primary,
  },
  typeOptionText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  typeOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});
