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
  Linking,
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
import type { Manufacturer } from '@/types';

export default function ManufacturersScreen() {
  const insets = useSafeAreaInsets();
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [filteredManufacturers, setFilteredManufacturers] = useState<Manufacturer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newManufacturerName, setNewManufacturerName] = useState('');
  const [newManufacturerWebsite, setNewManufacturerWebsite] = useState('');

  const loadManufacturers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('manufacturers')
        .select('*')
        .order('name');

      if (error) throw error;

      const mappedManufacturers: Manufacturer[] = (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description || undefined,
        website: item.website || undefined,
        logoUrl: item.logo_url || undefined,
        isActive: item.is_active ?? true,
        createdAt: item.created_at,
        updatedAt: item.updated_at || undefined,
      }));

      setManufacturers(mappedManufacturers);
    } catch (error) {
      console.error('Error loading manufacturers:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadManufacturers();
  }, [loadManufacturers]);

  useEffect(() => {
    let filtered = manufacturers;

    if (!showInactive) {
      filtered = filtered.filter((m) => m.isActive);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.description?.toLowerCase().includes(query)
      );
    }

    setFilteredManufacturers(filtered);
  }, [manufacturers, searchQuery, showInactive]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadManufacturers();
  };

  const handleAddManufacturer = async () => {
    if (!newManufacturerName.trim()) {
      Alert.alert('Ошибка', 'Введите название производителя');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const { data, error } = await supabase
        .from('manufacturers')
        .insert({
          name: newManufacturerName.trim(),
          website: newManufacturerWebsite.trim() || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      const newManufacturer: Manufacturer = {
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        website: data.website || undefined,
        logoUrl: data.logo_url || undefined,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at || undefined,
      };

      setManufacturers((prev) => [...prev, newManufacturer]);
      setShowAddModal(false);
      setNewManufacturerName('');
      setNewManufacturerWebsite('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error adding manufacturer:', error);
      Alert.alert('Ошибка', 'Не удалось добавить производителя');
    }
  };

  const handleToggleActive = async (manufacturer: Manufacturer) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const { error } = await supabase
        .from('manufacturers')
        .update({ is_active: !manufacturer.isActive })
        .eq('id', manufacturer.id);

      if (error) throw error;

      setManufacturers((prev) =>
        prev.map((m) => (m.id === manufacturer.id ? { ...m, isActive: !m.isActive } : m))
      );
    } catch (error) {
      console.error('Error toggling manufacturer status:', error);
    }
  };

  const handleWebsitePress = (website: string | undefined) => {
    if (website) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      let url = website;
      if (!url.startsWith('http')) {
        url = `https://${url}`;
      }
      Linking.openURL(url);
    }
  };

  const handleManufacturerPress = (manufacturer: Manufacturer) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      manufacturer.name,
      'Выберите действие',
      [
        { text: 'Отмена', style: 'cancel' },
        manufacturer.website
          ? { text: 'Открыть сайт', onPress: () => handleWebsitePress(manufacturer.website) }
          : null,
        {
          text: manufacturer.isActive ? 'Деактивировать' : 'Активировать',
          onPress: () => handleToggleActive(manufacturer),
        },
      ].filter(Boolean) as { text: string; style?: 'cancel' | 'destructive'; onPress?: () => void }[]
    );
  };

  const renderManufacturerItem = ({ item, index }: { item: Manufacturer; index: number }) => (
    <Animated.View entering={SlideInRight.delay(index * 50).springify()}>
      <Pressable
        style={[styles.manufacturerCard, !item.isActive && styles.manufacturerCardInactive]}
        onPress={() => handleManufacturerPress(item)}
      >
        <View style={styles.manufacturerIconContainer}>
          <Ionicons
            name="business"
            size={28}
            color={item.isActive ? colors.primary : colors.textLight}
          />
        </View>
        <View style={styles.manufacturerInfo}>
          <Text style={styles.manufacturerName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.description && (
            <Text style={styles.manufacturerDescription} numberOfLines={1}>
              {item.description}
            </Text>
          )}
          <View style={styles.manufacturerMeta}>
            {item.website && (
              <Pressable
                style={styles.websiteBadge}
                onPress={() => handleWebsitePress(item.website)}
              >
                <Ionicons name="globe-outline" size={12} color={colors.primary} />
                <Text style={styles.websiteText}>Сайт</Text>
              </Pressable>
            )}
            {!item.isActive && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveBadgeText}>Неактивен</Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      </Pressable>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <EmptyState
      variant="default"
      title={searchQuery ? 'Ничего не найдено' : 'Нет производителей'}
      description={
        searchQuery
          ? 'Попробуйте изменить поисковый запрос'
          : 'Добавьте производителей для управления ассортиментом'
      }
      actionLabel={!searchQuery ? 'Добавить производителя' : undefined}
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

  const activeCount = manufacturers.filter((m) => m.isActive).length;
  const inactiveCount = manufacturers.filter((m) => !m.isActive).length;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Производители',
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
            placeholder="Поиск производителя..."
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
      {!isLoading && manufacturers.length > 0 && (
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
            <Text style={styles.statValue}>{manufacturers.length}</Text>
            <Text style={styles.statLabel}>Всего</Text>
          </View>
        </Animated.View>
      )}

      {/* Content */}
      {isLoading ? (
        renderLoadingSkeleton()
      ) : (
        <FlatList
          data={filteredManufacturers}
          renderItem={renderManufacturerItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContainer,
            filteredManufacturers.length === 0 && styles.emptyListContainer,
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

      {/* Add Manufacturer Modal */}
      {showAddModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + spacing.lg }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Новый производитель</Text>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Название</Text>
                <TextInput
                  style={styles.input}
                  value={newManufacturerName}
                  onChangeText={setNewManufacturerName}
                  placeholder="Например: Apple Inc."
                  placeholderTextColor={colors.textLight}
                  autoFocus
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Сайт (необязательно)</Text>
                <TextInput
                  style={styles.input}
                  value={newManufacturerWebsite}
                  onChangeText={setNewManufacturerWebsite}
                  placeholder="https://example.com"
                  placeholderTextColor={colors.textLight}
                  autoCapitalize="none"
                  keyboardType="url"
                />
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
                onPress={handleAddManufacturer}
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
  manufacturerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.sm,
  },
  manufacturerCardInactive: {
    opacity: 0.7,
  },
  manufacturerIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manufacturerInfo: {
    flex: 1,
  },
  manufacturerName: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  manufacturerDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  manufacturerMeta: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 4,
  },
  websiteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  websiteText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: '600',
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
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});
