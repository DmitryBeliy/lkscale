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
    add: string;
    active: string;
    details: string;
    settings: string;
    orders: string;
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

  // Team Management
  team: {
    title: string;
    members: string;
    inviteMember: string;
    inviteByEmail: string;
    pendingInvites: string;
    activeMembers: string;
    roles: {
      admin: string;
      cashier: string;
      stockManager: string;
    };
    status: {
      pending: string;
      active: string;
      suspended: string;
    };
    permissions: string;
    editPermissions: string;
    removeFromTeam: string;
    removeConfirm: string;
    noMembers: string;
    noMembersDesc: string;
    inviteSent: string;
    memberProfile: string;
    shiftsHistory: string;
    currentShift: string;
    startShift: string;
    endShift: string;
    onBreak: string;
    totalHours: string;
    salesThisShift: string;
  };

  // Activity Log
  activityLog: {
    title: string;
    allActivity: string;
    filterByAction: string;
    filterByMember: string;
    noActivity: string;
    actions: {
      orderCreated: string;
      orderCompleted: string;
      orderCancelled: string;
      orderDeleted: string;
      productCreated: string;
      productUpdated: string;
      productDeleted: string;
      priceChanged: string;
      stockAdjusted: string;
      customerCreated: string;
      customerUpdated: string;
      couponCreated: string;
      couponUsed: string;
      shiftStarted: string;
      shiftEnded: string;
      teamMemberInvited: string;
      teamMemberUpdated: string;
      teamMemberRemoved: string;
      settingsChanged: string;
    };
  };

  // Loyalty & CRM
  loyalty: {
    title: string;
    bonusPoints: string;
    lifetimePoints: string;
    earnPoints: string;
    spendPoints: string;
    pointsHistory: string;
    tier: string;
    tiers: {
      standard: string;
      silver: string;
      gold: string;
      vip: string;
    };
    tierBenefits: string;
    nextTier: string;
    spendToReach: string;
    favoriteProducts: string;
    personalNotes: string;
    preferences: string;
    topCategories: string;
    lastVisit: string;
    visitCount: string;
    churnRisk: string;
    atRisk: string;
    winBack: string;
  };

  // Coupons & Promotions
  coupons: {
    title: string;
    createCoupon: string;
    editCoupon: string;
    couponCode: string;
    discountType: string;
    percentage: string;
    fixedAmount: string;
    discountValue: string;
    minPurchase: string;
    maxDiscount: string;
    usageLimit: string;
    unlimited: string;
    singleUse: string;
    validFrom: string;
    validUntil: string;
    noExpiry: string;
    targetCustomers: string;
    allCustomers: string;
    specificTiers: string;
    specificCustomers: string;
    active: string;
    inactive: string;
    expired: string;
    usages: string;
    noCoupons: string;
  };

  // Marketing Campaigns
  marketing: {
    title: string;
    campaigns: string;
    createCampaign: string;
    churnPrevention: string;
    winBack: string;
    vipRewards: string;
    seasonal: string;
    custom: string;
    aiGenerated: string;
    generateWithAI: string;
    targetAudience: string;
    messageTemplate: string;
    offerDetails: string;
    stats: string;
    sent: string;
    opened: string;
    converted: string;
    schedule: string;
    sendNow: string;
    noCampaigns: string;
  };

  // Staff Performance
  staffPerformance: {
    title: string;
    topSellers: string;
    salesPerHour: string;
    totalSales: string;
    ordersProcessed: string;
    avgOrderValue: string;
    hoursWorked: string;
    stockAdjustments: string;
    improvement: string;
    rank: string;
  };

  // Enterprise Features
  enterprise: {
    multiStore: string;
    stores: string;
    addStore: string;
    mainStore: string;
    branches: string;
    stockTransfer: string;
    transferStock: string;
    fromStore: string;
    toStore: string;
    consolidatedReport: string;
    storePerformance: string;
    storesManagement: string;
    activeStores: string;
    yourStores: string;
    storeName: string;
    storeCode: string;
    storeAddress: string;
    storePhone: string;
    storeManager: string;
    transferFrom: string;
    transferTo: string;
    productName: string;
    quantity: string;
    transferNotes: string;
    createTransfer: string;
    inventory: string;
  };

  executive: {
    dashboard: string;
    overview: string;
    salesTrends: string;
    profitMargins: string;
    categoryPerformance: string;
    revenueVsExpenses: string;
    netProfit: string;
    grossProfit: string;
    operatingExpenses: string;
    periodComparison: string;
    forecast: string;
    revenue: string;
    profit: string;
    margin: string;
    growth: string;
    grossRevenue: string;
  };

  finance: {
    expenses: string;
    addExpense: string;
    expenseCategory: string;
    rent: string;
    salaries: string;
    utilities: string;
    taxes: string;
    inventory: string;
    marketing: string;
    equipment: string;
    supplies: string;
    insurance: string;
    maintenance: string;
    delivery: string;
    banking: string;
    other: string;
    budget: string;
    setBudget: string;
    overBudget: string;
    recurring: string;
    financialSummary: string;
  };

  payments: {
    qrPayment: string;
    generateQR: string;
    scanToPay: string;
    paymentReceived: string;
    paymentPending: string;
    paymentExpired: string;
    sbpPayment: string;
    sharePaymentLink: string;
  };

  reports: {
    title: string;
    advancedReports: string;
    generateReport: string;
    exportPDF: string;
    exportExcel: string;
    salesReport: string;
    inventoryReport: string;
    financialReport: string;
    taxReport: string;
    customReport: string;
    dateRange: string;
    includeCharts: string;
    selectReport: string;
    selectPeriod: string;
    exportFormat: string;
    preview: string;
    week: string;
    month: string;
    quarter: string;
    year: string;
    consolidatedReport: string;
  };

  telegram: {
    title: string;
    integration: string;
    connect: string;
    disconnect: string;
    botToken: string;
    chatId: string;
    dailySummary: string;
    alertNotifications: string;
    summaryTime: string;
    testMessage: string;
    connected: string;
    notConnected: string;
    botSettings: string;
    howToGetToken: string;
    connecting: string;
    connectionSuccess: string;
    disconnectTitle: string;
    disconnectMessage: string;
    notificationSettings: string;
    dailySummaryDesc: string;
    lowStockAlerts: string;
    lowStockAlertsDesc: string;
    newOrderAlerts: string;
    newOrderAlertsDesc: string;
    anomalyAlerts: string;
    anomalyAlertsDesc: string;
    actions: string;
    sendTest: string;
    preview: string;
    howItWorks: string;
    howItWorksDesc: string;
    testMessageSent: string;
  };

  subscription: {
    title: string;
    currentPlan: string;
    upgrade: string;
    downgrade: string;
    freeTier: string;
    basicTier: string;
    proTier: string;
    enterpriseTier: string;
    monthlyBilling: string;
    yearlyBilling: string;
    savePercent: string;
    features: string;
    subscribe: string;
    cancel: string;
    trialDays: string;
    popularChoice: string;
    contactSales: string;
    limitReached: string;
  };

  aiCfo: {
    title: string;
    subtitle: string;
    virtualCFO: string;
    revenueForecast: string;
    anomalyDetection: string;
    taxOptimization: string;
    financialInsights: string;
    predictedRevenue: string;
    confidence: string;
    anomalyAlert: string;
    salesDrop: string;
    salesSpike: string;
    expenseSpike: string;
    suggestedActions: string;
    taxSuggestion: string;
    potentialSavings: string;
    chat: string;
    insights: string;
    forecast: string;
    askQuestion: string;
    keyInsights: string;
    potentialImpact: string;
  };

  theme: {
    appearance: string;
    lightMode: string;
    darkMode: string;
    systemDefault: string;
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
      add: 'Добавить',
      active: 'Активен',
      details: 'Подробнее',
      settings: 'Настройки',
      orders: 'Заказы',
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
    team: {
      title: 'Команда',
      members: 'Сотрудники',
      inviteMember: 'Пригласить сотрудника',
      inviteByEmail: 'Пригласить по email',
      pendingInvites: 'Ожидают приглашения',
      activeMembers: 'Активные сотрудники',
      roles: {
        admin: 'Администратор',
        cashier: 'Кассир',
        stockManager: 'Кладовщик',
      },
      status: {
        pending: 'Ожидает',
        active: 'Активен',
        suspended: 'Заблокирован',
      },
      permissions: 'Права доступа',
      editPermissions: 'Изменить права',
      removeFromTeam: 'Удалить из команды',
      removeConfirm: 'Удалить сотрудника из команды?',
      noMembers: 'Нет сотрудников',
      noMembersDesc: 'Пригласите первого сотрудника',
      inviteSent: 'Приглашение отправлено',
      memberProfile: 'Профиль сотрудника',
      shiftsHistory: 'История смен',
      currentShift: 'Текущая смена',
      startShift: 'Начать смену',
      endShift: 'Завершить смену',
      onBreak: 'На перерыве',
      totalHours: 'Всего часов',
      salesThisShift: 'Продажи за смену',
    },
    activityLog: {
      title: 'Журнал действий',
      allActivity: 'Все действия',
      filterByAction: 'Фильтр по действию',
      filterByMember: 'Фильтр по сотруднику',
      noActivity: 'Нет записей',
      actions: {
        orderCreated: 'Создан заказ',
        orderCompleted: 'Заказ выполнен',
        orderCancelled: 'Заказ отменён',
        orderDeleted: 'Заказ удалён',
        productCreated: 'Добавлен товар',
        productUpdated: 'Изменён товар',
        productDeleted: 'Удалён товар',
        priceChanged: 'Изменена цена',
        stockAdjusted: 'Корректировка остатков',
        customerCreated: 'Добавлен клиент',
        customerUpdated: 'Изменён клиент',
        couponCreated: 'Создан купон',
        couponUsed: 'Использован купон',
        shiftStarted: 'Начало смены',
        shiftEnded: 'Конец смены',
        teamMemberInvited: 'Приглашён сотрудник',
        teamMemberUpdated: 'Изменён сотрудник',
        teamMemberRemoved: 'Удалён сотрудник',
        settingsChanged: 'Изменены настройки',
      },
    },
    loyalty: {
      title: 'Программа лояльности',
      bonusPoints: 'Бонусные баллы',
      lifetimePoints: 'Накоплено всего',
      earnPoints: 'Начислено',
      spendPoints: 'Списано',
      pointsHistory: 'История баллов',
      tier: 'Статус',
      tiers: {
        standard: 'Стандарт',
        silver: 'Серебро',
        gold: 'Золото',
        vip: 'VIP',
      },
      tierBenefits: 'Привилегии статуса',
      nextTier: 'До следующего статуса',
      spendToReach: 'Осталось потратить',
      favoriteProducts: 'Любимые товары',
      personalNotes: 'Заметки о клиенте',
      preferences: 'Предпочтения',
      topCategories: 'Топ категории',
      lastVisit: 'Последний визит',
      visitCount: 'Всего визитов',
      churnRisk: 'Риск оттока',
      atRisk: 'Под угрозой',
      winBack: 'Вернуть клиента',
    },
    coupons: {
      title: 'Купоны и акции',
      createCoupon: 'Создать купон',
      editCoupon: 'Редактировать купон',
      couponCode: 'Код купона',
      discountType: 'Тип скидки',
      percentage: 'Процент',
      fixedAmount: 'Фиксированная сумма',
      discountValue: 'Размер скидки',
      minPurchase: 'Мин. сумма покупки',
      maxDiscount: 'Макс. скидка',
      usageLimit: 'Лимит использований',
      unlimited: 'Без ограничений',
      singleUse: 'Одноразовый',
      validFrom: 'Действует с',
      validUntil: 'Действует до',
      noExpiry: 'Бессрочный',
      targetCustomers: 'Для кого',
      allCustomers: 'Все клиенты',
      specificTiers: 'По статусу',
      specificCustomers: 'Выбранные клиенты',
      active: 'Активный',
      inactive: 'Неактивный',
      expired: 'Истёк',
      usages: 'Использований',
      noCoupons: 'Нет купонов',
    },
    marketing: {
      title: 'Маркетинг',
      campaigns: 'Кампании',
      createCampaign: 'Создать кампанию',
      churnPrevention: 'Предотвращение оттока',
      winBack: 'Возврат клиентов',
      vipRewards: 'Награды VIP',
      seasonal: 'Сезонная',
      custom: 'Пользовательская',
      aiGenerated: 'Создано AI',
      generateWithAI: 'Создать с помощью AI',
      targetAudience: 'Целевая аудитория',
      messageTemplate: 'Шаблон сообщения',
      offerDetails: 'Детали предложения',
      stats: 'Статистика',
      sent: 'Отправлено',
      opened: 'Открыто',
      converted: 'Конверсия',
      schedule: 'Запланировать',
      sendNow: 'Отправить сейчас',
      noCampaigns: 'Нет кампаний',
    },
    staffPerformance: {
      title: 'Эффективность сотрудников',
      topSellers: 'Лучшие продавцы',
      salesPerHour: 'Продаж в час',
      totalSales: 'Всего продаж',
      ordersProcessed: 'Обработано заказов',
      avgOrderValue: 'Средний чек',
      hoursWorked: 'Часов отработано',
      stockAdjustments: 'Корректировок склада',
      improvement: 'Изменение',
      rank: 'Место',
    },
    enterprise: {
      multiStore: 'Мульти-магазин',
      stores: 'Магазины',
      addStore: 'Добавить магазин',
      mainStore: 'Главный магазин',
      branches: 'Филиалы',
      stockTransfer: 'Перемещение товара',
      transferStock: 'Переместить товар',
      fromStore: 'Из магазина',
      toStore: 'В магазин',
      consolidatedReport: 'Консолидированный отчёт',
      storePerformance: 'Показатели магазина',
      storesManagement: 'Управление магазинами',
      activeStores: 'Активных магазинов',
      yourStores: 'Ваши магазины',
      storeName: 'Название магазина',
      storeCode: 'Код магазина',
      storeAddress: 'Адрес',
      storePhone: 'Телефон',
      storeManager: 'Управляющий',
      transferFrom: 'Откуда',
      transferTo: 'Куда',
      productName: 'Товар',
      quantity: 'Количество',
      transferNotes: 'Примечания',
      createTransfer: 'Создать перемещение',
      inventory: 'Товары',
    },
    executive: {
      dashboard: 'Панель руководителя',
      overview: 'Обзор',
      salesTrends: 'Тренды продаж',
      profitMargins: 'Маржинальность',
      categoryPerformance: 'По категориям',
      revenueVsExpenses: 'Доходы vs Расходы',
      netProfit: 'Чистая прибыль',
      grossProfit: 'Валовая прибыль',
      operatingExpenses: 'Операционные расходы',
      periodComparison: 'Сравнение периодов',
      forecast: 'Прогноз',
      revenue: 'Выручка',
      profit: 'Прибыль',
      margin: 'Маржа',
      growth: 'Рост',
      grossRevenue: 'Валовая выручка',
    },
    finance: {
      expenses: 'Расходы',
      addExpense: 'Добавить расход',
      expenseCategory: 'Категория расхода',
      rent: 'Аренда',
      salaries: 'Зарплаты',
      utilities: 'Коммунальные услуги',
      taxes: 'Налоги',
      inventory: 'Закупки',
      marketing: 'Маркетинг',
      equipment: 'Оборудование',
      supplies: 'Расходные материалы',
      insurance: 'Страхование',
      maintenance: 'Обслуживание',
      delivery: 'Доставка',
      banking: 'Банковские услуги',
      other: 'Прочее',
      budget: 'Бюджет',
      setBudget: 'Установить бюджет',
      overBudget: 'Превышение бюджета',
      recurring: 'Регулярный',
      financialSummary: 'Финансовый отчёт',
    },
    payments: {
      qrPayment: 'QR-платёж',
      generateQR: 'Создать QR-код',
      scanToPay: 'Отсканируйте для оплаты',
      paymentReceived: 'Платёж получен',
      paymentPending: 'Ожидание оплаты',
      paymentExpired: 'Срок оплаты истёк',
      sbpPayment: 'Оплата по СБП',
      sharePaymentLink: 'Поделиться ссылкой',
    },
    reports: {
      title: 'Отчёты',
      advancedReports: 'Расширенные отчёты',
      generateReport: 'Сформировать отчёт',
      exportPDF: 'Экспорт в PDF',
      exportExcel: 'Экспорт в Excel',
      salesReport: 'Отчёт по продажам',
      inventoryReport: 'Отчёт по складу',
      financialReport: 'Финансовый отчёт',
      taxReport: 'Налоговый отчёт',
      customReport: 'Свой отчёт',
      dateRange: 'Период',
      includeCharts: 'Включить графики',
      selectReport: 'Выберите тип отчёта',
      selectPeriod: 'Выберите период',
      exportFormat: 'Формат экспорта',
      preview: 'Предпросмотр',
      week: 'Неделя',
      month: 'Месяц',
      quarter: 'Квартал',
      year: 'Год',
      consolidatedReport: 'Сводный отчёт',
    },
    telegram: {
      title: 'Telegram',
      integration: 'Интеграция с Telegram',
      connect: 'Подключить',
      disconnect: 'Отключить',
      botToken: 'Токен бота',
      chatId: 'ID чата',
      dailySummary: 'Ежедневная сводка',
      alertNotifications: 'Уведомления об аномалиях',
      summaryTime: 'Время отправки',
      testMessage: 'Тестовое сообщение',
      connected: 'Подключено',
      notConnected: 'Не подключено',
      botSettings: 'Настройки бота',
      howToGetToken: 'Как получить токен?',
      connecting: 'Подключение...',
      connectionSuccess: 'Бот успешно подключен!',
      disconnectTitle: 'Отключить бота?',
      disconnectMessage: 'Вы перестанете получать уведомления в Telegram',
      notificationSettings: 'Настройки уведомлений',
      dailySummaryDesc: 'Ежедневный отчёт о продажах и прибыли',
      lowStockAlerts: 'Уведомления о низких остатках',
      lowStockAlertsDesc: 'Когда товар заканчивается',
      newOrderAlerts: 'Уведомления о новых заказах',
      newOrderAlertsDesc: 'Мгновенно о каждом заказе',
      anomalyAlerts: 'Уведомления об аномалиях',
      anomalyAlertsDesc: 'Необычные изменения в продажах',
      actions: 'Действия',
      sendTest: 'Тестовое сообщение',
      preview: 'Предпросмотр',
      howItWorks: 'Как это работает?',
      howItWorksDesc: 'Создайте бота через @BotFather, получите токен и укажите ID чата для получения уведомлений. Бот будет отправлять вам ежедневные сводки и важные уведомления.',
      testMessageSent: 'Тестовое сообщение отправлено!',
    },
    subscription: {
      title: 'Подписка',
      currentPlan: 'Текущий план',
      upgrade: 'Улучшить',
      downgrade: 'Понизить',
      freeTier: 'Бесплатный',
      basicTier: 'Базовый',
      proTier: 'Профессиональный',
      enterpriseTier: 'Корпоративный',
      monthlyBilling: 'Помесячно',
      yearlyBilling: 'Ежегодно',
      savePercent: 'Экономия',
      features: 'Возможности',
      subscribe: 'Подписаться',
      cancel: 'Отменить подписку',
      trialDays: 'дней бесплатно',
      popularChoice: 'Популярный выбор',
      contactSales: 'Связаться с нами',
      limitReached: 'Лимит достигнут',
    },
    aiCfo: {
      title: 'AI Финансовый директор',
      subtitle: 'Умный анализ вашего бизнеса',
      virtualCFO: 'Виртуальный CFO',
      revenueForecast: 'Прогноз выручки',
      anomalyDetection: 'Обнаружение аномалий',
      taxOptimization: 'Оптимизация налогов',
      financialInsights: 'Финансовые инсайты',
      predictedRevenue: 'Прогнозируемая выручка',
      confidence: 'Точность',
      anomalyAlert: 'Обнаружена аномалия',
      salesDrop: 'Падение продаж',
      salesSpike: 'Всплеск продаж',
      expenseSpike: 'Рост расходов',
      suggestedActions: 'Рекомендуемые действия',
      taxSuggestion: 'Рекомендация по налогам',
      potentialSavings: 'Потенциальная экономия',
      chat: 'Чат',
      insights: 'Инсайты',
      forecast: 'Прогноз',
      askQuestion: 'Задайте вопрос о бизнесе...',
      keyInsights: 'Ключевые инсайты',
      potentialImpact: 'Потенциальный эффект',
    },
    theme: {
      appearance: 'Внешний вид',
      lightMode: 'Светлая тема',
      darkMode: 'Тёмная тема',
      systemDefault: 'Как в системе',
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
      add: 'Add',
      active: 'Active',
      details: 'Details',
      settings: 'Settings',
      orders: 'Orders',
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
    team: {
      title: 'Team',
      members: 'Team Members',
      inviteMember: 'Invite Member',
      inviteByEmail: 'Invite by email',
      pendingInvites: 'Pending Invites',
      activeMembers: 'Active Members',
      roles: {
        admin: 'Admin',
        cashier: 'Cashier',
        stockManager: 'Stock Manager',
      },
      status: {
        pending: 'Pending',
        active: 'Active',
        suspended: 'Suspended',
      },
      permissions: 'Permissions',
      editPermissions: 'Edit Permissions',
      removeFromTeam: 'Remove from Team',
      removeConfirm: 'Remove member from team?',
      noMembers: 'No team members',
      noMembersDesc: 'Invite your first team member',
      inviteSent: 'Invitation sent',
      memberProfile: 'Member Profile',
      shiftsHistory: 'Shifts History',
      currentShift: 'Current Shift',
      startShift: 'Start Shift',
      endShift: 'End Shift',
      onBreak: 'On Break',
      totalHours: 'Total Hours',
      salesThisShift: 'Shift Sales',
    },
    activityLog: {
      title: 'Activity Log',
      allActivity: 'All Activity',
      filterByAction: 'Filter by Action',
      filterByMember: 'Filter by Member',
      noActivity: 'No activity',
      actions: {
        orderCreated: 'Order created',
        orderCompleted: 'Order completed',
        orderCancelled: 'Order cancelled',
        orderDeleted: 'Order deleted',
        productCreated: 'Product added',
        productUpdated: 'Product updated',
        productDeleted: 'Product deleted',
        priceChanged: 'Price changed',
        stockAdjusted: 'Stock adjusted',
        customerCreated: 'Customer added',
        customerUpdated: 'Customer updated',
        couponCreated: 'Coupon created',
        couponUsed: 'Coupon used',
        shiftStarted: 'Shift started',
        shiftEnded: 'Shift ended',
        teamMemberInvited: 'Team member invited',
        teamMemberUpdated: 'Team member updated',
        teamMemberRemoved: 'Team member removed',
        settingsChanged: 'Settings changed',
      },
    },
    loyalty: {
      title: 'Loyalty Program',
      bonusPoints: 'Bonus Points',
      lifetimePoints: 'Lifetime Points',
      earnPoints: 'Earned',
      spendPoints: 'Spent',
      pointsHistory: 'Points History',
      tier: 'Tier',
      tiers: {
        standard: 'Standard',
        silver: 'Silver',
        gold: 'Gold',
        vip: 'VIP',
      },
      tierBenefits: 'Tier Benefits',
      nextTier: 'Next Tier',
      spendToReach: 'Spend to reach',
      favoriteProducts: 'Favorite Products',
      personalNotes: 'Personal Notes',
      preferences: 'Preferences',
      topCategories: 'Top Categories',
      lastVisit: 'Last Visit',
      visitCount: 'Total Visits',
      churnRisk: 'Churn Risk',
      atRisk: 'At Risk',
      winBack: 'Win Back',
    },
    coupons: {
      title: 'Coupons & Promotions',
      createCoupon: 'Create Coupon',
      editCoupon: 'Edit Coupon',
      couponCode: 'Coupon Code',
      discountType: 'Discount Type',
      percentage: 'Percentage',
      fixedAmount: 'Fixed Amount',
      discountValue: 'Discount Value',
      minPurchase: 'Min. Purchase',
      maxDiscount: 'Max. Discount',
      usageLimit: 'Usage Limit',
      unlimited: 'Unlimited',
      singleUse: 'Single Use',
      validFrom: 'Valid From',
      validUntil: 'Valid Until',
      noExpiry: 'No Expiry',
      targetCustomers: 'Target Customers',
      allCustomers: 'All Customers',
      specificTiers: 'By Tier',
      specificCustomers: 'Specific Customers',
      active: 'Active',
      inactive: 'Inactive',
      expired: 'Expired',
      usages: 'Usages',
      noCoupons: 'No coupons',
    },
    marketing: {
      title: 'Marketing',
      campaigns: 'Campaigns',
      createCampaign: 'Create Campaign',
      churnPrevention: 'Churn Prevention',
      winBack: 'Win Back',
      vipRewards: 'VIP Rewards',
      seasonal: 'Seasonal',
      custom: 'Custom',
      aiGenerated: 'AI Generated',
      generateWithAI: 'Generate with AI',
      targetAudience: 'Target Audience',
      messageTemplate: 'Message Template',
      offerDetails: 'Offer Details',
      stats: 'Statistics',
      sent: 'Sent',
      opened: 'Opened',
      converted: 'Converted',
      schedule: 'Schedule',
      sendNow: 'Send Now',
      noCampaigns: 'No campaigns',
    },
    staffPerformance: {
      title: 'Staff Performance',
      topSellers: 'Top Sellers',
      salesPerHour: 'Sales/Hour',
      totalSales: 'Total Sales',
      ordersProcessed: 'Orders Processed',
      avgOrderValue: 'Avg. Order Value',
      hoursWorked: 'Hours Worked',
      stockAdjustments: 'Stock Adjustments',
      improvement: 'Change',
      rank: 'Rank',
    },
    enterprise: {
      multiStore: 'Multi-Store',
      stores: 'Stores',
      addStore: 'Add Store',
      mainStore: 'Main Store',
      branches: 'Branches',
      stockTransfer: 'Stock Transfer',
      transferStock: 'Transfer Stock',
      fromStore: 'From Store',
      toStore: 'To Store',
      consolidatedReport: 'Consolidated Report',
      storePerformance: 'Store Performance',
      storesManagement: 'Store Management',
      activeStores: 'Active Stores',
      yourStores: 'Your Stores',
      storeName: 'Store Name',
      storeCode: 'Store Code',
      storeAddress: 'Address',
      storePhone: 'Phone',
      storeManager: 'Manager',
      transferFrom: 'From',
      transferTo: 'To',
      productName: 'Product',
      quantity: 'Quantity',
      transferNotes: 'Notes',
      createTransfer: 'Create Transfer',
      inventory: 'Inventory',
    },
    executive: {
      dashboard: 'Executive Dashboard',
      overview: 'Overview',
      salesTrends: 'Sales Trends',
      profitMargins: 'Profit Margins',
      categoryPerformance: 'Category Performance',
      revenueVsExpenses: 'Revenue vs Expenses',
      netProfit: 'Net Profit',
      grossProfit: 'Gross Profit',
      operatingExpenses: 'Operating Expenses',
      periodComparison: 'Period Comparison',
      forecast: 'Forecast',
      revenue: 'Revenue',
      profit: 'Profit',
      margin: 'Margin',
      growth: 'Growth',
      grossRevenue: 'Gross Revenue',
    },
    finance: {
      expenses: 'Expenses',
      addExpense: 'Add Expense',
      expenseCategory: 'Expense Category',
      rent: 'Rent',
      salaries: 'Salaries',
      utilities: 'Utilities',
      taxes: 'Taxes',
      inventory: 'Inventory',
      marketing: 'Marketing',
      equipment: 'Equipment',
      supplies: 'Supplies',
      insurance: 'Insurance',
      maintenance: 'Maintenance',
      delivery: 'Delivery',
      banking: 'Banking',
      other: 'Other',
      budget: 'Budget',
      setBudget: 'Set Budget',
      overBudget: 'Over Budget',
      recurring: 'Recurring',
      financialSummary: 'Financial Summary',
    },
    payments: {
      qrPayment: 'QR Payment',
      generateQR: 'Generate QR Code',
      scanToPay: 'Scan to Pay',
      paymentReceived: 'Payment Received',
      paymentPending: 'Payment Pending',
      paymentExpired: 'Payment Expired',
      sbpPayment: 'SBP Payment',
      sharePaymentLink: 'Share Payment Link',
    },
    reports: {
      title: 'Reports',
      advancedReports: 'Advanced Reports',
      generateReport: 'Generate Report',
      exportPDF: 'Export PDF',
      exportExcel: 'Export Excel',
      salesReport: 'Sales Report',
      inventoryReport: 'Inventory Report',
      financialReport: 'Financial Report',
      taxReport: 'Tax Report',
      customReport: 'Custom Report',
      dateRange: 'Date Range',
      includeCharts: 'Include Charts',
      selectReport: 'Select Report Type',
      selectPeriod: 'Select Period',
      exportFormat: 'Export Format',
      preview: 'Preview',
      week: 'Week',
      month: 'Month',
      quarter: 'Quarter',
      year: 'Year',
      consolidatedReport: 'Consolidated Report',
    },
    telegram: {
      title: 'Telegram',
      integration: 'Telegram Integration',
      connect: 'Connect',
      disconnect: 'Disconnect',
      botToken: 'Bot Token',
      chatId: 'Chat ID',
      dailySummary: 'Daily Summary',
      alertNotifications: 'Alert Notifications',
      summaryTime: 'Summary Time',
      testMessage: 'Test Message',
      connected: 'Connected',
      notConnected: 'Not Connected',
      botSettings: 'Bot Settings',
      howToGetToken: 'How to get a token?',
      connecting: 'Connecting...',
      connectionSuccess: 'Bot connected successfully!',
      disconnectTitle: 'Disconnect bot?',
      disconnectMessage: 'You will stop receiving notifications in Telegram',
      notificationSettings: 'Notification Settings',
      dailySummaryDesc: 'Daily sales and profit report',
      lowStockAlerts: 'Low stock alerts',
      lowStockAlertsDesc: 'When products run low',
      newOrderAlerts: 'New order alerts',
      newOrderAlertsDesc: 'Instant notification for every order',
      anomalyAlerts: 'Anomaly alerts',
      anomalyAlertsDesc: 'Unusual changes in sales',
      actions: 'Actions',
      sendTest: 'Send Test',
      preview: 'Preview',
      howItWorks: 'How it works?',
      howItWorksDesc: 'Create a bot via @BotFather, get the token and specify the chat ID to receive notifications. The bot will send you daily summaries and important alerts.',
      testMessageSent: 'Test message sent!',
    },
    subscription: {
      title: 'Subscription',
      currentPlan: 'Current Plan',
      upgrade: 'Upgrade',
      downgrade: 'Downgrade',
      freeTier: 'Free',
      basicTier: 'Basic',
      proTier: 'Professional',
      enterpriseTier: 'Enterprise',
      monthlyBilling: 'Monthly',
      yearlyBilling: 'Yearly',
      savePercent: 'Save',
      features: 'Features',
      subscribe: 'Subscribe',
      cancel: 'Cancel Subscription',
      trialDays: 'days free',
      popularChoice: 'Popular Choice',
      contactSales: 'Contact Sales',
      limitReached: 'Limit Reached',
    },
    aiCfo: {
      title: 'AI Financial Director',
      subtitle: 'Smart analysis of your business',
      virtualCFO: 'Virtual CFO',
      revenueForecast: 'Revenue Forecast',
      anomalyDetection: 'Anomaly Detection',
      taxOptimization: 'Tax Optimization',
      financialInsights: 'Financial Insights',
      predictedRevenue: 'Predicted Revenue',
      confidence: 'Confidence',
      anomalyAlert: 'Anomaly Alert',
      salesDrop: 'Sales Drop',
      salesSpike: 'Sales Spike',
      expenseSpike: 'Expense Spike',
      suggestedActions: 'Suggested Actions',
      taxSuggestion: 'Tax Suggestion',
      potentialSavings: 'Potential Savings',
      chat: 'Chat',
      insights: 'Insights',
      forecast: 'Forecast',
      askQuestion: 'Ask about your business...',
      keyInsights: 'Key Insights',
      potentialImpact: 'Potential Impact',
    },
    theme: {
      appearance: 'Appearance',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      systemDefault: 'System Default',
    },
  },
};
