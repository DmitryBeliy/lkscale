import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Order, Product, KPIData, Activity, Customer, SalesDataPoint, ProductCategory, CartItem, NewOrderData, ProductVariant, ProductWithVariants } from '@/types';
import {
  fetchProducts as fetchProductsFromDb,
  fetchCustomers as fetchCustomersFromDb,
  fetchOrders as fetchOrdersFromDb,
  createProduct as createProductInSupabase,
  updateProductInDb,
  deleteProductFromDb,
  createCustomer as createCustomerInSupabase,
  updateCustomerInDb,
  deleteCustomerFromDb,
  createOrderInDb,
  updateOrderInDb,
  subscribeToProducts,
  subscribeToCustomers,
  subscribeToOrders,
  unsubscribeAll,
  generateOrderNumber,
  calculateRevenueForPeriod,
  calculateProfitForPeriod,
} from '@/lib/supabaseDataService';
import { getCurrentUserId } from '@/store/authStore';

const ORDERS_CACHE_KEY = '@lkscale_orders';
const PRODUCTS_CACHE_KEY = '@lkscale_products';
const CUSTOMERS_CACHE_KEY = '@lkscale_customers';
const KPI_CACHE_KEY = '@lkscale_kpi';
const ACTIVITIES_CACHE_KEY = '@lkscale_activities';
const LAST_SYNC_KEY = '@lkscale_last_sync';
const VARIANTS_CACHE_KEY = '@lkscale_variants';

// Realtime subscription cleanup functions
let unsubProducts: (() => void) | null = null;
let unsubCustomers: (() => void) | null = null;
let unsubOrders: (() => void) | null = null;

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

// Mock Customers with enhanced CRM data
export const mockCustomers: Customer[] = [
  {
    id: 'c1',
    name: 'Иван Петров',
    phone: '+7 (999) 111-22-33',
    email: 'ivan.petrov@mail.ru',
    address: 'г. Москва, ул. Ленина, д. 15, кв. 42',
    company: 'ООО "ТехноМир"',
    notes: 'Предпочитает безналичную оплату',
    totalOrders: 15,
    totalSpent: 245680,
    lastOrderDate: '2025-02-03T14:30:00Z',
    averageCheck: 16378,
    topCategories: ['Электроника', 'Аксессуары'],
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2025-02-03T14:30:00Z',
  },
  {
    id: 'c2',
    name: 'Анна Сидорова',
    phone: '+7 (999) 444-55-66',
    email: 'anna.sidorova@yandex.ru',
    address: 'г. Санкт-Петербург, пр. Невский, д. 100, офис 512',
    company: 'ИП Сидорова А.В.',
    notes: 'VIP клиент, скидка 10%',
    totalOrders: 28,
    totalSpent: 528500,
    lastOrderDate: '2025-02-05T09:15:00Z',
    averageCheck: 18875,
    topCategories: ['Премиум', 'Электроника'],
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2025-02-05T09:15:00Z',
  },
  {
    id: 'c3',
    name: 'Сергей Козлов',
    phone: '+7 (999) 777-88-99',
    email: 'kozlov.sergey@gmail.com',
    address: 'г. Казань, ул. Баумана, д. 50',
    company: 'Розничный покупатель',
    totalOrders: 8,
    totalSpent: 89200,
    lastOrderDate: '2025-01-28T11:20:00Z',
    averageCheck: 11150,
    topCategories: ['Аксессуары', 'Новинки'],
    createdAt: '2024-06-10T09:15:00Z',
    updatedAt: '2025-01-28T11:20:00Z',
  },
  {
    id: 'c4',
    name: 'Мария Иванова',
    phone: '+7 (999) 222-33-44',
    email: 'maria.ivanova@inbox.ru',
    address: 'г. Екатеринбург, ул. Мира, д. 20, кв. 8',
    totalOrders: 2,
    totalSpent: 12000,
    lastOrderDate: '2025-01-15T16:45:00Z',
    averageCheck: 6000,
    topCategories: ['Акции'],
    createdAt: '2025-01-05T16:45:00Z',
    updatedAt: '2025-01-15T16:45:00Z',
  },
  {
    id: 'c5',
    name: 'Алексей Новиков',
    phone: '+7 (999) 555-66-77',
    email: 'novikov.alex@bk.ru',
    address: 'г. Новосибирск, ул. Красный проспект, д. 25',
    company: 'ООО "НовоТех"',
    notes: 'Оптовый покупатель, условия по договору',
    totalOrders: 42,
    totalSpent: 1256400,
    lastOrderDate: '2025-02-04T15:30:00Z',
    averageCheck: 29914,
    topCategories: ['Электроника', 'Премиум', 'Аксессуары'],
    createdAt: '2024-03-22T11:00:00Z',
    updatedAt: '2025-02-04T15:30:00Z',
  },
  {
    id: 'c6',
    name: 'Елена Морозова',
    phone: '+7 (999) 888-11-22',
    email: 'morozova.elena@rambler.ru',
    address: 'г. Краснодар, ул. Красная, д. 77',
    company: 'Салон "Электроника+"',
    totalOrders: 19,
    totalSpent: 387600,
    lastOrderDate: '2025-02-01T10:00:00Z',
    averageCheck: 20400,
    topCategories: ['Электроника', 'Новинки'],
    createdAt: '2024-05-12T08:00:00Z',
    updatedAt: '2025-02-01T10:00:00Z',
  },
  {
    id: 'c7',
    name: 'Дмитрий Волков',
    phone: '+7 (999) 333-44-55',
    email: 'dmitry.volkov@list.ru',
    address: 'г. Ростов-на-Дону, пр. Ворошиловский, д. 33',
    totalOrders: 5,
    totalSpent: 67500,
    lastOrderDate: '2024-12-20T13:45:00Z',
    averageCheck: 13500,
    topCategories: ['Аксессуары'],
    createdAt: '2024-09-01T12:00:00Z',
    updatedAt: '2024-12-20T13:45:00Z',
  },
  {
    id: 'c8',
    name: 'Ольга Кузнецова',
    phone: '+7 (999) 666-77-88',
    email: 'olga.kuznetsova@mail.ru',
    address: 'г. Самара, ул. Молодогвардейская, д. 15',
    company: 'ИП Кузнецова О.И.',
    notes: 'Предпочитает доставку курьером',
    totalOrders: 11,
    totalSpent: 198700,
    lastOrderDate: '2025-02-02T17:30:00Z',
    averageCheck: 18063,
    topCategories: ['Премиум', 'Электроника'],
    createdAt: '2024-07-18T14:00:00Z',
    updatedAt: '2025-02-02T17:30:00Z',
  },
  {
    id: 'c9',
    name: 'Николай Федоров',
    phone: '+7 (999) 999-00-11',
    email: 'fedorov.n@yandex.ru',
    address: 'г. Воронеж, ул. Плехановская, д. 45',
    totalOrders: 1,
    totalSpent: 5990,
    lastOrderDate: '2024-11-10T09:00:00Z',
    averageCheck: 5990,
    topCategories: ['Акции'],
    createdAt: '2024-11-10T09:00:00Z',
    updatedAt: '2024-11-10T09:00:00Z',
  },
  {
    id: 'c10',
    name: 'Татьяна Белова',
    phone: '+7 (999) 123-45-67',
    email: 'tatiana.belova@gmail.com',
    address: 'г. Уфа, ул. Ленина, д. 88',
    company: 'ООО "БелКом"',
    totalOrders: 25,
    totalSpent: 412300,
    lastOrderDate: '2025-02-05T11:00:00Z',
    averageCheck: 16492,
    topCategories: ['Электроника', 'Аксессуары', 'Новинки'],
    createdAt: '2024-02-14T10:30:00Z',
    updatedAt: '2025-02-05T11:00:00Z',
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

// Mock Data with real customer and product names
export const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2025-001',
    status: 'completed',
    totalAmount: 145970,
    itemsCount: 3,
    createdAt: '2025-02-05T10:30:00Z',
    updatedAt: '2025-02-05T14:00:00Z',
    customerId: 'c1',
    customer: {
      name: 'Иван Петров',
      phone: '+7 (999) 111-22-33',
      address: 'г. Москва, ул. Ленина, д. 15, кв. 42',
    },
    items: [
      { id: '1', productId: 'p1', productName: 'Смартфон Galaxy Pro X', quantity: 2, price: 45990, sku: 'SPH-GPX-001' },
      { id: '2', productId: 'p6', productName: 'Планшет TabPro 11', quantity: 1, price: 54990, sku: 'NEW-TP-006' },
    ],
    notes: 'Доставка до двери, позвонить за час',
    paymentMethod: 'card',
  },
  {
    id: '2',
    orderNumber: 'ORD-2025-002',
    status: 'processing',
    totalAmount: 122480,
    itemsCount: 3,
    createdAt: '2025-02-05T11:45:00Z',
    updatedAt: '2025-02-05T11:45:00Z',
    customerId: 'c2',
    customer: {
      name: 'Анна Сидорова',
      phone: '+7 (999) 444-55-66',
      address: 'г. Санкт-Петербург, пр. Невский, д. 100, офис 512',
    },
    items: [
      { id: '3', productId: 'p2', productName: 'Ноутбук TechBook Pro 15', quantity: 1, price: 89990, sku: 'NTB-TBP-002' },
      { id: '4', productId: 'p4', productName: 'Умные часы Elite Watch', quantity: 1, price: 32500, sku: 'PRE-EW-004' },
    ],
    paymentMethod: 'online',
  },
  {
    id: '3',
    orderNumber: 'ORD-2025-003',
    status: 'pending',
    totalAmount: 161950,
    itemsCount: 5,
    createdAt: '2025-02-05T09:00:00Z',
    updatedAt: '2025-02-05T09:00:00Z',
    customerId: 'c5',
    customer: {
      name: 'Алексей Новиков',
      phone: '+7 (999) 555-66-77',
      address: 'г. Новосибирск, ул. Красный проспект, д. 25',
    },
    items: [
      { id: '5', productId: 'p1', productName: 'Смартфон Galaxy Pro X', quantity: 2, price: 45990, sku: 'SPH-GPX-001' },
      { id: '6', productId: 'p6', productName: 'Планшет TabPro 11', quantity: 1, price: 54990, sku: 'NEW-TP-006' },
      { id: '7', productId: 'p3', productName: 'Беспроводные наушники SoundMax', quantity: 2, price: 7990, sku: 'ACC-SM-003' },
    ],
    paymentMethod: 'transfer',
    notes: 'Оптовый заказ по договору №125',
  },
  {
    id: '4',
    orderNumber: 'ORD-2025-004',
    status: 'cancelled',
    totalAmount: 5990,
    itemsCount: 1,
    createdAt: '2025-02-04T16:20:00Z',
    updatedAt: '2025-02-04T18:00:00Z',
    customerId: 'c4',
    customer: {
      name: 'Мария Иванова',
      phone: '+7 (999) 222-33-44',
      address: 'г. Екатеринбург, ул. Мира, д. 20, кв. 8',
    },
    items: [
      { id: '8', productId: 'p9', productName: 'Фитнес-браслет FitTrack', quantity: 1, price: 5990, sku: 'NEW-FT-009' },
    ],
    notes: 'Отменено по просьбе клиента - передумал',
    paymentMethod: 'card',
  },
  {
    id: '5',
    orderNumber: 'ORD-2025-005',
    status: 'completed',
    totalAmount: 189970,
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
      { id: '9', productId: 'p2', productName: 'Ноутбук TechBook Pro 15', quantity: 2, price: 89990, sku: 'NTB-TBP-002' },
      { id: '10', productId: 'p10', productName: 'Внешний SSD 1TB UltraSpeed', quantity: 1, price: 12990, sku: 'PRE-SSD-010' },
    ],
    paymentMethod: 'transfer',
  },
  {
    id: '6',
    orderNumber: 'ORD-2025-006',
    status: 'completed',
    totalAmount: 78470,
    itemsCount: 6,
    createdAt: '2025-02-03T10:15:00Z',
    updatedAt: '2025-02-03T16:00:00Z',
    customerId: 'c6',
    customer: {
      name: 'Елена Морозова',
      phone: '+7 (999) 888-11-22',
      address: 'г. Краснодар, ул. Красная, д. 77',
    },
    items: [
      { id: '11', productId: 'p1', productName: 'Смартфон Galaxy Pro X', quantity: 1, price: 45990, sku: 'SPH-GPX-001' },
      { id: '12', productId: 'p3', productName: 'Беспроводные наушники SoundMax', quantity: 2, price: 7990, sku: 'ACC-SM-003' },
      { id: '13', productId: 'p8', productName: 'Зарядное устройство FastCharge 65W', quantity: 3, price: 3490, sku: 'ACC-FC-008' },
      { id: '14', productId: 'p5', productName: 'Чехол Premium Leather', quantity: 2, price: 2990, sku: 'ACC-PL-005' },
    ],
    paymentMethod: 'card',
  },
  {
    id: '7',
    orderNumber: 'ORD-2025-007',
    status: 'processing',
    totalAmount: 45990,
    itemsCount: 1,
    createdAt: '2025-02-05T14:00:00Z',
    updatedAt: '2025-02-05T14:00:00Z',
    customerId: 'c10',
    customer: {
      name: 'Татьяна Белова',
      phone: '+7 (999) 123-45-67',
      address: 'г. Уфа, ул. Ленина, д. 88',
    },
    items: [
      { id: '15', productId: 'p1', productName: 'Смартфон Galaxy Pro X', quantity: 1, price: 45990, sku: 'SPH-GPX-001' },
    ],
    paymentMethod: 'online',
  },
  {
    id: '8',
    orderNumber: 'ORD-2025-008',
    status: 'completed',
    totalAmount: 54480,
    itemsCount: 3,
    createdAt: '2025-02-02T11:30:00Z',
    updatedAt: '2025-02-02T17:30:00Z',
    customerId: 'c8',
    customer: {
      name: 'Ольга Кузнецова',
      phone: '+7 (999) 666-77-88',
      address: 'г. Самара, ул. Молодогвардейская, д. 15',
    },
    items: [
      { id: '16', productId: 'p4', productName: 'Умные часы Elite Watch', quantity: 1, price: 32500, sku: 'PRE-EW-004' },
      { id: '17', productId: 'p3', productName: 'Беспроводные наушники SoundMax', quantity: 2, price: 7990, sku: 'ACC-SM-003' },
      { id: '18', productId: 'p9', productName: 'Фитнес-браслет FitTrack', quantity: 1, price: 5990, sku: 'NEW-FT-009' },
    ],
    paymentMethod: 'card',
    notes: 'Доставка курьером',
  },
  {
    id: '9',
    orderNumber: 'ORD-2025-009',
    status: 'pending',
    totalAmount: 23970,
    itemsCount: 2,
    createdAt: '2025-02-05T15:30:00Z',
    updatedAt: '2025-02-05T15:30:00Z',
    customerId: 'c3',
    customer: {
      name: 'Сергей Козлов',
      phone: '+7 (999) 777-88-99',
      address: 'г. Казань, ул. Баумана, д. 50',
    },
    items: [
      { id: '19', productId: 'p3', productName: 'Беспроводные наушники SoundMax', quantity: 2, price: 7990, sku: 'ACC-SM-003' },
      { id: '20', productId: 'p12', productName: 'Клавиатура MechPro RGB', quantity: 1, price: 7990, sku: 'SAL-KB-012' },
    ],
    paymentMethod: 'cash',
  },
  {
    id: '10',
    orderNumber: 'ORD-2025-010',
    status: 'completed',
    totalAmount: 96480,
    itemsCount: 2,
    createdAt: '2025-02-01T09:00:00Z',
    updatedAt: '2025-02-01T14:00:00Z',
    customerId: 'c6',
    customer: {
      name: 'Елена Морозова',
      phone: '+7 (999) 888-11-22',
      address: 'г. Краснодар, ул. Красная, д. 77',
    },
    items: [
      { id: '21', productId: 'p2', productName: 'Ноутбук TechBook Pro 15', quantity: 1, price: 89990, sku: 'NTB-TBP-002' },
      { id: '22', productId: 'p11', productName: 'Веб-камера HD Pro', quantity: 1, price: 6490, sku: 'ELC-WC-011' },
    ],
    paymentMethod: 'transfer',
  },
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Смартфон Galaxy Pro X',
    sku: 'SPH-GPX-001',
    barcode: '4601234567890',
    price: 45990,
    costPrice: 32000,
    stock: 45,
    category: 'Электроника',
    categoryId: 'cat1',
    description: 'Флагманский смартфон с AMOLED дисплеем 6.7", 256GB памяти, камера 108MP',
    minStock: 10,
    isActive: true,
    priceHistory: generatePriceHistory(45990),
    stockHistory: generateStockHistory(45),
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2025-02-05T12:00:00Z',
  },
  {
    id: 'p2',
    name: 'Ноутбук TechBook Pro 15',
    sku: 'NTB-TBP-002',
    barcode: '4601234567891',
    price: 89990,
    costPrice: 65000,
    stock: 8,
    category: 'Электроника',
    categoryId: 'cat1',
    description: 'Профессиональный ноутбук, Intel i7, 16GB RAM, 512GB SSD, дисплей 15.6"',
    minStock: 15,
    isActive: true,
    priceHistory: generatePriceHistory(89990),
    stockHistory: generateStockHistory(8),
    createdAt: '2024-07-15T14:00:00Z',
    updatedAt: '2025-02-04T10:00:00Z',
  },
  {
    id: 'p3',
    name: 'Беспроводные наушники SoundMax',
    sku: 'ACC-SM-003',
    barcode: '4601234567892',
    price: 7990,
    costPrice: 4200,
    stock: 120,
    category: 'Аксессуары',
    categoryId: 'cat2',
    description: 'TWS наушники с активным шумоподавлением, 30 часов работы',
    minStock: 20,
    isActive: true,
    priceHistory: generatePriceHistory(7990),
    stockHistory: generateStockHistory(120),
    createdAt: '2024-05-20T09:00:00Z',
    updatedAt: '2025-02-03T16:00:00Z',
  },
  {
    id: 'p4',
    name: 'Умные часы Elite Watch',
    sku: 'PRE-EW-004',
    barcode: '4601234567893',
    price: 32500,
    costPrice: 19500,
    stock: 5,
    category: 'Премиум',
    categoryId: 'cat3',
    description: 'Премиальные смарт-часы с сапфировым стеклом, титановый корпус',
    minStock: 5,
    isActive: true,
    priceHistory: generatePriceHistory(32500),
    stockHistory: generateStockHistory(5),
    createdAt: '2024-09-01T11:00:00Z',
    updatedAt: '2025-02-02T14:00:00Z',
  },
  {
    id: 'p5',
    name: 'Чехол Premium Leather',
    sku: 'ACC-PL-005',
    barcode: '4601234567894',
    price: 2990,
    costPrice: 890,
    stock: 3,
    category: 'Аксессуары',
    categoryId: 'cat2',
    description: 'Кожаный чехол ручной работы для смартфонов',
    minStock: 25,
    isActive: true,
    priceHistory: generatePriceHistory(2990),
    stockHistory: generateStockHistory(3),
    createdAt: '2024-08-10T13:00:00Z',
    updatedAt: '2025-02-01T09:00:00Z',
  },
  {
    id: 'p6',
    name: 'Планшет TabPro 11',
    sku: 'NEW-TP-006',
    barcode: '4601234567895',
    price: 54990,
    costPrice: 38000,
    stock: 60,
    category: 'Новинки',
    categoryId: 'cat4',
    description: 'Новый планшет с OLED дисплеем 11", стилус в комплекте',
    minStock: 10,
    isActive: true,
    priceHistory: generatePriceHistory(54990),
    stockHistory: generateStockHistory(60),
    createdAt: '2025-01-15T15:00:00Z',
    updatedAt: '2025-02-05T11:00:00Z',
  },
  {
    id: 'p7',
    name: 'Портативная колонка BassBox',
    sku: 'SAL-BB-007',
    barcode: '4601234567896',
    price: 4990,
    costPrice: 2100,
    stock: 0,
    category: 'Акции',
    categoryId: 'cat5',
    description: 'Портативная Bluetooth колонка, водозащита IPX7',
    minStock: 30,
    isActive: false,
    priceHistory: generatePriceHistory(4990),
    stockHistory: generateStockHistory(0),
    createdAt: '2024-11-01T10:00:00Z',
    updatedAt: '2025-01-25T08:00:00Z',
  },
  {
    id: 'p8',
    name: 'Зарядное устройство FastCharge 65W',
    sku: 'ACC-FC-008',
    barcode: '4601234567897',
    price: 3490,
    costPrice: 1450,
    stock: 85,
    category: 'Аксессуары',
    categoryId: 'cat2',
    description: 'Быстрая зарядка GaN, 3 порта USB-C + USB-A',
    minStock: 15,
    isActive: true,
    priceHistory: generatePriceHistory(3490),
    stockHistory: generateStockHistory(85),
    createdAt: '2024-10-01T09:00:00Z',
    updatedAt: '2025-02-04T15:00:00Z',
  },
  {
    id: 'p9',
    name: 'Фитнес-браслет FitTrack',
    sku: 'NEW-FT-009',
    barcode: '4601234567898',
    price: 5990,
    costPrice: 2800,
    stock: 42,
    category: 'Новинки',
    categoryId: 'cat4',
    description: 'Фитнес-трекер с пульсометром, SpO2, GPS',
    minStock: 10,
    isActive: true,
    priceHistory: generatePriceHistory(5990),
    stockHistory: generateStockHistory(42),
    createdAt: '2025-01-20T11:00:00Z',
    updatedAt: '2025-02-05T08:00:00Z',
  },
  {
    id: 'p10',
    name: 'Внешний SSD 1TB UltraSpeed',
    sku: 'PRE-SSD-010',
    barcode: '4601234567899',
    price: 12990,
    costPrice: 7800,
    stock: 25,
    category: 'Премиум',
    categoryId: 'cat3',
    description: 'Внешний SSD накопитель, скорость до 2000 МБ/с',
    minStock: 8,
    isActive: true,
    priceHistory: generatePriceHistory(12990),
    stockHistory: generateStockHistory(25),
    createdAt: '2024-08-15T10:00:00Z',
    updatedAt: '2025-02-03T14:00:00Z',
  },
  {
    id: 'p11',
    name: 'Веб-камера HD Pro',
    sku: 'ELC-WC-011',
    barcode: '4601234567900',
    price: 6490,
    costPrice: 3200,
    stock: 38,
    category: 'Электроника',
    categoryId: 'cat1',
    description: 'Веб-камера 4K, автофокус, встроенный микрофон',
    minStock: 12,
    isActive: true,
    priceHistory: generatePriceHistory(6490),
    stockHistory: generateStockHistory(38),
    createdAt: '2024-09-20T13:00:00Z',
    updatedAt: '2025-02-02T11:00:00Z',
  },
  {
    id: 'p12',
    name: 'Клавиатура MechPro RGB',
    sku: 'SAL-KB-012',
    barcode: '4601234567901',
    price: 7990,
    costPrice: 4500,
    stock: 18,
    category: 'Акции',
    categoryId: 'cat5',
    description: 'Механическая клавиатура с RGB подсветкой, Cherry MX Blue',
    minStock: 10,
    isActive: true,
    priceHistory: generatePriceHistory(7990),
    stockHistory: generateStockHistory(18),
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2025-02-01T16:00:00Z',
  },
];

// Mock Product Variants
export const mockVariants: ProductVariant[] = [
  // Variants for Product А (p1)
  {
    id: 'v1-1',
    productId: 'p1',
    name: 'Товар А - S Черный',
    sku: 'SKU-001-S-BLK',
    barcode: '4601234567890001',
    attributes: { size: 'S', color: 'Черный' },
    price: 5000,
    stock: 15,
    isActive: true,
  },
  {
    id: 'v1-2',
    productId: 'p1',
    name: 'Товар А - M Черный',
    sku: 'SKU-001-M-BLK',
    barcode: '4601234567890002',
    attributes: { size: 'M', color: 'Черный' },
    price: 5000,
    stock: 20,
    isActive: true,
  },
  {
    id: 'v1-3',
    productId: 'p1',
    name: 'Товар А - L Черный',
    sku: 'SKU-001-L-BLK',
    barcode: '4601234567890003',
    attributes: { size: 'L', color: 'Черный' },
    price: 5200,
    stock: 10,
    isActive: true,
  },
  {
    id: 'v1-4',
    productId: 'p1',
    name: 'Товар А - M Белый',
    sku: 'SKU-001-M-WHT',
    barcode: '4601234567890004',
    attributes: { size: 'M', color: 'Белый' },
    price: 5000,
    stock: 0,
    isActive: false,
  },
  // Variants for Product Б (p2)
  {
    id: 'v2-1',
    productId: 'p2',
    name: 'Товар Б - 64GB',
    sku: 'SKU-002-64',
    barcode: '4601234567891001',
    attributes: { size: '64GB' },
    price: 5420,
    stock: 5,
    isActive: true,
  },
  {
    id: 'v2-2',
    productId: 'p2',
    name: 'Товар Б - 128GB',
    sku: 'SKU-002-128',
    barcode: '4601234567891002',
    attributes: { size: '128GB' },
    price: 6420,
    stock: 3,
    isActive: true,
  },
  // Variants for Product Г (p4)
  {
    id: 'v4-1',
    productId: 'p4',
    name: 'Товар Г - Золото',
    sku: 'SKU-004-GLD',
    barcode: '4601234567893001',
    attributes: { color: 'Золото' },
    price: 12500,
    stock: 2,
    isActive: true,
  },
  {
    id: 'v4-2',
    productId: 'p4',
    name: 'Товар Г - Серебро',
    sku: 'SKU-004-SLV',
    barcode: '4601234567893002',
    attributes: { color: 'Серебро' },
    price: 12000,
    stock: 3,
    isActive: true,
  },
];

export const mockKPI: KPIData = {
  totalSales: 1245680,
  salesChange: 18.5,
  activeOrders: 4,
  ordersChange: 12.3,
  balance: 485840,
  balanceChange: 15.2,
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
    description: 'Заказ ORD-2025-001 (Иван Петров) успешно доставлен',
    timestamp: '2025-02-05T14:00:00Z',
  },
  {
    id: '2',
    type: 'order_created',
    title: 'Новый заказ',
    description: 'Получен заказ ORD-2025-007 от Татьяны Беловой на 45 990 ₽',
    timestamp: '2025-02-05T14:00:00Z',
  },
  {
    id: '3',
    type: 'order_created',
    title: 'Новый заказ',
    description: 'Получен заказ ORD-2025-002 от Анны Сидоровой на 122 480 ₽',
    timestamp: '2025-02-05T11:45:00Z',
  },
  {
    id: '4',
    type: 'stock_low',
    title: 'Низкий остаток',
    description: 'Чехол Premium Leather - осталось 3 шт. (мин. 25)',
    timestamp: '2025-02-05T10:00:00Z',
  },
  {
    id: '5',
    type: 'payment_received',
    title: 'Оплата получена',
    description: 'Получена оплата 189 970 ₽ по заказу ORD-2025-005',
    timestamp: '2025-02-04T15:30:00Z',
  },
  {
    id: '6',
    type: 'order_created',
    title: 'Оптовый заказ',
    description: 'Получен заказ ORD-2025-003 от Алексея Новикова на 161 950 ₽',
    timestamp: '2025-02-05T09:00:00Z',
  },
  {
    id: '7',
    type: 'stock_low',
    title: 'Критический остаток',
    description: 'Ноутбук TechBook Pro 15 - осталось 8 шт. (мин. 15)',
    timestamp: '2025-02-04T10:00:00Z',
  },
  {
    id: '8',
    type: 'order_completed',
    title: 'Заказ выполнен',
    description: 'Заказ ORD-2025-008 (Ольга Кузнецова) успешно доставлен',
    timestamp: '2025-02-02T17:30:00Z',
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
  variants: ProductVariant[];
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
  variants: [],
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
      AsyncStorage.setItem(VARIANTS_CACHE_KEY, JSON.stringify(dataState.variants)),
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
    const [orders, products, customers, variants, kpi, activities, lastSync] = await Promise.all([
      AsyncStorage.getItem(ORDERS_CACHE_KEY),
      AsyncStorage.getItem(PRODUCTS_CACHE_KEY),
      AsyncStorage.getItem(CUSTOMERS_CACHE_KEY),
      AsyncStorage.getItem(VARIANTS_CACHE_KEY),
      AsyncStorage.getItem(KPI_CACHE_KEY),
      AsyncStorage.getItem(ACTIVITIES_CACHE_KEY),
      AsyncStorage.getItem(LAST_SYNC_KEY),
    ]);

    setDataState({
      orders: orders ? JSON.parse(orders) : [],
      products: products ? JSON.parse(products) : [],
      customers: customers ? JSON.parse(customers) : [],
      categories: mockCategories,
      variants: variants ? JSON.parse(variants) : [],
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

// Initialize realtime subscriptions
const initRealtimeSubscriptions = () => {
  // Cleanup existing subscriptions
  if (unsubProducts) unsubProducts();
  if (unsubCustomers) unsubCustomers();
  if (unsubOrders) unsubOrders();

  // Subscribe to products changes
  unsubProducts = subscribeToProducts((event, product, _oldProduct) => {
    const currentProducts = [...dataState.products];

    if (event === 'INSERT') {
      // Check if product already exists
      if (!currentProducts.find(p => p.id === product.id)) {
        setDataState({ products: [product, ...currentProducts] });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else if (event === 'UPDATE') {
      const index = currentProducts.findIndex(p => p.id === product.id);
      if (index !== -1) {
        currentProducts[index] = product;
        setDataState({ products: currentProducts });
      }
    } else if (event === 'DELETE') {
      setDataState({ products: currentProducts.filter(p => p.id !== product.id) });
    }
  });

  // Subscribe to customers changes
  unsubCustomers = subscribeToCustomers((event, customer, _oldCustomer) => {
    const currentCustomers = [...dataState.customers];

    if (event === 'INSERT') {
      if (!currentCustomers.find(c => c.id === customer.id)) {
        setDataState({ customers: [customer, ...currentCustomers] });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else if (event === 'UPDATE') {
      const index = currentCustomers.findIndex(c => c.id === customer.id);
      if (index !== -1) {
        currentCustomers[index] = customer;
        setDataState({ customers: currentCustomers });
      }
    } else if (event === 'DELETE') {
      setDataState({ customers: currentCustomers.filter(c => c.id !== customer.id) });
    }
  });

  // Subscribe to orders changes
  unsubOrders = subscribeToOrders((event, order, _oldOrder) => {
    const currentOrders = [...dataState.orders];

    if (event === 'INSERT') {
      if (!currentOrders.find(o => o.id === order.id)) {
        setDataState({ orders: [order, ...currentOrders] });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else if (event === 'UPDATE') {
      const index = currentOrders.findIndex(o => o.id === order.id);
      if (index !== -1) {
        currentOrders[index] = order;
        setDataState({ orders: currentOrders });
      }
    } else if (event === 'DELETE') {
      setDataState({ orders: currentOrders.filter(o => o.id !== order.id) });
    }
  });
};

// Cleanup realtime subscriptions
export const cleanupRealtimeSubscriptions = () => {
  if (unsubProducts) unsubProducts();
  if (unsubCustomers) unsubCustomers();
  if (unsubOrders) unsubOrders();
  unsubProducts = null;
  unsubCustomers = null;
  unsubOrders = null;
  unsubscribeAll();
};

// Fetch functions - now using Supabase
export const fetchData = async () => {
  setDataState({ isLoading: true });

  const userId = getCurrentUserId();

  try {
    if (userId) {
      // Fetch from Supabase
      const [products, customers, orders] = await Promise.all([
        fetchProductsFromDb(),
        fetchCustomersFromDb(),
        fetchOrdersFromDb(),
      ]);

      // Calculate KPI from real data
      const completedOrders = orders.filter(o => o.status === 'completed');
      const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing');
      const lowStockProducts = products.filter(p => p.stock <= p.minStock);
      const totalSales = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      const kpi: KPIData = {
        totalSales,
        salesChange: 0, // Would need historical data to calculate
        activeOrders: pendingOrders.length,
        ordersChange: 0,
        balance: totalSales * 0.3, // Simplified profit estimate
        balanceChange: 0,
        lowStockItems: lowStockProducts.length,
      };

      setDataState({
        orders,
        products,
        customers,
        categories: mockCategories,
        variants: mockVariants,
        kpi,
        activities: generateActivitiesFromOrders(orders, products),
        salesData: {
          week: generateSalesData('week'),
          month: generateSalesData('month'),
        },
        isLoading: false,
        lastSync: new Date().toISOString(),
        isOffline: false,
      });

      // Initialize realtime subscriptions
      initRealtimeSubscriptions();

      await cacheData();
    } else {
      // Fallback to mock data if not authenticated
      setDataState({
        orders: mockOrders,
        products: mockProducts,
        customers: mockCustomers,
        categories: mockCategories,
        variants: mockVariants,
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
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    // Try to load cached data
    const hasCached = await loadCachedData();
    if (!hasCached) {
      // Fallback to mock data
      setDataState({
        orders: mockOrders,
        products: mockProducts,
        customers: mockCustomers,
        categories: mockCategories,
        variants: mockVariants,
        kpi: mockKPI,
        activities: mockActivities,
        salesData: {
          week: generateSalesData('week'),
          month: generateSalesData('month'),
        },
        isLoading: false,
        lastSync: null,
        isOffline: true,
      });
    }
  }
};

// Generate activities from orders
const generateActivitiesFromOrders = (orders: Order[], products: Product[]): Activity[] => {
  const activities: Activity[] = [];
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  // Add recent orders as activities
  orders.slice(0, 5).forEach((order, index) => {
    if (order.status === 'completed') {
      activities.push({
        id: `act-${order.id}-completed`,
        type: 'order_completed',
        title: 'Заказ выполнен',
        description: `Заказ ${order.orderNumber} ${order.customer?.name ? `(${order.customer.name})` : ''} успешно доставлен`,
        timestamp: order.updatedAt,
      });
    } else if (order.status === 'pending' || order.status === 'processing') {
      activities.push({
        id: `act-${order.id}-created`,
        type: 'order_created',
        title: 'Новый заказ',
        description: `Получен заказ ${order.orderNumber} на сумму ${order.totalAmount.toLocaleString('ru-RU')} ₽`,
        timestamp: order.createdAt,
      });
    }
  });

  // Add low stock alerts
  lowStockProducts.slice(0, 3).forEach((product) => {
    activities.push({
      id: `act-lowstock-${product.id}`,
      type: 'stock_low',
      title: 'Низкий остаток',
      description: `${product.name} - осталось ${product.stock} шт. (мин. ${product.minStock})`,
      timestamp: new Date().toISOString(),
    });
  });

  // Sort by timestamp
  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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

// Product editing functions - now using Supabase
export const updateProduct = async (productId: string, updates: Partial<Product>): Promise<Product | null> => {
  const userId = getCurrentUserId();

  // Try Supabase first
  if (userId) {
    const result = await updateProductInDb(productId, updates);
    if (result) {
      // Update local state
      const index = dataState.products.findIndex((p) => p.id === productId);
      if (index !== -1) {
        const newProducts = [...dataState.products];
        newProducts[index] = result;
        setDataState({ products: newProducts });
        await cacheData();
      }
      return result;
    }
  }

  // Fallback to local update
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

  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  return updatedProduct;
};

// Create new product - now using Supabase
export const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> => {
  const userId = getCurrentUserId();

  if (userId) {
    const result = await createProductInSupabase(productData);
    if (result) {
      setDataState({ products: [result, ...dataState.products] });
      await cacheData();
      return result;
    }
  }

  // Fallback to local creation
  const newProduct: Product = {
    id: `product-${Date.now()}`,
    ...productData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  setDataState({ products: [newProduct, ...dataState.products] });
  await cacheData();
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  return newProduct;
};

// Delete product - now using Supabase
export const deleteProduct = async (productId: string): Promise<boolean> => {
  const userId = getCurrentUserId();

  if (userId) {
    const success = await deleteProductFromDb(productId);
    if (success) {
      setDataState({ products: dataState.products.filter(p => p.id !== productId) });
      await cacheData();
      return true;
    }
  }

  // Fallback to local delete
  setDataState({ products: dataState.products.filter(p => p.id !== productId) });
  await cacheData();
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  return true;
};

// Customer CRUD operations - now using Supabase
export const createCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer | null> => {
  const userId = getCurrentUserId();

  if (userId) {
    const result = await createCustomerInSupabase(customerData);
    if (result) {
      setDataState({ customers: [result, ...dataState.customers] });
      await cacheData();
      return result;
    }
  }

  // Fallback to local creation
  const newCustomer: Customer = {
    id: `customer-${Date.now()}`,
    ...customerData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  setDataState({ customers: [newCustomer, ...dataState.customers] });
  await cacheData();
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  return newCustomer;
};

export const updateCustomer = async (customerId: string, updates: Partial<Customer>): Promise<Customer | null> => {
  const userId = getCurrentUserId();

  if (userId) {
    const result = await updateCustomerInDb(customerId, updates);
    if (result) {
      const index = dataState.customers.findIndex((c) => c.id === customerId);
      if (index !== -1) {
        const newCustomers = [...dataState.customers];
        newCustomers[index] = result;
        setDataState({ customers: newCustomers });
        await cacheData();
      }
      return result;
    }
  }

  // Fallback to local update
  const index = dataState.customers.findIndex((c) => c.id === customerId);
  if (index === -1) return null;

  const updatedCustomer: Customer = {
    ...dataState.customers[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const newCustomers = [...dataState.customers];
  newCustomers[index] = updatedCustomer;

  setDataState({ customers: newCustomers });
  await cacheData();
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  return updatedCustomer;
};

export const deleteCustomer = async (customerId: string): Promise<boolean> => {
  const userId = getCurrentUserId();

  if (userId) {
    const success = await deleteCustomerFromDb(customerId);
    if (success) {
      setDataState({ customers: dataState.customers.filter(c => c.id !== customerId) });
      await cacheData();
      return true;
    }
  }

  setDataState({ customers: dataState.customers.filter(c => c.id !== customerId) });
  await cacheData();
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  return true;
};

// Order creation - now using Supabase
export const createOrder = async (orderData: NewOrderData): Promise<Order> => {
  const userId = getCurrentUserId();
  const totalAmount = orderData.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  let newOrderNumber: string;

  if (userId) {
    // Generate order number from Supabase
    newOrderNumber = await generateOrderNumber();
  } else {
    newOrderNumber = `ORD-2025-${String(dataState.orders.length + 1).padStart(3, '0')}`;
  }

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

  // Create in Supabase
  if (userId) {
    const dbOrder = await createOrderInDb(newOrder);
    if (dbOrder) {
      // Update stock for each product in Supabase
      for (const item of orderData.items) {
        await updateProduct(item.product.id, {
          stock: Math.max(0, item.product.stock - item.quantity),
        });
      }

      setDataState({
        orders: [dbOrder, ...dataState.orders],
        kpi: dataState.kpi
          ? {
              ...dataState.kpi,
              activeOrders: dataState.kpi.activeOrders + 1,
            }
          : null,
      });

      await cacheData();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return dbOrder;
    }
  }

  // Fallback to local creation
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

// Calculate margin percentage
export const calculateMargin = (price: number, costPrice: number): number => {
  if (price <= 0) return 0;
  return Math.round(((price - costPrice) / price) * 100);
};

// Calculate profit
export const calculateProfit = (price: number, costPrice: number): number => {
  return price - costPrice;
};

// Get products with margin calculations
export const getProductsWithMargins = (): Product[] => {
  return dataState.products.map((p) => ({
    ...p,
    margin: calculateMargin(p.price, p.costPrice),
    profit: calculateProfit(p.price, p.costPrice),
  }));
};

// Get top customers by revenue
export const getTopCustomersByRevenue = (limit: number = 5): Customer[] => {
  return [...dataState.customers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit);
};

// Get customers who haven't ordered in X days
export const getInactiveCustomers = (days: number = 30): Customer[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return dataState.customers.filter((c) => {
    if (!c.lastOrderDate) return true;
    return new Date(c.lastOrderDate) < cutoffDate;
  });
};

// Get products by margin (highest margin)
export const getHighestMarginProducts = (limit: number = 5): Product[] => {
  return getProductsWithMargins()
    .sort((a, b) => (b.margin || 0) - (a.margin || 0))
    .slice(0, limit);
};

// Get customer order history
export const getCustomerOrders = (customerId: string): Order[] => {
  return dataState.orders.filter((o) => o.customerId === customerId);
};

// Calculate customer metrics
export const getCustomerMetrics = (customerId: string) => {
  const customer = getCustomerById(customerId);
  const orders = getCustomerOrders(customerId);

  if (!customer || orders.length === 0) {
    return null;
  }

  const completedOrders = orders.filter((o) => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgCheck = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  // Calculate top categories
  const categoryCount: Record<string, number> = {};
  completedOrders.forEach((o) => {
    o.items.forEach((item) => {
      const product = getProductById(item.productId);
      if (product) {
        categoryCount[product.category] = (categoryCount[product.category] || 0) + item.quantity;
      }
    });
  });

  const topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  // Calculate days since last order
  const lastOrder = orders.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  const daysSinceLastOrder = lastOrder
    ? Math.floor((Date.now() - new Date(lastOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    totalOrders: orders.length,
    completedOrders: completedOrders.length,
    totalRevenue,
    avgCheck,
    topCategories,
    daysSinceLastOrder,
    lastOrderDate: lastOrder?.createdAt,
  };
};

// Get business summary for AI (enhanced with CRM and profit data)
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
      const margin = calculateMargin(p.price, p.costPrice);
      const profit = calculateProfit(p.price, p.costPrice) * totalSold;
      return { product: p, totalSold, revenue, margin, profit };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const highestMarginProducts = getProductsWithMargins()
    .sort((a, b) => (b.margin || 0) - (a.margin || 0))
    .slice(0, 5);

  const topCustomers = [...customers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  const inactiveCustomers = getInactiveCustomers(30);

  const weekSales = salesData.week.reduce((sum, d) => sum + d.sales, 0);
  const monthSales = salesData.month.reduce((sum, d) => sum + d.sales, 0);

  // Calculate total profit margin
  const totalCost = products.reduce((sum, p) => sum + p.costPrice * p.stock, 0);
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const avgMargin = totalValue > 0 ? calculateMargin(totalValue, totalCost) : 0;

  return {
    kpi,
    totalOrders: orders.length,
    completedOrders: completedOrders.length,
    pendingOrders: pendingOrders.length,
    totalProducts: products.length,
    lowStockProducts: lowStockProducts.map((p) => ({
      name: p.name,
      stock: p.stock,
      minStock: p.minStock,
      margin: calculateMargin(p.price, p.costPrice),
    })),
    totalCustomers: customers.length,
    topProducts: topProducts.map((t) => ({
      name: t.product.name,
      sold: t.totalSold,
      revenue: t.revenue,
      margin: t.margin,
      profit: t.profit,
    })),
    highestMarginProducts: highestMarginProducts.map((p) => ({
      name: p.name,
      price: p.price,
      costPrice: p.costPrice,
      margin: p.margin,
      profit: p.profit,
    })),
    topCustomers: topCustomers.map((c) => ({
      name: c.name,
      totalSpent: c.totalSpent,
      totalOrders: c.totalOrders,
      avgCheck: c.averageCheck || (c.totalOrders > 0 ? Math.round(c.totalSpent / c.totalOrders) : 0),
      lastOrderDate: c.lastOrderDate,
    })),
    inactiveCustomers: inactiveCustomers.map((c) => ({
      name: c.name,
      lastOrderDate: c.lastOrderDate,
      totalSpent: c.totalSpent,
    })),
    weekSales,
    monthSales,
    avgOrderValue: completedOrders.length > 0
      ? completedOrders.reduce((sum, o) => sum + o.totalAmount, 0) / completedOrders.length
      : 0,
    avgMargin,
  };
};

// ============== PRODUCT VARIANTS ==============

// Get variants for a product
export const getVariantsByProductId = (productId: string): ProductVariant[] => {
  return dataState.variants.filter((v) => v.productId === productId);
};

// Get a single variant by ID
export const getVariantById = (variantId: string): ProductVariant | undefined => {
  return dataState.variants.find((v) => v.id === variantId);
};

// Check if product has variants
export const productHasVariants = (productId: string): boolean => {
  return dataState.variants.some((v) => v.productId === productId);
};

// Get product with variants
export const getProductWithVariants = (productId: string): ProductWithVariants | undefined => {
  const product = getProductById(productId);
  if (!product) return undefined;

  const variants = getVariantsByProductId(productId);
  return {
    ...product,
    variants: variants.length > 0 ? variants : undefined,
    hasVariants: variants.length > 0,
  };
};

// Get all products with their variants
export const getAllProductsWithVariants = (): ProductWithVariants[] => {
  return dataState.products.map((product) => {
    const variants = getVariantsByProductId(product.id);
    return {
      ...product,
      variants: variants.length > 0 ? variants : undefined,
      hasVariants: variants.length > 0,
    };
  });
};

// Add a new variant
export const addVariant = async (variant: Omit<ProductVariant, 'id'>): Promise<ProductVariant> => {
  const newVariant: ProductVariant = {
    ...variant,
    id: `var-${Date.now()}`,
  };

  const newVariants = [...dataState.variants, newVariant];
  setDataState({ variants: newVariants });
  await cacheData();
  return newVariant;
};

// Update a variant
export const updateVariant = async (variantId: string, updates: Partial<ProductVariant>): Promise<ProductVariant | null> => {
  const index = dataState.variants.findIndex((v) => v.id === variantId);
  if (index === -1) return null;

  const updatedVariant: ProductVariant = {
    ...dataState.variants[index],
    ...updates,
  };

  const newVariants = [...dataState.variants];
  newVariants[index] = updatedVariant;
  setDataState({ variants: newVariants });
  await cacheData();
  return updatedVariant;
};

// Delete a variant
export const deleteVariant = async (variantId: string): Promise<boolean> => {
  const index = dataState.variants.findIndex((v) => v.id === variantId);
  if (index === -1) return false;

  const newVariants = dataState.variants.filter((v) => v.id !== variantId);
  setDataState({ variants: newVariants });
  await cacheData();
  return true;
};

// Get total stock including variants
export const getTotalProductStock = (productId: string): number => {
  const variants = getVariantsByProductId(productId);
  if (variants.length > 0) {
    return variants.reduce((sum, v) => sum + v.stock, 0);
  }
  const product = getProductById(productId);
  return product?.stock || 0;
};

// ============== BATCH UPDATE ==============

// Batch update products
export const batchUpdateProducts = async (
  productIds: string[],
  updates: Partial<Pick<Product, 'category' | 'categoryId' | 'isActive'>> & { stockAdjustment?: number }
): Promise<Product[]> => {
  const updatedProducts: Product[] = [];

  for (const productId of productIds) {
    const index = dataState.products.findIndex((p) => p.id === productId);
    if (index === -1) continue;

    const currentProduct = dataState.products[index];
    const productUpdates: Partial<Product> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Handle stock adjustment
    if (updates.stockAdjustment !== undefined) {
      const newStock = Math.max(0, currentProduct.stock + updates.stockAdjustment);
      productUpdates.stock = newStock;

      // Add to stock history
      productUpdates.stockHistory = [
        ...(currentProduct.stockHistory || []),
        {
          date: new Date().toISOString(),
          stock: newStock,
          change: updates.stockAdjustment,
          reason: updates.stockAdjustment > 0 ? 'restock' : 'adjustment',
        },
      ];
    }

    // Remove stockAdjustment from updates (not a Product field)
    delete (productUpdates as Record<string, unknown>).stockAdjustment;

    const updatedProduct: Product = {
      ...currentProduct,
      ...productUpdates,
    };

    dataState.products[index] = updatedProduct;
    updatedProducts.push(updatedProduct);
  }

  setDataState({ products: [...dataState.products] });
  await cacheData();
  return updatedProducts;
};

// Batch update variant stock
export const batchUpdateVariantStock = async (
  variantIds: string[],
  stockAdjustment: number
): Promise<ProductVariant[]> => {
  const updatedVariants: ProductVariant[] = [];

  for (const variantId of variantIds) {
    const index = dataState.variants.findIndex((v) => v.id === variantId);
    if (index === -1) continue;

    const currentVariant = dataState.variants[index];
    const newStock = Math.max(0, currentVariant.stock + stockAdjustment);

    const updatedVariant: ProductVariant = {
      ...currentVariant,
      stock: newStock,
    };

    dataState.variants[index] = updatedVariant;
    updatedVariants.push(updatedVariant);
  }

  setDataState({ variants: [...dataState.variants] });
  await cacheData();
  return updatedVariants;
};
