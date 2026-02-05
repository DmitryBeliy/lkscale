import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card, Button } from '@/components/ui';
import { getAuthState, subscribeAuth, logout } from '@/store/authStore';
import { getDataState, subscribeData } from '@/store/dataStore';
import { User, AppSettings } from '@/types';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

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
  const [user, setUser] = useState<User | null>(getAuthState().user);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    notifications: true,
    darkMode: false,
    language: 'ru',
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
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
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
    Alert.alert(item, `Переход в раздел "${item}"`);
  };

  const toggleSetting = (key: keyof AppSettings) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const formatLastSync = (dateString: string | null) => {
    if (!dateString) return 'Никогда';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
          <Text style={styles.title}>Профиль</Text>
        </Animated.View>

        {/* User Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Card style={styles.userCard}>
            <View style={styles.userHeader}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color={colors.primary} />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.name || 'Пользователь'}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
              </View>
              <Pressable
                style={styles.editButton}
                onPress={() => handleMenuPress('Редактировать профиль')}
              >
                <Ionicons name="create-outline" size={22} color={colors.primary} />
              </Pressable>
            </View>

            <View style={styles.balanceRow}>
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>Баланс</Text>
                <Text style={styles.balanceValue}>
                  {formatCurrency(user?.balance || 0)}
                </Text>
              </View>
              <Button
                title="Пополнить"
                size="sm"
                onPress={() => handleMenuPress('Пополнение баланса')}
              />
            </View>
          </Card>
        </Animated.View>

        {/* Quick Menu */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.sectionTitle}>Мой Профиль</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon="person-outline"
              title="Мой Профиль"
              subtitle="Личные данные и контакты"
              onPress={() => handleMenuPress('Мой Профиль')}
            />
            <MenuItem
              icon="receipt-outline"
              title="Мои Заказы"
              subtitle="История заказов"
              onPress={() => router.push('/(tabs)/orders')}
            />
            <MenuItem
              icon="settings-outline"
              title="Настройки"
              subtitle="Уведомления и прочее"
              iconColor={colors.textSecondary}
              onPress={() => handleMenuPress('Настройки')}
            />
          </Card>
        </Animated.View>

        {/* Settings */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Text style={styles.sectionTitle}>Настройки</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon="notifications-outline"
              title="Уведомления"
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
              title="Автосинхронизация"
              subtitle={`Последняя: ${formatLastSync(lastSync)}`}
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
              title="Язык"
              subtitle="Русский"
              iconColor={colors.primary}
              onPress={() => handleMenuPress('Выбор языка')}
            />
          </Card>
        </Animated.View>

        {/* Support */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <Text style={styles.sectionTitle}>Поддержка</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon="help-circle-outline"
              title="Помощь и FAQ"
              iconColor={colors.primary}
              onPress={() => handleMenuPress('Помощь')}
            />
            <MenuItem
              icon="chatbubble-outline"
              title="Связаться с поддержкой"
              iconColor={colors.success}
              onPress={() => handleMenuPress('Поддержка')}
            />
            <MenuItem
              icon="document-text-outline"
              title="Условия использования"
              iconColor={colors.textSecondary}
              onPress={() => handleMenuPress('Условия')}
            />
          </Card>
        </Animated.View>

        {/* Logout */}
        <Animated.View entering={FadeInDown.delay(600).duration(500)}>
          <Button
            title="Выйти из аккаунта"
            variant="outline"
            onPress={handleLogout}
            style={styles.logoutButton}
            textStyle={{ color: colors.error }}
            icon={<Ionicons name="log-out-outline" size={20} color={colors.error} />}
          />

          <Text style={styles.versionText}>Версия 1.0.0</Text>
        </Animated.View>
      </ScrollView>
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
});
