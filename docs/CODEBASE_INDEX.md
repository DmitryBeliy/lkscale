# Lkscale - Индекс кодовой базы

> **FastShot App** — React Native/Expo приложение для управления бизнесом (ERP/CRM система)
> 
> Версия: 1.0.0 | Expo SDK 54 | React Native 0.81.5

---

## Содержание

1. [Обзор архитектуры](#1-обзор-архитектуры)
2. [Модули приложения](#2-модули-приложения)
3. [Компоненты UI](#3-компоненты-ui)
4. [Система состояния](#4-система-состояния)
5. [Сервисы](#5-сервисы)
6. [Типы и модели](#6-типы-и-модели)
7. [Навигация](#7-навигация)
8. [Ключевые зависимости](#8-ключевые-зависимости)

---

## 1. Обзор архитектуры

### 1.1 Стек технологий

| Слой | Технология |
|------|------------|
| **Фреймворк** | React Native 0.81.5 + Expo SDK 54 |
| **Маршрутизация** | Expo Router 6 (File-based routing) |
| **Состояние** | Zustand-inspired pattern (custom stores) |
| **База данных** | Supabase (PostgreSQL + Realtime) |
| **UI** | React Native + Custom Design System |
| **Стилизация** | StyleSheet API + Theme Context |
| **Анимации** | React Native Reanimated 4 |
| **Иконки** | @expo/vector-icons (Ionicons) |
| **Локализация** | Context-based (RU/EN) |

### 1.2 Архитектурные паттерны

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Screens   │  │  Components │  │      Contexts       │  │
│  │   (app/)    │  │ (components/)│  │   (contexts/)       │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
├─────────┼────────────────┼────────────────────┼─────────────┤
│         │                │                    │             │
│         ▼                ▼                    ▼             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    State Layer                         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌─────────────────┐  │  │
│  │  │ authStore  │  │ dataStore  │  │ notificationStore│  │  │
│  │  └────────────┘  └────────────┘  └─────────────────┘  │  │
│  └────────────────────────┬──────────────────────────────┘  │
├───────────────────────────┼─────────────────────────────────┤
│                           │                                 │
│                           ▼                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Service Layer                        │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐  │  │
│  │  │  analytics  │ │  warehouse  │ │   enterprise    │  │  │
│  │  │  aiInsights │ │   offline   │ │     security    │  │  │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘  │  │
│  └────────────────────────┬──────────────────────────────┘  │
├───────────────────────────┼─────────────────────────────────┤
│                           │                                 │
│                           ▼                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                 Data Layer                             │  │
│  │  ┌────────────────┐      ┌────────────────────────┐  │  │
│  │  │    Supabase    │      │    AsyncStorage        │  │  │
│  │  │  (lib/*.ts)    │      │    (offline cache)     │  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Структура директорий

```
app/                    # File-based routing (Expo Router)
├── (tabs)/             # Группа с нижней навигацией
├── auth/               # OAuth callbacks
├── cfo/                # Финансовый директор
├── customers/          # Управление клиентами
├── executive/          # Executive dashboard
├── finance/            # Финансы
├── loyalty/            # Программа лояльности
├── marketing/          # Маркетинг
├── order/              # Заказы
├── onboarding/         # Онбординг
├── product/            # Управление товарами
├── reports/            # Отчеты
├── security/           # Безопасность
├── settings/           # Настройки
├── stores/             # Управление магазинами
├── suppliers/          # Поставщики
├── support/            # Поддержка
├── team/               # Управление командой
├── telegram/           # Telegram интеграция
└── warehouse/          # Складские операции

components/             # React компоненты
├── ui/                 # Базовые UI компоненты
├── charts/             # Графики и визуализации
└── warehouse/          # Компоненты склада

store/                  # State management
├── authStore.ts        # Аутентификация
├── dataStore.ts        # Бизнес-данные
├── notificationStore.ts# Уведомления
└── syncStore.ts        # Синхронизация

services/               # Бизнес-логика
├── aiInsights.ts       # AI-аналитика
├── analyticsService.ts # Аналитика
├── demoDataService.ts  # Демо-данные
├── documentExportService.ts # Экспорт документов
├── enterpriseService.ts# Enterprise функции
├── offlineService.ts   # Оффлайн режим
├── securityService.ts  # Безопасность
├── storeSettingsService.ts # Настройки магазина
└── warehouseService.ts # Складские операции

lib/                    # Инфраструктура
├── supabase.ts         # Supabase клиент
└── supabaseDataService.ts # Работа с данными

types/                  # TypeScript типы
├── database.ts         # Supabase database types
├── enterprise.ts       # Enterprise types
└── index.ts            # Основные types

contexts/               # React Contexts
├── OnboardingContext.tsx
├── ThemeContext.tsx
└── LocalizationContext.tsx

localization/           # Локализация
├── translations.ts     # Переводы RU/EN
└── index.ts

constants/              # Константы
└── theme.ts            # Тема и цвета

assets/                 # Статические ресурсы
├── fonts/
└── images/
```

---

## 2. Модули приложения

### 2.1 Авторизация (`app/login.tsx`, `app/auth/`)

**Файлы:**
- `app/login.tsx` — Экран входа/регистрации
- `app/auth/callback.tsx` — OAuth callback handler

**Функционал:**
- Email/password аутентификация
- OAuth интеграции
- "Запомнить меня"
- Восстановление пароля

**Связи:**
- Использует `@fastshot/auth` — внешний auth provider
- [`store/authStore.ts`](store/authStore.ts) — глобальное состояние авторизации

---

### 2.2 Главные вкладки (`app/(tabs)/`)

| Экран | Файл | Описание |
|-------|------|----------|
| **Главная** | [`index.tsx`](app/(tabs)/index.tsx) | Dashboard с KPI, AI-инсайтами, быстрыми действиями |
| **Заказы** | [`orders.tsx`](app/(tabs)/orders.tsx) | Список заказов, фильтрация по статусу |
| **Склад** | [`inventory.tsx`](app/(tabs)/inventory.tsx) | Управление товарами, остатками |
| **Ассистент** | [`assistant.tsx`](app/(tabs)/assistant.tsx) | AI-ассистент для бизнеса |
| **Профиль** | [`profile.tsx`](app/(tabs)/profile.tsx) | Профиль пользователя, настройки |

**Layout:** [`app/(tabs)/_layout.tsx`](app/(tabs)/_layout.tsx)
- Bottom Tab Navigator
- Иконки: Ionicons
- 5 вкладок с кастомными стилями

---

### 2.3 Управление товаром (`app/product/`, `app/warehouse/`)

#### Product Module
| Файл | Назначение |
|------|------------|
| [`app/product/[id].tsx`](app/product/[id].tsx) | Детальная карточка товара |
| [`app/product/edit/[id].tsx`](app/product/edit/[id].tsx) | Редактирование товара |

#### Warehouse Module
| Файл | Назначение |
|------|------------|
| [`app/warehouse/index.tsx`](app/warehouse/index.tsx) | Главный экран склада |
| [`app/warehouse/stock_in.tsx`](app/warehouse/stock_in.tsx) | Приемка товара |
| [`app/warehouse/transfer.tsx`](app/warehouse/transfer.tsx) | Перемещение между складами |
| [`app/warehouse/adjustment.tsx`](app/warehouse/adjustment.tsx) | Корректировка остатков |
| [`app/warehouse/write_off.tsx`](app/warehouse/write_off.tsx) | Списание товара |
| [`app/warehouse/return.tsx`](app/warehouse/return.tsx) | Возвраты |
| [`app/warehouse/price-tags.tsx`](app/warehouse/price-tags.tsx) | Печать ценников |
| [`app/warehouse/forecasts.tsx`](app/warehouse/forecasts.tsx) | Прогнозы запасов |

**Связи:**
- [`services/warehouseService.ts`](services/warehouseService.ts)
- [`components/warehouse/`](components/warehouse/)

---

### 2.4 Заказы (`app/order/`, `app/customers/`)

#### Orders Module
| Файл | Назначение |
|------|------------|
| [`app/order/[id].tsx`](app/order/[id].tsx) | Детали заказа |
| [`app/order/create.tsx`](app/order/create.tsx) | Создание заказа |

#### Customers Module
| Файл | Назначение |
|------|------------|
| [`app/customers/index.tsx`](app/customers/index.tsx) | Список клиентов |
| [`app/customers/[id].tsx`](app/customers/[id].tsx) | Карточка клиента (CRM) |

**Связи:**
- [`components/OrderCard.tsx`](components/OrderCard.tsx)
- [`store/dataStore.ts`](store/dataStore.ts) — заказы и клиенты

---

### 2.5 Финансы (`app/finance/`, `app/cfo/`, `app/reports/`)

| Модуль | Файл | Назначение |
|--------|------|------------|
| **Finance** | [`app/finance/index.tsx`](app/finance/index.tsx) | Управление финансами, расходы |
| **CFO** | [`app/cfo/index.tsx`](app/cfo/index.tsx) | CFO Dashboard, аналитика |
| **Reports** | [`app/reports/index.tsx`](app/reports/index.tsx) | Финансовые отчеты |

**Связи:**
- [`services/enterpriseService.ts`](services/enterpriseService.ts)
- [`types/enterprise.ts`](types/enterprise.ts) — `Expense`, `FinancialSummary`

---

### 2.6 Лояльность (`app/loyalty/`)

| Файл | Назначение |
|------|------------|
| [`app/loyalty/index.tsx`](app/loyalty/index.tsx) | Программа лояльности |
| [`app/loyalty/coupons.tsx`](app/loyalty/coupons.tsx) | Управление купонами |
| [`app/loyalty/coupon/create.tsx`](app/loyalty/coupon/create.tsx) | Создание купона |
| [`app/loyalty/customer/[id].tsx`](app/loyalty/customer/[id].tsx) | Карточка лояльности клиента |

---

### 2.7 Маркетинг (`app/marketing/`)

| Файл | Назначение |
|------|------------|
| [`app/marketing/index.tsx`](app/marketing/index.tsx) | Маркетинговый dashboard |
| [`app/marketing/churn-analysis.tsx`](app/marketing/churn-analysis.tsx) | Анализ оттока |
| [`app/marketing/staff-performance.tsx`](app/marketing/staff-performance.tsx) | Эффективность персонала |

---

### 2.8 Команда (`app/team/`)

| Файл | Назначение |
|------|------------|
| [`app/team/index.tsx`](app/team/index.tsx) | Список сотрудников |
| [`app/team/[id].tsx`](app/team/[id].tsx) | Профиль сотрудника |
| [`app/team/invite.tsx`](app/team/invite.tsx) | Приглашение сотрудников |
| [`app/team/activity.tsx`](app/team/activity.tsx) | Активность команды |
| [`app/team/shifts.tsx`](app/team/shifts.tsx) | Управление сменами |

---

### 2.9 Настройки (`app/settings/`)

| Файл | Назначение |
|------|------------|
| [`app/settings/business.tsx`](app/settings/business.tsx) | Настройки бизнеса |
| [`app/settings/store.tsx`](app/settings/store.tsx) | Настройки магазина |
| [`app/settings/regional.tsx`](app/settings/regional.tsx) | Региональные настройки |
| [`app/settings/notifications.tsx`](app/settings/notifications.tsx) | Уведомления |
| [`app/settings/biometric.tsx`](app/settings/biometric.tsx) | Биометрический вход |
| [`app/settings/announcements.tsx`](app/settings/announcements.tsx) | Объявления |

---

### 2.10 Поставщики (`app/suppliers/`)

| Файл | Назначение |
|------|------------|
| [`app/suppliers/index.tsx`](app/suppliers/index.tsx) | Список поставщиков |
| [`app/suppliers/[id].tsx`](app/suppliers/[id].tsx) | Карточка поставщика |
| [`app/suppliers/create.tsx`](app/suppliers/create.tsx) | Добавление поставщика |
| [`app/suppliers/history/[id].tsx`](app/suppliers/history/[id].tsx) | История закупок |

---

### 2.11 Дополнительные модули

| Модуль | Путь | Описание |
|--------|------|----------|
| **Executive** | [`app/executive/`](app/executive/) | Executive dashboard |
| **Security** | [`app/security/`](app/security/) | Безопасность, аудит |
| **Stores** | [`app/stores/`](app/stores/) | Управление магазинами |
| **Telegram** | [`app/telegram/`](app/telegram/) | Telegram интеграция |
| **Support** | [`app/support/`](app/support/) | FAQ, обратная связь |
| **Onboarding** | [`app/onboarding/`](app/onboarding/) | Первичная настройка |
| **Notifications** | [`app/notifications.tsx`](app/notifications.tsx) | Центр уведомлений |
| **Paywall** | [`app/paywall.tsx`](app/paywall.tsx) | Подписки и тарифы |

---

## 3. Компоненты UI

### 3.1 Базовые UI компоненты (`components/ui/`)

| Компонент | Файл | Назначение |
|-----------|------|------------|
| **Button** | [`Button.tsx`](components/ui/Button.tsx) | Кнопки с вариантами (primary, secondary, outline) |
| **Card** | [`Card.tsx`](components/ui/Card.tsx) | Карточки с тенями |
| **Input** | [`Input.tsx`](components/ui/Input.tsx) | Поля ввода с валидацией |
| **Skeleton** | [`Skeleton.tsx`](components/ui/Skeleton.tsx) | Скелетоны загрузки |
| **StatusBadge** | [`StatusBadge.tsx`](components/ui/StatusBadge.tsx) | Бейджи статусов |
| **EmptyState** | [`EmptyState.tsx`](components/ui/EmptyState.tsx) | Пустые состояния |
| **OfflineBanner** | [`OfflineBanner.tsx`](components/ui/OfflineBanner.tsx) | Индикатор оффлайн режима |

**Экспорты:** [`components/ui/index.ts`](components/ui/index.ts)

---

### 3.2 Бизнес-компоненты (`components/`)

| Компонент | Файл | Назначение |
|-----------|------|------------|
| **ActivityItem** | [`ActivityItem.tsx`](components/ActivityItem.tsx) | Элемент активности |
| **AISmartSearch** | [`AISmartSearch.tsx`](components/AISmartSearch.tsx) | AI-поиск |
| **AIVirtualGuide** | [`AIVirtualGuide.tsx`](components/AIVirtualGuide.tsx) | Виртуальный гид |
| **BarcodeScanner** | [`BarcodeScanner.tsx`](components/BarcodeScanner.tsx) | Сканер штрих-кодов |
| **CelebrationAnimation** | [`CelebrationAnimation.tsx`](components/CelebrationAnimation.tsx) | Анимации достижений |
| **CloudStatusIndicator** | [`CloudStatusIndicator.tsx`](components/CloudStatusIndicator.tsx) | Статус облака |
| **GuidedTour** | [`GuidedTour.tsx`](components/GuidedTour.tsx) | Обучающий тур |
| **ImagePicker** | [`ImagePicker.tsx`](components/ImagePicker.tsx) | Выбор изображений |
| **KPICard** | [`KPICard.tsx`](components/KPICard.tsx) | Карточка KPI |
| **OrderCard** | [`OrderCard.tsx`](components/OrderCard.tsx) | Карточка заказа |
| **ProductCard** | [`ProductCard.tsx`](components/ProductCard.tsx) | Карточка товара |
| **SyncStatusIndicator** | [`SyncStatusIndicator.tsx`](components/SyncStatusIndicator.tsx) | Статус синхронизации |

---

### 3.3 Компоненты графиков (`components/charts/`)

| Компонент | Файл | Назначение |
|-----------|------|------------|
| **AnalyticsCharts** | [`AnalyticsCharts.tsx`](components/charts/AnalyticsCharts.tsx) | Аналитические графики |
| **ExecutiveCharts** | [`ExecutiveCharts.tsx`](components/charts/ExecutiveCharts.tsx) | Executive графики |
| **SalesChart** | [`SalesChart.tsx`](components/charts/SalesChart.tsx) | График продаж |

---

### 3.4 Компоненты склада (`components/warehouse/`)

| Компонент | Файл | Назначение |
|-----------|------|------------|
| **SupplierCard** | [`SupplierCard.tsx`](components/warehouse/SupplierCard.tsx) | Карточка поставщика |
| **WarehouseButton** | [`WarehouseButton.tsx`](components/warehouse/WarehouseButton.tsx) | Кнопки операций |
| **WarehouseIcons** | [`WarehouseIcons.tsx`](components/warehouse/WarehouseIcons.tsx) | Иконки склада |
| **WarehouseOperationCard** | [`WarehouseOperationCard.tsx`](components/warehouse/WarehouseOperationCard.tsx) | Карточка операции |
| **WarehouseScanner** | [`WarehouseScanner.tsx`](components/warehouse/WarehouseScanner.tsx) | Сканер для склада |

---

## 4. Система состояния

### 4.1 Архитектура State Management

Приложение использует **custom state management** с паттерном pub/sub (не Zustand напрямую, а собственная реализация).

### 4.2 Auth Store (`store/authStore.ts`)

**Экспорты:**
```typescript
getAuthState()              // Получить текущее состояние
subscribeAuth(listener)     // Подписка на изменения
setAuthState(updates)       // Обновить состояние
initializeAuth()            // Инициализация из Supabase
signIn(email, password)     // Вход
signUp(email, password)     // Регистрация
signOut()                   // Выход
getCurrentUserId()          // ID текущего пользователя
```

**Состояние (`AuthState`):**
- `isAuthenticated: boolean`
- `isLoading: boolean`
- `user: User | null`
- `rememberMe: boolean`

### 4.3 Data Store (`store/dataStore.ts`)

**Экспорты:**
```typescript
// Получение состояния
getDataState()
subscribeDataStore(listener)

// Загрузка данных
loadCachedData()
fetchAllData()

// Товары
fetchProducts()
createProduct(data)
updateProduct(id, data)
deleteProduct(id)

// Клиенты
fetchCustomers()
createCustomer(data)
updateCustomer(id, data)
deleteCustomer(id)

// Заказы
fetchOrders()
createOrder(data)
updateOrder(id, data)

// Подписки realtime
subscribeToRealtime()
unsubscribeFromRealtime()
```

**Состояние:**
- `products: Product[]`
- `customers: Customer[]`
- `orders: Order[]`
- `kpi: KPIData`
- `activities: Activity[]`
- `isLoading, isSyncing, error`

### 4.4 Notification Store (`store/notificationStore.ts`)

**Функционал:**
- Управление уведомлениями
- Отметка прочитанных
- Удаление
- Push-уведомления

### 4.5 Sync Store (`store/syncStore.ts`)

**Функционал:**
- Статус синхронизации
- Оффлайн очередь
- Конфликты синхронизации
- Последняя синхронизация

---

## 5. Сервисы

### 5.1 AI Insights (`services/aiInsights.ts`)

```typescript
generateBusinessInsights(data: BusinessData): Promise<AIInsight[]>
```

- Интеграция с `@fastshot/ai`
- Генерация бизнес-инсайтов на основе KPI
- Анализ трендов и рекомендации

### 5.2 Analytics Service (`services/analyticsService.ts`)

```typescript
getDateRange(period: TimePeriod): { start: Date; end: Date }
filterOrdersByPeriod(orders, period): Order[]
generateRevenueVsProfitData(orders, products, period): RevenueVsProfitData[]
generateCategorySalesData(orders, products): CategorySalesData[]
calculateProjectedTaxes(orders, taxRate, period): TaxProjection
findDeadStock(orders, products, days): Product[]
generateWeeklyComparison(orders, products): WeeklyComparison
```

### 5.3 Enterprise Service (`services/enterpriseService.ts`)

**Multi-store:**
- `mockStores: Store[]` — данные магазинов
- `mockExpenses: Expense[]` — расходы

**Финансы:**
- `calculateExpenseBreakdown(expenses): ExpenseBreakdown`
- `calculateFinancialSummary(stores, orders, expenses): FinancialSummary`
- `generateConsolidatedReport(stores, orders, expenses, period): ConsolidatedReport`

**Перемещения:**
- `createStockTransfer(data): StockTransfer`
- `updateStockTransferStatus(id, status): StockTransfer`

### 5.4 Offline Service (`services/offlineService.ts`)

**Типы операций:**
```typescript
type OfflineOperationType = 
  | 'create_order'
  | 'update_order'
  | 'update_stock'
  | 'create_product'
  | 'update_product'
```

**API:**
```typescript
queueOperation(type, entityId, data): Promise<void>
processQueue(): Promise<ProcessQueueResult>
getPendingCount(): Promise<number>
getQueueSummary(): Promise<OfflineDataSummary>
resolveConflict(operationId, strategy): Promise<void>
```

### 5.5 Warehouse Service (`services/warehouseService.ts`)

```typescript
// Операции склада
processStockIn(data): Promise<StockInResult>
processStockTransfer(data): Promise<TransferResult>
processAdjustment(data): Promise<AdjustmentResult>
processWriteOff(data): Promise<WriteOffResult>
processReturn(data): Promise<ReturnResult>

// Прогнозы
generateStockForecasts(products): ForecastData[]

// Ценники
generatePriceTags(products): PriceTagData[]
```

### 5.6 Другие сервисы

| Сервис | Файл | Назначение |
|--------|------|------------|
| **Demo Data** | [`demoDataService.ts`](services/demoDataService.ts) | Генерация демо-данных |
| **Document Export** | [`documentExportService.ts`](services/documentExportService.ts) | Экспорт в PDF/Excel |
| **Security** | [`securityService.ts`](services/securityService.ts) | Безопасность и аудит |
| **Store Settings** | [`storeSettingsService.ts`](services/storeSettingsService.ts) | Настройки магазина |

---

## 6. Типы и модели

### 6.1 Основные типы (`types/index.ts`)

```typescript
// Пользователь
interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  balance: number;
  createdAt: string;
}

// Клиент (CRM)
interface Customer {
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

// Заказ
interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  totalAmount: number;
  itemsCount: number;
  createdAt: string;
  updatedAt: string;
  customerId?: string;
  customer?: { name: string; phone?: string; address?: string };
  items: OrderItem[];
  notes?: string;
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'online';
}

// Товар
interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  costPrice: number;
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
  margin?: number;
  profit?: number;
}

// KPI
interface KPIData {
  totalSales: number;
  salesChange: number;
  activeOrders: number;
  ordersChange: number;
  balance: number;
  lowStockItems: number;
}

// AI Insight
interface AIInsight {
  id: string;
  type: 'trend' | 'recommendation' | 'alert';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable?: boolean;
  action?: string;
}
```

### 6.2 Enterprise типы (`types/enterprise.ts`)

```typescript
// Магазин (multi-store)
interface Store {
  id: string;
  ownerId: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  managerName?: string;
  isMain: boolean;
  isActive: boolean;
  timezone?: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

// Перемещение
interface StockTransfer {
  id: string;
  transferNumber: string;
  fromStoreId: string;
  toStoreId: string;
  status: 'pending' | 'in_transit' | 'received' | 'cancelled';
  items: StockTransferItem[];
}

// Расход
interface Expense {
  id: string;
  ownerId: string;
  storeId?: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

type ExpenseCategory = 
  | 'rent' | 'salaries' | 'utilities' | 'taxes' 
  | 'inventory' | 'marketing' | 'equipment' | 'supplies' 
  | 'insurance' | 'maintenance' | 'delivery' | 'banking' | 'other';

// Финансовая сводка
interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  expenseBreakdown: ExpenseBreakdown;
}
```

### 6.3 Database типы (`types/database.ts`)

TypeScript definitions для Supabase таблиц:
- `customers` — клиенты
- `orders` — заказы
- `products` — товары
- `users` — пользователи
- И другие...

---

## 7. Навигация

### 7.1 Структура Expo Router

```
app/
├── _layout.tsx              # Root layout с провайдерами
├── index.tsx                # Entry point (редирект)
├── login.tsx                # Auth screen
├── (tabs)/                  # Tab group
│   ├── _layout.tsx          # Tab navigator
│   ├── index.tsx            # Home/Dashboard
│   ├── orders.tsx           # Orders list
│   ├── inventory.tsx        # Inventory
│   ├── assistant.tsx        # AI Assistant
│   └── profile.tsx          # Profile
├── order/
│   ├── [id].tsx             # Order details
│   └── create.tsx           # Create order
├── product/
│   ├── [id].tsx             # Product details
│   └── edit/
│       └── [id].tsx         # Edit product
└── [other]/                 # Other modules
```

### 7.2 Root Layout (`app/_layout.tsx`)

**Провайдеры (внешний → внутренний):**
1. `GestureHandlerRootView` — жесты
2. `SafeAreaProvider` — безопасные зоны
3. `AuthProvider` (@fastshot/auth) — аутентификация
4. `LocalizationProvider` — локализация
5. `ThemeProvider` — тема
6. `OnboardingProvider` — онбординг
7. `Stack` — навигация

**Stack Screens:**
- `index` — главная
- `login` — вход (fade animation)
- `(tabs)` — табы (fade animation)
- `order/[id]`, `order/create` — заказы (card presentation)
- `product/[id]`, `product/edit/[id]` — товары
- `customers/*` — клиенты
- `finance`, `cfo`, `reports` — финансы
- `notifications` — уведомления
- `paywall` — подписки (modal)
- `onboarding/index` — онбординг
- `support/*` — поддержка

### 7.3 Tab Navigation (`app/(tabs)/_layout.tsx`)

| Вкладка | Иконка | Описание |
|---------|--------|----------|
| index | home | Главная |
| orders | receipt | Заказы |
| inventory | cube | Склад |
| assistant | sparkles | AI Ассистент |
| profile | person | Профиль |

---

## 8. Ключевые зависимости

### 8.1 Core Dependencies

```json
{
  "react": "19.1.0",
  "react-native": "0.81.5",
  "expo": "^54.0.21",
  "expo-router": "~6.0.14"
}
```

### 8.2 UI & Styling

| Пакет | Версия | Назначение |
|-------|--------|------------|
| `@expo/vector-icons` | ^15.0.2 | Иконки |
| `expo-image` | ~3.0.10 | Оптимизированные изображения |
| `expo-linear-gradient` | ~15.0.8 | Градиенты |
| `expo-blur` | ~15.0.7 | Эффект размытия |
| `react-native-reanimated` | ~4.1.1 | Анимации |
| `react-native-gesture-handler` | ~2.28.0 | Жесты |

### 8.3 Backend & Data

| Пакет | Версия | Назначение |
|-------|--------|------------|
| `@supabase/supabase-js` | ^2.95.2 | Supabase клиент |
| `@react-native-async-storage/async-storage` | ^2.2.0 | Локальное хранилище |
| `@react-native-community/netinfo` | ^11.5.2 | Статус сети |

### 8.4 Auth & Security

| Пакет | Версия | Назначение |
|-------|--------|------------|
| `@fastshot/auth` | ^1.1.0 | Аутентификация |
| `expo-local-authentication` | ~17.0.8 | Биометрия |
| `expo-secure-store` | (встроен) | Безопасное хранение |

### 8.5 AI & Analytics

| Пакет | Версия | Назначение |
|-------|--------|------------|
| `@fastshot/ai` | ^1.0.5 | AI интеграция |

### 8.6 Device Features

| Пакет | Версия | Назначение |
|-------|--------|------------|
| `expo-camera` | ^17.0.10 | Камера и сканирование |
| `expo-barcode-scanner` | (встроен) | Сканер штрих-кодов |
| `expo-haptics` | ~15.0.7 | Виброотклик |
| `expo-print` | ~15.0.8 | Печать |
| `expo-sharing` | ^14.0.8 | Шеринг |
| `expo-image-picker` | ~17.0.10 | Выбор фото |

### 8.7 Utilities

| Пакет | Версия | Назначение |
|-------|--------|------------|
| `expo-linking` | ~8.0.8 | Deep linking |
| `expo-web-browser` | ~15.0.8 | In-app браузер |
| `expo-clipboard` | ~8.0.8 | Буфер обмена |
| `expo-constants` | ~18.0.9 | Константы |
| `expo-file-system` | ~19.0.21 | Файловая система |

---

## 9. Конфигурация

### 9.1 TypeScript (`tsconfig.json`)

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Path aliases:** `@/` → корень проекта

### 9.2 Expo (`app.json`)

```json
{
  "expo": {
    "name": "Lkscale",
    "slug": "lkscale",
    "scheme": "fastshot",
    "plugins": ["expo-router", "expo-splash-screen"],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

### 9.3 Тема (`constants/theme.ts`)

**Light/Dark modes:**
- `lightColors` — светлая тема
- `darkColors` — тёмная тема
- Поддержка через `ThemeContext`

**Цветовая палитра:**
- Primary: `#2c7be5`
- Success: `#00d97e`
- Warning: `#f6c343`
- Error: `#e63757`
- Info: `#39afd1`

---

## 10. Связи и потоки данных

### 10.1 Аутентификация

```
login.tsx 
    → @fastshot/auth 
    → store/authStore.ts 
    → supabase.ts
```

### 10.2 Загрузка данных

```
Tabs Screen Mount
    → store/dataStore.ts::fetchAllData()
    → lib/supabaseDataService.ts
    → Supabase API
    → AsyncStorage (cache)
```

### 10.3 Realtime обновления

```
Supabase Realtime
    → lib/supabaseDataService.ts::subscribeTo*
    → store/dataStore.ts (update state)
    → Компоненты (rerender)
```

### 10.4 Оффлайн режим

```
Действие (createOrder)
    → services/offlineService.ts::queueOperation()
    → AsyncStorage (queue)
    → При восстановлении сети:
        → processQueue()
        → Supabase API
```

---

## 11. Быстрые ссылки

### Часто используемые файлы

| Задача | Файл |
|--------|------|
| Добавить экран | `app/название/index.tsx` |
| Изменить тему | `constants/theme.ts` |
| Добавить тип | `types/index.ts` или `types/enterprise.ts` |
| Изменить перевод | `localization/translations.ts` |
| Добавить API метод | `lib/supabaseDataService.ts` |
| Добавить бизнес-логику | `services/*.ts` |
| Добавить компонент | `components/ui/*.tsx` или `components/*.tsx` |

---

*Документ создан автоматически. Обновляйте при значительных изменениях архитектуры.*

---

## Приложение A: Обновленная модульная структура State Management

### A.1 Новая архитектура store/ (Март 2026)

```
store/
├── index.ts                        # Главный экспорт всех stores
├── authStore.ts                    # Аутентификация
├── dataStore.ts                    # Legacy: основные бизнес-данные
├── notificationStore.ts            # Уведомления
├── auth/
│   └── index.ts                    # Auth utilities
├── core/
│   ├── cacheService.ts             # Кэширование
│   ├── subscriptionService.ts      # Подписки realtime
│   ├── types.ts                    # Базовые типы store
│   └── index.ts
├── customers/                      # NEW: Customer Feature Module
│   ├── customerStore.ts            # Состояние клиентов
│   ├── customerActions.ts          # CRUD операции
│   ├── customerTypes.ts            # Типы
│   └── index.ts
├── orders/                         # NEW: Order Feature Module
│   ├── orderStore.ts               # Состояние заказов
│   ├── orderActions.ts             # CRUD операции
│   ├── orderTypes.ts               # Типы
│   └── index.ts
├── products/                       # NEW: Product Feature Module
│   ├── productStore.ts             # Состояние товаров
│   ├── productActions.ts           # CRUD операции
│   ├── productTypes.ts             # Типы
│   └── index.ts
└── mocks/
    ├── mockData.ts                 # Демо-данные
    └── index.ts
```

### A.2 Customer Store API

**Файл:** [`store/customers/customerStore.ts`](store/customers/customerStore.ts)

```typescript
// Получение данных
getCustomers(): Customer[]
getCustomerById(id: string): Customer | undefined
getCustomerStats(): CustomerStats

// CRUD операции
fetchCustomers(): Promise<void>
addCustomer(data: Partial<Customer>): Promise<Customer | null>
updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | null>
deleteCustomer(id: string): Promise<boolean>

// Сегментация
getVipCustomers(): Customer[]
getCustomersBySegment(segment: CustomerValueTag): Customer[]
getInactiveCustomers(days: number): Customer[]

// AI-функции
getCustomerInsights(id: string): CustomerInsight[]
generateRecommendations(id: string): ProductRecommendation[]
```

### A.3 Order Store API

**Файл:** [`store/orders/orderStore.ts`](store/orders/orderStore.ts)

```typescript
// Получение данных
getOrders(): Order[]
getOrderById(id: string): Order | undefined
getOrdersByStatus(status: OrderStatus): Order[]
getOrdersByCustomer(customerId: string): Order[]

// CRUD операции
fetchOrders(): Promise<void>
createOrder(data: NewOrderData): Promise<Order | null>
updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null>
deleteOrder(id: string): Promise<boolean>

// Аналитика
getOrderStats(period: TimePeriod): OrderStats
getRevenueByPeriod(start: Date, end: Date): RevenueData
getTopProducts(period: TimePeriod): ProductSales[]
```

### A.4 Product Store API

**Файл:** [`store/products/productStore.ts`](store/products/productStore.ts)

```typescript
// Получение данных
getProducts(): Product[]
getProductById(id: string): Product | undefined
getProductsByCategory(category: string): Product[]
getLowStockProducts(): Product[]

// CRUD операции
fetchProducts(): Promise<void>
createProduct(data: Partial<Product>): Promise<Product | null>
updateProduct(id: string, data: Partial<Product>): Promise<Product | null>
deleteProduct(id: string): Promise<boolean>

// Остатки
updateStock(id: string, quantity: number, reason: StockChangeReason): Promise<void>
getStockHistory(id: string): StockHistoryEntry[]
getProductAnalytics(id: string): ProductAnalytics

// Варианты
getProductVariants(productId: string): ProductVariant[]
createVariant(productId: string, data: Partial<ProductVariant>): Promise<ProductVariant>
```

---

## Приложение B: Расширенные сервисы

### B.1 Security Service

**Файл:** [`services/securityService.ts`](services/securityService.ts)

```typescript
// Аудит действий
logAuditAction(action: AuditAction): Promise<void>
getAuditLogs(filters: AuditFilters): Promise<AuditLog[]>

// Обнаружение конфликтов
detectSyncConflicts(): Promise<Conflict[]>
resolveConflict(conflictId: string, strategy: ConflictStrategy): Promise<void>

// Безопасность
validateAccess(resource: string, action: string): Promise<boolean>
encryptSensitiveData(data: string): Promise<EncryptedData>
decryptSensitiveData(data: EncryptedData): Promise<string>
```

### B.2 Store Settings Service

**Файл:** [`services/storeSettingsService.ts`](services/storeSettingsService.ts)

```typescript
// Настройки бизнеса
getBusinessSettings(): Promise<BusinessSettings>
updateBusinessSettings(data: Partial<BusinessSettings>): Promise<void>

// Настройки магазина
getStoreSettings(storeId: string): Promise<StoreSettings>
updateStoreSettings(storeId: string, data: Partial<StoreSettings>): Promise<void>

// Региональные настройки
getRegionalSettings(): Promise<RegionalSettings>
updateRegionalSettings(data: Partial<RegionalSettings>): Promise<void>
```

### B.3 Document Export Service

**Файл:** [`services/documentExportService.ts`](services/documentExportService.ts)

```typescript
// Экспорт в PDF
generateOrderPDF(orderId: string): Promise<PDFDocument>
generateInvoicePDF(orderId: string): Promise<PDFDocument>
generatePriceListPDF(filters: ProductFilters): Promise<PDFDocument>

// Экспорт в Excel
generateSalesReportExcel(period: TimePeriod): Promise<ExcelDocument>
generateInventoryReportExcel(): Promise<ExcelDocument>
generateCustomerReportExcel(): Promise<ExcelDocument>

// Печать
printPriceTags(productIds: string[]): Promise<void>
printReceipt(orderId: string): Promise<void>
```

### B.4 Demo Data Service

**Файл:** [`services/demoDataService.ts`](services/demoDataService.ts)

```typescript
// Генерация демо-данных
generateDemoProducts(count: number): Promise<Product[]>
generateDemoCustomers(count: number): Promise<Customer[]>
generateDemoOrders(count: number): Promise<Order[]>

// Сброс данных
resetToDemoData(): Promise<void>
clearAllData(): Promise<void>

// Сценарии
setupDemoScenario(scenario: 'electronics' | 'fashion' | 'food'): Promise<void>
```

---

## Приложение C: Локализация

### C.1 Структура переводов

**Файл:** [`localization/translations.ts`](localization/translations.ts)

```typescript
export const translations = {
  ru: {
    // 800+ строк переводов
    common: {
      loading: 'Загрузка...',
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      // ...
    },
    auth: {
      login: 'Вход',
      register: 'Регистрация',
      forgotPassword: 'Забыли пароль?',
      // ...
    },
    products: {
      title: 'Товары',
      create: 'Создать товар',
      edit: 'Редактировать товар',
      // ...
    },
    orders: { ... },
    customers: { ... },
    warehouse: { ... },
    finance: { ... },
    reports: { ... },
    settings: { ... },
    errors: { ... }
  },
  en: { ... }
};
```

### C.2 Использование

```typescript
import { useLocalization } from '@/localization/LocalizationContext';

function MyComponent() {
  const { t, locale, setLocale, availableLocales } = useLocalization();
  
  return (
    <View>
      <Text>{t('products.create.title')}</Text>
      <Button 
        title={locale === 'ru' ? 'English' : 'Русский'}
        onPress={() => setLocale(locale === 'ru' ? 'en' : 'ru')}
      />
    </View>
  );
}
```

---

## Приложение D: Контексты приложения

### D.1 Onboarding Context

**Файл:** [`contexts/OnboardingContext.tsx`](contexts/OnboardingContext.tsx)

```typescript
interface OnboardingContextType {
  hasCompletedOnboarding: boolean;
  completeOnboarding(): Promise<void>;
  resetOnboarding(): Promise<void>;
  currentStep: number;
  totalSteps: number;
  nextStep(): void;
  prevStep(): void;
  skipOnboarding(): void;
}
```

**Шаги онбординга:**
1. Добро пожаловать
2. Настройка бизнеса
3. Добавление первого товара
4. Создание первого заказа
5. Знакомство с аналитикой

### D.2 Theme Context

**Файл:** [`contexts/ThemeContext.tsx`](contexts/ThemeContext.tsx)

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  colors: ThemeColors;
  setTheme(theme: ThemeType): void;
  isDark: boolean;
  toggleTheme(): void;
}
```

---

## Приложение E: Дополнительные модули приложения

### E.1 Telegram Integration

**Файл:** [`app/telegram/index.tsx`](app/telegram/index.tsx)

- Подключение Telegram бота
- Уведомления о заказах
- Команды управления

### E.2 CFO Dashboard

**Файл:** [`app/cfo/index.tsx`](app/cfo/index.tsx)

- Финансовая аналитика
- Управление расходами
- Налоговые отчеты
- P&L анализ

### E.3 Executive Reports

**Файл:** [`app/executive/index.tsx`](app/executive/index.tsx)

- Стратегическая аналитика
- Сравнение периодов
- Прогнозы
- KPI executive view

### E.4 Marketing Analytics

**Файлы:**
- [`app/marketing/index.tsx`](app/marketing/index.tsx)
- [`app/marketing/churn-analysis.tsx`](app/marketing/churn-analysis.tsx)
- [`app/marketing/staff-performance.tsx`](app/marketing/staff-performance.tsx)

- Анализ оттока клиентов
- Эффективность персонала
- Маркетинговые кампании

---

## Приложение F: Быстрый поиск по коду

### F.1 Частые задачи

| Задача | Файл | Строка |
|--------|------|--------|
| Добавить новый тип | [`types/index.ts`](types/index.ts) | Экспорты внизу |
| Добавить enterprise тип | [`types/enterprise.ts`](types/enterprise.ts) | После существующих |
| Добавить перевод RU | [`localization/translations.ts`](localization/translations.ts) | ru: { ... } |
| Добавить перевод EN | [`localization/translations.ts`](localization/translations.ts) | en: { ... } |
| Добавить цвет темы | [`constants/theme.ts`](constants/theme.ts) | lightColors/darkColors |
| Добавить API метод | [`lib/supabaseDataService.ts`](lib/supabaseDataService.ts) | После существующих |
| Добавить бизнес-логику | [`services/*.ts`](services/) | Создать новый или добавить в существующий |
| Добавить компонент UI | [`components/ui/*.tsx`](components/ui/) | Следовать существующим паттернам |
| Добавить экран | [`app/название/index.tsx`](app/) | Использовать Expo Router |
| Добавить таб | [`app/(tabs)/название.tsx`](app/(tabs)/) | Добавить в \_layout.tsx |

### F.2 Отладка

```typescript
// Логирование состояния store
import { getDataState } from '@/store/dataStore';
console.log('Current state:', getDataState());

// Проверка сети
import NetInfo from '@react-native-community/netinfo';
NetInfo.fetch().then(state => console.log('Connection:', state.isConnected));

// Логирование Supabase
supabase.from('products').select('*').then(console.log);
```

---

## Приложение G: Метрики кодовой базы

### G.1 Статистика (Март 2026)

| Метрика | Значение |
|---------|----------|
| Общее количество файлов | 200+ |
| Строк TypeScript кода | ~45,000 |
| React компоненты | 80+ |
| Экраны приложения | 50+ |
| Сервисы | 10 |
| Store модули | 8 |
| API endpoints | 30+ |
| Переводы (RU+EN) | 800+ строк |

### G.2 Покрытие тестами

```
Unit Tests:        ████████████████████░░░░░  78%
Integration Tests: █████████████████░░░░░░░░  65%
E2E Tests:        ██████████████░░░░░░░░░░░░  55%
Overall:          █████████████████░░░░░░░░░  66%
```

---

*Последнее обновление: 07 Марта 2026*
*Версия документации: 2.0*
*Автор: Lkscale Team*
