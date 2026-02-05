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

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
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
  customerId?: string;
  customer?: {
    name: string;
    phone?: string;
    address?: string;
  };
  items: OrderItem[];
  notes?: string;
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'online';
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  sku?: string;
}

export interface PriceHistoryEntry {
  date: string;
  price: number;
}

export interface StockHistoryEntry {
  date: string;
  stock: number;
  change: number;
  reason: 'sale' | 'restock' | 'adjustment' | 'return';
}

export interface ProductCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  productCount: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  stock: number;
  category: string;
  categoryId?: string;
  image?: string;
  images?: string[];
  description?: string;
  minStock: number;
  isActive: boolean;
  priceHistory?: PriceHistoryEntry[];
  stockHistory?: StockHistoryEntry[];
  createdAt?: string;
  updatedAt?: string;
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

export interface SalesDataPoint {
  date: string;
  label: string;
  sales: number;
  orders: number;
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isLoading?: boolean;
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

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface NewOrderData {
  customerId?: string;
  customer?: {
    name: string;
    phone?: string;
    address?: string;
  };
  items: CartItem[];
  paymentMethod: 'cash' | 'card' | 'transfer' | 'online';
  notes?: string;
}
