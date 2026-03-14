import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@/lib/logger';

// --- Interfaces ---

export interface SecurityEvent {
  id: string;
  type:
    | 'login'
    | 'logout'
    | 'data_access'
    | 'bulk_delete'
    | 'permission_change'
    | 'suspicious_activity'
    | 'settings_changed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  userId: string;
  userName: string;
  ipAddress?: string;
  deviceInfo?: string;
  timestamp: string;
  metadata: Record<string, unknown>;
  aiAnalysis?: string;
}

export interface NotificationPreferences {
  lowStock: {
    enabled: boolean;
    threshold: number;
  };
  highValueSales: {
    enabled: boolean;
    threshold: number;
  };
  teamActivity: {
    enabled: boolean;
    shiftUpdates: boolean;
    permissionChanges: boolean;
  };
  announcements: {
    enabled: boolean;
  };
  securityAlerts: {
    enabled: boolean;
  };
}

export interface BiometricSettings {
  enabled: boolean;
  lastEnabled: string | null;
}

// --- Storage Keys ---

const SECURITY_EVENTS_KEY = '@lkscale_security_events';
const NOTIFICATION_PREFS_KEY = '@lkscale_notification_prefs';
const BIOMETRIC_SETTINGS_KEY = '@lkscale_biometric_settings';

// --- ID Helper ---

const generateId = (): string =>
  `sec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// --- Default Values ---

const defaultNotificationPreferences: NotificationPreferences = {
  lowStock: {
    enabled: true,
    threshold: 10,
  },
  highValueSales: {
    enabled: true,
    threshold: 50000,
  },
  teamActivity: {
    enabled: true,
    shiftUpdates: true,
    permissionChanges: true,
  },
  announcements: {
    enabled: true,
  },
  securityAlerts: {
    enabled: true,
  },
};

const defaultBiometricSettings: BiometricSettings = {
  enabled: false,
  lastEnabled: null,
};

// --- Security Events ---

export async function getSecurityEvents(): Promise<SecurityEvent[]> {
  try {
    const raw = await AsyncStorage.getItem(SECURITY_EVENTS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as SecurityEvent[];
  } catch (error) {
    logger.error('[SecurityService] Failed to load security events:', error);
    return [];
  }
}

export async function addSecurityEvent(
  event: Omit<SecurityEvent, 'id' | 'timestamp'> & { id?: string; timestamp?: string }
): Promise<void> {
  try {
    const events = await getSecurityEvents();
    const newEvent: SecurityEvent = {
      ...event,
      id: event.id || generateId(),
      timestamp: event.timestamp || new Date().toISOString(),
    };
    events.unshift(newEvent);
    // Keep the most recent 500 events to avoid unbounded storage growth
    const trimmed = events.slice(0, 500);
    await AsyncStorage.setItem(SECURITY_EVENTS_KEY, JSON.stringify(trimmed));
  } catch (error) {
    logger.error('[SecurityService] Failed to add security event:', error);
    throw new Error('Не удалось записать событие безопасности');
  }
}

// --- Notification Preferences ---

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (!raw) {
      return { ...defaultNotificationPreferences };
    }
    const parsed = JSON.parse(raw);
    // Merge with defaults so newly added fields are always present
    return {
      lowStock: { ...defaultNotificationPreferences.lowStock, ...parsed.lowStock },
      highValueSales: { ...defaultNotificationPreferences.highValueSales, ...parsed.highValueSales },
      teamActivity: { ...defaultNotificationPreferences.teamActivity, ...parsed.teamActivity },
      announcements: { ...defaultNotificationPreferences.announcements, ...parsed.announcements },
      securityAlerts: { ...defaultNotificationPreferences.securityAlerts, ...parsed.securityAlerts },
    };
  } catch (error) {
    logger.error('[SecurityService] Failed to load notification preferences:', error);
    return { ...defaultNotificationPreferences };
  }
}

export async function saveNotificationPreferences(
  prefs: NotificationPreferences
): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
  } catch (error) {
    logger.error('[SecurityService] Failed to save notification preferences:', error);
    throw new Error('Не удалось сохранить настройки уведомлений');
  }
}

// --- Biometric Settings ---

export async function getBiometricSettings(): Promise<BiometricSettings> {
  try {
    const raw = await AsyncStorage.getItem(BIOMETRIC_SETTINGS_KEY);
    if (!raw) {
      return { ...defaultBiometricSettings };
    }
    return { ...defaultBiometricSettings, ...JSON.parse(raw) };
  } catch (error) {
    logger.error('[SecurityService] Failed to load biometric settings:', error);
    return { ...defaultBiometricSettings };
  }
}

export async function saveBiometricSettings(settings: BiometricSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(BIOMETRIC_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    logger.error('[SecurityService] Failed to save biometric settings:', error);
    throw new Error('Не удалось сохранить настройки биометрии');
  }
}

// --- Mock Security Events ---

export function generateMockSecurityEvents(): SecurityEvent[] {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;

  const users = [
    { id: 'user_001', name: 'Александр Петров' },
    { id: 'user_002', name: 'Мария Иванова' },
    { id: 'user_003', name: 'Дмитрий Смирнов' },
    { id: 'user_004', name: 'Елена Козлова' },
    { id: 'user_005', name: 'Сергей Новиков' },
  ];

  const devices = [
    'iPhone 15 Pro, iOS 18.2',
    'Samsung Galaxy S24, Android 15',
    'iPad Pro 12.9", iPadOS 18.2',
    'Xiaomi 14 Pro, Android 14',
    'Web Browser, Chrome 121',
  ];

  const events: SecurityEvent[] = [
    // 1. Successful login at unusual hour (3 AM)
    {
      id: generateId(),
      type: 'login',
      severity: 'medium',
      title: 'Вход в систему в нерабочее время',
      description: 'Успешный вход в 03:14 — необычное время для данного пользователя.',
      userId: users[2].id,
      userName: users[2].name,
      ipAddress: '185.22.174.55',
      deviceInfo: devices[1],
      timestamp: new Date(now - 2 * hour).toISOString(),
      metadata: { loginTime: '03:14', usualRange: '09:00-19:00', method: 'password' },
      aiAnalysis:
        'Вход выполнен вне обычного графика пользователя. Рекомендуется подтвердить легитимность сессии.',
    },
    // 2. Bulk data export
    {
      id: generateId(),
      type: 'data_access',
      severity: 'high',
      title: 'Массовый экспорт клиентской базы',
      description: 'Экспортировано 2 847 записей клиентов в формате CSV.',
      userId: users[0].id,
      userName: users[0].name,
      ipAddress: '91.108.56.12',
      deviceInfo: devices[4],
      timestamp: new Date(now - 5 * hour).toISOString(),
      metadata: { recordCount: 2847, format: 'CSV', tableName: 'customers' },
      aiAnalysis:
        'Объём экспорта превышает типичный (обычно до 200 записей). Проверьте, требовался ли такой объём.',
    },
    // 3. Permission elevation
    {
      id: generateId(),
      type: 'permission_change',
      severity: 'high',
      title: 'Повышение прав доступа',
      description: 'Роль пользователя изменена с «Кассир» на «Администратор».',
      userId: users[3].id,
      userName: users[3].name,
      ipAddress: '95.165.12.88',
      deviceInfo: devices[0],
      timestamp: new Date(now - 8 * hour).toISOString(),
      metadata: { previousRole: 'cashier', newRole: 'admin', changedBy: users[0].name },
    },
    // 4. Failed login attempts (brute-force pattern)
    {
      id: generateId(),
      type: 'suspicious_activity',
      severity: 'critical',
      title: '5 неудачных попыток входа',
      description: 'Зафиксировано 5 последовательных неудачных попыток входа в учётную запись.',
      userId: users[1].id,
      userName: users[1].name,
      ipAddress: '45.89.127.203',
      deviceInfo: devices[3],
      timestamp: new Date(now - 12 * hour).toISOString(),
      metadata: { attempts: 5, lockedOut: true, lastAttemptMethod: 'password' },
      aiAnalysis:
        'Возможная попытка перебора пароля. Учётная запись заблокирована. Рекомендуется сброс пароля и проверка IP.',
    },
    // 5. Settings modification — tax rate
    {
      id: generateId(),
      type: 'settings_changed',
      severity: 'medium',
      title: 'Изменение налоговых настроек',
      description: 'Ставка НДС изменена с 20% на 10%.',
      userId: users[0].id,
      userName: users[0].name,
      ipAddress: '91.108.56.12',
      deviceInfo: devices[4],
      timestamp: new Date(now - 1 * day).toISOString(),
      metadata: { field: 'taxRate', oldValue: 20, newValue: 10 },
    },
    // 6. Bulk product deletion
    {
      id: generateId(),
      type: 'bulk_delete',
      severity: 'critical',
      title: 'Массовое удаление товаров',
      description: 'Удалено 34 товара из каталога за одну операцию.',
      userId: users[2].id,
      userName: users[2].name,
      ipAddress: '185.22.174.55',
      deviceInfo: devices[1],
      timestamp: new Date(now - 1 * day - 3 * hour).toISOString(),
      metadata: { deletedCount: 34, category: 'Бытовая химия', recoverable: true },
      aiAnalysis:
        'Массовое удаление товаров одной категории. Данные можно восстановить из резервной копии в течение 30 дней.',
    },
    // 7. Normal login (trusted device, biometric)
    {
      id: generateId(),
      type: 'login',
      severity: 'low',
      title: 'Успешный вход в систему',
      description: 'Стандартный вход с распознанного устройства.',
      userId: users[0].id,
      userName: users[0].name,
      ipAddress: '91.108.56.12',
      deviceInfo: devices[0],
      timestamp: new Date(now - 1 * day - 6 * hour).toISOString(),
      metadata: { method: 'biometric', trustedDevice: true },
    },
    // 8. Logout
    {
      id: generateId(),
      type: 'logout',
      severity: 'low',
      title: 'Выход из системы',
      description: 'Пользователь завершил сеанс.',
      userId: users[4].id,
      userName: users[4].name,
      deviceInfo: devices[2],
      timestamp: new Date(now - 2 * day).toISOString(),
      metadata: { sessionDuration: '4h 23m' },
    },
    // 9. Suspicious — login from unfamiliar geo
    {
      id: generateId(),
      type: 'suspicious_activity',
      severity: 'high',
      title: 'Вход из нового местоположения',
      description: 'Обнаружен вход из незнакомого региона (Казахстан, Алматы).',
      userId: users[1].id,
      userName: users[1].name,
      ipAddress: '2.72.164.11',
      deviceInfo: devices[3],
      timestamp: new Date(now - 2 * day - 5 * hour).toISOString(),
      metadata: { country: 'KZ', city: 'Алматы', usualCountry: 'RU' },
      aiAnalysis:
        'Вход из нового географического региона. Если пользователь не путешествует, рекомендуется немедленная блокировка.',
    },
    // 10. Permission revocation
    {
      id: generateId(),
      type: 'permission_change',
      severity: 'medium',
      title: 'Отзыв прав доступа',
      description: 'У пользователя отозван доступ к модулю «Финансы».',
      userId: users[4].id,
      userName: users[4].name,
      ipAddress: '91.108.56.12',
      deviceInfo: devices[4],
      timestamp: new Date(now - 3 * day).toISOString(),
      metadata: { module: 'finance', action: 'revoke', changedBy: users[0].name },
    },
    // 11. Data access — report generation
    {
      id: generateId(),
      type: 'data_access',
      severity: 'low',
      title: 'Генерация финансового отчёта',
      description: 'Сформирован отчёт о прибыли за январь 2026.',
      userId: users[0].id,
      userName: users[0].name,
      ipAddress: '91.108.56.12',
      deviceInfo: devices[0],
      timestamp: new Date(now - 3 * day - 2 * hour).toISOString(),
      metadata: { reportType: 'profit', period: '2026-01', format: 'PDF' },
    },
    // 12. Settings changed — business name
    {
      id: generateId(),
      type: 'settings_changed',
      severity: 'low',
      title: 'Обновление данных магазина',
      description: 'Изменено название магазина на «ТехноМаркет Плюс».',
      userId: users[0].id,
      userName: users[0].name,
      ipAddress: '91.108.56.12',
      deviceInfo: devices[4],
      timestamp: new Date(now - 4 * day).toISOString(),
      metadata: {
        field: 'businessName',
        oldValue: 'ТехноМаркет',
        newValue: 'ТехноМаркет Плюс',
      },
    },
    // 13. Suspicious — bulk order cancellation pattern
    {
      id: generateId(),
      type: 'suspicious_activity',
      severity: 'medium',
      title: 'Массовая отмена заказов',
      description: 'Отменено 12 заказов за 15 минут.',
      userId: users[3].id,
      userName: users[3].name,
      ipAddress: '95.165.12.88',
      deviceInfo: devices[0],
      timestamp: new Date(now - 5 * day).toISOString(),
      metadata: { cancelledOrders: 12, timeWindowMinutes: 15, totalValue: 184500 },
      aiAnalysis:
        'Необычно высокая частота отмен. Возможны технические проблемы или злоупотребление. Рекомендуется проверка.',
    },
  ];

  // Sort by timestamp descending (most recent first)
  events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return events;
}
