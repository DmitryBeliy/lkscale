import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/localization';
import {
  getBiometricSettings,
  saveBiometricSettings,
} from '@/services/securityService';

type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';

export default function BiometricSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, typography, borderRadius, shadows, isDark } = useTheme();
  const { language } = useLocalization();

  const [isEnabled, setIsEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>('none');
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [lastEnabled, setLastEnabled] = useState<string | null>(null);

  const t = {
    title: language === 'ru' ? 'Биометрическая защита' : 'Biometric Authentication',
    subtitle: language === 'ru' ? 'Быстрый и безопасный вход' : 'Quick and secure access',
    enable: language === 'ru' ? 'Включить биометрию' : 'Enable Biometrics',
    faceId: language === 'ru' ? 'Face ID' : 'Face ID',
    touchId: language === 'ru' ? 'Touch ID' : 'Touch ID',
    fingerprint: language === 'ru' ? 'Отпечаток пальца' : 'Fingerprint',
    notSupported: language === 'ru' ? 'Биометрия не поддерживается' : 'Biometrics not supported',
    notSupportedDesc: language === 'ru'
      ? 'Ваше устройство не поддерживает биометрическую аутентификацию.'
      : 'Your device does not support biometric authentication.',
    notEnrolled: language === 'ru' ? 'Биометрия не настроена' : 'Biometrics not enrolled',
    notEnrolledDesc: language === 'ru'
      ? 'Настройте отпечаток пальца или Face ID в настройках устройства.'
      : 'Set up fingerprint or Face ID in your device settings.',
    howItWorks: language === 'ru' ? 'Как это работает' : 'How it works',
    benefit1Title: language === 'ru' ? 'Мгновенный доступ' : 'Instant Access',
    benefit1Desc: language === 'ru'
      ? 'Используйте лицо или палец вместо пароля'
      : 'Use your face or finger instead of password',
    benefit2Title: language === 'ru' ? 'Безопасность данных' : 'Data Security',
    benefit2Desc: language === 'ru'
      ? 'Биометрические данные хранятся только на устройстве'
      : 'Biometric data stored only on device',
    benefit3Title: language === 'ru' ? 'Защита операций' : 'Operation Protection',
    benefit3Desc: language === 'ru'
      ? 'Подтверждайте критические действия биометрией'
      : 'Confirm critical actions with biometrics',
    authenticatePrompt: language === 'ru'
      ? 'Подтвердите вашу личность'
      : 'Confirm your identity',
    authFailed: language === 'ru' ? 'Аутентификация не удалась' : 'Authentication failed',
    enabledAt: language === 'ru' ? 'Включено' : 'Enabled',
    securityLevel: language === 'ru' ? 'Уровень безопасности' : 'Security Level',
    high: language === 'ru' ? 'Высокий' : 'High',
    device: language === 'ru' ? 'Устройство' : 'Device',
  };

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsSupported(compatible);

      if (compatible) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsEnrolled(enrolled);

        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('facial');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('fingerprint');
        } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
          setBiometricType('iris');
        }
      }

      const settings = await getBiometricSettings();
      setIsEnabled(settings.enabled);
      setLastEnabled(settings.lastEnabled);
    } catch (error) {
      console.error('Error checking biometric support:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBiometricIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (biometricType) {
      case 'facial':
        return 'scan-outline';
      case 'fingerprint':
        return 'finger-print-outline';
      default:
        return 'lock-closed-outline';
    }
  };

  const getBiometricName = () => {
    switch (biometricType) {
      case 'facial':
        return Platform.OS === 'ios' ? t.faceId : t.faceId;
      case 'fingerprint':
        return Platform.OS === 'ios' ? t.touchId : t.fingerprint;
      default:
        return t.enable;
    }
  };

  const handleToggle = useCallback(async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (value) {
      // Authenticate first before enabling
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: t.authenticatePrompt,
          cancelLabel: language === 'ru' ? 'Отмена' : 'Cancel',
          disableDeviceFallback: false,
        });

        if (result.success) {
          const now = new Date().toISOString();
          setIsEnabled(true);
          setLastEnabled(now);
          await saveBiometricSettings({ enabled: true, lastEnabled: now });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Alert.alert('', t.authFailed);
        }
      } catch (error) {
        console.error('Biometric auth error:', error);
        Alert.alert('', t.authFailed);
      }
    } else {
      setIsEnabled(false);
      await saveBiometricSettings({ enabled: false, lastEnabled });
    }
  }, [language, lastEnabled, t.authFailed, t.authenticatePrompt]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
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
        {/* Hero Section */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <LinearGradient
            colors={isEnabled ? [colors.success, '#00b368'] : [colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.heroCard, { borderRadius: borderRadius.xl, marginBottom: spacing.lg }]}
          >
            <View style={styles.heroIconContainer}>
              <Ionicons name={getBiometricIcon()} size={48} color="#fff" />
            </View>
            <Text style={styles.heroTitle}>{getBiometricName()}</Text>
            <Text style={styles.heroSubtitle}>{t.subtitle}</Text>

            {isEnabled && (
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#fff" />
                <Text style={styles.statusText}>
                  {language === 'ru' ? 'Активно' : 'Active'}
                </Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        {!isSupported ? (
          /* Not Supported */
          <Animated.View entering={FadeIn.duration(400)}>
            <Card style={[styles.warningCard, { borderLeftColor: colors.warning, marginBottom: spacing.lg }]}>
              <Ionicons name="warning-outline" size={24} color={colors.warning} />
              <View style={styles.warningContent}>
                <Text style={[styles.warningTitle, { color: colors.text, fontSize: typography.sizes.md }]}>
                  {t.notSupported}
                </Text>
                <Text style={[styles.warningDesc, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
                  {t.notSupportedDesc}
                </Text>
              </View>
            </Card>
          </Animated.View>
        ) : !isEnrolled ? (
          /* Not Enrolled */
          <Animated.View entering={FadeIn.duration(400)}>
            <Card style={[styles.warningCard, { borderLeftColor: colors.info, marginBottom: spacing.lg }]}>
              <Ionicons name="information-circle-outline" size={24} color={colors.info} />
              <View style={styles.warningContent}>
                <Text style={[styles.warningTitle, { color: colors.text, fontSize: typography.sizes.md }]}>
                  {t.notEnrolled}
                </Text>
                <Text style={[styles.warningDesc, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
                  {t.notEnrolledDesc}
                </Text>
              </View>
            </Card>
          </Animated.View>
        ) : (
          <>
            {/* Toggle Card */}
            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
              <Card style={[styles.toggleCard, { marginBottom: spacing.lg }]}>
                <View style={styles.toggleRow}>
                  <View style={[styles.toggleIcon, { backgroundColor: `${colors.primary}15`, borderRadius: borderRadius.md }]}>
                    <Ionicons name={getBiometricIcon()} size={24} color={colors.primary} />
                  </View>
                  <View style={styles.toggleInfo}>
                    <Text style={[styles.toggleLabel, { color: colors.text, fontSize: typography.sizes.md }]}>
                      {t.enable}
                    </Text>
                    <Text style={[styles.toggleDesc, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                      {getBiometricName()}
                    </Text>
                  </View>
                  <Switch
                    value={isEnabled}
                    onValueChange={handleToggle}
                    trackColor={{ false: colors.border, true: `${colors.success}50` }}
                    thumbColor={isEnabled ? colors.success : colors.textLight}
                  />
                </View>

                {isEnabled && lastEnabled && (
                  <View style={[styles.infoRow, { borderTopColor: colors.borderLight }]}>
                    <View style={styles.infoItem}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                        {t.enabledAt}
                      </Text>
                      <Text style={[styles.infoValue, { color: colors.text, fontSize: typography.sizes.sm }]}>
                        {formatDate(lastEnabled)}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                        {t.securityLevel}
                      </Text>
                      <View style={styles.securityLevel}>
                        <View style={[styles.securityDot, { backgroundColor: colors.success }]} />
                        <Text style={[styles.infoValue, { color: colors.success, fontSize: typography.sizes.sm }]}>
                          {t.high}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </Card>
            </Animated.View>
          </>
        )}

        {/* How it works */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.sizes.md, marginBottom: spacing.sm }]}>
            {t.howItWorks}
          </Text>
          <Card style={[styles.benefitsCard, { marginBottom: spacing.lg }]}>
            {[
              { icon: 'flash-outline' as const, title: t.benefit1Title, desc: t.benefit1Desc, color: colors.primary },
              { icon: 'shield-checkmark-outline' as const, title: t.benefit2Title, desc: t.benefit2Desc, color: colors.success },
              { icon: 'lock-closed-outline' as const, title: t.benefit3Title, desc: t.benefit3Desc, color: '#8B5CF6' },
            ].map((item, index) => (
              <View
                key={index}
                style={[
                  styles.benefitRow,
                  { borderBottomColor: colors.borderLight },
                  index === 2 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={[styles.benefitIcon, { backgroundColor: `${item.color}15`, borderRadius: borderRadius.md }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={[styles.benefitTitle, { color: colors.text, fontSize: typography.sizes.sm }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.benefitDesc, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                    {item.desc}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </Animated.View>

        {/* Device Info */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Card style={styles.deviceCard}>
            <View style={styles.deviceRow}>
              <Ionicons name="phone-portrait-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.deviceLabel, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                {t.device}: {Platform.OS === 'ios' ? 'iPhone' : 'Android'} • {getBiometricName()}
              </Text>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  headerTitle: { fontWeight: '700' },
  scrollContent: {},
  heroCard: {
    padding: 32,
    alignItems: 'center',
  },
  heroIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    gap: 12,
  },
  warningContent: { flex: 1 },
  warningTitle: { fontWeight: '600', marginBottom: 4 },
  warningDesc: { lineHeight: 20 },
  toggleCard: {},
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toggleInfo: { flex: 1 },
  toggleLabel: { fontWeight: '600' },
  toggleDesc: { marginTop: 2 },
  infoRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 16,
  },
  infoItem: { flex: 1 },
  infoLabel: { marginBottom: 4 },
  infoValue: { fontWeight: '600' },
  securityLevel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  securityDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontWeight: '600' },
  benefitsCard: { paddingVertical: 4 },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  benefitIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitContent: { flex: 1 },
  benefitTitle: { fontWeight: '600', marginBottom: 2 },
  benefitDesc: { lineHeight: 18 },
  deviceCard: { paddingVertical: 12 },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deviceLabel: {},
});
