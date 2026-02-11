import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/localization';
import { useTextGeneration } from '@fastshot/ai';
import {
  getFinancialSummary,
  getSalesTrends,
  getCategoryPerformance,
  getStorePerformance,
  mockExpenses,
} from '@/services/enterpriseService';
import { CFOInsight, AnomalyAlert, TaxOptimizationSuggestion, RevenueForcast } from '@/types/enterprise';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Generate business context for AI
const generateBusinessContext = () => {
  const financial = getFinancialSummary('month');
  const trends = getSalesTrends(30);
  const categories = getCategoryPerformance();
  const stores = getStorePerformance();

  const totalExpenses = mockExpenses.reduce((sum, e) => sum + e.amount, 0);
  const avgDailyRevenue = trends.reduce((sum, t) => sum + t.revenue, 0) / trends.length;
  const avgDailyOrders = trends.reduce((sum, t) => sum + t.orders, 0) / trends.length;

  return `
Данные бизнеса MaGGaz12 за текущий месяц:
- Валовая выручка: ${financial.grossRevenue.toLocaleString('ru-RU')} ₽
- Валовая прибыль: ${financial.grossProfit.toLocaleString('ru-RU')} ₽
- Чистая прибыль: ${financial.netProfit.toLocaleString('ru-RU')} ₽
- Маржа валовой прибыли: ${financial.grossMargin.toFixed(1)}%
- Маржа чистой прибыли: ${financial.netMargin.toFixed(1)}%
- Общие расходы: ${totalExpenses.toLocaleString('ru-RU')} ₽
- Средняя выручка в день: ${avgDailyRevenue.toLocaleString('ru-RU')} ₽
- Среднее количество заказов в день: ${avgDailyOrders.toFixed(1)}
- Рост относительно прошлого периода: ${financial.previousPeriod?.growth.toFixed(1)}%

Структура расходов:
- Аренда: ${financial.operatingExpenses.rent.toLocaleString('ru-RU')} ₽
- Зарплаты: ${financial.operatingExpenses.salaries.toLocaleString('ru-RU')} ₽
- Налоги: ${financial.operatingExpenses.taxes.toLocaleString('ru-RU')} ₽
- Коммуналка: ${financial.operatingExpenses.utilities.toLocaleString('ru-RU')} ₽
- Маркетинг: ${financial.operatingExpenses.marketing.toLocaleString('ru-RU')} ₽

Топ категории по выручке:
${categories.slice(0, 3).map(c => `- ${c.category}: ${c.revenue.toLocaleString('ru-RU')} ₽ (маржа ${c.margin.toFixed(1)}%, рост ${c.growth > 0 ? '+' : ''}${c.growth.toFixed(1)}%)`).join('\n')}

Количество магазинов: ${stores.length}
`;
};

// Mock AI insights (will be enhanced with real AI responses)
const generateMockInsights = (): CFOInsight[] => [
  {
    id: 'insight-1',
    type: 'opportunity',
    title: 'Потенциал роста категории "Новинки"',
    description: 'Категория показывает рост +25.8%. Рекомендуется увеличить ассортимент и маркетинговую поддержку.',
    impact: 85000,
    confidence: 0.85,
    actionRequired: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'insight-2',
    type: 'warning',
    title: 'Высокая доля расходов на аренду',
    description: 'Аренда составляет 28% от общих расходов. Рассмотрите переговоры с арендодателем или оптимизацию площадей.',
    impact: -45000,
    confidence: 0.92,
    actionRequired: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'insight-3',
    type: 'positive',
    title: 'Стабильный рост маржинальности',
    description: 'Маржа чистой прибыли выросла на 2.3% за последний квартал благодаря оптимизации закупок.',
    impact: 120000,
    confidence: 0.88,
    createdAt: new Date().toISOString(),
  },
];

const generateMockAnomalies = (): AnomalyAlert[] => [
  {
    id: 'anomaly-1',
    type: 'revenue_spike',
    severity: 'medium',
    title: 'Всплеск продаж в выходные',
    description: 'Выручка за субботу превысила среднюю на 45%. Причина: акция на аксессуары.',
    detectedAt: new Date().toISOString(),
    metric: 'revenue',
    expectedValue: 45000,
    actualValue: 65000,
    deviation: 44.4,
  },
];

const generateMockTaxSuggestions = (): TaxOptimizationSuggestion[] => [
  {
    id: 'tax-1',
    title: 'Переход на патентную систему',
    description: 'При текущем обороте патент может сэкономить до 15% налоговых выплат.',
    potentialSaving: 27750,
    complexity: 'medium',
    deadline: '2025-03-31',
  },
  {
    id: 'tax-2',
    title: 'Амортизация оборудования',
    description: 'Не учтённое оборудование на 75 000 ₽ можно включить в расходы.',
    potentialSaving: 11250,
    complexity: 'low',
  },
];

const generateMockForecast = (): RevenueForcast[] => {
  const months = ['Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг'];
  const baseRevenue = 850000;

  return months.map((month, i) => ({
    period: month,
    predicted: baseRevenue * (1 + 0.05 * (i + 1)) + Math.random() * 50000,
    lowerBound: baseRevenue * (1 + 0.03 * (i + 1)),
    upperBound: baseRevenue * (1 + 0.08 * (i + 1)),
    confidence: 0.95 - i * 0.05,
  }));
};

export default function CFOScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, typography, borderRadius, shadows, isDark } = useTheme();
  const { t } = useLocalization();
  const scrollViewRef = useRef<ScrollView>(null);

  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'forecast'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Привет! Я ваш виртуальный финансовый директор. Могу проанализировать ваш бизнес, дать рекомендации по оптимизации расходов, прогнозировать выручку и помочь с налоговым планированием.\n\nЗадайте мне вопрос о вашем бизнесе!',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [insights] = useState<CFOInsight[]>(generateMockInsights());
  const [anomalies] = useState<AnomalyAlert[]>(generateMockAnomalies());
  const [taxSuggestions] = useState<TaxOptimizationSuggestion[]>(generateMockTaxSuggestions());
  const [forecast] = useState<RevenueForcast[]>(generateMockForecast());

  const { generateText, isLoading, error } = useTextGeneration({
    onSuccess: (response) => {
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response || 'Извините, не удалось получить ответ.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (err) => {
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'Извините, произошла ошибка. Попробуйте ещё раз.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Build context-aware prompt
    const businessContext = generateBusinessContext();
    const conversationHistory = messages
      .slice(-6)
      .map(m => `${m.role === 'user' ? 'Пользователь' : 'CFO'}: ${m.content}`)
      .join('\n');

    const systemPrompt = `Ты виртуальный финансовый директор (CFO) для розничного бизнеса MaGGaz12.
Отвечай на русском языке. Будь конкретным и давай практические советы.
Используй данные бизнеса для анализа. Форматируй ответы с эмодзи для наглядности.

${businessContext}

История диалога:
${conversationHistory}

Вопрос пользователя: ${userMessage.content}

Дай развёрнутый, но лаконичный ответ как профессиональный CFO.`;

    await generateText(systemPrompt);
  };

  const quickQuestions = [
    'Как увеличить прибыль?',
    'Анализ расходов',
    'Прогноз на месяц',
    'Оптимизация налогов',
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: insets.top + spacing.sm,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.lg,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerContent: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: typography.sizes.xl,
      fontWeight: '700',
      color: '#fff',
    },
    headerSubtitle: {
      fontSize: typography.sizes.sm,
      color: 'rgba(255,255,255,0.8)',
      marginTop: 2,
    },
    premiumBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,215,0,0.2)',
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.full,
      gap: 4,
    },
    premiumText: {
      fontSize: typography.sizes.xs,
      fontWeight: '700',
      color: '#FFD700',
    },
    tabBar: {
      flexDirection: 'row',
      marginTop: spacing.md,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: borderRadius.lg,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      borderRadius: borderRadius.md,
    },
    tabActive: {
      backgroundColor: '#fff',
    },
    tabText: {
      fontSize: typography.sizes.sm,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.7)',
    },
    tabTextActive: {
      color: colors.primary,
    },
    content: {
      flex: 1,
    },
    // Chat styles
    chatContainer: {
      flex: 1,
    },
    messagesContainer: {
      flex: 1,
      padding: spacing.md,
    },
    messageWrapper: {
      marginBottom: spacing.md,
    },
    messageUser: {
      alignItems: 'flex-end',
    },
    messageAssistant: {
      alignItems: 'flex-start',
    },
    messageBubble: {
      maxWidth: '85%',
      padding: spacing.md,
      borderRadius: borderRadius.lg,
    },
    messageBubbleUser: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: 4,
    },
    messageBubbleAssistant: {
      backgroundColor: colors.surface,
      borderBottomLeftRadius: 4,
      ...shadows.sm,
    },
    messageText: {
      fontSize: typography.sizes.md,
      lineHeight: 22,
    },
    messageTextUser: {
      color: '#fff',
    },
    messageTextAssistant: {
      color: colors.text,
    },
    messageTime: {
      fontSize: typography.sizes.xs,
      color: colors.textLight,
      marginTop: spacing.xs,
    },
    loadingBubble: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    loadingText: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
    },
    quickQuestions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      padding: spacing.md,
      paddingTop: 0,
    },
    quickQuestion: {
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickQuestionText: {
      fontSize: typography.sizes.sm,
      color: colors.primary,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: spacing.md,
      paddingBottom: insets.bottom + spacing.md,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: spacing.sm,
    },
    textInput: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: typography.sizes.md,
      color: colors.text,
      maxHeight: 100,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: colors.border,
    },
    // Insights styles
    insightsContainer: {
      padding: spacing.md,
      paddingBottom: insets.bottom + spacing.xxl,
    },
    sectionTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md,
      marginTop: spacing.lg,
    },
    insightCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    insightHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    insightIcon: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    insightContent: {
      flex: 1,
    },
    insightTitle: {
      fontSize: typography.sizes.md,
      fontWeight: '700',
      color: colors.text,
    },
    insightDescription: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      lineHeight: 20,
    },
    insightImpact: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.md,
      gap: spacing.sm,
    },
    impactValue: {
      fontSize: typography.sizes.md,
      fontWeight: '700',
    },
    impactLabel: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
    },
    confidenceBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.full,
      marginLeft: 'auto',
    },
    confidenceText: {
      fontSize: typography.sizes.xs,
      fontWeight: '600',
    },
    anomalyCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderLeftWidth: 4,
      ...shadows.sm,
    },
    anomalyTitle: {
      fontSize: typography.sizes.md,
      fontWeight: '600',
      color: colors.text,
    },
    anomalyDescription: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    anomalyStats: {
      flexDirection: 'row',
      marginTop: spacing.sm,
      gap: spacing.lg,
    },
    anomalyStat: {
      alignItems: 'center',
    },
    anomalyStatValue: {
      fontSize: typography.sizes.sm,
      fontWeight: '700',
      color: colors.text,
    },
    anomalyStatLabel: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
    },
    taxCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      ...shadows.sm,
    },
    taxHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    taxTitle: {
      fontSize: typography.sizes.md,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    taxSaving: {
      fontSize: typography.sizes.md,
      fontWeight: '700',
      color: colors.success,
    },
    taxDescription: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    taxFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.sm,
    },
    complexityBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.full,
    },
    complexityText: {
      fontSize: typography.sizes.xs,
      fontWeight: '600',
    },
    deadlineText: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
    },
    // Forecast styles
    forecastContainer: {
      padding: spacing.md,
      paddingBottom: insets.bottom + spacing.xxl,
    },
    forecastCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      ...shadows.sm,
    },
    forecastTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md,
    },
    forecastChart: {
      height: 200,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.sm,
    },
    forecastBar: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    barContainer: {
      width: '100%',
      height: 160,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    bar: {
      width: '80%',
      borderRadius: borderRadius.sm,
    },
    barRange: {
      position: 'absolute',
      width: '60%',
      borderRadius: borderRadius.xs,
      opacity: 0.3,
    },
    barLabel: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    barValue: {
      fontSize: typography.sizes.xs,
      fontWeight: '600',
      color: colors.text,
      marginTop: 2,
    },
    forecastLegend: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.lg,
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
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
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
    },
    summaryRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      alignItems: 'center',
      ...shadows.sm,
    },
    summaryValue: {
      fontSize: typography.sizes.xl,
      fontWeight: '700',
      color: colors.text,
    },
    summaryLabel: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
      textAlign: 'center',
    },
  });

  const getInsightIconConfig = (type: CFOInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return { icon: 'trending-up', color: colors.success, bg: `${colors.success}15` };
      case 'warning':
        return { icon: 'warning', color: colors.warning, bg: `${colors.warning}15` };
      case 'risk':
        return { icon: 'alert-circle', color: colors.error, bg: `${colors.error}15` };
      case 'positive':
        return { icon: 'checkmark-circle', color: colors.success, bg: `${colors.success}15` };
      default:
        return { icon: 'information-circle', color: colors.primary, bg: `${colors.primary}15` };
    }
  };

  const getComplexityConfig = (complexity: string) => {
    switch (complexity) {
      case 'low':
        return { label: 'Легко', color: colors.success, bg: `${colors.success}15` };
      case 'medium':
        return { label: 'Средне', color: colors.warning, bg: `${colors.warning}15` };
      case 'high':
        return { label: 'Сложно', color: colors.error, bg: `${colors.error}15` };
      default:
        return { label: complexity, color: colors.textSecondary, bg: colors.background };
    }
  };

  const maxForecastValue = Math.max(...forecast.map(f => f.upperBound || 0));

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      <LinearGradient
        colors={isDark ? ['#1a1a2e', '#0f3460'] : ['#6366f1', '#4f46e5']}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{t.aiCfo.title}</Text>
            <Text style={styles.headerSubtitle}>{t.aiCfo.subtitle}</Text>
          </View>
          <View style={styles.premiumBadge}>
            <Ionicons name="diamond" size={14} color="#FFD700" />
            <Text style={styles.premiumText}>AI</Text>
          </View>
        </View>

        <View style={styles.tabBar}>
          {[
            { key: 'chat', icon: 'chatbubbles', label: t.aiCfo.chat },
            { key: 'insights', icon: 'bulb', label: t.aiCfo.insights },
            { key: 'forecast', icon: 'trending-up', label: t.aiCfo.forecast },
          ].map(tab => (
            <Pressable
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => {
                setActiveTab(tab.key as any);
                Haptics.selectionAsync();
              }}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {activeTab === 'chat' && (
          <View style={styles.chatContainer}>
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={{ paddingBottom: spacing.md }}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map((message, index) => (
                <Animated.View
                  key={message.id}
                  entering={FadeInUp.delay(index * 50).duration(300)}
                  style={[
                    styles.messageWrapper,
                    message.role === 'user' ? styles.messageUser : styles.messageAssistant,
                  ]}
                >
                  <View style={[
                    styles.messageBubble,
                    message.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant,
                  ]}>
                    <Text style={[
                      styles.messageText,
                      message.role === 'user' ? styles.messageTextUser : styles.messageTextAssistant,
                    ]}>
                      {message.content}
                    </Text>
                  </View>
                  <Text style={styles.messageTime}>
                    {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </Animated.View>
              ))}

              {isLoading && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  style={[styles.messageWrapper, styles.messageAssistant]}
                >
                  <View style={[styles.messageBubble, styles.messageBubbleAssistant, styles.loadingBubble]}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.loadingText}>Анализирую...</Text>
                  </View>
                </Animated.View>
              )}
            </ScrollView>

            {messages.length === 1 && (
              <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.quickQuestions}>
                {quickQuestions.map((q, i) => (
                  <Pressable
                    key={i}
                    style={styles.quickQuestion}
                    onPress={() => {
                      setInputText(q);
                      Haptics.selectionAsync();
                    }}
                  >
                    <Text style={styles.quickQuestionText}>{q}</Text>
                  </Pressable>
                ))}
              </Animated.View>
            )}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder={t.aiCfo.askQuestion}
                placeholderTextColor={colors.textLight}
                multiline
                maxLength={500}
              />
              <Pressable
                style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={!inputText.trim() || isLoading}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>
        )}

        {activeTab === 'insights' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.insightsContainer}
          >
            <Text style={[styles.sectionTitle, { marginTop: 0 }]}>{t.aiCfo.keyInsights}</Text>

            {insights.map((insight, index) => {
              const iconConfig = getInsightIconConfig(insight.type);

              return (
                <Animated.View
                  key={insight.id}
                  entering={FadeInDown.delay(index * 100).duration(400)}
                >
                  <View style={styles.insightCard}>
                    <View style={styles.insightHeader}>
                      <View style={[styles.insightIcon, { backgroundColor: iconConfig.bg }]}>
                        <Ionicons name={iconConfig.icon as any} size={24} color={iconConfig.color} />
                      </View>
                      <View style={styles.insightContent}>
                        <Text style={styles.insightTitle}>{insight.title}</Text>
                        <Text style={styles.insightDescription}>{insight.description}</Text>
                      </View>
                    </View>
                    {insight.impact && (
                      <View style={styles.insightImpact}>
                        <Text style={[
                          styles.impactValue,
                          { color: insight.impact >= 0 ? colors.success : colors.error }
                        ]}>
                          {insight.impact >= 0 ? '+' : ''}{insight.impact.toLocaleString('ru-RU')} ₽
                        </Text>
                        <Text style={styles.impactLabel}>{t.aiCfo.potentialImpact}</Text>
                        {insight.confidence && (
                          <View style={[styles.confidenceBadge, { backgroundColor: `${colors.primary}15` }]}>
                            <Text style={[styles.confidenceText, { color: colors.primary }]}>
                              {(insight.confidence * 100).toFixed(0)}% уверенность
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </Animated.View>
              );
            })}

            <Text style={styles.sectionTitle}>{t.aiCfo.anomalyDetection}</Text>

            {anomalies.map((anomaly, index) => (
              <Animated.View
                key={anomaly.id}
                entering={FadeInDown.delay(300 + index * 100).duration(400)}
              >
                <View style={[
                  styles.anomalyCard,
                  { borderLeftColor: anomaly.severity === 'high' ? colors.error : anomaly.severity === 'medium' ? colors.warning : colors.success }
                ]}>
                  <Text style={styles.anomalyTitle}>{anomaly.title}</Text>
                  <Text style={styles.anomalyDescription}>{anomaly.description}</Text>
                  <View style={styles.anomalyStats}>
                    <View style={styles.anomalyStat}>
                      <Text style={styles.anomalyStatValue}>
                        {anomaly.expectedValue?.toLocaleString('ru-RU')} ₽
                      </Text>
                      <Text style={styles.anomalyStatLabel}>Ожидалось</Text>
                    </View>
                    <View style={styles.anomalyStat}>
                      <Text style={[styles.anomalyStatValue, { color: colors.success }]}>
                        {anomaly.actualValue?.toLocaleString('ru-RU')} ₽
                      </Text>
                      <Text style={styles.anomalyStatLabel}>Факт</Text>
                    </View>
                    <View style={styles.anomalyStat}>
                      <Text style={[styles.anomalyStatValue, { color: colors.primary }]}>
                        +{anomaly.deviation?.toFixed(1)}%
                      </Text>
                      <Text style={styles.anomalyStatLabel}>Отклонение</Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            ))}

            <Text style={styles.sectionTitle}>{t.aiCfo.taxOptimization}</Text>

            {taxSuggestions.map((suggestion, index) => {
              const complexityConfig = getComplexityConfig(suggestion.complexity);

              return (
                <Animated.View
                  key={suggestion.id}
                  entering={FadeInDown.delay(500 + index * 100).duration(400)}
                >
                  <View style={styles.taxCard}>
                    <View style={styles.taxHeader}>
                      <Text style={styles.taxTitle}>{suggestion.title}</Text>
                      <Text style={styles.taxSaving}>
                        +{(suggestion.potentialSaving || 0).toLocaleString('ru-RU')} ₽
                      </Text>
                    </View>
                    <Text style={styles.taxDescription}>{suggestion.description}</Text>
                    <View style={styles.taxFooter}>
                      <View style={[styles.complexityBadge, { backgroundColor: complexityConfig.bg }]}>
                        <Text style={[styles.complexityText, { color: complexityConfig.color }]}>
                          {complexityConfig.label}
                        </Text>
                      </View>
                      {suggestion.deadline && (
                        <Text style={styles.deadlineText}>
                          Срок: {new Date(suggestion.deadline).toLocaleDateString('ru-RU')}
                        </Text>
                      )}
                    </View>
                  </View>
                </Animated.View>
              );
            })}
          </ScrollView>
        )}

        {activeTab === 'forecast' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.forecastContainer}
          >
            <Animated.View entering={FadeInDown.delay(100).duration(400)}>
              <View style={styles.forecastCard}>
                <Text style={styles.forecastTitle}>{t.aiCfo.revenueForecast}</Text>

                <View style={styles.forecastChart}>
                  {forecast.map((item, index) => {
                    const predicted = item.predicted || 0;
                    const lowerBound = item.lowerBound || 0;
                    const upperBound = item.upperBound || 0;
                    const barHeight = (predicted / maxForecastValue) * 140;
                    const lowerHeight = (lowerBound / maxForecastValue) * 140;
                    const upperHeight = (upperBound / maxForecastValue) * 140;

                    return (
                      <View key={index} style={styles.forecastBar}>
                        <View style={styles.barContainer}>
                          <View
                            style={[
                              styles.barRange,
                              {
                                height: upperHeight - lowerHeight,
                                bottom: lowerHeight,
                                backgroundColor: colors.primary,
                              }
                            ]}
                          />
                          <View
                            style={[
                              styles.bar,
                              {
                                height: barHeight,
                                backgroundColor: colors.primary,
                              }
                            ]}
                          />
                        </View>
                        <Text style={styles.barLabel}>{item.period || ''}</Text>
                        <Text style={styles.barValue}>
                          {(predicted / 1000).toFixed(0)}K
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.forecastLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                    <Text style={styles.legendText}>Прогноз</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.primary, opacity: 0.3 }]} />
                    <Text style={styles.legendText}>Диапазон</Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                  <Text style={[styles.summaryValue, { color: colors.success }]}>
                    +{(((forecast[5]?.predicted || 0) - (forecast[0]?.predicted || 1)) / (forecast[0]?.predicted || 1) * 100).toFixed(1)}%
                  </Text>
                  <Text style={styles.summaryLabel}>Рост за 6 месяцев</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>
                    {(forecast.reduce((sum, f) => sum + (f.predicted || 0), 0) / 1000000).toFixed(1)}M ₽
                  </Text>
                  <Text style={styles.summaryLabel}>Прогноз выручки</Text>
                </View>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <View style={[styles.forecastCard, { marginTop: spacing.lg }]}>
                <Text style={styles.forecastTitle}>📊 Ключевые факторы прогноза</Text>
                <View style={{ gap: spacing.md }}>
                  {[
                    { factor: 'Сезонность', impact: '+12%', description: 'Пик продаж весна-лето' },
                    { factor: 'Тренд роста', impact: '+8%', description: 'Стабильный рост базы клиентов' },
                    { factor: 'Новые товары', impact: '+5%', description: 'Запланированное расширение ассортимента' },
                  ].map((item, i) => (
                    <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: typography.sizes.md, fontWeight: '600', color: colors.text }}>
                          {item.factor}
                        </Text>
                        <Text style={{ fontSize: typography.sizes.sm, color: colors.textSecondary }}>
                          {item.description}
                        </Text>
                      </View>
                      <Text style={{ fontSize: typography.sizes.md, fontWeight: '700', color: colors.success }}>
                        {item.impact}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}
