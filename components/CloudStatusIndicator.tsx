import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  cancelAnimation,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { subscribeToConnectionStatus, getConnectionStatus } from '@/lib/supabase';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

interface CloudStatusIndicatorProps {
  showLabel?: boolean;
  size?: 'small' | 'medium';
}

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

export const CloudStatusIndicator: React.FC<CloudStatusIndicatorProps> = ({
  showLabel = false,
  size = 'small',
}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  // Pulse animation for syncing
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    const unsubscribe = subscribeToConnectionStatus((connected) => {
      setIsConnected(connected);
    });

    // Check initial status
    const status = getConnectionStatus();
    setIsConnected(status.isConnected);

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isConnected) {
      // Start pulsing when offline
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(pulseOpacity);
      pulseOpacity.value = 1;
    }
  }, [isConnected, pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowTooltip(true);

    // Auto-hide tooltip after 2 seconds
    setTimeout(() => {
      setShowTooltip(false);
    }, 2000);
  };

  const iconSize = size === 'small' ? 20 : 24;
  const statusColor = isConnected ? colors.success : colors.textLight;
  const statusText = isConnected ? 'Подключено' : 'Офлайн';

  return (
    <>
      <Pressable
        style={[styles.container, size === 'medium' && styles.containerMedium]}
        onPress={handlePress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <AnimatedIonicons
          name={isConnected ? 'cloud-done' : 'cloud-offline'}
          size={iconSize}
          color={statusColor}
          style={pulseStyle}
        />
        {showLabel && (
          <Text style={[styles.label, { color: statusColor }]}>
            {statusText}
          </Text>
        )}
        {!isConnected && (
          <View style={styles.offlineDot} />
        )}
      </Pressable>

      <Modal
        visible={showTooltip}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTooltip(false)}
      >
        <Pressable
          style={styles.tooltipOverlay}
          onPress={() => setShowTooltip(false)}
        >
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.tooltip}
          >
            <View style={[styles.tooltipIcon, { backgroundColor: `${statusColor}15` }]}>
              <Ionicons
                name={isConnected ? 'cloud-done' : 'cloud-offline'}
                size={24}
                color={statusColor}
              />
            </View>
            <View style={styles.tooltipContent}>
              <Text style={styles.tooltipTitle}>{statusText}</Text>
              <Text style={styles.tooltipSubtitle}>
                {isConnected
                  ? 'Данные синхронизируются в реальном времени'
                  : 'Нет подключения к серверу. Данные будут синхронизированы при восстановлении связи'
                }
              </Text>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  containerMedium: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: '500',
  },
  offlineDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  tooltipOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: spacing.md,
  },
  tooltip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    maxWidth: 280,
    ...shadows.lg,
  },
  tooltipIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  tooltipContent: {
    flex: 1,
  },
  tooltipTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  tooltipSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: typography.sizes.xs * 1.4,
  },
});

export default CloudStatusIndicator;
