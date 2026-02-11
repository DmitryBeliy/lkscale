import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button } from '@/components/ui';
import { getAuthState, subscribeAuth, logout } from '@/store/authStore';
import { getDataState, subscribeData } from '@/store/dataStore';
import { useLocalization, Language } from '@/localization';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useTheme } from '@/contexts/ThemeContext';
import { User, AppSettings } from '@/types';
import { AISmartSearch } from '@/components/AISmartSearch';
import { AIVirtualGuide } from '@/components/AIVirtualGuide';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightElement?: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  gradient?: [string, string];
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { t, language, setLanguage, formatCurrency, formatDate } = useLocalization();
  const { isDemoMode, toggleDemoMode, resetOnboarding } = useOnboarding();
  const { colors, spacing, typography, borderRadius, shadows, isDark, toggleTheme } = useTheme();

  const [user, setUser] = useState<User | null>(getAuthState().user);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showAISearch, setShowAISearch] = useState(false);
  const [showAIGuide, setShowAIGuide] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    notifications: true,
    darkMode: isDark,
    language: language,
    autoSync: true,
  });

  const MenuItem: React.FC<MenuItemProps> = ({
    icon,
    iconColor = colors.primary,
    title,
    subtitle,
    onPress,
    showArrow = true,
    rightElement,
    badge,
    badgeColor = colors.primary,
    gradient,
  }) => (
    <Pressable
      style={[styles.menuItem, { borderBottomColor: colors.borderLight }]}
      onPress={onPress}
      disabled={!onPress}
    >
      {gradient ? (
        <LinearGradient colors={gradient} style={[styles.menuIcon, { borderRadius: borderRadius.md }]}>
          <Ionicons name={icon} size={22} color="#fff" />
        </LinearGradient>
      ) : (
        <View style={[styles.menuIcon, { backgroundColor: `${iconColor}15`, borderRadius: borderRadius.md }]}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
      )}
      <View style={styles.menuContent}>
        <View style={styles.menuTitleRow}>
          <Text style={[styles.menuTitle, { color: colors.text, fontSize: typography.sizes.md }]}>{title}</Text>
          {badge && (
            <View style={[styles.menuBadge, { backgroundColor: `${badgeColor}15`, borderRadius: borderRadius.sm }]}>
              <Text style={[styles.menuBadgeText, { color: badgeColor }]}>{badge}</Text>
            </View>
          )}
        </View>
        {subtitle && <Text style={[styles.menuSubtitle, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>{subtitle}</Text>}
      </View>
      {rightElement || (showArrow && onPress && (
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      ))}
    </Pressable>
  );

  useEffect(() => {
    const unsubAuth = subscribeAuth(() => {
      setUser(getAuthState().user);
    });

    const unsubData = subscribeData(() => {
      setLastSync(getDataState().lastSync);
    });

    return () => {
      unsubAuth();
      unsubData();
    };
  }, []);

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      t.profile.logout,
      t.profile.logoutConfirm,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.profile.logout,
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const handleMenuPress = (item: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(item, language === 'ru' ? `Переход в раздел "${item}"` : `Navigate to "${item}"`);
  };

  const toggleSetting = (key: keyof AppSettings) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLanguageSelect = async (lang: Language) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setLanguage(lang);
    setSettings((prev) => ({ ...prev, language: lang }));
    setShowLanguageModal(false);
  };

  const formatLastSync = (dateString: string | null) => {
    if (!dateString) return t.profile.never;
    return formatDate(dateString, 'short');
  };

  const getLanguageLabel = () => {
    return language === 'ru' ? t.profile.russian : t.profile.english;
  };

  const handleDemoModeToggle = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await toggleDemoMode();
  };

  const handleResetOnboarding = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      language === 'ru' ? 'Сбросить обучение' : 'Reset Onboarding',
      language === 'ru'
        ? 'Вы увидите экраны знакомства с приложением заново при следующем запуске.'
        : 'You will see the onboarding screens again on next launch.',
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: language === 'ru' ? 'Сбросить' : 'Reset',
          onPress: async () => {
            await resetOnboarding();
            Alert.alert(
              language === 'ru' ? 'Готово' : 'Done',
              language === 'ru' ? 'Обучение будет показано при следующем запуске' : 'Onboarding will show on next launch'
            );
          },
        },
      ]
    );
  };

  const handleThemeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTheme();
    setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { padding: spacing.md, paddingBottom: spacing.xxl }]}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
          <Text style={[styles.title, { color: colors.text, fontSize: typography.sizes.xxl }]}>{t.nav.profile}</Text>
          <Pressable
            style={[styles.searchButton, { backgroundColor: colors.surface }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowAISearch(true);
            }}
          >
            <Ionicons name="search" size={22} color={colors.primary} />
          </Pressable>
        </Animated.View>

        {/* User Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Card style={[styles.userCard, { marginBottom: spacing.lg }]}>
            <View style={[styles.userHeader, { marginBottom: spacing.md }]}>
              <View style={[styles.avatar, { backgroundColor: `${colors.primary}15`, borderRadius: borderRadius.full }]}>
                <Ionicons name="person" size={40} color={colors.primary} />
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.text, fontSize: typography.sizes.lg }]}>
                  {user?.name || (language === 'ru' ? 'Пользователь' : 'User')}
                </Text>
                <Text style={[styles.userEmail, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
                  {user?.email}
                </Text>
              </View>
              <Pressable
                style={[styles.editButton, { backgroundColor: `${colors.primary}15`, borderRadius: borderRadius.full }]}
                onPress={() => handleMenuPress(t.common.edit)}
              >
                <Ionicons name="create-outline" size={22} color={colors.primary} />
              </Pressable>
            </View>

            <View style={[styles.balanceRow, { borderTopColor: colors.borderLight, paddingTop: spacing.md }]}>
              <View style={styles.balanceInfo}>
                <Text style={[styles.balanceLabel, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
                  {t.profile.title === 'Profile' ? 'Balance' : 'Баланс'}
                </Text>
                <Text style={[styles.balanceValue, { color: colors.success, fontSize: typography.sizes.xl }]}>
                  {formatCurrency(user?.balance || 0)}
                </Text>
              </View>
              <Button
                title={t.profile.topUp}
                size="sm"
                onPress={() => handleMenuPress(t.profile.topUp)}
              />
            </View>
          </Card>
        </Animated.View>

        {/* AI Assistant Card */}
        <Animated.View entering={FadeInDown.delay(250).duration(500)}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowAIGuide(true);
            }}
          >
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.aiCard, { borderRadius: borderRadius.xl, marginBottom: spacing.lg }]}
            >
              <View style={styles.aiCardContent}>
                <View style={styles.aiIconContainer}>
                  <Ionicons name="sparkles" size={28} color="#fff" />
                </View>
                <View style={styles.aiTextContainer}>
                  <Text style={styles.aiTitle}>
                    {language === 'ru' ? 'AI Помощник' : 'AI Assistant'}
                  </Text>
                  <Text style={styles.aiSubtitle}>
                    {language === 'ru' ? 'Задайте любой вопрос о приложении' : 'Ask any question about the app'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Quick Menu */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.sizes.md, marginBottom: spacing.sm }]}>
            {t.profile.myProfile}
          </Text>
          <Card style={[styles.menuCard, { marginBottom: spacing.lg }]}>
            <MenuItem
              icon="person-outline"
              title={t.profile.myProfile}
              subtitle={t.profile.personalData}
              onPress={() => handleMenuPress(t.profile.myProfile)}
            />
            <MenuItem
              icon="receipt-outline"
              title={t.profile.orderHistory}
              subtitle={t.nav.orders}
              onPress={() => router.push('/(tabs)/orders')}
            />
            <MenuItem
              icon="settings-outline"
              title={t.profile.settings}
              subtitle={t.profile.notifications}
              iconColor={colors.textSecondary}
              onPress={() => handleMenuPress(t.profile.settings)}
            />
          </Card>
        </Animated.View>

        {/* Business Tools */}
        <Animated.View entering={FadeInDown.delay(350).duration(500)}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.sizes.md, marginBottom: spacing.sm }]}>
            {t.team?.title || 'Business Tools'}
          </Text>
          <Card style={[styles.menuCard, { marginBottom: spacing.lg }]}>
            <MenuItem
              icon="people"
              title={t.team?.title || 'Team'}
              subtitle={t.team?.members || 'Manage team members'}
              gradient={[colors.primary, colors.primaryDark]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/team');
              }}
            />
            <MenuItem
              icon="gift"
              title={t.loyalty?.title || 'Loyalty Program'}
              subtitle={t.loyalty?.bonusPoints || 'Points & rewards'}
              gradient={['#F59E0B', '#D97706']}
              badge="PRO"
              badgeColor="#F59E0B"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/loyalty');
              }}
            />
            <MenuItem
              icon="megaphone"
              title={t.marketing?.title || 'Marketing'}
              subtitle={t.marketing?.aiGenerated || 'AI-powered insights'}
              gradient={['#8B5CF6', '#7C3AED']}
              badge="AI"
              badgeColor="#8B5CF6"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/marketing');
              }}
            />
            <MenuItem
              icon="globe-outline"
              title={language === 'ru' ? 'Региональные настройки' : 'Regional Settings'}
              subtitle={language === 'ru' ? 'Валюта, даты, налоги' : 'Currency, dates, taxes'}
              iconColor={colors.info}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/settings/regional');
              }}
            />
            <MenuItem
              icon="image-outline"
              title={language === 'ru' ? 'Бизнес-профиль' : 'Business Profile'}
              subtitle={language === 'ru' ? 'Логотип для чеков и накладных' : 'Logo for receipts and invoices'}
              iconColor="#10B981"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/settings/business');
              }}
            />
          </Card>
        </Animated.View>

        {/* Security & Privacy */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.sizes.md, marginBottom: spacing.sm }]}>
            {language === 'ru' ? 'Безопасность' : 'Security & Privacy'}
          </Text>
          <Card style={[styles.menuCard, { marginBottom: spacing.lg }]}>
            <MenuItem
              icon="finger-print"
              title={language === 'ru' ? 'Биометрия' : 'Biometrics'}
              subtitle={language === 'ru' ? 'Face ID / Touch ID' : 'Face ID / Touch ID'}
              gradient={['#10B981', '#059669']}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/settings/biometric');
              }}
            />
            <MenuItem
              icon="shield-checkmark"
              title={language === 'ru' ? 'Журнал безопасности' : 'Security Log'}
              subtitle={language === 'ru' ? 'AI мониторинг активности' : 'AI activity monitoring'}
              gradient={[colors.error, '#c52a46']}
              badge="AI"
              badgeColor={colors.error}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/security');
              }}
            />
            <MenuItem
              icon="notifications"
              title={language === 'ru' ? 'Настройки уведомлений' : 'Notification Settings'}
              subtitle={language === 'ru' ? 'Пороги и категории' : 'Thresholds and categories'}
              iconColor={colors.warning}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/settings/notifications');
              }}
            />
            <MenuItem
              icon="megaphone"
              title={language === 'ru' ? 'Объявления' : 'Announcements'}
              subtitle={language === 'ru' ? 'Отправка уведомлений команде' : 'Send notifications to team'}
              gradient={[colors.info, '#2b8db0']}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/settings/announcements');
              }}
            />
          </Card>
        </Animated.View>

        {/* Settings */}
        <Animated.View entering={FadeInDown.delay(450).duration(500)}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.sizes.md, marginBottom: spacing.sm }]}>
            {t.profile.settings}
          </Text>
          <Card style={[styles.menuCard, { marginBottom: spacing.lg }]}>
            <MenuItem
              icon="notifications-outline"
              title={t.profile.notifications}
              iconColor={colors.warning}
              showArrow={false}
              rightElement={
                <Switch
                  value={settings.notifications}
                  onValueChange={() => toggleSetting('notifications')}
                  trackColor={{ false: colors.border, true: `${colors.primary}50` }}
                  thumbColor={settings.notifications ? colors.primary : colors.textLight}
                />
              }
            />
            <MenuItem
              icon="moon-outline"
              title={language === 'ru' ? 'Тёмная тема' : 'Dark Mode'}
              iconColor="#6366F1"
              showArrow={false}
              rightElement={
                <Switch
                  value={isDark}
                  onValueChange={handleThemeToggle}
                  trackColor={{ false: colors.border, true: `${colors.primary}50` }}
                  thumbColor={isDark ? colors.primary : colors.textLight}
                />
              }
            />
            <MenuItem
              icon="sync-outline"
              title={t.profile.autoSync}
              subtitle={`${t.profile.lastSync}: ${formatLastSync(lastSync)}`}
              iconColor={colors.success}
              showArrow={false}
              rightElement={
                <Switch
                  value={settings.autoSync}
                  onValueChange={() => toggleSetting('autoSync')}
                  trackColor={{ false: colors.border, true: `${colors.primary}50` }}
                  thumbColor={settings.autoSync ? colors.primary : colors.textLight}
                />
              }
            />
            <MenuItem
              icon="flask-outline"
              title={language === 'ru' ? 'Демо-режим' : 'Demo Mode'}
              subtitle={language === 'ru' ? 'Тестовые данные для демонстрации' : 'Sample data for demonstration'}
              iconColor="#EC4899"
              showArrow={false}
              rightElement={
                <Switch
                  value={isDemoMode}
                  onValueChange={handleDemoModeToggle}
                  trackColor={{ false: colors.border, true: `#EC4899` }}
                  thumbColor={isDemoMode ? '#EC4899' : colors.textLight}
                />
              }
            />
            <MenuItem
              icon="language-outline"
              title={t.profile.language}
              subtitle={getLanguageLabel()}
              iconColor={colors.primary}
              onPress={() => setShowLanguageModal(true)}
            />
          </Card>
        </Animated.View>

        {/* Support */}
        <Animated.View entering={FadeInDown.delay(550).duration(500)}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.sizes.md, marginBottom: spacing.sm }]}>
            {t.profile.support}
          </Text>
          <Card style={[styles.menuCard, { marginBottom: spacing.lg }]}>
            <MenuItem
              icon="help-circle-outline"
              title={t.profile.helpFaq}
              iconColor={colors.primary}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/support/faq');
              }}
            />
            <MenuItem
              icon="chatbubble-outline"
              title={language === 'ru' ? 'Обратная связь' : 'Feedback'}
              subtitle={language === 'ru' ? 'Отправить предложение или сообщить об ошибке' : 'Send suggestion or report bug'}
              iconColor={colors.success}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/support/feedback');
              }}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              title={language === 'ru' ? 'Политика конфиденциальности' : 'Privacy Policy'}
              iconColor={colors.info}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/support/privacy');
              }}
            />
            <MenuItem
              icon="document-text-outline"
              title={t.profile.terms}
              iconColor={colors.textSecondary}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/support/terms');
              }}
            />
            <MenuItem
              icon="refresh-outline"
              title={language === 'ru' ? 'Показать обучение заново' : 'Show Onboarding Again'}
              iconColor={colors.warning}
              onPress={handleResetOnboarding}
            />
          </Card>
        </Animated.View>

        {/* Logout */}
        <Animated.View entering={FadeInDown.delay(650).duration(500)}>
          <Button
            title={t.profile.logout}
            variant="outline"
            onPress={handleLogout}
            style={{ borderColor: colors.error, marginTop: spacing.md }}
            textStyle={{ color: colors.error }}
            icon={<Ionicons name="log-out-outline" size={20} color={colors.error} />}
          />

          <Text style={[styles.versionText, { color: colors.textLight, fontSize: typography.sizes.xs, marginTop: spacing.lg }]}>
            {t.profile.version} 1.0.0
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <Pressable
          style={[styles.modalOverlay, { padding: spacing.lg }]}
          onPress={() => setShowLanguageModal(false)}
        >
          <Pressable
            style={[styles.languageModal, {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.xl,
              padding: spacing.lg,
              ...shadows.lg,
            }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: colors.text, fontSize: typography.sizes.lg, marginBottom: spacing.lg }]}>
              {t.profile.language}
            </Text>

            <Pressable
              style={[
                styles.languageOption,
                { backgroundColor: colors.background, borderRadius: borderRadius.md, marginBottom: spacing.sm, padding: spacing.md },
                language === 'ru' && { backgroundColor: `${colors.primary}15`, borderWidth: 2, borderColor: colors.primary },
              ]}
              onPress={() => handleLanguageSelect('ru')}
            >
              <View style={[styles.languageInfo, { gap: spacing.md }]}>
                <Text style={styles.languageFlag}>🇷🇺</Text>
                <Text style={[
                  styles.languageText,
                  { color: colors.text, fontSize: typography.sizes.md },
                  language === 'ru' && { color: colors.primary, fontWeight: '600' },
                ]}>
                  {t.profile.russian}
                </Text>
              </View>
              {language === 'ru' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </Pressable>

            <Pressable
              style={[
                styles.languageOption,
                { backgroundColor: colors.background, borderRadius: borderRadius.md, marginBottom: spacing.sm, padding: spacing.md },
                language === 'en' && { backgroundColor: `${colors.primary}15`, borderWidth: 2, borderColor: colors.primary },
              ]}
              onPress={() => handleLanguageSelect('en')}
            >
              <View style={[styles.languageInfo, { gap: spacing.md }]}>
                <Text style={styles.languageFlag}>🇬🇧</Text>
                <Text style={[
                  styles.languageText,
                  { color: colors.text, fontSize: typography.sizes.md },
                  language === 'en' && { color: colors.primary, fontWeight: '600' },
                ]}>
                  {t.profile.english}
                </Text>
              </View>
              {language === 'en' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </Pressable>

            <Button
              title={t.common.cancel}
              variant="outline"
              onPress={() => setShowLanguageModal(false)}
              style={{ marginTop: spacing.md }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* AI Smart Search */}
      <AISmartSearch
        visible={showAISearch}
        onClose={() => setShowAISearch(false)}
      />

      {/* AI Virtual Guide */}
      <AIVirtualGuide
        visible={showAIGuide}
        onClose={() => setShowAIGuide(false)}
        mode="help"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontWeight: '700',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCard: {},
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: '700',
  },
  userEmail: {
    marginTop: 2,
  },
  editButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
  },
  balanceInfo: {},
  balanceLabel: {},
  balanceValue: {
    fontWeight: '700',
  },
  aiCard: {
    padding: 16,
  },
  aiCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  aiSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  menuCard: {
    paddingVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  menuIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  menuTitle: {
    fontWeight: '500',
  },
  menuSubtitle: {
    marginTop: 2,
  },
  menuBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  menuBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  logoutButton: {},
  versionText: {
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageModal: {
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontWeight: '700',
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: 24,
  },
  languageText: {
    fontWeight: '500',
  },
});
