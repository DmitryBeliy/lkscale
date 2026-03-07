import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/localization';
import { useTextGeneration } from '@fastshot/ai';
import {
  SecurityEvent,
  getSecurityEvents,
  generateMockSecurityEvents,
  addSecurityEvent,
} from '@/services/securityService';

type FilterType = 'all' | 'critical' | 'high' | 'medium' | 'low';

export default function SecurityLogScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, typography, borderRadius, shadows, isDark } = useTheme();
  const { language } = useLocalization();

  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState<string | null>(null);

  const { generateText } = useTextGeneration();

  const t = {
    title: language === 'ru' ? 'Журнал безопасности' : 'Security Log',
    subtitle: language === 'ru' ? 'AI мониторинг активности' : 'AI activity monitoring',
    all: language === 'ru' ? 'Все' : 'All',
    critical: language === 'ru' ? 'Критические' : 'Critical',
    high: language === 'ru' ? 'Высокие' : 'High',
    medium: language === 'ru' ? 'Средние' : 'Medium',
    low: language === 'ru' ? 'Низкие' : 'Low',
    aiAnalysis: language === 'ru' ? 'AI анализ' : 'AI Analysis',
    analyzeWithAI: language === 'ru' ? 'Проанализировать AI' : 'Analyze with AI',
    noEvents: language === 'ru' ? 'Нет событий безопасности' : 'No security events',
    overview: language === 'ru' ? 'Обзор' : 'Overview',
    totalEvents: language === 'ru' ? 'Всего событий' : 'Total Events',
    criticalCount: language === 'ru' ? 'Критические' : 'Critical',
    last24h: language === 'ru' ? 'За 24 часа' : 'Last 24h',
    riskLevel: language === 'ru' ? 'Уровень риска' : 'Risk Level',
    safe: language === 'ru' ? 'Безопасно' : 'Safe',
    caution: language === 'ru' ? 'Осторожно' : 'Caution',
    danger: language === 'ru' ? 'Опасно' : 'Danger',
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      let data = await getSecurityEvents();
      if (data.length === 0) {
        const mockEvents = generateMockSecurityEvents();
        for (const event of mockEvents) {
          await addSecurityEvent(event);
        }
        data = mockEvents;
      }
      setEvents(data);
    } catch (error) {
      console.error('Error loading security events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadEvents();
    setIsRefreshing(false);
  }, []);

  const handleAIAnalyze = useCallback(async (event: SecurityEvent) => {
    if (event.aiAnalysis) return;
    setAiAnalyzing(event.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const prompt = language === 'ru'
      ? `Проанализируй событие безопасности в розничном магазине и дай краткую оценку риска (2-3 предложения на русском):
Тип: ${event.type}, Серьёзность: ${event.severity}
Описание: ${event.description}
Пользователь: ${event.userName}`
      : `Analyze this retail store security event and provide a brief risk assessment (2-3 sentences):
Type: ${event.type}, Severity: ${event.severity}
Description: ${event.description}
User: ${event.userName}`;

    try {
      const analysis = await generateText(prompt);
      if (analysis) {
        setEvents((prev) =>
          prev.map((e) => (e.id === event.id ? { ...e, aiAnalysis: analysis } : e))
        );
      }
    } catch (error) {
      console.error('AI analysis error:', error);
    } finally {
      setAiAnalyzing(null);
    }
  }, [language, generateText]);

  const filteredEvents = events.filter((e) => {
    if (filter === 'all') return true;
    return e.severity === filter;
  });

  const criticalCount = events.filter((e) => e.severity === 'critical').length;
  const highCount = events.filter((e) => e.severity === 'high').length;
  const last24hCount = events.filter((e) => {
    const eventTime = new Date(e.timestamp).getTime();
    return Date.now() - eventTime < 86400000;
  }).length;

  const getRiskLevel = () => {
    if (criticalCount > 0) return { label: t.danger, color: colors.error, icon: 'alert-circle' as const };
    if (highCount > 0) return { label: t.caution, color: colors.warning, icon: 'warning' as const };
    return { label: t.safe, color: colors.success, icon: 'shield-checkmark' as const };
  };

  const risk = getRiskLevel();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return colors.error;
      case 'high':
        return '#F59E0B';
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.success;
      default:
        return colors.textLight;
    }
  };

  const getEventIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'login':
        return 'log-in-outline';
      case 'logout':
        return 'log-out-outline';
      case 'data_access':
        return 'document-outline';
      case 'bulk_delete':
        return 'trash-outline';
      case 'permission_change':
        return 'key-outline';
      case 'suspicious_activity':
        return 'warning-outline';
      case 'settings_changed':
        return 'settings-outline';
      default:
        return 'alert-circle-outline';
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor(diff / 60000);

    if (minutes < 60) {
      return language === 'ru' ? `${minutes} мин. назад` : `${minutes}m ago`;
    }
    if (hours < 24) {
      return language === 'ru' ? `${hours} ч. назад` : `${hours}h ago`;
    }
    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { padding: spacing.md }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surface, borderRadius: borderRadius.full }]}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text, fontSize: typography.sizes.xl }]}>
            {t.title}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
            {t.subtitle}
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { padding: spacing.md, paddingBottom: spacing.xxl }]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {/* Overview Cards */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={[styles.overviewGrid, { marginBottom: spacing.lg }]}>
            <Card style={[styles.overviewCard, { flex: 1, marginRight: spacing.sm }]}>
              <Text style={[styles.overviewValue, { color: colors.text, fontSize: typography.sizes.xxl }]}>
                {events.length}
              </Text>
              <Text style={[styles.overviewLabel, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                {t.totalEvents}
              </Text>
            </Card>
            <Card style={[styles.overviewCard, { flex: 1, marginRight: spacing.sm }]}>
              <Text style={[styles.overviewValue, { color: colors.error, fontSize: typography.sizes.xxl }]}>
                {criticalCount}
              </Text>
              <Text style={[styles.overviewLabel, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                {t.criticalCount}
              </Text>
            </Card>
            <Card style={[styles.overviewCard, { flex: 1 }]}>
              <Text style={[styles.overviewValue, { color: colors.primary, fontSize: typography.sizes.xxl }]}>
                {last24hCount}
              </Text>
              <Text style={[styles.overviewLabel, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                {t.last24h}
              </Text>
            </Card>
          </View>
        </Animated.View>

        {/* Risk Level */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <Card style={[styles.riskCard, { borderLeftColor: risk.color, marginBottom: spacing.lg }]}>
            <View style={styles.riskContent}>
              <Ionicons name={risk.icon} size={28} color={risk.color} />
              <View style={styles.riskInfo}>
                <Text style={[styles.riskLabel, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                  {t.riskLevel}
                </Text>
                <Text style={[styles.riskValue, { color: risk.color, fontSize: typography.sizes.lg }]}>
                  {risk.label}
                </Text>
              </View>
              <LinearGradient
                colors={[`${risk.color}20`, `${risk.color}05`]}
                style={[styles.riskBadge, { borderRadius: borderRadius.lg }]}
              >
                <Ionicons name="sparkles" size={16} color={risk.color} />
                <Text style={[styles.riskBadgeText, { color: risk.color, fontSize: typography.sizes.xs }]}>
                  {t.aiAnalysis}
                </Text>
              </LinearGradient>
            </View>
          </Card>
        </Animated.View>

        {/* Filters */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.filterScroll, { marginBottom: spacing.md }]}
          >
            {[
              { key: 'all' as FilterType, label: t.all },
              { key: 'critical' as FilterType, label: t.critical },
              { key: 'high' as FilterType, label: t.high },
              { key: 'medium' as FilterType, label: t.medium },
              { key: 'low' as FilterType, label: t.low },
            ].map((item) => (
              <Pressable
                key={item.key}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: filter === item.key ? colors.primary : colors.surface,
                    borderColor: filter === item.key ? colors.primary : colors.border,
                    borderRadius: borderRadius.full,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFilter(item.key);
                }}
                accessibilityRole="tab"
                accessibilityState={{ selected: filter === item.key }}
              >
                {item.key !== 'all' && (
                  <View
                    style={[
                      styles.filterDot,
                      { backgroundColor: filter === item.key ? '#fff' : getSeverityColor(item.key) },
                    ]}
                  />
                )}
                <Text
                  style={[
                    styles.filterLabel,
                    {
                      color: filter === item.key ? '#fff' : colors.text,
                      fontSize: typography.sizes.sm,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <Animated.View entering={FadeIn.duration(400)} style={styles.emptyContainer}>
            <Ionicons name="shield-checkmark-outline" size={48} color={colors.textLight} />
            <Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
              {t.noEvents}
            </Text>
          </Animated.View>
        ) : (
          filteredEvents.map((event, index) => (
            <Animated.View key={event.id} entering={FadeInDown.delay(250 + index * 50).duration(300)}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setExpandedId(expandedId === event.id ? null : event.id);
                }}
              >
                <Card style={[styles.eventCard, { marginBottom: spacing.sm }]}>
                  <View style={styles.eventHeader}>
                    <View style={[styles.eventIconContainer, { backgroundColor: `${getSeverityColor(event.severity)}15`, borderRadius: borderRadius.md }]}>
                      <Ionicons name={getEventIcon(event.type)} size={20} color={getSeverityColor(event.severity)} />
                    </View>
                    <View style={styles.eventContent}>
                      <View style={styles.eventTitleRow}>
                        <Text style={[styles.eventTitle, { color: colors.text, fontSize: typography.sizes.sm }]} numberOfLines={1}>
                          {event.title}
                        </Text>
                        <View style={[styles.severityBadge, { backgroundColor: `${getSeverityColor(event.severity)}15`, borderRadius: borderRadius.sm }]}>
                          <View style={[styles.severityDot, { backgroundColor: getSeverityColor(event.severity) }]} />
                          <Text style={[styles.severityText, { color: getSeverityColor(event.severity), fontSize: 10 }]}>
                            {event.severity.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.eventDesc, { color: colors.textSecondary, fontSize: typography.sizes.xs }]} numberOfLines={expandedId === event.id ? undefined : 1}>
                        {event.description}
                      </Text>
                      <View style={styles.eventMeta}>
                        <Text style={[styles.eventUser, { color: colors.textLight, fontSize: 11 }]}>
                          {event.userName}
                        </Text>
                        <Text style={[styles.eventTime, { color: colors.textLight, fontSize: 11 }]}>
                          {formatTime(event.timestamp)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Expanded AI Analysis */}
                  {expandedId === event.id && (
                    <Animated.View entering={FadeInDown.duration(200)}>
                      <View style={[styles.aiSection, { borderTopColor: colors.borderLight }]}>
                        {event.aiAnalysis ? (
                          <View style={[styles.aiAnalysisBox, { backgroundColor: `${colors.primary}08`, borderRadius: borderRadius.md }]}>
                            <View style={styles.aiAnalysisHeader}>
                              <Ionicons name="sparkles" size={14} color={colors.primary} />
                              <Text style={[styles.aiAnalysisLabel, { color: colors.primary, fontSize: typography.sizes.xs }]}>
                                Newell AI
                              </Text>
                            </View>
                            <Text style={[styles.aiAnalysisText, { color: colors.text, fontSize: typography.sizes.sm }]}>
                              {event.aiAnalysis}
                            </Text>
                          </View>
                        ) : (
                          <Pressable
                            style={[styles.analyzeButton, { borderColor: colors.primary, borderRadius: borderRadius.md }]}
                            onPress={() => handleAIAnalyze(event)}
                            disabled={aiAnalyzing === event.id}
                          >
                            {aiAnalyzing === event.id ? (
                              <ActivityIndicator size="small" color={colors.primary} />
                            ) : (
                              <>
                                <Ionicons name="sparkles" size={16} color={colors.primary} />
                                <Text style={[styles.analyzeButtonText, { color: colors.primary, fontSize: typography.sizes.sm }]}>
                                  {t.analyzeWithAI}
                                </Text>
                              </>
                            )}
                          </Pressable>
                        )}
                      </View>
                    </Animated.View>
                  )}
                </Card>
              </Pressable>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontWeight: '700' },
  headerSubtitle: { marginTop: 2 },
  scrollContent: {},
  overviewGrid: {
    flexDirection: 'row',
  },
  overviewCard: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  overviewValue: { fontWeight: '700', marginBottom: 4 },
  overviewLabel: {},
  riskCard: {
    borderLeftWidth: 4,
  },
  riskContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskInfo: { flex: 1, marginLeft: 12 },
  riskLabel: {},
  riskValue: { fontWeight: '700' },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  riskBadgeText: { fontWeight: '600' },
  filterScroll: {},
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    marginRight: 8,
    gap: 6,
  },
  filterDot: { width: 8, height: 8, borderRadius: 4 },
  filterLabel: { fontWeight: '500' },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: { marginTop: 12 },
  eventCard: {},
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventContent: { flex: 1 },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  eventTitle: { fontWeight: '600', flex: 1, marginRight: 8 },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  severityDot: { width: 6, height: 6, borderRadius: 3 },
  severityText: { fontWeight: '700' },
  eventDesc: { lineHeight: 18, marginBottom: 6 },
  eventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eventUser: {},
  eventTime: {},
  aiSection: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  aiAnalysisBox: {
    padding: 12,
  },
  aiAnalysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  aiAnalysisLabel: { fontWeight: '600' },
  aiAnalysisText: { lineHeight: 20 },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    gap: 8,
  },
  analyzeButtonText: { fontWeight: '600' },
});
