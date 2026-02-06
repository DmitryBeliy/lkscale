import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { createSupplier } from '@/services/warehouseService';
import type { Supplier } from '@/types';

export default function CreateSupplierScreen() {
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    notes: '',
    paymentTerms: '',
    leadTimeDays: '7',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Ошибка', 'Введите название поставщика');
      return false;
    }
    if (formData.email && !formData.email.includes('@')) {
      Alert.alert('Ошибка', 'Введите корректный email');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);

    try {
      const supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name.trim(),
        contactName: formData.contactName.trim() || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        website: formData.website.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        paymentTerms: formData.paymentTerms.trim() || undefined,
        leadTimeDays: parseInt(formData.leadTimeDays) || 7,
        isActive: true,
      };

      const created = await createSupplier(supplierData);

      if (created) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
      } else {
        Alert.alert('Ошибка', 'Не удалось создать поставщика');
      }
    } catch (error) {
      console.error('Error creating supplier:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при создании поставщика');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Новый поставщик',
          presentation: 'modal',
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Basic Info */}
          <Animated.View entering={FadeIn} style={styles.section}>
            <Text style={styles.sectionTitle}>Основная информация</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Название *</Text>
              <TextInput
                style={styles.input}
                placeholder="Название компании"
                placeholderTextColor={colors.textLight}
                value={formData.name}
                onChangeText={(v) => handleInputChange('name', v)}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Контактное лицо</Text>
              <TextInput
                style={styles.input}
                placeholder="Имя контакта"
                placeholderTextColor={colors.textLight}
                value={formData.contactName}
                onChangeText={(v) => handleInputChange('contactName', v)}
                autoCapitalize="words"
              />
            </View>
          </Animated.View>

          {/* Contact Info */}
          <Animated.View entering={FadeIn.delay(100)} style={styles.section}>
            <Text style={styles.sectionTitle}>Контакты</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Телефон</Text>
              <TextInput
                style={styles.input}
                placeholder="+7 (999) 123-45-67"
                placeholderTextColor={colors.textLight}
                value={formData.phone}
                onChangeText={(v) => handleInputChange('phone', v)}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
                placeholderTextColor={colors.textLight}
                value={formData.email}
                onChangeText={(v) => handleInputChange('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Адрес</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Полный адрес"
                placeholderTextColor={colors.textLight}
                value={formData.address}
                onChangeText={(v) => handleInputChange('address', v)}
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Веб-сайт</Text>
              <TextInput
                style={styles.input}
                placeholder="www.example.com"
                placeholderTextColor={colors.textLight}
                value={formData.website}
                onChangeText={(v) => handleInputChange('website', v)}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </Animated.View>

          {/* Business Terms */}
          <Animated.View entering={FadeIn.delay(200)} style={styles.section}>
            <Text style={styles.sectionTitle}>Условия работы</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Срок поставки (дней)</Text>
              <TextInput
                style={styles.input}
                placeholder="7"
                placeholderTextColor={colors.textLight}
                value={formData.leadTimeDays}
                onChangeText={(v) => handleInputChange('leadTimeDays', v)}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Условия оплаты</Text>
              <TextInput
                style={styles.input}
                placeholder="Предоплата / Отсрочка 30 дней"
                placeholderTextColor={colors.textLight}
                value={formData.paymentTerms}
                onChangeText={(v) => handleInputChange('paymentTerms', v)}
              />
            </View>
          </Animated.View>

          {/* Notes */}
          <Animated.View entering={FadeIn.delay(300)} style={styles.section}>
            <Text style={styles.sectionTitle}>Заметки</Text>

            <View style={styles.inputGroup}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Дополнительная информация о поставщике..."
                placeholderTextColor={colors.textLight}
                value={formData.notes}
                onChangeText={(v) => handleInputChange('notes', v)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </Animated.View>

          {/* Submit Button */}
          <Animated.View entering={FadeIn.delay(400)} style={styles.submitContainer}>
            <Button
              title="Создать поставщика"
              onPress={handleSubmit}
              loading={isSubmitting}
              style={{ width: '100%' }}
            />
          </Animated.View>

          <View style={{ height: insets.bottom + spacing.lg }} />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitContainer: {
    marginTop: spacing.md,
  },
});
