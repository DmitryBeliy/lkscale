import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTextGeneration } from '@fastshot/ai';
import { getBusinessSummary, subscribeData } from '@/store/dataStore';
import { ChatMessage } from '@/types';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

const SUGGESTED_QUESTIONS = [
  { id: '1', text: 'Какой товар самый прибыльный?', icon: 'trending-up' },
  { id: '2', text: 'Сделай прогноз продаж на неделю', icon: 'analytics' },
  { id: '3', text: 'Какие товары нужно пополнить?', icon: 'alert-circle' },
  { id: '4', text: 'Проанализируй продажи за месяц', icon: 'bar-chart' },
  { id: '5', text: 'Кто мой лучший клиент?', icon: 'person' },
];

export default function AssistantScreen() {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Привет! Я ваш бизнес-ассистент. Задайте мне любой вопрос о вашем бизнесе — продажах, товарах, клиентах или прогнозах. Чем могу помочь?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [businessData, setBusinessData] = useState(getBusinessSummary());

  const { generateText, isLoading } = useTextGeneration({
    onSuccess: (response) => {
      if (response) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => {
          const filtered = prev.filter((m) => !m.isLoading);
          return [...filtered, assistantMessage];
        });
      }
    },
    onError: (error) => {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Извините, произошла ошибка. Пожалуйста, попробуйте еще раз.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.isLoading);
        return [...filtered, errorMessage];
      });
      console.error('AI Error:', error);
    },
  });

  useEffect(() => {
    const unsub = subscribeData(() => {
      setBusinessData(getBusinessSummary());
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const buildContextPrompt = useCallback((question: string) => {
    const data = businessData;

    return `Ты — бизнес-ассистент для приложения управления складом и заказами. Отвечай на русском языке, кратко и по делу.

Текущие данные бизнеса:
- Общие продажи: ${data.kpi?.totalSales?.toLocaleString('ru-RU') || 0} ₽
- Изменение продаж: ${data.kpi?.salesChange || 0}%
- Активные заказы: ${data.kpi?.activeOrders || 0}
- Баланс: ${data.kpi?.balance?.toLocaleString('ru-RU') || 0} ₽
- Всего заказов: ${data.totalOrders}
- Выполненных заказов: ${data.completedOrders}
- Ожидающих заказов: ${data.pendingOrders}
- Всего товаров: ${data.totalProducts}
- Всего клиентов: ${data.totalCustomers}
- Продажи за неделю: ${data.weekSales?.toLocaleString('ru-RU') || 0} ₽
- Продажи за месяц: ${data.monthSales?.toLocaleString('ru-RU') || 0} ₽
- Средний чек: ${Math.round(data.avgOrderValue || 0).toLocaleString('ru-RU')} ₽

Товары с низким запасом:
${data.lowStockProducts?.map((p) => `- ${p.name}: ${p.stock} шт. (мин: ${p.minStock})`).join('\n') || 'Нет'}

Топ-5 товаров по выручке:
${data.topProducts?.map((p, i) => `${i + 1}. ${p.name}: ${p.revenue?.toLocaleString('ru-RU')} ₽ (продано: ${p.sold} шт.)`).join('\n') || 'Нет данных'}

Вопрос пользователя: ${question}

Ответь кратко (2-4 предложения), конкретно и с цифрами. Если нужен прогноз, основывайся на текущих трендах.`;
  }, [businessData]);

  const handleSend = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || isLoading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setInputText('');

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);

    // Generate AI response
    const prompt = buildContextPrompt(messageText);
    await generateText(prompt);
  };

  const handleSuggestedQuestion = (question: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleSend(question);
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isUser = item.role === 'user';

    if (item.isLoading) {
      return (
        <Animated.View
          entering={FadeInUp.duration(300)}
          style={[styles.messageBubble, styles.assistantBubble]}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Анализирую данные...</Text>
          </View>
        </Animated.View>
      );
    }

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 50).duration(300)}
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        {!isUser && (
          <View style={styles.assistantIcon}>
            <Ionicons name="sparkles" size={16} color={colors.primary} />
          </View>
        )}
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {item.content}
        </Text>
        <Text style={[styles.messageTime, isUser && styles.userMessageTime]}>
          {new Date(item.timestamp).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </Animated.View>
    );
  };

  const renderSuggestedQuestions = () => {
    if (messages.length > 1) return null;

    return (
      <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.suggestedContainer}>
        <Text style={styles.suggestedTitle}>Попробуйте спросить:</Text>
        {SUGGESTED_QUESTIONS.map((q) => (
          <Pressable
            key={q.id}
            style={styles.suggestedButton}
            onPress={() => handleSuggestedQuestion(q.text)}
          >
            <View style={styles.suggestedIcon}>
              <Ionicons name={q.icon as any} size={18} color={colors.primary} />
            </View>
            <Text style={styles.suggestedText}>{q.text}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </Pressable>
        ))}
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="sparkles" size={24} color={colors.primary} />
        </View>
        <View>
          <Text style={styles.headerTitle}>Бизнес-ассистент</Text>
          <Text style={styles.headerSubtitle}>Анализ данных с помощью AI</Text>
        </View>
      </View>

      {/* Chat */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderSuggestedQuestions}
        />

        {/* Input */}
        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Задайте вопрос..."
              placeholderTextColor={colors.textLight}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <Pressable
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.textInverse} />
              ) : (
                <Ionicons name="send" size={20} color={colors.textInverse} />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  messageBubble: {
    maxWidth: '85%',
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: borderRadius.sm,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderBottomLeftRadius: borderRadius.sm,
    ...shadows.sm,
  },
  assistantIcon: {
    position: 'absolute',
    top: -10,
    left: -10,
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  messageText: {
    fontSize: typography.sizes.md,
    color: colors.text,
    lineHeight: typography.sizes.md * 1.5,
  },
  userMessageText: {
    color: colors.textInverse,
  },
  messageTime: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  userMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  suggestedContainer: {
    marginTop: spacing.md,
  },
  suggestedTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  suggestedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  suggestedIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  suggestedText: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  inputContainer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
    maxHeight: 100,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  sendButtonDisabled: {
    backgroundColor: colors.textLight,
  },
});
