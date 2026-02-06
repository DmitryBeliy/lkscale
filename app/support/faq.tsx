import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn, Layout } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/localization';
import { Card } from '@/components/ui';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

const FAQ_DATA: Record<'ru' | 'en', FAQItem[]> = {
  ru: [
    {
      id: '1',
      category: 'Начало работы',
      question: 'Как создать первый заказ?',
      answer: 'Перейдите на главную страницу и нажмите "Новый заказ". Выберите товары из каталога, укажите клиента и способ оплаты. Нажмите "Создать заказ" для завершения.',
      keywords: ['заказ', 'создание', 'новый', 'первый'],
    },
    {
      id: '2',
      category: 'Начало работы',
      question: 'Как добавить товары в каталог?',
      answer: 'Откройте раздел "Склад" → нажмите кнопку "+" → заполните информацию о товаре (название, цена, категория, остатки). Можно добавить фото и штрих-код.',
      keywords: ['товар', 'добавить', 'каталог', 'продукт'],
    },
    {
      id: '3',
      category: 'Начало работы',
      question: 'Как настроить магазин?',
      answer: 'Перейдите в Профиль → Настройки магазина. Здесь можно указать название бизнеса, загрузить логотип, настроить налоговую ставку и валюту.',
      keywords: ['настройка', 'магазин', 'профиль', 'бизнес'],
    },
    {
      id: '4',
      category: 'Склад и товары',
      question: 'Как работает отслеживание остатков?',
      answer: 'Система автоматически уменьшает остатки при создании заказов. Когда товар опускается ниже минимального остатка, вы получите уведомление. Можно настроить минимальный остаток для каждого товара.',
      keywords: ['остатки', 'склад', 'отслеживание', 'минимум'],
    },
    {
      id: '5',
      category: 'Склад и товары',
      question: 'Как сделать инвентаризацию?',
      answer: 'Перейдите в Склад → Корректировки → выберите "Инвентаризация". Отсканируйте или выберите товары, укажите фактическое количество. Система автоматически рассчитает разницу.',
      keywords: ['инвентаризация', 'корректировка', 'подсчёт'],
    },
    {
      id: '6',
      category: 'Склад и товары',
      question: 'Как списать товар?',
      answer: 'Откройте Склад → Операции → Списание. Выберите товар, укажите количество и причину списания (брак, истёк срок и т.д.). История списаний сохраняется в отчётах.',
      keywords: ['списание', 'брак', 'удаление', 'товар'],
    },
    {
      id: '7',
      category: 'Заказы и клиенты',
      question: 'Как найти заказ?',
      answer: 'Перейдите в раздел "Заказы" и используйте поиск по номеру заказа или имени клиента. Также можно фильтровать заказы по статусу.',
      keywords: ['заказ', 'поиск', 'найти', 'номер'],
    },
    {
      id: '8',
      category: 'Заказы и клиенты',
      question: 'Как добавить клиента?',
      answer: 'Клиенты добавляются автоматически при создании заказа. Также можно добавить вручную: Профиль → Клиенты → кнопка "+".',
      keywords: ['клиент', 'добавить', 'покупатель', 'контакт'],
    },
    {
      id: '9',
      category: 'AI-ассистент',
      question: 'Что умеет AI-ассистент?',
      answer: 'AI анализирует ваши продажи и даёт рекомендации: прогноз спроса, выявление прибыльных товаров, анализ клиентов, подготовка отчётов. Просто задайте вопрос в чате.',
      keywords: ['ai', 'ассистент', 'аналитика', 'рекомендации'],
    },
    {
      id: '10',
      category: 'AI-ассистент',
      question: 'Как получить отчёт от AI?',
      answer: 'Откройте вкладку "Ассистент" и выберите нужный тип отчёта из быстрых команд: дневной, недельный или месячный отчёт. AI сформирует подробный анализ.',
      keywords: ['отчёт', 'ai', 'аналитика', 'ассистент'],
    },
    {
      id: '11',
      category: 'Команда',
      question: 'Как пригласить сотрудника?',
      answer: 'Профиль → Команда → Пригласить сотрудника. Введите email, выберите роль (Кассир, Кладовщик, Администратор) и настройте права доступа.',
      keywords: ['команда', 'сотрудник', 'приглашение', 'роль'],
    },
    {
      id: '12',
      category: 'Команда',
      question: 'Какие роли доступны?',
      answer: 'Администратор — полный доступ. Кассир — создание заказов, работа с клиентами. Кладовщик — управление товарами и складом. Права можно настроить индивидуально.',
      keywords: ['роль', 'права', 'доступ', 'команда'],
    },
    {
      id: '13',
      category: 'Отчёты',
      question: 'Как экспортировать отчёт?',
      answer: 'Откройте нужный отчёт → нажмите кнопку "Поделиться" → выберите формат (PDF). Отчёт будет сформирован и вы сможете отправить его.',
      keywords: ['отчёт', 'экспорт', 'pdf', 'поделиться'],
    },
    {
      id: '14',
      category: 'Отчёты',
      question: 'Какие отчёты доступны?',
      answer: 'Доступны: дневной/недельный/месячный отчёт по продажам, отчёт по остаткам, анализ прибыльности, отчёт по клиентам, налоговый прогноз.',
      keywords: ['отчёты', 'типы', 'виды', 'доступные'],
    },
    {
      id: '15',
      category: 'Синхронизация',
      question: 'Как работает облачная синхронизация?',
      answer: 'При подключении к интернету данные автоматически синхронизируются с облаком. Вы можете работать офлайн — изменения синхронизируются при подключении.',
      keywords: ['синхронизация', 'облако', 'офлайн', 'данные'],
    },
  ],
  en: [
    {
      id: '1',
      category: 'Getting Started',
      question: 'How to create my first order?',
      answer: 'Go to the home page and tap "New Order". Select products from the catalog, specify the customer and payment method. Tap "Create Order" to finish.',
      keywords: ['order', 'create', 'new', 'first'],
    },
    {
      id: '2',
      category: 'Getting Started',
      question: 'How to add products to catalog?',
      answer: 'Open "Inventory" → tap "+" button → fill in product info (name, price, category, stock). You can add photos and barcode.',
      keywords: ['product', 'add', 'catalog', 'item'],
    },
    {
      id: '3',
      category: 'Getting Started',
      question: 'How to set up my store?',
      answer: 'Go to Profile → Store Settings. Here you can set business name, upload logo, configure tax rate and currency.',
      keywords: ['setup', 'store', 'profile', 'business'],
    },
    {
      id: '4',
      category: 'Inventory',
      question: 'How does stock tracking work?',
      answer: 'The system automatically decreases stock when orders are created. When a product falls below minimum stock, you\'ll receive a notification. You can set minimum stock for each product.',
      keywords: ['stock', 'inventory', 'tracking', 'minimum'],
    },
    {
      id: '5',
      category: 'Inventory',
      question: 'How to do inventory count?',
      answer: 'Go to Inventory → Adjustments → select "Stock Count". Scan or select products, enter actual quantity. The system will calculate the difference.',
      keywords: ['inventory', 'count', 'adjustment'],
    },
    {
      id: '6',
      category: 'Orders & Customers',
      question: 'How to find an order?',
      answer: 'Go to "Orders" section and use search by order number or customer name. You can also filter orders by status.',
      keywords: ['order', 'search', 'find', 'number'],
    },
    {
      id: '7',
      category: 'AI Assistant',
      question: 'What can the AI assistant do?',
      answer: 'AI analyzes your sales and provides recommendations: demand forecasting, profitable products analysis, customer insights, report generation. Just ask a question in the chat.',
      keywords: ['ai', 'assistant', 'analytics', 'recommendations'],
    },
    {
      id: '8',
      category: 'Team',
      question: 'How to invite a team member?',
      answer: 'Profile → Team → Invite Member. Enter email, select role (Cashier, Stock Manager, Admin) and configure permissions.',
      keywords: ['team', 'member', 'invite', 'role'],
    },
    {
      id: '9',
      category: 'Reports',
      question: 'How to export a report?',
      answer: 'Open the report → tap "Share" button → select format (PDF). The report will be generated and you can send it.',
      keywords: ['report', 'export', 'pdf', 'share'],
    },
    {
      id: '10',
      category: 'Sync',
      question: 'How does cloud sync work?',
      answer: 'When connected to internet, data automatically syncs to the cloud. You can work offline — changes sync when you reconnect.',
      keywords: ['sync', 'cloud', 'offline', 'data'],
    },
  ],
};

interface FAQItemProps {
  item: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}

const FAQItemComponent: React.FC<FAQItemProps> = ({ item, isExpanded, onToggle, index }) => {
  const { colors, spacing, borderRadius, typography } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(300)}
      layout={Layout.springify()}
    >
      <Card style={{ marginBottom: spacing.sm }}>
        <Pressable
          style={[styles.questionRow, { paddingVertical: spacing.md }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggle();
          }}
        >
          <View style={[styles.categoryBadge, { backgroundColor: `${colors.primary}15` }]}>
            <Text style={[styles.categoryText, { color: colors.primary, fontSize: typography.sizes.xs }]}>
              {item.category}
            </Text>
          </View>
          <Text style={[styles.question, { color: colors.text, fontSize: typography.sizes.md }]}>
            {item.question}
          </Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textLight}
          />
        </Pressable>

        {isExpanded && (
          <Animated.View
            entering={FadeIn.duration(200)}
            style={[styles.answerContainer, {
              borderTopWidth: 1,
              borderTopColor: colors.borderLight,
              paddingTop: spacing.md
            }]}
          >
            <Text style={[styles.answer, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
              {item.answer}
            </Text>
          </Animated.View>
        )}
      </Card>
    </Animated.View>
  );
};

export default function FAQScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, borderRadius, typography, shadows } = useTheme();
  const { language } = useLocalization();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const faqItems = FAQ_DATA[language] || FAQ_DATA.en;

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return faqItems;

    const query = searchQuery.toLowerCase();
    return faqItems.filter(item =>
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.keywords.some(k => k.toLowerCase().includes(query))
    );
  }, [faqItems, searchQuery]);

  const categories = useMemo(() => {
    const cats = new Set(filteredItems.map(item => item.category));
    return Array.from(cats);
  }, [filteredItems]);

  const handleToggle = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

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
          {language === 'ru' ? 'Помощь и FAQ' : 'Help & FAQ'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
      }]}>
        <View style={[styles.searchInput, {
          backgroundColor: colors.background,
          borderRadius: borderRadius.lg,
        }]}>
          <Ionicons name="search" size={20} color={colors.textLight} />
          <TextInput
            style={[styles.searchTextInput, { color: colors.text, fontSize: typography.sizes.md }]}
            placeholder={language === 'ru' ? 'Поиск по вопросам...' : 'Search questions...'}
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textLight} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={[styles.content, { padding: spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredItems.length === 0 ? (
          <Animated.View entering={FadeIn} style={styles.emptyState}>
            <Ionicons name="help-circle-outline" size={64} color={colors.textLight} />
            <Text style={[styles.emptyText, { color: colors.textSecondary, fontSize: typography.sizes.md }]}>
              {language === 'ru' ? 'Ничего не найдено' : 'No results found'}
            </Text>
          </Animated.View>
        ) : (
          categories.map(category => (
            <View key={category} style={{ marginBottom: spacing.lg }}>
              <Text style={[styles.sectionTitle, {
                color: colors.text,
                fontSize: typography.sizes.lg,
                marginBottom: spacing.sm,
              }]}>
                {category}
              </Text>
              {filteredItems
                .filter(item => item.category === category)
                .map((item, index) => (
                  <FAQItemComponent
                    key={item.id}
                    item={item}
                    index={index}
                    isExpanded={expandedId === item.id}
                    onToggle={() => handleToggle(item.id)}
                  />
                ))}
            </View>
          ))
        )}

        {/* Contact Support Card */}
        <Card style={[styles.contactCard, { marginTop: spacing.lg }]}>
          <View style={[styles.contactIcon, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="chatbubbles" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.contactTitle, { color: colors.text, fontSize: typography.sizes.lg }]}>
            {language === 'ru' ? 'Не нашли ответ?' : 'Didn\'t find an answer?'}
          </Text>
          <Text style={[styles.contactText, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
            {language === 'ru'
              ? 'Свяжитесь с нашей службой поддержки'
              : 'Contact our support team'}
          </Text>
          <Pressable
            style={[styles.contactButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/support/feedback');
            }}
          >
            <Ionicons name="mail" size={20} color="#fff" />
            <Text style={[styles.contactButtonText, { fontSize: typography.sizes.md }]}>
              {language === 'ru' ? 'Написать нам' : 'Contact Us'}
            </Text>
          </Pressable>
        </Card>

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
  },
  searchContainer: {},
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchTextInput: {
    flex: 1,
  },
  content: {},
  sectionTitle: {
    fontWeight: '600',
  },
  questionRow: {
    gap: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  categoryText: {
    fontWeight: '600',
  },
  question: {
    flex: 1,
    fontWeight: '500',
    lineHeight: 22,
  },
  answerContainer: {},
  answer: {
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
  },
  contactCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  contactIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  contactTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  contactText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
