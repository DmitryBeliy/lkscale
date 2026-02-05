import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeOut, Layout } from 'react-native-reanimated';
import { Card } from '@/components/ui';
import {
  getNotificationState,
  subscribeNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  loadNotifications,
} from '@/store/notificationStore';
import { useLocalization } from '@/localization';
import { Notification, NotificationType } from '@/types';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

const getNotificationIcon = (type: NotificationType): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'new_order':
      return 'receipt';
    case 'order_completed':
      return 'checkmark-circle';
    case 'low_stock':
      return 'warning';
    case 'payment_received':
      return 'card';
    case 'ai_insight':
      return 'sparkles';
    case 'system':
    default:
      return 'notifications';
  }
};

const getNotificationColor = (type: NotificationType): string => {
  switch (type) {
    case 'new_order':
      return colors.primary;
    case 'order_completed':
      return colors.success;
    case 'low_stock':
      return colors.warning;
    case 'payment_received':
      return colors.success;
    case 'ai_insight':
      return colors.primary;
    case 'system':
    default:
      return colors.textSecondary;
  }
};

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
  onDelete: () => void;
  formatDate: (date: string) => string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onDelete,
  formatDate,
}) => {
  const icon = getNotificationIcon(notification.type);
  const iconColor = getNotificationColor(notification.type);

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify()}
    >
      <Pressable
        style={[
          styles.notificationItem,
          !notification.isRead && styles.notificationUnread,
        ]}
        onPress={onPress}
      >
        <View style={[styles.notificationIcon, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text
              style={[
                styles.notificationTitle,
                !notification.isRead && styles.notificationTitleUnread,
              ]}
            >
              {notification.title}
            </Text>
            {!notification.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {notification.message}
          </Text>
          <Text style={styles.notificationTime}>{formatDate(notification.timestamp)}</Text>
        </View>

        <Pressable
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Ionicons name="close" size={18} color={colors.textLight} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { t, formatDate, language } = useLocalization();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsub = subscribeNotifications(() => {
      const state = getNotificationState();
      setNotifications(state.notifications);
      setUnreadCount(state.unreadCount);
    });

    // Initial load
    const state = getNotificationState();
    setNotifications(state.notifications);
    setUnreadCount(state.unreadCount);

    return () => unsub();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadNotifications();
    setRefreshing(false);
  }, []);

  const handleNotificationPress = async (notification: Notification) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl as any);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await deleteNotification(notificationId);
  };

  const handleMarkAllRead = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await markAllAsRead();
  };

  const handleDeleteAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      t.common.deleteAll,
      language === 'ru'
        ? 'Вы уверены, что хотите удалить все уведомления?'
        : 'Are you sure you want to delete all notifications?',
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: async () => {
            await deleteAllNotifications();
          },
        },
      ]
    );
  };

  const groupNotificationsByDate = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: { title: string; data: Notification[] }[] = [];
    const todayNotifications: Notification[] = [];
    const yesterdayNotifications: Notification[] = [];
    const earlierNotifications: Notification[] = [];

    notifications.forEach((n) => {
      const notificationDate = new Date(n.timestamp);
      if (notificationDate.toDateString() === today.toDateString()) {
        todayNotifications.push(n);
      } else if (notificationDate.toDateString() === yesterday.toDateString()) {
        yesterdayNotifications.push(n);
      } else {
        earlierNotifications.push(n);
      }
    });

    if (todayNotifications.length > 0) {
      groups.push({ title: t.notifications.today, data: todayNotifications });
    }
    if (yesterdayNotifications.length > 0) {
      groups.push({ title: t.notifications.yesterday, data: yesterdayNotifications });
    }
    if (earlierNotifications.length > 0) {
      groups.push({ title: t.notifications.earlier, data: earlierNotifications });
    }

    return groups;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="notifications-off-outline" size={64} color={colors.textLight} />
      <Text style={styles.emptyTitle}>{t.notifications.noNotifications}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>{t.notifications.title}</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <Pressable style={styles.headerAction} onPress={handleMarkAllRead}>
              <Ionicons name="checkmark-done" size={22} color={colors.primary} />
            </Pressable>
          )}
          {notifications.length > 0 && (
            <Pressable style={styles.headerAction} onPress={handleDeleteAll}>
              <Ionicons name="trash-outline" size={22} color={colors.error} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={groupNotificationsByDate()}
          keyExtractor={(item) => item.title}
          renderItem={({ item: group }) => (
            <View style={styles.group}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <Card style={styles.groupCard}>
                {group.data.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <NotificationItem
                      notification={notification}
                      onPress={() => handleNotificationPress(notification)}
                      onDelete={() => handleDeleteNotification(notification.id)}
                      formatDate={(date) => formatDate(date, 'relative')}
                    />
                    {index < group.data.length - 1 && <View style={styles.separator} />}
                  </React.Fragment>
                ))}
              </Card>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginRight: spacing.sm,
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    color: colors.textInverse,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  group: {
    marginBottom: spacing.lg,
  },
  groupTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  groupCard: {
    paddingVertical: spacing.xs,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  notificationUnread: {
    backgroundColor: `${colors.primary}08`,
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  notificationTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    color: colors.text,
  },
  notificationTitleUnread: {
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  notificationMessage: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: typography.sizes.sm * 1.4,
  },
  notificationTime: {
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: 60,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
});
