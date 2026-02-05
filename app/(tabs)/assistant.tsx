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
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { useTextGeneration } from '@fastshot/ai';
import { getBusinessSummary, subscribeData } from '@/store/dataStore';
import { useLocalization } from '@/localization';
import { ChatMessage } from '@/types';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

interface ActionCommand {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  action: 'monthly_report' | 'promotional' | 'inventory_report' | 'customer_analysis';
}

const ACTION_COMMANDS: ActionCommand[] = [
  {
    id: 'monthly',
    icon: 'document-text',
    label: 'Месячный отчёт',
    description: 'Сгенерировать отчёт по продажам',
    action: 'monthly_report',
  },
  {
    id: 'promo',
    icon: 'megaphone',
    label: 'Промо-сообщение',
    description: 'Создать промо для VIP-клиентов',
    action: 'promotional',
  },
  {
    id: 'inventory',
    icon: 'cube',
    label: 'Анализ склада',
    description: 'Отчёт по состоянию запасов',
    action: 'inventory_report',
  },
  {
    id: 'customers',
    icon: 'people',
    label: 'Анализ клиентов',
    description: 'Сегментация и рекомендации',
    action: 'customer_analysis',
  },
];

const SUGGESTED_QUESTIONS = [
  { id: '1', text: 'Какой товар самый прибыльный?', icon: 'trending-up' },
  { id: '2', text: 'Сделай прогноз продаж на неделю', icon: 'analytics' },
  { id: '3', text: 'Какие товары нужно пополнить?', icon: 'alert-circle' },
  { id: '4', text: 'Проанализируй продажи за месяц', icon: 'bar-chart' },
  { id: '5', text: 'Кто мой лучший клиент?', icon: 'person' },
];

export default function AssistantScreen() {
  const insets = useSafeAreaInsets();
  const { t, language } = useLocalization();
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState('');
  const [showActions, setShowActions] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: t.assistant.welcome,
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
        content: t.assistant.errorMessage,
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
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const buildContextPrompt = useCallback((question: string) => {
    const data = businessData;
    const lang = language === 'ru' ? 'Russian' : 'English';

    return `You are a business assistant for "Lkscale" - an inventory, order management and CRM app. Respond in ${lang}, concisely and with specific numbers.

## Current Business Metrics:
- Total Sales: ${data.kpi?.totalSales?.toLocaleString() || 0} RUB
- Sales Change: ${(data.kpi?.salesChange ?? 0) > 0 ? '+' : ''}${data.kpi?.salesChange ?? 0}%
- Active Orders: ${data.kpi?.activeOrders || 0}
- Balance: ${data.kpi?.balance?.toLocaleString() || 0} RUB
- Average Order Value: ${Math.round(data.avgOrderValue || 0).toLocaleString()} RUB
- Average Margin: ${data.avgMargin || 0}%

## Orders Overview:
- Total Orders: ${data.totalOrders}
- Completed: ${data.completedOrders}
- Pending: ${data.pendingOrders}
- Week Sales: ${data.weekSales?.toLocaleString() || 0} RUB
- Month Sales: ${data.monthSales?.toLocaleString() || 0} RUB

## Inventory:
- Total Products: ${data.totalProducts}
- Low Stock Items: ${data.lowStockProducts?.length || 0}

Low stock products:
${data.lowStockProducts?.map((p: any) => `- ${p.name}: ${p.stock} pcs (min: ${p.minStock}), margin: ${p.margin}%`).join('\n') || 'None'}

## Top 5 Products by Revenue:
${data.topProducts?.map((p: any, i: number) => `${i + 1}. ${p.name}: ${p.revenue?.toLocaleString()} RUB (sold: ${p.sold}, margin: ${p.margin}%, profit: ${p.profit?.toLocaleString()} RUB)`).join('\n') || 'No data'}

## Highest Margin Products:
${data.highestMarginProducts?.map((p: any, i: number) => `${i + 1}. ${p.name}: margin ${p.margin}%, profit per unit ${p.profit?.toLocaleString()} RUB`).join('\n') || 'No data'}

## CRM - Top Customers by Revenue:
${data.topCustomers?.map((c: any, i: number) => `${i + 1}. ${c.name}: ${c.totalSpent?.toLocaleString()} RUB (${c.totalOrders} orders, avg check: ${c.avgCheck?.toLocaleString()} RUB)`).join('\n') || 'No data'}

## Inactive Customers (no orders in 30+ days):
${data.inactiveCustomers?.map((c: any) => `- ${c.name}: last order ${c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString('ru-RU') : 'never'}, total spent: ${c.totalSpent?.toLocaleString()} RUB`).join('\n') || 'All customers are active'}

## Total Customers: ${data.totalCustomers}

User question: ${question}

Answer briefly (2-4 sentences) with specific numbers, names and actionable insights. If asked about customers, products or profits, use the real data provided above.`;
  }, [businessData, language]);

  const buildActionPrompt = useCallback((action: ActionCommand['action']) => {
    const data = businessData;
    const lang = language === 'ru' ? 'Russian' : 'English';

    switch (action) {
      case 'monthly_report':
        return `Generate a professional monthly sales report in ${lang}. Format it clearly with sections and use REAL product and customer names from the data.

## Business Data:
- Total Sales: ${data.kpi?.totalSales?.toLocaleString() || 0} RUB
- Month Sales: ${data.monthSales?.toLocaleString() || 0} RUB
- Active Orders: ${data.kpi?.activeOrders || 0}
- Completed Orders: ${data.completedOrders}
- Average Order Value: ${Math.round(data.avgOrderValue || 0).toLocaleString()} RUB
- Average Margin: ${data.avgMargin || 0}%
- Total Products: ${data.totalProducts}
- Total Customers: ${data.totalCustomers}

## Top Products (with profit data):
${data.topProducts?.map((p: any, i: number) => `${i + 1}. ${p.name}: ${p.revenue?.toLocaleString()} RUB revenue, ${p.margin}% margin, ${p.profit?.toLocaleString()} RUB profit`).join('\n') || 'No data'}

## Top Customers:
${data.topCustomers?.map((c: any, i: number) => `${i + 1}. ${c.name}: ${c.totalSpent?.toLocaleString()} RUB (${c.totalOrders} orders)`).join('\n') || 'No data'}

Create a structured report with:
1. Executive Summary (2-3 sentences with key metrics)
2. Sales & Profit Overview (revenue, margins, order values)
3. Top Products Analysis (top 3 with margins)
4. VIP Customer Highlights (mention specific names)
5. Key Insights (2-3 actionable points)
6. Recommendations for next month`;

      case 'promotional':
        return `Create engaging promotional messages in ${lang} for VIP customers. Use REAL customer and product names.

## VIP Customers to target:
${data.topCustomers?.slice(0, 3).map((c: any) => `- ${c.name}: ${c.totalSpent?.toLocaleString()} RUB total, avg check ${c.avgCheck?.toLocaleString()} RUB`).join('\n') || 'No VIP data'}

## Hot Products to promote:
${data.topProducts?.slice(0, 3).map((p: any) => `- ${p.name}: bestseller`).join('\n') || 'No data'}

## Highest Margin Products (best for promotions):
${data.highestMarginProducts?.slice(0, 3).map((p: any) => `- ${p.name}: ${p.margin}% margin`).join('\n') || 'No data'}

Create 3 personalized versions:
1. SMS (max 160 chars) - for ${data.topCustomers?.[0]?.name || 'VIP client'}, short and punchy
2. WhatsApp (2-3 sentences) - friendly, mention specific product
3. Email subject + body - professional, exclusive offer feel`;

      case 'inventory_report':
        return `Generate an inventory status report with profit analysis in ${lang}.

## Current Inventory:
- Total Products: ${data.totalProducts}
- Low Stock Items: ${data.lowStockProducts?.length || 0}
- Average Margin: ${data.avgMargin || 0}%

## Low Stock Critical Items:
${data.lowStockProducts?.map((p: any) => `- ${p.name}: ${p.stock}/${p.minStock} pcs, margin ${p.margin}%`).join('\n') || 'All stock levels are healthy'}

## Best Selling (High Priority to Restock):
${data.topProducts?.map((p: any, i: number) => `${i + 1}. ${p.name}: ${p.sold} sold, ${p.margin}% margin`).join('\n') || 'No data'}

## Highest Margin Products (Maximize Profit):
${data.highestMarginProducts?.map((p: any, i: number) => `${i + 1}. ${p.name}: ${p.margin}% margin, +${p.profit?.toLocaleString()} RUB per unit`).join('\n') || 'No data'}

Create a report with:
1. Stock Status Summary
2. Critical Restock Items (prioritized by margin & sales)
3. Profit Optimization Recommendations
4. Dead Stock Analysis (if any)`;

      case 'customer_analysis':
        return `Generate a comprehensive CRM analysis report in ${lang}. Use REAL customer names.

## Customer Overview:
- Total Customers: ${data.totalCustomers}
- Total Orders: ${data.totalOrders}
- Average Order Value: ${Math.round(data.avgOrderValue || 0).toLocaleString()} RUB
- Completed Orders: ${data.completedOrders}

## Top 5 Customers by Revenue (VIPs):
${data.topCustomers?.map((c: any, i: number) => `${i + 1}. ${c.name}: ${c.totalSpent?.toLocaleString()} RUB total, ${c.totalOrders} orders, avg ${c.avgCheck?.toLocaleString()} RUB`).join('\n') || 'No data'}

## At-Risk Customers (Inactive 30+ days):
${data.inactiveCustomers?.map((c: any) => `- ${c.name}: last order ${c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString('ru-RU') : 'never'}, lifetime value ${c.totalSpent?.toLocaleString()} RUB`).join('\n') || 'No inactive customers'}

Create a report with:
1. Customer Base Overview (total, growth)
2. VIP Segment Analysis (name specific VIPs, their value)
3. Retention Insights (active vs at-risk)
4. Reactivation Recommendations for inactive customers
5. Growth Strategy (how to increase customer value)`;

      default:
        return '';
    }
  }, [businessData, language]);

  const handleSend = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || isLoading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setInputText('');
    setShowActions(false);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    const loadingMessage: ChatMessage = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);

    const prompt = buildContextPrompt(messageText);
    await generateText(prompt);
  };

  const handleActionCommand = async (action: ActionCommand) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowActions(false);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: `📋 ${action.label}: ${action.description}`,
      timestamp: new Date().toISOString(),
    };

    const loadingMessage: ChatMessage = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);

    const prompt = buildActionPrompt(action.action);
    await generateText(prompt);
  };

  const handleCopyMessage = async (content: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync(content);
    Alert.alert(
      language === 'ru' ? 'Скопировано' : 'Copied',
      language === 'ru' ? 'Текст скопирован в буфер обмена' : 'Text copied to clipboard'
    );
  };

  const handleShareMessage = async (content: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({ message: content });
    } catch (error) {
      console.error('Share error:', error);
    }
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
            <Text style={styles.loadingText}>{t.assistant.analyzing}</Text>
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
        <View style={styles.messageFooter}>
          <Text style={[styles.messageTime, isUser && styles.userMessageTime]}>
            {new Date(item.timestamp).toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {!isUser && item.content.length > 50 && (
            <View style={styles.messageActions}>
              <Pressable
                style={styles.messageActionButton}
                onPress={() => handleCopyMessage(item.content)}
              >
                <Ionicons name="copy-outline" size={14} color={colors.textLight} />
              </Pressable>
              <Pressable
                style={styles.messageActionButton}
                onPress={() => handleShareMessage(item.content)}
              >
                <Ionicons name="share-outline" size={14} color={colors.textLight} />
              </Pressable>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  const renderActionCommands = () => (
    <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.actionsContainer}>
      <View style={styles.actionsHeader}>
        <Ionicons name="flash" size={18} color={colors.primary} />
        <Text style={styles.actionsTitle}>{t.assistant.actionCommands}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.actionsScroll}
      >
        {ACTION_COMMANDS.map((action) => (
          <Pressable
            key={action.id}
            style={styles.actionCard}
            onPress={() => handleActionCommand(action)}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name={action.icon} size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
            <Text style={styles.actionDescription} numberOfLines={2}>
              {action.description}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderSuggestedQuestions = () => {
    if (messages.length > 1) return null;

    return (
      <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.suggestedContainer}>
        <Text style={styles.suggestedTitle}>{t.assistant.suggestedQuestions}</Text>
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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t.assistant.title}</Text>
          <Text style={styles.headerSubtitle}>{t.assistant.subtitle}</Text>
        </View>
        {messages.length > 1 && (
          <Pressable
            style={styles.actionsToggle}
            onPress={() => setShowActions(!showActions)}
          >
            <Ionicons
              name={showActions ? 'chevron-up' : 'flash'}
              size={20}
              color={colors.primary}
            />
          </Pressable>
        )}
      </View>

      {/* Action Commands */}
      {showActions && renderActionCommands()}

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
              placeholder={t.assistant.askQuestion}
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
  headerContent: {
    flex: 1,
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
  actionsToggle: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsContainer: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  actionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  actionsTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  actionsScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  actionCard: {
    width: 140,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: typography.sizes.xs * 1.4,
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
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  messageTime: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  userMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  messageActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  messageActionButton: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
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
