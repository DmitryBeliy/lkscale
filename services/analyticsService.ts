import { Order, Product, RevenueVsProfitData, CategorySalesData, TimePeriod } from '@/types';
import { colors } from '@/constants/theme';

// Category colors
const categoryColors: Record<string, string> = {
  'Электроника': '#2c7be5',
  'Аксессуары': '#00d97e',
  'Премиум': '#f6c343',
  'Новинки': '#e63757',
  'Акции': '#6b7c93',
  'Одежда': '#727cf5',
  'Обувь': '#39afd1',
  'Продукты': '#fd7e14',
  'Косметика': '#e83e8c',
  'Спорт': '#20c997',
  'Дом': '#6610f2',
  'Авто': '#dc3545',
};

const defaultColors = [
  '#2c7be5', '#00d97e', '#f6c343', '#e63757', '#6b7c93',
  '#727cf5', '#39afd1', '#fd7e14', '#e83e8c', '#20c997',
];

// Get date range based on period
export const getDateRange = (period: TimePeriod): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case '7days':
      start.setDate(start.getDate() - 7);
      break;
    case '30days':
      start.setDate(start.getDate() - 30);
      break;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  return { start, end };
};

// Filter orders by period
export const filterOrdersByPeriod = (orders: Order[], period: TimePeriod): Order[] => {
  const { start, end } = getDateRange(period);
  return orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= start && orderDate <= end && order.status === 'completed';
  });
};

// Generate Revenue vs Profit data
export const generateRevenueVsProfitData = (
  orders: Order[],
  products: Product[],
  period: TimePeriod
): RevenueVsProfitData[] => {
  const filteredOrders = filterOrdersByPeriod(orders, period);
  const { start, end } = getDateRange(period);

  // Create a map of product costs
  const productCosts = new Map(products.map((p) => [p.id, p.costPrice]));

  // Determine grouping based on period
  let groupFormat: 'hour' | 'day' | 'month';
  let labelFormat: Intl.DateTimeFormatOptions;

  switch (period) {
    case 'today':
      groupFormat = 'hour';
      labelFormat = { hour: '2-digit' };
      break;
    case '7days':
      groupFormat = 'day';
      labelFormat = { weekday: 'short' };
      break;
    case '30days':
      groupFormat = 'day';
      labelFormat = { day: 'numeric', month: 'short' };
      break;
    case 'year':
      groupFormat = 'month';
      labelFormat = { month: 'short' };
      break;
  }

  // Group orders by period
  const grouped = new Map<string, { revenue: number; cost: number }>();

  // Initialize all periods
  const current = new Date(start);
  while (current <= end) {
    const key = getGroupKey(current, groupFormat);
    grouped.set(key, { revenue: 0, cost: 0 });

    switch (groupFormat) {
      case 'hour':
        current.setHours(current.getHours() + 1);
        break;
      case 'day':
        current.setDate(current.getDate() + 1);
        break;
      case 'month':
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }

  // Aggregate order data
  filteredOrders.forEach((order) => {
    const orderDate = new Date(order.createdAt);
    const key = getGroupKey(orderDate, groupFormat);

    const existing = grouped.get(key) || { revenue: 0, cost: 0 };

    // Calculate revenue and cost for this order
    let orderCost = 0;
    order.items.forEach((item) => {
      const costPrice = productCosts.get(item.productId) || 0;
      orderCost += costPrice * item.quantity;
    });

    grouped.set(key, {
      revenue: existing.revenue + order.totalAmount,
      cost: existing.cost + orderCost,
    });
  });

  // Convert to array and sort by date
  const result: RevenueVsProfitData[] = [];
  const sortedKeys = Array.from(grouped.keys()).sort();

  // Limit data points for readability
  const maxPoints = period === 'today' ? 24 : period === '7days' ? 7 : period === '30days' ? 14 : 12;
  const step = Math.max(1, Math.ceil(sortedKeys.length / maxPoints));

  sortedKeys.filter((_, i) => i % step === 0 || i === sortedKeys.length - 1).forEach((key) => {
    const data = grouped.get(key)!;
    const date = parseGroupKey(key, groupFormat);

    result.push({
      date: date.toISOString(),
      label: date.toLocaleDateString('ru-RU', labelFormat),
      revenue: data.revenue,
      profit: data.revenue - data.cost,
      cost: data.cost,
    });
  });

  return result;
};

// Generate Sales by Category data
export const generateCategorySalesData = (
  orders: Order[],
  products: Product[],
  period: TimePeriod
): CategorySalesData[] => {
  const filteredOrders = filterOrdersByPeriod(orders, period);

  // Create a map of product categories
  const productCategories = new Map(products.map((p) => [p.id, p.category]));

  // Aggregate sales by category
  const categorySales = new Map<string, { sales: number; count: number }>();

  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      const category = productCategories.get(item.productId) || 'Другое';
      const existing = categorySales.get(category) || { sales: 0, count: 0 };
      categorySales.set(category, {
        sales: existing.sales + item.price * item.quantity,
        count: existing.count + item.quantity,
      });
    });
  });

  // Calculate totals and percentages
  const totalSales = Array.from(categorySales.values()).reduce((sum, c) => sum + c.sales, 0);

  const result: CategorySalesData[] = Array.from(categorySales.entries())
    .map(([category, data], index) => ({
      category,
      sales: data.sales,
      percentage: totalSales > 0 ? (data.sales / totalSales) * 100 : 0,
      color: categoryColors[category] || defaultColors[index % defaultColors.length],
      count: data.count,
    }))
    .sort((a, b) => b.sales - a.sales);

  return result;
};

// Helper functions
const getGroupKey = (date: Date, format: 'hour' | 'day' | 'week' | 'month'): string => {
  switch (format) {
    case 'hour':
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
    case 'day':
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    case 'week':
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      return `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
    case 'month':
      return `${date.getFullYear()}-${date.getMonth()}`;
  }
};

const parseGroupKey = (key: string, format: 'hour' | 'day' | 'week' | 'month'): Date => {
  const parts = key.split('-').map(Number);
  const date = new Date();

  switch (format) {
    case 'hour':
      date.setFullYear(parts[0], parts[1], parts[2]);
      date.setHours(parts[3], 0, 0, 0);
      break;
    case 'day':
    case 'week':
      date.setFullYear(parts[0], parts[1], parts[2]);
      date.setHours(0, 0, 0, 0);
      break;
    case 'month':
      date.setFullYear(parts[0], parts[1], 1);
      date.setHours(0, 0, 0, 0);
      break;
  }

  return date;
};

// Calculate advanced metrics
export const calculateAdvancedMetrics = (
  orders: Order[],
  products: Product[],
  period: TimePeriod
) => {
  const filteredOrders = filterOrdersByPeriod(orders, period);
  const productCosts = new Map(products.map((p) => [p.id, p.costPrice]));

  let totalRevenue = 0;
  let totalCost = 0;
  let totalOrders = filteredOrders.length;
  let totalItems = 0;

  filteredOrders.forEach((order) => {
    totalRevenue += order.totalAmount;
    order.items.forEach((item) => {
      const costPrice = productCosts.get(item.productId) || 0;
      totalCost += costPrice * item.quantity;
      totalItems += item.quantity;
    });
  });

  const totalProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const avgItemsPerOrder = totalOrders > 0 ? totalItems / totalOrders : 0;

  return {
    totalRevenue,
    totalCost,
    totalProfit,
    profitMargin,
    totalOrders,
    totalItems,
    avgOrderValue,
    avgItemsPerOrder,
  };
};

// Find dead stock (items with no sales in period)
export const findDeadStock = (
  orders: Order[],
  products: Product[],
  days: number = 30
): Product[] => {
  const period = new Date();
  period.setDate(period.getDate() - days);

  // Get all product IDs that have been sold
  const soldProductIds = new Set<string>();
  orders.forEach((order) => {
    if (new Date(order.createdAt) >= period && order.status === 'completed') {
      order.items.forEach((item) => soldProductIds.add(item.productId));
    }
  });

  // Find products not sold
  return products.filter((p) => p.isActive && p.stock > 0 && !soldProductIds.has(p.id));
};

// Calculate projected taxes
export const calculateProjectedTaxes = (
  orders: Order[],
  taxRate: number,
  period: TimePeriod = '30days'
): { projectedMonthlyTax: number; currentPeriodTax: number } => {
  const filteredOrders = filterOrdersByPeriod(orders, period);
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const currentTax = (totalRevenue * taxRate) / 100;

  // Project to monthly
  const { start, end } = getDateRange(period);
  const daysInPeriod = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const dailyTax = currentTax / daysInPeriod;
  const projectedMonthlyTax = dailyTax * 30;

  return {
    projectedMonthlyTax: Math.round(projectedMonthlyTax),
    currentPeriodTax: Math.round(currentTax),
  };
};

// Generate weekly digest comparison
export const generateWeeklyComparison = (orders: Order[], products: Product[]) => {
  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  // This week
  const thisWeekOrders = orders.filter((o) => {
    const date = new Date(o.createdAt);
    return date >= oneWeekAgo && date <= now && o.status === 'completed';
  });

  // Last week
  const lastWeekOrders = orders.filter((o) => {
    const date = new Date(o.createdAt);
    return date >= twoWeeksAgo && date < oneWeekAgo && o.status === 'completed';
  });

  const thisWeekRevenue = thisWeekOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const lastWeekRevenue = lastWeekOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const revenueChange = lastWeekRevenue > 0
    ? ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100
    : 0;

  const thisWeekOrderCount = thisWeekOrders.length;
  const lastWeekOrderCount = lastWeekOrders.length;
  const orderCountChange = lastWeekOrderCount > 0
    ? ((thisWeekOrderCount - lastWeekOrderCount) / lastWeekOrderCount) * 100
    : 0;

  const thisWeekAvgCheck = thisWeekOrderCount > 0 ? thisWeekRevenue / thisWeekOrderCount : 0;
  const lastWeekAvgCheck = lastWeekOrderCount > 0 ? lastWeekRevenue / lastWeekOrderCount : 0;
  const avgCheckChange = lastWeekAvgCheck > 0
    ? ((thisWeekAvgCheck - lastWeekAvgCheck) / lastWeekAvgCheck) * 100
    : 0;

  // Find top products this week
  const productSales = new Map<string, number>();
  thisWeekOrders.forEach((order) => {
    order.items.forEach((item) => {
      productSales.set(item.productId, (productSales.get(item.productId) || 0) + item.quantity);
    });
  });

  const topProducts = Array.from(productSales.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, qty]) => {
      const product = products.find((p) => p.id === id);
      return { name: product?.name || 'Неизвестно', quantity: qty };
    });

  return {
    thisWeek: {
      revenue: thisWeekRevenue,
      orderCount: thisWeekOrderCount,
      avgCheck: thisWeekAvgCheck,
    },
    lastWeek: {
      revenue: lastWeekRevenue,
      orderCount: lastWeekOrderCount,
      avgCheck: lastWeekAvgCheck,
    },
    changes: {
      revenue: revenueChange,
      orderCount: orderCountChange,
      avgCheck: avgCheckChange,
    },
    topProducts,
  };
};
