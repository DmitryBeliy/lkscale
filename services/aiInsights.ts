import { generateText } from '@fastshot/ai';
import { KPIData, Order, Product, AIInsight } from '@/types';
import { findDeadStock, calculateProjectedTaxes, generateWeeklyComparison } from './analyticsService';
import { getStoreSettingsState } from './storeSettingsService';
import { logger } from '@/lib/logger';

// Hook for using AI insights in components
import { useState, useCallback } from 'react';

interface BusinessData {
  kpi: KPIData | null;
  orders: Order[];
  products: Product[];
}

export const generateBusinessInsights = async (data: BusinessData): Promise<AIInsight[]> => {
  const { kpi, orders, products } = data;

  if (!kpi || orders.length === 0) {
    return getDefaultInsights();
  }

  // Prepare business summary for AI analysis
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Advanced analytics
  const storeSettings = getStoreSettingsState().settings;
  const taxRate = storeSettings?.taxRate || 20;
  const deadStock = findDeadStock(orders, products, 30);
  const taxProjection = calculateProjectedTaxes(orders, taxRate, '30days');
  const weeklyComparison = generateWeeklyComparison(orders, products);

  const businessSummary = `
Analyze this business data and provide 3-4 actionable insights in Russian:

Business Metrics:
- Total Sales: ${kpi.totalSales.toFixed(0)} RUB
- Sales Change: ${kpi.salesChange > 0 ? '+' : ''}${kpi.salesChange}%
- Active Orders: ${kpi.activeOrders}
- Orders Change: ${kpi.ordersChange > 0 ? '+' : ''}${kpi.ordersChange}%
- Account Balance: ${kpi.balance.toFixed(0)} RUB
- Low Stock Items: ${kpi.lowStockItems}

Weekly Performance:
- This Week Revenue: ${weeklyComparison.thisWeek.revenue.toFixed(0)} RUB
- Last Week Revenue: ${weeklyComparison.lastWeek.revenue.toFixed(0)} RUB
- Week-over-Week Change: ${weeklyComparison.changes.revenue > 0 ? '+' : ''}${weeklyComparison.changes.revenue.toFixed(1)}%

Tax Information:
- Tax Rate: ${taxRate}%
- Projected Monthly Tax: ${taxProjection.projectedMonthlyTax.toLocaleString()} RUB

Dead Stock Alert:
- Products with NO sales in 30+ days: ${deadStock.length}
${deadStock.length > 0 ? `- Top dead stock: ${deadStock.slice(0, 3).map(p => p.name).join(', ')}` : '- No dead stock detected'}

Orders Summary:
- Total Orders: ${orders.length}
- Pending: ${pendingOrders.length}
- Completed: ${completedOrders.length}
- Revenue from Completed: ${totalRevenue.toFixed(0)} RUB

Inventory Issues:
${lowStockProducts.length > 0
  ? lowStockProducts.map((p) => `- ${p.name}: ${p.stock} units (min: ${p.minStock})`).join('\n')
  : '- No critical stock issues'
}

Provide insights in this exact JSON format (array of objects):
[
  {
    "type": "trend" | "recommendation" | "alert",
    "title": "Short title in Russian",
    "description": "1-2 sentences in Russian explaining the insight",
    "priority": "low" | "medium" | "high"
  }
]

Focus on:
1. Weekly performance trends (is business growing?)
2. Tax preparation (upcoming obligations)
3. Dead stock (capital tied up, recommendations)
4. Stock replenishment needs
5. High priority operational issues
`;

  try {
    const response = await generateText({ prompt: businessSummary });

    if (response) {
      // Try to parse the JSON response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const insights: AIInsight[] = JSON.parse(jsonMatch[0]).map(
          (insight: Omit<AIInsight, 'id' | 'actionable'>, index: number) => ({
            ...insight,
            id: `ai-${Date.now()}-${index}`,
            actionable: insight.type === 'recommendation',
            action: insight.type === 'recommendation' ? 'Подробнее' : undefined,
          })
        );
        return insights.slice(0, 3);
      }
    }

    return getDefaultInsights();
  } catch (error) {
    logger.error('AI Insights generation error:', error);
    return getDefaultInsights();
  }
};

// Fallback insights when AI is unavailable
const getDefaultInsights = (): AIInsight[] => [
  {
    id: 'default-1',
    type: 'trend',
    title: 'Рост продаж',
    description: 'Продажи показывают положительную динамику. Продолжайте отслеживать ключевые показатели.',
    priority: 'medium',
    actionable: false,
  },
  {
    id: 'default-2',
    type: 'recommendation',
    title: 'Проверьте остатки',
    description: 'Рекомендуем регулярно проверять уровень запасов для своевременного пополнения.',
    priority: 'medium',
    actionable: true,
    action: 'Перейти на склад',
  },
];

interface UseAIInsightsResult {
  insights: AIInsight[];
  isLoading: boolean;
  error: Error | null;
  generateInsights: (data: BusinessData) => Promise<void>;
  reset: () => void;
}

export const useAIInsights = (): UseAIInsightsResult => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateInsights = useCallback(async (data: BusinessData) => {
    setIsLoading(true);
    setError(null);

    try {
      const newInsights = await generateBusinessInsights(data);
      setInsights(newInsights);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to generate insights'));
      setInsights(getDefaultInsights());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setInsights([]);
    setError(null);
  }, []);

  return {
    insights,
    isLoading,
    error,
    generateInsights,
    reset,
  };
};
