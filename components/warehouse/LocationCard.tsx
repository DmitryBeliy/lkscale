import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import type { Location } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface LocationCardProps {
  location: Location;
  onPress: () => void;
  onEdit?: () => void;
  showActions?: boolean;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onPress,
  onEdit,
  showActions = true,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onEdit?.();
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

  return (
    <AnimatedPressable
      style={[animatedStyle, styles.card]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View entering={FadeIn} style={styles.content}>
        <View style={styles.leftSection}>
          <View
            style={[
              styles.iconContainer,
              !location.isActive && styles.inactiveIcon,
            ]}
          >
            <Ionicons
              name={getLocationTypeIcon(location.type) as any}
              size={28}
              color={location.isActive ? colors.primary : colors.textLight}
            />
          </View>
        </View>

        <View style={styles.mainSection}>
          <View style={styles.headerRow}>
            <Text style={styles.name} numberOfLines={1}>
              {location.name}
            </Text>
            {!location.isActive && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveBadgeText}>Неактивна</Text>
              </View>
            )}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{getLocationTypeLabel(location.type)}</Text>
            </View>
          </View>

          {location.address && (
            <Text style={styles.address} numberOfLines={1}>
              <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
              {' '}{location.address}
            </Text>
          )}

          {location.phone && (
            <Text style={styles.phone} numberOfLines={1}>
              <Ionicons name="call-outline" size={12} color={colors.textSecondary} />
              {' '}{location.phone}
            </Text>
          )}
        </View>

        {showActions && (
          <View style={styles.actionsSection}>
            {onEdit && (
              <Pressable
                style={styles.actionButton}
                onPress={handleEdit}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="create-outline" size={20} color={colors.primary} />
              </Pressable>
            )}
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textLight}
            />
          </View>
        )}
      </Animated.View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  content: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  leftSection: {
    justifyContent: 'flex-start',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveIcon: {
    backgroundColor: colors.borderLight,
  },
  mainSection: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  inactiveBadge: {
    backgroundColor: colors.errorLight,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  inactiveBadgeText: {
    fontSize: typography.sizes.xs,
    color: colors.error,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 2,
  },
  typeBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  typeBadgeText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  address: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  phone: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LocationCard;
