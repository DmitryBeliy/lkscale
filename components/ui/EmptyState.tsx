import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';

type IoniconsName = keyof typeof Ionicons.glyphMap;

type EmptyStateVariant = 'orders' | 'products' | 'team' | 'customers' | 'default';

interface EmptyStateProps {
  icon?: IoniconsName;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: EmptyStateVariant;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

const VARIANT_CONFIGS: Record<EmptyStateVariant, { icon: IoniconsName; lightGradient: [string, string]; darkGradient: [string, string] }> = {
  orders: {
    icon: 'receipt-outline',
    lightGradient: ['#2c7be5', '#1a68d1'],
    darkGradient: ['#58a6ff', '#388bfd'],
  },
  products: {
    icon: 'cube-outline',
    lightGradient: ['#00d97e', '#00b368'],
    darkGradient: ['#3fb950', '#2ea043'],
  },
  team: {
    icon: 'people-outline',
    lightGradient: ['#6f42c1', '#5a32a3'],
    darkGradient: ['#a371f7', '#8957e5'],
  },
  customers: {
    icon: 'person-circle-outline',
    lightGradient: ['#f6913e', '#e67a22'],
    darkGradient: ['#f0883e', '#d47616'],
  },
  default: {
    icon: 'file-tray-outline',
    lightGradient: ['#2c7be5', '#6f42c1'],
    darkGradient: ['#58a6ff', '#a371f7'],
  },
};

const ICON_CIRCLE_SIZE = 100;

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  const { colors, spacing, borderRadius, typography, isDark, shadows } = useTheme();

  const variantConfig = VARIANT_CONFIGS[variant];
  const resolvedIcon = icon ?? variantConfig.icon;
  const gradientColors = isDark ? variantConfig.darkGradient : variantConfig.lightGradient;

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[
        styles.container,
        { paddingHorizontal: spacing.lg, paddingVertical: spacing.xxl },
      ]}
    >
      {/* Icon circle with gradient */}
      <View
        style={[
          styles.iconCircleOuter,
          {
            backgroundColor: isDark
              ? `${gradientColors[0]}15`
              : `${gradientColors[0]}10`,
            borderRadius: borderRadius.full,
          },
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.iconCircle,
            {
              borderRadius: borderRadius.full,
              ...shadows.lg,
            },
          ]}
        >
          <Ionicons name={resolvedIcon} size={44} color="#ffffff" />
        </LinearGradient>
      </View>

      {/* Title */}
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
            fontSize: typography.sizes.xl,
            fontWeight: typography.weights.bold,
            lineHeight: typography.sizes.xl * typography.lineHeights.tight,
            marginTop: spacing.lg,
          },
        ]}
      >
        {title}
      </Text>

      {/* Description */}
      <Text
        style={[
          styles.description,
          {
            color: colors.textSecondary,
            fontSize: typography.sizes.sm,
            fontWeight: typography.weights.regular,
            lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
            marginTop: spacing.sm,
          },
        ]}
      >
        {description}
      </Text>

      {/* Primary CTA */}
      {actionLabel && onAction ? (
        <View style={[styles.actionContainer, { marginTop: spacing.lg }]}>
          <Button
            title={actionLabel}
            onPress={onAction}
            variant="primary"
            size="lg"
            icon={<Ionicons name="add-circle-outline" size={20} color={colors.textInverse} />}
            style={styles.primaryButton}
          />
        </View>
      ) : null}

      {/* Secondary action */}
      {secondaryActionLabel && onSecondaryAction ? (
        <Pressable
          onPress={onSecondaryAction}
          style={[styles.secondaryAction, { marginTop: spacing.md }]}
          hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
        >
          <Text
            style={[
              styles.secondaryActionText,
              {
                color: colors.primary,
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.semibold,
              },
            ]}
          >
            {secondaryActionLabel}
          </Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleOuter: {
    width: ICON_CIRCLE_SIZE + 24,
    height: ICON_CIRCLE_SIZE + 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: ICON_CIRCLE_SIZE,
    height: ICON_CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    maxWidth: 280,
  },
  actionContainer: {
    width: '100%',
    maxWidth: 320,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryAction: {
    paddingVertical: 4,
  },
  secondaryActionText: {
    textAlign: 'center',
  },
});
