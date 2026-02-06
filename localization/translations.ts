// Lkscale Localization - Russian and English translations

export type Language = 'ru' | 'en';

export interface Translations {
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    edit: string;
    search: string;
    all: string;
    clear: string;
    back: string;
    next: string;
    done: string;
    retry: string;
    refresh: string;
    noData: string;
    seeAll: string;
    select: string;
    selected: string;
    markAllRead: string;
    deleteAll: string;
  };

  // Navigation
  nav: {
    home: string;
    orders: string;
    inventory: string;
    assistant: string;
    profile: string;
    customers: string;
    notifications: string;
    settings: string;
  };

  // Dashboard
  dashboard: {
    greeting: string;
    sales: string;
    aiAnalysis: string;
    metrics: string;
    totalSales: string;
    activeOrders: string;
    balance: string;
    lowStock: string;
    lowStockItems: string;
    smartTips: string;
    quickActions: string;
    newOrder: string;
    myOrders: string;
    warehouse: string;
    recentActivity: string;
    aiInsightAvailable: string;
  };

  // Orders
  orders: {
    title: string;
    orderNumber: string;
    status: string;
    pending: string;
    processing: string;
    completed: string;
    cancelled: string;
    items: string;
    itemsCount: string;
    total: string;
    customer: string;
    phone: string;
    address: string;
    notes: string;
    paymentMethod: string;
    cash: string;
    card: string;
    transfer: string;
    online: string;
    createOrder: string;
    noOrders: string;
    searchPlaceholder: string;
  };

  // Inventory
  inventory: {
    title: string;
    products: string;
    inStock: string;
    lowStockLabel: string;
    categories: string;
    searchPlaceholder: string;
    sku: string;
    barcode: string;
    price: string;
    stock: string;
    minStock: string;
    category: string;
    description: string;
    active: string;
    inactive: string;
    priceHistory: string;
    stockHistory: string;
    noProducts: string;
    scanProduct: string;
    productNotFound: string;
    useForSearch: string;
    variants: string;
    addVariant: string;
    size: string;
    color: string;
    batchUpdate: string;
    selectProducts: string;
    updateSelected: string;
    productsSelected: string;
  };

  // Customers (CRM)
  customers: {
    title: string;
    searchPlaceholder: string;
    totalOrders: string;
    totalSpent: string;
    since: string;
    quickContact: string;
    call: string;
    email: string;
    whatsapp: string;
    purchaseHistory: string;
    noCustomers: string;
    customerValue: string;
    vip: string;
    regular: string;
    new: string;
    inactive: string;
    highValue: string;
  };

  // AI Assistant
  assistant: {
    title: string;
    subtitle: string;
    welcome: string;
    askQuestion: string;
    suggestedQuestions: string;
    analyzing: string;
    errorMessage: string;
    mostProfitable: string;
    weekForecast: string;
    needRestock: string;
    monthAnalysis: string;
    bestCustomer: string;
    generateReport: string;
    monthlyReport: string;
    promotionalMessage: string;
    actionCommands: string;
  };

  // Notifications
  notifications: {
    title: string;
    noNotifications: string;
    newOrder: string;
    lowStockAlert: string;
    orderCompleted: string;
    aiInsight: string;
    paymentReceived: string;
    markAsRead: string;
    today: string;
    yesterday: string;
    earlier: string;
  };

  // Profile & Settings
  profile: {
    title: string;
    myProfile: string;
    personalData: string;
    orderHistory: string;
    settings: string;
    notifications: string;
    autoSync: string;
    lastSync: string;
    never: string;
    language: string;
    russian: string;
    english: string;
    support: string;
    helpFaq: string;
    contactSupport: string;
    terms: string;
    logout: string;
    logoutConfirm: string;
    version: string;
    topUp: string;
  };

  // Sync Status
  sync: {
    synced: string;
    pending: string;
    offline: string;
    syncing: string;
    lastSynced: string;
    conflictDetected: string;
    resolveConflict: string;
    keepLocal: string;
    keepServer: string;
  };

  // Date/Time formatting
  dateTime: {
    today: string;
    yesterday: string;
    daysAgo: string;
    hoursAgo: string;
    minutesAgo: string;
    justNow: string;
  };

  // Currency
  currency: {
    symbol: string;
    code: string;
    thousand: string;
    million: string;
  };

  // Analytics
  analytics: {
    revenueVsProfit: string;
    salesByCategory: string;
    today: string;
    sevenDays: string;
    thirtyDays: string;
    year: string;
    revenue: string;
    profit: string;
    margin: string;
    total: string;
    noDataForPeriod: string;
  };

  // Store Settings
  storeSettings: {
    title: string;
    businessName: string;
    logo: string;
    uploadLogo: string;
    currency: string;
    taxRate: string;
    taxName: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    invoicePrefix: string;
    invoiceNotes: string;
    saved: string;
    saveChanges: string;
  };

  // Documents
  documents: {
    shareInvoice: string;
    stockReport: string;
    generating: string;
    shareSuccess: string;
    shareError: string;
    copyToClipboard: string;
    copied: string;
  };

  // Empty States
  emptyStates: {
    noOrders: string;
    noOrdersDesc: string;
    noProducts: string;
    noProductsDesc: string;
    noCustomers: string;
    noCustomersDesc: string;
    createFirst: string;
  };
}

export const translations: Record<Language, Translations> = {
  ru: {
    common: {
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успешно',
      cancel: 'Отмена',
      confirm: 'Подтвердить',
      save: 'Сохранить',
      delete: 'Удалить',
      edit: 'Редактировать',
      search: 'Поиск',
      all: 'Все',
      clear: 'Очистить',
      back: 'Назад',
      next: 'Далее',
      done: 'Готово',
      retry: 'Повторить',
      refresh: 'Обновить',
      noData: 'Нет данных',
      seeAll: 'Все',
      select: 'Выбрать',
      selected: 'Выбрано',
      markAllRead: 'Прочитать все',
      deleteAll: 'Удалить все',
    },
    nav: {
      home: 'Главная',
      orders: 'Заказы',
      inventory: 'Склад',
      assistant: 'Ассистент',
      profile: 'Профиль',
      customers: 'Клиенты',
      notifications: 'Уведомления',
      settings: 'Настройки',
    },
    dashboard: {
      greeting: 'Привет,',
      sales: 'Продажи',
      aiAnalysis: 'Анализ AI',
      metrics: 'Показатели',
      totalSales: 'Общие продажи',
      activeOrders: 'Активные заказы',
      balance: 'Баланс',
      lowStock: 'Низкий запас',
      lowStockItems: 'товаров',
      smartTips: 'Умные подсказки',
      quickActions: 'Быстрые действия',
      newOrder: 'Новый заказ',
      myOrders: 'Мои Заказы',
      warehouse: 'Склад',
      recentActivity: 'Последняя активность',
      aiInsightAvailable: 'Есть новые рекомендации AI',
    },
    orders: {
      title: 'Заказы',
      orderNumber: 'Номер заказа',
      status: 'Статус',
      pending: 'Ожидает',
      processing: 'В работе',
      completed: 'Выполнен',
      cancelled: 'Отменён',
      items: 'Товары',
      itemsCount: 'позиций',
      total: 'Итого',
      customer: 'Клиент',
      phone: 'Телефон',
      address: 'Адрес',
      notes: 'Примечания',
      paymentMethod: 'Способ оплаты',
      cash: 'Наличные',
      card: 'Карта',
      transfer: 'Перевод',
      online: 'Онлайн',
      createOrder: 'Создать заказ',
      noOrders: 'Заказов не найдено',
      searchPlaceholder: 'Поиск по номеру или клиенту...',
    },
    inventory: {
      title: 'Склад',
      products: 'Товаров',
      inStock: 'На складе',
      lowStockLabel: 'Мало',
      categories: 'Категории',
      searchPlaceholder: 'Поиск по названию или SKU...',
      sku: 'Артикул',
      barcode: 'Штрих-код',
      price: 'Цена',
      stock: 'Остаток',
      minStock: 'Мин. запас',
      category: 'Категория',
      description: 'Описание',
      active: 'Активен',
      inactive: 'Неактивен',
      priceHistory: 'История цен',
      stockHistory: 'История остатков',
      noProducts: 'Товаров не найдено',
      scanProduct: 'Сканировать товар',
      productNotFound: 'Товар не найден',
      useForSearch: 'Использовать для поиска?',
      variants: 'Варианты',
      addVariant: 'Добавить вариант',
      size: 'Размер',
      color: 'Цвет',
      batchUpdate: 'Массовое обновление',
      selectProducts: 'Выберите товары',
      updateSelected: 'Обновить выбранные',
      productsSelected: 'товаров выбрано',
    },
    customers: {
      title: 'Клиенты',
      searchPlaceholder: 'Поиск по имени, телефону или email...',
      totalOrders: 'Всего заказов',
      totalSpent: 'Общая сумма',
      since: 'Клиент с',
      quickContact: 'Быстрый контакт',
      call: 'Позвонить',
      email: 'Email',
      whatsapp: 'WhatsApp',
      purchaseHistory: 'История покупок',
      noCustomers: 'Клиентов не найдено',
      customerValue: 'Ценность клиента',
      vip: 'VIP',
      regular: 'Постоянный',
      new: 'Новый',
      inactive: 'Неактивный',
      highValue: 'Высокая ценность',
    },
    assistant: {
      title: 'Бизнес-ассистент',
      subtitle: 'Анализ данных с помощью AI',
      welcome: 'Привет! Я ваш бизнес-ассистент. Задайте мне любой вопрос о вашем бизнесе — продажах, товарах, клиентах или прогнозах. Чем могу помочь?',
      askQuestion: 'Задайте вопрос...',
      suggestedQuestions: 'Попробуйте спросить:',
      analyzing: 'Анализирую данные...',
      errorMessage: 'Извините, произошла ошибка. Пожалуйста, попробуйте еще раз.',
      mostProfitable: 'Какой товар самый прибыльный?',
      weekForecast: 'Сделай прогноз продаж на неделю',
      needRestock: 'Какие товары нужно пополнить?',
      monthAnalysis: 'Проанализируй продажи за месяц',
      bestCustomer: 'Кто мой лучший клиент?',
      generateReport: 'Сгенерируй отчёт',
      monthlyReport: 'Сформируй месячный отчёт по продажам',
      promotionalMessage: 'Напиши промо-сообщение для VIP-клиентов',
      actionCommands: 'Команды действий',
    },
    notifications: {
      title: 'Уведомления',
      noNotifications: 'Нет уведомлений',
      newOrder: 'Новый заказ',
      lowStockAlert: 'Низкий остаток',
      orderCompleted: 'Заказ выполнен',
      aiInsight: 'Рекомендация AI',
      paymentReceived: 'Оплата получена',
      markAsRead: 'Отметить прочитанным',
      today: 'Сегодня',
      yesterday: 'Вчера',
      earlier: 'Ранее',
    },
    profile: {
      title: 'Профиль',
      myProfile: 'Мой Профиль',
      personalData: 'Личные данные и контакты',
      orderHistory: 'История заказов',
      settings: 'Настройки',
      notifications: 'Уведомления',
      autoSync: 'Автосинхронизация',
      lastSync: 'Последняя',
      never: 'Никогда',
      language: 'Язык',
      russian: 'Русский',
      english: 'English',
      support: 'Поддержка',
      helpFaq: 'Помощь и FAQ',
      contactSupport: 'Связаться с поддержкой',
      terms: 'Условия использования',
      logout: 'Выйти из аккаунта',
      logoutConfirm: 'Вы уверены, что хотите выйти?',
      version: 'Версия',
      topUp: 'Пополнить',
    },
    sync: {
      synced: 'Синхронизировано',
      pending: 'Ожидание',
      offline: 'Офлайн',
      syncing: 'Синхронизация...',
      lastSynced: 'Последняя синхронизация',
      conflictDetected: 'Обнаружен конфликт',
      resolveConflict: 'Разрешить конфликт',
      keepLocal: 'Оставить локальные',
      keepServer: 'Использовать с сервера',
    },
    dateTime: {
      today: 'Сегодня',
      yesterday: 'Вчера',
      daysAgo: 'дн. назад',
      hoursAgo: 'ч. назад',
      minutesAgo: 'мин. назад',
      justNow: 'Только что',
    },
    currency: {
      symbol: '₽',
      code: 'RUB',
      thousand: 'тыс',
      million: 'млн',
    },
    analytics: {
      revenueVsProfit: 'Выручка и прибыль',
      salesByCategory: 'Продажи по категориям',
      today: 'Сегодня',
      sevenDays: '7 дней',
      thirtyDays: '30 дней',
      year: 'Год',
      revenue: 'Выручка',
      profit: 'Прибыль',
      margin: 'Маржа',
      total: 'Всего',
      noDataForPeriod: 'Нет данных за выбранный период',
    },
    storeSettings: {
      title: 'Настройки магазина',
      businessName: 'Название бизнеса',
      logo: 'Логотип',
      uploadLogo: 'Загрузить логотип',
      currency: 'Валюта',
      taxRate: 'Ставка налога',
      taxName: 'Название налога',
      address: 'Адрес',
      phone: 'Телефон',
      email: 'Email',
      website: 'Веб-сайт',
      invoicePrefix: 'Префикс счёта',
      invoiceNotes: 'Примечания к счёту',
      saved: 'Сохранено',
      saveChanges: 'Сохранить изменения',
    },
    documents: {
      shareInvoice: 'Поделиться счётом',
      stockReport: 'Отчёт по остаткам',
      generating: 'Генерация...',
      shareSuccess: 'Документ готов к отправке',
      shareError: 'Ошибка при создании документа',
      copyToClipboard: 'Копировать',
      copied: 'Скопировано!',
    },
    emptyStates: {
      noOrders: 'Нет заказов',
      noOrdersDesc: 'Заказы появятся здесь после их создания',
      noProducts: 'Нет товаров',
      noProductsDesc: 'Добавьте товары для управления складом',
      noCustomers: 'Нет клиентов',
      noCustomersDesc: 'Клиенты появятся после первого заказа',
      createFirst: 'Создать первый',
    },
  },

  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      all: 'All',
      clear: 'Clear',
      back: 'Back',
      next: 'Next',
      done: 'Done',
      retry: 'Retry',
      refresh: 'Refresh',
      noData: 'No data',
      seeAll: 'See all',
      select: 'Select',
      selected: 'Selected',
      markAllRead: 'Mark all read',
      deleteAll: 'Delete all',
    },
    nav: {
      home: 'Home',
      orders: 'Orders',
      inventory: 'Inventory',
      assistant: 'Assistant',
      profile: 'Profile',
      customers: 'Customers',
      notifications: 'Notifications',
      settings: 'Settings',
    },
    dashboard: {
      greeting: 'Hello,',
      sales: 'Sales',
      aiAnalysis: 'AI Analysis',
      metrics: 'Metrics',
      totalSales: 'Total Sales',
      activeOrders: 'Active Orders',
      balance: 'Balance',
      lowStock: 'Low Stock',
      lowStockItems: 'items',
      smartTips: 'Smart Tips',
      quickActions: 'Quick Actions',
      newOrder: 'New Order',
      myOrders: 'My Orders',
      warehouse: 'Warehouse',
      recentActivity: 'Recent Activity',
      aiInsightAvailable: 'New AI recommendations available',
    },
    orders: {
      title: 'Orders',
      orderNumber: 'Order Number',
      status: 'Status',
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      cancelled: 'Cancelled',
      items: 'Items',
      itemsCount: 'items',
      total: 'Total',
      customer: 'Customer',
      phone: 'Phone',
      address: 'Address',
      notes: 'Notes',
      paymentMethod: 'Payment Method',
      cash: 'Cash',
      card: 'Card',
      transfer: 'Transfer',
      online: 'Online',
      createOrder: 'Create Order',
      noOrders: 'No orders found',
      searchPlaceholder: 'Search by number or customer...',
    },
    inventory: {
      title: 'Inventory',
      products: 'Products',
      inStock: 'In Stock',
      lowStockLabel: 'Low',
      categories: 'Categories',
      searchPlaceholder: 'Search by name or SKU...',
      sku: 'SKU',
      barcode: 'Barcode',
      price: 'Price',
      stock: 'Stock',
      minStock: 'Min. Stock',
      category: 'Category',
      description: 'Description',
      active: 'Active',
      inactive: 'Inactive',
      priceHistory: 'Price History',
      stockHistory: 'Stock History',
      noProducts: 'No products found',
      scanProduct: 'Scan Product',
      productNotFound: 'Product not found',
      useForSearch: 'Use for search?',
      variants: 'Variants',
      addVariant: 'Add Variant',
      size: 'Size',
      color: 'Color',
      batchUpdate: 'Batch Update',
      selectProducts: 'Select products',
      updateSelected: 'Update Selected',
      productsSelected: 'products selected',
    },
    customers: {
      title: 'Customers',
      searchPlaceholder: 'Search by name, phone or email...',
      totalOrders: 'Total Orders',
      totalSpent: 'Total Spent',
      since: 'Customer since',
      quickContact: 'Quick Contact',
      call: 'Call',
      email: 'Email',
      whatsapp: 'WhatsApp',
      purchaseHistory: 'Purchase History',
      noCustomers: 'No customers found',
      customerValue: 'Customer Value',
      vip: 'VIP',
      regular: 'Regular',
      new: 'New',
      inactive: 'Inactive',
      highValue: 'High Value',
    },
    assistant: {
      title: 'Business Assistant',
      subtitle: 'AI-powered data analysis',
      welcome: 'Hi! I\'m your business assistant. Ask me anything about your business - sales, products, customers, or forecasts. How can I help?',
      askQuestion: 'Ask a question...',
      suggestedQuestions: 'Try asking:',
      analyzing: 'Analyzing data...',
      errorMessage: 'Sorry, an error occurred. Please try again.',
      mostProfitable: 'Which product is most profitable?',
      weekForecast: 'Make a sales forecast for the week',
      needRestock: 'Which products need restocking?',
      monthAnalysis: 'Analyze monthly sales',
      bestCustomer: 'Who is my best customer?',
      generateReport: 'Generate a report',
      monthlyReport: 'Generate monthly sales report',
      promotionalMessage: 'Write a promo message for VIP customers',
      actionCommands: 'Action Commands',
    },
    notifications: {
      title: 'Notifications',
      noNotifications: 'No notifications',
      newOrder: 'New Order',
      lowStockAlert: 'Low Stock Alert',
      orderCompleted: 'Order Completed',
      aiInsight: 'AI Recommendation',
      paymentReceived: 'Payment Received',
      markAsRead: 'Mark as read',
      today: 'Today',
      yesterday: 'Yesterday',
      earlier: 'Earlier',
    },
    profile: {
      title: 'Profile',
      myProfile: 'My Profile',
      personalData: 'Personal info and contacts',
      orderHistory: 'Order History',
      settings: 'Settings',
      notifications: 'Notifications',
      autoSync: 'Auto Sync',
      lastSync: 'Last',
      never: 'Never',
      language: 'Language',
      russian: 'Russian',
      english: 'English',
      support: 'Support',
      helpFaq: 'Help & FAQ',
      contactSupport: 'Contact Support',
      terms: 'Terms of Use',
      logout: 'Log Out',
      logoutConfirm: 'Are you sure you want to log out?',
      version: 'Version',
      topUp: 'Top Up',
    },
    sync: {
      synced: 'Synced',
      pending: 'Pending',
      offline: 'Offline',
      syncing: 'Syncing...',
      lastSynced: 'Last synced',
      conflictDetected: 'Conflict detected',
      resolveConflict: 'Resolve conflict',
      keepLocal: 'Keep local',
      keepServer: 'Use server version',
    },
    dateTime: {
      today: 'Today',
      yesterday: 'Yesterday',
      daysAgo: 'days ago',
      hoursAgo: 'hours ago',
      minutesAgo: 'min ago',
      justNow: 'Just now',
    },
    currency: {
      symbol: '₽',
      code: 'RUB',
      thousand: 'K',
      million: 'M',
    },
    analytics: {
      revenueVsProfit: 'Revenue vs Profit',
      salesByCategory: 'Sales by Category',
      today: 'Today',
      sevenDays: '7 Days',
      thirtyDays: '30 Days',
      year: 'Year',
      revenue: 'Revenue',
      profit: 'Profit',
      margin: 'Margin',
      total: 'Total',
      noDataForPeriod: 'No data for selected period',
    },
    storeSettings: {
      title: 'Store Settings',
      businessName: 'Business Name',
      logo: 'Logo',
      uploadLogo: 'Upload Logo',
      currency: 'Currency',
      taxRate: 'Tax Rate',
      taxName: 'Tax Name',
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      website: 'Website',
      invoicePrefix: 'Invoice Prefix',
      invoiceNotes: 'Invoice Notes',
      saved: 'Saved',
      saveChanges: 'Save Changes',
    },
    documents: {
      shareInvoice: 'Share Invoice',
      stockReport: 'Stock Report',
      generating: 'Generating...',
      shareSuccess: 'Document ready to share',
      shareError: 'Error creating document',
      copyToClipboard: 'Copy',
      copied: 'Copied!',
    },
    emptyStates: {
      noOrders: 'No orders',
      noOrdersDesc: 'Orders will appear here after creation',
      noProducts: 'No products',
      noProductsDesc: 'Add products to manage inventory',
      noCustomers: 'No customers',
      noCustomersDesc: 'Customers will appear after first order',
      createFirst: 'Create first',
    },
  },
};
