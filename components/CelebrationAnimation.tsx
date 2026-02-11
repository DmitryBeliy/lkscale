import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Modal, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  withDelay,
  runOnJS,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CelebrationAnimationProps {
  visible: boolean;
  onClose: () => void;
  type: 'revenue_goal' | 'order_milestone' | 'achievement' | 'success';
  title: string;
  subtitle?: string;
  value?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface ConfettiPieceProps {
  index: number;
  color: string;
}

const CONFETTI_COLORS = ['#2c7be5', '#00d97e', '#f6c343', '#e63757', '#6f42c1', '#39afd1'];

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ index, color }) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const startX = Math.random() * SCREEN_WIDTH;
  const duration = 2000 + Math.random() * 1500;
  const delay = Math.random() * 500;

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(SCREEN_HEIGHT + 100, {
        duration,
        easing: Easing.linear,
      })
    );

    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(30, { duration: 300 }),
          withTiming(-30, { duration: 300 })
        ),
        -1,
        true
      )
    );

    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1
      )
    );

    opacity.value = withDelay(
      delay + duration - 500,
      withTiming(0, { duration: 500 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: startX + translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const shapes = ['square', 'circle', 'rectangle'];
  const shape = shapes[index % shapes.length];

  return (
    <Animated.View
      style={[
        styles.confetti,
        animatedStyle,
        {
          backgroundColor: color,
          borderRadius: shape === 'circle' ? 50 : shape === 'rectangle' ? 2 : 4,
          width: shape === 'rectangle' ? 4 : 10,
          height: shape === 'rectangle' ? 16 : 10,
        },
      ]}
    />
  );
};

const StarBurst: React.FC<{ delay: number }> = ({ delay }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 8, stiffness: 100 })
    );
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 300 }),
        withDelay(1000, withTiming(0, { duration: 500 }))
      )
    );
    rotation.value = withDelay(
      delay,
      withTiming(360, { duration: 2000, easing: Easing.linear })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.starBurst, animatedStyle]}>
      <Ionicons name="star" size={24} color="#f6c343" />
    </Animated.View>
  );
};

export const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({
  visible,
  onClose,
  type,
  title,
  subtitle,
  value,
  icon,
}) => {
  const containerScale = useSharedValue(0);
  const containerOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0);

  const triggerHaptics = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  useEffect(() => {
    if (visible) {
      runOnJS(triggerHaptics)();

      containerOpacity.value = withTiming(1, { duration: 300 });
      containerScale.value = withSpring(1, { damping: 12, stiffness: 100 });

      iconScale.value = withDelay(
        200,
        withSequence(
          withSpring(1.2, { damping: 8 }),
          withSpring(1, { damping: 10 })
        )
      );

      textOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
      buttonScale.value = withDelay(700, withSpring(1, { damping: 10 }));
    } else {
      containerOpacity.value = withTiming(0, { duration: 200 });
      containerScale.value = withTiming(0.8, { duration: 200 });
      iconScale.value = 0;
      textOpacity.value = 0;
      buttonScale.value = 0;
    }
  }, [visible]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const getGradientColors = (): [string, string] => {
    switch (type) {
      case 'revenue_goal':
        return ['#00d97e', '#00b368'];
      case 'order_milestone':
        return ['#2c7be5', '#6f42c1'];
      case 'achievement':
        return ['#f6c343', '#d97706'];
      default:
        return ['#2c7be5', '#00d97e'];
    }
  };

  const getIcon = (): keyof typeof Ionicons.glyphMap => {
    if (icon) return icon;
    switch (type) {
      case 'revenue_goal':
        return 'trophy';
      case 'order_milestone':
        return 'ribbon';
      case 'achievement':
        return 'medal';
      default:
        return 'checkmark-circle';
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Confetti */}
        {Array.from({ length: 40 }).map((_, index) => (
          <ConfettiPiece
            key={index}
            index={index}
            color={CONFETTI_COLORS[index % CONFETTI_COLORS.length]}
          />
        ))}

        {/* Star bursts */}
        {Array.from({ length: 6 }).map((_, index) => (
          <View
            key={`star-${index}`}
            style={[
              styles.starContainer,
              {
                top: 100 + Math.random() * 200,
                left: 50 + Math.random() * (SCREEN_WIDTH - 100),
              },
            ]}
          >
            <StarBurst delay={index * 150} />
          </View>
        ))}

        {/* Main Content */}
        <Animated.View style={[styles.content, containerAnimatedStyle]}>
          <View style={styles.card}>
            {/* Icon */}
            <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
              <LinearGradient
                colors={getGradientColors()}
                style={styles.iconGradient}
              >
                <Ionicons name={getIcon()} size={48} color="#fff" />
              </LinearGradient>
            </Animated.View>

            {/* Text */}
            <Animated.View style={textAnimatedStyle}>
              {value && (
                <Text style={styles.value}>{value}</Text>
              )}
              <Text style={styles.title}>{title}</Text>
              {subtitle && (
                <Text style={styles.subtitle}>{subtitle}</Text>
              )}
            </Animated.View>

            {/* Button */}
            <Animated.View style={buttonAnimatedStyle}>
              <Pressable
                style={styles.button}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onClose();
                }}
              >
                <LinearGradient
                  colors={getGradientColors()}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="sparkles" size={20} color="#fff" />
                  <Text style={styles.buttonText}>
                    Отлично!
                  </Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Success flash animation for quick feedback
interface SuccessFlashProps {
  visible: boolean;
  message?: string;
}

export const SuccessFlash: React.FC<SuccessFlashProps> = ({ visible, message }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(1000, withTiming(0, { duration: 300 }))
      );
      scale.value = withSequence(
        withSpring(1.1, { damping: 8 }),
        withSpring(1, { damping: 10 }),
        withDelay(800, withTiming(0.8, { duration: 300 }))
      );
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.flashContainer, animatedStyle]}>
      <View style={styles.flashContent}>
        <View style={styles.flashIcon}>
          <Ionicons name="checkmark-circle" size={32} color="#00d97e" />
        </View>
        {message && <Text style={styles.flashMessage}>{message}</Text>}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    position: 'absolute',
  },
  starBurst: {
    position: 'absolute',
  },
  starContainer: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 340,
    ...shadows.xl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: typography.sizes.display,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: typography.sizes.md * 1.5,
  },
  button: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  buttonText: {
    color: '#fff',
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  flashContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
  },
  flashContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.lg,
  },
  flashIcon: {},
  flashMessage: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
});

export default CelebrationAnimation;
