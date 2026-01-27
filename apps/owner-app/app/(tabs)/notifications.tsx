import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useState } from 'react';
import {
  Bell,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Home,
} from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

type NotificationType = 'booking' | 'payment' | 'alert' | 'message' | 'maintenance';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  propertyId?: string;
  propertyName?: string;
  actionUrl?: string;
}

export default function NotificationsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const queryClient = useQueryClient();

  const { data: notifications, refetch } = useQuery({
    queryKey: ['owner-notifications', filter],
    queryFn: () => api.getOwnerNotifications({ filter }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-notifications'] });
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'booking':
        return Calendar;
      case 'payment':
        return DollarSign;
      case 'alert':
        return AlertTriangle;
      case 'message':
        return MessageSquare;
      case 'maintenance':
        return Home;
      default:
        return Bell;
    }
  };

  const getIconColor = (type: NotificationType) => {
    switch (type) {
      case 'booking':
        return '#2563eb';
      case 'payment':
        return '#16a34a';
      case 'alert':
        return '#dc2626';
      case 'message':
        return '#7c3aed';
      case 'maintenance':
        return '#ea580c';
      default:
        return '#6b7280';
    }
  };

  const getIconBg = (type: NotificationType) => {
    switch (type) {
      case 'booking':
        return 'bg-blue-100';
      case 'payment':
        return 'bg-green-100';
      case 'alert':
        return 'bg-red-100';
      case 'message':
        return 'bg-purple-100';
      case 'maintenance':
        return 'bg-orange-100';
      default:
        return 'bg-gray-100';
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications?.filter(n => !n.read).length ?? 0;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row">
            <Pressable
              onPress={() => setFilter('all')}
              className={`px-4 py-2 rounded-full mr-2 ${
                filter === 'all' ? 'bg-blue-600' : 'bg-gray-100'
              }`}
            >
              <Text
                className={filter === 'all' ? 'text-white' : 'text-gray-700'}
              >
                All
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setFilter('unread')}
              className={`px-4 py-2 rounded-full flex-row items-center ${
                filter === 'unread' ? 'bg-blue-600' : 'bg-gray-100'
              }`}
            >
              <Text
                className={filter === 'unread' ? 'text-white' : 'text-gray-700'}
              >
                Unread
              </Text>
              {unreadCount > 0 && (
                <View className="ml-2 bg-red-500 rounded-full px-1.5 min-w-[20px] items-center">
                  <Text className="text-white text-xs font-bold">
                    {unreadCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {unreadCount > 0 && (
            <Pressable
              onPress={() => markAllReadMutation.mutate()}
              className="py-2"
            >
              <Text className="text-blue-600 text-sm">Mark all read</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notifications?.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
              <CheckCircle color="#9ca3af" size={32} />
            </View>
            <Text className="text-gray-500 text-lg">All caught up!</Text>
            <Text className="text-gray-400 text-sm mt-1">
              No {filter === 'unread' ? 'unread ' : ''}notifications
            </Text>
          </View>
        ) : (
          <View className="py-2">
            {notifications?.map((notification) => {
              const Icon = getIcon(notification.type);
              const iconColor = getIconColor(notification.type);
              const iconBg = getIconBg(notification.type);

              return (
                <Pressable
                  key={notification.id}
                  onPress={() => {
                    if (!notification.read) {
                      markReadMutation.mutate(notification.id);
                    }
                  }}
                  className={`mx-4 mb-2 p-4 rounded-xl ${
                    notification.read ? 'bg-white' : 'bg-blue-50 border border-blue-100'
                  }`}
                >
                  <View className="flex-row">
                    <View
                      className={`w-10 h-10 rounded-full ${iconBg} items-center justify-center`}
                    >
                      <Icon color={iconColor} size={20} />
                    </View>
                    <View className="flex-1 ml-3">
                      <View className="flex-row items-start justify-between">
                        <Text
                          className={`flex-1 font-semibold ${
                            notification.read ? 'text-gray-900' : 'text-blue-900'
                          }`}
                        >
                          {notification.title}
                        </Text>
                        <Text className="text-gray-400 text-xs ml-2">
                          {formatTime(notification.createdAt)}
                        </Text>
                      </View>
                      <Text
                        className={`mt-1 ${
                          notification.read ? 'text-gray-500' : 'text-blue-700'
                        }`}
                      >
                        {notification.message}
                      </Text>
                      {notification.propertyName && (
                        <View className="mt-2 flex-row items-center">
                          <Home color="#6b7280" size={14} />
                          <Text className="text-gray-500 text-sm ml-1">
                            {notification.propertyName}
                          </Text>
                        </View>
                      )}
                    </View>
                    {!notification.read && (
                      <View className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
