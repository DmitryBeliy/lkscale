# Lkscale ERP - API Documentation

> **Полная документация API endpoints и сервисов**

---

## 📋 Содержание

- [Обзор API](#-обзор-api)
- [Аутентификация](#-аутентификация)
- [Товары (Products)](#-товары-products)
- [Клиенты (Customers)](#-клиенты-customers)
- [Заказы (Orders)](#-заказы-orders)
- [Склад (Warehouse)](#-склад-warehouse)
- [Финансы (Finance)](#-финансы-finance)
- [Отчеты (Reports)](#-отчеты-reports)
- [Настройки (Settings)](#-настройки-settings)
- [AI Сервисы](#-ai-сервисы)
- [Realtime](#-realtime)
- [Offline](#-offline)

---

## 🔍 Обзор API

### Базовый URL

```
Production:  https://your-project.supabase.co/rest/v1
Development: http://localhost:54321/rest/v1
```

### Заголовки

```http
Authorization: Bearer <jwt_token>
apikey: <anon_key>
Content-Type: application/json
Prefer: return=representation
```

### HTTP Methods

| Method | Описание |
|--------|----------|
| GET | Получение данных |
| POST | Создание ресурса |
| PATCH | Частичное обновление |
| DELETE | Удаление |

### Коды ответов

| Код | Значение |
|-----|----------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden (RLS) |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |

---

## 🔐 Аутентификация

### Supabase Auth API

#### Вход по email/password

```http
POST /auth/v1/token?grant_type=password
Content-Type: application/json
apikey: <anon_key>

{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "-yeS4tmntn5k9G...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Регистрация

```http
POST /auth/v1/signup
Content-Type: application/json
apikey: <anon_key>

{
  "email": "new@example.com",
  "password": "secure_password",
  "data": {
    "name": "John Doe",
    "phone": "+1234567890"
  }
}
```

#### Восстановление пароля

```http
POST /auth/v1/recover
Content-Type: application/json
apikey: <anon_key>

{
  "email": "user@example.com"
}
```

#### Обновление токена

```http
POST /auth/v1/token?grant_type=refresh_token
Content-Type: application/json
apikey: <anon_key>

{
  "refresh_token": "-yeS4tmntn5k9G..."
}
```

### Биометрическая аутентификация

```typescript
import * as LocalAuthentication from 'expo-local-authentication';

// Проверка доступности
const isAvailable = await LocalAuthentication.hasHardwareAsync();

// Аутентификация
const result = await LocalAuthentication.authenticateAsync({
  promptMessage: 'Авторизация',
  fallbackLabel: 'Использовать пароль'
});

if (result.success) {
  // Пользователь авторизован
}
```

---

## 📦 Товары (Products)

### Получение списка товаров

```http
GET /rest/v1/products?select=*&order=created_at.desc
Authorization: Bearer <token>
```

**Query Parameters:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| `category` | string | Фильтр по категории |
| `is_active` | boolean | Только активные |
| `stock` | string | `lt.10` — остаток меньше 10 |
| `search` | string | Поиск по названию |

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "iPhone 15 Pro",
    "sku": "TEL-001",
    "barcode": "1234567890123",
    "price": 125000,
    "cost_price": 100000,
    "stock": 15,
    "min_stock": 5,
    "category": "Электроника",
    "category_id": "uuid",
    "description": "Описание товара",
    "image_url": "https://...",
    "images": ["url1", "url2"],
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "user_id": "uuid"
  }
]
```

### Получение одного товара

```http
GET /rest/v1/products?id=eq.<id>&select=*
Authorization: Bearer <token>
```

### Создание товара

```http
POST /rest/v1/products
Authorization: Bearer <token>
Content-Type: application/json
Prefer: return=representation

{
  "name": "Samsung Galaxy S24",
  "sku": "TEL-002",
  "barcode": "9876543210987",
  "price": 98000,
  "cost_price": 78000,
  "stock": 10,
  "min_stock": 3,
  "category": "Электроника",
  "description": "Новый флагман Samsung",
  "is_active": true
}
```

### Обновление товара

```http
PATCH /rest/v1/products?id=eq.<id>
Authorization: Bearer <token>
Content-Type: application/json
Prefer: return=representation

{
  "price": 95000,
  "stock": 8,
  "updated_at": "now()"
}
```

### Удаление товара

```http
DELETE /rest/v1/products?id=eq.<id>
Authorization: Bearer <token>
```

### TypeScript API

**Файл:** [`lib/supabaseDataService.ts`](lib/supabaseDataService.ts)

```typescript
// Получение всех товаров
const products = await fetchProducts();

// Создание товара
const newProduct = await createProduct({
  name: 'Новый товар',
  sku: 'SKU-001',
  price: 5000,
  costPrice: 3000,
  stock: 100,
  minStock: 10,
  category: 'Категория',
  isActive: true
});

// Обновление
const updated = await updateProductInDb(productId, {
  price: 4500,
  stock: 95
});

// Удаление
const deleted = await deleteProductFromDb(productId);

// Загрузка изображения
const imageUrl = await uploadProductImage(productId, base64ImageData);
```

---

## 👥 Клиенты (Customers)

### Получение списка клиентов

```http
GET /rest/v1/customers?select=*&order=created_at.desc
Authorization: Bearer <token>
```

**Фильтры:**
```http
# Поиск по имени или телефону
GET /rest/v1/customers?or=(name.ilike.*иван*,phone.ilike.*999*)

# VIP клиенты (total_spent > 100000)
GET /rest/v1/customers?total_spent=gt.100000

# Активные за последние 30 дней
GET /rest/v1/customers?last_order_date=gte.2024-01-01
```

### Создание клиента

```http
POST /rest/v1/customers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Иван Петров",
  "phone": "+7 999 111-22-33",
  "email": "ivan@example.com",
  "address": "г. Москва, ул. Ленина, д. 1",
  "company": "ООО Тест",
  "notes": "Предпочитает безнал",
  "total_orders": 0,
  "total_spent": 0
}
```

### Получение клиента с заказами

```http
GET /rest/v1/customers?id=eq.<id>&select=*,orders(*)
Authorization: Bearer <token>
```

### TypeScript API

```typescript
// Получение клиентов
const customers = await fetchCustomers();

// Создание
const customer = await createCustomer({
  name: 'Новый клиент',
  phone: '+7 999 123-45-67',
  email: 'client@example.com'
});

// Обновление
const updated = await updateCustomerInDb(customerId, {
  totalOrders: 5,
  totalSpent: 50000
});

// Удаление
const deleted = await deleteCustomerFromDb(customerId);
```

---

## 🛒 Заказы (Orders)

### Получение заказов

```http
GET /rest/v1/orders?select=*&order=created_at.desc
Authorization: Bearer <token>
```

**Фильтры по статусу:**
```http
# Только новые
GET /rest/v1/orders?status=eq.pending

# В обработке или готовы
GET /rest/v1/orders?status=in.(processing,ready)

# За период
GET /rest/v1/orders?created_at=gte.2024-01-01&created_at=lt.2024-02-01
```

### Создание заказа

```http
POST /rest/v1/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_number": "ORD-2024-001",
  "status": "pending",
  "total_amount": 25000,
  "items_count": 2,
  "customer_id": "uuid",
  "customer_name": "Иван Петров",
  "customer_phone": "+7 999 111-22-33",
  "customer_address": "г. Москва, ул. Ленина, д. 1",
  "payment_method": "card",
  "notes": "Доставка с 10 до 18",
  "items": [
    {
      "id": "item-1",
      "productId": "product-uuid",
      "productName": "iPhone 15 Pro",
      "quantity": 1,
      "price": 125000,
      "sku": "TEL-001"
    }
  ]
}
```

### Обновление статуса

```http
PATCH /rest/v1/orders?id=eq.<id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "updated_at": "now()"
}
```

### TypeScript API

```typescript
// Получение заказов
const orders = await fetchOrders();

// Создание
const order = await createOrderInDb({
  orderNumber: 'ORD-001',
  status: 'pending',
  totalAmount: 15000,
  itemsCount: 3,
  customerId: 'customer-uuid',
  customer: {
    name: 'Клиент',
    phone: '+7 999 123-45-67'
  },
  items: [
    { productId: 'p1', productName: 'Товар 1', quantity: 2, price: 5000 }
  ],
  paymentMethod: 'cash'
});

// Обновление
const updated = await updateOrderInDb(orderId, {
  status: 'completed'
});

// Удаление
const deleted = await deleteOrderFromDb(orderId);

// Генерация номера
const orderNumber = generateOrderNumber(); // ORD-2024-XXXX
```

---

## 🏭 Склад (Warehouse)

### Приемка товара

```typescript
import { processStockIn } from '@/services/warehouseService';

const result = await processStockIn({
  supplierId: 'supplier-uuid',
  items: [
    { productId: 'p1', quantity: 10, costPrice: 1000 },
    { productId: 'p2', quantity: 20, costPrice: 500 }
  ],
  notes: 'Поставка от 01.01.2024',
  documentNumber: 'SUP-001'
});
```

### Перемещение между складами

```typescript
import { processStockTransfer } from '@/services/warehouseService';

const result = await processStockTransfer({
  fromStoreId: 'store-1',
  toStoreId: 'store-2',
  items: [
    { productId: 'p1', quantity: 5 }
  ],
  notes: 'Пополнение филиала'
});
```

### Списание

```typescript
import { processWriteOff } from '@/services/warehouseService';

const result = await processWriteOff({
  items: [
    { productId: 'p1', quantity: 3, reason: 'Брак' }
  ],
  reason: 'broken',
  notes: 'Разбитые при транспортировке',
  images: ['base64_image_1', 'base64_image_2']
});
```

### Корректировка остатков

```typescript
import { processAdjustment } from '@/services/warehouseService';

const result = await processAdjustment({
  productId: 'p1',
  newStock: 50,
  reason: 'inventory',
  notes: 'Результат инвентаризации'
});
```

### Прогнозы запасов

```typescript
import { generateStockForecasts } from '@/services/warehouseService';

const forecasts = await generateStockForecasts(products);
// Returns: [{ productId, daysUntilStockout, recommendedOrderQty, confidence }]
```

---

## 💰 Финансы (Finance)

### Добавление расхода

```http
POST /rest/v1/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "category": "rent",
  "amount": 50000,
  "description": "Аренда за январь",
  "date": "2024-01-15",
  "vendor": "ООО Арендодатель",
  "is_recurring": true,
  "recurring_frequency": "monthly"
}
```

### Получение финансовой сводки

```typescript
import { calculateFinancialSummary } from '@/services/enterpriseService';

const summary = await calculateFinancialSummary(
  stores,
  orders,
  expenses,
  { startDate: '2024-01-01', endDate: '2024-01-31' }
);

// Returns:
{
  period: 'January 2024',
  grossRevenue: 500000,
  costOfGoodsSold: 300000,
  grossProfit: 200000,
  grossMargin: 40,
  operatingExpenses: { rent: 50000, salaries: 100000, ... },
  totalExpenses: 200000,
  netProfit: 0,
  netMargin: 0
}
```

### Категории расходов

```typescript
type ExpenseCategory = 
  | 'rent'           // Аренда
  | 'salaries'       // Зарплаты
  | 'utilities'      // Коммунальные услуги
  | 'taxes'          // Налоги
  | 'inventory'      // Закупки
  | 'marketing'      // Маркетинг
  | 'equipment'      // Оборудование
  | 'supplies'       // Расходники
  | 'insurance'      // Страховка
  | 'maintenance'    // Ремонт
  | 'delivery'       // Доставка
  | 'banking'        // Банковские услуги
  | 'other';         // Прочее
```

---

## 📊 Отчеты (Reports)

### Генерация отчета продаж

```typescript
import { 
  generateRevenueVsProfitData,
  generateCategorySalesData,
  calculateProjectedTaxes 
} from '@/services/analyticsService';

// Выручка и прибыль по периодам
const revenueData = generateRevenueVsProfitData(
  orders,
  products,
  'month' // 'day' | 'week' | 'month' | 'quarter' | 'year'
);

// Продажи по категориям
const categoryData = generateCategorySalesData(orders, products);

// Налоговая проекция
const taxProjection = calculateProjectedTaxes(
  orders,
  20, // tax rate %
  { start: new Date('2024-01-01'), end: new Date('2024-12-31') }
);
```

### Экспорт документов

```typescript
import { 
  generateOrderPDF,
  generateSalesReportExcel,
  printPriceTags 
} from '@/services/documentExportService';

// PDF заказа
const pdf = await generateOrderPDF(orderId);
await shareAsync(pdf.uri);

// Excel отчет
const excel = await generateSalesReportExcel({
  start: new Date('2024-01-01'),
  end: new Date('2024-01-31')
});

// Печать ценников
await printPriceTags(['product-id-1', 'product-id-2']);
```

---

## ⚙️ Настройки (Settings)

### Получение настроек

```typescript
import { 
  getBusinessSettings,
  getStoreSettings,
  getRegionalSettings,
  getNotificationSettings
} from '@/services/storeSettingsService';

const business = await getBusinessSettings();
const store = await getStoreSettings(storeId);
const regional = await getRegionalSettings();
const notifications = await getNotificationSettings();
```

### Обновление настроек

```typescript
// Бизнес
await updateBusinessSettings({
  name: 'Название компании',
  taxId: 'ИНН',
  address: 'Юридический адрес',
  phone: '+7 999 123-45-67',
  email: 'info@company.com',
  website: 'https://company.com'
});

// Магазин
await updateStoreSettings(storeId, {
  name: 'Филиал на Ленина',
  address: 'ул. Ленина, д. 1',
  phone: '+7 999 123-45-67',
  workingHours: {
    mon: { open: '09:00', close: '21:00' },
    tue: { open: '09:00', close: '21:00' },
    // ...
  }
});

// Региональные
await updateRegionalSettings({
  language: 'ru',
  currency: 'RUB',
  timezone: 'Europe/Moscow',
  dateFormat: 'DD.MM.YYYY',
  numberFormat: 'ru-RU',
  weightUnit: 'kg'
});

// Уведомления
await updateNotificationSettings({
  pushEnabled: true,
  emailEnabled: true,
  newOrderNotification: true,
  lowStockAlert: true,
  dailyReport: true
});
```

---

## 🤖 AI Сервисы

### Генерация бизнес-инсайтов

```typescript
import { generateBusinessInsights } from '@/services/aiInsights';

const insights = await generateBusinessInsights({
  totalSales: 500000,
  totalOrders: 150,
  averageOrderValue: 3333,
  topProducts: [...],
  lowStockItems: [...],
  customerCount: 50
});

// Returns:
[
  {
    id: '1',
    type: 'recommendation',
    title: 'Увеличьте запасы',
    description: 'Товар X закончится через 3 дня при текущей скорости продаж',
    priority: 'high',
    actionable: true,
    action: 'order?product=X'
  },
  // ...
]
```

### AI Ассистент

```typescript
import { useAIAssistant } from '@/hooks/useAIAssistant';

const { sendMessage, messages, isLoading } = useAIAssistant();

// Отправка сообщения
await sendMessage('Какие товары нужно заказать?');

// Ответ ассистента
{
  id: 'msg-2',
  role: 'assistant',
  content: 'На основе анализа продаж рекомендую заказать:\n1. iPhone 15 Pro - остаток 2 шт, прогноз заказов 10\n2. ...',
  timestamp: '2024-01-01T12:00:00Z'
}
```

---

## 🔄 Realtime

### Подписка на изменения

```typescript
import { 
  subscribeToProducts,
  subscribeToCustomers,
  subscribeToOrders,
  unsubscribeAll 
} from '@/lib/supabaseDataService';

// Подписка на товары
const unsubscribe = subscribeToProducts((payload) => {
  console.log('Product changed:', payload);
  // payload.eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  // payload.new: новые данные
  // payload.old: старые данные
});

// Отписка
unsubscribe();

// Отписка от всех
unsubscribeAll();
```

### Realtime Channel

```typescript
import { supabase } from '@/lib/supabase';

const channel = supabase
  .channel('table-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'orders',
      filter: 'user_id=eq.' + userId
    },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();

// Отписка
supabase.removeChannel(channel);
```

---

## 📴 Offline

### Очередь операций

```typescript
import { 
  queueOperation,
  processQueue,
  getPendingCount,
  getQueueSummary,
  resolveConflict 
} from '@/services/offlineService';

// Добавление в очередь (автоматически при offline)
await queueOperation({
  type: 'create_order',
  entityId: 'temp-order-id',
  data: orderData,
  timestamp: Date.now()
});

// Получение количества ожидающих
const count = await getPendingCount();

// Обработка очереди (вручную)
const result = await processQueue();
// result: { success: number, failed: number, conflicts: number }

// Разрешение конфликта
await resolveConflict(conflictId, 'server'); // 'server' | 'local'
```

### Типы оффлайн операций

```typescript
type OfflineOperationType = 
  | 'create_order'
  | 'update_order' 
  | 'update_stock'
  | 'create_product'
  | 'update_product'
  | 'create_customer'
  | 'update_customer';
```

---

## 🛡️ Row Level Security (RLS)

### Политики безопасности

```sql
-- Пользователи видят только свои данные
CREATE POLICY "Users can only access own data"
ON products FOR ALL
USING (user_id = auth.uid());

-- То же для заказов
CREATE POLICY "Users can only access own orders"
ON orders FOR ALL
USING (user_id = auth.uid());

-- И клиентов
CREATE POLICY "Users can only access own customers"
ON customers FOR ALL
USING (user_id = auth.uid());
```

---

## 📱 Примеры использования

### Полный цикл: создание заказа

```typescript
// 1. Получаем клиента
const customer = await getCustomerById(customerId);

// 2. Проверяем остатки
const product = await getProductById(productId);
if (product.stock < quantity) {
  throw new Error('Недостаточно товара');
}

// 3. Создаем заказ
const order = await createOrderInDb({
  orderNumber: generateOrderNumber(),
  customerId: customer.id,
  customer: {
    name: customer.name,
    phone: customer.phone
  },
  items: [{
    productId: product.id,
    productName: product.name,
    quantity: quantity,
    price: product.price,
    sku: product.sku
  }],
  totalAmount: product.price * quantity,
  itemsCount: quantity,
  status: 'pending',
  paymentMethod: 'cash'
});

// 4. Обновляем остатки
await updateProductInDb(product.id, {
  stock: product.stock - quantity
});

// 5. Обновляем статистику клиента
await updateCustomerInDb(customer.id, {
  totalOrders: customer.totalOrders + 1,
  totalSpent: customer.totalSpent + order.totalAmount,
  lastOrderDate: new Date().toISOString()
});
```

### Пагинация

```typescript
// Offset-based
const page = 1;
const limit = 20;
const { data, error, count } = await supabase
  .from('products')
  .select('*', { count: 'exact' })
  .range((page - 1) * limit, page * limit - 1)
  .order('created_at', { ascending: false });

// Cursor-based (для больших наборов)
const { data } = await supabase
  .from('orders')
  .select('*')
  .lt('created_at', lastItem.created_at)
  .limit(20)
  .order('created_at', { ascending: false });
```

---

## 🔗 Связанные документы

- [CODEBASE_INDEX.md](./docs/CODEBASE_INDEX.md) — Индекс кодовой базы
- [TESTING.md](./TESTING.md) — Тестирование
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Развертывание
- [Supabase Docs](https://supabase.com/docs)
- [PostgREST Docs](https://postgrest.org/)

---

<p align="center">
  <strong>API Version: 1.0.0</strong><br>
  <em>Last updated: March 2026</em>
</p>
