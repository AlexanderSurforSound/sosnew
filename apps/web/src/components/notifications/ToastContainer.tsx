'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSignalR } from '@/contexts/SignalRContext';
import { NotificationToast } from './NotificationCenter';
import type { SignalRNotification } from '@/lib/signalr';

// Types that should show as toast notifications
const TOAST_TYPES = [
  'achievement_unlocked',
  'loyalty_points',
  'checkin_ready',
  'payment_received',
];

export function ToastContainer() {
  const [toasts, setToasts] = useState<SignalRNotification[]>([]);
  const { notifications } = useSignalR();

  // Watch for new notifications that should be toasted
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];

      // Only show toast for specific types and if not already shown
      if (
        TOAST_TYPES.includes(latestNotification.type) &&
        !toasts.some(t => t.id === latestNotification.id)
      ) {
        setToasts(prev => [...prev, latestNotification]);
      }
    }
  }, [notifications, toasts]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <NotificationToast
            key={toast.id}
            notification={toast}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
