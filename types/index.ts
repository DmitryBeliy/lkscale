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
  company?: string;
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  averageCheck?: number;
  topCategories?: string[];
  createdAt: string;
  updatedAt?: string;
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
  costPrice: number; // Себестоимость
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
  // Computed fields (can be calculated)
  margin?: number; // (price - costPrice) / price * 100
  profit?: number; // price - costPrice
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

// Notification types
export type NotificationType =
  | 'new_order'
  | 'order_completed'
  | 'low_stock'
  | 'payment_received'
  | 'ai_insight'
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  actionUrl?: string;
}

// Customer value tags
export type CustomerValueTag = 'vip' | 'regular' | 'new' | 'inactive' | 'high_value';

export interface CustomerWithValue extends Customer {
  valueTag: CustomerValueTag;
  averageOrderValue: number;
  daysSinceLastOrder?: number;
  orderFrequency?: number; // orders per month
}

// Product variants
export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  barcode?: string;
  attributes: {
    size?: string;
    color?: string;
    [key: string]: string | undefined;
  };
  price: number;
  stock: number;
  isActive: boolean;
}

export interface ProductWithVariants extends Product {
  variants?: ProductVariant[];
  hasVariants: boolean;
}

// Sync status
export type SyncStatus = 'synced' | 'pending' | 'offline' | 'syncing' | 'conflict';

export interface SyncState {
  status: SyncStatus;
  lastSyncTime: string | null;
  pendingChanges: number;
  conflicts: SyncConflict[];
}

export interface SyncConflict {
  id: string;
  entityType: 'order' | 'product' | 'customer';
  entityId: string;
  localData: Record<string, unknown>;
  serverData: Record<string, unknown>;
  timestamp: string;
}

// AI Report types
export interface AIReport {
  id: string;
  type: 'monthly_sales' | 'promotional' | 'inventory' | 'customer_analysis';
  title: string;
  content: string;
  generatedAt: string;
  data?: Record<string, unknown>;
}

// Store Settings
export interface StoreSettings {
  id: string;
  userId: string;
  businessName: string;
  logoUrl?: string;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  taxName: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  invoicePrefix: string;
  invoiceNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Analytics types
export interface RevenueVsProfitData {
  date: string;
  label: string;
  revenue: number;
  profit: number;
  cost: number;
}

export interface CategorySalesData {
  category: string;
  sales: number;
  percentage: number;
  color: string;
  count: number;
}

export type TimePeriod = 'today' | '7days' | '30days' | 'year';

// Invoice types
export interface InvoiceData {
  orderNumber: string;
  date: string;
  customer: {
    name: string;
    phone?: string;
    address?: string;
    email?: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  total: number;
  paymentMethod: string;
  businessInfo: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  notes?: string;
}

// Stock Report types
export interface StockReportItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  minStock: number;
  costPrice: number;
  retailPrice: number;
  costValue: number;
  retailValue: number;
  status: 'ok' | 'low' | 'out';
}

export interface StockReport {
  generatedAt: string;
  totalItems: number;
  totalCostValue: number;
  totalRetailValue: number;
  potentialProfit: number;
  lowStockItems: number;
  outOfStockItems: number;
  items: StockReportItem[];
}

// Warehouse & Supply Chain Types

export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  notes?: string;
  paymentTerms?: string;
  leadTimeDays: number;
  rating?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  // Computed fields
  totalOrders?: number;
  totalSpent?: number;
  avgDeliveryDays?: number;
}

export interface ProductSupplier {
  id: string;
  productId: string;
  supplierId: string;
  supplierSku?: string;
  costPrice?: number;
  minOrderQuantity: number;
  isPreferred: boolean;
  lastOrderDate?: string;
  // Joined fields
  supplier?: Supplier;
}

export type PurchaseOrderStatus = 'draft' | 'pending' | 'ordered' | 'partial' | 'received' | 'cancelled';

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId?: string;
  supplier?: Supplier;
  status: PurchaseOrderStatus;
  totalAmount: number;
  totalItems: number;
  notes?: string;
  expectedDate?: string;
  receivedDate?: string;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId?: string;
  productName: string;
  productSku?: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  totalCost: number;
  product?: Product;
}

export type StockAdjustmentType =
  | 'write_off'
  | 'damage'
  | 'theft'
  | 'count'
  | 'return'
  | 'transfer_in'
  | 'transfer_out'
  | 'other';

export interface StockAdjustment {
  id: string;
  productId?: string;
  productName: string;
  productSku?: string;
  adjustmentType: StockAdjustmentType;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  unitCost?: number;
  totalValue?: number;
  reason?: string;
  referenceNumber?: string;
  createdAt: string;
  product?: Product;
}

export interface PurchaseHistoryEntry {
  id: string;
  date: string;
  supplierId?: string;
  supplierName?: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  purchaseOrderId?: string;
}

// Warehouse operation types
export type WarehouseOperation = 'stock_in' | 'write_off' | 'transfer' | 'return' | 'adjustment';

export interface WarehouseOperationConfig {
  type: WarehouseOperation;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
}

// Price Tag types
export interface PriceTag {
  productId: string;
  name: string;
  price: number;
  barcode?: string;
  sku?: string;
  category?: string;
}

export interface PriceTagBatch {
  tags: PriceTag[];
  generatedAt: string;
  format: 'small' | 'medium' | 'large';
}

// AI Supply Chain types
export interface ProcurementForecast {
  productId: string;
  productName: string;
  currentStock: number;
  avgDailySales: number;
  daysUntilStockout: number;
  recommendedOrderDate: string;
  recommendedQuantity: number;
  confidence: number;
}

export interface SupplierPerformance {
  supplierId: string;
  supplierName: string;
  totalOrders: number;
  totalSpent: number;
  avgLeadTime: number;
  onTimeDeliveryRate: number;
  avgMargin: number;
  profitability: 'high' | 'medium' | 'low';
  recommendation?: string;
}

export interface PricingAlert {
  productId: string;
  productName: string;
  currentCost: number;
  previousCost: number;
  costChange: number;
  costChangePercent: number;
  currentMargin: number;
  targetMargin: number;
  suggestedPrice: number;
  currentPrice: number;
  priority: 'high' | 'medium' | 'low';
}
