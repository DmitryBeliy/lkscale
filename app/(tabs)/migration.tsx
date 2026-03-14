import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Card, Button } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { dataMigrationService } from '@/services/dataMigrationService';
import type { MigrationStats } from '@/services/dataMigrationService';
import { logger } from '@/lib/logger';

type MigrationStatus = 'idle' | 'running' | 'completed' | 'error';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

type EntityKey = 'manufacturers' | 'categories' | 'suppliers' | 'products' | 'locations' | 'outlets' | 'orders' | 'purchaseOrders' | 'purchaseOrderItems' | 'stockAdjustments' | 'activityLogs';

interface EntityConfig {
  key: EntityKey;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const ENTITIES: EntityConfig[] = [
  { key: 'manufacturers', name: 'Производители', icon: 'business', color: '#2c7be5' },
  { key: 'categories', name: 'Категории', icon: 'grid', color: '#00d97e' },
  { key: 'suppliers', name: 'Поставщики', icon: 'car', color: '#f6c343' },
  { key: 'products', name: 'Товары', icon: 'cube', color: '#e63757' },
  { key: 'locations', name: 'Локации', icon: 'location', color: '#39afd1' },
  { key: 'outlets', name: 'Торговые точки', icon: 'storefront', color: '#6f42c1' },
  { key: 'orders', name: 'Заказы', icon: 'receipt', color: '#2c7be5' },
  { key: 'purchaseOrders', name: 'Приходные накладные', icon: 'arrow-down-circle', color: '#00d97e' },
  { key: 'purchaseOrderItems', name: 'Товары в накладных', icon: 'list', color: '#f6c343' },
  { key: 'stockAdjustments', name: 'Корректировки остатков', icon: 'trending-down', color: '#e63757' },
  { key: 'activityLogs', name: 'Журнал активности', icon: 'time', color: '#39afd1' },
];

const JSON_FILE_COUNTS: Record<EntityKey, number> = {
  manufacturers: 64,
  categories: 13,
  suppliers: 18,
  products: 1102,
  locations: 9,
  outlets: 3,
  orders: 5173,
  purchaseOrders: 976,
  purchaseOrderItems: 1973,
  stockAdjustments: 246,
  activityLogs: 10192,
};

export default function MigrationScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const [status, setStatus] = useState<MigrationStatus>('idle');
  const [stats, setStats] = useState<MigrationStats>(dataMigrationService.getMigrationStatus());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentEntity, setCurrentEntity] = useState<string>('');
  const [report, setReport] = useState<string>('');
  const [showReport, setShowReport] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const logsScrollViewRef = useRef<ScrollView>(null);
  const logIdCounter = useRef(0);

  const addLog = useCallback((level: LogEntry['level'], message: string) => {
    const entry: LogEntry = {
      id: String(logIdCounter.current++),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
    };
    setLogs(prev => [...prev, entry]);
  }, []);

  useEffect(() => {
    const originalInfo = logger.info;
    const originalWarn = logger.warn;
    const originalError = logger.error;

    logger.info = (message: string, context?: Record<string, unknown>) => {
      originalInfo(message, context);
      addLog('info', message);
    };
    logger.warn = (message: string, context?: Record<string, unknown>) => {
      originalWarn(message, context);
      addLog('warn', message);
    };
    logger.error = (message: string, error?: Error | unknown, context?: Record<string, unknown>) => {
      originalError(message, error, context);
      addLog('error', `${message}${error ? `: ${error}` : ''}`);
    };

    return () => {
      logger.info = originalInfo;
      logger.warn = originalWarn;
      logger.error = originalError;
    };
  }, [addLog]);

  useEffect(() => {
    if (logsScrollViewRef.current) {
      logsScrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [logs]);

  const getTotalRecords = () => {
    return Object.values(JSON_FILE_COUNTS).reduce((sum, count) => sum + count, 0);
  };

  const getMigratedCount = () => {
    const keys: Array<keyof MigrationStats> = ['manufacturers', 'categories', 'suppliers', 'products', 'locations', 'outlets', 'orders', 'purchaseOrders', 'purchaseOrderItems', 'stockAdjustments', 'activityLogs'];
    return keys.reduce((sum, key) => {
      const s = stats[key];
      return sum + (s?.migrated || 0);
    }, 0);
  };

  const getProgress = () => {
    const total = getTotalRecords();
    const migrated = getMigratedCount();
    return total > 0 ? Math.round((migrated / total) * 100) : 0;
  };

  const getStatusText = () => {
    switch (status) {
      case 'idle': return 'Ожидание';
      case 'running': return 'Выполняется...';
      case 'completed': return 'Завершено';
      case 'error': return 'Ошибка';
      default: return 'Неизвестно';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'idle': return colors.textSecondary;
      case 'running': return colors.primary;
      case 'completed': return colors.success;
      case 'error': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const handleStartMigration = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Начать миграцию',
      'Это действие импортирует все данные из JSON файлов в Supabase. Продолжить?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Начать',
          onPress: async () => {
            setStatus('running');
            setLogs([]);
            addLog('info', 'Начало миграции данных...');

            try {
              await dataMigrationService.migrateAllData();
              const newStats = dataMigrationService.getMigrationStatus();
              setStats(newStats);
              setStatus('completed');
              addLog('info', 'Миграция успешно завершена!');
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              setStatus('error');
              addLog('error', `Ошибка миграции: ${error}`);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          },
        },
      ]
    );
  };

  const handleValidate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsValidating(true);
    setShowValidation(true);
    addLog('info', 'Запуск проверки данных...');

    try {
      const result = await dataMigrationService.validateMigration();
      setValidationResult(result);
      if (result.isValid) {
        addLog('info', 'Проверка завершена: ошибок не найдено');
      } else {
        addLog('warn', `Проверка завершена: найдено ${result.errors.length} ошибок, ${result.warnings.length} предупреждений`);
      }
    } catch (error) {
      addLog('error', `Ошибка проверки: ${error}`);
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Очистить данные',
      'Все импортированные данные будут удалены из Supabase. Это действие нельзя отменить. Продолжить?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            addLog('info', 'Очистка данных...');
            try {
              await dataMigrationService.clearMigrationData();
              setStats(dataMigrationService.getMigrationStatus());
              setStatus('idle');
              addLog('info', 'Данные успешно очищены');
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              addLog('error', `Ошибка очистки: ${error}`);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          },
        },
      ]
    );
  };

  const handleGenerateReport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const reportText = dataMigrationService.generateReport();
    setReport(reportText);
    setShowReport(true);
    addLog('info', 'Отчет сгенерирован');
  };

  const getEntityStatus = (entity: EntityConfig) => {
    const entityStats = stats[entity.key];
    if (!entityStats) return 'pending';
    if (entityStats.errors > 0) return 'error';
    if (entityStats.migrated >= entityStats.total && entityStats.total > 0) return 'completed';
    if (entityStats.migrated > 0) return 'partial';
    return 'pending';
  };

  const getEntityStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'partial': return 'time';
      case 'error': return 'alert-circle';
      default: return 'ellipse-outline';
    }
  };

  const getEntityStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'partial': return colors.warning;
      case 'error': return colors.error;
      default: return colors.textLight;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { padding: spacing.md, paddingBottom: spacing.xxl }]}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text, fontSize: typography.sizes.xxl }]}>
              Миграция данных
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
              Импорт данных из старой системы
            </Text>
          </View>
          <Pressable
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        </Animated.View>

        {/* Status Cards */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <View style={[styles.statsRow, { marginBottom: spacing.md }]}>
            <Card style={[styles.statCard, { flex: 1, marginRight: spacing.sm }]}>
              <View style={[styles.statIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name="layers" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text, fontSize: typography.sizes.xl }]}>
                {getTotalRecords().toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                Всего записей
              </Text>
            </Card>

            <Card style={[styles.statCard, { flex: 1, marginHorizontal: spacing.sm }]}>
              <View style={[styles.statIconContainer, { backgroundColor: `${colors.success}15` }]}>
                <Ionicons name="trending-up" size={24} color={colors.success} />
              </View>
              <Text style={[styles.statValue, { color: colors.text, fontSize: typography.sizes.xl }]}>
                {getProgress()}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                Прогресс
              </Text>
            </Card>

            <Card style={[styles.statCard, { flex: 1, marginLeft: spacing.sm }]}>
              <View style={[styles.statIconContainer, { backgroundColor: `${getStatusColor()}15` }]}>
                <Ionicons
                  name={status === 'running' ? 'sync' : status === 'completed' ? 'checkmark-done' : status === 'error' ? 'alert-circle' : 'time'}
                  size={24}
                  color={getStatusColor()}
                />
              </View>
              <Text style={[styles.statValue, { color: getStatusColor(), fontSize: typography.sizes.lg }]}>
                {getStatusText()}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                Статус
              </Text>
            </Card>
          </View>
        </Animated.View>

        {/* Progress Section (visible during migration) */}
        {status === 'running' && (
          <Animated.View entering={FadeIn.duration(300)}>
            <Card style={[styles.progressCard, { marginBottom: spacing.md }]}>
              <Text style={[styles.progressTitle, { color: colors.text, fontSize: typography.sizes.md }]}>
                Выполняется миграция...
              </Text>
              <View style={[styles.progressBarContainer, { backgroundColor: colors.borderLight, borderRadius: borderRadius.sm }]}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${getProgress()}%`,
                      backgroundColor: colors.primary,
                      borderRadius: borderRadius.sm,
                    },
                  ]}
                />
              </View>
              <View style={styles.progressInfo}>
                <Text style={[styles.progressText, { color: colors.textSecondary, fontSize: typography.sizes.sm }]}>
                  Обработано: {getMigratedCount().toLocaleString()} / {getTotalRecords().toLocaleString()}
                </Text>
                {currentEntity && (
                  <Text style={[styles.progressEntity, { color: colors.primary, fontSize: typography.sizes.sm }]}>
                    Текущая сущность: {currentEntity}
                  </Text>
                )}
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Entity List */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.sizes.md, marginBottom: spacing.sm }]}>
            Сущности для миграции
          </Text>
          <Card style={[styles.entitiesCard, { marginBottom: spacing.md }]}>
            {ENTITIES.map((entity, index) => {
              const entityStatus = getEntityStatus(entity);
              const entityStats = stats[entity.key];
              const totalCount = JSON_FILE_COUNTS[entity.key] || 0;

              return (
                <View
                  key={entity.key}
                  style={[
                    styles.entityItem,
                    index < ENTITIES.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
                  ]}
                >
                  <View style={[styles.entityIconContainer, { backgroundColor: `${entity.color}15` }]}>
                    <Ionicons name={entity.icon} size={20} color={entity.color} />
                  </View>
                  <View style={styles.entityInfo}>
                    <Text style={[styles.entityName, { color: colors.text, fontSize: typography.sizes.md }]}>
                      {entity.name}
                    </Text>
                    <Text style={[styles.entityCount, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                      {totalCount.toLocaleString()} записей
                    </Text>
                  </View>
                  <View style={styles.entityStatus}>
                    {entityStats && entityStats.migrated > 0 && (
                      <Text style={[styles.entityMigratedCount, { color: colors.textSecondary, fontSize: typography.sizes.xs }]}>
                        {entityStats.migrated}
                      </Text>
                    )}
                    <Ionicons
                      name={getEntityStatusIcon(entityStatus)}
                      size={24}
                      color={getEntityStatusColor(entityStatus)}
                    />
                  </View>
                </View>
              );
            })}
          </Card>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.sizes.md, marginBottom: spacing.sm }]}>
            Действия
          </Text>
          <View style={[styles.actionsContainer, { marginBottom: spacing.md }]}>
            <Button
              title={status === 'running' ? 'Выполняется...' : 'Начать миграцию'}
              onPress={handleStartMigration}
              loading={status === 'running'}
              disabled={status === 'running'}
              style={{ marginBottom: spacing.sm }}
              icon={<Ionicons name="play" size={20} color="#fff" />}
            />
            <View style={[styles.actionRow, { gap: spacing.sm }]}>
              <Button
                title="Проверить"
                variant="outline"
                onPress={handleValidate}
                loading={isValidating}
                style={{ flex: 1 }}
                icon={<Ionicons name="shield-checkmark" size={18} color={colors.primary} />}
              />
              <Button
                title="Очистить"
                variant="outline"
                onPress={handleClearData}
                style={{ flex: 1, borderColor: colors.error }}
                textStyle={{ color: colors.error }}
                icon={<Ionicons name="trash" size={18} color={colors.error} />}
              />
            </View>
            <Button
              title="Сгенерировать отчет"
              variant="secondary"
              onPress={handleGenerateReport}
              icon={<Ionicons name="document-text" size={20} color={colors.text} />}
            />
          </View>
        </Animated.View>

        {/* Log Console */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.sizes.md, marginBottom: spacing.sm }]}>
            Журнал миграции
          </Text>
          <Card style={styles.logsCard}>
            <ScrollView
              ref={logsScrollViewRef}
              style={[styles.logsScrollView, { maxHeight: 300 }]}
              showsVerticalScrollIndicator={true}
            >
              {logs.length === 0 ? (
                <Text style={[styles.emptyLogs, { color: colors.textLight, fontSize: typography.sizes.sm }]}>
                  Журнал пуст. Начните миграцию для просмотра логов.
                </Text>
              ) : (
                logs.map((log) => (
                  <View key={log.id} style={styles.logEntry}>
                    <Text style={[styles.logTimestamp, { color: colors.textLight, fontSize: typography.sizes.xs }]}>
                      {log.timestamp}
                    </Text>
                    <Text
                      style={[
                        styles.logMessage,
                        {
                          color: log.level === 'error' ? colors.error : log.level === 'warn' ? colors.warning : colors.text,
                          fontSize: typography.sizes.sm,
                        },
                      ]}
                    >
                      [{log.level.toUpperCase()}] {log.message}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Report Modal */}
      <Modal
        visible={showReport}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReport(false)}
      >
        <Pressable
          style={[styles.modalOverlay, { padding: spacing.lg }]}
          onPress={() => setShowReport(false)}
        >
          <Pressable
            style={[
              styles.reportModal,
              {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                ...shadows.lg,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.reportHeader}>
              <Text style={[styles.reportTitle, { color: colors.text, fontSize: typography.sizes.lg }]}>
                Отчет о миграции
              </Text>
              <Pressable onPress={() => setShowReport(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView style={styles.reportContent}>
              <Text style={[styles.reportText, { color: colors.text, fontSize: typography.sizes.sm, fontFamily: 'monospace' }]}>
                {report}
              </Text>
            </ScrollView>
            <Button
              title="Закрыть"
              onPress={() => setShowReport(false)}
              style={{ marginTop: spacing.md }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Validation Modal */}
      <Modal
        visible={showValidation}
        transparent
        animationType="fade"
        onRequestClose={() => setShowValidation(false)}
      >
        <Pressable
          style={[styles.modalOverlay, { padding: spacing.lg }]}
          onPress={() => setShowValidation(false)}
        >
          <Pressable
            style={[
              styles.validationModal,
              {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.xl,
                padding: spacing.lg,
                ...shadows.lg,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.validationHeader}>
              <Text style={[styles.validationTitle, { color: colors.text, fontSize: typography.sizes.lg }]}>
                Результат проверки
              </Text>
              <Pressable onPress={() => setShowValidation(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            {isValidating ? (
              <View style={styles.validationLoading}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.validationLoadingText, { color: colors.textSecondary, marginTop: spacing.md }]}>
                  Проверка данных...
                </Text>
              </View>
            ) : validationResult ? (
              <ScrollView style={styles.validationContent}>
                <View style={[styles.validationStatus, { backgroundColor: validationResult.isValid ? `${colors.success}15` : `${colors.warning}15`, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.md }]}>
                  <Ionicons
                    name={validationResult.isValid ? 'checkmark-circle' : 'warning'}
                    size={32}
                    color={validationResult.isValid ? colors.success : colors.warning}
                  />
                  <Text style={[styles.validationStatusText, { color: validationResult.isValid ? colors.success : colors.warning, fontSize: typography.sizes.md, marginLeft: spacing.sm }]}>
                    {validationResult.isValid ? 'Проверка пройдена' : 'Найдены проблемы'}
                  </Text>
                </View>

                {validationResult.errors.length > 0 && (
                  <View style={styles.validationSection}>
                    <Text style={[styles.validationSectionTitle, { color: colors.error, fontSize: typography.sizes.md, marginBottom: spacing.sm }]}>
                      Ошибки ({validationResult.errors.length})
                    </Text>
                    {validationResult.errors.map((error, index) => (
                      <View key={index} style={[styles.validationItem, { backgroundColor: `${colors.error}10`, borderRadius: borderRadius.sm, padding: spacing.sm, marginBottom: spacing.xs }]}>
                        <Ionicons name="alert-circle" size={16} color={colors.error} />
                        <Text style={[styles.validationItemText, { color: colors.text, fontSize: typography.sizes.sm, marginLeft: spacing.xs }]}>
                          {error}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {validationResult.warnings.length > 0 && (
                  <View style={styles.validationSection}>
                    <Text style={[styles.validationSectionTitle, { color: colors.warning, fontSize: typography.sizes.md, marginBottom: spacing.sm, marginTop: spacing.md }]}>
                      Предупреждения ({validationResult.warnings.length})
                    </Text>
                    {validationResult.warnings.map((warning, index) => (
                      <View key={index} style={[styles.validationItem, { backgroundColor: `${colors.warning}10`, borderRadius: borderRadius.sm, padding: spacing.sm, marginBottom: spacing.xs }]}>
                        <Ionicons name="warning" size={16} color={colors.warning} />
                        <Text style={[styles.validationItemText, { color: colors.text, fontSize: typography.sizes.sm, marginLeft: spacing.xs }]}>
                          {warning}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
            ) : null}

            <Button
              title="Закрыть"
              onPress={() => setShowValidation(false)}
              style={{ marginTop: spacing.md }}
            />
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
  scrollContent: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
  },
  statCard: {
    alignItems: 'center',
    padding: 16,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    textAlign: 'center',
  },
  progressCard: {
    padding: 16,
  },
  progressTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  progressInfo: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {},
  progressEntity: {
    fontWeight: '500',
  },
  sectionTitle: {
    fontWeight: '600',
  },
  entitiesCard: {
    paddingVertical: 4,
  },
  entityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  entityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  entityInfo: {
    flex: 1,
  },
  entityName: {
    fontWeight: '500',
  },
  entityCount: {
    marginTop: 2,
  },
  entityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entityMigratedCount: {
    marginRight: 8,
  },
  actionsContainer: {},
  actionRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  logsCard: {
    padding: 12,
  },
  logsScrollView: {},
  emptyLogs: {
    textAlign: 'center',
    paddingVertical: 32,
  },
  logEntry: {
    marginBottom: 8,
    paddingVertical: 4,
  },
  logTimestamp: {
    marginBottom: 2,
  },
  logMessage: {
    fontWeight: '400',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportModal: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  reportTitle: {
    fontWeight: '700',
  },
  reportContent: {
    maxHeight: 400,
  },
  reportText: {
    lineHeight: 20,
  },
  validationModal: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  validationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  validationTitle: {
    fontWeight: '700',
  },
  validationLoading: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  validationLoadingText: {},
  validationContent: {
    maxHeight: 400,
  },
  validationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  validationStatusText: {
    fontWeight: '600',
  },
  validationSection: {},
  validationSectionTitle: {
    fontWeight: '600',
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  validationItemText: {
    flex: 1,
  },
});
