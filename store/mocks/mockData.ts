/**
 * Mock Data
 * Contains all mock data for development and testing
 */

import type {
  Order,
  Product,
  Customer,
  KPIData,
  Activity,
  SalesDataPoint,
  ProductCategory,
  ProductVariant,
} from '@/types';

// ============== UTILITY FUNCTIONS ==============

/**
 * Generate price history data
 */
export const generatePriceHistory = (basePrice: number) => {
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

/**
 * Generate stock history data
 */
export const generateStockHistory = (currentStock: number) => {
  const history = [];
  const now = new Date();
  const reasons: ('sale' | 'restock' | 'adjustment' | 'return')[] = ['sale', 'restock', 'adjustment', 'return'];
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

/**
 * Generate weekly/monthly sales data
 */
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

// ============== MOCK CUSTOMERS ==============

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

// ============== MOCK CATEGORIES ==============

export const mockCategories: ProductCategory[] = [
  { id: 'cat1', name: 'Электроника', icon: 'hardware-chip', color: '#2c7be5', productCount: 2 },
  { id: 'cat2', name: 'Аксессуары', icon: 'headset', color: '#00d97e', productCount: 2 },
  { id: 'cat3', name: 'Премиум', icon: 'diamond', color: '#f6c343', productCount: 1 },
  { id: 'cat4', name: 'Новинки', icon: 'sparkles', color: '#e63757', productCount: 1 },
  { id: 'cat5', name: 'Акции', icon: 'pricetag', color: '#6b7c93', productCount: 1 },
];

// ============== MOCK PRODUCTS ==============

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

// ============== MOCK ORDERS ==============

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

// ============== MOCK VARIANTS ==============

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

// ============== MOCK KPI ==============

export const mockKPI: KPIData = {
  totalSales: 1245680,
  salesChange: 18.5,
  activeOrders: 4,
  ordersChange: 12.3,
  balance: 485840,
  balanceChange: 15.2,
  lowStockItems: 3,
};

// ============== MOCK ACTIVITIES ==============

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
