import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown, FadeOut, SlideInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTextGeneration } from '@fastshot/ai';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/localization';
import { logger } from '@/lib/logger';

// App navigation map for AI to reference
const APP_SECTIONS = {
  orders: { route: '/(tabs)/orders', icon: 'receipt', name: 'Заказы', nameEn: 'Orders' },
  newOrder: { route: '/order/create', icon: 'add-circle', name: 'Новый заказ', nameEn: 'New Order' },
  inventory: { route: '/(tabs)/inventory', icon: 'cube', name: 'Склад', nameEn: 'Inventory' },
  assistant: { route: '/(tabs)/assistant', icon: 'sparkles', name: 'AI-Ассистент', nameEn: 'AI Assistant' },
  profile: { route: '/(tabs)/profile', icon: 'person', name: 'Профиль', nameEn: 'Profile' },
  customers: { route: '/customers', icon: 'people', name: 'Клиенты', nameEn: 'Customers' },
  reports: { route: '/reports', icon: 'document-text', name: 'Отчёты', nameEn: 'Reports' },
  warehouse: { route: '/warehouse', icon: 'business', name: 'Операции склада', nameEn: 'Warehouse Operations' },
  team: { route: '/team', icon: 'people-circle', name: 'Команда', nameEn: 'Team' },
  loyalty: { route: '/loyalty', icon: 'gift', name: 'Лояльность', nameEn: 'Loyalty' },
  marketing: { route: '/marketing', icon: 'megaphone', name: 'Маркетинг', nameEn: 'Marketing' },
  suppliers: { route: '/suppliers', icon: 'car', name: 'Поставщики', nameEn: 'Suppliers' },
  storeSettings: { route: '/settings/store', icon: 'settings', name: 'Настройки магазина', nameEn: 'Store Settings' },
  regionalSettings: { route: '/settings/regional', icon: 'globe', name: 'Региональные настройки', nameEn: 'Regional Settings' },
  faq: { route: '/support/faq', icon: 'help-circle', name: 'Помощь', nameEn: 'Help & FAQ' },
  feedback: { route: '/support/feedback', icon: 'chatbubble', name: 'Обратная связь', nameEn: 'Feedback' },
  privacy: { route: '/support/privacy', icon: 'shield', name: 'Конфиденциальность', nameEn: 'Privacy Policy' },
  cfo: { route: '/cfo', icon: 'analytics', name: 'AI CFO', nameEn: 'AI CFO' },
  executive: { route: '/executive', icon: 'trending-up', name: 'Дашборд руководителя', nameEn: 'Executive Dashboard' },
  finance: { route: '/finance', icon: 'wallet', name: 'Финансы', nameEn: 'Finance' },
};

interface SuggestedLink {
  route: string;
  icon: string;
  name: string;
  confidence: number;
}

interface AISmartSearchProps {
  visible: boolean;
  onClose: () => void;
}

export const AISmartSearch: React.FC<AISmartSearchProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const { colors, spacing, borderRadius, typography, shadows } = useTheme();
  const { language } = useLocalization();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [suggestedLinks, setSuggestedLinks] = useState<SuggestedLink[]>([]);

  const { generateText, isLoading, error } = useTextGeneration({
    onSuccess: (result) => {
      if (result) {
        parseAIResponse(result);
      }
    },
    onError: (err) => {
      logger.error('AI Smart Search error:', err);
      setResponse(language === 'ru'
        ? 'Извините, произошла ошибка. Попробуйте ещё раз.'
        : 'Sorry, an error occurred. Please try again.');
    },
  });

  const t = {
    title: language === 'ru' ? 'Умный поиск' : 'Smart Search',
    placeholder: language === 'ru' ? 'Задайте вопрос...' : 'Ask a question...',
    suggestions: language === 'ru' ? 'Попробуйте спросить:' : 'Try asking:',
    goTo: language === 'ru' ? 'Перейти' : 'Go to',
    thinking: language === 'ru' ? 'Ищу ответ...' : 'Finding answer...',
  };

  const QUICK_QUESTIONS = language === 'ru' ? [
    'Как экспортировать отчёт за неделю?',
    'Где посмотреть низкие остатки?',
    'Как добавить нового сотрудника?',
    'Где настроить налоги?',
    'Как создать купон для клиента?',
  ] : [
    'How do I export a weekly report?',
    'Where can I see low stock items?',
    'How do I add a new team member?',
    'Where do I configure taxes?',
    'How do I create a customer coupon?',
  ];

  useEffect(() => {
    if (visible) {
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      setQuery('');
      setResponse(null);
      setSuggestedLinks([]);
    }
  }, [visible]);

  const parseAIResponse = (aiResponse: string) => {
    setResponse(aiResponse);

    // Parse navigation suggestions from AI response
    const links: SuggestedLink[] = [];
    const lowerResponse = aiResponse.toLowerCase();

    // Check which sections are mentioned in the response
    Object.entries(APP_SECTIONS).forEach(([key, section]) => {
      const keywords = [
        section.name.toLowerCase(),
        section.nameEn.toLowerCase(),
        key.toLowerCase(),
      ];

      let confidence = 0;
      keywords.forEach(keyword => {
        if (lowerResponse.includes(keyword)) {
          confidence += 0.3;
        }
      });

      if (confidence > 0) {
        links.push({
          route: section.route,
          icon: section.icon,
          name: language === 'ru' ? section.name : section.nameEn,
          confidence: Math.min(confidence, 1),
        });
      }
    });

    // Sort by confidence and take top 3
    const sortedLinks = links.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
    setSuggestedLinks(sortedLinks);
  };

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query.trim();
    if (!q || isLoading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setResponse(null);
    setSuggestedLinks([]);

    const sectionsList = Object.entries(APP_SECTIONS)
      .map(([key, section]) => `- ${section.name} (${section.nameEn}): ${section.route}`)
      .join('\n');

    const prompt = `You are a helpful assistant for the Lkscale business management app. Answer the user's question concisely in ${language === 'ru' ? 'Russian' : 'English'}.

Available app sections:
${sectionsList}

When answering, mention the relevant section names so users know where to go. Keep your answer brief (2-3 sentences).

User question: ${q}`;

    await generateText(prompt);
  };

  const handleQuickQuestion = (question: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQuery(question);
    handleSearch(question);
  };

  const handleNavigate = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
    router.push(route as any);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <Animated.View
          entering={SlideInUp.duration(300)}
          style={[styles.content, {
            backgroundColor: colors.surface,
            paddingTop: insets.top + spacing.md,
            borderBottomLeftRadius: borderRadius.xxl,
            borderBottomRightRadius: borderRadius.xxl,
            ...shadows.xl,
          }]}
        >
          {/* Header */}
          <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
            <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="search" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text, fontSize: typography.sizes.lg }]}>
              {t.title}
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Search Input */}
          <View style={[styles.searchContainer, { paddingHorizontal: spacing.md }]}>
            <View style={[styles.inputWrapper, {
              backgroundColor: colors.background,
              borderRadius: borderRadius.lg,
            }]}>
              <Ionicons name="sparkles" size={20} color={colors.primary} />
              <TextInput
                ref={inputRef}
                style={[styles.input, { color: colors.text, fontSize: typography.sizes.md }]}
                placeholder={t.placeholder}
                placeholderTextColor={colors.textLight}
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={() => handleSearch()}
                returnKeyType="search"
                editable={!isLoading}
              />
              {query.length > 0 && !isLoading && (
                <Pressable onPress={() => setQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.textLight} />
                </Pressable>
              )}
              {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
            </View>
          </View>

          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={{ padding: spacing.md, paddingBottom: insets.bottom + spacing.lg }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* AI Response */}
            {isLoading && (
              <Animated.View entering={FadeIn} style={styles.loadingContainer}>
                <View style={[styles.loadingBubble, { backgroundColor: `${colors.primary}10` }]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.primary, fontSize: typography.sizes.sm }]}>
                    {t.thinking}
                  </Text>
                </View>
              </Animated.View>
            )}

            {response && !isLoading && (
              <Animated.View entering={FadeInDown.duration(300)} style={styles.responseContainer}>
                <View style={[styles.responseBubble, {
                  backgroundColor: colors.background,
                  borderRadius: borderRadius.lg,
                }]}>
                  <View style={styles.responseHeader}>
                    <View style={[styles.aiIcon, { backgroundColor: `${colors.primary}15` }]}>
                      <Ionicons name="sparkles" size={16} color={colors.primary} />
                    </View>
                    <Text style={[styles.aiLabel, { color: colors.primary, fontSize: typography.sizes.xs }]}>
                      AI
                    </Text>
                  </View>
                  <Text style={[styles.responseText, { color: colors.text, fontSize: typography.sizes.md }]}>
                    {response}
                  </Text>
                </View>

                {/* Suggested Links */}
                {suggestedLinks.length > 0 && (
                  <View style={styles.linksContainer}>
                    <Text style={[styles.linksTitle, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
                      {t.goTo}:
                    </Text>
                    {suggestedLinks.map((link, index) => (
                      <Animated.View
                        key={link.route}
                        entering={FadeInDown.delay(index * 100).duration(300)}
                      >
                        <Pressable
                          style={[styles.linkButton, {
                            backgroundColor: colors.surface,
                            borderColor: colors.borderLight,
                            borderRadius: borderRadius.md,
                          }]}
                          onPress={() => handleNavigate(link.route)}
                        >
                          <View style={[styles.linkIcon, { backgroundColor: `${colors.primary}15` }]}>
                            <Ionicons name={link.icon as any} size={20} color={colors.primary} />
                          </View>
                          <Text style={[styles.linkText, { color: colors.text, fontSize: typography.sizes.md }]}>
                            {link.name}
                          </Text>
                          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                        </Pressable>
                      </Animated.View>
                    ))}
                  </View>
                )}
              </Animated.View>
            )}

            {/* Quick Questions */}
            {!response && !isLoading && (
              <Animated.View entering={FadeIn.delay(200)}>
                <Text style={[styles.suggestionsTitle, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
                  {t.suggestions}
                </Text>
                {QUICK_QUESTIONS.map((question, index) => (
                  <Animated.View
                    key={question}
                    entering={FadeInDown.delay(index * 50).duration(300)}
                  >
                    <Pressable
                      style={[styles.quickQuestion, {
                        backgroundColor: colors.background,
                        borderRadius: borderRadius.md,
                      }]}
                      onPress={() => handleQuickQuestion(question)}
                    >
                      <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
                      <Text style={[styles.quickQuestionText, { color: colors.text, fontSize: typography.sizes.sm }]}>
                        {question}
                      </Text>
                    </Pressable>
                  </Animated.View>
                ))}
              </Animated.View>
            )}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontWeight: '700',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  loadingContainer: {
    marginBottom: 16,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  loadingText: {
    fontWeight: '500',
  },
  responseContainer: {},
  responseBubble: {
    padding: 16,
    marginBottom: 16,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  aiIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiLabel: {
    fontWeight: '600',
  },
  responseText: {
    lineHeight: 24,
  },
  linksContainer: {
    gap: 8,
  },
  linksTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    gap: 12,
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    flex: 1,
    fontWeight: '500',
  },
  suggestionsTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  quickQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  quickQuestionText: {},
});

export default AISmartSearch;
