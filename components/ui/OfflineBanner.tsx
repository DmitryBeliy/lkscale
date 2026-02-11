import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  FadeInUp,
  FadeOutUp,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/localization';
import {
  getSyncState,
  subscribeSync,
  performSync,
} from '@/store/syncStore';
import { SyncStatus } from '@/types';

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

export const OfflineBanner: React.FC = () => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const { t } = useLocalization();

  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [conflictCount, setConflictCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const spinRotation = useSharedValue(0);

  // Subscribe to network changes
  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });

    // Fetch initial network state
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => {
      unsubscribeNetInfo();
    };
  }, []);

  // Subscribe to sync store changes
  useEffect(() => {
    const unsubscribeSync = subscribeSync(() => {
      const state = getSyncState();
      setSyncStatus(state.status);
      setPendingCount(state.pendingChanges);
      setConflictCount(state.conflicts.length);
    });

    // Read initial sync state
    const state = getSyncState();
    setSyncStatus(state.status);
    setPendingCount(state.pendingChanges);
    setConflictCount(state.conflicts.length);

    return () => {
      unsubscribeSync();
    };
  }, []);

  // Manage spin animation for syncing state
  useEffect(() => {
    if (syncStatus === 'syncing' || isSyncing) {
      spinRotation.value = withRepeat(
        withTiming(360, { duration: 1000 }),
        -1
      );
    } else {
      cancelAnimation(spinRotation);
      spinRotation.value = 0;
    }
  }, [syncStatus, isSyncing, spinRotation]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinRotation.value}deg` }],
  }));

  const handleSyncNow = useCallback(async () => {
    if (isSyncing || !isConnected) return;
    setIsSyncing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await performSync();
    } catch (error) {
      // performSync handles errors internally; this is a safety net
      console.error('OfflineBanner sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, isConnected]);

  // Determine which banner state to show (priority order)
  const bannerState = getBannerState(isConnected, syncStatus, pendingCount, conflictCount, isSyncing);

  // Do not render when fully synced and online
  if (bannerState === null) {
    return null;
  }

  const config = getBannerConfig(bannerState, colors, t, pendingCount, conflictCount);

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      exiting={FadeOutUp.duration(250)}
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderBottomLeftRadius: borderRadius.md,
          borderBottomRightRadius: borderRadius.md,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.left}>
          {bannerState === 'syncing' ? (
            <AnimatedIonicons
              name="sync"
              size={16}
              color={config.iconColor}
              style={spinStyle}
            />
          ) : (
            <Ionicons
              name={config.icon as keyof typeof Ionicons.glyphMap}
              size={16}
              color={config.iconColor}
            />
          )}
          <Text
            style={[
              styles.message,
              {
                color: config.textColor,
                fontSize: typography.sizes.sm,
              },
            ]}
            numberOfLines={1}
          >
            {config.message}
          </Text>
        </View>

        {config.showSyncButton && (
          <Pressable
            onPress={handleSyncNow}
            style={({ pressed }) => [
              styles.syncButton,
              {
                backgroundColor: config.buttonBackgroundColor,
                borderRadius: borderRadius.sm,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            disabled={isSyncing}
          >
            <Text
              style={[
                styles.syncButtonText,
                {
                  color: config.buttonTextColor,
                  fontSize: typography.sizes.xs,
                },
              ]}
            >
              {t.sync.syncing === config.message ? '' : 'Sync Now'}
            </Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
};

// Banner state determination
type BannerStateType = 'offline' | 'syncing' | 'conflict' | 'pending';

function getBannerState(
  isConnected: boolean,
  syncStatus: SyncStatus,
  pendingCount: number,
  conflictCount: number,
  isSyncing: boolean
): BannerStateType | null {
  if (!isConnected || syncStatus === 'offline') {
    return 'offline';
  }
  if (syncStatus === 'syncing' || isSyncing) {
    return 'syncing';
  }
  if (syncStatus === 'conflict' && conflictCount > 0) {
    return 'conflict';
  }
  if ((syncStatus === 'pending' && pendingCount > 0) || pendingCount > 0) {
    return 'pending';
  }
  return null;
}

interface BannerConfig {
  backgroundColor: string;
  iconColor: string;
  textColor: string;
  icon: string;
  message: string;
  showSyncButton: boolean;
  buttonBackgroundColor: string;
  buttonTextColor: string;
}

function getBannerConfig(
  bannerState: BannerStateType,
  colors: ReturnType<typeof import('@/contexts/ThemeContext').useTheme>['colors'],
  t: ReturnType<typeof import('@/localization').useLocalization>['t'],
  pendingCount: number,
  conflictCount: number
): BannerConfig {
  switch (bannerState) {
    case 'offline':
      return {
        backgroundColor: colors.errorLight,
        iconColor: colors.error,
        textColor: colors.error,
        icon: 'cloud-offline-outline',
        message: pendingCount > 0
          ? `${t.sync.offline} \u00b7 ${pendingCount} ${t.sync.pending.toLowerCase()}`
          : t.sync.offline,
        showSyncButton: false,
        buttonBackgroundColor: 'transparent',
        buttonTextColor: 'transparent',
      };
    case 'syncing':
      return {
        backgroundColor: colors.infoLight,
        iconColor: colors.info,
        textColor: colors.info,
        icon: 'sync',
        message: t.sync.syncing,
        showSyncButton: false,
        buttonBackgroundColor: 'transparent',
        buttonTextColor: 'transparent',
      };
    case 'conflict':
      return {
        backgroundColor: colors.errorLight,
        iconColor: colors.error,
        textColor: colors.error,
        icon: 'warning-outline',
        message: `${t.sync.conflictDetected} (${conflictCount})`,
        showSyncButton: false,
        buttonBackgroundColor: 'transparent',
        buttonTextColor: 'transparent',
      };
    case 'pending':
      return {
        backgroundColor: colors.warningLight,
        iconColor: colors.warningDark,
        textColor: colors.warningDark,
        icon: 'cloud-upload-outline',
        message: `${pendingCount} ${t.sync.pending.toLowerCase()}`,
        showSyncButton: true,
        buttonBackgroundColor: colors.warningDark,
        buttonTextColor: colors.textInverse,
      };
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 100,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  message: {
    fontWeight: '600',
    flexShrink: 1,
  },
  syncButton: {
    marginLeft: 8,
  },
  syncButtonText: {
    fontWeight: '700',
  },
});
