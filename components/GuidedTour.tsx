import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
  Pressable,
  LayoutRectangle,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface TourStep {
  id: string;
  target: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  highlight?: boolean;
}

interface GuidedTourProps {
  visible: boolean;
  steps: TourStep[];
  currentStep: number;
  targetLayouts: Record<string, LayoutRectangle>;
  onNext: () => void;
  onSkip: () => void;
  onComplete: () => void;
  language?: 'ru' | 'en';
}

interface TooltipProps {
  step: TourStep;
  targetLayout: LayoutRectangle | undefined;
  onNext: () => void;
  onSkip: () => void;
  isLast: boolean;
  currentStep: number;
  totalSteps: number;
  language: 'ru' | 'en';
}

const Tooltip: React.FC<TooltipProps> = ({
  step,
  targetLayout,
  onNext,
  onSkip,
  isLast,
  currentStep,
  totalSteps,
  language,
}) => {
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const t = {
    next: language === 'ru' ? 'Далее' : 'Next',
    skip: language === 'ru' ? 'Пропустить' : 'Skip',
    done: language === 'ru' ? 'Готово' : 'Done',
    step: language === 'ru' ? 'Шаг' : 'Step',
    of: language === 'ru' ? 'из' : 'of',
  };

  // Calculate tooltip position based on target
  const getTooltipPosition = () => {
    if (!targetLayout) {
      return { top: SCREEN_HEIGHT / 3, left: spacing.lg, right: spacing.lg };
    }

    const position = step.position || 'bottom';
    const tooltipWidth = SCREEN_WIDTH - spacing.lg * 2;
    const tooltipHeight = 200;

    let top = 0;
    let left = spacing.lg;

    switch (position) {
      case 'top':
        top = targetLayout.y - tooltipHeight - spacing.md;
        break;
      case 'bottom':
        top = targetLayout.y + targetLayout.height + spacing.md;
        break;
      default:
        top = targetLayout.y + targetLayout.height + spacing.md;
    }

    // Ensure tooltip stays within screen bounds
    if (top < insets.top + spacing.md) {
      top = insets.top + spacing.md;
    }
    if (top + tooltipHeight > SCREEN_HEIGHT - insets.bottom - spacing.lg) {
      top = targetLayout.y - tooltipHeight - spacing.md;
    }

    return { top, left, right: spacing.lg };
  };

  const tooltipPosition = getTooltipPosition();

  return (
    <Animated.View
      style={[
        styles.tooltipContainer,
        tooltipPosition,
        animatedStyle,
      ]}
    >
      <View style={styles.tooltip}>
        {/* Progress */}
        <View style={styles.progressRow}>
          <View style={styles.progressDots}>
            {Array.from({ length: totalSteps }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index <= currentStep && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
          <Text style={styles.progressText}>
            {t.step} {currentStep + 1} {t.of} {totalSteps}
          </Text>
        </View>

        {/* Content */}
        <Text style={styles.tooltipTitle}>{step.title}</Text>
        <Text style={styles.tooltipDescription}>{step.description}</Text>

        {/* Actions */}
        <View style={styles.tooltipActions}>
          <Pressable
            style={styles.skipButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSkip();
            }}
          >
            <Text style={styles.skipText}>{t.skip}</Text>
          </Pressable>

          <Pressable
            style={styles.nextButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onNext();
            }}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.nextText}>{isLast ? t.done : t.next}</Text>
              <Ionicons
                name={isLast ? 'checkmark' : 'arrow-forward'}
                size={18}
                color="#fff"
              />
            </LinearGradient>
          </Pressable>
        </View>
      </View>

      {/* Arrow pointing to target */}
      {targetLayout && (
        <View
          style={[
            styles.arrow,
            step.position === 'top' ? styles.arrowDown : styles.arrowUp,
            {
              left: Math.min(
                Math.max(targetLayout.x + targetLayout.width / 2 - 10, 20),
                SCREEN_WIDTH - spacing.lg * 2 - 20
              ),
            },
          ]}
        />
      )}
    </Animated.View>
  );
};

export const GuidedTour: React.FC<GuidedTourProps> = ({
  visible,
  steps,
  currentStep,
  targetLayouts,
  onNext,
  onSkip,
  onComplete,
  language = 'ru',
}) => {
  const overlayOpacity = useSharedValue(0);
  const spotlightScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 300 });
      spotlightScale.value = withSpring(1, { damping: 15 });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 200 });
      spotlightScale.value = 0;
    }
  }, [visible]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  if (!visible || steps.length === 0) return null;

  const currentTourStep = steps[currentStep];
  const targetLayout = targetLayouts[currentTourStep?.target];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      onNext();
    }
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onSkip}>
      <View style={styles.container}>
        {/* Overlay with spotlight */}
        <Animated.View style={[styles.overlay, overlayAnimatedStyle]}>
          {/* Semi-transparent background */}
          <View style={styles.overlayBackground} />

          {/* Spotlight on target element */}
          {targetLayout && currentTourStep?.highlight !== false && (
            <View
              style={[
                styles.spotlight,
                {
                  top: targetLayout.y - spacing.sm,
                  left: targetLayout.x - spacing.sm,
                  width: targetLayout.width + spacing.sm * 2,
                  height: targetLayout.height + spacing.sm * 2,
                  borderRadius: borderRadius.lg,
                },
              ]}
            />
          )}
        </Animated.View>

        {/* Tooltip */}
        <Tooltip
          step={currentTourStep}
          targetLayout={targetLayout}
          onNext={handleNext}
          onSkip={onSkip}
          isLast={isLastStep}
          currentStep={currentStep}
          totalSteps={steps.length}
          language={language}
        />
      </View>
    </Modal>
  );
};

// Hook for registering tour targets
export const useTourTarget = (id: string, onMeasure: (id: string, layout: LayoutRectangle) => void) => {
  const viewRef = useRef<View>(null);

  const measureLayout = useCallback(() => {
    if (viewRef.current) {
      viewRef.current.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) {
          onMeasure(id, { x, y, width, height });
        }
      });
    }
  }, [id, onMeasure]);

  useEffect(() => {
    // Small delay to ensure layout is complete
    const timeout = setTimeout(measureLayout, 100);
    return () => clearTimeout(timeout);
  }, [measureLayout]);

  return { ref: viewRef, onLayout: measureLayout };
};

// Pre-defined tour steps for main screens
export const DASHBOARD_TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    target: 'header',
    title: 'Добро пожаловать в Lkscale!',
    description: 'Давайте познакомимся с основными функциями приложения. Это займёт меньше минуты.',
    position: 'bottom',
    highlight: false,
  },
  {
    id: 'kpi',
    target: 'kpi_cards',
    title: 'Ключевые показатели',
    description: 'Здесь отображаются основные метрики вашего бизнеса: продажи, заказы, баланс и товары с низким остатком.',
    position: 'bottom',
  },
  {
    id: 'quick_actions',
    target: 'quick_actions',
    title: 'Быстрые действия',
    description: 'Создавайте заказы, управляйте складом и просматривайте клиентов в один клик.',
    position: 'top',
  },
  {
    id: 'nav_orders',
    target: 'nav_orders',
    title: 'Заказы',
    description: 'Все ваши заказы в одном месте. Создавайте, редактируйте и отслеживайте статусы.',
    position: 'top',
  },
  {
    id: 'nav_inventory',
    target: 'nav_inventory',
    title: 'Склад',
    description: 'Управление товарами, категориями и остатками. Сканируйте штрих-коды для быстрого поиска.',
    position: 'top',
  },
  {
    id: 'nav_assistant',
    target: 'nav_assistant',
    title: 'AI-Ассистент',
    description: 'Ваш персональный бизнес-аналитик. Задавайте вопросы и получайте отчёты на основе ваших данных.',
    position: 'top',
  },
  {
    id: 'complete',
    target: 'header',
    title: 'Готово! 🎉',
    description: 'Вы познакомились с основами. Исследуйте приложение и используйте AI-ассистента, если возникнут вопросы.',
    position: 'bottom',
    highlight: false,
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  spotlight: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    // Create "cut out" effect using shadow
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  tooltipContainer: {
    position: 'absolute',
    zIndex: 100,
  },
  tooltip: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.xl,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderLight,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
  },
  tooltipTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tooltipDescription: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: typography.sizes.md * 1.5,
    marginBottom: spacing.lg,
  },
  tooltipActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  skipText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  nextButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  nextText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: '#fff',
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  arrowUp: {
    top: -10,
    borderBottomWidth: 10,
    borderBottomColor: '#fff',
  },
  arrowDown: {
    bottom: -10,
    borderTopWidth: 10,
    borderTopColor: '#fff',
  },
});

export default GuidedTour;
