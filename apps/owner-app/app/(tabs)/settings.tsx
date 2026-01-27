import { View, Text, ScrollView, Pressable, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  Bell,
  CreditCard,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  Phone,
  Mail,
} from 'lucide-react-native';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState({
    bookings: true,
    payments: true,
    alerts: true,
    marketing: false,
  });

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View className="flex-1 bg-gray-50 px-6 pt-20">
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
            <User color="#6b7280" size={40} />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-2">
            Owner Portal
          </Text>
          <Text className="text-gray-500 text-center">
            Sign in to manage your properties and view earnings
          </Text>
        </View>

        <Pressable
          onPress={() => router.push('/auth/login')}
          className="bg-blue-600 rounded-xl py-4 items-center"
        >
          <Text className="text-white font-semibold text-lg">Sign In</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Profile Header */}
      <View className="bg-white px-4 py-6 border-b border-gray-200">
        <View className="flex-row items-center">
          <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center">
            <Text className="text-blue-600 text-2xl font-bold">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </Text>
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-xl font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </Text>
            <Text className="text-gray-500">{user.email}</Text>
            <View className="mt-1 px-2 py-0.5 bg-blue-100 rounded-full self-start">
              <Text className="text-blue-700 text-xs font-medium">
                Property Owner
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Account Settings */}
      <View className="bg-white mt-4">
        <Text className="px-4 pt-4 pb-2 text-sm font-medium text-gray-500 uppercase">
          Account
        </Text>
        <MenuItem
          icon={User}
          title="Profile Settings"
          onPress={() => {}}
        />
        <MenuItem
          icon={CreditCard}
          title="Payout Settings"
          subtitle="Bank account & payment preferences"
          onPress={() => {}}
        />
        <MenuItem
          icon={Shield}
          title="Security"
          subtitle="Password & two-factor auth"
          onPress={() => {}}
        />
      </View>

      {/* Notification Settings */}
      <View className="bg-white mt-4">
        <Text className="px-4 pt-4 pb-2 text-sm font-medium text-gray-500 uppercase">
          Notifications
        </Text>
        <NotificationToggle
          icon={Bell}
          title="New Bookings"
          subtitle="Get notified when you receive a booking"
          value={notifications.bookings}
          onValueChange={(value) =>
            setNotifications({ ...notifications, bookings: value })
          }
        />
        <NotificationToggle
          icon={CreditCard}
          title="Payments"
          subtitle="Payment confirmations and payouts"
          value={notifications.payments}
          onValueChange={(value) =>
            setNotifications({ ...notifications, payments: value })
          }
        />
        <NotificationToggle
          icon={Bell}
          title="Property Alerts"
          subtitle="Maintenance and occupancy alerts"
          value={notifications.alerts}
          onValueChange={(value) =>
            setNotifications({ ...notifications, alerts: value })
          }
        />
        <NotificationToggle
          icon={Mail}
          title="Marketing"
          subtitle="Tips and promotional offers"
          value={notifications.marketing}
          onValueChange={(value) =>
            setNotifications({ ...notifications, marketing: value })
          }
        />
      </View>

      {/* Documents */}
      <View className="bg-white mt-4">
        <Text className="px-4 pt-4 pb-2 text-sm font-medium text-gray-500 uppercase">
          Documents
        </Text>
        <MenuItem
          icon={FileText}
          title="Statements"
          subtitle="Monthly earnings statements"
          onPress={() => {}}
        />
        <MenuItem
          icon={FileText}
          title="Tax Documents"
          subtitle="1099 forms and tax reports"
          onPress={() => {}}
        />
      </View>

      {/* Support */}
      <View className="bg-white mt-4">
        <Text className="px-4 pt-4 pb-2 text-sm font-medium text-gray-500 uppercase">
          Support
        </Text>
        <MenuItem
          icon={HelpCircle}
          title="Help Center"
          onPress={() => {}}
        />
        <MenuItem
          icon={Phone}
          title="Contact Support"
          subtitle="Call 252-987-2001"
          onPress={() => {}}
        />
      </View>

      {/* Sign Out */}
      <View className="bg-white mt-4 mb-8">
        <Pressable
          onPress={handleLogout}
          className="flex-row items-center px-4 py-4"
        >
          <LogOut color="#ef4444" size={24} />
          <Text className="flex-1 ml-4 text-red-500 font-medium">Sign Out</Text>
        </Pressable>
      </View>

      {/* App Version */}
      <Text className="text-center text-gray-400 text-xs mb-8">
        Surf or Sound Owner v1.0.0
      </Text>
    </ScrollView>
  );
}

function MenuItem({
  icon: Icon,
  title,
  subtitle,
  onPress,
}: {
  icon: any;
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-4 border-b border-gray-100"
    >
      <Icon color="#6b7280" size={24} />
      <View className="flex-1 ml-4">
        <Text className="text-gray-900">{title}</Text>
        {subtitle && <Text className="text-gray-500 text-xs mt-0.5">{subtitle}</Text>}
      </View>
      <ChevronRight color="#6b7280" size={20} />
    </Pressable>
  );
}

function NotificationToggle({
  icon: Icon,
  title,
  subtitle,
  value,
  onValueChange,
}: {
  icon: any;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View className="flex-row items-center px-4 py-4 border-b border-gray-100">
      <Icon color="#6b7280" size={24} />
      <View className="flex-1 ml-4">
        <Text className="text-gray-900">{title}</Text>
        <Text className="text-gray-500 text-xs mt-0.5">{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
        thumbColor="#ffffff"
      />
    </View>
  );
}
