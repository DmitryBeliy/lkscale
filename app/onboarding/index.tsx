import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  ViewToken,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Extrapolate,
  SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useLocalization } from '@/localization';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
  titleKey: string;
  descriptionKey: string;
  features: string[];
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'sparkles',
    gradient: ['#2c7be5', '#6f42c1'],
    titleKey: 'aiManagement',
    descriptionKey: 'aiManagementDesc',
    features: ['aiForecasting', 'smartRecommendations', 'automatedReports'],
  },
  {
    id: '2',
    icon: 'business',
    gradient: ['#00d97e', '#00b368'],
    titleKey: 'multiWarehouse',
    descriptionKey: 'multiWarehouseDesc',
    features: ['stockTracking', 'transferManagement', 'lowStockAlerts'],
  },
  {
    id: '3',
    icon: 'bar-chart',
    gradient: ['#f6c343', '#d97706'],
    titleKey: 'advancedAnalytics',
    descriptionKey: 'advancedAnalyticsDesc',
    features: ['revenueCharts', 'profitMargins', 'customerInsights'],
  },
  {
    id: '4',
    icon: 'people',
    gradient: ['#e63757', '#c52a46'],
    titleKey: 'teamCRM',
    descriptionKey: 'teamCRMDesc',
    features: ['teamRoles', 'loyaltyProgram', 'customerSegmentation'],
  },
];

const OnboardingText = {
  ru: {
    aiManagement: 'AI-Управление бизнесом',
    aiManagementDesc: 'Искусственный интеллект анализирует ваши продажи и даёт персональные рекомендации для роста прибыли',
    aiForecasting: 'Прогнозирование спроса',
    smartRecommendations: 'Умные рекомендации',
    automatedReports: 'Автоматические отчёты',
    multiWarehouse: 'Мульти-складской контроль',
    multiWarehouseDesc: 'Управляйте несколькими складами и магазинами из одного приложения с полной синхронизацией',
    stockTracking: 'Отслеживание остатков',
    transferManagement: 'Перемещения между складами',
    lowStockAlerts: 'Уведомления о низких остатках',
    advancedAnalytics: 'Продвинутая аналитика',
    advancedAnalyticsDesc: 'Глубокий анализ бизнеса с интерактивными графиками и инсайтами в реальном времени',
    revenueCharts: 'Графики выручки и прибыли',
    profitMargins: 'Анализ маржинальности',
    customerInsights: 'Инсайты по клиентам',
    teamCRM: 'Команда и CRM',
    teamCRMDesc: 'Управляйте сотрудниками, отслеживайте активность и развивайте программу лояльности',
    teamRoles: 'Роли и права доступа',
    loyaltyProgram: 'Программа лояльности',
    customerSegmentation: 'Сегментация клиентов',
    skip: 'Пропустить',
    next: 'Далее',
    getStarted: 'Начать работу',
    welcome: 'Добро пожаловать!',
  },
  en: {
    aiManagement: 'AI-Powered Management',
    aiManagementDesc: 'Artificial intelligence analyzes your sales and provides personalized recommendations for profit growth',
    aiForecasting: 'Demand forecasting',
    smartRecommendations: 'Smart recommendations',
    automatedReports: 'Automated reports',
    multiWarehouse: 'Multi-Warehouse Control',
    multiWarehouseDesc: 'Manage multiple warehouses and stores from one app with full synchronization',
    stockTracking: 'Stock tracking',
    transferManagement: 'Inter-warehouse transfers',
    lowStockAlerts: 'Low stock alerts',
    advancedAnalytics: 'Advanced Analytics',
    advancedAnalyticsDesc: 'Deep business analysis with interactive charts and real-time insights',
    revenueCharts: 'Revenue & profit charts',
    profitMargins: 'Margin analysis',
    customerInsights: 'Customer insights',
    teamCRM: 'Team & CRM',
    teamCRMDesc: 'Manage employees, track activity, and develop your loyalty program',
    teamRoles: 'Roles & permissions',
    loyaltyProgram: 'Loyalty program',
    customerSegmentation: 'Customer segmentation',
    skip: 'Skip',
    next: 'Next',
    getStarted: 'Get Started',
    welcome: 'Welcome!',
  },
};

interface SlideItemProps {
  item: OnboardingSlide;
  index: number;
  scrollX: SharedValue<number>;
  language: 'ru' | 'en';
}

const AnimatedIcon: React.FC<{ icon: keyof typeof Ionicons.glyphMap; color: string }> = ({ icon, color }) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
    rotation.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 2000 }),
        withTiming(-5, { duration: 2000 })
      ),
      -1,
      true
    );
  }, [scale, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={icon} size={80} color={color} />
    </Animated.View>
  );
};

const SlideItem: React.FC<SlideItemProps> = ({ item, index, scrollX, language }) => {
  const t = OnboardingText[language];

  const inputRange = [
    (index - 1) * SCREEN_WIDTH,
    index * SCREEN_WIDTH,
    (index + 1) * SCREEN_WIDTH,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1, 0.8],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.slide, animatedStyle]}>
      <View style={styles.slideContent}>
        <LinearGradient
          colors={item.gradient}
          style={styles.iconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <AnimatedIcon icon={item.icon} color="#fff" />
        </LinearGradient>

        <Animated.Text
          entering={FadeInUp.delay(200).duration(500)}
          style={styles.title}
        >
          {t[item.titleKey as keyof typeof t]}
        </Animated.Text>

        <Animated.Text
          entering={FadeInUp.delay(400).duration(500)}
          style={styles.description}
        >
          {t[item.descriptionKey as keyof typeof t]}
        </Animated.Text>

        <Animated.View
          entering={FadeInDown.delay(600).duration(500)}
          style={styles.featuresContainer}
        >
          {item.features.map((feature, featureIndex) => (
            <Animated.View
              key={feature}
              entering={FadeInDown.delay(700 + featureIndex * 100).duration(400)}
              style={styles.featureItem}
            >
              <LinearGradient
                colors={item.gradient}
                style={styles.featureIcon}
              >
                <Ionicons name="checkmark" size={14} color="#fff" />
              </LinearGradient>
              <Text style={styles.featureText}>
                {t[feature as keyof typeof t]}
              </Text>
            </Animated.View>
          ))}
        </Animated.View>
      </View>
    </Animated.View>
  );
};

interface PaginationProps {
  data: OnboardingSlide[];
  scrollX: SharedValue<number>;
}

const Pagination: React.FC<PaginationProps> = ({ data, scrollX }) => {
  return (
    <View style={styles.pagination}>
      {data.map((_, index) => {
        const inputRange = [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ];

        const DotComponent = () => {
          const animatedStyle = useAnimatedStyle(() => {
            const width = interpolate(
              scrollX.value,
              inputRange,
              [10, 30, 10],
              Extrapolate.CLAMP
            );
            const opacity = interpolate(
              scrollX.value,
              inputRange,
              [0.3, 1, 0.3],
              Extrapolate.CLAMP
            );

            return { width, opacity };
          });

          return <Animated.View style={[styles.dot, animatedStyle]} />;
        };

        return <DotComponent key={index} />;
      })}
    </View>
  );
};

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { language } = useLocalization();
  const { completeOnboarding } = useOnboarding();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);

  const t = OnboardingText[language];

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) {
        setCurrentIndex(viewableItems[0].index ?? 0);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await completeOnboarding();
    router.replace('/login');
  };

  const handleScroll = (event: any) => {
    scrollX.value = event.nativeEvent.contentOffset.x;
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Skip Button */}
      <Animated.View
        entering={FadeIn.delay(500).duration(500)}
        style={[styles.skipButton, { top: insets.top + spacing.md }]}
      >
        <Pressable onPress={handleSkip} style={styles.skipPressable}>
          <Text style={styles.skipText}>{t.skip}</Text>
        </Pressable>
      </Animated.View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={({ item, index }) => (
          <SlideItem
            item={item}
            index={index}
            scrollX={scrollX}
            language={language}
          />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Footer */}
      <Animated.View
        entering={FadeInUp.delay(300).duration(500)}
        style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}
      >
        <Pagination data={SLIDES} scrollX={scrollX} />

        <Pressable
          style={[styles.nextButton, isLastSlide && styles.getStartedButton]}
          onPress={handleNext}
        >
          <LinearGradient
            colors={isLastSlide ? ['#00d97e', '#00b368'] : [colors.primary, colors.primaryDark]}
            style={styles.nextButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextButtonText}>
              {isLastSlide ? t.getStarted : t.next}
            </Text>
            <Ionicons
              name={isLastSlide ? 'rocket' : 'arrow-forward'}
              size={20}
              color="#fff"
            />
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipButton: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 10,
  },
  skipPressable: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  skipText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...shadows.xl,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sizes.md * 1.6,
    marginBottom: spacing.xl,
  },
  featuresContainer: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureText: {
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    backgroundColor: colors.background,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginHorizontal: 4,
  },
  nextButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  getStartedButton: {},
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  nextButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: '#fff',
  },
});
