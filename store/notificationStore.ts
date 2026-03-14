import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification, NotificationType } from '@/types';
import { logger } from '@/lib/logger';

const NOTIFICATIONS_CACHE_KEY = '@lkscale_notifications';
const UNREAD_COUNT_KEY = '@lkscale_unread_count';

// Simple state management
type Listener = () => void;
const listeners: Set<Listener> = new Set();

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
}

let notificationState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
};

export const getNotificationState = () => notificationState;

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

export const subscribeNotifications = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const setNotificationState = (updates: Partial<NotificationState>) => {
  notificationState = { ...notificationState, ...updates };
  notifyListeners();
};

// Initial mock notifications
const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'ai_insight',
    title: 'AI Рекомендация',
    message: 'Продажи товара "Товар А" выросли на 20% за неделю. Рассмотрите увеличение запасов.',
    timestamp: new Date().toISOString(),
    isRead: false,
    data: { productId: 'p1', change: 20 },
  },
  {
    id: 'n2',
    type: 'new_order',
    title: 'Новый заказ',
    message: 'Получен заказ ORD-2025-002 на сумму 8 750 ₽',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isRead: false,
    actionUrl: '/order/2',
  },
  {
    id: 'n3',
    type: 'low_stock',
    title: 'Низкий остаток',
    message: 'Товар Д - осталось 3 шт. (минимум: 25)',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    isRead: false,
    data: { productId: 'p5', stock: 3, minStock: 25 },
    actionUrl: '/product/p5',
  },
  {
    id: 'n4',
    type: 'order_completed',
    title: 'Заказ выполнен',
    message: 'Заказ ORD-2025-001 успешно доставлен клиенту',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    isRead: true,
    actionUrl: '/order/1',
  },
  {
    id: 'n5',
    type: 'payment_received',
    title: 'Оплата получена',
    message: 'Получена оплата 31 200 ₽ по заказу ORD-2025-005',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    isRead: true,
    actionUrl: '/order/5',
  },
  {
    id: 'n6',
    type: 'ai_insight',
    title: 'Прогноз продаж',
    message: 'На основе текущих трендов, ожидается рост продаж на 15% в следующую неделю.',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    isRead: true,
  },
];

// Load notifications from cache
export const loadNotifications = async () => {
  setNotificationState({ isLoading: true });

  try {
    const [cached, unreadCount] = await Promise.all([
      AsyncStorage.getItem(NOTIFICATIONS_CACHE_KEY),
      AsyncStorage.getItem(UNREAD_COUNT_KEY),
    ]);

    if (cached) {
      const notifications = JSON.parse(cached) as Notification[];
      setNotificationState({
        notifications,
        unreadCount: unreadCount ? parseInt(unreadCount, 10) : notifications.filter((n) => !n.isRead).length,
        isLoading: false,
      });
    } else {
      // Use mock data for first load
      const unread = mockNotifications.filter((n) => !n.isRead).length;
      setNotificationState({
        notifications: mockNotifications,
        unreadCount: unread,
        isLoading: false,
      });
      await cacheNotifications();
    }
  } catch (error) {
    logger.error('Error loading notifications:', error);
    setNotificationState({
      notifications: mockNotifications,
      unreadCount: mockNotifications.filter((n) => !n.isRead).length,
      isLoading: false,
    });
  }
};

// Cache notifications
const cacheNotifications = async () => {
  try {
    await Promise.all([
      AsyncStorage.setItem(NOTIFICATIONS_CACHE_KEY, JSON.stringify(notificationState.notifications)),
      AsyncStorage.setItem(UNREAD_COUNT_KEY, notificationState.unreadCount.toString()),
    ]);
  } catch (error) {
    logger.error('Error caching notifications:', error);
  }
};

// Add a new notification
export const addNotification = async (
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, unknown>,
  actionUrl?: string
) => {
  const newNotification: Notification = {
    id: `notification-${Date.now()}`,
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    isRead: false,
    data,
    actionUrl,
  };

  const notifications = [newNotification, ...notificationState.notifications];
  setNotificationState({
    notifications,
    unreadCount: notificationState.unreadCount + 1,
  });

  await cacheNotifications();
  return newNotification;
};

// Mark notification as read
export const markAsRead = async (notificationId: string) => {
  const notifications = notificationState.notifications.map((n) =>
    n.id === notificationId ? { ...n, isRead: true } : n
  );

  const wasUnread = notificationState.notifications.find((n) => n.id === notificationId && !n.isRead);

  setNotificationState({
    notifications,
    unreadCount: wasUnread
      ? Math.max(0, notificationState.unreadCount - 1)
      : notificationState.unreadCount,
  });

  await cacheNotifications();
};

// Mark all as read
export const markAllAsRead = async () => {
  const notifications = notificationState.notifications.map((n) => ({ ...n, isRead: true }));

  setNotificationState({
    notifications,
    unreadCount: 0,
  });

  await cacheNotifications();
};

// Delete notification
export const deleteNotification = async (notificationId: string) => {
  const notification = notificationState.notifications.find((n) => n.id === notificationId);
  const notifications = notificationState.notifications.filter((n) => n.id !== notificationId);

  setNotificationState({
    notifications,
    unreadCount: notification && !notification.isRead
      ? Math.max(0, notificationState.unreadCount - 1)
      : notificationState.unreadCount,
  });

  await cacheNotifications();
};

// Delete all notifications
export const deleteAllNotifications = async () => {
  setNotificationState({
    notifications: [],
    unreadCount: 0,
  });

  await cacheNotifications();
};

// Get notifications by type
export const getNotificationsByType = (type: NotificationType): Notification[] => {
  return notificationState.notifications.filter((n) => n.type === type);
};

// Get AI insight notifications
export const getAIInsightNotifications = (): Notification[] => {
  return getNotificationsByType('ai_insight');
};

// Check if there are unread AI insights
export const hasUnreadAIInsights = (): boolean => {
  return notificationState.notifications.some((n) => n.type === 'ai_insight' && !n.isRead);
};

// Add AI insight notification
export const addAIInsightNotification = async (title: string, message: string, data?: Record<string, unknown>) => {
  return addNotification('ai_insight', title, message, data);
};

// Add low stock notification
export const addLowStockNotification = async (productName: string, stock: number, minStock: number, productId: string) => {
  return addNotification(
    'low_stock',
    'Низкий остаток',
    `${productName} - осталось ${stock} шт. (минимум: ${minStock})`,
    { productId, stock, minStock },
    `/product/${productId}`
  );
};

// Add order notification
export const addOrderNotification = async (
  type: 'new_order' | 'order_completed',
  orderNumber: string,
  amount?: number,
  orderId?: string
) => {
  const title = type === 'new_order' ? 'Новый заказ' : 'Заказ выполнен';
  const message =
    type === 'new_order'
      ? `Получен заказ ${orderNumber}${amount ? ` на сумму ${amount.toLocaleString('ru-RU')} ₽` : ''}`
      : `Заказ ${orderNumber} успешно выполнен`;

  return addNotification(type, title, message, { orderNumber, amount }, orderId ? `/order/${orderId}` : undefined);
};
