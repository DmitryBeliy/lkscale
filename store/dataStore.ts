import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, Product, KPIData, Activity, Customer, SalesDataPoint, ProductCategory, CartItem, NewOrderData } from '@/types';

const ORDERS_CACHE_KEY = '@lkscale_orders';
const PRODUCTS_CACHE_KEY = '@lkscale_products';
const CUSTOMERS_CACHE_KEY = '@lkscale_customers';
const KPI_CACHE_KEY = '@lkscale_kpi';
const ACTIVITIES_CACHE_KEY = '@lkscale_activities';
const LAST_SYNC_KEY = '@lkscale_last_sync';

// Generate price/stock history data
const generatePriceHistory = (basePrice: number) => {
  const history = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    const variation = (Math.random() - 0.5) * 0.1;
    history.push({
      date: date.toISOString(),
      price: Math.round(basePrice * (1 + variation)),
    });
  }
  return history;
};

const generateStockHistory = (currentStock: number) => {
  const history = [];
  const now = new Date();
  const reasons: Array<'sale' | 'restock' | 'adjustment' | 'return'> = ['sale', 'restock', 'adjustment', 'return'];
  let stock = currentStock + Math.floor(Math.random() * 50);

  for (let i = 13; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    const change = reason === 'sale' ? -Math.floor(Math.random() * 10 + 1) :
                   reason === 'restock' ? Math.floor(Math.random() * 30 + 10) :
                   reason === 'return' ? Math.floor(Math.random() * 3 + 1) :
                   Math.floor(Math.random() * 5) - 2;
    stock = Math.max(0, stock + change);
    history.push({
      date: date.toISOString(),
      stock,
      change,
      reason,
    });
  }
  return history;
};

// Mock Customers
export const mockCustomers: Customer[] = [
  {
    id: 'c1',
    name: 'Иван Петров',
    phone: '+7 (999) 111-22-33',
    email: 'ivan@example.com',
    address: 'г. Москва, ул. Ленина, д. 15',
    totalOrders: 5,
    totalSpent: 45680,
    createdAt: '2024-08-15T10:00:00Z',
  },
  {
    id: 'c2',
    name: 'Анна Сидорова',
    phone: '+7 (999) 444-55-66',
    email: 'anna@example.com',
    address: 'г. Санкт-Петербург, пр. Невский, д. 100',
    totalOrders: 3,
    totalSpent: 28500,
    createdAt: '2024-10-20T14:30:00Z',
  },
  {
    id: 'c3',
    name: 'Сергей Козлов',
    phone: '+7 (999) 777-88-99',
    email: 'sergey@example.com',
    address: 'г. Казань, ул. Баумана, д. 50',
    totalOrders: 8,
    totalSpent: 89200,
    createdAt: '2024-06-10T09:15:00Z',
  },
  {
    id: 'c4',
    name: 'Мария Иванова',
    phone: '+7 (999) 222-33-44',
    email: 'maria@example.com',
    address: 'г. Екатеринбург, ул. Мира, д. 20',
    totalOrders: 2,
    totalSpent: 12000,
    createdAt: '2025-01-05T16:45:00Z',
  },
  {
    id: 'c5',
    name: 'Алексей Новиков',
    phone: '+7 (999) 555-66-77',
    email: 'alexey@example.com',
    address: 'г. Новосибирск, ул. Красный проспект, д. 25',
    totalOrders: 12,
    totalSpent: 156400,
    createdAt: '2024-03-22T11:00:00Z',
  },
];

// Mock Categories
export const mockCategories: ProductCategory[] = [
  { id: 'cat1', name: 'Электроника', icon: 'hardware-chip', color: '#2c7be5', productCount: 2 },
  { id: 'cat2', name: 'Аксессуары', icon: 'headset', color: '#00d97e', productCount: 2 },
  { id: 'cat3', name: 'Премиум', icon: 'diamond', color: '#f6c343', productCount: 1 },
  { id: 'cat4', name: 'Новинки', icon: 'sparkles', color: '#e63757', productCount: 1 },
  { id: 'cat5', name: 'Акции', icon: 'pricetag', color: '#6b7c93', productCount: 1 },
];

// Mock Data
export const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2025-001',
    status: 'completed',
    totalAmount: 15420.00,
    itemsCount: 3,
    createdAt: '2025-02-05T10:30:00Z',
    updatedAt: '2025-02-05T14:00:00Z',
    customerId: 'c1',
    customer: {
      name: 'Иван Петров',
      phone: '+7 (999) 111-22-33',
      address: 'г. Москва, ул. Ленина, д. 15',
    },
    items: [
      { id: '1', productId: 'p1', productName: 'Товар А', quantity: 2, price: 5000, sku: 'SKU-001' },
      { id: '2', productId: 'p2', productName: 'Товар Б', quantity: 1, price: 5420, sku: 'SKU-002' },
    ],
    notes: 'Доставка до двери',
    paymentMethod: 'card',
  },
  {
    id: '2',
    orderNumber: 'ORD-2025-002',
    status: 'processing',
    totalAmount: 8750.00,
    itemsCount: 2,
    createdAt: '2025-02-05T11:45:00Z',
    updatedAt: '2025-02-05T11:45:00Z',
    customerId: 'c2',
    customer: {
      name: 'Анна Сидорова',
      phone: '+7 (999) 444-55-66',
      address: 'г. Санкт-Петербург, пр. Невский, д. 100',
    },
    items: [
      { id: '3', productId: 'p3', productName: 'Товар В', quantity: 1, price: 3750, sku: 'SKU-003' },
      { id: '4', productId: 'p4', productName: 'Товар Г', quantity: 1, price: 5000, sku: 'SKU-004' },
    ],
    paymentMethod: 'online',
  },
  {
    id: '3',
    orderNumber: 'ORD-2025-003',
    status: 'pending',
    totalAmount: 22100.00,
    itemsCount: 5,
    createdAt: '2025-02-05T09:00:00Z',
    updatedAt: '2025-02-05T09:00:00Z',
    customerId: 'c3',
    customer: {
      name: 'Сергей Козлов',
      phone: '+7 (999) 777-88-99',
      address: 'г. Казань, ул. Баумана, д. 50',
    },
    items: [
      { id: '5', productId: 'p1', productName: 'Товар А', quantity: 3, price: 5000, sku: 'SKU-001' },
      { id: '6', productId: 'p5', productName: 'Товар Д', quantity: 2, price: 3550, sku: 'SKU-005' },
    ],
    paymentMethod: 'cash',
  },
  {
    id: '4',
    orderNumber: 'ORD-2025-004',
    status: 'cancelled',
    totalAmount: 4500.00,
    itemsCount: 1,
    createdAt: '2025-02-04T16:20:00Z',
    updatedAt: '2025-02-04T18:00:00Z',
    customerId: 'c4',
    customer: {
      name: 'Мария Иванова',
      phone: '+7 (999) 222-33-44',
    },
    items: [
      { id: '7', productId: 'p2', productName: 'Товар Б', quantity: 1, price: 4500, sku: 'SKU-002' },
    ],
    notes: 'Отменено по просьбе клиента',
    paymentMethod: 'transfer',
  },
  {
    id: '5',
    orderNumber: 'ORD-2025-005',
    status: 'completed',
    totalAmount: 31200.00,
    itemsCount: 4,
    createdAt: '2025-02-04T12:00:00Z',
    updatedAt: '2025-02-04T15:30:00Z',
    customerId: 'c5',
    customer: {
      name: 'Алексей Новиков',
      phone: '+7 (999) 555-66-77',
      address: 'г. Новосибирск, ул. Красный проспект, д. 25',
    },
    items: [
      { id: '8', productId: 'p1', productName: 'Товар А', quantity: 4, price: 5000, sku: 'SKU-001' },
      { id: '9', productId: 'p3', productName: 'Товар В', quantity: 2, price: 3750, sku: 'SKU-003' },
      { id: '10', productId: 'p6', productName: 'Товар Е', quantity: 1, price: 3700, sku: 'SKU-006' },
    ],
    paymentMethod: 'card',
  },
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Товар А - Премиум',
    sku: 'SKU-001',
    barcode: '4601234567890',
    price: 5000,
    stock: 45,
    category: 'Электроника',
    categoryId: 'cat1',
    description: 'Высококачественный товар категории А',
    minStock: 10,
    isActive: true,
    priceHistory: generatePriceHistory(5000),
    stockHistory: generateStockHistory(45),
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2025-02-05T12:00:00Z',
  },
  {
    id: 'p2',
    name: 'Товар Б - Стандарт',
    sku: 'SKU-002',
    barcode: '4601234567891',
    price: 5420,
    stock: 8,
    category: 'Электроника',
    categoryId: 'cat1',
    description: 'Стандартный товар категории Б',
    minStock: 15,
    isActive: true,
    priceHistory: generatePriceHistory(5420),
    stockHistory: generateStockHistory(8),
    createdAt: '2024-07-15T14:00:00Z',
    updatedAt: '2025-02-04T10:00:00Z',
  },
  {
    id: 'p3',
    name: 'Товар В - Базовый',
    sku: 'SKU-003',
    barcode: '4601234567892',
    price: 3750,
    stock: 120,
    category: 'Аксессуары',
    categoryId: 'cat2',
    description: 'Базовый товар с отличными характеристиками',
    minStock: 20,
    isActive: true,
    priceHistory: generatePriceHistory(3750),
    stockHistory: generateStockHistory(120),
    createdAt: '2024-05-20T09:00:00Z',
    updatedAt: '2025-02-03T16:00:00Z',
  },
  {
    id: 'p4',
    name: 'Товар Г - Эксклюзив',
    sku: 'SKU-004',
    barcode: '4601234567893',
    price: 12500,
    stock: 5,
    category: 'Премиум',
    categoryId: 'cat3',
    description: 'Эксклюзивный товар ограниченной серии',
    minStock: 5,
    isActive: true,
    priceHistory: generatePriceHistory(12500),
    stockHistory: generateStockHistory(5),
    createdAt: '2024-09-01T11:00:00Z',
    updatedAt: '2025-02-02T14:00:00Z',
  },
  {
    id: 'p5',
    name: 'Товар Д - Популярный',
    sku: 'SKU-005',
    barcode: '4601234567894',
    price: 3550,
    stock: 3,
    category: 'Аксессуары',
    categoryId: 'cat2',
    description: 'Один из самых популярных товаров',
    minStock: 25,
    isActive: true,
    priceHistory: generatePriceHistory(3550),
    stockHistory: generateStockHistory(3),
    createdAt: '2024-08-10T13:00:00Z',
    updatedAt: '2025-02-01T09:00:00Z',
  },
  {
    id: 'p6',
    name: 'Товар Е - Новинка',
    sku: 'SKU-006',
    barcode: '4601234567895',
    price: 3700,
    stock: 60,
    category: 'Новинки',
    categoryId: 'cat4',
    description: 'Новинка сезона с улучшенными характеристиками',
    minStock: 10,
    isActive: true,
    priceHistory: generatePriceHistory(3700),
    stockHistory: generateStockHistory(60),
    createdAt: '2025-01-15T15:00:00Z',
    updatedAt: '2025-02-05T11:00:00Z',
  },
  {
    id: 'p7',
    name: 'Товар Ж - Акция',
    sku: 'SKU-007',
    barcode: '4601234567896',
    price: 2990,
    stock: 0,
    category: 'Акции',
    categoryId: 'cat5',
    description: 'Товар по специальной цене',
    minStock: 30,
    isActive: false,
    priceHistory: generatePriceHistory(2990),
    stockHistory: generateStockHistory(0),
    createdAt: '2024-11-01T10:00:00Z',
    updatedAt: '2025-01-25T08:00:00Z',
  },
];

export const mockKPI: KPIData = {
  totalSales: 245680.50,
  salesChange: 12.5,
  activeOrders: 15,
  ordersChange: -3.2,
  balance: 125840.50,
  balanceChange: 8.7,
  lowStockItems: 3,
};

// Generate weekly/monthly sales data
export const generateSalesData = (period: 'week' | 'month'): SalesDataPoint[] => {
  const data: SalesDataPoint[] = [];
  const now = new Date();
  const days = period === 'week' ? 7 : 30;
  const labels = period === 'week'
    ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    : [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const baseSales = isWeekend ? 25000 : 35000;
    const salesVariation = (Math.random() - 0.3) * baseSales * 0.5;
    const sales = Math.max(5000, Math.round(baseSales + salesVariation));

    const baseOrders = isWeekend ? 3 : 5;
    const orders = Math.max(1, Math.round(baseOrders + (Math.random() - 0.5) * 3));

    data.push({
      date: date.toISOString(),
      label: period === 'week' ? labels[i % 7] : `${date.getDate()}`,
      sales,
      orders,
    });
  }

  return data;
};

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'order_completed',
    title: 'Заказ выполнен',
    description: 'Заказ ORD-2025-001 успешно доставлен',
    timestamp: '2025-02-05T14:00:00Z',
  },
  {
    id: '2',
    type: 'order_created',
    title: 'Новый заказ',
    description: 'Получен заказ ORD-2025-002 на сумму 8 750 ₽',
    timestamp: '2025-02-05T11:45:00Z',
  },
  {
    id: '3',
    type: 'stock_low',
    title: 'Низкий остаток',
    description: 'Товар Д - осталось 3 шт.',
    timestamp: '2025-02-05T10:00:00Z',
  },
  {
    id: '4',
    type: 'payment_received',
    title: 'Оплата получена',
    description: 'Получена оплата по заказу ORD-2025-005',
    timestamp: '2025-02-04T15:30:00Z',
  },
  {
    id: '5',
    type: 'order_created',
    title: 'Новый заказ',
    description: 'Получен заказ ORD-2025-003 на сумму 22 100 ₽',
    timestamp: '2025-02-05T09:00:00Z',
  },
];

// Store state
type Listener = () => void;
const listeners: Set<Listener> = new Set();

interface DataState {
  orders: Order[];
  products: Product[];
  customers: Customer[];
  categories: ProductCategory[];
  kpi: KPIData | null;
  activities: Activity[];
  salesData: {
    week: SalesDataPoint[];
    month: SalesDataPoint[];
  };
  isLoading: boolean;
  lastSync: string | null;
  isOffline: boolean;
}

let dataState: DataState = {
  orders: [],
  products: [],
  customers: [],
  categories: [],
  kpi: null,
  activities: [],
  salesData: {
    week: [],
    month: [],
  },
  isLoading: true,
  lastSync: null,
  isOffline: false,
};

export const getDataState = () => dataState;

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

export const subscribeData = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const setDataState = (updates: Partial<DataState>) => {
  dataState = { ...dataState, ...updates };
  notifyListeners();
};

// Cache functions
export const cacheData = async () => {
  try {
    await Promise.all([
      AsyncStorage.setItem(ORDERS_CACHE_KEY, JSON.stringify(dataState.orders)),
      AsyncStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(dataState.products)),
      AsyncStorage.setItem(CUSTOMERS_CACHE_KEY, JSON.stringify(dataState.customers)),
      AsyncStorage.setItem(KPI_CACHE_KEY, JSON.stringify(dataState.kpi)),
      AsyncStorage.setItem(ACTIVITIES_CACHE_KEY, JSON.stringify(dataState.activities)),
      AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString()),
    ]);
  } catch (error) {
    console.error('Error caching data:', error);
  }
};

export const loadCachedData = async () => {
  try {
    const [orders, products, customers, kpi, activities, lastSync] = await Promise.all([
      AsyncStorage.getItem(ORDERS_CACHE_KEY),
      AsyncStorage.getItem(PRODUCTS_CACHE_KEY),
      AsyncStorage.getItem(CUSTOMERS_CACHE_KEY),
      AsyncStorage.getItem(KPI_CACHE_KEY),
      AsyncStorage.getItem(ACTIVITIES_CACHE_KEY),
      AsyncStorage.getItem(LAST_SYNC_KEY),
    ]);

    setDataState({
      orders: orders ? JSON.parse(orders) : [],
      products: products ? JSON.parse(products) : [],
      customers: customers ? JSON.parse(customers) : [],
      categories: mockCategories,
      kpi: kpi ? JSON.parse(kpi) : null,
      activities: activities ? JSON.parse(activities) : [],
      salesData: {
        week: generateSalesData('week'),
        month: generateSalesData('month'),
      },
      lastSync,
      isLoading: false,
      isOffline: true,
    });

    return true;
  } catch (error) {
    console.error('Error loading cached data:', error);
    return false;
  }
};

// Fetch functions (simulating API calls)
export const fetchData = async () => {
  setDataState({ isLoading: true });

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    setDataState({
      orders: mockOrders,
      products: mockProducts,
      customers: mockCustomers,
      categories: mockCategories,
      kpi: mockKPI,
      activities: mockActivities,
      salesData: {
        week: generateSalesData('week'),
        month: generateSalesData('month'),
      },
      isLoading: false,
      lastSync: new Date().toISOString(),
      isOffline: false,
    });

    await cacheData();
  } catch (error) {
    console.error('Error fetching data:', error);
    // Try to load cached data
    const hasCached = await loadCachedData();
    if (!hasCached) {
      setDataState({ isLoading: false });
    }
  }
};

export const refreshOrders = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockOrders;
};

export const refreshProducts = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockProducts;
};

export const getOrderById = (id: string): Order | undefined => {
  return dataState.orders.find((order) => order.id === id);
};

export const getOrderByNumber = (orderNumber: string): Order | undefined => {
  return dataState.orders.find((order) =>
    order.orderNumber.toLowerCase() === orderNumber.toLowerCase()
  );
};

export const getProductById = (id: string): Product | undefined => {
  return dataState.products.find((product) => product.id === id);
};

export const getProductByBarcode = (barcode: string): Product | undefined => {
  return dataState.products.find((product) => product.barcode === barcode);
};

export const getProductBySku = (sku: string): Product | undefined => {
  return dataState.products.find((product) =>
    product.sku.toLowerCase() === sku.toLowerCase()
  );
};

export const getCustomerById = (id: string): Customer | undefined => {
  return dataState.customers.find((customer) => customer.id === id);
};

export const searchOrders = (query: string, statusFilter?: string): Order[] => {
  let filtered = dataState.orders;

  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(lowerQuery) ||
        order.customer?.name.toLowerCase().includes(lowerQuery)
    );
  }

  if (statusFilter && statusFilter !== 'all') {
    filtered = filtered.filter((order) => order.status === statusFilter);
  }

  return filtered;
};

export const searchProducts = (query: string, categoryFilter?: string): Product[] => {
  let filtered = dataState.products;

  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.sku.toLowerCase().includes(lowerQuery) ||
        (product.barcode && product.barcode.includes(query))
    );
  }

  if (categoryFilter && categoryFilter !== 'all') {
    filtered = filtered.filter((product) => product.category === categoryFilter);
  }

  return filtered;
};

export const searchCustomers = (query: string): Customer[] => {
  if (!query) return dataState.customers;

  const lowerQuery = query.toLowerCase();
  return dataState.customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(lowerQuery) ||
      (customer.phone && customer.phone.includes(query)) ||
      (customer.email && customer.email.toLowerCase().includes(lowerQuery))
  );
};

export const getCategories = (): string[] => {
  const categories = new Set(dataState.products.map((p) => p.category));
  return ['all', ...Array.from(categories)];
};

export const getLowStockProducts = (): Product[] => {
  return dataState.products.filter((p) => p.stock <= p.minStock);
};

// Product editing functions
export const updateProduct = async (productId: string, updates: Partial<Product>): Promise<Product | null> => {
  const index = dataState.products.findIndex((p) => p.id === productId);
  if (index === -1) return null;

  const currentProduct = dataState.products[index];
  const updatedProduct: Product = {
    ...currentProduct,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // If price changed, add to price history
  if (updates.price && updates.price !== currentProduct.price) {
    updatedProduct.priceHistory = [
      ...(currentProduct.priceHistory || []),
      { date: new Date().toISOString(), price: updates.price },
    ];
  }

  // If stock changed, add to stock history
  if (updates.stock !== undefined && updates.stock !== currentProduct.stock) {
    const change = updates.stock - currentProduct.stock;
    updatedProduct.stockHistory = [
      ...(currentProduct.stockHistory || []),
      {
        date: new Date().toISOString(),
        stock: updates.stock,
        change,
        reason: change > 0 ? 'restock' : 'adjustment',
      },
    ];
  }

  const newProducts = [...dataState.products];
  newProducts[index] = updatedProduct;

  setDataState({ products: newProducts });
  await cacheData();

  return updatedProduct;
};

// Order creation
export const createOrder = async (orderData: NewOrderData): Promise<Order> => {
  const newOrderNumber = `ORD-2025-${String(dataState.orders.length + 1).padStart(3, '0')}`;
  const totalAmount = orderData.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const newOrder: Order = {
    id: `order-${Date.now()}`,
    orderNumber: newOrderNumber,
    status: 'pending',
    totalAmount,
    itemsCount: orderData.items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customerId: orderData.customerId,
    customer: orderData.customer,
    items: orderData.items.map((item, index) => ({
      id: `item-${Date.now()}-${index}`,
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      sku: item.product.sku,
    })),
    notes: orderData.notes,
    paymentMethod: orderData.paymentMethod,
  };

  // Update stock for each product
  for (const item of orderData.items) {
    await updateProduct(item.product.id, {
      stock: Math.max(0, item.product.stock - item.quantity),
    });
  }

  const newOrders = [newOrder, ...dataState.orders];
  const newActivities: Activity[] = [
    {
      id: `activity-${Date.now()}`,
      type: 'order_created',
      title: 'Новый заказ',
      description: `Создан заказ ${newOrderNumber} на сумму ${totalAmount.toLocaleString('ru-RU')} ₽`,
      timestamp: new Date().toISOString(),
    },
    ...dataState.activities,
  ];

  setDataState({
    orders: newOrders,
    activities: newActivities,
    kpi: dataState.kpi
      ? {
          ...dataState.kpi,
          activeOrders: dataState.kpi.activeOrders + 1,
        }
      : null,
  });

  await cacheData();
  return newOrder;
};

// Get business summary for AI
export const getBusinessSummary = () => {
  const { orders, products, kpi, salesData, customers } = dataState;

  const completedOrders = orders.filter((o) => o.status === 'completed');
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  const topProducts = products
    .map((p) => {
      const orderItems = orders.flatMap((o) => o.items).filter((i) => i.productId === p.id);
      const totalSold = orderItems.reduce((sum, i) => sum + i.quantity, 0);
      const revenue = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      return { product: p, totalSold, revenue };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const weekSales = salesData.week.reduce((sum, d) => sum + d.sales, 0);
  const monthSales = salesData.month.reduce((sum, d) => sum + d.sales, 0);

  return {
    kpi,
    totalOrders: orders.length,
    completedOrders: completedOrders.length,
    pendingOrders: pendingOrders.length,
    totalProducts: products.length,
    lowStockProducts: lowStockProducts.map((p) => ({ name: p.name, stock: p.stock, minStock: p.minStock })),
    totalCustomers: customers.length,
    topProducts: topProducts.map((t) => ({ name: t.product.name, sold: t.totalSold, revenue: t.revenue })),
    weekSales,
    monthSales,
    avgOrderValue: completedOrders.length > 0
      ? completedOrders.reduce((sum, o) => sum + o.totalAmount, 0) / completedOrders.length
      : 0,
  };
};
