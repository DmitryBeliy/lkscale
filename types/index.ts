// Lkscale Types

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  balance: number;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  totalAmount: number;
  itemsCount: number;
  createdAt: string;
  updatedAt: string;
  customer?: {
    name: string;
    phone?: string;
    address?: string;
  };
  items: OrderItem[];
  notes?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  description?: string;
  minStock: number;
  isActive: boolean;
}

export interface KPIData {
  totalSales: number;
  salesChange: number;
  activeOrders: number;
  ordersChange: number;
  balance: number;
  balanceChange: number;
  lowStockItems: number;
}

export interface Activity {
  id: string;
  type: 'order_created' | 'order_completed' | 'stock_low' | 'payment_received';
  title: string;
  description: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

export interface AIInsight {
  id: string;
  type: 'trend' | 'recommendation' | 'alert';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable?: boolean;
  action?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  rememberMe: boolean;
}

export interface AppSettings {
  notifications: boolean;
  darkMode: boolean;
  language: 'ru' | 'en';
  autoSync: boolean;
}
