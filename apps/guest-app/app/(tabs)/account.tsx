import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import {
  User,
  Heart,
  Star,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Phone,
  Mail,
  Gift,
} from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';

export default function AccountScreen() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

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

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 bg-gray-50 px-6 pt-20">
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
            <User color="#6b7280" size={40} />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to Surf or Sound
          </Text>
          <Text className="text-gray-500 text-center">
            Sign in to manage your trips, access smart home features, and earn loyalty points
          </Text>
        </View>

        <Pressable
          onPress={() => router.push('/auth/login')}
          className="bg-blue-600 rounded-xl py-4 items-center mb-4"
        >
          <Text className="text-white font-semibold text-lg">Sign In</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/auth/register')}
          className="border border-blue-600 rounded-xl py-4 items-center"
        >
          <Text className="text-blue-600 font-semibold text-lg">
            Create Account
          </Text>
        </Pressable>

        {/* Guest Support */}
        <View className="mt-8">
          <Pressable className="flex-row items-center py-4 border-b border-gray-200">
            <HelpCircle color="#6b7280" size={24} />
            <Text className="flex-1 ml-4 text-gray-900">Help & Support</Text>
            <ChevronRight color="#6b7280" size={20} />
          </Pressable>
          <Pressable className="flex-row items-center py-4">
            <Phone color="#6b7280" size={24} />
            <Text className="flex-1 ml-4 text-gray-900">Call 252-987-2000</Text>
            <ChevronRight color="#6b7280" size={20} />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Profile Header */}
      <View className="bg-white px-4 py-6 border-b border-gray-200">
        <View className="flex-row items-center mb-4">
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
          </View>
        </View>

        {/* Loyalty Status */}
        <View className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-white font-semibold">{user.loyaltyTier} Status</Text>
            <Star color="white" size={20} fill="white" />
          </View>
          <Text className="text-white/80 text-sm mb-3">
            {user.loyaltyPoints.toLocaleString()} points
          </Text>
          <View className="bg-white/20 rounded-full h-2 mb-1">
            <View
              className="bg-white rounded-full h-2"
              style={{ width: `${Math.min((user.loyaltyPoints / 5000) * 100, 100)}%` }}
            />
          </View>
          <Text className="text-white/60 text-xs">
            {Math.max(0, 5000 - user.loyaltyPoints)} points to next tier
          </Text>
        </View>
      </View>

      {/* Menu Items */}
      <View className="bg-white mt-4">
        <MenuItem
          icon={User}
          title="Edit Profile"
          onPress={() => {}}
        />
        <MenuItem
          icon={Heart}
          title="Saved Properties"
          onPress={() => {}}
        />
        <MenuItem
          icon={Gift}
          title="Refer a Friend"
          subtitle="Earn 500 bonus points"
          onPress={() => {}}
        />
      </View>

      <View className="bg-white mt-4">
        <MenuItem
          icon={Settings}
          title="Settings"
          onPress={() => {}}
        />
        <MenuItem
          icon={HelpCircle}
          title="Help & Support"
          onPress={() => {}}
        />
        <MenuItem
          icon={Mail}
          title="Contact Us"
          onPress={() => {}}
        />
      </View>

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
        Version 1.0.0
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
        {subtitle && <Text className="text-gray-500 text-xs">{subtitle}</Text>}
      </View>
      <ChevronRight color="#6b7280" size={20} />
    </Pressable>
  );
}
