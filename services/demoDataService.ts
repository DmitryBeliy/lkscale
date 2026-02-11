// Demo Mode Service - Generates sample business data for demonstration
import { Product, Order, Customer, Supplier, TeamMember, Coupon, ActivityLogEntry } from '@/types';

// Generate random ID
const generateId = () => `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`;

// Sample product categories
const CATEGORIES = ['Электроника', 'Одежда', 'Продукты', 'Бытовая химия', 'Спорт'];

// Sample product names by category
const PRODUCT_NAMES: Record<string, string[]> = {
  'Электроника': [
    'iPhone 15 Pro', 'Samsung Galaxy S24', 'MacBook Air M3', 'AirPods Pro 2',
    'iPad Pro 12.9', 'Sony WH-1000XM5', 'Apple Watch Ultra', 'DJI Mini 4 Pro',
  ],
  'Одежда': [
    'Футболка Nike Dri-FIT', 'Джинсы Levi\'s 501', 'Кроссовки Adidas Ultraboost',
    'Куртка North Face', 'Свитер Uniqlo', 'Рубашка Ralph Lauren',
  ],
  'Продукты': [
    'Кофе Lavazza', 'Чай Ahmad', 'Шоколад Lindt', 'Оливковое масло',
    'Миндаль сырой', 'Мёд цветочный', 'Паста Barilla',
  ],
  'Бытовая химия': [
    'Стиральный порошок Persil', 'Средство для посуды Fairy', 'Освежитель воздуха Glade',
    'Шампунь Head & Shoulders', 'Зубная паста Colgate',
  ],
  'Спорт': [
    'Гантели 10кг', 'Коврик для йоги', 'Скакалка PRO', 'Эспандер набор',
    'Фитнес браслет Xiaomi', 'Бутылка для воды 1л',
  ],
};

// Customer names
const CUSTOMER_NAMES = [
  'Александр Петров', 'Мария Иванова', 'Дмитрий Смирнов', 'Елена Козлова',
  'Сергей Новиков', 'Анна Морозова', 'Андрей Соколов', 'Ольга Волкова',
  'Максим Фёдоров', 'Татьяна Белова', 'Игорь Васильев', 'Наталья Попова',
];

// Generate demo products
export const generateDemoProducts = (): Product[] => {
  const products: Product[] = [];
  let productIndex = 0;

  Object.entries(PRODUCT_NAMES).forEach(([category, names]) => {
    names.forEach((name, idx) => {
      const costPrice = Math.floor(Math.random() * 50000) + 1000;
      const margin = Math.floor(Math.random() * 40) + 15;
      const price = Math.round(costPrice * (1 + margin / 100));
      const stock = Math.floor(Math.random() * 100) + 5;
      const minStock = Math.floor(Math.random() * 20) + 5;

      products.push({
        id: generateId(),
        name,
        sku: `SKU-${String(productIndex + 1).padStart(4, '0')}`,
        barcode: `460${String(Math.floor(Math.random() * 10000000000)).padStart(10, '0')}`,
        price,
        costPrice,
        stock,
        minStock,
        category,
        description: `Качественный товар из категории "${category}". Популярный выбор покупателей.`,
        isActive: true,
        margin,
        profit: price - costPrice,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      });
      productIndex++;
    });
  });

  return products;
};

// Generate demo customers
export const generateDemoCustomers = (): Customer[] => {
  return CUSTOMER_NAMES.map((name, index) => {
    const totalOrders = Math.floor(Math.random() * 50) + 1;
    const totalSpent = Math.floor(Math.random() * 500000) + 5000;

    return {
      id: generateId(),
      name,
      phone: `+7 (9${Math.floor(Math.random() * 90) + 10}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 90) + 10}`,
      email: `${name.split(' ')[0].toLowerCase()}@example.com`,
      totalOrders,
      totalSpent,
      averageCheck: Math.round(totalSpent / totalOrders),
      lastOrderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
};

// Generate demo orders
export const generateDemoOrders = (products: Product[], customers: Customer[]): Order[] => {
  const orders: Order[] = [];
  const statuses: Order['status'][] = ['pending', 'processing', 'completed', 'cancelled'];
  const paymentMethods: Order['paymentMethod'][] = ['cash', 'card', 'transfer', 'online'];

  for (let i = 0; i < 50; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const itemCount = Math.floor(Math.random() * 5) + 1;
    const items = [];
    let totalAmount = 0;

    for (let j = 0; j < itemCount; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      const itemTotal = product.price * quantity;
      totalAmount += itemTotal;

      items.push({
        id: generateId(),
        productId: product.id,
        productName: product.name,
        quantity,
        price: product.price,
        sku: product.sku,
      });
    }

    const status = i < 10 ? statuses[Math.floor(Math.random() * 2)] : statuses[Math.floor(Math.random() * statuses.length)];
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

    orders.push({
      id: generateId(),
      orderNumber: `ORD-${String(i + 1001).padStart(6, '0')}`,
      status,
      totalAmount,
      itemsCount: items.length,
      items,
      customerId: customer.id,
      customer: {
        name: customer.name,
        phone: customer.phone,
      },
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    });
  }

  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Generate demo suppliers
export const generateDemoSuppliers = (): Supplier[] => {
  const supplierNames = [
    'ООО "ТехПоставка"', 'ИП Иванов А.А.', 'ООО "МегаОпт"',
    'ООО "Глобал Трейд"', 'ИП Сидорова М.К.',
  ];

  return supplierNames.map((name, index) => ({
    id: generateId(),
    name,
    contactName: CUSTOMER_NAMES[index],
    email: `supplier${index + 1}@company.ru`,
    phone: `+7 (495) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 90) + 10}`,
    leadTimeDays: Math.floor(Math.random() * 7) + 1,
    rating: Math.floor(Math.random() * 2) + 4,
    isActive: true,
    totalOrders: Math.floor(Math.random() * 30) + 5,
    totalSpent: Math.floor(Math.random() * 1000000) + 100000,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

// Generate demo team members
export const generateDemoTeamMembers = (): TeamMember[] => {
  const roles: TeamMember['role'][] = ['admin', 'cashier', 'stock_manager'];

  return [
    {
      id: generateId(),
      ownerId: 'demo_owner',
      email: 'admin@lkscale.ru',
      name: 'Владелец бизнеса',
      role: 'admin' as const,
      status: 'active' as const,
      permissions: {
        canCreateOrders: true,
        canEditOrders: true,
        canDeleteOrders: true,
        canViewAllOrders: true,
        canManageProducts: true,
        canEditPrices: true,
        canAdjustStock: true,
        canViewCustomers: true,
        canEditCustomers: true,
        canViewReports: true,
        canManageCoupons: true,
        canViewActivityLog: true,
      },
      invitedAt: new Date().toISOString(),
      joinedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      ownerId: 'demo_owner',
      email: 'cashier@lkscale.ru',
      name: 'Анна Кассир',
      role: 'cashier' as const,
      status: 'active' as const,
      permissions: {
        canCreateOrders: true,
        canEditOrders: true,
        canViewCustomers: true,
      },
      invitedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      joinedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      ownerId: 'demo_owner',
      email: 'stock@lkscale.ru',
      name: 'Михаил Кладовщик',
      role: 'stock_manager' as const,
      status: 'active' as const,
      permissions: {
        canManageProducts: true,
        canAdjustStock: true,
        canViewReports: true,
      },
      invitedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      joinedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

// Generate demo coupons
export const generateDemoCoupons = (): Coupon[] => {
  return [
    {
      id: generateId(),
      ownerId: 'demo_owner',
      code: 'WELCOME10',
      name: 'Скидка новичкам',
      description: 'Скидка 10% на первый заказ',
      discountType: 'percentage',
      discountValue: 10,
      minPurchaseAmount: 1000,
      usageLimit: 100,
      usageCount: 23,
      isSingleUse: true,
      customerTier: ['standard', 'silver', 'gold', 'vip'],
      customerIds: [],
      validFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      ownerId: 'demo_owner',
      code: 'VIP500',
      name: 'VIP Бонус',
      description: 'Скидка 500₽ для VIP клиентов',
      discountType: 'fixed',
      discountValue: 500,
      minPurchaseAmount: 5000,
      usageCount: 8,
      isSingleUse: false,
      customerTier: ['gold', 'vip'],
      customerIds: [],
      validFrom: new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

// Generate demo activity log
export const generateDemoActivityLog = (
  products: Product[],
  orders: Order[],
  teamMembers: TeamMember[]
): ActivityLogEntry[] => {
  const activities: ActivityLogEntry[] = [];
  const actions = [
    { type: 'order_created', desc: 'Создан заказ' },
    { type: 'order_completed', desc: 'Заказ выполнен' },
    { type: 'product_updated', desc: 'Обновлён товар' },
    { type: 'stock_adjusted', desc: 'Корректировка остатков' },
    { type: 'price_changed', desc: 'Изменена цена' },
  ];

  for (let i = 0; i < 20; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const member = teamMembers[Math.floor(Math.random() * teamMembers.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const order = orders[Math.floor(Math.random() * orders.length)];

    activities.push({
      id: generateId(),
      ownerId: 'demo_owner',
      teamMemberId: member.id,
      actorName: member.name || 'Система',
      actorRole: member.role,
      actionType: action.type as any,
      description: action.desc,
      entityType: action.type.includes('order') ? 'order' : 'product',
      entityId: action.type.includes('order') ? order.id : product.id,
      entityName: action.type.includes('order') ? order.orderNumber : product.name,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Full demo data generation
export interface DemoData {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  suppliers: Supplier[];
  teamMembers: TeamMember[];
  coupons: Coupon[];
  activityLog: ActivityLogEntry[];
}

export const generateFullDemoData = (): DemoData => {
  const products = generateDemoProducts();
  const customers = generateDemoCustomers();
  const orders = generateDemoOrders(products, customers);
  const suppliers = generateDemoSuppliers();
  const teamMembers = generateDemoTeamMembers();
  const coupons = generateDemoCoupons();
  const activityLog = generateDemoActivityLog(products, orders, teamMembers);

  return {
    products,
    customers,
    orders,
    suppliers,
    teamMembers,
    coupons,
    activityLog,
  };
};

// KPI calculations from demo data
export const calculateDemoKPIs = (data: DemoData) => {
  const completedOrders = data.orders.filter(o => o.status === 'completed');
  const totalSales = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Calculate estimated profit (30% margin average)
  const estimatedProfit = Math.round(totalSales * 0.3);

  const activeOrders = data.orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const lowStockItems = data.products.filter(p => p.stock <= p.minStock).length;

  return {
    totalSales,
    salesChange: 12.5, // Demo growth
    activeOrders,
    ordersChange: 8,
    balance: estimatedProfit,
    balanceChange: 15,
    lowStockItems,
  };
};
