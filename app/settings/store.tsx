import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card, Button } from '@/components/ui';
import {
  getStoreSettingsState,
  subscribeToStoreSettings,
  loadStoreSettings,
  saveStoreSettings,
  uploadLogo,
  currencyOptions,
  defaultStoreSettings,
} from '@/services/storeSettingsService';
import { useLocalization } from '@/localization';
import { StoreSettings } from '@/types';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

export default function StoreSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLocalization();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | undefined>();
  const [currency, setCurrency] = useState('RUB');
  const [currencySymbol, setCurrencySymbol] = useState('₽');
  const [taxRate, setTaxRate] = useState('20');
  const [taxName, setTaxName] = useState('НДС');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [invoicePrefix, setInvoicePrefix] = useState('INV');
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  useEffect(() => {
    const unsub = subscribeToStoreSettings(() => {
      const state = getStoreSettingsState();
      if (state.settings) {
        populateForm(state.settings);
      }
      setIsLoading(state.isLoading);
    });

    loadStoreSettings();

    return unsub;
  }, []);

  const populateForm = (s: StoreSettings) => {
    setBusinessName(s.businessName || defaultStoreSettings.businessName);
    setLogoUrl(s.logoUrl);
    setCurrency(s.currency || defaultStoreSettings.currency);
    setCurrencySymbol(s.currencySymbol || defaultStoreSettings.currencySymbol);
    setTaxRate(String(s.taxRate ?? defaultStoreSettings.taxRate));
    setTaxName(s.taxName || defaultStoreSettings.taxName);
    setAddress(s.address || '');
    setPhone(s.phone || '');
    setEmail(s.email || '');
    setWebsite(s.website || '');
    setInvoicePrefix(s.invoicePrefix || defaultStoreSettings.invoicePrefix);
    setInvoiceNotes(s.invoiceNotes || '');
  };

  const handleFieldChange = () => {
    setHasChanges(true);
  };

  const handleCurrencySelect = (code: string, symbol: string) => {
    setCurrency(code);
    setCurrencySymbol(symbol);
    setShowCurrencyPicker(false);
    handleFieldChange();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleUploadLogo = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Ошибка', 'Требуется доступ к галерее');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setIsUploading(true);
      const url = await uploadLogo(result.assets[0].base64);
      setIsUploading(false);

      if (url) {
        setLogoUrl(url);
        handleFieldChange();
      } else {
        Alert.alert('Ошибка', 'Не удалось загрузить логотип');
      }
    }
  };

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);

    const success = await saveStoreSettings({
      businessName,
      logoUrl,
      currency,
      currencySymbol,
      taxRate: parseFloat(taxRate) || 0,
      taxName,
      address: address || undefined,
      phone: phone || undefined,
      email: email || undefined,
      website: website || undefined,
      invoicePrefix,
      invoiceNotes: invoiceNotes || undefined,
    });

    setIsSaving(false);

    if (success) {
      setHasChanges(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t.storeSettings.saved, '', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert(t.common.error, 'Не удалось сохранить настройки');
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        'Несохранённые изменения',
        'Вы уверены, что хотите выйти без сохранения?',
        [
          { text: t.common.cancel, style: 'cancel' },
          { text: 'Выйти', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t.storeSettings.title,
          headerLeft: () => (
            <Pressable onPress={handleBack} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
          ),
          headerRight: () => (
            hasChanges ? (
              <Pressable onPress={handleSave} disabled={isSaving} style={styles.headerButton}>
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={styles.saveButtonText}>{t.common.save}</Text>
                )}
              </Pressable>
            ) : null
          ),
        }}
      />
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <>
              {/* Logo Section */}
              <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                <Card style={styles.logoCard}>
                  <Text style={styles.sectionTitle}>{t.storeSettings.logo}</Text>
                  <Pressable style={styles.logoContainer} onPress={handleUploadLogo}>
                    {isUploading ? (
                      <ActivityIndicator size="large" color={colors.primary} />
                    ) : logoUrl ? (
                      <Image source={{ uri: logoUrl }} style={styles.logo} />
                    ) : (
                      <View style={styles.logoPlaceholder}>
                        <Ionicons name="business" size={40} color={colors.textLight} />
                      </View>
                    )}
                    <View style={styles.logoUploadBadge}>
                      <Ionicons name="camera" size={16} color={colors.textInverse} />
                    </View>
                  </Pressable>
                  <Text style={styles.logoHint}>{t.storeSettings.uploadLogo}</Text>
                </Card>
              </Animated.View>

              {/* Business Info */}
              <Animated.View entering={FadeInDown.delay(150).duration(500)}>
                <Card style={styles.card}>
                  <Text style={styles.sectionTitle}>{t.storeSettings.businessName}</Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t.storeSettings.businessName}</Text>
                    <TextInput
                      style={styles.input}
                      value={businessName}
                      onChangeText={(text) => {
                        setBusinessName(text);
                        handleFieldChange();
                      }}
                      placeholder="Мой магазин"
                      placeholderTextColor={colors.textLight}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t.storeSettings.address}</Text>
                    <TextInput
                      style={[styles.input, styles.multilineInput]}
                      value={address}
                      onChangeText={(text) => {
                        setAddress(text);
                        handleFieldChange();
                      }}
                      placeholder="Адрес магазина"
                      placeholderTextColor={colors.textLight}
                      multiline
                      numberOfLines={2}
                    />
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
                      <Text style={styles.inputLabel}>{t.storeSettings.phone}</Text>
                      <TextInput
                        style={styles.input}
                        value={phone}
                        onChangeText={(text) => {
                          setPhone(text);
                          handleFieldChange();
                        }}
                        placeholder="+7 (999) 123-45-67"
                        placeholderTextColor={colors.textLight}
                        keyboardType="phone-pad"
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>{t.storeSettings.email}</Text>
                      <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={(text) => {
                          setEmail(text);
                          handleFieldChange();
                        }}
                        placeholder="shop@email.com"
                        placeholderTextColor={colors.textLight}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t.storeSettings.website}</Text>
                    <TextInput
                      style={styles.input}
                      value={website}
                      onChangeText={(text) => {
                        setWebsite(text);
                        handleFieldChange();
                      }}
                      placeholder="https://myshop.ru"
                      placeholderTextColor={colors.textLight}
                      keyboardType="url"
                      autoCapitalize="none"
                    />
                  </View>
                </Card>
              </Animated.View>

              {/* Currency & Tax */}
              <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                <Card style={styles.card}>
                  <Text style={styles.sectionTitle}>{t.storeSettings.currency}</Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t.storeSettings.currency}</Text>
                    <Pressable
                      style={styles.selectInput}
                      onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
                    >
                      <Text style={styles.selectText}>
                        {currencySymbol} {currency}
                      </Text>
                      <Ionicons
                        name={showCurrencyPicker ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={colors.textSecondary}
                      />
                    </Pressable>

                    {showCurrencyPicker && (
                      <View style={styles.currencyPicker}>
                        {currencyOptions.map((option) => (
                          <Pressable
                            key={option.code}
                            style={[
                              styles.currencyOption,
                              currency === option.code && styles.currencyOptionActive,
                            ]}
                            onPress={() => handleCurrencySelect(option.code, option.symbol)}
                          >
                            <Text style={[
                              styles.currencySymbol,
                              currency === option.code && styles.currencyTextActive,
                            ]}>
                              {option.symbol}
                            </Text>
                            <View style={styles.currencyInfo}>
                              <Text style={[
                                styles.currencyCode,
                                currency === option.code && styles.currencyTextActive,
                              ]}>
                                {option.code}
                              </Text>
                              <Text style={styles.currencyName}>{option.name}</Text>
                            </View>
                            {currency === option.code && (
                              <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                            )}
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>

                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
                      <Text style={styles.inputLabel}>{t.storeSettings.taxRate} (%)</Text>
                      <TextInput
                        style={styles.input}
                        value={taxRate}
                        onChangeText={(text) => {
                          setTaxRate(text.replace(/[^0-9.]/g, ''));
                          handleFieldChange();
                        }}
                        placeholder="20"
                        placeholderTextColor={colors.textLight}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>{t.storeSettings.taxName}</Text>
                      <TextInput
                        style={styles.input}
                        value={taxName}
                        onChangeText={(text) => {
                          setTaxName(text);
                          handleFieldChange();
                        }}
                        placeholder="НДС"
                        placeholderTextColor={colors.textLight}
                      />
                    </View>
                  </View>
                </Card>
              </Animated.View>

              {/* Invoice Settings */}
              <Animated.View entering={FadeInDown.delay(250).duration(500)}>
                <Card style={styles.card}>
                  <Text style={styles.sectionTitle}>{t.storeSettings.invoicePrefix}</Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t.storeSettings.invoicePrefix}</Text>
                    <TextInput
                      style={styles.input}
                      value={invoicePrefix}
                      onChangeText={(text) => {
                        setInvoicePrefix(text.toUpperCase());
                        handleFieldChange();
                      }}
                      placeholder="INV"
                      placeholderTextColor={colors.textLight}
                      autoCapitalize="characters"
                      maxLength={10}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t.storeSettings.invoiceNotes}</Text>
                    <TextInput
                      style={[styles.input, styles.multilineInput]}
                      value={invoiceNotes}
                      onChangeText={(text) => {
                        setInvoiceNotes(text);
                        handleFieldChange();
                      }}
                      placeholder="Спасибо за покупку!"
                      placeholderTextColor={colors.textLight}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </Card>
              </Animated.View>

              {/* Save Button */}
              {hasChanges && (
                <Animated.View entering={FadeInDown.delay(300).duration(500)}>
                  <Button
                    title={t.storeSettings.saveChanges}
                    onPress={handleSave}
                    loading={isSaving}
                    style={styles.saveButton}
                  />
                </Animated.View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  headerButton: {
    padding: spacing.sm,
  },
  saveButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.primary,
  },
  logoCard: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoContainer: {
    position: 'relative',
    marginVertical: spacing.md,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoUploadBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  logoHint: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  card: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  selectText: {
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: '500',
  },
  currencyPicker: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.md,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  currencyOptionActive: {
    backgroundColor: `${colors.primary}10`,
  },
  currencySymbol: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
    width: 40,
  },
  currencyInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  currencyCode: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  currencyName: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  currencyTextActive: {
    color: colors.primary,
  },
  saveButton: {
    marginTop: spacing.md,
  },
});
