import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui';
import { SalesTrend, CategoryPerformance, ProfitMarginData } from '@/types/enterprise';
import { ExpenseBreakdown } from '@/types/enterprise';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============== LINE CHART FOR SALES TRENDS ==============

interface LineChartProps {
  data: SalesTrend[];
  showProfit?: boolean;
  height?: number;
}

export const SalesTrendChart: React.FC<LineChartProps> = ({
  data,
  showProfit = true,
  height = 200,
}) => {
  const { colors, spacing, typography } = useTheme();
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  const chartWidth = SCREEN_WIDTH - spacing.md * 4;
  const chartHeight = height - 60;

  const { maxValue, minValue, points, profitPoints } = useMemo(() => {
    if (data.length === 0) return { maxValue: 100000, minValue: 0, points: [], profitPoints: [] };

    const revenues = data.map(d => d.revenue);
    const profits = data.map(d => d.profit);
    const allValues = [...revenues, ...profits];
    const max = Math.max(...allValues) * 1.1;
    const min = Math.min(0, Math.min(...allValues));

    const calculatePoints = (values: number[]) =>
      values.map((val, i) => ({
        x: (i / (values.length - 1)) * chartWidth,
        y: chartHeight - ((val - min) / (max - min)) * chartHeight,
        value: val,
      }));

    return {
      maxValue: max,
      minValue: min,
      points: calculatePoints(revenues),
      profitPoints: calculatePoints(profits),
    };
  }, [data, chartWidth, chartHeight]);

  const createPath = (pts: Array<{ x: number; y: number }>) => {
    if (pts.length === 0) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  return (
    <Card style={{ padding: spacing.md }}>
      <View style={{ height }}>
        {/* Y-axis labels */}
        <View style={{ position: 'absolute', left: 0, top: 0, bottom: 40 }}>
          {[0, 0.5, 1].map((ratio, i) => (
            <View key={i} style={{ position: 'absolute', top: (1 - ratio) * chartHeight - 8, left: 0 }}>
              <Text style={{ fontSize: typography.sizes.xs, color: colors.textLight }}>
                {((minValue + (maxValue - minValue) * ratio) / 1000).toFixed(0)}K
              </Text>
            </View>
          ))}
        </View>

        {/* Chart area */}
        <View style={{ marginLeft: 35, marginTop: 10 }}>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((ratio, i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                top: (1 - ratio) * chartHeight,
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: colors.borderLight,
              }}
            />
          ))}

          {/* Revenue line (using View-based approach) */}
          {points.map((point, i) => (
            <React.Fragment key={`rev-${i}`}>
              {i > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    left: points[i - 1].x,
                    top: Math.min(points[i - 1].y, point.y),
                    width: Math.sqrt(
                      Math.pow(point.x - points[i - 1].x, 2) +
                      Math.pow(point.y - points[i - 1].y, 2)
                    ),
                    height: 3,
                    backgroundColor: colors.chart1,
                    borderRadius: 1.5,
                    transform: [
                      {
                        rotate: `${Math.atan2(
                          point.y - points[i - 1].y,
                          point.x - points[i - 1].x
                        )}rad`,
                      },
                    ],
                    transformOrigin: 'left center',
                  }}
                />
              )}
              <Pressable
                onPress={() => setSelectedPoint(selectedPoint === i ? null : i)}
                style={{
                  position: 'absolute',
                  left: point.x - 8,
                  top: point.y - 8,
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: colors.chart1,
                  borderWidth: 3,
                  borderColor: colors.surface,
                  zIndex: 10,
                }}
              />
            </React.Fragment>
          ))}

          {/* Profit line */}
          {showProfit && profitPoints.map((point, i) => (
            <React.Fragment key={`prof-${i}`}>
              {i > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    left: profitPoints[i - 1].x,
                    top: Math.min(profitPoints[i - 1].y, point.y),
                    width: Math.sqrt(
                      Math.pow(point.x - profitPoints[i - 1].x, 2) +
                      Math.pow(point.y - profitPoints[i - 1].y, 2)
                    ),
                    height: 2,
                    backgroundColor: colors.chart2,
                    borderRadius: 1,
                    transform: [
                      {
                        rotate: `${Math.atan2(
                          point.y - profitPoints[i - 1].y,
                          point.x - profitPoints[i - 1].x
                        )}rad`,
                      },
                    ],
                    transformOrigin: 'left center',
                  }}
                />
              )}
            </React.Fragment>
          ))}

          {/* Selected point tooltip */}
          {selectedPoint !== null && data[selectedPoint] && (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={{
                position: 'absolute',
                left: points[selectedPoint].x - 60,
                top: points[selectedPoint].y - 65,
                backgroundColor: colors.card,
                borderRadius: 8,
                padding: spacing.sm,
                ...StyleSheet.flatten({
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 4,
                }),
                zIndex: 20,
              }}
            >
              <Text style={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                {data[selectedPoint].date}
              </Text>
              <Text style={{ fontSize: typography.sizes.sm, fontWeight: '600', color: colors.chart1 }}>
                {(data[selectedPoint].revenue / 1000).toFixed(0)}K ₽
              </Text>
              {showProfit && (
                <Text style={{ fontSize: typography.sizes.xs, color: colors.chart2 }}>
                  Прибыль: {(data[selectedPoint].profit / 1000).toFixed(0)}K ₽
                </Text>
              )}
            </Animated.View>
          )}
        </View>

        {/* X-axis labels */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft: 35, marginTop: 5 }}>
          {data.filter((_, i) => i % Math.ceil(data.length / 7) === 0).map((d, i) => (
            <Text key={i} style={{ fontSize: typography.sizes.xs, color: colors.textLight }}>
              {d.date.slice(5)}
            </Text>
          ))}
        </View>

        {/* Legend */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.sm, gap: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 12, height: 3, backgroundColor: colors.chart1, borderRadius: 2, marginRight: 6 }} />
            <Text style={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Выручка</Text>
          </View>
          {showProfit && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 12, height: 2, backgroundColor: colors.chart2, borderRadius: 1, marginRight: 6 }} />
              <Text style={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>Прибыль</Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
};

// ============== PIE CHART FOR CATEGORY PERFORMANCE ==============

interface PieChartProps {
  data: CategoryPerformance[];
  size?: number;
  showLegend?: boolean;
}

export const CategoryPieChart: React.FC<PieChartProps> = ({
  data,
  size = 180,
  showLegend = true,
}) => {
  const { colors, spacing, typography } = useTheme();
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);

  const total = data.reduce((sum, d) => sum + d.revenue, 0);
  const center = size / 2;
  const radius = size / 2 - 10;
  const innerRadius = radius * 0.6;

  const segments = useMemo(() => {
    let startAngle = -90;
    return data.map((item, i) => {
      const percentage = (item.revenue / total) * 100;
      const sweepAngle = (percentage / 100) * 360;
      const midAngle = startAngle + sweepAngle / 2;

      const segment = {
        ...item,
        startAngle,
        endAngle: startAngle + sweepAngle,
        sweepAngle,
        midAngle,
        percentage,
        // Calculate arc path points
        startX: center + radius * Math.cos((startAngle * Math.PI) / 180),
        startY: center + radius * Math.sin((startAngle * Math.PI) / 180),
        endX: center + radius * Math.cos(((startAngle + sweepAngle) * Math.PI) / 180),
        endY: center + radius * Math.sin(((startAngle + sweepAngle) * Math.PI) / 180),
        innerStartX: center + innerRadius * Math.cos((startAngle * Math.PI) / 180),
        innerStartY: center + innerRadius * Math.sin((startAngle * Math.PI) / 180),
        innerEndX: center + innerRadius * Math.cos(((startAngle + sweepAngle) * Math.PI) / 180),
        innerEndY: center + innerRadius * Math.sin(((startAngle + sweepAngle) * Math.PI) / 180),
      };

      startAngle += sweepAngle;
      return segment;
    });
  }, [data, total, center, radius, innerRadius]);

  return (
    <Card style={{ padding: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Pie Chart */}
        <View style={{ width: size, height: size, position: 'relative' }}>
          {segments.map((seg, i) => {
            const isSelected = selectedSegment === i;
            const scale = isSelected ? 1.05 : 1;

            // Create segment using View-based approach with rotation
            const angle = seg.sweepAngle || (seg.endAngle - seg.startAngle);
            if (angle <= 0) return null;

            return (
              <Pressable
                key={i}
                onPress={() => setSelectedSegment(isSelected ? null : i)}
                style={{
                  position: 'absolute',
                  left: center - radius,
                  top: center - radius,
                  width: radius * 2,
                  height: radius * 2,
                  transform: [{ scale }],
                }}
              >
                {/* Segment background - simplified visual representation */}
                <View
                  style={{
                    position: 'absolute',
                    left: radius - 2,
                    top: 0,
                    width: 4,
                    height: radius,
                    backgroundColor: seg.color,
                    borderTopLeftRadius: 2,
                    borderTopRightRadius: 2,
                    transform: [
                      { translateY: radius / 2 },
                      { rotate: `${seg.startAngle + 90}deg` },
                      { translateY: -radius / 2 },
                    ],
                    transformOrigin: 'center bottom',
                  }}
                />
              </Pressable>
            );
          })}

          {/* Center circle */}
          <View
            style={{
              position: 'absolute',
              left: center - innerRadius,
              top: center - innerRadius,
              width: innerRadius * 2,
              height: innerRadius * 2,
              borderRadius: innerRadius,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {selectedSegment !== null ? (
              <>
                <Text style={{ fontSize: typography.sizes.xl, fontWeight: '700', color: colors.text }}>
                  {segments[selectedSegment].percentage.toFixed(1)}%
                </Text>
                <Text style={{ fontSize: typography.sizes.xs, color: colors.textSecondary }} numberOfLines={1}>
                  {segments[selectedSegment].category}
                </Text>
              </>
            ) : (
              <>
                <Text style={{ fontSize: typography.sizes.lg, fontWeight: '700', color: colors.text }}>
                  {(total / 1000).toFixed(0)}K
                </Text>
                <Text style={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                  Всего ₽
                </Text>
              </>
            )}
          </View>

          {/* Visual segments using borders */}
          {segments.map((seg, i) => {
            const percentage = seg.percentage;
            return (
              <Pressable
                key={`border-${i}`}
                onPress={() => setSelectedSegment(selectedSegment === i ? null : i)}
                style={{
                  position: 'absolute',
                  left: 10,
                  top: 10,
                  width: size - 20,
                  height: size - 20,
                  borderRadius: (size - 20) / 2,
                  borderWidth: (radius - innerRadius),
                  borderColor: 'transparent',
                  borderTopColor: seg.color,
                  borderRightColor: percentage > 25 ? seg.color : 'transparent',
                  borderBottomColor: percentage > 50 ? seg.color : 'transparent',
                  borderLeftColor: percentage > 75 ? seg.color : 'transparent',
                  transform: [{ rotate: `${seg.startAngle + 90}deg` }],
                  opacity: selectedSegment === null || selectedSegment === i ? 1 : 0.5,
                }}
              />
            );
          })}
        </View>

        {/* Legend */}
        {showLegend && (
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            {data.slice(0, 5).map((item, i) => (
              <Pressable
                key={i}
                onPress={() => setSelectedSegment(selectedSegment === i ? null : i)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: spacing.xs,
                  opacity: selectedSegment === null || selectedSegment === i ? 1 : 0.5,
                }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: item.color,
                    marginRight: spacing.sm,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: typography.sizes.sm,
                      fontWeight: selectedSegment === i ? '600' : '400',
                      color: colors.text,
                    }}
                    numberOfLines={1}
                  >
                    {item.category}
                  </Text>
                  <Text style={{ fontSize: typography.sizes.xs, color: colors.textSecondary }}>
                    {(item.revenue / 1000).toFixed(0)}K ₽ • {((item.revenue / total) * 100).toFixed(1)}%
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons
                    name={item.growth >= 0 ? 'trending-up' : 'trending-down'}
                    size={14}
                    color={item.growth >= 0 ? colors.success : colors.error}
                  />
                  <Text
                    style={{
                      fontSize: typography.sizes.xs,
                      color: item.growth >= 0 ? colors.success : colors.error,
                      marginLeft: 2,
                    }}
                  >
                    {Math.abs(item.growth).toFixed(1)}%
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </Card>
  );
};

// ============== BAR CHART FOR EXPENSES ==============

interface BarChartProps {
  data: ExpenseBreakdown;
  height?: number;
}

export const ExpenseBarChart: React.FC<BarChartProps> = ({ data, height = 200 }) => {
  const { colors, spacing, typography, borderRadius: br } = useTheme();

  const expenseItems = Object.entries(data)
    .map(([category, amount]) => ({ category, amount }))
    .filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);

  const maxAmount = Math.max(...expenseItems.map(e => e.amount), 1);

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      rent: 'Аренда',
      salaries: 'Зарплаты',
      utilities: 'Коммуналка',
      taxes: 'Налоги',
      inventory: 'Закупки',
      marketing: 'Маркетинг',
      equipment: 'Оборудование',
      supplies: 'Расходники',
      insurance: 'Страхование',
      maintenance: 'Ремонт',
      delivery: 'Доставка',
      banking: 'Банк',
      other: 'Прочее',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string): string => {
    const categoryColors: Record<string, string> = {
      rent: colors.chart4,
      salaries: colors.chart1,
      utilities: colors.chart3,
      taxes: colors.chart5,
      inventory: colors.chart2,
      marketing: colors.chart6,
      equipment: colors.warning,
      supplies: colors.textSecondary,
      insurance: colors.success,
      maintenance: colors.info,
      delivery: colors.error,
      banking: colors.textLight,
      other: colors.textSecondary,
    };
    return categoryColors[category] || colors.chart1;
  };

  return (
    <Card style={{ padding: spacing.md }}>
      <View style={{ height }}>
        {expenseItems.map((item, i) => {
          const barWidth = (item.amount / maxAmount) * 100;
          return (
            <Animated.View
              key={item.category}
              entering={FadeInDown.delay(i * 50).duration(300)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: spacing.sm,
              }}
            >
              <Text
                style={{
                  width: 80,
                  fontSize: typography.sizes.xs,
                  color: colors.textSecondary,
                }}
                numberOfLines={1}
              >
                {getCategoryLabel(item.category)}
              </Text>
              <View style={{ flex: 1, marginHorizontal: spacing.sm }}>
                <View
                  style={{
                    height: 24,
                    backgroundColor: colors.borderLight,
                    borderRadius: br.sm,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      width: `${barWidth}%`,
                      height: '100%',
                      backgroundColor: getCategoryColor(item.category),
                      borderRadius: br.sm,
                    }}
                  />
                </View>
              </View>
              <Text
                style={{
                  width: 65,
                  fontSize: typography.sizes.xs,
                  fontWeight: '600',
                  color: colors.text,
                  textAlign: 'right',
                }}
              >
                {(item.amount / 1000).toFixed(0)}K ₽
              </Text>
            </Animated.View>
          );
        })}
      </View>
    </Card>
  );
};

// ============== PROFIT MARGIN GAUGE ==============

interface GaugeProps {
  value: number;
  maxValue?: number;
  label: string;
  color?: string;
  size?: number;
}

export const ProfitGauge: React.FC<GaugeProps> = ({
  value,
  maxValue = 100,
  label,
  color,
  size = 100,
}) => {
  const { colors, typography } = useTheme();
  const gaugeColor = color || colors.success;
  const percentage = Math.min((value / maxValue) * 100, 100);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference * 0.75;

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: size, height: size * 0.75, position: 'relative' }}>
        {/* Background arc */}
        <View
          style={{
            position: 'absolute',
            left: 10,
            top: 10,
            width: size - 20,
            height: size - 20,
            borderRadius: (size - 20) / 2,
            borderWidth: 8,
            borderColor: colors.borderLight,
            borderBottomColor: 'transparent',
            transform: [{ rotate: '45deg' }],
          }}
        />
        {/* Value arc */}
        <View
          style={{
            position: 'absolute',
            left: 10,
            top: 10,
            width: size - 20,
            height: size - 20,
            borderRadius: (size - 20) / 2,
            borderWidth: 8,
            borderColor: gaugeColor,
            borderBottomColor: 'transparent',
            borderLeftColor: percentage > 50 ? gaugeColor : 'transparent',
            transform: [{ rotate: '45deg' }],
          }}
        />
        {/* Center value */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: size * 0.3,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: typography.sizes.xxl, fontWeight: '700', color: colors.text }}>
            {value.toFixed(1)}%
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: typography.sizes.sm, color: colors.textSecondary, marginTop: -5 }}>
        {label}
      </Text>
    </View>
  );
};

// ============== KPI METRIC CARD ==============

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  onPress?: () => void;
}

export const ExecutiveMetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
  onPress,
}) => {
  const { colors, spacing, typography, borderRadius: br, shadows: sh } = useTheme();
  const iconColor = color || colors.primary;

  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      <Card style={{ padding: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: typography.sizes.sm, color: colors.textSecondary, marginBottom: spacing.xs }}>
              {title}
            </Text>
            <Text style={{ fontSize: typography.sizes.xxl, fontWeight: '700', color: colors.text }}>
              {value}
            </Text>
            {change !== undefined && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs }}>
                <Ionicons
                  name={change >= 0 ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={change >= 0 ? colors.success : colors.error}
                />
                <Text
                  style={{
                    fontSize: typography.sizes.xs,
                    color: change >= 0 ? colors.success : colors.error,
                    marginLeft: 4,
                    fontWeight: '500',
                  }}
                >
                  {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                </Text>
              </View>
            )}
          </View>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: br.md,
              backgroundColor: `${iconColor}15`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name={icon} size={22} color={iconColor} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
};
