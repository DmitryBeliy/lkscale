import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/localization';
import { Card, Button } from '@/components/ui';
import { logger } from '@/lib/logger';

const REGIONAL_SETTINGS_KEY = '@lkscale_regional_settings';

interface RegionalSettings {
  currency: string;
  currencySymbol: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  taxName: string;
  taxRate: number;
  thousandSeparator: string;
  decimalSeparator: string;
}

const DEFAULT_SETTINGS: RegionalSettings = {
  currency: 'RUB',
  currencySymbol: '₽',
  dateFormat: 'DD.MM.YYYY',
  timeFormat: '24h',
  taxName: 'НДС',
  taxRate: 20,
  thousandSeparator: ' ',
  decimalSeparator: ',',
};

const CURRENCIES = [
  { code: 'RUB', symbol: '₽', name: 'Российский рубль', nameEn: 'Russian Ruble' },
  { code: 'USD', symbol: '$', name: 'Доллар США', nameEn: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Евро', nameEn: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'Британский фунт', nameEn: 'British Pound' },
  { code: 'KZT', symbol: '₸', name: 'Казахстанский тенге', nameEn: 'Kazakhstani Tenge' },
  { code: 'UAH', symbol: '₴', name: 'Украинская гривна', nameEn: 'Ukrainian Hryvnia' },
  { code: 'BYN', symbol: 'Br', name: 'Белорусский рубль', nameEn: 'Belarusian Ruble' },
];

const DATE_FORMATS = [
  { format: 'DD.MM.YYYY', example: '25.12.2026' },
  { format: 'MM/DD/YYYY', example: '12/25/2026' },
  { format: 'YYYY-MM-DD', example: '2026-12-25' },
  { format: 'DD/MM/YYYY', example: '25/12/2026' },
];

const TAX_PRESETS = [
  { name: 'НДС', nameEn: 'VAT', rate: 20 },
  { name: 'НДС (пониженная)', nameEn: 'VAT (reduced)', rate: 10 },
  { name: 'Sales Tax', nameEn: 'Sales Tax', rate: 8 },
  { name: 'GST', nameEn: 'GST', rate: 18 },
  { name: 'Без налога', nameEn: 'No tax', rate: 0 },
];

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  onPress: () => void;
  iconColor?: string;
}

const SettingRow: React.FC<SettingRowProps> = ({ icon, title, value, onPress, iconColor }) => {
  const { colors, spacing, borderRadius, typography } = useTheme();

  return (
    <Pressable
      style={[styles.settingRow, { paddingVertical: spacing.md }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <View style={[styles.settingIcon, { backgroundColor: `${iconColor || colors.primary}15` }]}>
        <Ionicons name={icon} size={22} color={iconColor || colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.settingTitle, { color: colors.text, fontSize: typography.sizes.md }]}>
          {title}
        </Text>
      </View>
      <Text style={[styles.settingValue, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
        {value}
      </Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
    </Pressable>
  );
};

export default function RegionalSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, borderRadius, typography, shadows } = useTheme();
  const { language } = useLocalization();
  const [settings, setSettings] = useState<RegionalSettings>(DEFAULT_SETTINGS);
  const [modalType, setModalType] = useState<'currency' | 'date' | 'time' | 'tax' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const t = {
    title: language === 'ru' ? 'Региональные настройки' : 'Regional Settings',
    currency: language === 'ru' ? 'Валюта' : 'Currency',
    dateFormat: language === 'ru' ? 'Формат даты' : 'Date Format',
    timeFormat: language === 'ru' ? 'Формат времени' : 'Time Format',
    taxSettings: language === 'ru' ? 'Настройки налога' : 'Tax Settings',
    numberFormat: language === 'ru' ? 'Формат чисел' : 'Number Format',
    preview: language === 'ru' ? 'Пример' : 'Preview',
    save: language === 'ru' ? 'Сохранить' : 'Save',
    cancel: language === 'ru' ? 'Отмена' : 'Cancel',
    saved: language === 'ru' ? 'Сохранено' : 'Saved',
    time12: language === 'ru' ? '12-часовой' : '12-hour',
    time24: language === 'ru' ? '24-часовой' : '24-hour',
    selectCurrency: language === 'ru' ? 'Выберите валюту' : 'Select Currency',
    selectDateFormat: language === 'ru' ? 'Выберите формат даты' : 'Select Date Format',
    selectTimeFormat: language === 'ru' ? 'Выберите формат времени' : 'Select Time Format',
    selectTax: language === 'ru' ? 'Выберите налог' : 'Select Tax',
    taxRate: language === 'ru' ? 'Ставка' : 'Rate',
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(REGIONAL_SETTINGS_KEY);
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      logger.error('Error loading regional settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: RegionalSettings) => {
    try {
      await AsyncStorage.setItem(REGIONAL_SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      logger.error('Error saving regional settings:', error);
    }
  };

  const handleCurrencySelect = (currency: typeof CURRENCIES[0]) => {
    const newSettings = {
      ...settings,
      currency: currency.code,
      currencySymbol: currency.symbol,
    };
    saveSettings(newSettings);
    setModalType(null);
  };

  const handleDateFormatSelect = (format: string) => {
    const newSettings = { ...settings, dateFormat: format };
    saveSettings(newSettings);
    setModalType(null);
  };

  const handleTimeFormatSelect = (format: '12h' | '24h') => {
    const newSettings = { ...settings, timeFormat: format };
    saveSettings(newSettings);
    setModalType(null);
  };

  const handleTaxSelect = (tax: typeof TAX_PRESETS[0]) => {
    const newSettings = {
      ...settings,
      taxName: language === 'ru' ? tax.name : tax.nameEn,
      taxRate: tax.rate,
    };
    saveSettings(newSettings);
    setModalType(null);
  };

  const formatPreviewNumber = () => {
    const num = 12345.67;
    return num.toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US') + ' ' + settings.currencySymbol;
  };

  const formatPreviewDate = () => {
    const now = new Date();
    switch (settings.dateFormat) {
      case 'DD.MM.YYYY':
        return `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}`;
      case 'MM/DD/YYYY':
        return `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}/${now.getFullYear()}`;
      case 'YYYY-MM-DD':
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
      default:
        return `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    }
  };

  const formatPreviewTime = () => {
    const now = new Date();
    if (settings.timeFormat === '12h') {
      const hours = now.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      return `${hour12}:${now.getMinutes().toString().padStart(2, '0')} ${ampm}`;
    }
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return null;
  }

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
          {t.title}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { padding: spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Preview Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Card style={[styles.previewCard, { marginBottom: spacing.lg }]}>
            <Text style={[styles.previewLabel, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
              {t.preview}
            </Text>
            <View style={styles.previewRow}>
              <View style={styles.previewItem}>
                <Text style={[styles.previewValue, { color: colors.text, fontSize: typography.sizes.lg }]}>
                  {formatPreviewNumber()}
                </Text>
                <Text style={[styles.previewName, { color: colors.textLight, fontSize: typography.sizes.xs }]}>
                  {t.numberFormat}
                </Text>
              </View>
              <View style={styles.previewItem}>
                <Text style={[styles.previewValue, { color: colors.text, fontSize: typography.sizes.lg }]}>
                  {formatPreviewDate()}
                </Text>
                <Text style={[styles.previewName, { color: colors.textLight, fontSize: typography.sizes.xs }]}>
                  {t.dateFormat}
                </Text>
              </View>
              <View style={styles.previewItem}>
                <Text style={[styles.previewValue, { color: colors.text, fontSize: typography.sizes.lg }]}>
                  {formatPreviewTime()}
                </Text>
                <Text style={[styles.previewName, { color: colors.textLight, fontSize: typography.sizes.xs }]}>
                  {t.timeFormat}
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Settings */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Card>
            <SettingRow
              icon="cash-outline"
              title={t.currency}
              value={`${settings.currencySymbol} (${settings.currency})`}
              onPress={() => setModalType('currency')}
              iconColor="#00d97e"
            />
            <SettingRow
              icon="calendar-outline"
              title={t.dateFormat}
              value={settings.dateFormat}
              onPress={() => setModalType('date')}
              iconColor={colors.primary}
            />
            <SettingRow
              icon="time-outline"
              title={t.timeFormat}
              value={settings.timeFormat === '24h' ? t.time24 : t.time12}
              onPress={() => setModalType('time')}
              iconColor="#f6c343"
            />
            <SettingRow
              icon="receipt-outline"
              title={t.taxSettings}
              value={`${settings.taxName} (${settings.taxRate}%)`}
              onPress={() => setModalType('tax')}
              iconColor="#e63757"
            />
          </Card>
        </Animated.View>

        <View style={{ height: insets.bottom + spacing.xl }} />
      </ScrollView>

      {/* Currency Modal */}
      <Modal
        visible={modalType === 'currency'}
        transparent
        animationType="fade"
        onRequestClose={() => setModalType(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalType(null)}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.surface, borderRadius: borderRadius.xl }]} onPress={e => e.stopPropagation()}>
            <Text style={[styles.modalTitle, { color: colors.text, fontSize: typography.sizes.lg }]}>
              {t.selectCurrency}
            </Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {CURRENCIES.map(currency => (
                <Pressable
                  key={currency.code}
                  style={[styles.modalOption, {
                    backgroundColor: settings.currency === currency.code ? `${colors.primary}15` : 'transparent',
                    borderRadius: borderRadius.md,
                  }]}
                  onPress={() => handleCurrencySelect(currency)}
                >
                  <Text style={[styles.currencySymbol, { color: colors.primary }]}>{currency.symbol}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.currencyName, { color: colors.text, fontSize: typography.sizes.md }]}>
                      {language === 'ru' ? currency.name : currency.nameEn}
                    </Text>
                    <Text style={[styles.currencyCode, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
                      {currency.code}
                    </Text>
                  </View>
                  {settings.currency === currency.code && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
            <Button title={t.cancel} variant="outline" onPress={() => setModalType(null)} style={{ marginTop: spacing.md }} />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Date Format Modal */}
      <Modal
        visible={modalType === 'date'}
        transparent
        animationType="fade"
        onRequestClose={() => setModalType(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalType(null)}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.surface, borderRadius: borderRadius.xl }]} onPress={e => e.stopPropagation()}>
            <Text style={[styles.modalTitle, { color: colors.text, fontSize: typography.sizes.lg }]}>
              {t.selectDateFormat}
            </Text>
            {DATE_FORMATS.map(item => (
              <Pressable
                key={item.format}
                style={[styles.modalOption, {
                  backgroundColor: settings.dateFormat === item.format ? `${colors.primary}15` : 'transparent',
                  borderRadius: borderRadius.md,
                }]}
                onPress={() => handleDateFormatSelect(item.format)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.currencyName, { color: colors.text, fontSize: typography.sizes.md }]}>
                    {item.format}
                  </Text>
                  <Text style={[styles.currencyCode, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
                    {t.preview}: {item.example}
                  </Text>
                </View>
                {settings.dateFormat === item.format && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </Pressable>
            ))}
            <Button title={t.cancel} variant="outline" onPress={() => setModalType(null)} style={{ marginTop: spacing.md }} />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Time Format Modal */}
      <Modal
        visible={modalType === 'time'}
        transparent
        animationType="fade"
        onRequestClose={() => setModalType(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalType(null)}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.surface, borderRadius: borderRadius.xl }]} onPress={e => e.stopPropagation()}>
            <Text style={[styles.modalTitle, { color: colors.text, fontSize: typography.sizes.lg }]}>
              {t.selectTimeFormat}
            </Text>
            <Pressable
              style={[styles.modalOption, {
                backgroundColor: settings.timeFormat === '24h' ? `${colors.primary}15` : 'transparent',
                borderRadius: borderRadius.md,
              }]}
              onPress={() => handleTimeFormatSelect('24h')}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.currencyName, { color: colors.text, fontSize: typography.sizes.md }]}>
                  {t.time24}
                </Text>
                <Text style={[styles.currencyCode, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
                  {t.preview}: 14:30
                </Text>
              </View>
              {settings.timeFormat === '24h' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </Pressable>
            <Pressable
              style={[styles.modalOption, {
                backgroundColor: settings.timeFormat === '12h' ? `${colors.primary}15` : 'transparent',
                borderRadius: borderRadius.md,
              }]}
              onPress={() => handleTimeFormatSelect('12h')}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.currencyName, { color: colors.text, fontSize: typography.sizes.md }]}>
                  {t.time12}
                </Text>
                <Text style={[styles.currencyCode, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
                  {t.preview}: 2:30 PM
                </Text>
              </View>
              {settings.timeFormat === '12h' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </Pressable>
            <Button title={t.cancel} variant="outline" onPress={() => setModalType(null)} style={{ marginTop: spacing.md }} />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Tax Modal */}
      <Modal
        visible={modalType === 'tax'}
        transparent
        animationType="fade"
        onRequestClose={() => setModalType(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalType(null)}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.surface, borderRadius: borderRadius.xl }]} onPress={e => e.stopPropagation()}>
            <Text style={[styles.modalTitle, { color: colors.text, fontSize: typography.sizes.lg }]}>
              {t.selectTax}
            </Text>
            {TAX_PRESETS.map(tax => (
              <Pressable
                key={tax.name}
                style={[styles.modalOption, {
                  backgroundColor: settings.taxRate === tax.rate ? `${colors.primary}15` : 'transparent',
                  borderRadius: borderRadius.md,
                }]}
                onPress={() => handleTaxSelect(tax)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.currencyName, { color: colors.text, fontSize: typography.sizes.md }]}>
                    {language === 'ru' ? tax.name : tax.nameEn}
                  </Text>
                  <Text style={[styles.currencyCode, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
                    {t.taxRate}: {tax.rate}%
                  </Text>
                </View>
                {settings.taxRate === tax.rate && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </Pressable>
            ))}
            <Button title={t.cancel} variant="outline" onPress={() => setModalType(null)} style={{ marginTop: spacing.md }} />
          </Pressable>
        </Pressable>
      </Modal>
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
  content: {},
  previewCard: {
    padding: 16,
  },
  previewLabel: {
    marginBottom: 12,
    fontWeight: '500',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewItem: {
    alignItems: 'center',
  },
  previewValue: {
    fontWeight: '600',
  },
  previewName: {
    marginTop: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4f8',
  },
  settingIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: {
    fontWeight: '500',
  },
  settingValue: {},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
  },
  modalTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    width: 40,
    textAlign: 'center',
  },
  currencyName: {
    fontWeight: '500',
  },
  currencyCode: {},
});
