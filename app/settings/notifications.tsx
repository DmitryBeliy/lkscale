import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/localization';
import {
  NotificationPreferences,
  getNotificationPreferences,
  saveNotificationPreferences,
} from '@/services/securityService';

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { language } = useLocalization();

  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const t = {
    title: language === 'ru' ? 'Настройки уведомлений' : 'Notification Settings',
    lowStock: language === 'ru' ? 'Низкий запас' : 'Low Stock',
    lowStockDesc: language === 'ru' ? 'Оповещение когда товар заканчивается' : 'Alert when product stock is low',
    threshold: language === 'ru' ? 'Порог (шт.)' : 'Threshold (units)',
    highValueSales: language === 'ru' ? 'Крупные продажи' : 'High-Value Sales',
    highValueDesc: language === 'ru' ? 'Уведомление о продажах выше порога' : 'Alert for sales above threshold',
    minAmount: language === 'ru' ? 'Мин. сумма (₽)' : 'Min. amount (₽)',
    teamActivity: language === 'ru' ? 'Активность команды' : 'Team Activity',
    teamDesc: language === 'ru' ? 'Обновления о сменах и действиях' : 'Shift and activity updates',
    shiftUpdates: language === 'ru' ? 'Начало/конец смен' : 'Shift start/end',
    permissionChanges: language === 'ru' ? 'Изменения прав' : 'Permission changes',
    announcements: language === 'ru' ? 'Объявления' : 'Announcements',
    announcementsDesc: language === 'ru' ? 'Уведомления от руководителя' : 'Notifications from management',
    security: language === 'ru' ? 'Безопасность' : 'Security',
    securityDesc: language === 'ru' ? 'Подозрительная активность и входы' : 'Suspicious activity and logins',
    saved: language === 'ru' ? 'Настройки сохранены' : 'Settings saved',
    save: language === 'ru' ? 'Сохранить' : 'Save',
    alertCategories: language === 'ru' ? 'Категории уведомлений' : 'Alert Categories',
    thresholds: language === 'ru' ? 'Пороговые значения' : 'Thresholds',
  };

  useEffect(() => {
    loadPrefs();
  }, []);

  const loadPrefs = async () => {
    try {
      const data = await getNotificationPreferences();
      setPrefs(data);
    } catch (error) {
      console.error('Error loading notification prefs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!prefs) return;
    setIsSaving(true);
    try {
      await saveNotificationPreferences(prefs);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('✓', t.saved);
    } catch (error) {
      console.error('Error saving notification prefs:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updatePref = useCallback((path: string, value: boolean | number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPrefs((prev) => {
      if (!prev) return prev;
      const updated = { ...prev };
      const keys = path.split('.');
      let current: Record<string, unknown> = updated as unknown as Record<string, unknown>;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...(current[keys[i]] as Record<string, unknown>) };
        current = current[keys[i]] as Record<string, unknown>;
      }
      current[keys[keys.length - 1]] = value;
      return updated as unknown as NotificationPreferences;
    });
  }, []);

  interface SettingRowProps {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    gradient: [string, string];
    label: string;
    description: string;
    enabled: boolean;
    onToggle: (val: boolean) => void;
    children?: React.ReactNode;
  }

  const SettingRow: React.FC<SettingRowProps> = ({
    icon,
    iconColor,
    gradient,
    label,
    description,
    enabled,
    onToggle,
    children,
  }) => (
    <View style={[styles.settingRow, { borderBottomColor: colors.borderLight }]}>
      <View style={styles.settingHeader}>
        <LinearGradient
          colors={gradient}
          style={[styles.settingIcon, { borderRadius: borderRadius.md }]}
        >
          <Ionicons name={icon} size={20} color="#fff" />
        </LinearGradient>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingLabel, { color: colors.text, fontSize: typography.sizes.md }]}>
            {label}
          </Text>
          <Text style={[styles.settingDesc, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
            {description}
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: `${iconColor}50` }}
          thumbColor={enabled ? iconColor : colors.textLight}
        />
      </View>
      {enabled && children && (
        <Animated.View entering={FadeInDown.duration(200)} style={[styles.settingChildren, { marginLeft: 56 }]}>
          {children}
        </Animated.View>
      )}
    </View>
  );

  if (isLoading || !prefs) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { padding: spacing.md }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surface, borderRadius: borderRadius.full }]}
          accessibilityRole="button"
          accessibilityLabel={language === 'ru' ? 'Назад' : 'Back'}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text, fontSize: typography.sizes.xl }]}>
          {t.title}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { padding: spacing.md, paddingBottom: spacing.xxl }]}
      >
        {/* Alert Categories */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.sizes.md, marginBottom: spacing.sm }]}>
            {t.alertCategories}
          </Text>
          <Card style={[styles.settingsCard, { marginBottom: spacing.lg }]}>
            <SettingRow
              icon="alert-circle"
              iconColor={colors.error}
              gradient={[colors.error, '#c52a46']}
              label={t.lowStock}
              description={t.lowStockDesc}
              enabled={prefs.lowStock.enabled}
              onToggle={(val) => updatePref('lowStock.enabled', val)}
            >
              <View style={styles.thresholdRow}>
                <Text style={[styles.thresholdLabel, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
                  {t.threshold}
                </Text>
                <TextInput
                  style={[styles.thresholdInput, {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                    borderRadius: borderRadius.sm,
                    color: colors.text,
                    fontSize: typography.sizes.sm,
                  }]}
                  value={String(prefs.lowStock.threshold)}
                  onChangeText={(val) => {
                    const num = parseInt(val, 10);
                    if (!isNaN(num) && num >= 0) updatePref('lowStock.threshold', num);
                  }}
                  keyboardType="number-pad"
                  accessibilityLabel={t.threshold}
                />
              </View>
            </SettingRow>

            <SettingRow
              icon="cash"
              iconColor={colors.success}
              gradient={[colors.success, '#00b368']}
              label={t.highValueSales}
              description={t.highValueDesc}
              enabled={prefs.highValueSales.enabled}
              onToggle={(val) => updatePref('highValueSales.enabled', val)}
            >
              <View style={styles.thresholdRow}>
                <Text style={[styles.thresholdLabel, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
                  {t.minAmount}
                </Text>
                <TextInput
                  style={[styles.thresholdInput, {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                    borderRadius: borderRadius.sm,
                    color: colors.text,
                    fontSize: typography.sizes.sm,
                  }]}
                  value={String(prefs.highValueSales.threshold)}
                  onChangeText={(val) => {
                    const num = parseInt(val, 10);
                    if (!isNaN(num) && num >= 0) updatePref('highValueSales.threshold', num);
                  }}
                  keyboardType="number-pad"
                  accessibilityLabel={t.minAmount}
                />
              </View>
            </SettingRow>

            <SettingRow
              icon="people"
              iconColor="#8B5CF6"
              gradient={['#8B5CF6', '#7C3AED']}
              label={t.teamActivity}
              description={t.teamDesc}
              enabled={prefs.teamActivity.enabled}
              onToggle={(val) => updatePref('teamActivity.enabled', val)}
            >
              <View style={[styles.subToggle, { borderBottomColor: colors.borderLight }]}>
                <Text style={[styles.subToggleLabel, { color: colors.text, fontSize: typography.sizes.sm }]}>
                  {t.shiftUpdates}
                </Text>
                <Switch
                  value={prefs.teamActivity.shiftUpdates}
                  onValueChange={(val) => updatePref('teamActivity.shiftUpdates', val)}
                  trackColor={{ false: colors.border, true: '#8B5CF650' }}
                  thumbColor={prefs.teamActivity.shiftUpdates ? '#8B5CF6' : colors.textLight}
                />
              </View>
              <View style={styles.subToggle}>
                <Text style={[styles.subToggleLabel, { color: colors.text, fontSize: typography.sizes.sm }]}>
                  {t.permissionChanges}
                </Text>
                <Switch
                  value={prefs.teamActivity.permissionChanges}
                  onValueChange={(val) => updatePref('teamActivity.permissionChanges', val)}
                  trackColor={{ false: colors.border, true: '#8B5CF650' }}
                  thumbColor={prefs.teamActivity.permissionChanges ? '#8B5CF6' : colors.textLight}
                />
              </View>
            </SettingRow>

            <SettingRow
              icon="megaphone"
              iconColor={colors.warning}
              gradient={[colors.warning, '#d4a12a']}
              label={t.announcements}
              description={t.announcementsDesc}
              enabled={prefs.announcements.enabled}
              onToggle={(val) => updatePref('announcements.enabled', val)}
            />

            <SettingRow
              icon="shield-checkmark"
              iconColor={colors.info}
              gradient={[colors.info, '#2b8db0']}
              label={t.security}
              description={t.securityDesc}
              enabled={prefs.securityAlerts.enabled}
              onToggle={(val) => updatePref('securityAlerts.enabled', val)}
            />
          </Card>
        </Animated.View>

        {/* Save Button */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Pressable
            style={[styles.saveButton, { backgroundColor: colors.primary, borderRadius: borderRadius.lg }]}
            onPress={handleSave}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel={t.save}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                <Text style={[styles.saveButtonText, { fontSize: typography.sizes.md }]}>
                  {t.save}
                </Text>
              </>
            )}
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  headerTitle: {
    fontWeight: '700',
  },
  scrollContent: {},
  sectionTitle: {
    fontWeight: '600',
  },
  settingsCard: {
    paddingVertical: 4,
  },
  settingRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 8,
  },
  settingLabel: {
    fontWeight: '600',
  },
  settingDesc: {
    marginTop: 2,
  },
  settingChildren: {
    marginTop: 12,
  },
  thresholdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  thresholdLabel: {},
  thresholdInput: {
    width: 80,
    height: 38,
    borderWidth: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  subToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  subToggleLabel: {},
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
