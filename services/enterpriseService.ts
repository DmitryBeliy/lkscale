// Enterprise Service - Multi-store, Finance, Reporting
import {
  Store,
  Expense,
  ExpenseCategory,
  ExpenseBudget,
  FinancialSummary,
  ExpenseBreakdown,
  ConsolidatedReport,
  StorePerformance,
  StockTransfer,
  StockTransferItem,
  QRPayment,
  TelegramConfig,
  CategoryPerformance,
  SalesTrend,
  ProfitMarginData,
} from '@/types/enterprise';
import { getDataState } from '@/store/dataStore';
import { lightColors } from '@/constants/theme';

// ============== MOCK DATA FOR STORES ==============

export const mockStores: Store[] = [
  {
    id: 'store-main',
    ownerId: 'user-1',
    name: 'Главный магазин',
    code: 'MAIN',
    address: 'г. Москва, ул. Ленина, д. 1',
    phone: '+7 (495) 111-22-33',
    email: 'main@maggaz12.ru',
    managerName: 'Иван Петров',
    isMain: true,
    isActive: true,
    timezone: 'Europe/Moscow',
    currency: 'RUB',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-02-01T00:00:00Z',
  },
  {
    id: 'store-west',
    ownerId: 'user-1',
    name: 'Магазин Запад',
    code: 'WEST',
    address: 'г. Москва, ул. Садовая, д. 50',
    phone: '+7 (495) 222-33-44',
    email: 'west@maggaz12.ru',
    managerName: 'Анна Сидорова',
    isMain: false,
    isActive: true,
    timezone: 'Europe/Moscow',
    currency: 'RUB',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2025-02-01T00:00:00Z',
  },
  {
    id: 'store-south',
    ownerId: 'user-1',
    name: 'Магазин Юг',
    code: 'SOUTH',
    address: 'г. Краснодар, ул. Красная, д. 77',
    phone: '+7 (861) 333-44-55',
    email: 'south@maggaz12.ru',
    managerName: 'Елена Морозова',
    isMain: false,
    isActive: true,
    timezone: 'Europe/Moscow',
    currency: 'RUB',
    createdAt: '2024-09-01T00:00:00Z',
    updatedAt: '2025-02-01T00:00:00Z',
  },
];

// ============== MOCK EXPENSES ==============

export const mockExpenses: Expense[] = [
  { id: 'exp-1', ownerId: 'user-1', storeId: 'store-main', category: 'rent', amount: 150000, description: 'Аренда помещения за февраль', date: '2025-02-01', isRecurring: true, recurringFrequency: 'monthly', createdAt: '2025-02-01T10:00:00Z', updatedAt: '2025-02-01T10:00:00Z' },
  { id: 'exp-2', ownerId: 'user-1', storeId: 'store-main', category: 'salaries', amount: 450000, description: 'Зарплата сотрудников', date: '2025-02-05', isRecurring: true, recurringFrequency: 'monthly', createdAt: '2025-02-05T10:00:00Z', updatedAt: '2025-02-05T10:00:00Z' },
  { id: 'exp-3', ownerId: 'user-1', storeId: 'store-main', category: 'utilities', amount: 25000, description: 'Коммунальные услуги', date: '2025-02-03', isRecurring: true, recurringFrequency: 'monthly', createdAt: '2025-02-03T10:00:00Z', updatedAt: '2025-02-03T10:00:00Z' },
  { id: 'exp-4', ownerId: 'user-1', storeId: 'store-main', category: 'marketing', amount: 50000, description: 'Рекламная кампания', date: '2025-02-10', isRecurring: false, createdAt: '2025-02-10T10:00:00Z', updatedAt: '2025-02-10T10:00:00Z' },
  { id: 'exp-5', ownerId: 'user-1', storeId: 'store-west', category: 'rent', amount: 120000, description: 'Аренда филиала', date: '2025-02-01', isRecurring: true, recurringFrequency: 'monthly', createdAt: '2025-02-01T10:00:00Z', updatedAt: '2025-02-01T10:00:00Z' },
  { id: 'exp-6', ownerId: 'user-1', storeId: 'store-west', category: 'salaries', amount: 280000, description: 'Зарплата сотрудников филиала', date: '2025-02-05', isRecurring: true, recurringFrequency: 'monthly', createdAt: '2025-02-05T10:00:00Z', updatedAt: '2025-02-05T10:00:00Z' },
  { id: 'exp-7', ownerId: 'user-1', category: 'taxes', amount: 185000, description: 'Квартальные налоги', date: '2025-01-25', isRecurring: true, recurringFrequency: 'quarterly', createdAt: '2025-01-25T10:00:00Z', updatedAt: '2025-01-25T10:00:00Z' },
  { id: 'exp-8', ownerId: 'user-1', storeId: 'store-main', category: 'equipment', amount: 75000, description: 'Новое оборудование для кассы', date: '2025-02-08', isRecurring: false, createdAt: '2025-02-08T10:00:00Z', updatedAt: '2025-02-08T10:00:00Z' },
  { id: 'exp-9', ownerId: 'user-1', category: 'insurance', amount: 45000, description: 'Страхование имущества', date: '2025-01-15', isRecurring: true, recurringFrequency: 'yearly', createdAt: '2025-01-15T10:00:00Z', updatedAt: '2025-01-15T10:00:00Z' },
  { id: 'exp-10', ownerId: 'user-1', storeId: 'store-south', category: 'rent', amount: 95000, description: 'Аренда южного филиала', date: '2025-02-01', isRecurring: true, recurringFrequency: 'monthly', createdAt: '2025-02-01T10:00:00Z', updatedAt: '2025-02-01T10:00:00Z' },
];

// ============== FINANCIAL CALCULATIONS ==============

export const calculateExpenseBreakdown = (expenses: Expense[]): ExpenseBreakdown => {
  const breakdown: ExpenseBreakdown = {
    rent: 0,
    salaries: 0,
    utilities: 0,
    taxes: 0,
    inventory: 0,
    marketing: 0,
    equipment: 0,
    supplies: 0,
    insurance: 0,
    maintenance: 0,
    delivery: 0,
    banking: 0,
    other: 0,
  };

  expenses.forEach(exp => {
    breakdown[exp.category] += exp.amount;
  });

  return breakdown;
};

export const getFinancialSummary = (period: 'month' | 'quarter' | 'year' = 'month'): FinancialSummary => {
  const { orders, products } = getDataState();

  // Calculate period dates
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'quarter':
      startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // Filter orders within period
  const periodOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return orderDate >= startDate && orderDate <= now && o.status === 'completed';
  });

  // Calculate revenue
  const grossRevenue = periodOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Calculate cost of goods sold
  let costOfGoodsSold = 0;
  periodOrders.forEach(order => {
    order.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        costOfGoodsSold += product.costPrice * item.quantity;
      }
    });
  });

  const grossProfit = grossRevenue - costOfGoodsSold;
  const grossMargin = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;

  // Calculate expenses
  const periodExpenses = mockExpenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate >= startDate && expDate <= now;
  });

  const operatingExpenses = calculateExpenseBreakdown(periodExpenses);
  const totalExpenses = Object.values(operatingExpenses).reduce((sum, val) => sum + val, 0);

  const netProfit = grossProfit - totalExpenses;
  const netMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  return {
    period,
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
    grossRevenue,
    costOfGoodsSold,
    grossProfit,
    grossMargin,
    operatingExpenses,
    totalExpenses,
    netProfit,
    netMargin,
    previousPeriod: {
      grossRevenue: grossRevenue * 0.85,
      netProfit: netProfit * 0.82,
      growth: 15.2,
    },
  };
};

// ============== SALES TRENDS ==============

export const getSalesTrends = (days: number = 30): SalesTrend[] => {
  const { orders, products } = getDataState();
  const trends: SalesTrend[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= date && orderDate < nextDate && o.status === 'completed';
    });

    const revenue = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    let profit = 0;
    dayOrders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          profit += (item.price - product.costPrice) * item.quantity;
        }
      });
    });

    trends.push({
      date: date.toISOString().split('T')[0],
      revenue,
      profit,
      orders: dayOrders.length,
      averageOrderValue: dayOrders.length > 0 ? revenue / dayOrders.length : 0,
    });
  }

  // Generate some baseline data if empty
  if (trends.every(t => t.revenue === 0)) {
    return trends.map((t, i) => ({
      ...t,
      revenue: 30000 + Math.random() * 50000,
      profit: 8000 + Math.random() * 15000,
      orders: 3 + Math.floor(Math.random() * 5),
      averageOrderValue: 8000 + Math.random() * 4000,
    }));
  }

  return trends;
};

export const getProfitMarginTrends = (days: number = 30): ProfitMarginData[] => {
  const trends = getSalesTrends(days);
  const financialSummary = getFinancialSummary('month');

  return trends.map(t => {
    const grossMargin = t.revenue > 0 ? (t.profit / t.revenue) * 100 : 0;
    const operatingMargin = grossMargin - 15; // Simplified estimate
    const netMargin = operatingMargin - 5; // Simplified estimate

    return {
      date: t.date,
      grossMargin: Math.max(0, grossMargin),
      operatingMargin: Math.max(0, operatingMargin),
      netMargin: Math.max(0, netMargin),
    };
  });
};

// ============== CATEGORY PERFORMANCE ==============

export const getCategoryPerformance = (): CategoryPerformance[] => {
  const { orders, products } = getDataState();
  const categoryMap = new Map<string, { revenue: number; profit: number; units: number }>();

  const categoryColors: Record<string, string> = {
    'Электроника': lightColors.chart1,
    'Аксессуары': lightColors.chart2,
    'Премиум': lightColors.chart3,
    'Новинки': lightColors.chart4,
    'Акции': lightColors.chart5,
    'default': lightColors.chart6,
  };

  orders.filter(o => o.status === 'completed').forEach(order => {
    order.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const existing = categoryMap.get(product.category) || { revenue: 0, profit: 0, units: 0 };
        const itemRevenue = item.price * item.quantity;
        const itemProfit = (item.price - product.costPrice) * item.quantity;

        categoryMap.set(product.category, {
          revenue: existing.revenue + itemRevenue,
          profit: existing.profit + itemProfit,
          units: existing.units + item.quantity,
        });
      }
    });
  });

  const totalRevenue = Array.from(categoryMap.values()).reduce((sum, c) => sum + c.revenue, 0);

  // If no data, generate mock data
  if (categoryMap.size === 0) {
    return [
      { category: 'Электроника', revenue: 450000, profit: 135000, margin: 30, unitsSold: 25, growth: 12.5, color: categoryColors['Электроника'] },
      { category: 'Аксессуары', revenue: 180000, profit: 72000, margin: 40, unitsSold: 85, growth: 8.2, color: categoryColors['Аксессуары'] },
      { category: 'Премиум', revenue: 195000, profit: 78000, margin: 40, unitsSold: 6, growth: -2.3, color: categoryColors['Премиум'] },
      { category: 'Новинки', revenue: 165000, profit: 49500, margin: 30, unitsSold: 22, growth: 25.8, color: categoryColors['Новинки'] },
      { category: 'Акции', revenue: 55000, profit: 11000, margin: 20, unitsSold: 15, growth: 5.1, color: categoryColors['Акции'] },
    ];
  }

  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    revenue: data.revenue,
    profit: data.profit,
    margin: data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0,
    unitsSold: data.units,
    growth: (Math.random() - 0.3) * 30, // Simplified growth
    color: categoryColors[category] || categoryColors['default'],
  })).sort((a, b) => b.revenue - a.revenue);
};

// ============== STORE PERFORMANCE ==============

export const getStorePerformance = (): StorePerformance[] => {
  return mockStores.map((store, index) => {
    const baseRevenue = index === 0 ? 850000 : index === 1 ? 520000 : 380000;
    const revenue = baseRevenue + Math.random() * 100000;
    const expenses = revenue * (0.15 + Math.random() * 0.1);
    const profit = revenue * (0.25 + Math.random() * 0.1);

    return {
      storeId: store.id,
      storeName: store.name,
      revenue,
      profit,
      orders: 50 + Math.floor(Math.random() * 30),
      expenses,
      averageOrderValue: 12000 + Math.random() * 5000,
      growth: (Math.random() - 0.3) * 20,
      topProducts: [
        { name: 'Смартфон Galaxy Pro X', sold: 15, revenue: 689850 },
        { name: 'Ноутбук TechBook Pro 15', sold: 8, revenue: 719920 },
        { name: 'Беспроводные наушники SoundMax', sold: 45, revenue: 359550 },
      ],
    };
  });
};

export const getConsolidatedReport = (): ConsolidatedReport => {
  const storePerformance = getStorePerformance();
  const financialSummary = getFinancialSummary('month');

  return {
    period: 'month',
    stores: storePerformance,
    totalRevenue: storePerformance.reduce((sum, s) => sum + s.revenue, 0),
    totalProfit: storePerformance.reduce((sum, s) => sum + s.profit, 0),
    totalOrders: storePerformance.reduce((sum, s) => sum + s.orders, 0),
    totalExpenses: financialSummary.totalExpenses,
    netProfit: financialSummary.netProfit,
  };
};

// ============== QR PAYMENT ==============

export const generateQRPayment = (amount: number, orderId?: string, description?: string): QRPayment => {
  const id = `qr-${Date.now()}`;
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);

  // Generate SBP-style QR data
  const qrData = JSON.stringify({
    type: 'sbp',
    version: '1.0',
    merchantId: 'MAGGAZ12',
    paymentId: id,
    amount,
    currency: 'RUB',
    description: description || `Оплата заказа ${orderId || 'N/A'}`,
    timestamp: new Date().toISOString(),
  });

  return {
    id,
    orderId,
    amount,
    description: description || `Оплата ${amount} ₽`,
    status: 'pending',
    qrData,
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString(),
  };
};

// ============== EXPENSE CATEGORY HELPERS ==============

export const getExpenseCategoryIcon = (category: ExpenseCategory): string => {
  const icons: Record<ExpenseCategory, string> = {
    rent: 'home',
    salaries: 'people',
    utilities: 'flash',
    taxes: 'document-text',
    inventory: 'cube',
    marketing: 'megaphone',
    equipment: 'hardware-chip',
    supplies: 'file-tray',
    insurance: 'shield-checkmark',
    maintenance: 'construct',
    delivery: 'car',
    banking: 'card',
    other: 'ellipsis-horizontal',
  };
  return icons[category] || 'ellipsis-horizontal';
};

export const getExpenseCategoryColor = (category: ExpenseCategory): string => {
  const categoryColors: Record<ExpenseCategory, string> = {
    rent: '#e63757',
    salaries: '#2c7be5',
    utilities: '#f6c343',
    taxes: '#6f42c1',
    inventory: '#00d97e',
    marketing: '#39afd1',
    equipment: '#fd7e14',
    supplies: '#6b7c93',
    insurance: '#20c997',
    maintenance: '#6610f2',
    delivery: '#e83e8c',
    banking: '#343a40',
    other: '#9aa5b1',
  };
  return categoryColors[category] || '#9aa5b1';
};

// ============== TELEGRAM CONFIG ==============

export const defaultTelegramConfig: TelegramConfig = {
  id: 'telegram-config-1',
  ownerId: 'user-1',
  isConnected: false,
  notifyDailySummary: true,
  notifyLowStock: true,
  notifyNewOrders: true,
  notifyAnomalies: true,
  summaryTime: '09:00',
  timezone: 'Europe/Moscow',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const generateDailySummaryMessage = (): string => {
  const summary = getFinancialSummary('month');
  const today = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return `📊 *Ежедневный отчёт MaGGaz12*
📅 ${today}

💰 *Финансы за месяц:*
• Выручка: ${summary.grossRevenue.toLocaleString('ru-RU')} ₽
• Чистая прибыль: ${summary.netProfit.toLocaleString('ru-RU')} ₽
• Маржа: ${summary.netMargin.toFixed(1)}%

📈 *Рост:* ${summary.previousPeriod?.growth.toFixed(1)}% к прошлому периоду

✅ Бизнес работает стабильно!`;
};
