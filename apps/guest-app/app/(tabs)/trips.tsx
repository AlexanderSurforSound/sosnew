import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { Calendar, MapPin, ChevronRight, Lock } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { format, isAfter, isBefore, isWithinInterval, addDays } from 'date-fns';

export default function TripsScreen() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const {
    data: reservations,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['reservations', 'mine'],
    queryFn: () => api.getMyReservations(),
    enabled: !!user,
  });

  if (isAuthLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Calendar color="#6b7280" size={64} />
        <Text className="text-xl font-semibold text-gray-900 mt-6 mb-2">
          Sign in to view your trips
        </Text>
        <Text className="text-gray-500 text-center mb-6">
          Access your reservations, unlock doors, and manage your stay
        </Text>
        <Pressable
          onPress={() => router.push('/auth/login')}
          className="bg-blue-600 rounded-lg px-8 py-3"
        >
          <Text className="text-white font-semibold">Sign In</Text>
        </Pressable>
      </View>
    );
  }

  const now = new Date();
  const upcomingTrips = reservations?.filter(
    (r) => isAfter(new Date(r.checkIn), now) && r.status !== 'cancelled'
  ) || [];
  const currentTrips = reservations?.filter(
    (r) =>
      isWithinInterval(now, {
        start: addDays(new Date(r.checkIn), -1),
        end: addDays(new Date(r.checkOut), 1),
      }) && r.status !== 'cancelled'
  ) || [];
  const pastTrips = reservations?.filter(
    (r) => isBefore(new Date(r.checkOut), now) || r.status === 'cancelled'
  ) || [];

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      {/* Current Trips - Show Smart Home Access */}
      {currentTrips.length > 0 && (
        <View className="px-4 pt-6 pb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Current Stay
          </Text>
          {currentTrips.map((trip) => (
            <Link key={trip.id} href={`/trip/${trip.id}`} asChild>
              <Pressable className="bg-blue-600 rounded-xl p-4 mb-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-white font-semibold text-lg">
                    {trip.property?.name || 'Your Rental'}
                  </Text>
                  <View className="bg-white/20 rounded-full px-3 py-1">
                    <Text className="text-white text-xs font-medium">Active</Text>
                  </View>
                </View>
                <View className="flex-row items-center mb-4">
                  <MapPin color="white" size={14} />
                  <Text className="text-white/80 text-sm ml-1">
                    {trip.property?.village?.name || 'Hatteras Island'}
                  </Text>
                </View>

                {/* Quick Actions */}
                <View className="flex-row gap-3">
                  <Pressable className="flex-1 bg-white rounded-lg py-3 flex-row items-center justify-center">
                    <Lock color="#2563eb" size={20} />
                    <Text className="text-blue-600 font-semibold ml-2">
                      Unlock Door
                    </Text>
                  </Pressable>
                  <Pressable className="flex-1 bg-white/20 rounded-lg py-3 items-center">
                    <Text className="text-white font-semibold">View Details</Text>
                  </Pressable>
                </View>
              </Pressable>
            </Link>
          ))}
        </View>
      )}

      {/* Upcoming Trips */}
      {upcomingTrips.length > 0 && (
        <View className="px-4 pb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Upcoming Trips
          </Text>
          {upcomingTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </View>
      )}

      {/* Past Trips */}
      {pastTrips.length > 0 && (
        <View className="px-4 pb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Past Trips
          </Text>
          {pastTrips.slice(0, 5).map((trip) => (
            <TripCard key={trip.id} trip={trip} isPast />
          ))}
        </View>
      )}

      {/* Empty State */}
      {!isLoading && reservations?.length === 0 && (
        <View className="flex-1 items-center justify-center px-6 pt-20">
          <Calendar color="#6b7280" size={64} />
          <Text className="text-xl font-semibold text-gray-900 mt-6 mb-2">
            No trips yet
          </Text>
          <Text className="text-gray-500 text-center mb-6">
            Start planning your Hatteras Island getaway
          </Text>
          <Link href="/" asChild>
            <Pressable className="bg-blue-600 rounded-lg px-8 py-3">
              <Text className="text-white font-semibold">Browse Properties</Text>
            </Pressable>
          </Link>
        </View>
      )}
    </ScrollView>
  );
}

function TripCard({ trip, isPast = false }: { trip: any; isPast?: boolean }) {
  return (
    <Link href={`/trip/${trip.id}`} asChild>
      <Pressable
        className={`bg-white rounded-xl overflow-hidden shadow-sm mb-4 ${
          isPast ? 'opacity-70' : ''
        }`}
      >
        <View className="flex-row">
          <Image
            source={{ uri: trip.property?.images?.[0]?.url }}
            className="w-24 h-24"
            contentFit="cover"
          />
          <View className="flex-1 p-3 justify-center">
            <Text className="font-semibold text-gray-900 mb-1" numberOfLines={1}>
              {trip.property?.name || 'Your Rental'}
            </Text>
            <Text className="text-gray-500 text-xs mb-2">
              {format(new Date(trip.checkIn), 'MMM d')} -{' '}
              {format(new Date(trip.checkOut), 'MMM d, yyyy')}
            </Text>
            <View className="flex-row items-center">
              <View
                className={`px-2 py-1 rounded-full ${
                  trip.status === 'confirmed'
                    ? 'bg-green-100'
                    : trip.status === 'cancelled'
                      ? 'bg-red-100'
                      : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-xs font-medium capitalize ${
                    trip.status === 'confirmed'
                      ? 'text-green-700'
                      : trip.status === 'cancelled'
                        ? 'text-red-700'
                        : 'text-gray-700'
                  }`}
                >
                  {trip.status}
                </Text>
              </View>
            </View>
          </View>
          <View className="justify-center pr-3">
            <ChevronRight color="#6b7280" size={20} />
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
