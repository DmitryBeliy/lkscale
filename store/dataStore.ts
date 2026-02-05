import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, Product, KPIData, Activity } from '@/types';

const ORDERS_CACHE_KEY = '@lkscale_orders';
const PRODUCTS_CACHE_KEY = '@lkscale_products';
const KPI_CACHE_KEY = '@lkscale_kpi';
const ACTIVITIES_CACHE_KEY = '@lkscale_activities';
const LAST_SYNC_KEY = '@lkscale_last_sync';

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
  },
  {
    id: '2',
    orderNumber: 'ORD-2025-002',
    status: 'processing',
    totalAmount: 8750.00,
    itemsCount: 2,
    createdAt: '2025-02-05T11:45:00Z',
    updatedAt: '2025-02-05T11:45:00Z',
    customer: {
      name: 'Анна Сидорова',
      phone: '+7 (999) 444-55-66',
      address: 'г. Санкт-Петербург, пр. Невский, д. 100',
    },
    items: [
      { id: '3', productId: 'p3', productName: 'Товар В', quantity: 1, price: 3750, sku: 'SKU-003' },
      { id: '4', productId: 'p4', productName: 'Товар Г', quantity: 1, price: 5000, sku: 'SKU-004' },
    ],
  },
  {
    id: '3',
    orderNumber: 'ORD-2025-003',
    status: 'pending',
    totalAmount: 22100.00,
    itemsCount: 5,
    createdAt: '2025-02-05T09:00:00Z',
    updatedAt: '2025-02-05T09:00:00Z',
    customer: {
      name: 'Сергей Козлов',
      phone: '+7 (999) 777-88-99',
      address: 'г. Казань, ул. Баумана, д. 50',
    },
    items: [
      { id: '5', productId: 'p1', productName: 'Товар А', quantity: 3, price: 5000, sku: 'SKU-001' },
      { id: '6', productId: 'p5', productName: 'Товар Д', quantity: 2, price: 3550, sku: 'SKU-005' },
    ],
  },
  {
    id: '4',
    orderNumber: 'ORD-2025-004',
    status: 'cancelled',
    totalAmount: 4500.00,
    itemsCount: 1,
    createdAt: '2025-02-04T16:20:00Z',
    updatedAt: '2025-02-04T18:00:00Z',
    customer: {
      name: 'Мария Иванова',
      phone: '+7 (999) 222-33-44',
    },
    items: [
      { id: '7', productId: 'p2', productName: 'Товар Б', quantity: 1, price: 4500, sku: 'SKU-002' },
    ],
    notes: 'Отменено по просьбе клиента',
  },
  {
    id: '5',
    orderNumber: 'ORD-2025-005',
    status: 'completed',
    totalAmount: 31200.00,
    itemsCount: 4,
    createdAt: '2025-02-04T12:00:00Z',
    updatedAt: '2025-02-04T15:30:00Z',
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
  },
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Товар А - Премиум',
    sku: 'SKU-001',
    price: 5000,
    stock: 45,
    category: 'Электроника',
    description: 'Высококачественный товар категории А',
    minStock: 10,
    isActive: true,
  },
  {
    id: 'p2',
    name: 'Товар Б - Стандарт',
    sku: 'SKU-002',
    price: 5420,
    stock: 8,
    category: 'Электроника',
    description: 'Стандартный товар категории Б',
    minStock: 15,
    isActive: true,
  },
  {
    id: 'p3',
    name: 'Товар В - Базовый',
    sku: 'SKU-003',
    price: 3750,
    stock: 120,
    category: 'Аксессуары',
    description: 'Базовый товар с отличными характеристиками',
    minStock: 20,
    isActive: true,
  },
  {
    id: 'p4',
    name: 'Товар Г - Эксклюзив',
    sku: 'SKU-004',
    price: 12500,
    stock: 5,
    category: 'Премиум',
    description: 'Эксклюзивный товар ограниченной серии',
    minStock: 5,
    isActive: true,
  },
  {
    id: 'p5',
    name: 'Товар Д - Популярный',
    sku: 'SKU-005',
    price: 3550,
    stock: 3,
    category: 'Аксессуары',
    description: 'Один из самых популярных товаров',
    minStock: 25,
    isActive: true,
  },
  {
    id: 'p6',
    name: 'Товар Е - Новинка',
    sku: 'SKU-006',
    price: 3700,
    stock: 60,
    category: 'Новинки',
    description: 'Новинка сезона с улучшенными характеристиками',
    minStock: 10,
    isActive: true,
  },
  {
    id: 'p7',
    name: 'Товар Ж - Акция',
    sku: 'SKU-007',
    price: 2990,
    stock: 0,
    category: 'Акции',
    description: 'Товар по специальной цене',
    minStock: 30,
    isActive: false,
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
  kpi: KPIData | null;
  activities: Activity[];
  isLoading: boolean;
  lastSync: string | null;
  isOffline: boolean;
}

let dataState: DataState = {
  orders: [],
  products: [],
  kpi: null,
  activities: [],
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
    const [orders, products, kpi, activities, lastSync] = await Promise.all([
      AsyncStorage.getItem(ORDERS_CACHE_KEY),
      AsyncStorage.getItem(PRODUCTS_CACHE_KEY),
      AsyncStorage.getItem(KPI_CACHE_KEY),
      AsyncStorage.getItem(ACTIVITIES_CACHE_KEY),
      AsyncStorage.getItem(LAST_SYNC_KEY),
    ]);

    setDataState({
      orders: orders ? JSON.parse(orders) : [],
      products: products ? JSON.parse(products) : [],
      kpi: kpi ? JSON.parse(kpi) : null,
      activities: activities ? JSON.parse(activities) : [],
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
      kpi: mockKPI,
      activities: mockActivities,
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
  // Simulate refresh
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockOrders;
};

export const refreshProducts = async () => {
  // Simulate refresh
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockProducts;
};

export const getOrderById = (id: string): Order | undefined => {
  return dataState.orders.find((order) => order.id === id);
};

export const getProductById = (id: string): Product | undefined => {
  return dataState.products.find((product) => product.id === id);
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
        product.sku.toLowerCase().includes(lowerQuery)
    );
  }

  if (categoryFilter && categoryFilter !== 'all') {
    filtered = filtered.filter((product) => product.category === categoryFilter);
  }

  return filtered;
};

export const getCategories = (): string[] => {
  const categories = new Set(dataState.products.map((p) => p.category));
  return ['all', ...Array.from(categories)];
};

export const getLowStockProducts = (): Product[] => {
  return dataState.products.filter((p) => p.stock <= p.minStock);
};
