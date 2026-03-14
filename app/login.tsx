import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { Input, Button } from '@/components/ui';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

type AuthMode = 'login' | 'signup' | 'forgot';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ error?: string }>();
  const {
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    signOut,
    isLoading,
    error,
    clearError,
    pendingEmailVerification,
    pendingPasswordReset,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [localErrors, setLocalErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  // Animation for logo pulse
  const logoScale = useSharedValue(1);

  useEffect(() => {
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  // Show error from URL params (OAuth errors)
  useEffect(() => {
    if (params.error) {
      Alert.alert('Ошибка', params.error);
    }
  }, [params.error]);

  // Show auth errors
  useEffect(() => {
    if (error) {
      Alert.alert('Ошибка', error.message);
      clearError();
    }
  }, [error, clearError]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; name?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Неверный формат email';
    }

    if (mode !== 'forgot') {
      if (!password) {
        newErrors.password = 'Введите пароль';
      } else if (mode === 'signup' && password.length < 6) {
        newErrors.password = 'Минимум 6 символов';
      }
    }

    if (mode === 'signup' && !name.trim()) {
      newErrors.name = 'Введите имя';
    }

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)');
      } else if (mode === 'signup') {
        const result = await signUpWithEmail(email, password, {
          data: { name: name.trim() }
        });
        if (result.emailConfirmationRequired) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert(
            'Подтвердите email',
            `Мы отправили письмо на ${email}. Перейдите по ссылке для завершения регистрации.`
          );
        } else {
          router.replace('/(tabs)');
        }
      } else if (mode === 'forgot') {
        await resetPassword(email);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Письмо отправлено',
          'Проверьте почту и следуйте инструкциям для сброса пароля.'
        );
        setMode('login');
      }
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(newMode);
    setLocalErrors({});
    clearError();
  };

  const toggleRememberMe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRememberMe(!rememberMe);
  };

  // Show email verification pending screen
  if (pendingEmailVerification) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={styles.verificationContainer}>
          <View style={styles.verificationIcon}>
            <Ionicons name="mail" size={64} color={colors.primary} />
          </View>
          <Text style={styles.verificationTitle}>Проверьте почту</Text>
          <Text style={styles.verificationText}>
            Мы отправили письмо с подтверждением на вашу почту.
            Перейдите по ссылке в письме для завершения регистрации.
          </Text>
          <Button
            title="Вернуться к входу"
            variant="outline"
            onPress={() => switchMode('login')}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </View>
    );
  }

  // Show password reset pending screen
  if (pendingPasswordReset) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={styles.verificationContainer}>
          <View style={styles.verificationIcon}>
            <Ionicons name="key" size={64} color={colors.primary} />
          </View>
          <Text style={styles.verificationTitle}>Проверьте почту</Text>
          <Text style={styles.verificationText}>
            Мы отправили инструкции по сбросу пароля на вашу почту.
          </Text>
          <Button
            title="Вернуться к входу"
            variant="outline"
            onPress={() => switchMode('login')}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </View>
    );
  }

  const getTitle = () => {
    switch (mode) {
      case 'signup':
        return 'Создание\nаккаунта';
      case 'forgot':
        return 'Восстановление\nпароля';
      default:
        return 'Вход в личный\nкабинет MaGGaz12';
    }
  };

  const getButtonTitle = () => {
    switch (mode) {
      case 'signup':
        return 'СОЗДАТЬ АККАУНТ';
      case 'forgot':
        return 'ОТПРАВИТЬ ССЫЛКУ';
      default:
        return 'ВОЙТИ';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.header}>
            <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
              <Ionicons name="business" size={48} color={colors.primary} />
            </Animated.View>
            <Text style={styles.title}>{getTitle()}</Text>
            {mode !== 'login' && (
              <Text style={styles.subtitle}>
                {mode === 'signup'
                  ? 'Заполните данные для регистрации'
                  : 'Введите email для восстановления'
                }
              </Text>
            )}
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.form}>
            {mode === 'signup' && (
              <Input
                placeholder="Имя"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
                icon="person-outline"
                error={localErrors.name}
              />
            )}

            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              icon="mail-outline"
              error={localErrors.email}
            />

            {mode !== 'forgot' && (
              <Input
                placeholder="Пароль"
                value={password}
                onChangeText={setPassword}
                isPassword
                autoCapitalize="none"
                autoComplete={mode === 'signup' ? 'new-password' : 'password'}
                icon="lock-closed-outline"
                error={localErrors.password}
              />
            )}

            {mode === 'login' && (
              <Pressable style={styles.rememberRow} onPress={toggleRememberMe}>
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxChecked,
                  ]}
                >
                  {rememberMe && (
                    <Ionicons name="checkmark" size={14} color={colors.textInverse} />
                  )}
                </View>
                <Text style={styles.rememberText}>Запомнить меня</Text>
              </Pressable>
            )}

            <Button
              title={getButtonTitle()}
              onPress={handleSubmit}
              loading={isLoading}
              size="lg"
              style={styles.submitButton}
            />

            {mode === 'login' && (
              <Pressable style={styles.forgotButton} onPress={() => switchMode('forgot')}>
                <Text style={styles.forgotText}>Забыли пароль?</Text>
              </Pressable>
            )}

            <View style={styles.switchModeContainer}>
              {mode === 'login' ? (
                <Pressable onPress={() => switchMode('signup')}>
                  <Text style={styles.switchModeText}>
                    Нет аккаунта? <Text style={styles.switchModeLink}>Зарегистрироваться</Text>
                  </Text>
                </Pressable>
              ) : (
                <Pressable onPress={() => switchMode('login')}>
                  <Text style={styles.switchModeText}>
                    Уже есть аккаунт? <Text style={styles.switchModeLink}>Войти</Text>
                  </Text>
                </Pressable>
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    padding: spacing.lg,
    paddingTop: spacing.xl * 2,
    minHeight: '100vh',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: borderRadius.xl,
    backgroundColor: `${colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    lineHeight: typography.sizes.xxl * 1.3,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rememberText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  submitButton: {
    marginBottom: spacing.md,
  },
  forgotButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  forgotText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  switchModeContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  switchModeText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  switchModeLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  verificationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  verificationIcon: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  verificationTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  verificationText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.sizes.md * 1.5,
  },
});
