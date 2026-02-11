import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/localization';
import {
  getFinancialSummary,
  getSalesTrends,
  getCategoryPerformance,
  getStorePerformance,
  getConsolidatedReport,
} from '@/services/enterpriseService';

type ReportType = 'sales' | 'financial' | 'inventory' | 'consolidated';
type ExportFormat = 'pdf' | 'excel' | 'csv';
type ReportPeriod = 'week' | 'month' | 'quarter' | 'year';

interface ReportConfig {
  type: ReportType;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, typography, borderRadius, shadows, isDark } = useTheme();
  const { t, formatCurrency } = useLocalization();

  const [selectedReport, setSelectedReport] = useState<ReportType>('sales');
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('month');
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat | null>(null);

  const reportConfigs: ReportConfig[] = [
    {
      type: 'sales',
      title: t.reports.salesReport,
      description: 'Выручка, заказы, средний чек',
      icon: 'trending-up',
      color: colors.chart1,
    },
    {
      type: 'financial',
      title: t.reports.financialReport,
      description: 'Прибыль, расходы, маржа',
      icon: 'wallet',
      color: colors.chart2,
    },
    {
      type: 'inventory',
      title: t.reports.inventoryReport,
      description: 'Остатки, обороты, ABC-анализ',
      icon: 'cube',
      color: colors.chart3,
    },
    {
      type: 'consolidated',
      title: t.reports.consolidatedReport,
      description: 'Сводка по всем магазинам',
      icon: 'business',
      color: colors.chart4,
    },
  ];

  const periodOptions: { key: ReportPeriod; label: string }[] = [
    { key: 'week', label: t.reports.week },
    { key: 'month', label: t.reports.month },
    { key: 'quarter', label: t.reports.quarter },
    { key: 'year', label: t.reports.year },
  ];

  const generatePDFContent = () => {
    const financial = getFinancialSummary(selectedPeriod === 'week' ? 'month' : selectedPeriod as any);
    const trends = getSalesTrends(selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : selectedPeriod === 'quarter' ? 90 : 365);
    const categories = getCategoryPerformance();
    const stores = getStorePerformance();
    const consolidated = getConsolidatedReport();

    const today = new Date().toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const periodLabel = periodOptions.find(p => p.key === selectedPeriod)?.label || selectedPeriod;

    let content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Отчёт MaGGaz12</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1a1a1a; }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #2563eb; }
    .logo { font-size: 32px; font-weight: 700; color: #2563eb; }
    .subtitle { color: #666; margin-top: 8px; }
    .date { color: #999; font-size: 14px; margin-top: 4px; }
    h2 { font-size: 20px; color: #1a1a1a; margin: 30px 0 15px; padding-bottom: 8px; border-bottom: 1px solid #eee; }
    .metrics { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 30px; }
    .metric-card { flex: 1; min-width: 180px; background: #f8fafc; border-radius: 12px; padding: 20px; }
    .metric-value { font-size: 28px; font-weight: 700; color: #1a1a1a; }
    .metric-label { font-size: 14px; color: #666; margin-top: 4px; }
    .metric-change { font-size: 12px; margin-top: 4px; }
    .positive { color: #22c55e; }
    .negative { color: #ef4444; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f8fafc; font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; }
    td { font-size: 14px; }
    .text-right { text-align: right; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">📊 MaGGaz12</div>
    <div class="subtitle">${reportConfigs.find(r => r.type === selectedReport)?.title || 'Отчёт'}</div>
    <div class="date">Период: ${periodLabel} • Дата: ${today}</div>
  </div>
`;

    if (selectedReport === 'sales' || selectedReport === 'consolidated') {
      content += `
  <h2>💰 Ключевые показатели</h2>
  <div class="metrics">
    <div class="metric-card">
      <div class="metric-value">${financial.grossRevenue.toLocaleString('ru-RU')} ₽</div>
      <div class="metric-label">Выручка</div>
      <div class="metric-change positive">↑ ${financial.previousPeriod?.growth.toFixed(1)}% к прошлому периоду</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${trends.reduce((sum, t) => sum + t.orders, 0)}</div>
      <div class="metric-label">Количество заказов</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${Math.round(trends.reduce((sum, t) => sum + t.averageOrderValue, 0) / trends.length).toLocaleString('ru-RU')} ₽</div>
      <div class="metric-label">Средний чек</div>
    </div>
  </div>

  <h2>📈 Продажи по категориям</h2>
  <table>
    <thead>
      <tr>
        <th>Категория</th>
        <th class="text-right">Выручка</th>
        <th class="text-right">Прибыль</th>
        <th class="text-right">Маржа</th>
        <th class="text-right">Рост</th>
      </tr>
    </thead>
    <tbody>
      ${categories.map(c => `
      <tr>
        <td>${c.category}</td>
        <td class="text-right">${c.revenue.toLocaleString('ru-RU')} ₽</td>
        <td class="text-right">${c.profit.toLocaleString('ru-RU')} ₽</td>
        <td class="text-right">${c.margin.toFixed(1)}%</td>
        <td class="text-right ${c.growth >= 0 ? 'positive' : 'negative'}">${c.growth >= 0 ? '+' : ''}${c.growth.toFixed(1)}%</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
`;
    }

    if (selectedReport === 'financial' || selectedReport === 'consolidated') {
      content += `
  <h2>💵 Финансовые показатели</h2>
  <div class="metrics">
    <div class="metric-card">
      <div class="metric-value">${financial.grossProfit.toLocaleString('ru-RU')} ₽</div>
      <div class="metric-label">Валовая прибыль</div>
      <div class="metric-change">Маржа: ${financial.grossMargin.toFixed(1)}%</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${financial.netProfit.toLocaleString('ru-RU')} ₽</div>
      <div class="metric-label">Чистая прибыль</div>
      <div class="metric-change ${financial.netMargin >= 15 ? 'positive' : 'negative'}">Маржа: ${financial.netMargin.toFixed(1)}%</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">${financial.totalExpenses.toLocaleString('ru-RU')} ₽</div>
      <div class="metric-label">Общие расходы</div>
    </div>
  </div>

  <h2>📊 Структура расходов</h2>
  <table>
    <thead>
      <tr>
        <th>Категория</th>
        <th class="text-right">Сумма</th>
        <th class="text-right">Доля</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(financial.operatingExpenses)
        .filter(([_, value]) => value > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([key, value]) => `
      <tr>
        <td>${key === 'rent' ? 'Аренда' : key === 'salaries' ? 'Зарплаты' : key === 'utilities' ? 'Коммуналка' : key === 'taxes' ? 'Налоги' : key === 'marketing' ? 'Маркетинг' : key === 'equipment' ? 'Оборудование' : key === 'insurance' ? 'Страхование' : key}</td>
        <td class="text-right">${value.toLocaleString('ru-RU')} ₽</td>
        <td class="text-right">${((value / financial.totalExpenses) * 100).toFixed(1)}%</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
`;
    }

    if (selectedReport === 'consolidated') {
      content += `
  <h2>🏪 Показатели по магазинам</h2>
  <table>
    <thead>
      <tr>
        <th>Магазин</th>
        <th class="text-right">Выручка</th>
        <th class="text-right">Прибыль</th>
        <th class="text-right">Заказы</th>
        <th class="text-right">Рост</th>
      </tr>
    </thead>
    <tbody>
      ${stores.map(s => `
      <tr>
        <td>${s.storeName}</td>
        <td class="text-right">${s.revenue.toLocaleString('ru-RU')} ₽</td>
        <td class="text-right">${s.profit.toLocaleString('ru-RU')} ₽</td>
        <td class="text-right">${s.orders}</td>
        <td class="text-right ${s.growth >= 0 ? 'positive' : 'negative'}">${s.growth >= 0 ? '+' : ''}${s.growth.toFixed(1)}%</td>
      </tr>
      `).join('')}
      <tr style="font-weight: 700; background: #f8fafc;">
        <td>Итого</td>
        <td class="text-right">${consolidated.totalRevenue.toLocaleString('ru-RU')} ₽</td>
        <td class="text-right">${consolidated.totalProfit.toLocaleString('ru-RU')} ₽</td>
        <td class="text-right">${consolidated.totalOrders}</td>
        <td></td>
      </tr>
    </tbody>
  </table>
`;
    }

    content += `
  <div class="footer">
    <p>Сгенерировано в MaGGaz12 • ${today}</p>
    <p>© ${new Date().getFullYear()} MaGGaz12. Все права защищены.</p>
  </div>
</body>
</html>
`;

    return content;
  };

  const generateCSVContent = () => {
    const financial = getFinancialSummary(selectedPeriod === 'week' ? 'month' : selectedPeriod as any);
    const categories = getCategoryPerformance();
    const stores = getStorePerformance();

    let csv = 'Отчёт MaGGaz12\n';
    csv += `Дата:,${new Date().toLocaleDateString('ru-RU')}\n`;
    csv += `Период:,${periodOptions.find(p => p.key === selectedPeriod)?.label}\n\n`;

    if (selectedReport === 'sales' || selectedReport === 'consolidated') {
      csv += 'ПРОДАЖИ ПО КАТЕГОРИЯМ\n';
      csv += 'Категория,Выручка,Прибыль,Маржа %,Рост %\n';
      categories.forEach(c => {
        csv += `${c.category},${c.revenue},${c.profit},${c.margin.toFixed(1)},${c.growth.toFixed(1)}\n`;
      });
      csv += '\n';
    }

    if (selectedReport === 'financial' || selectedReport === 'consolidated') {
      csv += 'ФИНАНСОВЫЕ ПОКАЗАТЕЛИ\n';
      csv += 'Показатель,Значение\n';
      csv += `Выручка,${financial.grossRevenue}\n`;
      csv += `Себестоимость,${financial.costOfGoodsSold}\n`;
      csv += `Валовая прибыль,${financial.grossProfit}\n`;
      csv += `Расходы,${financial.totalExpenses}\n`;
      csv += `Чистая прибыль,${financial.netProfit}\n`;
      csv += `Маржа валовой прибыли %,${financial.grossMargin.toFixed(1)}\n`;
      csv += `Маржа чистой прибыли %,${financial.netMargin.toFixed(1)}\n`;
      csv += '\n';

      csv += 'СТРУКТУРА РАСХОДОВ\n';
      csv += 'Категория,Сумма\n';
      Object.entries(financial.operatingExpenses)
        .filter(([_, value]) => value > 0)
        .forEach(([key, value]) => {
          csv += `${key},${value}\n`;
        });
      csv += '\n';
    }

    if (selectedReport === 'consolidated') {
      csv += 'ПОКАЗАТЕЛИ ПО МАГАЗИНАМ\n';
      csv += 'Магазин,Выручка,Прибыль,Заказы,Рост %\n';
      stores.forEach(s => {
        csv += `${s.storeName},${s.revenue.toFixed(0)},${s.profit.toFixed(0)},${s.orders},${s.growth.toFixed(1)}\n`;
      });
    }

    return csv;
  };

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setExportFormat(format);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (format === 'pdf') {
        const htmlContent = generatePDFContent();
        const { uri } = await Print.printToFileAsync({
          html: htmlContent,
          base64: false,
        });

        const newUri = FileSystem.documentDirectory + `MaGGaz12_Report_${selectedReport}_${Date.now()}.pdf`;
        await FileSystem.moveAsync({ from: uri, to: newUri });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(newUri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Экспорт отчёта',
          });
        } else {
          Alert.alert(t.common.success, 'PDF сохранён: ' + newUri);
        }
      } else if (format === 'csv' || format === 'excel') {
        const csvContent = generateCSVContent();
        const extension = format === 'excel' ? 'xlsx' : 'csv';
        const mimeType = format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv';
        const fileName = `MaGGaz12_Report_${selectedReport}_${Date.now()}.${extension}`;
        const fileUri = FileSystem.documentDirectory + fileName;

        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType,
            dialogTitle: 'Экспорт отчёта',
          });
        } else {
          Alert.alert(t.common.success, `Файл сохранён: ${fileName}`);
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(t.common.error, 'Не удалось экспортировать отчёт');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
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
    scrollContent: {
      padding: spacing.md,
      paddingBottom: insets.bottom + spacing.xxl,
    },
    sectionTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md,
    },
    reportCards: {
      marginBottom: spacing.lg,
    },
    reportCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 2,
      borderColor: 'transparent',
      ...shadows.sm,
    },
    reportCardSelected: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}08`,
    },
    reportIcon: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    reportContent: {
      flex: 1,
    },
    reportTitle: {
      fontSize: typography.sizes.md,
      fontWeight: '700',
      color: colors.text,
    },
    reportDescription: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    checkIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    periodSelector: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.xs,
      marginBottom: spacing.lg,
    },
    periodOption: {
      flex: 1,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      borderRadius: borderRadius.md,
    },
    periodOptionActive: {
      backgroundColor: colors.primary,
    },
    periodText: {
      fontSize: typography.sizes.sm,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    periodTextActive: {
      color: '#fff',
    },
    exportSection: {
      marginBottom: spacing.lg,
    },
    exportButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    exportButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.lg,
      gap: spacing.sm,
      ...shadows.sm,
    },
    exportButtonPDF: {
      borderWidth: 2,
      borderColor: '#E53935',
    },
    exportButtonExcel: {
      borderWidth: 2,
      borderColor: '#43A047',
    },
    exportButtonCSV: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    exportButtonText: {
      fontSize: typography.sizes.md,
      fontWeight: '600',
    },
    previewCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      ...shadows.sm,
    },
    previewTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md,
    },
    previewMetrics: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    previewMetric: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      padding: spacing.md,
    },
    previewMetricValue: {
      fontSize: typography.sizes.xl,
      fontWeight: '700',
      color: colors.text,
    },
    previewMetricLabel: {
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingContent: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      alignItems: 'center',
      ...shadows.lg,
    },
    loadingText: {
      fontSize: typography.sizes.md,
      color: colors.text,
      marginTop: spacing.md,
    },
  });

  const financial = getFinancialSummary(selectedPeriod === 'week' ? 'month' : selectedPeriod as any);

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      <LinearGradient
        colors={isDark ? ['#1a1a2e', '#16213e'] : [colors.primary, '#1a68d1']}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>{t.reports.title}</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Report Type Selection */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={styles.sectionTitle}>{t.reports.selectReport}</Text>
          <View style={styles.reportCards}>
            {reportConfigs.map((report, index) => (
              <Pressable
                key={report.type}
                style={[
                  styles.reportCard,
                  selectedReport === report.type && styles.reportCardSelected,
                ]}
                onPress={() => {
                  setSelectedReport(report.type);
                  Haptics.selectionAsync();
                }}
              >
                <View style={[styles.reportIcon, { backgroundColor: `${report.color}15` }]}>
                  <Ionicons name={report.icon as any} size={24} color={report.color} />
                </View>
                <View style={styles.reportContent}>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  <Text style={styles.reportDescription}>{report.description}</Text>
                </View>
                {selectedReport === report.type && (
                  <View style={styles.checkIcon}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Period Selection */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={styles.sectionTitle}>{t.reports.selectPeriod}</Text>
          <View style={styles.periodSelector}>
            {periodOptions.map(option => (
              <Pressable
                key={option.key}
                style={[
                  styles.periodOption,
                  selectedPeriod === option.key && styles.periodOptionActive,
                ]}
                onPress={() => {
                  setSelectedPeriod(option.key);
                  Haptics.selectionAsync();
                }}
              >
                <Text style={[
                  styles.periodText,
                  selectedPeriod === option.key && styles.periodTextActive,
                ]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Export Buttons */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={styles.sectionTitle}>{t.reports.exportFormat}</Text>
          <View style={styles.exportSection}>
            <View style={styles.exportButtons}>
              <Pressable
                style={[styles.exportButton, styles.exportButtonPDF]}
                onPress={() => handleExport('pdf')}
                disabled={isExporting}
              >
                <Ionicons name="document-text" size={24} color="#E53935" />
                <Text style={[styles.exportButtonText, { color: '#E53935' }]}>PDF</Text>
              </Pressable>
              <Pressable
                style={[styles.exportButton, styles.exportButtonExcel]}
                onPress={() => handleExport('excel')}
                disabled={isExporting}
              >
                <Ionicons name="grid" size={24} color="#43A047" />
                <Text style={[styles.exportButtonText, { color: '#43A047' }]}>Excel</Text>
              </Pressable>
              <Pressable
                style={[styles.exportButton, styles.exportButtonCSV]}
                onPress={() => handleExport('csv')}
                disabled={isExporting}
              >
                <Ionicons name="code-slash" size={24} color={colors.primary} />
                <Text style={[styles.exportButtonText, { color: colors.primary }]}>CSV</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>

        {/* Preview */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Text style={styles.sectionTitle}>{t.reports.preview}</Text>
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>
              {reportConfigs.find(r => r.type === selectedReport)?.title}
            </Text>
            <View style={styles.previewMetrics}>
              <View style={styles.previewMetric}>
                <Text style={styles.previewMetricValue}>
                  {formatCurrency(financial.grossRevenue)}
                </Text>
                <Text style={styles.previewMetricLabel}>{t.executive.grossRevenue}</Text>
              </View>
              <View style={styles.previewMetric}>
                <Text style={[styles.previewMetricValue, { color: financial.netProfit >= 0 ? colors.success : colors.error }]}>
                  {formatCurrency(financial.netProfit)}
                </Text>
                <Text style={styles.previewMetricLabel}>{t.executive.netProfit}</Text>
              </View>
              <View style={styles.previewMetric}>
                <Text style={styles.previewMetricValue}>
                  {financial.grossMargin.toFixed(1)}%
                </Text>
                <Text style={styles.previewMetricLabel}>{t.executive.margin}</Text>
              </View>
              <View style={styles.previewMetric}>
                <Text style={[styles.previewMetricValue, { color: colors.success }]}>
                  +{financial.previousPeriod?.growth.toFixed(1)}%
                </Text>
                <Text style={styles.previewMetricLabel}>{t.executive.growth}</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Loading Overlay */}
      {isExporting && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              {exportFormat === 'pdf' ? 'Генерация PDF...' : 'Экспорт данных...'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
