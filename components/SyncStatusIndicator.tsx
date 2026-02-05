import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { Card, Button } from '@/components/ui';
import {
  getSyncState,
  subscribeSync,
  performSync,
  resolveConflict,
} from '@/store/syncStore';
import { useLocalization } from '@/localization';
import { SyncStatus, SyncConflict } from '@/types';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

interface SyncStatusIndicatorProps {
  showLabel?: boolean;
  size?: 'small' | 'medium';
}

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  showLabel = false,
  size = 'small',
}) => {
  const { t, formatDate } = useLocalization();
  const [status, setStatus] = useState<SyncStatus>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState(0);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const rotation = useSharedValue(0);

  useEffect(() => {
    const unsub = subscribeSync(() => {
      const state = getSyncState();
      setStatus(state.status);
      setLastSyncTime(state.lastSyncTime);
      setPendingChanges(state.pendingChanges);
      setConflicts(state.conflicts);
    });

    // Initial state
    const state = getSyncState();
    setStatus(state.status);
    setLastSyncTime(state.lastSyncTime);
    setPendingChanges(state.pendingChanges);
    setConflicts(state.conflicts);

    return () => unsub();
  }, []);

  useEffect(() => {
    if (status === 'syncing') {
      rotation.value = withRepeat(withTiming(360, { duration: 1000 }), -1);
    } else {
      cancelAnimation(rotation);
      rotation.value = 0;
    }
  }, [status, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const getStatusIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'synced':
        return 'cloud-done';
      case 'pending':
        return 'cloud-upload';
      case 'syncing':
        return 'sync';
      case 'offline':
        return 'cloud-offline';
      case 'conflict':
        return 'warning';
      default:
        return 'cloud';
    }
  };

  const getStatusColor = (): string => {
    switch (status) {
      case 'synced':
        return colors.success;
      case 'pending':
      case 'syncing':
        return colors.warning;
      case 'offline':
        return colors.textLight;
      case 'conflict':
        return colors.error;
      default:
        return colors.textLight;
    }
  };

  const getStatusLabel = (): string => {
    switch (status) {
      case 'synced':
        return t.sync.synced;
      case 'pending':
        return t.sync.pending;
      case 'syncing':
        return t.sync.syncing;
      case 'offline':
        return t.sync.offline;
      case 'conflict':
        return t.sync.conflictDetected;
      default:
        return '';
    }
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowModal(true);
  };

  const handleSync = async () => {
    setSyncing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await performSync();
    setSyncing(false);
  };

  const handleResolveConflict = async (conflict: SyncConflict, resolution: 'local' | 'server') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await resolveConflict(conflict.id, resolution);
  };

  const iconSize = size === 'small' ? 18 : 22;

  return (
    <>
      <Pressable
        style={[styles.container, size === 'medium' && styles.containerMedium]}
        onPress={handlePress}
      >
        {status === 'syncing' ? (
          <AnimatedIonicons
            name={getStatusIcon()}
            size={iconSize}
            color={getStatusColor()}
            style={animatedStyle}
          />
        ) : (
          <Ionicons
            name={getStatusIcon()}
            size={iconSize}
            color={getStatusColor()}
          />
        )}
        {showLabel && (
          <Text style={[styles.label, { color: getStatusColor() }]}>
            {getStatusLabel()}
          </Text>
        )}
        {(status === 'pending' || status === 'conflict') && pendingChanges > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingChanges}</Text>
          </View>
        )}
      </Pressable>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={[styles.statusIconLarge, { backgroundColor: `${getStatusColor()}15` }]}>
                <Ionicons name={getStatusIcon()} size={32} color={getStatusColor()} />
              </View>
              <Text style={styles.modalTitle}>{getStatusLabel()}</Text>
              <Pressable style={styles.closeButton} onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              {lastSyncTime && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t.sync.lastSynced}:</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(lastSyncTime, 'relative')}
                  </Text>
                </View>
              )}

              {pendingChanges > 0 && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ожидающие изменения:</Text>
                  <Text style={styles.infoValue}>{pendingChanges}</Text>
                </View>
              )}

              {status === 'conflict' && conflicts.length > 0 && (
                <View style={styles.conflictsSection}>
                  <Text style={styles.conflictsTitle}>{t.sync.conflictDetected}</Text>
                  {conflicts.map((conflict) => (
                    <Card key={conflict.id} style={styles.conflictCard}>
                      <View style={styles.conflictHeader}>
                        <Ionicons name="warning" size={20} color={colors.error} />
                        <Text style={styles.conflictType}>
                          {conflict.entityType === 'product'
                            ? 'Товар'
                            : conflict.entityType === 'order'
                            ? 'Заказ'
                            : 'Клиент'}
                        </Text>
                      </View>
                      <Text style={styles.conflictDescription}>
                        Данные были изменены на другом устройстве
                      </Text>
                      <View style={styles.conflictActions}>
                        <Button
                          title={t.sync.keepLocal}
                          size="sm"
                          variant="outline"
                          onPress={() => handleResolveConflict(conflict, 'local')}
                          style={styles.conflictButton}
                        />
                        <Button
                          title={t.sync.keepServer}
                          size="sm"
                          onPress={() => handleResolveConflict(conflict, 'server')}
                          style={styles.conflictButton}
                        />
                      </View>
                    </Card>
                  ))}
                </View>
              )}
            </View>

            {status !== 'syncing' && status !== 'offline' && (
              <View style={styles.modalFooter}>
                <Button
                  title={syncing ? t.sync.syncing : t.common.refresh}
                  onPress={handleSync}
                  loading={syncing}
                  icon={<Ionicons name="sync" size={18} color={colors.textInverse} />}
                />
              </View>
            )}

            {status === 'offline' && (
              <View style={styles.offlineMessage}>
                <Ionicons name="wifi-outline" size={24} color={colors.textLight} />
                <Text style={styles.offlineText}>
                  Нет подключения к интернету. Изменения будут синхронизированы при восстановлении связи.
                </Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    gap: 4,
    ...shadows.sm,
  },
  containerMedium: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textInverse,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: 400,
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  statusIconLarge: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  modalTitle: {
    flex: 1,
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  conflictsSection: {
    marginTop: spacing.md,
  },
  conflictsTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.error,
    marginBottom: spacing.sm,
  },
  conflictCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  conflictHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  conflictType: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  conflictDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  conflictActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  conflictButton: {
    flex: 1,
  },
  modalFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  offlineMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    gap: spacing.md,
  },
  offlineText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.sizes.sm * 1.5,
  },
});
