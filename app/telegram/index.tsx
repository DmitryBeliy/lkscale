import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/localization';
import { defaultTelegramConfig, generateDailySummaryMessage } from '@/services/enterpriseService';
import { TelegramConfig } from '@/types/enterprise';

export default function TelegramScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, typography, borderRadius, shadows, isDark } = useTheme();
  const { t } = useLocalization();

  const [config, setConfig] = useState<TelegramConfig>(defaultTelegramConfig);
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleConnect = async () => {
    if (!botToken || !chatId) {
      Alert.alert(t.common.error, 'Введите токен бота и Chat ID');
      return;
    }

    setIsConnecting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 1500));

    setConfig({
      ...config,
      isConnected: true,
      botToken,
      chatId,
      updatedAt: new Date().toISOString(),
    });

    setIsConnecting(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(t.common.success, t.telegram.connectionSuccess);
  };

  const handleDisconnect = () => {
    Alert.alert(
      t.telegram.disconnectTitle,
      t.telegram.disconnectMessage,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.telegram.disconnect,
          style: 'destructive',
          onPress: () => {
            setConfig({
              ...config,
              isConnected: false,
              botToken: undefined,
              chatId: undefined,
            });
            setBotToken('');
            setChatId('');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleSendTestMessage = async () => {
    if (!config.isConnected) {
      Alert.alert(t.common.error, t.telegram.notConnected);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1000));

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(t.common.success, t.telegram.testMessageSent);
  };

  const handleCopyMessage = async () => {
    const message = generateDailySummaryMessage();
    await Clipboard.setStringAsync(message);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(t.common.success, 'Сообщение скопировано');
  };

  const openBotFatherHelp = () => {
    Linking.openURL('https://t.me/BotFather');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: insets.top + spacing.sm,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: typography.sizes.xxl,
      fontWeight: '700',
      color: '#fff',
    },
    placeholder: {
      width: 40,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      marginTop: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      gap: spacing.xs,
    },
    statusConnected: {
      backgroundColor: 'rgba(34,197,94,0.2)',
    },
    statusDisconnected: {
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusText: {
      fontSize: typography.sizes.sm,
      fontWeight: '600',
      color: '#fff',
    },
    scrollContent: {
      padding: spacing.md,
      paddingBottom: insets.bottom + spacing.xxl,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    cardTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md,
    },
    inputLabel: {
      fontSize: typography.sizes.sm,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    inputHelper: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      fontSize: typography.sizes.md,
      color: colors.text,
      marginBottom: spacing.md,
    },
    inputDisabled: {
      backgroundColor: colors.border,
      color: colors.textSecondary,
    },
    helpLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.lg,
    },
    helpLinkText: {
      fontSize: typography.sizes.sm,
      color: colors.primary,
    },
    connectButton: {
      backgroundColor: '#0088cc',
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    connectButtonText: {
      fontSize: typography.sizes.md,
      fontWeight: '700',
      color: '#fff',
    },
    disconnectButton: {
      backgroundColor: colors.error,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingRowLast: {
      borderBottomWidth: 0,
    },
    settingInfo: {
      flex: 1,
      marginRight: spacing.md,
    },
    settingTitle: {
      fontSize: typography.sizes.md,
      fontWeight: '600',
      color: colors.text,
    },
    settingDescription: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    timePickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
    },
    timePickerLabel: {
      fontSize: typography.sizes.md,
      fontWeight: '600',
      color: colors.text,
    },
    timePickerValue: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      gap: spacing.xs,
    },
    timePickerText: {
      fontSize: typography.sizes.md,
      fontWeight: '600',
      color: colors.primary,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      gap: spacing.sm,
    },
    actionButtonText: {
      fontSize: typography.sizes.sm,
      fontWeight: '600',
      color: colors.primary,
    },
    previewCard: {
      backgroundColor: '#1a1a2e',
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    previewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
      gap: spacing.sm,
    },
    previewAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#0088cc',
      alignItems: 'center',
      justifyContent: 'center',
    },
    previewName: {
      fontSize: typography.sizes.md,
      fontWeight: '600',
      color: '#fff',
    },
    previewTime: {
      fontSize: typography.sizes.xs,
      color: 'rgba(255,255,255,0.6)',
    },
    previewMessage: {
      backgroundColor: '#2b5278',
      borderRadius: borderRadius.md,
      borderTopLeftRadius: 4,
      padding: spacing.md,
    },
    previewText: {
      fontSize: typography.sizes.sm,
      color: '#fff',
      lineHeight: 20,
    },
    infoCard: {
      backgroundColor: `${colors.primary}10`,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      flexDirection: 'row',
      gap: spacing.md,
    },
    infoIcon: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.md,
      backgroundColor: `${colors.primary}20`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoContent: {
      flex: 1,
    },
    infoTitle: {
      fontSize: typography.sizes.md,
      fontWeight: '600',
      color: colors.text,
    },
    infoDescription: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      marginTop: 4,
      lineHeight: 18,
    },
  });

  const previewMessage = generateDailySummaryMessage();

  return (
    <View style={styles.container}>
      {/* Telegram-style Header */}
      <LinearGradient
        colors={isDark ? ['#1a1a2e', '#16213e'] : ['#0088cc', '#0077b5']}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>{t.telegram.title}</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={[
          styles.statusBadge,
          config.isConnected ? styles.statusConnected : styles.statusDisconnected,
        ]}>
          <View style={[
            styles.statusDot,
            { backgroundColor: config.isConnected ? '#22c55e' : 'rgba(255,255,255,0.5)' }
          ]} />
          <Text style={styles.statusText}>
            {config.isConnected ? t.telegram.connected : t.telegram.notConnected}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Connection Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t.telegram.botSettings}</Text>

            <Text style={styles.inputLabel}>{t.telegram.botToken}</Text>
            <Text style={styles.inputHelper}>Получите у @BotFather в Telegram</Text>
            <TextInput
              style={[styles.input, config.isConnected && styles.inputDisabled]}
              value={botToken}
              onChangeText={setBotToken}
              placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
              placeholderTextColor={colors.textLight}
              editable={!config.isConnected}
              secureTextEntry
            />

            <Text style={styles.inputLabel}>{t.telegram.chatId}</Text>
            <Text style={styles.inputHelper}>ID чата или группы для отправки сообщений</Text>
            <TextInput
              style={[styles.input, config.isConnected && styles.inputDisabled]}
              value={chatId}
              onChangeText={setChatId}
              placeholder="-1001234567890"
              placeholderTextColor={colors.textLight}
              editable={!config.isConnected}
              keyboardType="numbers-and-punctuation"
            />

            <Pressable style={styles.helpLink} onPress={openBotFatherHelp}>
              <Ionicons name="help-circle" size={18} color={colors.primary} />
              <Text style={styles.helpLinkText}>{t.telegram.howToGetToken}</Text>
            </Pressable>

            <Pressable
              style={[styles.connectButton, config.isConnected && styles.disconnectButton]}
              onPress={config.isConnected ? handleDisconnect : handleConnect}
              disabled={isConnecting}
            >
              <Ionicons
                name={config.isConnected ? 'close-circle' : 'paper-plane'}
                size={20}
                color="#fff"
              />
              <Text style={styles.connectButtonText}>
                {isConnecting
                  ? t.telegram.connecting
                  : config.isConnected
                    ? t.telegram.disconnect
                    : t.telegram.connect}
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Notification Settings */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t.telegram.notificationSettings}</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{t.telegram.dailySummary}</Text>
                <Text style={styles.settingDescription}>{t.telegram.dailySummaryDesc}</Text>
              </View>
              <Switch
                value={config.notifyDailySummary}
                onValueChange={(value) => setConfig({ ...config, notifyDailySummary: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{t.telegram.lowStockAlerts}</Text>
                <Text style={styles.settingDescription}>{t.telegram.lowStockAlertsDesc}</Text>
              </View>
              <Switch
                value={config.notifyLowStock}
                onValueChange={(value) => setConfig({ ...config, notifyLowStock: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{t.telegram.newOrderAlerts}</Text>
                <Text style={styles.settingDescription}>{t.telegram.newOrderAlertsDesc}</Text>
              </View>
              <Switch
                value={config.notifyNewOrders}
                onValueChange={(value) => setConfig({ ...config, notifyNewOrders: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={[styles.settingRow, styles.settingRowLast]}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{t.telegram.anomalyAlerts}</Text>
                <Text style={styles.settingDescription}>{t.telegram.anomalyAlertsDesc}</Text>
              </View>
              <Switch
                value={config.notifyAnomalies}
                onValueChange={(value) => setConfig({ ...config, notifyAnomalies: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.timePickerRow}>
              <Text style={styles.timePickerLabel}>{t.telegram.summaryTime}</Text>
              <Pressable style={styles.timePickerValue}>
                <Ionicons name="time" size={18} color={colors.primary} />
                <Text style={styles.timePickerText}>{config.summaryTime}</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>

        {/* Actions */}
        {config.isConnected && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t.telegram.actions}</Text>

              <View style={styles.actionButtons}>
                <Pressable style={styles.actionButton} onPress={handleSendTestMessage}>
                  <Ionicons name="paper-plane" size={20} color={colors.primary} />
                  <Text style={styles.actionButtonText}>{t.telegram.sendTest}</Text>
                </Pressable>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => setShowPreview(!showPreview)}
                >
                  <Ionicons name="eye" size={20} color={colors.primary} />
                  <Text style={styles.actionButtonText}>{t.telegram.preview}</Text>
                </Pressable>
              </View>

              {showPreview && (
                <View style={styles.previewCard}>
                  <View style={styles.previewHeader}>
                    <View style={styles.previewAvatar}>
                      <Ionicons name="storefront" size={18} color="#fff" />
                    </View>
                    <View>
                      <Text style={styles.previewName}>MaGGaz12 Bot</Text>
                      <Text style={styles.previewTime}>сегодня в {config.summaryTime}</Text>
                    </View>
                  </View>
                  <View style={styles.previewMessage}>
                    <Text style={styles.previewText}>{previewMessage}</Text>
                  </View>
                  <Pressable
                    style={[styles.actionButton, { marginTop: spacing.sm, backgroundColor: 'rgba(255,255,255,0.1)' }]}
                    onPress={handleCopyMessage}
                  >
                    <Ionicons name="copy" size={16} color="#fff" />
                    <Text style={[styles.actionButtonText, { color: '#fff' }]}>Копировать</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* Info Card */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons name="information" size={22} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>{t.telegram.howItWorks}</Text>
              <Text style={styles.infoDescription}>
                {t.telegram.howItWorksDesc}
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
