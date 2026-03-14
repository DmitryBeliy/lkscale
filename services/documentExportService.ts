import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { Order, Product, InvoiceData, StockReport, StockReportItem, StoreSettings } from '@/types';
import { getStoreSettingsState, calculateTax } from './storeSettingsService';
import { logger } from '@/lib/logger';

// Generate Invoice Data from Order
export const generateInvoiceData = (
  order: Order,
  storeSettings?: StoreSettings | null
): InvoiceData => {
  const settings = storeSettings || getStoreSettingsState().settings;
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { taxAmount, totalWithTax } = calculateTax(subtotal, settings);

  return {
    orderNumber: order.orderNumber,
    date: order.createdAt,
    customer: {
      name: order.customer?.name || 'Клиент',
      phone: order.customer?.phone,
      address: order.customer?.address,
    },
    items: order.items.map((item) => ({
      name: item.productName,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
    })),
    subtotal,
    taxAmount,
    taxRate: settings?.taxRate || 0,
    total: totalWithTax,
    paymentMethod: getPaymentMethodLabel(order.paymentMethod),
    businessInfo: {
      name: settings?.businessName || 'Магазин',
      address: settings?.address,
      phone: settings?.phone,
      email: settings?.email,
    },
    notes: order.notes,
  };
};

// Payment method labels
const getPaymentMethodLabel = (method?: string): string => {
  switch (method) {
    case 'cash':
      return 'Наличные';
    case 'card':
      return 'Банковская карта';
    case 'transfer':
      return 'Банковский перевод';
    case 'online':
      return 'Онлайн-оплата';
    default:
      return 'Не указан';
  }
};

// Generate Invoice Text
export const generateInvoiceText = (invoice: InvoiceData): string => {
  const settings = getStoreSettingsState().settings;
  const currencySymbol = settings?.currencySymbol || '₽';
  const taxName = settings?.taxName || 'НДС';

  const lines: string[] = [];

  // Header
  lines.push('═'.repeat(50));
  lines.push(`          ${invoice.businessInfo.name.toUpperCase()}`);
  lines.push('═'.repeat(50));
  lines.push('');

  // Invoice Info
  lines.push(`Счёт №: ${invoice.orderNumber}`);
  lines.push(`Дата: ${new Date(invoice.date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}`);
  lines.push('');

  // Customer Info
  lines.push('─'.repeat(50));
  lines.push('ПОКУПАТЕЛЬ:');
  lines.push(`  Имя: ${invoice.customer.name}`);
  if (invoice.customer.phone) lines.push(`  Телефон: ${invoice.customer.phone}`);
  if (invoice.customer.address) lines.push(`  Адрес: ${invoice.customer.address}`);
  lines.push('');

  // Items
  lines.push('─'.repeat(50));
  lines.push('ТОВАРЫ:');
  lines.push('');
  lines.push(formatTableRow('Наименование', 'Кол-во', 'Цена', 'Сумма'));
  lines.push('─'.repeat(50));

  invoice.items.forEach((item) => {
    const name = item.name.length > 20 ? item.name.substring(0, 17) + '...' : item.name;
    lines.push(formatTableRow(
      name,
      String(item.quantity),
      formatAmount(item.price, currencySymbol),
      formatAmount(item.total, currencySymbol)
    ));
  });

  lines.push('─'.repeat(50));
  lines.push('');

  // Totals
  lines.push(formatTotalRow('Подитог:', formatAmount(invoice.subtotal, currencySymbol)));
  if (invoice.taxRate > 0) {
    lines.push(formatTotalRow(`${taxName} (${invoice.taxRate}%):`, formatAmount(invoice.taxAmount, currencySymbol)));
  }
  lines.push('═'.repeat(50));
  lines.push(formatTotalRow('ИТОГО:', formatAmount(invoice.total, currencySymbol)));
  lines.push('═'.repeat(50));
  lines.push('');

  // Payment
  lines.push(`Способ оплаты: ${invoice.paymentMethod}`);
  lines.push('');

  // Notes
  if (invoice.notes) {
    lines.push('─'.repeat(50));
    lines.push('ПРИМЕЧАНИЕ:');
    lines.push(invoice.notes);
    lines.push('');
  }

  // Business Footer
  lines.push('─'.repeat(50));
  if (invoice.businessInfo.address) lines.push(`Адрес: ${invoice.businessInfo.address}`);
  if (invoice.businessInfo.phone) lines.push(`Телефон: ${invoice.businessInfo.phone}`);
  if (invoice.businessInfo.email) lines.push(`Email: ${invoice.businessInfo.email}`);
  lines.push('');
  lines.push('           Спасибо за покупку!');
  lines.push('═'.repeat(50));

  return lines.join('\n');
};

// Format helpers
const formatTableRow = (col1: string, col2: string, col3: string, col4: string): string => {
  return `${col1.padEnd(22)} ${col2.padStart(4)} ${col3.padStart(10)} ${col4.padStart(10)}`;
};

const formatTotalRow = (label: string, value: string): string => {
  return `${label.padEnd(38)} ${value.padStart(10)}`;
};

const formatAmount = (amount: number, symbol: string): string => {
  return `${amount.toLocaleString('ru-RU')} ${symbol}`;
};

// Generate Stock Report
export const generateStockReport = (products: Product[]): StockReport => {
  const items: StockReportItem[] = products.map((product) => {
    const costValue = product.costPrice * product.stock;
    const retailValue = product.price * product.stock;
    let status: 'ok' | 'low' | 'out' = 'ok';

    if (product.stock === 0) {
      status = 'out';
    } else if (product.stock <= product.minStock) {
      status = 'low';
    }

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      stock: product.stock,
      minStock: product.minStock,
      costPrice: product.costPrice,
      retailPrice: product.price,
      costValue,
      retailValue,
      status,
    };
  });

  const totalCostValue = items.reduce((sum, item) => sum + item.costValue, 0);
  const totalRetailValue = items.reduce((sum, item) => sum + item.retailValue, 0);
  const lowStockItems = items.filter((item) => item.status === 'low').length;
  const outOfStockItems = items.filter((item) => item.status === 'out').length;

  return {
    generatedAt: new Date().toISOString(),
    totalItems: products.length,
    totalCostValue,
    totalRetailValue,
    potentialProfit: totalRetailValue - totalCostValue,
    lowStockItems,
    outOfStockItems,
    items: items.sort((a, b) => {
      // Sort by status priority (out > low > ok), then by name
      const statusOrder = { out: 0, low: 1, ok: 2 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return a.name.localeCompare(b.name, 'ru');
    }),
  };
};

// Generate Stock Report Text
export const generateStockReportText = (report: StockReport): string => {
  const settings = getStoreSettingsState().settings;
  const currencySymbol = settings?.currencySymbol || '₽';
  const businessName = settings?.businessName || 'Магазин';

  const lines: string[] = [];

  // Header
  lines.push('═'.repeat(70));
  lines.push(`          ОТЧЁТ ПО СКЛАДСКИМ ОСТАТКАМ - ${businessName.toUpperCase()}`);
  lines.push('═'.repeat(70));
  lines.push('');

  // Report Info
  lines.push(`Дата формирования: ${new Date(report.generatedAt).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}`);
  lines.push('');

  // Summary
  lines.push('─'.repeat(70));
  lines.push('СВОДКА:');
  lines.push('');
  lines.push(`  Всего наименований:      ${report.totalItems}`);
  lines.push(`  Товары с низким остатком: ${report.lowStockItems}`);
  lines.push(`  Нет в наличии:           ${report.outOfStockItems}`);
  lines.push('');
  lines.push(`  Себестоимость остатков:  ${report.totalCostValue.toLocaleString('ru-RU')} ${currencySymbol}`);
  lines.push(`  Розничная стоимость:     ${report.totalRetailValue.toLocaleString('ru-RU')} ${currencySymbol}`);
  lines.push(`  Потенциальная прибыль:   ${report.potentialProfit.toLocaleString('ru-RU')} ${currencySymbol}`);
  lines.push('');

  // Items table header
  lines.push('─'.repeat(70));
  lines.push('ТОВАРЫ:');
  lines.push('');
  lines.push(formatStockTableHeader());
  lines.push('─'.repeat(70));

  // Group by status
  const statusGroups = [
    { status: 'out' as const, label: '🔴 НЕТ В НАЛИЧИИ' },
    { status: 'low' as const, label: '🟡 НИЗКИЙ ОСТАТОК' },
    { status: 'ok' as const, label: '🟢 В НАЛИЧИИ' },
  ];

  statusGroups.forEach((group) => {
    const groupItems = report.items.filter((item) => item.status === group.status);
    if (groupItems.length === 0) return;

    lines.push('');
    lines.push(`  ${group.label} (${groupItems.length})`);
    lines.push('');

    groupItems.forEach((item) => {
      lines.push(formatStockTableRow(item, currencySymbol));
    });
  });

  lines.push('');
  lines.push('═'.repeat(70));
  lines.push('           Отчёт сформирован автоматически');
  lines.push('═'.repeat(70));

  return lines.join('\n');
};

const formatStockTableHeader = (): string => {
  return `${'Наименование'.padEnd(25)} ${'Арт.'.padEnd(12)} ${'Остаток'.padStart(8)} ${'Мин.'.padStart(6)} ${'Себест.'.padStart(10)} ${'Розница'.padStart(10)}`;
};

const formatStockTableRow = (item: StockReportItem, symbol: string): string => {
  const name = item.name.length > 24 ? item.name.substring(0, 21) + '...' : item.name;
  const sku = item.sku.length > 11 ? item.sku.substring(0, 8) + '...' : item.sku;

  return `  ${name.padEnd(23)} ${sku.padEnd(12)} ${String(item.stock).padStart(8)} ${String(item.minStock).padStart(6)} ${item.costPrice.toLocaleString('ru-RU').padStart(9)}${symbol} ${item.retailPrice.toLocaleString('ru-RU').padStart(9)}${symbol}`;
};

// Share Invoice
export const shareInvoice = async (order: Order): Promise<boolean> => {
  try {
    const invoiceData = generateInvoiceData(order);
    const invoiceText = generateInvoiceText(invoiceData);

    const fileName = `invoice_${order.orderNumber.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    const file = new File(Paths.cache, fileName);

    await file.write(invoiceText);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/plain',
        dialogTitle: `Счёт ${order.orderNumber}`,
      });
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Error sharing invoice:', error);
    return false;
  }
};

// Share Stock Report
export const shareStockReport = async (products: Product[]): Promise<boolean> => {
  try {
    const report = generateStockReport(products);
    const reportText = generateStockReportText(report);

    const fileName = `stock_report_${new Date().toISOString().split('T')[0]}.txt`;
    const file = new File(Paths.cache, fileName);

    await file.write(reportText);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/plain',
        dialogTitle: 'Отчёт по складским остаткам',
      });
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Error sharing stock report:', error);
    return false;
  }
};

// Get Invoice Summary for Clipboard
export const getInvoiceSummary = (order: Order): string => {
  const settings = getStoreSettingsState().settings;
  const currencySymbol = settings?.currencySymbol || '₽';
  const invoiceData = generateInvoiceData(order, settings);

  const lines: string[] = [
    `📄 Счёт ${invoiceData.orderNumber}`,
    `📅 ${new Date(invoiceData.date).toLocaleDateString('ru-RU')}`,
    `👤 ${invoiceData.customer.name}`,
    '',
    'Товары:',
    ...invoiceData.items.map((item) => `• ${item.name} x${item.quantity} = ${item.total.toLocaleString('ru-RU')} ${currencySymbol}`),
    '',
    `💰 Итого: ${invoiceData.total.toLocaleString('ru-RU')} ${currencySymbol}`,
  ];

  if (invoiceData.taxRate > 0) {
    lines.splice(-1, 0, `📊 ${settings?.taxName || 'НДС'} (${invoiceData.taxRate}%): ${invoiceData.taxAmount.toLocaleString('ru-RU')} ${currencySymbol}`);
  }

  return lines.join('\n');
};

// Get Stock Report Summary for Clipboard
export const getStockReportSummary = (products: Product[]): string => {
  const settings = getStoreSettingsState().settings;
  const currencySymbol = settings?.currencySymbol || '₽';
  const report = generateStockReport(products);

  const lines: string[] = [
    '📦 Отчёт по складским остаткам',
    `📅 ${new Date(report.generatedAt).toLocaleDateString('ru-RU')}`,
    '',
    `📊 Всего товаров: ${report.totalItems}`,
    `⚠️ Низкий остаток: ${report.lowStockItems}`,
    `❌ Нет в наличии: ${report.outOfStockItems}`,
    '',
    `💵 Себестоимость: ${report.totalCostValue.toLocaleString('ru-RU')} ${currencySymbol}`,
    `💰 Розничная: ${report.totalRetailValue.toLocaleString('ru-RU')} ${currencySymbol}`,
    `📈 Потенц. прибыль: ${report.potentialProfit.toLocaleString('ru-RU')} ${currencySymbol}`,
  ];

  return lines.join('\n');
};
