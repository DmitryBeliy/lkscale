import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

// High-contrast warehouse colors for visibility in industrial environments
export const warehouseColors = {
  // Primary action colors - bold and clear
  stockIn: '#00C853', // Bright green for positive actions
  stockInBg: 'rgba(0, 200, 83, 0.15)',
  writeOff: '#FF1744', // Bright red for removal/damage
  writeOffBg: 'rgba(255, 23, 68, 0.15)',
  transfer: '#2979FF', // Bright blue for neutral operations
  transferBg: 'rgba(41, 121, 255, 0.15)',
  return: '#FF9100', // Bright orange for returns
  returnBg: 'rgba(255, 145, 0, 0.15)',
  adjustment: '#00BCD4', // Cyan for adjustments/audit
  adjustmentBg: 'rgba(0, 188, 212, 0.15)',
  scan: '#7C4DFF', // Purple for scanning
  scanBg: 'rgba(124, 77, 255, 0.15)',

  // Status colors
  success: '#00E676',
  warning: '#FFEA00',
  error: '#FF5252',

  // Background
  darkBg: '#1A1A2E',
  cardBg: '#16213E',
  surfaceBg: '#0F3460',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface WarehouseButtonProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onPress: () => void;
  variant?: 'stock_in' | 'write_off' | 'transfer' | 'return' | 'scan' | 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export const WarehouseButton: React.FC<WarehouseButtonProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const getVariantColors = () => {
    switch (variant) {
      case 'stock_in':
        return { bg: warehouseColors.stockInBg, border: warehouseColors.stockIn, text: warehouseColors.stockIn };
      case 'write_off':
        return { bg: warehouseColors.writeOffBg, border: warehouseColors.writeOff, text: warehouseColors.writeOff };
      case 'transfer':
        return { bg: warehouseColors.transferBg, border: warehouseColors.transfer, text: warehouseColors.transfer };
      case 'return':
        return { bg: warehouseColors.returnBg, border: warehouseColors.return, text: warehouseColors.return };
      case 'scan':
        return { bg: warehouseColors.scanBg, border: warehouseColors.scan, text: warehouseColors.scan };
      case 'secondary':
        return { bg: colors.background, border: colors.border, text: colors.text };
      default:
        return { bg: colors.primary, border: colors.primary, text: colors.textInverse };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: spacing.sm,
          minHeight: 48,
          iconSize: 20,
          titleSize: typography.sizes.sm,
          subtitleSize: typography.sizes.xs,
        };
      case 'large':
        return {
          padding: spacing.lg,
          minHeight: 88,
          iconSize: 32,
          titleSize: typography.sizes.lg,
          subtitleSize: typography.sizes.sm,
        };
      default:
        return {
          padding: spacing.md,
          minHeight: 64,
          iconSize: 24,
          titleSize: typography.sizes.md,
          subtitleSize: typography.sizes.sm,
        };
    }
  };

  const variantColors = getVariantColors();
  const sizeStyles = getSizeStyles();
  const isPrimary = variant === 'primary';

  return (
    <AnimatedPressable
      style={[
        animatedStyle,
        styles.button,
        {
          backgroundColor: isPrimary ? variantColors.bg : variantColors.bg,
          borderColor: variantColors.border,
          borderWidth: isPrimary ? 0 : 2,
          padding: sizeStyles.padding,
          minHeight: sizeStyles.minHeight,
          opacity: disabled ? 0.5 : 1,
        },
        fullWidth && styles.fullWidth,
        isPrimary && shadows.md,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isPrimary ? variantColors.text : variantColors.text}
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.title,
                {
                  color: variantColors.text,
                  fontSize: sizeStyles.titleSize,
                },
              ]}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: isPrimary ? `${variantColors.text}CC` : colors.textSecondary,
                    fontSize: sizeStyles.subtitleSize,
                  },
                ]}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subtitle: {
    marginTop: 2,
    fontWeight: '500',
  },
});

export default WarehouseButton;
