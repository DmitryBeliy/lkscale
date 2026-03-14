import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/contexts/ThemeContext';
import { logger } from '@/lib/logger';
import { useLocalization } from '@/localization';
import { Card, Button } from '@/components/ui';

const BUSINESS_LOGO_KEY = '@lkscale_business_logo';
const BUSINESS_INFO_KEY = '@lkscale_business_info';

interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  logoUri: string | null;
}

const CONTENT = {
  ru: {
    title: 'Бизнес-профиль',
    logoSection: 'Логотип компании',
    logoDescription: 'Загрузите логотип для отображения в чеках, накладных и отчётах PDF',
    uploadLogo: 'Загрузить логотип',
    changeLogo: 'Изменить логотип',
    removeLogo: 'Удалить логотип',
    previewSection: 'Предпросмотр документа',
    previewDescription: 'Так будет выглядеть ваш логотип в документах',
    infoSection: 'Информация о компании',
    companyName: 'Название компании',
    address: 'Адрес',
    phone: 'Телефон',
    email: 'Email',
    taxId: 'ИНН',
    saveChanges: 'Сохранить изменения',
    saved: 'Сохранено!',
    logoRequirements: 'Рекомендуемый размер: 512x512 пикселей. Поддерживаемые форматы: PNG, JPG.',
    removeConfirm: 'Удалить логотип?',
    removeConfirmMessage: 'Логотип будет удалён из всех документов.',
    selectSource: 'Выберите источник',
    camera: 'Камера',
    gallery: 'Галерея',
    receipt: 'Чек',
    invoice: 'Накладная',
  },
  en: {
    title: 'Business Profile',
    logoSection: 'Company Logo',
    logoDescription: 'Upload a logo to display on receipts, invoices, and PDF reports',
    uploadLogo: 'Upload Logo',
    changeLogo: 'Change Logo',
    removeLogo: 'Remove Logo',
    previewSection: 'Document Preview',
    previewDescription: 'This is how your logo will appear in documents',
    infoSection: 'Company Information',
    companyName: 'Company Name',
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
    taxId: 'Tax ID',
    saveChanges: 'Save Changes',
    saved: 'Saved!',
    logoRequirements: 'Recommended size: 512x512 pixels. Supported formats: PNG, JPG.',
    removeConfirm: 'Remove logo?',
    removeConfirmMessage: 'The logo will be removed from all documents.',
    selectSource: 'Select Source',
    camera: 'Camera',
    gallery: 'Gallery',
    receipt: 'Receipt',
    invoice: 'Invoice',
  },
};

export default function BusinessProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, borderRadius, typography } = useTheme();
  const { language } = useLocalization();

  const content = CONTENT[language] || CONTENT.en;

  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: '',
    address: '',
    phone: '',
    email: '',
    taxId: '',
    logoUri: null,
  });

  // Load saved data on mount
  React.useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    try {
      const [savedLogo, savedInfo] = await Promise.all([
        AsyncStorage.getItem(BUSINESS_LOGO_KEY),
        AsyncStorage.getItem(BUSINESS_INFO_KEY),
      ]);

      if (savedLogo) setLogoUri(savedLogo);
      if (savedInfo) setBusinessInfo(JSON.parse(savedInfo));
    } catch (error) {
      logger.error('Error loading business data:', error);
    }
  };

  const requestPermissions = useCallback(async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        language === 'ru' ? 'Требуются разрешения' : 'Permissions Required',
        language === 'ru'
          ? 'Для загрузки логотипа необходимо разрешение на камеру и галерею'
          : 'Camera and gallery permissions are required to upload a logo'
      );
      return false;
    }
    return true;
  }, [language]);

  const pickImage = useCallback(async (source: 'camera' | 'library') => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      let result;
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setLogoUri(uri);
        await AsyncStorage.setItem(BUSINESS_LOGO_KEY, uri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      logger.error('Error picking image:', error);
      Alert.alert(
        language === 'ru' ? 'Ошибка' : 'Error',
        language === 'ru' ? 'Не удалось загрузить изображение' : 'Failed to load image'
      );
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const showImageSourcePicker = () => {
    Alert.alert(
      content.selectSource,
      '',
      [
        { text: content.camera, onPress: () => pickImage('camera') },
        { text: content.gallery, onPress: () => pickImage('library') },
        { text: language === 'ru' ? 'Отмена' : 'Cancel', style: 'cancel' },
      ]
    );
  };

  const removeLogo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      content.removeConfirm,
      content.removeConfirmMessage,
      [
        { text: language === 'ru' ? 'Отмена' : 'Cancel', style: 'cancel' },
        {
          text: content.removeLogo,
          style: 'destructive',
          onPress: async () => {
            setLogoUri(null);
            await AsyncStorage.removeItem(BUSINESS_LOGO_KEY);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const saveChanges = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    try {
      await AsyncStorage.setItem(BUSINESS_INFO_KEY, JSON.stringify(businessInfo));
      setIsSaved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      logger.error('Error saving business info:', error);
      Alert.alert(
        language === 'ru' ? 'Ошибка' : 'Error',
        language === 'ru' ? 'Не удалось сохранить данные' : 'Failed to save data'
      );
    } finally {
      setIsLoading(false);
    }
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
          {content.title}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { padding: spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Upload Section */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Card style={{ marginBottom: spacing.lg }}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.sizes.lg }]}>
              {content.logoSection}
            </Text>
            <Text style={[styles.sectionDescription, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
              {content.logoDescription}
            </Text>

            <View style={[styles.logoContainer, { marginTop: spacing.md }]}>
              {logoUri ? (
                <Animated.View entering={FadeIn.duration(300)} style={styles.logoWrapper}>
                  <Image
                    source={{ uri: logoUri }}
                    style={[styles.logoImage, { borderRadius: borderRadius.lg, borderColor: colors.border }]}
                    resizeMode="contain"
                  />
                  <View style={styles.logoActions}>
                    <Pressable
                      style={[styles.logoActionButton, { backgroundColor: colors.primary }]}
                      onPress={showImageSourcePicker}
                      disabled={isLoading}
                    >
                      <Ionicons name="camera" size={20} color="#fff" />
                      <Text style={styles.logoActionText}>{content.changeLogo}</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.logoActionButton, { backgroundColor: colors.error }]}
                      onPress={removeLogo}
                      disabled={isLoading}
                    >
                      <Ionicons name="trash" size={20} color="#fff" />
                      <Text style={styles.logoActionText}>{content.removeLogo}</Text>
                    </Pressable>
                  </View>
                </Animated.View>
              ) : (
                <Pressable
                  style={[styles.uploadButton, {
                    borderColor: colors.border,
                    backgroundColor: colors.inputBackground,
                    borderRadius: borderRadius.lg,
                  }]}
                  onPress={showImageSourcePicker}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="large" color={colors.primary} />
                  ) : (
                    <>
                      <View style={[styles.uploadIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                        <Ionicons name="cloud-upload" size={40} color={colors.primary} />
                      </View>
                      <Text style={[styles.uploadText, { color: colors.text, fontSize: typography.sizes.md }]}>
                        {content.uploadLogo}
                      </Text>
                      <Text style={[styles.uploadHint, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                        {content.logoRequirements}
                      </Text>
                    </>
                  )}
                </Pressable>
              )}
            </View>
          </Card>
        </Animated.View>

        {/* Document Preview Section */}
        {logoUri && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Card style={{ marginBottom: spacing.lg }}>
              <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.sizes.lg }]}>
                {content.previewSection}
              </Text>
              <Text style={[styles.sectionDescription, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
                {content.previewDescription}
              </Text>

              <View style={[styles.previewContainer, { marginTop: spacing.md }]}>
                {/* Receipt Preview */}
                <View style={[styles.previewCard, {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: borderRadius.md,
                }]}>
                  <View style={styles.previewHeader}>
                    <Image
                      source={{ uri: logoUri }}
                      style={styles.previewLogo}
                      resizeMode="contain"
                    />
                    <View style={styles.previewInfo}>
                      <Text style={[styles.previewTitle, { color: colors.text }]}>
                        {businessInfo.name || 'Company Name'}
                      </Text>
                      <Text style={[styles.previewSubtitle, { color: colors.textSecondary }]}>
                        {content.receipt} #00001
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.previewDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.previewLine}>
                    <Text style={[styles.previewLineText, { color: colors.textSecondary }]}>
                      {language === 'ru' ? 'Товар 1' : 'Item 1'}
                    </Text>
                    <Text style={[styles.previewLineText, { color: colors.text }]}>₽1,500</Text>
                  </View>
                  <View style={styles.previewLine}>
                    <Text style={[styles.previewLineText, { color: colors.textSecondary }]}>
                      {language === 'ru' ? 'Товар 2' : 'Item 2'}
                    </Text>
                    <Text style={[styles.previewLineText, { color: colors.text }]}>₽2,000</Text>
                  </View>
                  <View style={[styles.previewDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.previewLine}>
                    <Text style={[styles.previewLineBold, { color: colors.text }]}>
                      {language === 'ru' ? 'Итого' : 'Total'}
                    </Text>
                    <Text style={[styles.previewLineBold, { color: colors.primary }]}>₽3,500</Text>
                  </View>
                </View>

                {/* Invoice Preview */}
                <View style={[styles.previewCard, {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: borderRadius.md,
                }]}>
                  <LinearGradient
                    colors={[colors.primary, colors.gradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.invoiceHeader, { borderTopLeftRadius: borderRadius.md, borderTopRightRadius: borderRadius.md }]}
                  >
                    <Image
                      source={{ uri: logoUri }}
                      style={styles.invoiceLogo}
                      resizeMode="contain"
                    />
                    <Text style={styles.invoiceTitle}>{content.invoice}</Text>
                  </LinearGradient>
                  <View style={styles.invoiceContent}>
                    <Text style={[styles.invoiceNumber, { color: colors.textSecondary }]}>#INV-2024-001</Text>
                    <View style={styles.previewLine}>
                      <Text style={[styles.previewLineText, { color: colors.textSecondary }]}>
                        {language === 'ru' ? 'Дата' : 'Date'}
                      </Text>
                      <Text style={[styles.previewLineText, { color: colors.text }]}>01.01.2024</Text>
                    </View>
                    <View style={styles.previewLine}>
                      <Text style={[styles.previewLineText, { color: colors.textSecondary }]}>
                        {language === 'ru' ? 'Сумма' : 'Amount'}
                      </Text>
                      <Text style={[styles.previewLineBold, { color: colors.success }]}>₽15,000</Text>
                    </View>
                  </View>
                </View>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Save Button */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Button
            title={isSaved ? content.saved : content.saveChanges}
            onPress={saveChanges}
            disabled={isLoading || isSaved}
            style={{ marginBottom: spacing.lg }}
            icon={isSaved ? <Ionicons name="checkmark-circle" size={20} color="#fff" /> : undefined}
          />
        </Animated.View>

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
    flex: 1,
    textAlign: 'center',
  },
  content: {},
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionDescription: {
    lineHeight: 20,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  logoImage: {
    width: 150,
    height: 150,
    borderWidth: 2,
  },
  logoActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  logoActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  logoActionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  uploadButton: {
    width: '100%',
    paddingVertical: 40,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadText: {
    fontWeight: '600',
    marginBottom: 8,
  },
  uploadHint: {
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 18,
  },
  previewContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  previewCard: {
    flex: 1,
    borderWidth: 1,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
  },
  previewLogo: {
    width: 32,
    height: 32,
    borderRadius: 4,
  },
  previewInfo: {
    flex: 1,
  },
  previewTitle: {
    fontWeight: '600',
    fontSize: 11,
  },
  previewSubtitle: {
    fontSize: 9,
  },
  previewDivider: {
    height: 1,
    marginHorizontal: 10,
  },
  previewLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  previewLineText: {
    fontSize: 9,
  },
  previewLineBold: {
    fontSize: 10,
    fontWeight: '700',
  },
  invoiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
  },
  invoiceLogo: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  invoiceTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  invoiceContent: {
    padding: 10,
  },
  invoiceNumber: {
    fontSize: 9,
    marginBottom: 6,
  },
});
