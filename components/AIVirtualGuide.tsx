import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeIn,
  FadeOut,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/localization';
import { useTextGeneration } from '@fastshot/ai';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

interface AIVirtualGuideProps {
  visible: boolean;
  onClose: () => void;
  mode: 'welcome' | 'setup' | 'help';
  onSetupComplete?: () => void;
}

const SETUP_QUESTIONS = {
  ru: [
    { id: 'business_type', question: 'Какой у вас тип бизнеса?', options: ['Розничная торговля', 'Оптовая торговля', 'Услуги', 'Производство', 'Другое'] },
    { id: 'team_size', question: 'Сколько человек в вашей команде?', options: ['Только я', '2-5', '6-20', 'Более 20'] },
    { id: 'primary_goal', question: 'Какая ваша главная цель?', options: ['Учёт товаров', 'Управление заказами', 'Аналитика продаж', 'Работа с клиентами', 'Всё вместе'] },
  ],
  en: [
    { id: 'business_type', question: 'What type of business do you have?', options: ['Retail', 'Wholesale', 'Services', 'Manufacturing', 'Other'] },
    { id: 'team_size', question: 'How many people are on your team?', options: ['Just me', '2-5', '6-20', 'More than 20'] },
    { id: 'primary_goal', question: 'What is your primary goal?', options: ['Inventory management', 'Order management', 'Sales analytics', 'Customer management', 'All of the above'] },
  ],
};

const WELCOME_MESSAGES = {
  ru: {
    greeting: 'Привет! Я ваш AI-помощник в Lkscale. 👋',
    intro: 'Я помогу вам освоиться в приложении и настроить его под ваш бизнес.',
    question: 'Расскажите немного о вашем бизнесе, чтобы я мог дать персонализированные рекомендации.',
  },
  en: {
    greeting: 'Hello! I\'m your AI assistant in Lkscale. 👋',
    intro: 'I\'ll help you get started with the app and customize it for your business.',
    question: 'Tell me a bit about your business so I can provide personalized recommendations.',
  },
};

const QUICK_ACTIONS = {
  ru: [
    { label: 'Как создать заказ?', icon: 'receipt-outline' },
    { label: 'Добавить товар', icon: 'cube-outline' },
    { label: 'Посмотреть аналитику', icon: 'analytics-outline' },
    { label: 'Настроить профиль', icon: 'person-outline' },
  ],
  en: [
    { label: 'How to create an order?', icon: 'receipt-outline' },
    { label: 'Add a product', icon: 'cube-outline' },
    { label: 'View analytics', icon: 'analytics-outline' },
    { label: 'Set up profile', icon: 'person-outline' },
  ],
};

export function AIVirtualGuide({ visible, onClose, mode, onSetupComplete }: AIVirtualGuideProps) {
  const insets = useSafeAreaInsets();
  const { colors, spacing, borderRadius, typography, isDark } = useTheme();
  const { language } = useLocalization();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentSetupStep, setCurrentSetupStep] = useState(0);
  const [setupAnswers, setSetupAnswers] = useState<Record<string, string>>({});

  const welcomeMessages = WELCOME_MESSAGES[language] || WELCOME_MESSAGES.en;
  const setupQuestions = SETUP_QUESTIONS[language] || SETUP_QUESTIONS.en;
  const quickActions = QUICK_ACTIONS[language] || QUICK_ACTIONS.en;

  // Animation values
  const pulseScale = useSharedValue(1);
  const typingDots = useSharedValue(0);

  const { generateText, isLoading, error } = useTextGeneration({
    onSuccess: (result) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: result,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  useEffect(() => {
    if (visible) {
      // Initialize conversation based on mode
      const initialMessages: Message[] = [];

      if (mode === 'welcome' || mode === 'setup') {
        initialMessages.push({
          id: '1',
          role: 'assistant',
          content: welcomeMessages.greeting,
          timestamp: new Date(),
        });

        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: '2',
            role: 'assistant',
            content: welcomeMessages.intro,
            timestamp: new Date(),
          }]);
        }, 1000);

        if (mode === 'setup') {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: '3',
              role: 'assistant',
              content: welcomeMessages.question,
              timestamp: new Date(),
            }]);
          }, 2000);
        }
      }

      setMessages(initialMessages);

      // Start pulse animation
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      setMessages([]);
      setCurrentSetupStep(0);
      setSetupAnswers({});
    }
  }, [visible, mode]);

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Build context for AI
    const context = language === 'ru'
      ? `Ты AI-помощник в приложении Lkscale для управления бизнесом. Отвечай кратко и по делу на русском языке. Помогай пользователю с управлением заказами, товарами, аналитикой и настройками.`
      : `You are an AI assistant in the Lkscale business management app. Answer briefly and to the point in English. Help users with order management, products, analytics, and settings.`;

    const conversationHistory = messages
      .slice(-4)
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const prompt = `${context}\n\nConversation:\n${conversationHistory}\nUser: ${inputText.trim()}\nAssistant:`;

    await generateText(prompt);
  };

  const handleQuickAction = (action: string) => {
    setInputText(action);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSetupAnswer = async (answer: string) => {
    const currentQuestion = setupQuestions[currentSetupStep];

    // Add user's answer as message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: answer,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Store answer
    const newAnswers = { ...setupAnswers, [currentQuestion.id]: answer };
    setSetupAnswers(newAnswers);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentSetupStep < setupQuestions.length - 1) {
      // Move to next question
      setTimeout(() => {
        const nextQuestion = setupQuestions[currentSetupStep + 1];
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: nextQuestion.question,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        setCurrentSetupStep(prev => prev + 1);
      }, 500);
    } else {
      // Setup complete - generate personalized recommendation
      const answersText = Object.entries(newAnswers)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');

      const prompt = language === 'ru'
        ? `На основе ответов пользователя (${answersText}), дай краткую персонализированную рекомендацию по использованию Lkscale. 2-3 предложения.`
        : `Based on user's answers (${answersText}), give a brief personalized recommendation for using Lkscale. 2-3 sentences.`;

      setTimeout(async () => {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: language === 'ru'
            ? 'Отлично! Анализирую ваши ответы...'
            : 'Great! Analyzing your answers...',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);

        await generateText(prompt);

        setTimeout(() => {
          const completionMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: language === 'ru'
              ? '🎉 Настройка завершена! Вы готовы начать работу с Lkscale. Не стесняйтесь обращаться ко мне в любое время!'
              : '🎉 Setup complete! You\'re ready to start using Lkscale. Feel free to ask me anything anytime!',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, completionMessage]);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onSetupComplete?.();
        }, 2000);
      }, 500);
    }
  };

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user';

    return (
      <Animated.View
        key={message.id}
        entering={isUser ? SlideInRight.delay(index * 50) : FadeInDown.delay(index * 50)}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        {!isUser && (
          <View style={[styles.avatarSmall, { backgroundColor: colors.primary }]}>
            <Ionicons name="sparkles" size={14} color="#fff" />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isUser ? colors.primary : colors.surface,
              borderColor: isUser ? colors.primary : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              {
                color: isUser ? '#fff' : colors.text,
                fontSize: typography.sizes.sm,
              },
            ]}
          >
            {message.content}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const renderSetupOptions = () => {
    if (mode !== 'setup' || currentSetupStep >= setupQuestions.length) return null;

    const currentQuestion = setupQuestions[currentSetupStep];

    return (
      <Animated.View
        entering={FadeInUp.delay(200)}
        style={[styles.optionsContainer, { paddingHorizontal: spacing.md }]}
      >
        {currentQuestion.options.map((option, index) => (
          <Pressable
            key={option}
            style={[
              styles.optionButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: borderRadius.lg,
              },
            ]}
            onPress={() => handleSetupAnswer(option)}
          >
            <Text style={[styles.optionText, { color: colors.text, fontSize: typography.sizes.sm }]}>
              {option}
            </Text>
          </Pressable>
        ))}
      </Animated.View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <BlurView
        intensity={isDark ? 40 : 60}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={[
              styles.content,
              {
                backgroundColor: colors.background,
                borderTopLeftRadius: borderRadius.xl,
                borderTopRightRadius: borderRadius.xl,
                marginTop: insets.top + 60,
              },
            ]}
          >
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Animated.View style={avatarStyle}>
                <LinearGradient
                  colors={[colors.primary, colors.gradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatar}
                >
                  <Ionicons name="sparkles" size={24} color="#fff" />
                </LinearGradient>
              </Animated.View>

              <View style={styles.headerText}>
                <Text style={[styles.headerTitle, { color: colors.text, fontSize: typography.sizes.lg }]}>
                  {language === 'ru' ? 'AI Помощник' : 'AI Assistant'}
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                  {isLoading
                    ? (language === 'ru' ? 'Печатает...' : 'Typing...')
                    : (language === 'ru' ? 'Всегда готов помочь' : 'Always ready to help')}
                </Text>
              </View>

              <Pressable
                style={[styles.closeButton, { backgroundColor: colors.surface }]}
                onPress={onClose}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            {/* Messages */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={[styles.messagesContent, { padding: spacing.md }]}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((message, index) => renderMessage(message, index))}

              {isLoading && (
                <Animated.View
                  entering={FadeInDown}
                  style={[styles.messageContainer, styles.assistantMessage]}
                >
                  <View style={[styles.avatarSmall, { backgroundColor: colors.primary }]}>
                    <Ionicons name="sparkles" size={14} color="#fff" />
                  </View>
                  <View
                    style={[
                      styles.messageBubble,
                      styles.typingBubble,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                  >
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                </Animated.View>
              )}
            </ScrollView>

            {/* Setup Options */}
            {renderSetupOptions()}

            {/* Quick Actions (for help mode) */}
            {mode === 'help' && messages.length <= 2 && (
              <Animated.View
                entering={FadeInUp.delay(300)}
                style={[styles.quickActionsContainer, { paddingHorizontal: spacing.md }]}
              >
                <Text style={[styles.quickActionsTitle, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                  {language === 'ru' ? 'Быстрые вопросы' : 'Quick questions'}
                </Text>
                <View style={styles.quickActionsGrid}>
                  {quickActions.map((action, index) => (
                    <Pressable
                      key={index}
                      style={[
                        styles.quickActionButton,
                        { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md },
                      ]}
                      onPress={() => handleQuickAction(action.label)}
                    >
                      <Ionicons name={action.icon as any} size={18} color={colors.primary} />
                      <Text
                        style={[styles.quickActionText, { color: colors.text, fontSize: typography.sizes.xs }]}
                        numberOfLines={2}
                      >
                        {action.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Input */}
            {mode !== 'setup' && (
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    paddingBottom: insets.bottom + spacing.sm,
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                      borderRadius: borderRadius.lg,
                      fontSize: typography.sizes.sm,
                    },
                  ]}
                  placeholder={language === 'ru' ? 'Задайте вопрос...' : 'Ask a question...'}
                  placeholderTextColor={colors.inputPlaceholder}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={500}
                  onSubmitEditing={handleSendMessage}
                />
                <Pressable
                  style={[
                    styles.sendButton,
                    {
                      backgroundColor: inputText.trim() ? colors.primary : colors.border,
                      borderRadius: borderRadius.full,
                    },
                  ]}
                  onPress={handleSendMessage}
                  disabled={!inputText.trim() || isLoading}
                >
                  <Ionicons
                    name="send"
                    size={20}
                    color={inputText.trim() ? '#fff' : colors.textLight}
                  />
                </Pressable>
              </View>
            )}

            {/* Setup progress indicator */}
            {mode === 'setup' && currentSetupStep < setupQuestions.length && (
              <View style={[styles.progressContainer, { paddingBottom: insets.bottom + spacing.md }]}>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${((currentSetupStep + 1) / setupQuestions.length) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                  {language === 'ru'
                    ? `Шаг ${currentSetupStep + 1} из ${setupQuestions.length}`
                    : `Step ${currentSetupStep + 1} of ${setupQuestions.length}`}
                </Text>
              </View>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: '700',
  },
  headerSubtitle: {
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  typingBubble: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  messageText: {
    lineHeight: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 12,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
  },
  optionText: {
    fontWeight: '500',
  },
  quickActionsContainer: {
    paddingVertical: 12,
  },
  quickActionsTitle: {
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    gap: 6,
    maxWidth: '48%',
  },
  quickActionText: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
  },
  sendButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    marginTop: 8,
  },
});
