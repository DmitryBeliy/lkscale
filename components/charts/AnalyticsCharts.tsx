import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { RevenueVsProfitData, CategorySalesData, TimePeriod } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Time Period Selector
interface TimePeriodSelectorProps {
  selected: TimePeriod;
  onSelect: (period: TimePeriod) => void;
}

export const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({ selected, onSelect }) => {
  const periods: { key: TimePeriod; label: string }[] = [
    { key: 'today', label: 'Сегодня' },
    { key: '7days', label: '7 дней' },
    { key: '30days', label: '30 дней' },
    { key: 'year', label: 'Год' },
  ];

  return (
    <View style={styles.periodSelector}>
      {periods.map((period) => (
        <Pressable
          key={period.key}
          style={[
            styles.periodButton,
            selected === period.key && styles.periodButtonActive,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelect(period.key);
          }}
        >
          <Text
            style={[
              styles.periodText,
              selected === period.key && styles.periodTextActive,
            ]}
          >
            {period.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

// Revenue vs Profit Line Chart
interface RevenueVsProfitChartProps {
  data: RevenueVsProfitData[];
  height?: number;
}

export const RevenueVsProfitChart: React.FC<RevenueVsProfitChartProps> = ({
  data,
  height = 200,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { maxValue, minValue, totalRevenue, totalProfit, avgMargin } = useMemo(() => {
    const revenues = data.map((d) => d.revenue);
    const profits = data.map((d) => d.profit);
    const allValues = [...revenues, ...profits];
    const max = Math.max(...allValues, 1);
    const min = Math.min(...allValues, 0);
    const totRev = data.reduce((sum, d) => sum + d.revenue, 0);
    const totProf = data.reduce((sum, d) => sum + d.profit, 0);
    const margin = totRev > 0 ? (totProf / totRev) * 100 : 0;
    return { maxValue: max, minValue: min, totalRevenue: totRev, totalProfit: totProf, avgMargin: margin };
  }, [data]);

  const chartWidth = SCREEN_WIDTH - spacing.md * 4 - 50;
  const pointSpacing = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;
  const range = maxValue - minValue || 1;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}М`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}К`;
    return `${amount}`;
  };

  const getY = (value: number) => {
    return height - 30 - ((value - minValue) / range) * (height - 50);
  };

  return (
    <View style={styles.chartContainer}>
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Выручка</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
          <Text style={styles.legendText}>Прибыль</Text>
        </View>
      </View>

      {/* Summary Stats */}
      <View style={styles.chartSummary}>
        <View style={styles.chartSummaryItem}>
          <Text style={styles.chartSummaryLabel}>Выручка</Text>
          <Text style={[styles.chartSummaryValue, { color: colors.primary }]}>
            {formatCurrency(totalRevenue)} ₽
          </Text>
        </View>
        <View style={styles.chartSummaryDivider} />
        <View style={styles.chartSummaryItem}>
          <Text style={styles.chartSummaryLabel}>Прибыль</Text>
          <Text style={[styles.chartSummaryValue, { color: colors.success }]}>
            {formatCurrency(totalProfit)} ₽
          </Text>
        </View>
        <View style={styles.chartSummaryDivider} />
        <View style={styles.chartSummaryItem}>
          <Text style={styles.chartSummaryLabel}>Маржа</Text>
          <Text style={[styles.chartSummaryValue, { color: colors.warning }]}>
            {avgMargin.toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Chart Area */}
      <View style={[styles.chartArea, { height }]}>
        {/* Y-Axis Labels */}
        <View style={styles.yAxisLabels}>
          <Text style={styles.axisLabel}>{formatCurrency(maxValue)}</Text>
          <Text style={styles.axisLabel}>{formatCurrency((maxValue + minValue) / 2)}</Text>
          <Text style={styles.axisLabel}>{formatCurrency(minValue)}</Text>
        </View>

        {/* Chart */}
        <View style={styles.chartContent}>
          {/* Grid Lines */}
          <View style={styles.gridLines}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.gridLine} />
            ))}
          </View>

          {/* Lines and Points */}
          <View style={[StyleSheet.absoluteFill, { paddingTop: 10, paddingBottom: 30 }]}>
            {/* Revenue Line */}
            {data.length > 1 && data.slice(0, -1).map((point, index) => {
              const nextPoint = data[index + 1];
              const x1 = index * pointSpacing;
              const y1 = getY(point.revenue);
              const x2 = (index + 1) * pointSpacing;
              const y2 = getY(nextPoint.revenue);
              const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
              const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

              return (
                <Animated.View
                  key={`rev-line-${index}`}
                  entering={FadeIn.delay(index * 50).duration(300)}
                  style={{
                    position: 'absolute',
                    left: x1,
                    top: y1,
                    width: length,
                    height: 3,
                    backgroundColor: colors.primary,
                    transform: [{ rotate: `${angle}deg` }],
                    transformOrigin: 'left center',
                    borderRadius: 1.5,
                  }}
                />
              );
            })}

            {/* Profit Line */}
            {data.length > 1 && data.slice(0, -1).map((point, index) => {
              const nextPoint = data[index + 1];
              const x1 = index * pointSpacing;
              const y1 = getY(point.profit);
              const x2 = (index + 1) * pointSpacing;
              const y2 = getY(nextPoint.profit);
              const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
              const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

              return (
                <Animated.View
                  key={`prof-line-${index}`}
                  entering={FadeIn.delay(index * 50 + 100).duration(300)}
                  style={{
                    position: 'absolute',
                    left: x1,
                    top: y1,
                    width: length,
                    height: 3,
                    backgroundColor: colors.success,
                    transform: [{ rotate: `${angle}deg` }],
                    transformOrigin: 'left center',
                    borderRadius: 1.5,
                  }}
                />
              );
            })}

            {/* Interactive Points */}
            {data.map((point, index) => {
              const x = index * pointSpacing;
              const yRev = getY(point.revenue);
              const yProf = getY(point.profit);
              const isActive = activeIndex === index;

              return (
                <Pressable
                  key={`point-${index}`}
                  style={{
                    position: 'absolute',
                    left: x - 20,
                    top: Math.min(yRev, yProf) - 20,
                    width: 40,
                    height: Math.abs(yRev - yProf) + 40,
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveIndex(isActive ? null : index);
                  }}
                >
                  {/* Revenue Point */}
                  <View
                    style={[
                      styles.chartPoint,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.primary,
                        position: 'absolute',
                        top: yRev - Math.min(yRev, yProf) + 20 - 6,
                        transform: [{ scale: isActive ? 1.3 : 1 }],
                      },
                    ]}
                  />
                  {/* Profit Point */}
                  <View
                    style={[
                      styles.chartPoint,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.success,
                        position: 'absolute',
                        top: yProf - Math.min(yRev, yProf) + 20 - 6,
                        transform: [{ scale: isActive ? 1.3 : 1 }],
                      },
                    ]}
                  />

                  {/* Tooltip */}
                  {isActive && (
                    <Animated.View
                      entering={FadeIn.duration(200)}
                      style={styles.chartTooltip}
                    >
                      <Text style={styles.tooltipTitle}>{point.label}</Text>
                      <Text style={[styles.tooltipValue, { color: colors.primary }]}>
                        Выручка: {point.revenue.toLocaleString('ru-RU')} ₽
                      </Text>
                      <Text style={[styles.tooltipValue, { color: colors.success }]}>
                        Прибыль: {point.profit.toLocaleString('ru-RU')} ₽
                      </Text>
                    </Animated.View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* X-Axis Labels */}
          <View style={styles.xAxisLabels}>
            {data.filter((_, i) => i % Math.max(1, Math.ceil(data.length / 6)) === 0).map((point, index) => (
              <Text key={index} style={styles.axisLabel}>
                {point.label}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

// Sales by Category Pie Chart
interface CategoryPieChartProps {
  data: CategorySalesData[];
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = useMemo(() => data.reduce((sum, d) => sum + d.sales, 0), [data]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}М`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}К`;
    return `${amount}`;
  };

  // Calculate pie segments
  const segments = useMemo(() => {
    let startAngle = -90; // Start from top
    return data.map((item, index) => {
      const angle = (item.sales / total) * 360;
      const segment = {
        ...item,
        startAngle,
        endAngle: startAngle + angle,
        midAngle: startAngle + angle / 2,
      };
      startAngle += angle;
      return segment;
    });
  }, [data, total]);

  const PIE_SIZE = Math.min(SCREEN_WIDTH - spacing.md * 4, 200);
  const CENTER = PIE_SIZE / 2;
  const RADIUS = PIE_SIZE / 2 - 10;
  const INNER_RADIUS = RADIUS * 0.55;

  return (
    <View style={styles.pieContainer}>
      {/* Pie Chart */}
      <View style={styles.pieChartWrapper}>
        <View style={[styles.pieChart, { width: PIE_SIZE, height: PIE_SIZE }]}>
          {segments.map((segment, index) => {
            const isActive = activeIndex === index;
            return (
              <PieSegment
                key={segment.category}
                startAngle={segment.startAngle}
                endAngle={segment.endAngle}
                color={segment.color}
                center={CENTER}
                radius={RADIUS}
                innerRadius={INNER_RADIUS}
                isActive={isActive}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveIndex(isActive ? null : index);
                }}
                index={index}
              />
            );
          })}

          {/* Center Content */}
          <View style={[styles.pieCenter, { width: INNER_RADIUS * 2, height: INNER_RADIUS * 2 }]}>
            {activeIndex !== null ? (
              <Animated.View entering={FadeIn.duration(200)} style={styles.pieCenterContent}>
                <Text style={[styles.pieCenterValue, { color: segments[activeIndex].color }]}>
                  {segments[activeIndex].percentage.toFixed(1)}%
                </Text>
                <Text style={styles.pieCenterLabel} numberOfLines={2}>
                  {segments[activeIndex].category}
                </Text>
              </Animated.View>
            ) : (
              <View style={styles.pieCenterContent}>
                <Text style={styles.pieCenterValue}>{formatCurrency(total)} ₽</Text>
                <Text style={styles.pieCenterLabel}>Всего</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.pieLegend}>
        {data.map((item, index) => (
          <Pressable
            key={item.category}
            style={[
              styles.pieLegendItem,
              activeIndex === index && styles.pieLegendItemActive,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveIndex(activeIndex === index ? null : index);
            }}
          >
            <View style={[styles.pieLegendDot, { backgroundColor: item.color }]} />
            <View style={styles.pieLegendContent}>
              <Text style={styles.pieLegendCategory} numberOfLines={1}>
                {item.category}
              </Text>
              <Text style={styles.pieLegendValue}>
                {formatCurrency(item.sales)} ₽ ({item.percentage.toFixed(1)}%)
              </Text>
            </View>
            <Text style={styles.pieLegendCount}>{item.count} шт.</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

// Pie Segment Component
interface PieSegmentProps {
  startAngle: number;
  endAngle: number;
  color: string;
  center: number;
  radius: number;
  innerRadius: number;
  isActive: boolean;
  onPress: () => void;
  index: number;
}

const PieSegment: React.FC<PieSegmentProps> = ({
  startAngle,
  endAngle,
  color,
  center,
  radius,
  innerRadius,
  isActive,
  onPress,
  index,
}) => {
  const scale = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withTiming(1, { duration: 500 + index * 100 });
  }, [index, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: isActive ? 1.05 : 1 },
    ],
    opacity: scale.value,
  }));

  // Calculate segment path points
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const angleRange = endAngle - startAngle;

  // Create arc using multiple small lines for smooth curve
  const createArc = () => {
    const segments = Math.max(Math.ceil(angleRange / 10), 1);
    const angleStep = (endRad - startRad) / segments;

    const views = [];
    for (let i = 0; i <= segments; i++) {
      const angle = startRad + i * angleStep;
      const nextAngle = startRad + (i + 1) * angleStep;

      if (i < segments) {
        const x1 = center + Math.cos(angle) * innerRadius;
        const y1 = center + Math.sin(angle) * innerRadius;
        const x2 = center + Math.cos(angle) * radius;
        const y2 = center + Math.sin(angle) * radius;
        const x3 = center + Math.cos(nextAngle) * radius;
        const y3 = center + Math.sin(nextAngle) * radius;
        const x4 = center + Math.cos(nextAngle) * innerRadius;
        const y4 = center + Math.sin(nextAngle) * innerRadius;

        // Draw a trapezoid for each segment
        const midX = (x1 + x2 + x3 + x4) / 4;
        const midY = (y1 + y2 + y3 + y4) / 4;
        const width = radius - innerRadius;
        const segmentAngle = (angle + angleStep / 2) * (180 / Math.PI);

        views.push(
          <View
            key={i}
            style={{
              position: 'absolute',
              left: center + Math.cos(angle + angleStep / 2) * ((innerRadius + radius) / 2) - width / 2,
              top: center + Math.sin(angle + angleStep / 2) * ((innerRadius + radius) / 2) - 3,
              width: width + 2,
              height: 8,
              backgroundColor: color,
              transform: [{ rotate: `${segmentAngle}deg` }],
            }}
          />
        );
      }
    }
    return views;
  };

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
      <Pressable onPress={onPress} style={StyleSheet.absoluteFill}>
        {createArc()}
      </Pressable>
    </Animated.View>
  );
};

// Empty State Component
interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <Animated.View entering={FadeInDown.duration(500)} style={styles.emptyState}>
      <View style={styles.emptyStateIcon}>
        <Ionicons name={icon} size={48} color={colors.textLight} />
      </View>
      <Text style={styles.emptyStateTitle}>{title}</Text>
      <Text style={styles.emptyStateDescription}>{description}</Text>
      {action && (
        <Pressable style={styles.emptyStateButton} onPress={action.onPress}>
          <Text style={styles.emptyStateButtonText}>{action.label}</Text>
        </Pressable>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  periodButtonActive: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  periodText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  periodTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  chartSummary: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  chartSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  chartSummaryDivider: {
    width: 1,
    backgroundColor: colors.borderLight,
  },
  chartSummaryLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  chartSummaryValue: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
  },
  chartArea: {
    flexDirection: 'row',
  },
  yAxisLabels: {
    width: 45,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: spacing.xs,
    paddingVertical: 10,
  },
  axisLabel: {
    fontSize: 10,
    color: colors.textLight,
  },
  chartContent: {
    flex: 1,
    position: 'relative',
  },
  gridLines: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  gridLine: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  xAxisLabels: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartPoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
  },
  chartTooltip: {
    position: 'absolute',
    top: -80,
    backgroundColor: colors.text,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    minWidth: 120,
    zIndex: 100,
    ...shadows.lg,
  },
  tooltipTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textInverse,
    marginBottom: 4,
  },
  tooltipValue: {
    fontSize: 10,
    fontWeight: '500',
  },
  pieContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  pieChartWrapper: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pieChart: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieCenter: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  pieCenterContent: {
    alignItems: 'center',
  },
  pieCenterValue: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  pieCenterLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  pieLegend: {
    gap: spacing.xs,
  },
  pieLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
  },
  pieLegendItemActive: {
    backgroundColor: `${colors.primary}10`,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  pieLegendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  pieLegendContent: {
    flex: 1,
  },
  pieLegendCategory: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.text,
  },
  pieLegendValue: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  pieLegendCount: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyStateIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.textLight}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyStateTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sizes.sm * 1.5,
    maxWidth: 280,
  },
  emptyStateButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  emptyStateButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textInverse,
  },
});
