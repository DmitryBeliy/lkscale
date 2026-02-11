import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/localization';
import { Card, Button } from '@/components/ui';
import {
  mockExpenses,
  getFinancialSummary,
  getExpenseCategoryIcon,
  getExpenseCategoryColor,
  generateQRPayment,
} from '@/services/enterpriseService';
import { Expense, ExpenseCategory, QRPayment } from '@/types/enterprise';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'rent', 'salaries', 'utilities', 'taxes', 'inventory', 'marketing',
  'equipment', 'supplies', 'insurance', 'maintenance', 'delivery', 'banking', 'other'
];

export default function FinanceScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { t, formatCurrency } = useLocalization();

  const [refreshing, setRefreshing] = useState(false);
  const [expenses] = useState<Expense[]>(mockExpenses);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showQRPayment, setShowQRPayment] = useState(false);
  const [qrPayment, setQrPayment] = useState<QRPayment | null>(null);
  const [selectedTab, setSelectedTab] = useState<'expenses' | 'qr'>('expenses');

  // New expense form
  const [newExpense, setNewExpense] = useState({
    category: 'other' as ExpenseCategory,
    amount: '',
    description: '',
    isRecurring: false,
  });

  // QR Payment form
  const [qrAmount, setQrAmount] = useState('');
  const [qrDescription, setQrDescription] = useState('');

  const financialSummary = getFinancialSummary('month');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await new Promise(resolve => setTimeout(resolve, 500));
    setRefreshing(false);
  }, []);

  const getCategoryLabel = (category: ExpenseCategory): string => {
    const labels: Record<ExpenseCategory, string> = {
      rent: t.finance.rent,
      salaries: t.finance.salaries,
      utilities: t.finance.utilities,
      taxes: t.finance.taxes,
      inventory: t.finance.inventory,
      marketing: t.finance.marketing,
      equipment: t.finance.equipment,
      supplies: t.finance.supplies,
      insurance: t.finance.insurance,
      maintenance: t.finance.maintenance,
      delivery: t.finance.delivery,
      banking: t.finance.banking,
      other: t.finance.other,
    };
    return labels[category] || category;
  };

  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.description) {
      Alert.alert(t.common.error, 'Заполните все поля');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowAddExpense(false);
    setNewExpense({ category: 'other', amount: '', description: '', isRecurring: false });
    Alert.alert(t.common.success, 'Расход добавлен');
  };

  const handleGenerateQR = () => {
    const amount = parseFloat(qrAmount);
    if (!amount || amount <= 0) {
      Alert.alert(t.common.error, 'Введите сумму');
      return;
    }
    const payment = generateQRPayment(amount, undefined, qrDescription || undefined);
    setQrPayment(payment);
    setShowQRPayment(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingTop: insets.top + spacing.sm,
      paddingBottom: spacing.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      flex: 1,
      fontSize: typography.sizes.xl,
      fontWeight: '700',
      color: colors.text,
      marginLeft: spacing.md,
    },
    tabContainer: {
      flexDirection: 'row',
      padding: spacing.md,
      gap: spacing.sm,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.surface,
      gap: spacing.sm,
      ...shadows.sm,
    },
    tabActive: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: typography.sizes.md,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    tabTextActive: {
      color: '#fff',
    },
    scrollContent: {
      padding: spacing.md,
      paddingBottom: spacing.xxl,
    },
    summaryCard: {
      padding: spacing.lg,
      marginBottom: spacing.lg,
    },
    summaryTitle: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    summaryValue: {
      fontSize: typography.sizes.xxxl,
      fontWeight: '700',
      color: colors.text,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    summaryItem: {
      alignItems: 'center',
    },
    summaryItemValue: {
      fontSize: typography.sizes.lg,
      fontWeight: '600',
      color: colors.text,
    },
    summaryItemLabel: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: '600',
      color: colors.text,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.full,
      gap: spacing.xs,
    },
    addButtonText: {
      fontSize: typography.sizes.sm,
      fontWeight: '600',
      color: '#fff',
    },
    expenseCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    expenseIcon: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    expenseInfo: {
      flex: 1,
    },
    expenseDescription: {
      fontSize: typography.sizes.md,
      fontWeight: '500',
      color: colors.text,
    },
    expenseCategory: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    expenseAmount: {
      fontSize: typography.sizes.md,
      fontWeight: '700',
      color: colors.error,
    },
    expenseDate: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
      marginTop: 2,
    },
    qrSection: {
      alignItems: 'center',
      padding: spacing.lg,
    },
    qrTitle: {
      fontSize: typography.sizes.xl,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    qrSubtitle: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    qrInput: {
      width: '100%',
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      fontSize: typography.sizes.md,
      color: colors.text,
      marginBottom: spacing.md,
    },
    qrAmountInput: {
      fontSize: typography.sizes.xxxl,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    qrPreview: {
      width: 200,
      height: 200,
      backgroundColor: '#fff',
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: spacing.lg,
      ...shadows.lg,
    },
    qrCode: {
      width: 180,
      height: 180,
      backgroundColor: colors.text,
      borderRadius: borderRadius.sm,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      padding: spacing.lg,
      paddingBottom: insets.bottom + spacing.lg,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    modalTitle: {
      fontSize: typography.sizes.xl,
      fontWeight: '700',
      color: colors.text,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    categoryItem: {
      width: '30%',
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    categoryItemSelected: {
      borderColor: colors.primary,
    },
    categoryIcon: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    categoryLabel: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    recurringToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
      marginTop: spacing.md,
    },
    recurringLabel: {
      fontSize: typography.sizes.md,
      color: colors.text,
    },
    toggleButton: {
      width: 50,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.borderLight,
      justifyContent: 'center',
      paddingHorizontal: 2,
    },
    toggleButtonActive: {
      backgroundColor: colors.primary,
    },
    toggleKnob: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: '#fff',
    },
    toggleKnobActive: {
      transform: [{ translateX: 20 }],
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{t.finance.financialSummary}</Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, selectedTab === 'expenses' && styles.tabActive]}
          onPress={() => setSelectedTab('expenses')}
        >
          <Ionicons
            name="wallet-outline"
            size={20}
            color={selectedTab === 'expenses' ? '#fff' : colors.textSecondary}
          />
          <Text style={[styles.tabText, selectedTab === 'expenses' && styles.tabTextActive]}>
            {t.finance.expenses}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, selectedTab === 'qr' && styles.tabActive]}
          onPress={() => setSelectedTab('qr')}
        >
          <Ionicons
            name="qr-code-outline"
            size={20}
            color={selectedTab === 'qr' ? '#fff' : colors.textSecondary}
          />
          <Text style={[styles.tabText, selectedTab === 'qr' && styles.tabTextActive]}>
            {t.payments.qrPayment}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {selectedTab === 'expenses' ? (
          <>
            {/* Financial Summary */}
            <Animated.View entering={FadeInDown.delay(100).duration(400)}>
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>{t.executive.netProfit} (месяц)</Text>
                <Text style={[styles.summaryValue, { color: financialSummary.netProfit >= 0 ? colors.success : colors.error }]}>
                  {formatCurrency(financialSummary.netProfit)}
                </Text>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryItemValue, { color: colors.success }]}>
                      {formatCurrency(financialSummary.grossRevenue, true)}
                    </Text>
                    <Text style={styles.summaryItemLabel}>Доход</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryItemValue, { color: colors.error }]}>
                      {formatCurrency(financialSummary.totalExpenses, true)}
                    </Text>
                    <Text style={styles.summaryItemLabel}>Расход</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryItemValue}>
                      {financialSummary.netMargin.toFixed(1)}%
                    </Text>
                    <Text style={styles.summaryItemLabel}>Маржа</Text>
                  </View>
                </View>
              </Card>
            </Animated.View>

            {/* Expenses List */}
            <Animated.View entering={FadeInDown.delay(150).duration(400)}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t.finance.expenses}</Text>
                <Pressable style={styles.addButton} onPress={() => setShowAddExpense(true)}>
                  <Ionicons name="add" size={18} color="#fff" />
                  <Text style={styles.addButtonText}>{t.finance.addExpense}</Text>
                </Pressable>
              </View>

              {expenses.map((expense, i) => {
                const categoryColor = getExpenseCategoryColor(expense.category);
                const categoryIcon = getExpenseCategoryIcon(expense.category);
                return (
                  <Animated.View key={expense.id} entering={FadeInDown.delay(200 + i * 30).duration(300)}>
                    <Card style={styles.expenseCard}>
                      <View style={[styles.expenseIcon, { backgroundColor: `${categoryColor}15` }]}>
                        <Ionicons name={categoryIcon as any} size={22} color={categoryColor} />
                      </View>
                      <View style={styles.expenseInfo}>
                        <Text style={styles.expenseDescription} numberOfLines={1}>
                          {expense.description}
                        </Text>
                        <Text style={styles.expenseCategory}>
                          {getCategoryLabel(expense.category)}
                          {expense.isRecurring && (
                            <Text style={{ color: colors.primary }}> • {t.finance.recurring}</Text>
                          )}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.expenseAmount}>
                          -{formatCurrency(expense.amount)}
                        </Text>
                        <Text style={styles.expenseDate}>
                          {new Date(expense.date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </Text>
                      </View>
                    </Card>
                  </Animated.View>
                );
              })}
            </Animated.View>
          </>
        ) : (
          /* QR Payment Section */
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <Card style={{ padding: spacing.lg }}>
              <View style={styles.qrSection}>
                <Ionicons name="qr-code" size={48} color={colors.primary} />
                <Text style={styles.qrTitle}>{t.payments.generateQR}</Text>
                <Text style={styles.qrSubtitle}>
                  Создайте QR-код для приёма оплаты по СБП
                </Text>

                <TextInput
                  style={[styles.qrInput, styles.qrAmountInput]}
                  placeholder="0 ₽"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={qrAmount}
                  onChangeText={setQrAmount}
                  keyboardType="numeric"
                />

                <TextInput
                  style={styles.qrInput}
                  placeholder="Описание платежа (необязательно)"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={qrDescription}
                  onChangeText={setQrDescription}
                />

                <Button
                  title={t.payments.generateQR}
                  onPress={handleGenerateQR}
                  style={{ width: '100%', marginTop: spacing.md }}
                />
              </View>
            </Card>
          </Animated.View>
        )}
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal
        visible={showAddExpense}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddExpense(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowAddExpense(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.finance.addExpense}</Text>
              <Pressable onPress={() => setShowAddExpense(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Category Selection */}
              <Text style={{ fontSize: typography.sizes.sm, color: colors.textSecondary, marginBottom: spacing.sm }}>
                {t.finance.expenseCategory}
              </Text>
              <View style={styles.categoryGrid}>
                {EXPENSE_CATEGORIES.slice(0, 9).map((cat) => (
                  <Pressable
                    key={cat}
                    style={[
                      styles.categoryItem,
                      { backgroundColor: `${getExpenseCategoryColor(cat)}10` },
                      newExpense.category === cat && styles.categoryItemSelected,
                    ]}
                    onPress={() => setNewExpense({ ...newExpense, category: cat })}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: `${getExpenseCategoryColor(cat)}20` }]}>
                      <Ionicons
                        name={getExpenseCategoryIcon(cat) as any}
                        size={18}
                        color={getExpenseCategoryColor(cat)}
                      />
                    </View>
                    <Text style={styles.categoryLabel}>{getCategoryLabel(cat)}</Text>
                  </Pressable>
                ))}
              </View>

              {/* Amount */}
              <TextInput
                style={styles.qrInput}
                placeholder="Сумма"
                placeholderTextColor={colors.inputPlaceholder}
                value={newExpense.amount}
                onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
                keyboardType="numeric"
              />

              {/* Description */}
              <TextInput
                style={styles.qrInput}
                placeholder="Описание"
                placeholderTextColor={colors.inputPlaceholder}
                value={newExpense.description}
                onChangeText={(text) => setNewExpense({ ...newExpense, description: text })}
              />

              {/* Recurring Toggle */}
              <View style={styles.recurringToggle}>
                <Text style={styles.recurringLabel}>{t.finance.recurring}</Text>
                <Pressable
                  style={[styles.toggleButton, newExpense.isRecurring && styles.toggleButtonActive]}
                  onPress={() => setNewExpense({ ...newExpense, isRecurring: !newExpense.isRecurring })}
                >
                  <View style={[styles.toggleKnob, newExpense.isRecurring && styles.toggleKnobActive]} />
                </Pressable>
              </View>

              <Button
                title={t.common.save}
                onPress={handleAddExpense}
                style={{ marginTop: spacing.lg }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* QR Payment Modal */}
      <Modal
        visible={showQRPayment}
        animationType="slide"
        transparent
        onRequestClose={() => setShowQRPayment(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowQRPayment(false)} />
          <View style={[styles.modalContent, { alignItems: 'center' }]}>
            <View style={[styles.modalHeader, { width: '100%' }]}>
              <Text style={styles.modalTitle}>{t.payments.sbpPayment}</Text>
              <Pressable onPress={() => setShowQRPayment(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            {qrPayment && (
              <>
                <Text style={[styles.summaryValue, { marginBottom: spacing.md }]}>
                  {formatCurrency(qrPayment.amount)}
                </Text>

                <View style={styles.qrPreview}>
                  {/* Simulated QR code pattern */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 160, height: 160 }}>
                    {Array.from({ length: 64 }).map((_, i) => (
                      <View
                        key={i}
                        style={{
                          width: 20,
                          height: 20,
                          backgroundColor: Math.random() > 0.5 ? colors.text : '#fff',
                        }}
                      />
                    ))}
                  </View>
                </View>

                <Text style={{ fontSize: typography.sizes.sm, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md }}>
                  {t.payments.scanToPay}
                </Text>

                {qrPayment.description && (
                  <Text style={{ fontSize: typography.sizes.sm, color: colors.text, marginBottom: spacing.lg }}>
                    {qrPayment.description}
                  </Text>
                )}

                <View style={{ flexDirection: 'row', gap: spacing.md, width: '100%' }}>
                  <Button
                    title={t.payments.sharePaymentLink}
                    variant="outline"
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      Alert.alert(t.common.success, 'Ссылка скопирована');
                    }}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title={t.common.done}
                    onPress={() => {
                      setShowQRPayment(false);
                      setQrPayment(null);
                      setQrAmount('');
                      setQrDescription('');
                    }}
                    style={{ flex: 1 }}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
