import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn, SlideOutLeft } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/localization';
import { getSyncState, subscribeSync, resolveConflict as resolveSyncConflict } from '@/store/syncStore';
import { SyncConflict } from '@/types';

export default function ConflictResolutionScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { language } = useLocalization();

  const [conflicts, setConflicts] = useState<SyncConflict[]>(getSyncState().conflicts);
  const [resolving, setResolving] = useState<string | null>(null);

  const t = {
    title: language === 'ru' ? 'Разрешение конфликтов' : 'Conflict Resolution',
    subtitle: language === 'ru' ? 'Данные были изменены в нескольких местах' : 'Data was modified in multiple places',
    localVersion: language === 'ru' ? 'Ваша версия' : 'Your Version',
    serverVersion: language === 'ru' ? 'Версия сервера' : 'Server Version',
    keepLocal: language === 'ru' ? 'Оставить мою' : 'Keep Mine',
    keepServer: language === 'ru' ? 'Взять с сервера' : 'Use Server',
    resolved: language === 'ru' ? 'Конфликт разрешён' : 'Conflict resolved',
    noConflicts: language === 'ru' ? 'Нет конфликтов' : 'No conflicts',
    noConflictsDesc: language === 'ru' ? 'Все данные синхронизированы' : 'All data is synced',
    entity: language === 'ru' ? 'Объект' : 'Entity',
    order: language === 'ru' ? 'Заказ' : 'Order',
    product: language === 'ru' ? 'Товар' : 'Product',
    customer: language === 'ru' ? 'Клиент' : 'Customer',
    modifiedAt: language === 'ru' ? 'Изменено' : 'Modified',
    conflictsRemaining: language === 'ru' ? 'конфликтов осталось' : 'conflicts remaining',
  };

  useEffect(() => {
    const unsub = subscribeSync(() => {
      setConflicts(getSyncState().conflicts);
    });
    return unsub;
  }, []);

  const handleResolve = useCallback(async (conflictId: string, resolution: 'local' | 'server') => {
    setResolving(conflictId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      await resolveSyncConflict(conflictId, resolution);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error resolving conflict:', error);
      Alert.alert(language === 'ru' ? 'Ошибка' : 'Error',
        language === 'ru' ? 'Не удалось разрешить конфликт' : 'Failed to resolve conflict');
    } finally {
      setResolving(null);
    }
  }, [language]);

  const getEntityLabel = (type: string) => {
    switch (type) {
      case 'order': return t.order;
      case 'product': return t.product;
      case 'customer': return t.customer;
      default: return type;
    }
  };

  const getEntityIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'order': return 'receipt-outline';
      case 'product': return 'cube-outline';
      case 'customer': return 'person-outline';
      default: return 'document-outline';
    }
  };

  const getEntityColor = (type: string) => {
    switch (type) {
      case 'order': return colors.primary;
      case 'product': return colors.success;
      case 'customer': return '#F59E0B';
      default: return colors.textSecondary;
    }
  };

  const formatDataPreview = (data: Record<string, unknown>): string => {
    const entries = Object.entries(data).slice(0, 3);
    return entries.map(([key, value]) => `${key}: ${String(value)}`).join('\n');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { padding: spacing.md }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surface, borderRadius: borderRadius.full }]}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text, fontSize: typography.sizes.xl }]}>
            {t.title}
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { padding: spacing.md, paddingBottom: spacing.xxl }]}
      >
        {conflicts.length > 0 && (
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <LinearGradient
              colors={[colors.warning, '#d4a12a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.infoBanner, { borderRadius: borderRadius.xl, marginBottom: spacing.lg }]}
            >
              <Ionicons name="git-compare-outline" size={28} color="#fff" />
              <View style={styles.infoBannerText}>
                <Text style={styles.infoBannerTitle}>{t.subtitle}</Text>
                <Text style={styles.infoBannerCount}>
                  {conflicts.length} {t.conflictsRemaining}
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {conflicts.length === 0 ? (
          <Animated.View entering={FadeIn.duration(400)} style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: `${colors.success}15`, borderRadius: borderRadius.full }]}>
              <Ionicons name="checkmark-circle" size={48} color={colors.success} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text, fontSize: typography.sizes.lg }]}>
              {t.noConflicts}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
              {t.noConflictsDesc}
            </Text>
            <Button
              title={language === 'ru' ? 'Назад' : 'Go Back'}
              onPress={() => router.back()}
              style={{ marginTop: 24 }}
            />
          </Animated.View>
        ) : (
          conflicts.map((conflict, index) => {
            const entityColor = getEntityColor(conflict.entityType);
            return (
              <Animated.View
                key={conflict.id}
                entering={FadeInDown.delay(200 + index * 100).duration(400)}
                exiting={SlideOutLeft.duration(300)}
              >
                <Card style={[styles.conflictCard, { marginBottom: spacing.md, borderLeftColor: colors.warning, borderLeftWidth: 4 }]}>
                  {/* Conflict Header */}
                  <View style={styles.conflictHeader}>
                    <View style={[styles.entityBadge, { backgroundColor: `${entityColor}15`, borderRadius: borderRadius.md }]}>
                      <Ionicons name={getEntityIcon(conflict.entityType)} size={20} color={entityColor} />
                    </View>
                    <View style={styles.conflictInfo}>
                      <Text style={[styles.conflictEntityType, { color: entityColor, fontSize: typography.sizes.xs }]}>
                        {getEntityLabel(conflict.entityType)}
                      </Text>
                      <Text style={[styles.conflictEntityId, { color: colors.text, fontSize: typography.sizes.sm }]}>
                        ID: {conflict.entityId}
                      </Text>
                    </View>
                    <Text style={[styles.conflictTime, { color: colors.textLight, fontSize: 11 }]}>
                      {new Date(conflict.timestamp).toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>

                  {/* Data Comparison */}
                  <View style={styles.dataComparison}>
                    {/* Local */}
                    <View style={[styles.dataBox, {
                      backgroundColor: `${colors.primary}08`,
                      borderColor: colors.primary,
                      borderRadius: borderRadius.md,
                    }]}>
                      <View style={styles.dataBoxHeader}>
                        <Ionicons name="phone-portrait-outline" size={14} color={colors.primary} />
                        <Text style={[styles.dataBoxLabel, { color: colors.primary, fontSize: typography.sizes.xs }]}>
                          {t.localVersion}
                        </Text>
                      </View>
                      <Text style={[styles.dataPreview, { color: colors.text, fontSize: 11 }]} numberOfLines={3}>
                        {formatDataPreview(conflict.localData)}
                      </Text>
                    </View>

                    <View style={styles.vsContainer}>
                      <Text style={[styles.vsText, { color: colors.textLight }]}>VS</Text>
                    </View>

                    {/* Server */}
                    <View style={[styles.dataBox, {
                      backgroundColor: `${colors.success}08`,
                      borderColor: colors.success,
                      borderRadius: borderRadius.md,
                    }]}>
                      <View style={styles.dataBoxHeader}>
                        <Ionicons name="cloud-outline" size={14} color={colors.success} />
                        <Text style={[styles.dataBoxLabel, { color: colors.success, fontSize: typography.sizes.xs }]}>
                          {t.serverVersion}
                        </Text>
                      </View>
                      <Text style={[styles.dataPreview, { color: colors.text, fontSize: 11 }]} numberOfLines={3}>
                        {formatDataPreview(conflict.serverData)}
                      </Text>
                    </View>
                  </View>

                  {/* Resolution Actions */}
                  <View style={styles.resolutionActions}>
                    <Pressable
                      style={[styles.resolveButton, {
                        backgroundColor: `${colors.primary}15`,
                        borderRadius: borderRadius.md,
                        opacity: resolving === conflict.id ? 0.6 : 1,
                      }]}
                      onPress={() => handleResolve(conflict.id, 'local')}
                      disabled={resolving === conflict.id}
                      accessibilityRole="button"
                      accessibilityLabel={t.keepLocal}
                    >
                      {resolving === conflict.id ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <>
                          <Ionicons name="phone-portrait" size={16} color={colors.primary} />
                          <Text style={[styles.resolveButtonText, { color: colors.primary, fontSize: typography.sizes.sm }]}>
                            {t.keepLocal}
                          </Text>
                        </>
                      )}
                    </Pressable>
                    <Pressable
                      style={[styles.resolveButton, {
                        backgroundColor: `${colors.success}15`,
                        borderRadius: borderRadius.md,
                        opacity: resolving === conflict.id ? 0.6 : 1,
                      }]}
                      onPress={() => handleResolve(conflict.id, 'server')}
                      disabled={resolving === conflict.id}
                      accessibilityRole="button"
                      accessibilityLabel={t.keepServer}
                    >
                      {resolving === conflict.id ? (
                        <ActivityIndicator size="small" color={colors.success} />
                      ) : (
                        <>
                          <Ionicons name="cloud" size={16} color={colors.success} />
                          <Text style={[styles.resolveButtonText, { color: colors.success, fontSize: typography.sizes.sm }]}>
                            {t.keepServer}
                          </Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                </Card>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontWeight: '700' },
  scrollContent: {},
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  infoBannerText: { flex: 1 },
  infoBannerTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
  infoBannerCount: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontWeight: '700', marginBottom: 8 },
  emptyDesc: {},
  conflictCard: {},
  conflictHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  entityBadge: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  conflictInfo: { flex: 1 },
  conflictEntityType: { fontWeight: '600', textTransform: 'uppercase' },
  conflictEntityId: { fontWeight: '500', marginTop: 2 },
  conflictTime: {},
  dataComparison: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 12,
  },
  dataBox: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
  },
  dataBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  dataBoxLabel: { fontWeight: '600' },
  dataPreview: { lineHeight: 16 },
  vsContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: { fontWeight: '700', fontSize: 12 },
  resolutionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  resolveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  resolveButtonText: { fontWeight: '600' },
});
