'use client';

import { useCallback, useMemo } from 'react';
import { useSignalR } from '@/contexts/SignalRContext';
import type { SignalRNotification, NotificationType } from '@/lib/signalr';

interface UseNotificationsOptions {
  types?: NotificationType[];
  maxItems?: number;
}

interface UseNotificationsReturn {
  notifications: SignalRNotification[];
  unreadCount: number;
  hasUnread: boolean;
  isConnected: boolean;
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clear: () => void;
  requestPermission: () => Promise<NotificationPermission>;
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const {
    notifications: allNotifications,
    unreadCount: totalUnreadCount,
    isConnected,
    connectionState,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useSignalR();

  const { types, maxItems = 50 } = options;

  // Filter notifications by type if specified
  const notifications = useMemo(() => {
    let filtered = allNotifications;
    if (types && types.length > 0) {
      filtered = allNotifications.filter(n => types.includes(n.type));
    }
    return filtered.slice(0, maxItems);
  }, [allNotifications, types, maxItems]);

  // Calculate unread count for filtered notifications
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const hasUnread = unreadCount > 0;

  // Request browser notification permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }, []);

  return {
    notifications,
    unreadCount,
    hasUnread,
    isConnected,
    connectionState,
    markAsRead,
    markAllAsRead,
    clear: clearNotifications,
    requestPermission,
  };
}

// Specialized hooks for specific notification types
export function useReservationNotifications() {
  return useNotifications({
    types: [
      'reservation_confirmed',
      'reservation_reminder',
      'checkin_ready',
      'checkout_reminder',
    ],
  });
}

export function usePaymentNotifications() {
  return useNotifications({
    types: ['payment_due', 'payment_received'],
  });
}

export function useAchievementNotifications() {
  return useNotifications({
    types: ['achievement_unlocked', 'loyalty_points'],
  });
}

export function useDeviceNotifications() {
  return useNotifications({
    types: ['device_unlocked', 'device_status'],
  });
}
