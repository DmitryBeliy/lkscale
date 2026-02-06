import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/localization';
import { Card, Button } from '@/components/ui';

type FeedbackType = 'suggestion' | 'bug' | 'question' | 'other';

interface FeedbackOption {
  type: FeedbackType;
  icon: keyof typeof Ionicons.glyphMap;
  labelRu: string;
  labelEn: string;
  color: string;
}

const FEEDBACK_OPTIONS: FeedbackOption[] = [
  { type: 'suggestion', icon: 'bulb', labelRu: 'Предложение', labelEn: 'Suggestion', color: '#f6c343' },
  { type: 'bug', icon: 'bug', labelRu: 'Сообщить об ошибке', labelEn: 'Report a Bug', color: '#e63757' },
  { type: 'question', icon: 'help-circle', labelRu: 'Вопрос', labelEn: 'Question', color: '#2c7be5' },
  { type: 'other', icon: 'chatbubble', labelRu: 'Другое', labelEn: 'Other', color: '#6f42c1' },
];

export default function FeedbackScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, borderRadius, typography, shadows } = useTheme();
  const { language } = useLocalization();
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const t = {
    title: language === 'ru' ? 'Обратная связь' : 'Feedback',
    typeLabel: language === 'ru' ? 'Тип обращения' : 'Feedback Type',
    subjectLabel: language === 'ru' ? 'Тема' : 'Subject',
    subjectPlaceholder: language === 'ru' ? 'Кратко опишите тему' : 'Briefly describe the topic',
    messageLabel: language === 'ru' ? 'Сообщение' : 'Message',
    messagePlaceholder: language === 'ru' ? 'Расскажите подробнее...' : 'Tell us more...',
    emailLabel: language === 'ru' ? 'Email для ответа' : 'Reply Email',
    emailPlaceholder: language === 'ru' ? 'Ваш email' : 'Your email',
    submit: language === 'ru' ? 'Отправить' : 'Submit',
    successTitle: language === 'ru' ? 'Спасибо!' : 'Thank You!',
    successMessage: language === 'ru'
      ? 'Ваше сообщение отправлено. Мы ответим в ближайшее время.'
      : 'Your message has been sent. We\'ll respond soon.',
    sendAnother: language === 'ru' ? 'Отправить ещё' : 'Send Another',
    required: language === 'ru' ? 'Обязательное поле' : 'Required field',
  };

  const handleSubmit = async () => {
    if (!feedbackType) {
      Alert.alert(
        language === 'ru' ? 'Ошибка' : 'Error',
        language === 'ru' ? 'Выберите тип обращения' : 'Please select a feedback type'
      );
      return;
    }

    if (!message.trim()) {
      Alert.alert(
        language === 'ru' ? 'Ошибка' : 'Error',
        language === 'ru' ? 'Введите сообщение' : 'Please enter a message'
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSuccess(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSuccess(false);
    setFeedbackType(null);
    setSubject('');
    setMessage('');
    setEmail('');
  };

  if (isSuccess) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, {
          paddingTop: insets.top + spacing.md,
          backgroundColor: colors.surface,
          borderBottomColor: colors.borderLight,
        }]}>
          <Pressable
            style={[styles.backButton, { backgroundColor: colors.background }]}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text, fontSize: typography.sizes.xl }]}>
            {t.title}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.successContainer}>
          <Animated.View entering={FadeIn.duration(500)}>
            <LinearGradient
              colors={['#00d97e', '#00b368']}
              style={styles.successIcon}
            >
              <Ionicons name="checkmark" size={64} color="#fff" />
            </LinearGradient>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(200).duration(500)}
            style={[styles.successTitle, { color: colors.text, fontSize: typography.sizes.xxl }]}
          >
            {t.successTitle}
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(300).duration(500)}
            style={[styles.successMessage, { color: colors.textSecondary, fontSize: typography.sizes.md }]}
          >
            {t.successMessage}
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.successButtons}>
            <Button
              title={t.sendAnother}
              variant="outline"
              onPress={handleReset}
            />
            <Button
              title={language === 'ru' ? 'Готово' : 'Done'}
              onPress={() => router.back()}
            />
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, {
        paddingTop: insets.top + spacing.md,
        backgroundColor: colors.surface,
        borderBottomColor: colors.borderLight,
      }]}>
        <Pressable
          style={[styles.backButton, { backgroundColor: colors.background }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text, fontSize: typography.sizes.xl }]}>
          {t.title}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { padding: spacing.md }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Feedback Type Selection */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Text style={[styles.label, { color: colors.text, fontSize: typography.sizes.md }]}>
              {t.typeLabel} *
            </Text>
            <View style={styles.typeGrid}>
              {FEEDBACK_OPTIONS.map((option, index) => (
                <Pressable
                  key={option.type}
                  style={[
                    styles.typeOption,
                    {
                      backgroundColor: feedbackType === option.type
                        ? `${option.color}15`
                        : colors.surface,
                      borderColor: feedbackType === option.type
                        ? option.color
                        : colors.borderLight,
                      borderRadius: borderRadius.lg,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFeedbackType(option.type);
                  }}
                >
                  <View style={[styles.typeIcon, { backgroundColor: `${option.color}20` }]}>
                    <Ionicons name={option.icon} size={24} color={option.color} />
                  </View>
                  <Text style={[
                    styles.typeLabel,
                    {
                      color: feedbackType === option.type ? option.color : colors.text,
                      fontSize: typography.sizes.sm,
                    }
                  ]}>
                    {language === 'ru' ? option.labelRu : option.labelEn}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Subject */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Text style={[styles.label, { color: colors.text, fontSize: typography.sizes.md, marginTop: spacing.lg }]}>
              {t.subjectLabel}
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: colors.surface,
                borderColor: colors.borderLight,
                borderRadius: borderRadius.md,
                color: colors.text,
                fontSize: typography.sizes.md,
              }]}
              placeholder={t.subjectPlaceholder}
              placeholderTextColor={colors.textLight}
              value={subject}
              onChangeText={setSubject}
            />
          </Animated.View>

          {/* Message */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Text style={[styles.label, { color: colors.text, fontSize: typography.sizes.md, marginTop: spacing.lg }]}>
              {t.messageLabel} *
            </Text>
            <TextInput
              style={[styles.textArea, {
                backgroundColor: colors.surface,
                borderColor: colors.borderLight,
                borderRadius: borderRadius.md,
                color: colors.text,
                fontSize: typography.sizes.md,
              }]}
              placeholder={t.messagePlaceholder}
              placeholderTextColor={colors.textLight}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </Animated.View>

          {/* Email */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <Text style={[styles.label, { color: colors.text, fontSize: typography.sizes.md, marginTop: spacing.lg }]}>
              {t.emailLabel}
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: colors.surface,
                borderColor: colors.borderLight,
                borderRadius: borderRadius.md,
                color: colors.text,
                fontSize: typography.sizes.md,
              }]}
              placeholder={t.emailPlaceholder}
              placeholderTextColor={colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Animated.View>

          {/* Submit Button */}
          <Animated.View entering={FadeInDown.delay(500).duration(400)} style={{ marginTop: spacing.xl }}>
            <Button
              title={t.submit}
              onPress={handleSubmit}
              loading={isSubmitting}
              size="lg"
              icon={<Ionicons name="send" size={20} color="#fff" />}
            />
          </Animated.View>

          <View style={{ height: insets.bottom + spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '700',
  },
  content: {},
  label: {
    fontWeight: '600',
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  typeLabel: {
    fontWeight: '500',
    textAlign: 'center',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
  },
  textArea: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    minHeight: 150,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  successMessage: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  successButtons: {
    gap: 12,
    width: '100%',
  },
});
