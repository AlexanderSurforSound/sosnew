'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, CheckCheck, Trash2, Settings, Wifi, WifiOff } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import type { SignalRNotification, NotificationType } from '@/lib/signalr';
import Link from 'next/link';

const notificationIcons: Record<NotificationType, string> = {
  reservation_confirmed: '/icons/calendar-check.svg',
  reservation_reminder: '/icons/calendar.svg',
  checkin_ready: '/icons/key.svg',
  checkout_reminder: '/icons/door.svg',
  payment_due: '/icons/credit-card.svg',
  payment_received: '/icons/check-circle.svg',
  device_unlocked: '/icons/lock-open.svg',
  device_status: '/icons/home.svg',
  review_request: '/icons/star.svg',
  promotion: '/icons/tag.svg',
  achievement_unlocked: '/icons/trophy.svg',
  loyalty_points: '/icons/gift.svg',
  message: '/icons/message.svg',
  system: '/icons/info.svg',
};

const notificationColors: Record<NotificationType, string> = {
  reservation_confirmed: 'bg-green-100 text-green-800',
  reservation_reminder: 'bg-blue-100 text-blue-800',
  checkin_ready: 'bg-emerald-100 text-emerald-800',
  checkout_reminder: 'bg-amber-100 text-amber-800',
  payment_due: 'bg-orange-100 text-orange-800',
  payment_received: 'bg-green-100 text-green-800',
  device_unlocked: 'bg-cyan-100 text-cyan-800',
  device_status: 'bg-gray-100 text-gray-800',
  review_request: 'bg-purple-100 text-purple-800',
  promotion: 'bg-pink-100 text-pink-800',
  achievement_unlocked: 'bg-yellow-100 text-yellow-800',
  loyalty_points: 'bg-indigo-100 text-indigo-800',
  message: 'bg-blue-100 text-blue-800',
  system: 'bg-gray-100 text-gray-800',
};

interface NotificationItemProps {
  notification: SignalRNotification;
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
}

function NotificationItem({ notification, onMarkAsRead, onClose }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      onClose();
    }
  };

  const content = (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`
        p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors
        ${!notification.isRead ? 'bg-blue-50/50' : ''}
      `}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        {/* Icon or Image */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notificationColors[notification.type]}`}>
          {notification.imageUrl ? (
            <img
              src={notification.imageUrl}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-lg">
              {notification.type === 'achievement_unlocked' && '🏆'}
              {notification.type === 'loyalty_points' && '🎁'}
              {notification.type === 'reservation_confirmed' && '✅'}
              {notification.type === 'checkin_ready' && '🔑'}
              {notification.type === 'payment_received' && '💵'}
              {notification.type === 'promotion' && '🎉'}
              {notification.type === 'message' && '💬'}
              {!['achievement_unlocked', 'loyalty_points', 'reservation_confirmed', 'checkin_ready', 'payment_received', 'promotion', 'message'].includes(notification.type) && '📣'}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-medium text-gray-900 ${!notification.isRead ? 'font-semibold' : ''}`}>
              {notification.title}
            </p>
            {!notification.isRead && (
              <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </div>
          <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>
            {notification.actionText && (
              <span className="text-xs font-medium text-ocean-600 hover:text-ocean-700">
                {notification.actionText}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (notification.actionUrl) {
    return <Link href={notification.actionUrl}>{content}</Link>;
  }

  return content;
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    notifications,
    unreadCount,
    hasUnread,
    isConnected,
    connectionState,
    markAsRead,
    markAllAsRead,
    clear,
    requestPermission,
  } = useNotifications();

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Request notification permission when panel is opened
  const handleOpen = async () => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      await requestPermission();
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        aria-label={`Notifications${hasUnread ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-6 h-6" />

        {/* Unread Badge */}
        {hasUnread && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Connection Status Indicator */}
        <span
          className={`absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
            isConnected ? 'bg-green-500' : connectionState === 'connecting' ? 'bg-yellow-500' : 'bg-gray-400'
          }`}
        />
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-96 max-h-[80vh] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {!isConnected && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <WifiOff className="w-3 h-3" />
                      Offline
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {hasUnread && (
                    <button
                      onClick={markAllAsRead}
                      className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clear}
                      className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Clear all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[60vh]">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No notifications yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    We&apos;ll let you know about important updates
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {notifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onClose={() => setIsOpen(false)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                <Link
                  href="/account/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-ocean-600 hover:text-ocean-700 font-medium"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Toast notification component for achievement/points popups
export function NotificationToast({ notification, onDismiss }: { notification: SignalRNotification; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-4 right-4 max-w-sm bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
    >
      <div className="p-4">
        <div className="flex gap-3">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl ${notificationColors[notification.type]}`}>
            {notification.type === 'achievement_unlocked' && '🏆'}
            {notification.type === 'loyalty_points' && '🎁'}
            {!['achievement_unlocked', 'loyalty_points'].includes(notification.type) && '🔔'}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{notification.title}</p>
            <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
            {notification.actionUrl && (
              <Link
                href={notification.actionUrl}
                onClick={onDismiss}
                className="inline-block mt-2 text-sm font-medium text-ocean-600 hover:text-ocean-700"
              >
                {notification.actionText || 'View'}
              </Link>
            )}
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* Progress bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: 0 }}
        transition={{ duration: 5, ease: 'linear' }}
        className="h-1 bg-ocean-500"
      />
    </motion.div>
  );
}
