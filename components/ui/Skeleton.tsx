import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { colors, borderRadius } from '@/constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius: radius = borderRadius.sm,
  style,
}) => {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.4, 0.8]),
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as number,
          height,
          borderRadius: radius,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

interface SkeletonCardProps {
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ lines = 3 }) => {
  return (
    <View style={styles.card}>
      <Skeleton width="40%" height={16} />
      <View style={styles.cardBody}>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            width={index === lines - 1 ? '60%' : '100%'}
            height={14}
            style={styles.line}
          />
        ))}
      </View>
    </View>
  );
};

export const SkeletonKPICard: React.FC = () => {
  return (
    <View style={styles.kpiCard}>
      <Skeleton width={40} height={40} borderRadius={borderRadius.md} />
      <View style={styles.kpiContent}>
        <Skeleton width="60%" height={12} />
        <Skeleton width="80%" height={24} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
};

export const SkeletonProductCard: React.FC = () => {
  return (
    <View style={styles.productCard}>
      <Skeleton width={70} height={70} borderRadius={borderRadius.md} />
      <View style={styles.productContent}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="40%" height={14} style={{ marginTop: 6 }} />
        <View style={styles.productRow}>
          <Skeleton width="30%" height={18} style={{ marginTop: 8 }} />
          <Skeleton width="25%" height={16} style={{ marginTop: 8 }} />
        </View>
      </View>
    </View>
  );
};

export const SkeletonOrderCard: React.FC = () => {
  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Skeleton width={80} height={16} />
        <Skeleton width={70} height={24} borderRadius={borderRadius.full} />
      </View>
      <View style={styles.orderBody}>
        <Skeleton width="60%" height={14} />
        <Skeleton width="40%" height={14} style={{ marginTop: 6 }} />
      </View>
      <View style={styles.orderFooter}>
        <Skeleton width={100} height={20} />
        <Skeleton width={80} height={14} />
      </View>
    </View>
  );
};

export const SkeletonCustomerCard: React.FC = () => {
  return (
    <View style={styles.customerCard}>
      <Skeleton width={50} height={50} borderRadius={25} />
      <View style={styles.customerContent}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="80%" height={14} style={{ marginTop: 6 }} />
      </View>
      <Skeleton width={24} height={24} borderRadius={12} />
    </View>
  );
};

export const SkeletonListLoader: React.FC<{ count?: number; type?: 'product' | 'order' | 'customer' | 'card' }> = ({
  count = 4,
  type = 'card',
}) => {
  const renderItem = () => {
    switch (type) {
      case 'product':
        return <SkeletonProductCard />;
      case 'order':
        return <SkeletonOrderCard />;
      case 'customer':
        return <SkeletonCustomerCard />;
      default:
        return <SkeletonCard lines={3} />;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index}>{renderItem()}</View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.skeleton,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    marginBottom: 12,
  },
  cardBody: {
    marginTop: 12,
  },
  line: {
    marginTop: 8,
  },
  kpiCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  kpiContent: {
    flex: 1,
    marginLeft: 12,
  },
  productCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productContent: {
    flex: 1,
    marginLeft: 12,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderBody: {
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  customerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerContent: {
    flex: 1,
    marginLeft: 12,
  },
  listContainer: {
    padding: 16,
  },
});
