import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/localization';
import { Card } from '@/components/ui';

const TERMS_CONTENT = {
  ru: {
    title: 'Пользовательское соглашение',
    lastUpdated: 'Последнее обновление: 1 января 2026',
    sections: [
      {
        title: '1. Общие положения',
        content: `Настоящее Пользовательское соглашение регулирует использование мобильного приложения Lkscale (далее — «Приложение»).

Используя Приложение, вы соглашаетесь с условиями данного соглашения. Если вы не согласны с какими-либо условиями, пожалуйста, прекратите использование Приложения.

Lkscale предоставляет инструменты для управления бизнесом: учёт товаров, заказов, клиентов, аналитика и AI-рекомендации.`,
      },
      {
        title: '2. Регистрация и учётная запись',
        content: `Для использования Приложения необходимо создать учётную запись. Вы обязуетесь:

• Предоставить достоверную информацию при регистрации
• Обеспечить конфиденциальность своих учётных данных
• Немедленно уведомить нас о несанкционированном доступе
• Использовать только одну учётную запись

Мы оставляем за собой право приостановить или удалить учётную запись при нарушении условий соглашения.`,
      },
      {
        title: '3. Правила использования',
        content: `При использовании Приложения запрещается:

• Нарушать законодательство Российской Федерации
• Передавать вредоносное программное обеспечение
• Пытаться получить несанкционированный доступ к системам
• Использовать автоматизированные средства сбора данных
• Создавать поддельные учётные записи
• Использовать Приложение для незаконной деятельности
• Перепродавать или передавать доступ третьим лицам`,
      },
      {
        title: '4. Платные услуги',
        content: `Приложение предлагает бесплатные и платные функции.

Платные подписки:
• Оплата производится через App Store / Google Play
• Подписка автоматически продлевается
• Отмена возможна в настройках магазина приложений
• Возврат средств осуществляется согласно политике магазина

Мы оставляем за собой право изменять цены с предварительным уведомлением пользователей.`,
      },
      {
        title: '5. Интеллектуальная собственность',
        content: `Все права на Приложение, включая дизайн, код, логотипы и контент, принадлежат разработчикам Lkscale.

Вам предоставляется ограниченная лицензия на использование Приложения для личных и коммерческих целей согласно условиям подписки.

Вы сохраняете права на свои бизнес-данные, загруженные в Приложение.`,
      },
      {
        title: '6. AI-функции и рекомендации',
        content: `Приложение использует искусственный интеллект для анализа данных и формирования рекомендаций.

• AI-рекомендации носят информационный характер
• Мы не гарантируем точность прогнозов и анализа
• Принятие бизнес-решений остаётся ответственностью пользователя
• Данные для AI обрабатываются в анонимизированном виде`,
      },
      {
        title: '7. Ограничение ответственности',
        content: `Приложение предоставляется «как есть». Мы не несём ответственности за:

• Убытки, связанные с использованием или невозможностью использования Приложения
• Потерю данных по причинам, не зависящим от нас
• Ошибки в AI-рекомендациях и прогнозах
• Действия третьих лиц

Максимальная ответственность ограничивается суммой, уплаченной за подписку.`,
      },
      {
        title: '8. Изменение условий',
        content: `Мы можем изменять условия соглашения. При существенных изменениях:

• Мы уведомим вас через Приложение или email
• Новые условия вступают в силу через 30 дней
• Продолжение использования означает согласие с изменениями

Если вы не согласны с изменениями, вы можете удалить учётную запись.`,
      },
      {
        title: '9. Прекращение использования',
        content: `Вы можете прекратить использование в любое время, удалив учётную запись.

Мы можем прекратить предоставление услуг при:
• Нарушении условий соглашения
• Подозрении в мошенничестве
• Требовании законодательства

При прекращении данные могут быть удалены в соответствии с политикой конфиденциальности.`,
      },
      {
        title: '10. Применимое право',
        content: `Настоящее соглашение регулируется законодательством Российской Федерации.

Споры разрешаются путём переговоров. При невозможности разрешения — в суде по месту нахождения разработчика.

По вопросам соглашения: legal@lkscale.ru`,
      },
    ],
  },
  en: {
    title: 'Terms of Service',
    lastUpdated: 'Last updated: January 1, 2026',
    sections: [
      {
        title: '1. General Provisions',
        content: `These Terms of Service govern the use of the Lkscale mobile application (the "App").

By using the App, you agree to these terms. If you disagree with any terms, please stop using the App.

Lkscale provides business management tools: inventory, orders, customers, analytics, and AI recommendations.`,
      },
      {
        title: '2. Registration and Account',
        content: `To use the App, you must create an account. You agree to:

• Provide accurate information during registration
• Keep your credentials confidential
• Immediately notify us of unauthorized access
• Use only one account

We reserve the right to suspend or delete accounts that violate these terms.`,
      },
      {
        title: '3. Usage Rules',
        content: `When using the App, you must not:

• Violate applicable laws
• Transmit malicious software
• Attempt unauthorized access to systems
• Use automated data collection tools
• Create fake accounts
• Use the App for illegal activities
• Resell or transfer access to third parties`,
      },
      {
        title: '4. Paid Services',
        content: `The App offers free and paid features.

Paid subscriptions:
• Payment is processed through App Store / Google Play
• Subscriptions auto-renew
• Cancellation is available in app store settings
• Refunds follow app store policies

We reserve the right to change prices with prior user notification.`,
      },
      {
        title: '5. Intellectual Property',
        content: `All rights to the App, including design, code, logos, and content, belong to Lkscale developers.

You are granted a limited license to use the App for personal and commercial purposes according to subscription terms.

You retain rights to your business data uploaded to the App.`,
      },
      {
        title: '6. AI Features and Recommendations',
        content: `The App uses artificial intelligence for data analysis and recommendations.

• AI recommendations are informational only
• We do not guarantee accuracy of forecasts and analysis
• Business decisions remain the user's responsibility
• Data for AI is processed in anonymized form`,
      },
      {
        title: '7. Limitation of Liability',
        content: `The App is provided "as is". We are not liable for:

• Losses related to use or inability to use the App
• Data loss for reasons beyond our control
• Errors in AI recommendations and forecasts
• Third-party actions

Maximum liability is limited to subscription fees paid.`,
      },
      {
        title: '8. Changes to Terms',
        content: `We may change terms. For significant changes:

• We will notify you via App or email
• New terms take effect after 30 days
• Continued use means acceptance of changes

If you disagree with changes, you may delete your account.`,
      },
      {
        title: '9. Termination',
        content: `You may stop using the service at any time by deleting your account.

We may terminate services for:
• Terms violation
• Suspected fraud
• Legal requirements

Upon termination, data may be deleted according to our privacy policy.`,
      },
      {
        title: '10. Governing Law',
        content: `These terms are governed by the laws of the Russian Federation.

Disputes are resolved through negotiation. If resolution is not possible — in court at the developer's location.

For terms questions: legal@lkscale.ru`,
      },
    ],
  },
};

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, borderRadius, typography } = useTheme();
  const { language } = useLocalization();

  const content = TERMS_CONTENT[language] || TERMS_CONTENT.en;

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
        <Text style={[styles.headerTitle, { color: colors.text, fontSize: typography.sizes.xl }]} numberOfLines={1}>
          {content.title}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { padding: spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Last Updated Badge */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={[styles.badge, {
            backgroundColor: `${colors.primary}15`,
            borderRadius: borderRadius.md,
          }]}
        >
          <Ionicons name="document-text-outline" size={18} color={colors.primary} />
          <Text style={[styles.badgeText, { color: colors.primary, fontSize: typography.sizes.sm }]}>
            {content.lastUpdated}
          </Text>
        </Animated.View>

        {/* Sections */}
        {content.sections.map((section, index) => (
          <Animated.View
            key={section.title}
            entering={FadeInDown.delay(200 + index * 50).duration(400)}
          >
            <Card style={{ marginBottom: spacing.md }}>
              <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.sizes.lg }]}>
                {section.title}
              </Text>
              <Text style={[styles.sectionContent, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
                {section.content}
              </Text>
            </Card>
          </Animated.View>
        ))}

        <View style={{ height: insets.bottom + spacing.xl }} />
      </ScrollView>
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
    flex: 1,
    textAlign: 'center',
  },
  content: {},
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 16,
  },
  badgeText: {
    fontWeight: '500',
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionContent: {
    lineHeight: 22,
  },
});
