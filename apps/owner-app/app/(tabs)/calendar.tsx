import { View, Text, ScrollView, Pressable } from 'react-native';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  const { data: properties } = useQuery({
    queryKey: ['owner-properties'],
    queryFn: () => api.getOwnerProperties(),
  });

  const { data: reservations } = useQuery({
    queryKey: ['owner-calendar', currentDate.getFullYear(), currentDate.getMonth(), selectedProperty],
    queryFn: () => api.getOwnerCalendar({
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      propertyId: selectedProperty ?? undefined,
    }),
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];

    // Add empty slots for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getReservationForDay = (day: number | null) => {
    if (!day || !reservations) return null;
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return reservations.find(r => r.checkIn <= dateStr && r.checkOut > dateStr);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Property Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-3 bg-white border-b border-gray-200"
      >
        <Pressable
          onPress={() => setSelectedProperty(null)}
          className={`px-4 py-2 rounded-full mr-2 ${
            !selectedProperty ? 'bg-blue-600' : 'bg-gray-100'
          }`}
        >
          <Text className={!selectedProperty ? 'text-white' : 'text-gray-700'}>
            All Properties
          </Text>
        </Pressable>
        {properties?.map((property) => (
          <Pressable
            key={property.id}
            onPress={() => setSelectedProperty(property.id)}
            className={`px-4 py-2 rounded-full mr-2 ${
              selectedProperty === property.id ? 'bg-blue-600' : 'bg-gray-100'
            }`}
          >
            <Text
              className={
                selectedProperty === property.id ? 'text-white' : 'text-gray-700'
              }
            >
              {property.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Month Navigation */}
      <View className="flex-row items-center justify-between px-4 py-4 bg-white">
        <Pressable onPress={goToPreviousMonth} className="p-2">
          <ChevronLeft color="#374151" size={24} />
        </Pressable>
        <Text className="text-xl font-semibold text-gray-900">
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        <Pressable onPress={goToNextMonth} className="p-2">
          <ChevronRight color="#374151" size={24} />
        </Pressable>
      </View>

      {/* Calendar Grid */}
      <View className="px-4 py-2">
        {/* Day Headers */}
        <View className="flex-row mb-2">
          {DAYS.map((day) => (
            <View key={day} className="flex-1 items-center py-2">
              <Text className="text-gray-500 text-sm font-medium">{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Days */}
        <View className="flex-row flex-wrap">
          {days.map((day, index) => {
            const reservation = getReservationForDay(day);
            const isToday =
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            return (
              <View
                key={index}
                className="w-[14.28%] aspect-square p-1"
              >
                {day && (
                  <View
                    className={`flex-1 rounded-lg items-center justify-center ${
                      reservation
                        ? 'bg-blue-100'
                        : isToday
                        ? 'bg-blue-600'
                        : 'bg-white'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        isToday
                          ? 'text-white'
                          : reservation
                          ? 'text-blue-800'
                          : 'text-gray-900'
                      }`}
                    >
                      {day}
                    </Text>
                    {reservation && (
                      <View className="absolute bottom-1 left-1 right-1">
                        <Text
                          className="text-blue-600 text-[8px] text-center"
                          numberOfLines={1}
                        >
                          {reservation.guestName?.split(' ')[0]}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Reservations List */}
      <View className="px-4 py-4">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          {MONTHS[currentDate.getMonth()]} Reservations
        </Text>

        {reservations?.length === 0 ? (
          <View className="bg-white rounded-xl p-6 items-center">
            <Text className="text-gray-500">No reservations this month</Text>
          </View>
        ) : (
          reservations?.map((reservation) => (
            <View
              key={reservation.id}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm"
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">
                    {reservation.property?.name}
                  </Text>
                  <Text className="text-gray-600 mt-1">
                    {reservation.guestName}
                  </Text>
                  <Text className="text-blue-600 text-sm mt-1">
                    {reservation.checkIn} - {reservation.checkOut}
                  </Text>
                </View>
                <Text className="text-gray-900 font-semibold">
                  ${reservation.totalAmount.toLocaleString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
