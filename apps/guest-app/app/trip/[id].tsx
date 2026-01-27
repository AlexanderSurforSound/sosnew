import { View, Text, ScrollView, Pressable, Alert, Linking } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import {
  Lock,
  Thermometer,
  Wifi,
  MapPin,
  Phone,
  Calendar,
  Users,
  ChevronRight,
  Unlock,
} from 'lucide-react-native';
import { format, isWithinInterval, addDays } from 'date-fns';
import { api } from '../../lib/api';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: reservation, isLoading } = useQuery({
    queryKey: ['reservation', id],
    queryFn: () => api.getReservation(id),
  });

  const isActiveStay = reservation
    ? isWithinInterval(new Date(), {
        start: addDays(new Date(reservation.checkIn), -1),
        end: addDays(new Date(reservation.checkOut), 1),
      })
    : false;

  const { data: devices } = useQuery({
    queryKey: ['devices', id],
    queryFn: () => api.getReservationDevices(id),
    enabled: !!reservation && isActiveStay,
  });

  const unlockMutation = useMutation({
    mutationFn: (deviceId: string) => api.unlockDevice(deviceId),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Door unlocked!');
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to unlock. Please try again.');
    },
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  if (!reservation) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Reservation not found</Text>
      </View>
    );
  }

  const frontDoorLock = devices?.find(
    (d) => d.location === 'front_door' && d.deviceType === 'lock'
  );
  const thermostat = devices?.find((d) => d.deviceType === 'thermostat');

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Property Image */}
      <Image
        source={{ uri: reservation.property?.images?.[0]?.url }}
        className="w-full h-64"
        contentFit="cover"
      />

      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">
          {reservation.property?.name || 'Your Rental'}
        </Text>
        <View className="flex-row items-center mt-1">
          <MapPin color="#6b7280" size={16} />
          <Text className="text-gray-500 ml-1">
            {reservation.property?.village?.name || 'Hatteras Island'}, NC
          </Text>
        </View>
      </View>

      {/* Dates */}
      <View className="mx-4 my-4 p-4 bg-gray-50 rounded-xl flex-row justify-between">
        <View>
          <Text className="text-xs text-gray-500 mb-1">Check-in</Text>
          <Text className="font-semibold text-gray-900">
            {format(new Date(reservation.checkIn), 'EEE, MMM d')}
          </Text>
          <Text className="text-xs text-gray-500">After 4:00 PM</Text>
        </View>
        <View className="items-center justify-center">
          <Calendar color="#6b7280" size={20} />
        </View>
        <View className="items-end">
          <Text className="text-xs text-gray-500 mb-1">Check-out</Text>
          <Text className="font-semibold text-gray-900">
            {format(new Date(reservation.checkOut), 'EEE, MMM d')}
          </Text>
          <Text className="text-xs text-gray-500">Before 10:00 AM</Text>
        </View>
      </View>

      {/* Smart Home Controls - Only show during active stay */}
      {isActiveStay && devices && devices.length > 0 && (
        <View className="px-4 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Home Controls
          </Text>

          {/* Unlock Button */}
          {frontDoorLock && (
            <Pressable
              onPress={() => unlockMutation.mutate(frontDoorLock.id)}
              disabled={unlockMutation.isPending}
              className={`flex-row items-center justify-center p-6 rounded-2xl mb-3 ${
                unlockMutation.isPending ? 'bg-gray-200' : 'bg-blue-600'
              }`}
            >
              {unlockMutation.isPending ? (
                <Lock color="#9ca3af" size={28} />
              ) : (
                <Unlock color="white" size={28} />
              )}
              <Text
                className={`text-xl font-semibold ml-3 ${
                  unlockMutation.isPending ? 'text-gray-400' : 'text-white'
                }`}
              >
                {unlockMutation.isPending ? 'Unlocking...' : 'Tap to Unlock'}
              </Text>
            </Pressable>
          )}

          {/* Thermostat */}
          {thermostat && (
            <View className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl">
              <View className="flex-row items-center">
                <Thermometer color="#6b7280" size={24} />
                <Text className="ml-3 text-gray-700">Temperature</Text>
              </View>
              <Text className="text-2xl font-semibold">
                {thermostat.currentTemp || 72}°F
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Property Info */}
      <View className="px-4 mb-4">
        <Text className="text-lg font-semibold text-gray-900 mb-3">
          Property Information
        </Text>

        {/* WiFi */}
        {reservation.property?.wifiName && (
          <Pressable className="flex-row items-center p-4 bg-gray-50 rounded-xl mb-3">
            <Wifi color="#6b7280" size={24} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-500">WiFi Network</Text>
              <Text className="font-medium text-gray-900">
                {reservation.property.wifiName}
              </Text>
              <Text className="text-sm text-gray-600">
                Password: {reservation.property.wifiPassword}
              </Text>
            </View>
          </Pressable>
        )}

        {/* Address */}
        {reservation.property?.address && (
          <Pressable
            className="flex-row items-center p-4 bg-gray-50 rounded-xl mb-3"
            onPress={() => {
              const address = reservation.property?.address;
              if (address) {
                const url = `maps:0,0?q=${encodeURIComponent(
                  `${address.street}, ${address.city}, ${address.state} ${address.zip}`
                )}`;
                Linking.openURL(url);
              }
            }}
          >
            <MapPin color="#6b7280" size={24} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-gray-500">Address</Text>
              <Text className="font-medium text-gray-900">
                {reservation.property.address.street}
              </Text>
              <Text className="text-sm text-gray-600">
                {reservation.property.address.city},{' '}
                {reservation.property.address.state}
              </Text>
            </View>
            <ChevronRight color="#6b7280" size={20} />
          </Pressable>
        )}

        {/* Support */}
        <Pressable
          className="flex-row items-center p-4 bg-gray-50 rounded-xl"
          onPress={() => Linking.openURL('tel:252-987-2000')}
        >
          <Phone color="#6b7280" size={24} />
          <View className="ml-3 flex-1">
            <Text className="text-xs text-gray-500">Need Help?</Text>
            <Text className="font-medium text-gray-900">Call Guest Services</Text>
            <Text className="text-sm text-gray-600">252-987-2000</Text>
          </View>
          <ChevronRight color="#6b7280" size={20} />
        </Pressable>
      </View>

      {/* Guests */}
      <View className="px-4 mb-4">
        <Text className="text-lg font-semibold text-gray-900 mb-3">
          Guest Details
        </Text>
        <View className="flex-row items-center p-4 bg-gray-50 rounded-xl">
          <Users color="#6b7280" size={24} />
          <View className="ml-3">
            <Text className="font-medium text-gray-900">
              {reservation.adults + reservation.children} Guest
              {reservation.adults + reservation.children !== 1 ? 's' : ''}
            </Text>
            <Text className="text-sm text-gray-600">
              {reservation.adults} adult{reservation.adults !== 1 ? 's' : ''}
              {reservation.children > 0 &&
                `, ${reservation.children} child${reservation.children !== 1 ? 'ren' : ''}`}
              {reservation.pets > 0 &&
                `, ${reservation.pets} pet${reservation.pets !== 1 ? 's' : ''}`}
            </Text>
          </View>
        </View>
      </View>

      {/* Check-in Instructions */}
      {reservation.property?.checkInInstructions && (
        <View className="px-4 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Check-in Instructions
          </Text>
          <View className="p-4 bg-blue-50 rounded-xl">
            <Text className="text-gray-700 leading-6">
              {reservation.property.checkInInstructions}
            </Text>
          </View>
        </View>
      )}

      {/* Payment Summary */}
      <View className="px-4 mb-8">
        <Text className="text-lg font-semibold text-gray-900 mb-3">
          Payment Summary
        </Text>
        <View className="p-4 bg-gray-50 rounded-xl">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Total</Text>
            <Text className="font-semibold">
              ${reservation.totalAmount?.toLocaleString()}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Status</Text>
            <Text
              className={`font-medium ${
                reservation.paymentStatus === 'paid'
                  ? 'text-green-600'
                  : 'text-amber-600'
              }`}
            >
              {reservation.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
