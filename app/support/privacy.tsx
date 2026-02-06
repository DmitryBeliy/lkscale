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

const PRIVACY_CONTENT = {
  ru: {
    title: 'Политика конфиденциальности',
    lastUpdated: 'Последнее обновление: 1 января 2026',
    sections: [
      {
        title: '1. Сбор информации',
        content: `Мы собираем следующие типы информации:

• Информация учётной записи: email, имя пользователя
• Бизнес-данные: товары, заказы, клиенты, которые вы добавляете в приложение
• Данные устройства: тип устройства, операционная система, уникальные идентификаторы
• Данные об использовании: действия в приложении, статистика использования

Мы не собираем платёжные данные напрямую. Все платежи обрабатываются через защищённые сторонние сервисы.`,
      },
      {
        title: '2. Использование информации',
        content: `Собранная информация используется для:

• Предоставления и улучшения сервиса Lkscale
• Синхронизации данных между устройствами
• AI-анализа бизнес-данных для формирования рекомендаций
• Отправки важных уведомлений о работе сервиса
• Обеспечения безопасности и предотвращения мошенничества
• Технической поддержки пользователей`,
      },
      {
        title: '3. Хранение данных',
        content: `• Ваши данные хранятся на защищённых серверах Supabase
• Мы используем шифрование при передаче и хранении данных
• Доступ к данным имеют только авторизованные сотрудники
• Вы можете экспортировать или удалить свои данные в любое время

Срок хранения: данные хранятся в течение всего периода использования аккаунта и до 30 дней после удаления аккаунта.`,
      },
      {
        title: '4. Передача данных третьим лицам',
        content: `Мы не продаём ваши личные данные. Мы можем передавать данные:

• Провайдерам облачных услуг (Supabase) для хранения данных
• Аналитическим сервисам для улучшения продукта
• Правоохранительным органам по законному запросу

AI-анализ выполняется с использованием анонимизированных данных.`,
      },
      {
        title: '5. Ваши права',
        content: `Вы имеете право:

• Получить доступ к своим личным данным
• Исправить неточные данные
• Удалить свой аккаунт и все связанные данные
• Экспортировать данные в машиночитаемом формате
• Отозвать согласие на обработку данных

Для реализации этих прав свяжитесь с нами через форму обратной связи.`,
      },
      {
        title: '6. Безопасность',
        content: `Мы применяем следующие меры безопасности:

• Шифрование SSL/TLS для всех соединений
• Двухфакторная аутентификация (опционально)
• Регулярные проверки безопасности
• Ограниченный доступ сотрудников к данным
• Мониторинг подозрительной активности`,
      },
      {
        title: '7. Cookies и отслеживание',
        content: `Мы используем:

• Необходимые cookies для работы авторизации
• Аналитические cookies для улучшения сервиса
• Локальное хранилище для кэширования данных офлайн

Вы можете управлять cookies в настройках устройства.`,
      },
      {
        title: '8. Контакты',
        content: `По вопросам конфиденциальности обращайтесь:

Email: privacy@lkscale.ru
Адрес: Россия, Москва

Мы ответим на ваш запрос в течение 30 дней.`,
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: January 1, 2026',
    sections: [
      {
        title: '1. Information Collection',
        content: `We collect the following types of information:

• Account information: email, username
• Business data: products, orders, customers you add to the app
• Device data: device type, operating system, unique identifiers
• Usage data: in-app actions, usage statistics

We do not collect payment data directly. All payments are processed through secure third-party services.`,
      },
      {
        title: '2. Use of Information',
        content: `Collected information is used to:

• Provide and improve Lkscale service
• Sync data between devices
• AI analysis of business data to form recommendations
• Send important service notifications
• Ensure security and prevent fraud
• Provide technical support`,
      },
      {
        title: '3. Data Storage',
        content: `• Your data is stored on secure Supabase servers
• We use encryption for data transmission and storage
• Only authorized employees have access to data
• You can export or delete your data at any time

Retention period: data is stored throughout the account usage period and up to 30 days after account deletion.`,
      },
      {
        title: '4. Third-Party Data Sharing',
        content: `We do not sell your personal data. We may share data with:

• Cloud service providers (Supabase) for data storage
• Analytics services for product improvement
• Law enforcement upon lawful request

AI analysis is performed using anonymized data.`,
      },
      {
        title: '5. Your Rights',
        content: `You have the right to:

• Access your personal data
• Correct inaccurate data
• Delete your account and all associated data
• Export data in machine-readable format
• Withdraw consent for data processing

To exercise these rights, contact us through the feedback form.`,
      },
      {
        title: '6. Security',
        content: `We apply the following security measures:

• SSL/TLS encryption for all connections
• Two-factor authentication (optional)
• Regular security audits
• Limited employee access to data
• Monitoring of suspicious activity`,
      },
      {
        title: '7. Cookies and Tracking',
        content: `We use:

• Essential cookies for authentication
• Analytics cookies for service improvement
• Local storage for offline data caching

You can manage cookies in your device settings.`,
      },
      {
        title: '8. Contact',
        content: `For privacy questions, contact us:

Email: privacy@lkscale.ru
Address: Russia, Moscow

We will respond to your request within 30 days.`,
      },
    ],
  },
};

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, borderRadius, typography } = useTheme();
  const { language } = useLocalization();

  const content = PRIVACY_CONTENT[language] || PRIVACY_CONTENT.en;

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
          <Ionicons name="time-outline" size={18} color={colors.primary} />
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
