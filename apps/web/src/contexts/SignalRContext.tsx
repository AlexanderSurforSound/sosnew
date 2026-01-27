'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import {
  signalRClient,
  getStoredToken,
  SignalRNotification,
  DeviceStatusUpdate,
  ReservationUpdate,
  AchievementUnlock,
  LoyaltyUpdate,
} from '@/lib/signalr';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

interface SignalRContextValue {
  isConnected: boolean;
  connectionState: ConnectionState;
  notifications: SignalRNotification[];
  unreadCount: number;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  joinReservationGroup: (reservationId: string) => Promise<void>;
  leaveReservationGroup: (reservationId: string) => Promise<void>;
}

const SignalRContext = createContext<SignalRContextValue | null>(null);

interface SignalRProviderProps {
  children: ReactNode;
  autoConnect?: boolean;
}

export function SignalRProvider({ children, autoConnect = true }: SignalRProviderProps) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [notifications, setNotifications] = useState<SignalRNotification[]>([]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Handle new notifications
  const handleNotification = useCallback((notification: SignalRNotification) => {
    setNotifications(prev => {
      // Avoid duplicates
      if (prev.some(n => n.id === notification.id)) {
        return prev;
      }
      // Keep last 50 notifications
      const updated = [notification, ...prev].slice(0, 50);
      return updated;
    });

    // Show browser notification if permission granted
    if (typeof window !== 'undefined' && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: notification.imageUrl || '/icon-192.png',
        tag: notification.id,
      });
    }
  }, []);

  // Handle device status updates (could dispatch to a device store)
  const handleDeviceStatus = useCallback((update: DeviceStatusUpdate) => {
    console.log('Device status update:', update);
    // Could dispatch to a zustand store here
  }, []);

  // Handle reservation updates
  const handleReservationUpdate = useCallback((update: ReservationUpdate) => {
    console.log('Reservation update:', update);
    // Create a notification for significant updates
    const notification: SignalRNotification = {
      id: `res_${update.reservationId}_${Date.now()}`,
      type: 'reservation_confirmed',
      title: 'Reservation Update',
      message: update.message,
      data: { reservationId: update.reservationId, ...update.data },
      actionUrl: `/account/trips/${update.reservationId}`,
      actionText: 'View Trip',
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    handleNotification(notification);
  }, [handleNotification]);

  // Handle achievement unlocks
  const handleAchievement = useCallback((achievement: AchievementUnlock) => {
    const notification: SignalRNotification = {
      id: `ach_${achievement.achievementId}`,
      type: 'achievement_unlocked',
      title: 'Achievement Unlocked!',
      message: `${achievement.name}: ${achievement.description}`,
      data: { achievement },
      imageUrl: achievement.iconUrl,
      actionUrl: '/account/achievements',
      actionText: 'View Achievements',
      createdAt: achievement.unlockedAt,
      isRead: false,
    };
    handleNotification(notification);
  }, [handleNotification]);

  // Handle loyalty updates
  const handleLoyaltyUpdate = useCallback((update: LoyaltyUpdate) => {
    const notification: SignalRNotification = {
      id: `loyalty_${Date.now()}`,
      type: 'loyalty_points',
      title: `+${update.pointsEarned} Points!`,
      message: update.reason + (update.newTier ? ` You've reached ${update.newTier} tier!` : ''),
      data: { loyalty: update },
      actionUrl: '/account/rewards',
      actionText: 'View Rewards',
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    handleNotification(notification);
  }, [handleNotification]);

  // Connect to SignalR
  const connect = useCallback(async () => {
    const token = getStoredToken();
    if (token) {
      signalRClient.setToken(token);
    }
    await signalRClient.connect();
  }, []);

  // Disconnect from SignalR
  const disconnect = useCallback(async () => {
    await signalRClient.disconnect();
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Join a reservation group for real-time updates
  const joinReservationGroup = useCallback(async (reservationId: string) => {
    await signalRClient.joinGroup(`reservation_${reservationId}`);
  }, []);

  // Leave a reservation group
  const leaveReservationGroup = useCallback(async (reservationId: string) => {
    await signalRClient.leaveGroup(`reservation_${reservationId}`);
  }, []);

  // Set up event subscriptions
  useEffect(() => {
    const unsubscribeNotification = signalRClient.onNotification(handleNotification);
    const unsubscribeDevice = signalRClient.onDeviceStatus(handleDeviceStatus);
    const unsubscribeReservation = signalRClient.onReservationUpdate(handleReservationUpdate);
    const unsubscribeAchievement = signalRClient.onAchievement(handleAchievement);
    const unsubscribeLoyalty = signalRClient.onLoyaltyUpdate(handleLoyaltyUpdate);
    const unsubscribeState = signalRClient.onConnectionStateChange(setConnectionState);

    return () => {
      unsubscribeNotification();
      unsubscribeDevice();
      unsubscribeReservation();
      unsubscribeAchievement();
      unsubscribeLoyalty();
      unsubscribeState();
    };
  }, [handleNotification, handleDeviceStatus, handleReservationUpdate, handleAchievement, handleLoyaltyUpdate]);

  // Auto-connect on mount if user is authenticated
  useEffect(() => {
    if (autoConnect && typeof window !== 'undefined') {
      const token = getStoredToken();
      if (token) {
        connect().catch(console.error);
      }
    }

    return () => {
      disconnect().catch(console.error);
    };
  }, [autoConnect, connect, disconnect]);

  // Request notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        // We'll request permission when user interacts, not on load
      }
    }
  }, []);

  const value: SignalRContextValue = {
    isConnected: connectionState === 'connected',
    connectionState,
    notifications,
    unreadCount,
    connect,
    disconnect,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    joinReservationGroup,
    leaveReservationGroup,
  };

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  );
}

export function useSignalR() {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error('useSignalR must be used within a SignalRProvider');
  }
  return context;
}
