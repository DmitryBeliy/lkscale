import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/localization';
import { useTextGeneration } from '@fastshot/ai';

type RecipientGroup = 'all' | 'admins' | 'cashiers' | 'stock_managers';
type Priority = 'normal' | 'urgent';

interface SentAnnouncement {
  id: string;
  title: string;
  message: string;
  recipients: RecipientGroup;
  priority: Priority;
  sentAt: string;
  readCount: number;
  totalRecipients: number;
}

export default function AnnouncementsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, typography, borderRadius, shadows, isDark } = useTheme();
  const { language } = useLocalization();
  const scrollRef = useRef<ScrollView>(null);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState<RecipientGroup>('all');
  const [priority, setPriority] = useState<Priority>('normal');
  const [isSending, setIsSending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { generateText, isLoading: isAILoading } = useTextGeneration();

  const t = {
    title: language === 'ru' ? 'Объявления для команды' : 'Team Announcements',
    newAnnouncement: language === 'ru' ? 'Новое объявление' : 'New Announcement',
    titlePlaceholder: language === 'ru' ? 'Заголовок объявления' : 'Announcement title',
    messagePlaceholder: language === 'ru' ? 'Текст объявления...' : 'Announcement message...',
    recipients: language === 'ru' ? 'Получатели' : 'Recipients',
    all: language === 'ru' ? 'Все' : 'All Staff',
    admins: language === 'ru' ? 'Администраторы' : 'Admins',
    cashiers: language === 'ru' ? 'Кассиры' : 'Cashiers',
    stockManagers: language === 'ru' ? 'Кладовщики' : 'Stock Managers',
    priority: language === 'ru' ? 'Приоритет' : 'Priority',
    normal: language === 'ru' ? 'Обычный' : 'Normal',
    urgent: language === 'ru' ? 'Срочный' : 'Urgent',
    send: language === 'ru' ? 'Отправить' : 'Send',
    sent: language === 'ru' ? 'Объявление отправлено!' : 'Announcement sent!',
    aiDraft: language === 'ru' ? 'AI помощь' : 'AI Assist',
    aiDrafting: language === 'ru' ? 'AI пишет...' : 'AI drafting...',
    history: language === 'ru' ? 'История' : 'History',
    recent: language === 'ru' ? 'Недавние объявления' : 'Recent Announcements',
    noHistory: language === 'ru' ? 'Нет отправленных объявлений' : 'No announcements sent yet',
    fillFields: language === 'ru' ? 'Заполните заголовок и текст' : 'Please fill in title and message',
    readBy: language === 'ru' ? 'Прочитали' : 'Read by',
  };

  const recipientOptions: { key: RecipientGroup; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'all', label: t.all, icon: 'people' },
    { key: 'admins', label: t.admins, icon: 'shield' },
    { key: 'cashiers', label: t.cashiers, icon: 'cart' },
    { key: 'stock_managers', label: t.stockManagers, icon: 'cube' },
  ];

  const [sentAnnouncements] = useState<SentAnnouncement[]>([
    {
      id: '1',
      title: language === 'ru' ? 'Новый график работы' : 'New Work Schedule',
      message: language === 'ru' ? 'С понедельника переходим на новый график. Подробности в чате.' : 'Starting Monday, we switch to a new schedule. Details in chat.',
      recipients: 'all',
      priority: 'urgent',
      sentAt: new Date(Date.now() - 86400000).toISOString(),
      readCount: 4,
      totalRecipients: 5,
    },
    {
      id: '2',
      title: language === 'ru' ? 'Инвентаризация в пятницу' : 'Inventory Count Friday',
      message: language === 'ru' ? 'Плановая инвентаризация в пятницу после закрытия. Просьба подготовить отделы.' : 'Planned inventory count on Friday after closing. Please prepare departments.',
      recipients: 'stock_managers',
      priority: 'normal',
      sentAt: new Date(Date.now() - 259200000).toISOString(),
      readCount: 2,
      totalRecipients: 2,
    },
  ]);

  const handleAIDraft = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const prompt = language === 'ru'
      ? `Напиши профессиональное, дружелюбное объявление для сотрудников розничного магазина${title ? `. Тема: ${title}` : ''}. Формат: только текст объявления, 2-3 предложения. На русском языке.`
      : `Write a professional, friendly announcement for retail store staff${title ? `. Topic: ${title}` : ''}. Format: just the announcement text, 2-3 sentences. In English.`;

    try {
      const result = await generateText(prompt);
      if (result) {
        setMessage(result);
      }
    } catch (error) {
      console.error('AI draft error:', error);
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('', t.fillFields);
      return;
    }
    setIsSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Simulate sending
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setIsSending(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('✓', t.sent);
    setTitle('');
    setMessage('');
  };

  const getRecipientLabel = (r: RecipientGroup) => {
    const option = recipientOptions.find((o) => o.key === r);
    return option?.label || r;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
        <Text style={[styles.headerTitle, { color: colors.text, fontSize: typography.sizes.xl }]}>
          {t.title}
        </Text>
        <Pressable
          onPress={() => setShowHistory(!showHistory)}
          style={[styles.historyButton, { backgroundColor: colors.surface, borderRadius: borderRadius.full }]}
          accessibilityRole="button"
        >
          <Ionicons name={showHistory ? 'create' : 'time'} size={22} color={colors.primary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { padding: spacing.md, paddingBottom: spacing.xxl }]}
          keyboardShouldPersistTaps="handled"
        >
          {!showHistory ? (
            <>
              {/* AI Assist Banner */}
              <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                <Pressable onPress={handleAIDraft} disabled={isAILoading}>
                  <LinearGradient
                    colors={[colors.gradientStart, colors.gradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.aiBanner, { borderRadius: borderRadius.xl, marginBottom: spacing.lg }]}
                  >
                    <View style={styles.aiIcon}>
                      <Ionicons name="sparkles" size={24} color="#fff" />
                    </View>
                    <View style={styles.aiText}>
                      <Text style={styles.aiTitle}>{t.aiDraft}</Text>
                      <Text style={styles.aiSubtitle}>
                        {isAILoading
                          ? t.aiDrafting
                          : language === 'ru'
                            ? 'Newell AI поможет составить текст'
                            : 'Newell AI will help draft the message'
                        }
                      </Text>
                    </View>
                    {isAILoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.7)" />
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>

              {/* Compose Card */}
              <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                <Card style={[styles.composeCard, { marginBottom: spacing.lg }]}>
                  <TextInput
                    style={[styles.titleInput, {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.inputBorder,
                      borderRadius: borderRadius.md,
                      color: colors.text,
                      fontSize: typography.sizes.md,
                    }]}
                    placeholder={t.titlePlaceholder}
                    placeholderTextColor={colors.inputPlaceholder}
                    value={title}
                    onChangeText={setTitle}
                    accessibilityLabel={t.titlePlaceholder}
                  />
                  <TextInput
                    style={[styles.messageInput, {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.inputBorder,
                      borderRadius: borderRadius.md,
                      color: colors.text,
                      fontSize: typography.sizes.sm,
                    }]}
                    placeholder={t.messagePlaceholder}
                    placeholderTextColor={colors.inputPlaceholder}
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                    accessibilityLabel={t.messagePlaceholder}
                  />
                </Card>
              </Animated.View>

              {/* Recipients */}
              <Animated.View entering={FadeInDown.delay(300).duration(400)}>
                <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.sizes.md, marginBottom: spacing.sm }]}>
                  {t.recipients}
                </Text>
                <View style={[styles.recipientGrid, { marginBottom: spacing.lg }]}>
                  {recipientOptions.map((option) => (
                    <Pressable
                      key={option.key}
                      style={[
                        styles.recipientChip,
                        {
                          backgroundColor: recipients === option.key ? `${colors.primary}15` : colors.surface,
                          borderColor: recipients === option.key ? colors.primary : colors.border,
                          borderRadius: borderRadius.lg,
                        },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setRecipients(option.key);
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: recipients === option.key }}
                    >
                      <Ionicons
                        name={option.icon}
                        size={18}
                        color={recipients === option.key ? colors.primary : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.recipientLabel,
                          {
                            color: recipients === option.key ? colors.primary : colors.text,
                            fontSize: typography.sizes.sm,
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Animated.View>

              {/* Priority */}
              <Animated.View entering={FadeInDown.delay(400).duration(400)}>
                <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.sizes.md, marginBottom: spacing.sm }]}>
                  {t.priority}
                </Text>
                <View style={[styles.priorityRow, { marginBottom: spacing.xl }]}>
                  <Pressable
                    style={[
                      styles.priorityOption,
                      {
                        backgroundColor: priority === 'normal' ? `${colors.success}15` : colors.surface,
                        borderColor: priority === 'normal' ? colors.success : colors.border,
                        borderRadius: borderRadius.lg,
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setPriority('normal');
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: priority === 'normal' }}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={priority === 'normal' ? colors.success : colors.textLight}
                    />
                    <Text style={[styles.priorityLabel, { color: priority === 'normal' ? colors.success : colors.text, fontSize: typography.sizes.sm }]}>
                      {t.normal}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.priorityOption,
                      {
                        backgroundColor: priority === 'urgent' ? `${colors.error}15` : colors.surface,
                        borderColor: priority === 'urgent' ? colors.error : colors.border,
                        borderRadius: borderRadius.lg,
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setPriority('urgent');
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: priority === 'urgent' }}
                  >
                    <Ionicons
                      name="flame"
                      size={20}
                      color={priority === 'urgent' ? colors.error : colors.textLight}
                    />
                    <Text style={[styles.priorityLabel, { color: priority === 'urgent' ? colors.error : colors.text, fontSize: typography.sizes.sm }]}>
                      {t.urgent}
                    </Text>
                  </Pressable>
                </View>
              </Animated.View>

              {/* Send Button */}
              <Animated.View entering={FadeInDown.delay(500).duration(400)}>
                <Pressable
                  style={[
                    styles.sendButton,
                    {
                      backgroundColor: colors.primary,
                      borderRadius: borderRadius.lg,
                      opacity: isSending || !title.trim() || !message.trim() ? 0.6 : 1,
                    },
                  ]}
                  onPress={handleSend}
                  disabled={isSending || !title.trim() || !message.trim()}
                  accessibilityRole="button"
                  accessibilityLabel={t.send}
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="send" size={20} color="#fff" />
                      <Text style={[styles.sendButtonText, { fontSize: typography.sizes.md }]}>{t.send}</Text>
                    </>
                  )}
                </Pressable>
              </Animated.View>
            </>
          ) : (
            /* History View */
            <Animated.View entering={FadeIn.duration(300)}>
              <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.sizes.md, marginBottom: spacing.md }]}>
                {t.recent}
              </Text>
              {sentAnnouncements.length === 0 ? (
                <View style={styles.emptyHistory}>
                  <Ionicons name="megaphone-outline" size={48} color={colors.textLight} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
                    {t.noHistory}
                  </Text>
                </View>
              ) : (
                sentAnnouncements.map((item, index) => (
                  <Animated.View key={item.id} entering={FadeInDown.delay(index * 100).duration(300)}>
                    <Card style={[styles.historyCard, { marginBottom: spacing.sm }]}>
                      <View style={styles.historyHeader}>
                        <View style={styles.historyTitleRow}>
                          {item.priority === 'urgent' && (
                            <Ionicons name="flame" size={16} color={colors.error} style={{ marginRight: 4 }} />
                          )}
                          <Text style={[styles.historyTitle, { color: colors.text, fontSize: typography.sizes.md }]} numberOfLines={1}>
                            {item.title}
                          </Text>
                        </View>
                        <View style={[styles.recipientBadge, { backgroundColor: `${colors.primary}15`, borderRadius: borderRadius.sm }]}>
                          <Text style={[styles.recipientBadgeText, { color: colors.primary, fontSize: typography.sizes.xs }]}>
                            {getRecipientLabel(item.recipients)}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[styles.historyMessage, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}
                        numberOfLines={2}
                      >
                        {item.message}
                      </Text>
                      <View style={[styles.historyFooter, { borderTopColor: colors.borderLight }]}>
                        <Text style={[styles.historyDate, { color: colors.textLight, fontSize: typography.sizes.xs }]}>
                          {formatDate(item.sentAt)}
                        </Text>
                        <View style={styles.readInfo}>
                          <Ionicons name="eye-outline" size={14} color={colors.textLight} />
                          <Text style={[styles.readCount, { color: colors.textLight, fontSize: typography.sizes.xs }]}>
                            {t.readBy} {item.readCount}/{item.totalRecipients}
                          </Text>
                        </View>
                      </View>
                    </Card>
                  </Animated.View>
                ))
              )}
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  headerTitle: { fontWeight: '700' },
  historyButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {},
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  aiIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  aiText: { flex: 1 },
  aiTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  aiSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  composeCard: {},
  titleInput: {
    height: 48,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  messageInput: {
    minHeight: 120,
    borderWidth: 1,
    padding: 14,
    lineHeight: 20,
  },
  sectionTitle: { fontWeight: '600' },
  recipientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recipientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    gap: 6,
  },
  recipientLabel: { fontWeight: '500' },
  priorityRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  priorityLabel: { fontWeight: '600' },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    gap: 8,
  },
  sendButtonText: { color: '#fff', fontWeight: '600' },
  emptyHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: { marginTop: 12 },
  historyCard: {},
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  historyTitle: { fontWeight: '600', flex: 1 },
  recipientBadge: { paddingHorizontal: 8, paddingVertical: 3 },
  recipientBadgeText: { fontWeight: '600' },
  historyMessage: { lineHeight: 20, marginBottom: 12 },
  historyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  historyDate: {},
  readInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  readCount: {},
});
