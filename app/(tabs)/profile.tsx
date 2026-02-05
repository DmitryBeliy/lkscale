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
import { Card, Button } from '@/components/ui';
import { getAuthState, subscribeAuth, logout } from '@/store/authStore';
import { getDataState, subscribeData } from '@/store/dataStore';
import { useLocalization, Language } from '@/localization';
import { User, AppSettings } from '@/types';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightElement?: React.ReactNode;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  iconColor = colors.primary,
  title,
  subtitle,
  onPress,
  showArrow = true,
  rightElement,
}) => (
  <Pressable
    style={styles.menuItem}
    onPress={onPress}
    disabled={!onPress}
  >
    <View style={[styles.menuIcon, { backgroundColor: `${iconColor}15` }]}>
      <Ionicons name={icon} size={22} color={iconColor} />
    </View>
    <View style={styles.menuContent}>
      <Text style={styles.menuTitle}>{title}</Text>
      {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    </View>
    {rightElement || (showArrow && onPress && (
      <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
    ))}
  </Pressable>
);

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { t, language, setLanguage, formatCurrency, formatDate } = useLocalization();
  const [user, setUser] = useState<User | null>(getAuthState().user);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    notifications: true,
    darkMode: false,
    language: language,
    autoSync: true,
  });

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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
          <Text style={styles.title}>{t.nav.profile}</Text>
        </Animated.View>

        {/* User Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Card style={styles.userCard}>
            <View style={styles.userHeader}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color={colors.primary} />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.name || (language === 'ru' ? 'Пользователь' : 'User')}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
              </View>
              <Pressable
                style={styles.editButton}
                onPress={() => handleMenuPress(t.common.edit)}
              >
                <Ionicons name="create-outline" size={22} color={colors.primary} />
              </Pressable>
            </View>

            <View style={styles.balanceRow}>
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>{t.profile.title === 'Profile' ? 'Balance' : 'Баланс'}</Text>
                <Text style={styles.balanceValue}>
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

        {/* Quick Menu */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.sectionTitle}>{t.profile.myProfile}</Text>
          <Card style={styles.menuCard}>
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

        {/* Settings */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Text style={styles.sectionTitle}>{t.profile.settings}</Text>
          <Card style={styles.menuCard}>
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
              icon="language-outline"
              title={t.profile.language}
              subtitle={getLanguageLabel()}
              iconColor={colors.primary}
              onPress={() => setShowLanguageModal(true)}
            />
          </Card>
        </Animated.View>

        {/* Support */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <Text style={styles.sectionTitle}>{t.profile.support}</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon="help-circle-outline"
              title={t.profile.helpFaq}
              iconColor={colors.primary}
              onPress={() => handleMenuPress(t.profile.helpFaq)}
            />
            <MenuItem
              icon="chatbubble-outline"
              title={t.profile.contactSupport}
              iconColor={colors.success}
              onPress={() => handleMenuPress(t.profile.contactSupport)}
            />
            <MenuItem
              icon="document-text-outline"
              title={t.profile.terms}
              iconColor={colors.textSecondary}
              onPress={() => handleMenuPress(t.profile.terms)}
            />
          </Card>
        </Animated.View>

        {/* Logout */}
        <Animated.View entering={FadeInDown.delay(600).duration(500)}>
          <Button
            title={t.profile.logout}
            variant="outline"
            onPress={handleLogout}
            style={styles.logoutButton}
            textStyle={{ color: colors.error }}
            icon={<Ionicons name="log-out-outline" size={20} color={colors.error} />}
          />

          <Text style={styles.versionText}>{t.profile.version} 1.0.0</Text>
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
          style={styles.modalOverlay}
          onPress={() => setShowLanguageModal(false)}
        >
          <Pressable style={styles.languageModal} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{t.profile.language}</Text>

            <Pressable
              style={[
                styles.languageOption,
                language === 'ru' && styles.languageOptionActive,
              ]}
              onPress={() => handleLanguageSelect('ru')}
            >
              <View style={styles.languageInfo}>
                <Text style={styles.languageFlag}>🇷🇺</Text>
                <Text style={[
                  styles.languageText,
                  language === 'ru' && styles.languageTextActive,
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
                language === 'en' && styles.languageOptionActive,
              ]}
              onPress={() => handleLanguageSelect('en')}
            >
              <View style={styles.languageInfo}>
                <Text style={styles.languageFlag}>🇬🇧</Text>
                <Text style={[
                  styles.languageText,
                  language === 'en' && styles.languageTextActive,
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
              style={styles.modalButton}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  userCard: {
    marginBottom: spacing.lg,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  userEmail: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  balanceInfo: {},
  balanceLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  balanceValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.success,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  menuCard: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    color: colors.text,
  },
  menuSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    marginTop: spacing.md,
    borderColor: colors.error,
  },
  versionText: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  languageModal: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 320,
    ...shadows.lg,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  languageOptionActive: {
    backgroundColor: `${colors.primary}15`,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  languageFlag: {
    fontSize: 24,
  },
  languageText: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    color: colors.text,
  },
  languageTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  modalButton: {
    marginTop: spacing.md,
  },
});
