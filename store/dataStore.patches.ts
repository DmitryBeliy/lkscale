/**
 * PATCH INSTRUCTIONS for store/dataStore.ts
 * 
 * These patches update the data store to handle migrated data properly.
 */

// ============================================
// PATCH 1: Safe product mapping in loadCachedData (around line 191)
// ============================================
// Replace the product mapping with safer version:

const safeMapProduct = (p: unknown): Product => {
  if (!p || typeof p !== 'object') {
    return {
      id: 'unknown',
      name: 'Unknown Product',
      sku: '',
      price: 0,
      costPrice: 0,
      stock: 0,
      category: 'Без категории',
      minStock: 0,
      isActive: false,
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const product = p as Record<string, unknown>;
  
  return {
    id: String(product.id || 'unknown'),
    name: String(product.name || 'Unknown Product'),
    sku: String(product.sku || ''),
    barcode: product.barcode ? String(product.barcode) : undefined,
    price: Number(product.price) || 0,
    costPrice: Number(product.costPrice ?? product.cost_price) || 0,
    stock: Number(product.stock) || 0,
    category: String(product.category || 'Без категории'),
    categoryId: product.categoryId ? String(product.categoryId) : undefined,
    image: product.image ? String(product.image) : undefined,
    images: Array.isArray(product.images) ? product.images.filter((i): i is string => typeof i === 'string') : undefined,
    description: product.description ? String(product.description) : undefined,
    minStock: Number(product.minStock ?? product.min_stock) || 0,
    isActive: Boolean(product.isActive ?? product.is_active ?? true),
    priceHistory: Array.isArray(product.priceHistory) ? product.priceHistory : undefined,
    stockHistory: Array.isArray(product.stockHistory) ? product.stockHistory : undefined,
    createdAt: String(product.createdAt ?? product.created_at ?? new Date().toISOString()),
    updatedAt: String(product.updatedAt ?? product.updated_at ?? new Date().toISOString()),
    margin: product.margin ? Number(product.margin) : undefined,
    profit: product.profit ? Number(product.profit) : undefined,
  };
};

// ============================================
// PATCH 2: Safe order mapping in loadCachedData
// ============================================

const safeMapOrder = (o: unknown): Order => {
  if (!o || typeof o !== 'object') {
    return {
      id: 'unknown',
      orderNumber: 'UNKNOWN',
      status: 'pending',
      totalAmount: 0,
      itemsCount: 0,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const order = o as Record<string, unknown>;

  // Handle items from JSON - migrated data may have different structures
  let items: OrderItem[] = [];
  if (Array.isArray(order.items)) {
    items = order.items.map((item: unknown): OrderItem => {
      if (!item || typeof item !== 'object') {
        return { id: 'unknown', productId: 'unknown', productName: 'Unknown', quantity: 0, price: 0 };
      }
      const i = item as Record<string, unknown>;
      return {
        id: String(i.id || `item_${Date.now()}_${Math.random()}`),
        productId: String(i.productId ?? i.product_id ?? 'unknown'),
        productName: String(i.productName ?? i.product_name ?? 'Unknown Product'),
        quantity: Number(i.quantity ?? i.Count) || 0,
        price: Number(i.price ?? i.Price) || 0,
        sku: i.sku ? String(i.sku) : undefined,
      };
    });
  }

  // Handle customer data
  let customer: Order['customer'];
  if (order.customer && typeof order.customer === 'object') {
    const c = order.customer as Record<string, unknown>;
    customer = {
      name: String(c.name || ''),
      phone: c.phone ? String(c.phone) : undefined,
      address: c.address ? String(c.address) : undefined,
    };
  }

  return {
    id: String(order.id || 'unknown'),
    orderNumber: String(order.orderNumber ?? order.order_number ?? 'UNKNOWN'),
    status: (order.status as Order['status']) || 'pending',
    totalAmount: Number(order.totalAmount ?? order.total_amount) || 0,
    itemsCount: Number(order.itemsCount ?? order.items_count) || items.reduce((sum, i) => sum + i.quantity, 0),
    customerId: order.customerId ? String(order.customerId) : undefined,
    customer: customer,
    items: items,
    notes: order.notes ? String(order.notes) : undefined,
    paymentMethod: (order.paymentMethod ?? order.payment_method as Order['paymentMethod']) || 'cash',
    createdAt: String(order.createdAt ?? order.created_at ?? new Date().toISOString()),
    updatedAt: String(order.updatedAt ?? order.updated_at ?? new Date().toISOString()),
  };
};

// ============================================
// PATCH 3: Safe customer mapping in loadCachedData
// ============================================

const safeMapCustomer = (c: unknown): Customer => {
  if (!c || typeof c !== 'object') {
    return {
      id: 'unknown',
      name: 'Unknown Customer',
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    };
  }

  const customer = c as Record<string, unknown>;

  return {
    id: String(customer.id || 'unknown'),
    name: String(customer.name || 'Unknown Customer'),
    phone: customer.phone ? String(customer.phone) : undefined,
    email: customer.email ? String(customer.email) : undefined,
    address: customer.address ? String(customer.address) : undefined,
    company: customer.company ? String(customer.company) : undefined,
    notes: customer.notes ? String(customer.notes) : undefined,
    totalOrders: Number(customer.totalOrders ?? customer.total_orders) || 0,
    totalSpent: Number(customer.totalSpent ?? customer.total_spent) || 0,
    lastOrderDate: customer.lastOrderDate ? String(customer.lastOrderDate) : undefined,
    averageCheck: customer.averageCheck ? Number(customer.averageCheck) : undefined,
    topCategories: Array.isArray(customer.topCategories) 
      ? customer.topCategories.filter((t): t is string => typeof t === 'string')
      : undefined,
    createdAt: String(customer.createdAt ?? customer.created_at ?? new Date().toISOString()),
    updatedAt: customer.updatedAt ? String(customer.updatedAt) : undefined,
  };
};

// ============================================
// PATCH 4: Update loadCachedData to use safe mappers
// ============================================
// Replace the data loading section with:

setDataState({
  orders: (syncCached.orders || []).map(safeMapOrder),
  products: (syncCached.products || []).map(safeMapProduct),
  customers: (syncCached.customers || []).map(safeMapCustomer),
  suppliers: (syncCached.suppliers || []),
  manufacturers: (syncCached.manufacturers || []),
  locations: (syncCached.locations || []),
  categories: [],
  variants: [],
  kpi: syncCached.kpi || null,
  activities: (syncCached.activities || []),
  salesData: {
    week: weekData,
    month: monthData,
  },
  lastSync: syncCached.lastSyncTime || null,
  isLoading: false,
  isOffline: true,
});

// ============================================
// PATCH 5: Safe product getter methods
// ============================================
// Update getProductById (around line 538):

export const getProductById = (id: string): Product | undefined => {
  if (!id) return undefined;
  return dataState.products.find((product) => product.id === id);
};

// Update getProductByBarcode (around line 542):

export const getProductByBarcode = (barcode: string): Product | undefined => {
  if (!barcode) return undefined;
  return dataState.products.find((product) => product.barcode === barcode);
};

// Update getProductBySku (around line 546):

export const getProductBySku = (sku: string): Product | undefined => {
  if (!sku) return undefined;
  return dataState.products.find((product) =>
    product.sku?.toLowerCase() === sku.toLowerCase()
  );
};

// ============================================
// PATCH 6: Safe order getter methods
// ============================================

export const getOrderById = (id: string): Order | undefined => {
  if (!id) return undefined;
  return dataState.orders.find((order) => order.id === id);
};

export const getOrderByNumber = (orderNumber: string): Order | undefined => {
  if (!orderNumber) return undefined;
  return dataState.orders.find((order) =>
    order.orderNumber?.toLowerCase() === orderNumber.toLowerCase()
  );
};

// ============================================
// PATCH 7: Safe search functions
// ============================================

export const searchProducts = (query: string, categoryFilter?: string): Product[] => {
  let filtered = dataState.products;

  if (query?.trim()) {
    const lowerQuery = query.toLowerCase().trim();
    filtered = filtered.filter(
      (product) =>
        product.name?.toLowerCase().includes(lowerQuery) ||
        product.sku?.toLowerCase().includes(lowerQuery) ||
        (product.barcode && product.barcode.includes(query.trim()))
    );
  }

  if (categoryFilter && categoryFilter !== 'all') {
    filtered = filtered.filter((product) => product.category === categoryFilter);
  }

  return filtered;
};

export const searchOrders = (query: string, statusFilter?: string): Order[] => {
  let filtered = dataState.orders;

  if (query?.trim()) {
    const lowerQuery = query.toLowerCase().trim();
    filtered = filtered.filter(
      (order) =>
        order.orderNumber?.toLowerCase().includes(lowerQuery) ||
        order.customer?.name?.toLowerCase().includes(lowerQuery)
    );
  }

  if (statusFilter && statusFilter !== 'all') {
    filtered = filtered.filter((order) => order.status === statusFilter);
  }

  return filtered;
};

export const searchCustomers = (query: string): Customer[] => {
  if (!query?.trim()) return dataState.customers;

  const lowerQuery = query.toLowerCase().trim();
  return dataState.customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(lowerQuery) ||
      (customer.phone && customer.phone.includes(query.trim())) ||
      (customer.email && customer.email.toLowerCase().includes(lowerQuery))
  );
};

// ============================================
// PATCH 8: Safe margin calculation
// ============================================

export const calculateMargin = (price: number, costPrice: number): number => {
  const safePrice = Number(price) || 0;
  const safeCost = Number(costPrice) || 0;
  if (safePrice <= 0) return 0;
  return Math.round(((safePrice - safeCost) / safePrice) * 100);
};

export const calculateProfit = (price: number, costPrice: number): number => {
  const safePrice = Number(price) || 0;
  const safeCost = Number(costPrice) || 0;
  return safePrice - safeCost;
};

// ============================================
// PATCH 9: Safe low stock calculation
// ============================================

export const getLowStockProducts = (): Product[] => {
  return dataState.products.filter((p) => {
    const stock = Number(p.stock) || 0;
    const minStock = Number(p.minStock) || 0;
    return stock <= minStock && stock >= 0;
  });
};

// ============================================
// PATCH 10: Safe sales data generation
// ============================================

const generateSalesDataFromOrders = (orders: Order[], period: 'week' | 'month'): SalesDataPoint[] => {
  const data: SalesDataPoint[] = [];
  const now = new Date();
  const days = period === 'week' ? 7 : 30;
  const labels = period === 'week'
    ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    : [];

  // Group orders by date
  const ordersByDate: Record<string, Order[]> = {};
  orders.filter(o => o.status === 'completed').forEach(order => {
    const dateStr = order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : '';
    if (!dateStr) return;
    if (!ordersByDate[dateStr]) ordersByDate[dateStr] = [];
    ordersByDate[dateStr].push(order);
  });

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayOrders = ordersByDate[dateStr] || [];

    const sales = dayOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const ordersCount = dayOrders.length;

    data.push({
      date: date.toISOString(),
      label: period === 'week' 
        ? labels[(date.getDay() + 6) % 7] 
        : `${date.getDate()}`,
      sales,
      orders: ordersCount,
    });
  }

  return data;
};
