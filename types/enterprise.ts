// MaGGaz12 Enterprise Types - Stage 10

// ============== MULTI-STORE MANAGEMENT ==============

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  code: string; // Short code like "MAIN", "WEST"
  address?: string;
  phone?: string;
  email?: string;
  managerName?: string;
  isMain: boolean;
  isActive: boolean;
  timezone?: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreInventory {
  id: string;
  storeId: string;
  productId: string;
  stock: number;
  minStock: number;
  reservedStock: number;
  lastRestockDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type StockTransferStatus = 'pending' | 'in_transit' | 'received' | 'cancelled';

export interface StockTransfer {
  id: string;
  transferNumber: string;
  fromStoreId: string;
  toStoreId: string;
  status: StockTransferStatus;
  notes?: string;
  items: StockTransferItem[];
  createdAt: string;
  shippedAt?: string;
  receivedAt?: string;
  createdBy?: string;
}

export interface StockTransferItem {
  id: string;
  transferId: string;
  productId: string;
  productName: string;
  productSku: string;
  quantitySent: number;
  quantityReceived?: number;
  unitCost: number;
}

export interface ConsolidatedReport {
  period: string;
  stores: StorePerformance[];
  totalRevenue: number;
  totalProfit: number;
  totalOrders: number;
  totalExpenses: number;
  netProfit: number;
}

export interface StorePerformance {
  storeId: string;
  storeName: string;
  revenue: number;
  profit: number;
  orders: number;
  expenses: number;
  averageOrderValue: number;
  growth: number;
  topProducts: { name: string; sold: number; revenue: number }[];
}

// ============== FINANCIAL & EXPENSE TRACKING ==============

export type ExpenseCategory =
  | 'rent'
  | 'salaries'
  | 'utilities'
  | 'taxes'
  | 'inventory'
  | 'marketing'
  | 'equipment'
  | 'supplies'
  | 'insurance'
  | 'maintenance'
  | 'delivery'
  | 'banking'
  | 'other';

export interface Expense {
  id: string;
  ownerId: string;
  storeId?: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  vendor?: string;
  receiptUrl?: string;
  date: string;
  isRecurring: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseBudget {
  id: string;
  ownerId: string;
  storeId?: string;
  category: ExpenseCategory;
  monthlyBudget: number;
  alertThreshold: number; // Percentage to alert (e.g., 80%)
  createdAt: string;
  updatedAt: string;
}

export interface FinancialSummary {
  period: string;
  startDate: string;
  endDate: string;
  grossRevenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  grossMargin: number;
  operatingExpenses: ExpenseBreakdown;
  totalExpenses: number;
  netProfit: number;
  netMargin: number;
  previousPeriod?: {
    grossRevenue: number;
    netProfit: number;
    growth: number;
  };
}

export interface ExpenseBreakdown {
  rent: number;
  salaries: number;
  utilities: number;
  taxes: number;
  inventory: number;
  marketing: number;
  equipment: number;
  supplies: number;
  insurance: number;
  maintenance: number;
  delivery: number;
  banking: number;
  other: number;
}

// ============== QR PAYMENT (SBP-STYLE) ==============

export interface QRPayment {
  id: string;
  orderId?: string;
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'expired' | 'cancelled';
  qrData: string; // The data encoded in QR
  expiresAt: string;
  completedAt?: string;
  createdAt: string;
}

export interface PaymentLink {
  id: string;
  ownerId: string;
  storeId?: string;
  amount?: number;
  description: string;
  isReusable: boolean;
  usageCount: number;
  maxUsage?: number;
  expiresAt?: string;
  url: string;
  createdAt: string;
}

// ============== ADVANCED REPORTING ==============

export type ReportType =
  | 'sales'
  | 'inventory'
  | 'financial'
  | 'customers'
  | 'staff'
  | 'tax';

export type ReportFormat = 'pdf' | 'excel' | 'csv';

export interface ReportConfig {
  type: ReportType;
  format: ReportFormat;
  dateRange: {
    start: string;
    end: string;
  };
  storeIds?: string[]; // For multi-store
  includeCharts?: boolean;
  includeDetails?: boolean;
  groupBy?: 'day' | 'week' | 'month';
}

export interface GeneratedReport {
  id: string;
  config: ReportConfig;
  title: string;
  fileUrl?: string;
  status: 'generating' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  error?: string;
}

// ============== TELEGRAM INTEGRATION ==============

export interface TelegramConfig {
  id: string;
  ownerId: string;
  botToken?: string;
  chatId?: string;
  isConnected: boolean;
  notifyDailySummary: boolean;
  notifyLowStock: boolean;
  notifyNewOrders: boolean;
  notifyAnomalies: boolean;
  summaryTime: string; // HH:MM format
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface TelegramMessage {
  id: string;
  configId: string;
  type: 'daily_summary' | 'alert' | 'custom';
  content: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  error?: string;
  createdAt: string;
}

// ============== SUBSCRIPTION & MONETIZATION ==============

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trialing';

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  features: SubscriptionFeatures;
  revenueCatId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionFeatures {
  maxStores: number;
  maxProducts: number;
  maxTeamMembers: number;
  aiInsightsPerDay: number;
  advancedReporting: boolean;
  apiAccess: boolean;
  telegramIntegration: boolean;
  prioritySupport: boolean;
  customBranding: boolean;
  exportToExcel: boolean;
  multiCurrency: boolean;
}

export interface PricingPlan {
  tier: SubscriptionTier;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  highlighted: boolean;
  ctaText: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    tier: 'free',
    name: 'Бесплатный',
    description: 'Для начинающих',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      '1 магазин',
      'До 50 товаров',
      '1 сотрудник',
      '3 AI-подсказки в день',
      'Базовая аналитика',
    ],
    highlighted: false,
    ctaText: 'Текущий план',
  },
  {
    tier: 'basic',
    name: 'Базовый',
    description: 'Для малого бизнеса',
    monthlyPrice: 990,
    yearlyPrice: 9990,
    features: [
      '1 магазин',
      'До 500 товаров',
      '3 сотрудника',
      '10 AI-подсказок в день',
      'Расширенная аналитика',
      'Экспорт в Excel',
    ],
    highlighted: false,
    ctaText: 'Начать',
  },
  {
    tier: 'pro',
    name: 'Профессиональный',
    description: 'Для растущего бизнеса',
    monthlyPrice: 2490,
    yearlyPrice: 24990,
    features: [
      '5 магазинов',
      'Неограниченно товаров',
      '10 сотрудников',
      'Безлимитные AI-подсказки',
      'AI Виртуальный CFO',
      'Telegram-уведомления',
      'Приоритетная поддержка',
    ],
    highlighted: true,
    ctaText: 'Популярный выбор',
  },
  {
    tier: 'enterprise',
    name: 'Корпоративный',
    description: 'Для крупного бизнеса',
    monthlyPrice: 7990,
    yearlyPrice: 79990,
    features: [
      'Неограниченно магазинов',
      'Неограниченно товаров',
      'Неограниченно сотрудников',
      'Все AI-функции',
      'API доступ',
      'Кастомный брендинг',
      'Выделенный менеджер',
      'SLA гарантия',
    ],
    highlighted: false,
    ctaText: 'Связаться с нами',
  },
];

export const SUBSCRIPTION_FEATURES: Record<SubscriptionTier, SubscriptionFeatures> = {
  free: {
    maxStores: 1,
    maxProducts: 50,
    maxTeamMembers: 1,
    aiInsightsPerDay: 3,
    advancedReporting: false,
    apiAccess: false,
    telegramIntegration: false,
    prioritySupport: false,
    customBranding: false,
    exportToExcel: false,
    multiCurrency: false,
  },
  basic: {
    maxStores: 1,
    maxProducts: 500,
    maxTeamMembers: 3,
    aiInsightsPerDay: 10,
    advancedReporting: true,
    apiAccess: false,
    telegramIntegration: false,
    prioritySupport: false,
    customBranding: false,
    exportToExcel: true,
    multiCurrency: false,
  },
  pro: {
    maxStores: 5,
    maxProducts: -1, // Unlimited
    maxTeamMembers: 10,
    aiInsightsPerDay: -1, // Unlimited
    advancedReporting: true,
    apiAccess: false,
    telegramIntegration: true,
    prioritySupport: true,
    customBranding: false,
    exportToExcel: true,
    multiCurrency: true,
  },
  enterprise: {
    maxStores: -1, // Unlimited
    maxProducts: -1, // Unlimited
    maxTeamMembers: -1, // Unlimited
    aiInsightsPerDay: -1, // Unlimited
    advancedReporting: true,
    apiAccess: true,
    telegramIntegration: true,
    prioritySupport: true,
    customBranding: true,
    exportToExcel: true,
    multiCurrency: true,
  },
};

// ============== AI VIRTUAL CFO ==============

export interface RevenueForcast {
  date?: string;
  period?: string;
  predicted?: number;
  predictedRevenue?: number;
  lowerBound?: number;
  upperBound?: number;
  confidenceMin?: number;
  confidenceMax?: number;
  confidence: number;
  factors?: string[];
}

export interface AnomalyAlert {
  id: string;
  type: 'sales_drop' | 'sales_spike' | 'expense_spike' | 'inventory_anomaly' | 'margin_decline' | 'revenue_spike';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedStore?: string;
  affectedProduct?: string;
  affectedPeriod?: string;
  metric?: string;
  detectedAt?: string;
  expectedValue?: number;
  actualValue?: number;
  deviation?: number;
  suggestedActions?: string[];
  createdAt?: string;
  isRead?: boolean;
}

export interface TaxOptimizationSuggestion {
  id: string;
  category?: 'deduction' | 'timing' | 'structure' | 'compliance';
  title: string;
  description: string;
  potentialSaving?: number;
  potentialSavings?: number;
  deadline?: string;
  complexity: 'easy' | 'medium' | 'complex' | 'low' | 'high';
  requiresProfessional?: boolean;
  createdAt?: string;
}

export interface CFOInsight {
  id: string;
  type: 'forecast' | 'anomaly' | 'tax' | 'recommendation' | 'benchmark' | 'opportunity' | 'warning' | 'risk' | 'positive';
  title: string;
  summary?: string;
  description?: string;
  details?: string;
  impact?: number;
  confidence?: number;
  data?: Record<string, unknown>;
  actionItems?: string[];
  actionRequired?: boolean;
  priority?: 'low' | 'medium' | 'high';
  createdAt: string;
}

// ============== EXECUTIVE DASHBOARD ==============

export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'map' | 'alerts' | 'forecast';
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  position: { row: number; col: number };
  config: Record<string, unknown>;
}

export interface ExecutiveDashboardConfig {
  id: string;
  ownerId: string;
  widgets: DashboardWidget[];
  refreshInterval: number; // in seconds
  defaultPeriod: '7days' | '30days' | 'quarter' | 'year';
  createdAt: string;
  updatedAt: string;
}

export interface CategoryPerformance {
  category: string;
  revenue: number;
  profit: number;
  margin: number;
  unitsSold: number;
  growth: number;
  color: string;
}

export interface SalesTrend {
  date: string;
  revenue: number;
  profit: number;
  orders: number;
  averageOrderValue: number;
}

export interface ProfitMarginData {
  date: string;
  grossMargin: number;
  netMargin: number;
  operatingMargin: number;
}
