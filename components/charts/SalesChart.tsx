import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { SalesDataPoint } from '@/types';

interface SalesChartProps {
  weekData: SalesDataPoint[];
  monthData: SalesDataPoint[];
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const SalesChart: React.FC<SalesChartProps> = ({ weekData, monthData }) => {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const data = period === 'week' ? weekData : monthData;

  const { maxSales, totalSales, totalOrders } = useMemo(() => {
    const max = Math.max(...data.map((d) => d.sales), 1);
    const total = data.reduce((sum, d) => sum + d.sales, 0);
    const orders = data.reduce((sum, d) => sum + d.orders, 0);
    return { maxSales: max, totalSales: total, totalOrders: orders };
  }, [data]);

  const handlePeriodChange = (newPeriod: 'week' | 'month') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPeriod(newPeriod);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} млн`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)} тыс`;
    }
    return `${amount}`;
  };

  return (
    <View style={styles.container}>
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <Pressable
          style={[styles.periodButton, period === 'week' && styles.periodButtonActive]}
          onPress={() => handlePeriodChange('week')}
        >
          <Text style={[styles.periodText, period === 'week' && styles.periodTextActive]}>
            Неделя
          </Text>
        </Pressable>
        <Pressable
          style={[styles.periodButton, period === 'month' && styles.periodButtonActive]}
          onPress={() => handlePeriodChange('month')}
        >
          <Text style={[styles.periodText, period === 'month' && styles.periodTextActive]}>
            Месяц
          </Text>
        </Pressable>
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Продажи</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalSales)} ₽</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Заказов</Text>
          <Text style={styles.summaryValue}>{totalOrders}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Средний чек</Text>
          <Text style={styles.summaryValue}>
            {totalOrders > 0 ? formatCurrency(Math.round(totalSales / totalOrders)) : 0} ₽
          </Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>{formatCurrency(maxSales)}</Text>
          <Text style={styles.axisLabel}>{formatCurrency(maxSales / 2)}</Text>
          <Text style={styles.axisLabel}>0</Text>
        </View>

        <View style={styles.chart}>
          <View style={styles.gridLines}>
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
          </View>

          <View style={styles.bars}>
            {data.slice(period === 'week' ? 0 : -14).map((item, index) => {
              const heightPercent = (item.sales / maxSales) * 100;
              return (
                <ChartBar
                  key={`${item.date}-${index}`}
                  heightPercent={heightPercent}
                  label={item.label}
                  value={item.sales}
                  isWeek={period === 'week'}
                  index={index}
                />
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

interface ChartBarProps {
  heightPercent: number;
  label: string;
  value: number;
  isWeek: boolean;
  index: number;
}

const ChartBar: React.FC<ChartBarProps> = ({ heightPercent, label, value, isWeek, index }) => {
  const [isPressed, setIsPressed] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPressed(!isPressed);
    scale.value = withSpring(isPressed ? 1 : 1.05);
  };

  return (
    <View style={styles.barContainer}>
      <AnimatedPressable onPress={handlePress} style={[styles.barWrapper, animatedStyle]}>
        {isPressed && (
          <View style={styles.tooltip}>
            <Text style={styles.tooltipText}>
              {value.toLocaleString('ru-RU')} ₽
            </Text>
          </View>
        )}
        <Animated.View
          entering={FadeIn.delay(index * 30).duration(300)}
          style={[
            styles.bar,
            {
              height: `${Math.max(heightPercent, 3)}%`,
              backgroundColor: isPressed ? colors.primaryDark : colors.primary,
            },
          ]}
        />
      </AnimatedPressable>
      {isWeek && <Text style={styles.barLabel}>{label}</Text>}
    </View>
  );
};

// Mini chart for KPI cards
interface MiniChartProps {
  data: number[];
  color?: string;
  height?: number;
}

export const MiniChart: React.FC<MiniChartProps> = ({
  data,
  color = colors.primary,
  height = 40,
}) => {
  const max = Math.max(...data, 1);

  return (
    <View style={[styles.miniChart, { height }]}>
      {data.map((value, index) => {
        const heightPercent = (value / max) * 100;
        return (
          <Animated.View
            key={index}
            entering={FadeIn.delay(index * 20).duration(200)}
            style={[
              styles.miniBar,
              {
                height: `${Math.max(heightPercent, 5)}%`,
                backgroundColor: color,
                opacity: 0.3 + (index / data.length) * 0.7,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

// Price/Stock history chart
interface LineChartProps {
  data: { date: string; value: number }[];
  color?: string;
  height?: number;
  showLabels?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  color = colors.primary,
  height = 120,
  showLabels = true,
  valuePrefix = '',
  valueSuffix = '',
}) => {
  const { min, max, range } = useMemo(() => {
    const values = data.map((d) => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    return { min: minVal, max: maxVal, range: maxVal - minVal || 1 };
  }, [data]);

  const screenWidth = Dimensions.get('window').width - spacing.md * 4;
  const chartWidth = screenWidth;
  const pointSpacing = chartWidth / Math.max(data.length - 1, 1);

  return (
    <View style={[styles.lineChartContainer, { height: height + 40 }]}>
      {showLabels && (
        <View style={styles.lineChartLabels}>
          <Text style={styles.lineChartLabel}>
            {valuePrefix}{max.toLocaleString('ru-RU')}{valueSuffix}
          </Text>
          <Text style={styles.lineChartLabel}>
            {valuePrefix}{min.toLocaleString('ru-RU')}{valueSuffix}
          </Text>
        </View>
      )}
      <View style={[styles.lineChart, { height }]}>
        {/* Grid */}
        <View style={styles.lineChartGrid}>
          <View style={styles.gridLine} />
          <View style={styles.gridLine} />
        </View>

        {/* Points and lines */}
        <Svg width={chartWidth} height={height}>
          {data.length > 1 && (
            <Path
              d={data
                .map((point, index) => {
                  const x = index * pointSpacing;
                  const y = height - ((point.value - min) / range) * (height - 20) - 10;
                  return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ')}
              stroke={color}
              strokeWidth={2}
              fill="none"
            />
          )}
          {data.map((point, index) => {
            const x = index * pointSpacing;
            const y = height - ((point.value - min) / range) * (height - 20) - 10;
            return (
              <Circle
                key={index}
                cx={x}
                cy={y}
                r={4}
                fill={colors.surface}
                stroke={color}
                strokeWidth={2}
              />
            );
          })}
        </Svg>
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxisLabels}>
        {data.filter((_, i) => i % Math.ceil(data.length / 5) === 0).map((point, index) => (
          <Text key={index} style={styles.xAxisLabel}>
            {new Date(point.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
          </Text>
        ))}
      </View>
    </View>
  );
};

// Simple SVG components
const Svg: React.FC<{ children: React.ReactNode; width: number; height: number }> = ({
  children,
  width,
  height,
}) => (
  <View style={{ width, height, position: 'relative' }}>
    {children}
  </View>
);

const Path: React.FC<{
  d: string;
  stroke: string;
  strokeWidth: number;
  fill: string;
}> = ({ d, stroke, strokeWidth }) => {
  // Parse path and create dots for each point
  const points = d.match(/[ML]\s*[\d.]+\s*[\d.]+/g) || [];
  const parsedPoints = points.map((p) => {
    const [, x, y] = p.match(/[ML]\s*([\d.]+)\s*([\d.]+)/) || [];
    return { x: parseFloat(x), y: parseFloat(y) };
  });

  return (
    <View style={StyleSheet.absoluteFill}>
      {parsedPoints.slice(0, -1).map((point, index) => {
        const nextPoint = parsedPoints[index + 1];
        if (!nextPoint) return null;

        const length = Math.sqrt(
          Math.pow(nextPoint.x - point.x, 2) + Math.pow(nextPoint.y - point.y, 2)
        );
        const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);

        return (
          <View
            key={index}
            style={{
              position: 'absolute',
              left: point.x,
              top: point.y - strokeWidth / 2,
              width: length,
              height: strokeWidth,
              backgroundColor: stroke,
              transform: [{ rotate: `${angle}deg` }],
              transformOrigin: 'left center',
            }}
          />
        );
      })}
    </View>
  );
};

const Circle: React.FC<{
  cx: number;
  cy: number;
  r: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}> = ({ cx, cy, r, fill, stroke, strokeWidth }) => (
  <View
    style={{
      position: 'absolute',
      left: cx - r - strokeWidth,
      top: cy - r - strokeWidth,
      width: (r + strokeWidth) * 2,
      height: (r + strokeWidth) * 2,
      borderRadius: r + strokeWidth,
      backgroundColor: fill,
      borderWidth: strokeWidth,
      borderColor: stroke,
    }}
  />
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.md,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  periodButtonActive: {
    backgroundColor: colors.surface,
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
  summary: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.borderLight,
  },
  summaryLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 160,
  },
  yAxis: {
    width: 45,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: spacing.xs,
  },
  axisLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  chart: {
    flex: 1,
    position: 'relative',
  },
  gridLines: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  gridLine: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  bars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: spacing.xs,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  bar: {
    width: '70%',
    maxWidth: 20,
    borderRadius: borderRadius.sm,
    minHeight: 4,
  },
  barLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  tooltip: {
    position: 'absolute',
    top: -24,
    backgroundColor: colors.text,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    zIndex: 10,
  },
  tooltipText: {
    fontSize: 10,
    color: colors.textInverse,
    fontWeight: '500',
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  miniBar: {
    flex: 1,
    borderRadius: 2,
    minWidth: 3,
  },
  lineChartContainer: {
    marginTop: spacing.sm,
  },
  lineChartLabels: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 40,
    width: 50,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 1,
  },
  lineChartLabel: {
    fontSize: 10,
    color: colors.textLight,
  },
  lineChart: {
    marginLeft: 55,
    position: 'relative',
  },
  lineChartGrid: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 55,
    marginTop: spacing.xs,
  },
  xAxisLabel: {
    fontSize: 10,
    color: colors.textLight,
  },
});
