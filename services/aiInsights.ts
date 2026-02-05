import { generateText } from '@fastshot/ai';
import { KPIData, Order, Product, AIInsight } from '@/types';

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

  const businessSummary = `
Analyze this business data and provide 2-3 actionable insights in Russian:

Business Metrics:
- Total Sales: ${kpi.totalSales.toFixed(0)} RUB
- Sales Change: ${kpi.salesChange > 0 ? '+' : ''}${kpi.salesChange}%
- Active Orders: ${kpi.activeOrders}
- Orders Change: ${kpi.ordersChange > 0 ? '+' : ''}${kpi.ordersChange}%
- Account Balance: ${kpi.balance.toFixed(0)} RUB
- Low Stock Items: ${kpi.lowStockItems}

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
1. Sales trends and performance
2. Stock replenishment needs
3. Order processing efficiency
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
    console.error('AI Insights generation error:', error);
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

// Hook for using AI insights in components
import { useState, useCallback } from 'react';

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
