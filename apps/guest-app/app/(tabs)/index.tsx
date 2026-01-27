import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Search, MapPin, Star } from 'lucide-react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: featuredProperties } = useQuery({
    queryKey: ['properties', 'featured'],
    queryFn: () => api.getFeaturedProperties(),
  });

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Hero Section */}
      <View className="bg-blue-600 px-4 pt-8 pb-12">
        <Text className="text-white text-2xl font-bold mb-2">
          Welcome to Hatteras Island
        </Text>
        <Text className="text-blue-100 mb-6">
          Find your perfect vacation rental
        </Text>

        {/* Search Bar */}
        <View className="bg-white rounded-xl px-4 py-3 flex-row items-center">
          <Search color="#6b7280" size={20} />
          <TextInput
            className="flex-1 ml-3 text-base"
            placeholder="Search properties..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View className="px-4 -mt-6 mb-6">
        <View className="bg-white rounded-xl shadow-sm p-4 flex-row justify-around">
          <Link href="/properties?petFriendly=true" asChild>
            <Pressable className="items-center">
              <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-2">
                <Text className="text-2xl">🐕</Text>
              </View>
              <Text className="text-xs text-gray-600">Pet Friendly</Text>
            </Pressable>
          </Link>
          <Link href="/properties?amenities=private-pool" asChild>
            <Pressable className="items-center">
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
                <Text className="text-2xl">🏊</Text>
              </View>
              <Text className="text-xs text-gray-600">With Pool</Text>
            </Pressable>
          </Link>
          <Link href="/properties?amenities=oceanfront" asChild>
            <Pressable className="items-center">
              <View className="w-12 h-12 bg-cyan-100 rounded-full items-center justify-center mb-2">
                <Text className="text-2xl">🌊</Text>
              </View>
              <Text className="text-xs text-gray-600">Oceanfront</Text>
            </Pressable>
          </Link>
          <Link href="/specials" asChild>
            <Pressable className="items-center">
              <View className="w-12 h-12 bg-amber-100 rounded-full items-center justify-center mb-2">
                <Text className="text-2xl">⭐</Text>
              </View>
              <Text className="text-xs text-gray-600">Specials</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      {/* Featured Properties */}
      <View className="px-4 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-gray-900">
            Featured Properties
          </Text>
          <Link href="/properties" asChild>
            <Pressable>
              <Text className="text-blue-600 text-sm">View all</Text>
            </Pressable>
          </Link>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {featuredProperties?.map((property) => (
            <Link
              key={property.id}
              href={`/property/${property.slug}`}
              asChild
            >
              <Pressable className="mr-4 w-64 bg-white rounded-xl shadow-sm overflow-hidden">
                <Image
                  source={{ uri: property.images[0]?.url }}
                  className="w-full h-40"
                  contentFit="cover"
                />
                <View className="p-3">
                  <Text className="font-semibold text-gray-900 mb-1" numberOfLines={1}>
                    {property.name}
                  </Text>
                  <View className="flex-row items-center mb-2">
                    <MapPin color="#6b7280" size={14} />
                    <Text className="text-gray-500 text-xs ml-1">
                      {property.village?.name || 'Hatteras Island'}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-500 text-xs">
                      {property.bedrooms} beds · {property.bathrooms} baths
                    </Text>
                    {property.baseRate && (
                      <Text className="font-semibold text-blue-600">
                        ${property.baseRate}/nt
                      </Text>
                    )}
                  </View>
                </View>
              </Pressable>
            </Link>
          ))}
        </ScrollView>
      </View>

      {/* Villages */}
      <View className="px-4 mb-6">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Explore Villages
        </Text>
        <View className="flex-row flex-wrap justify-between">
          {villages.map((village) => (
            <Link
              key={village.slug}
              href={`/explore?village=${village.slug}`}
              asChild
            >
              <Pressable className="w-[48%] mb-4">
                <View className="relative rounded-xl overflow-hidden h-32">
                  <Image
                    source={{ uri: village.image }}
                    className="w-full h-full"
                    contentFit="cover"
                  />
                  <View className="absolute inset-0 bg-black/30" />
                  <View className="absolute bottom-0 left-0 right-0 p-3">
                    <Text className="text-white font-semibold">{village.name}</Text>
                    <Text className="text-white/80 text-xs">
                      {village.propertyCount} properties
                    </Text>
                  </View>
                </View>
              </Pressable>
            </Link>
          ))}
        </View>
      </View>

      {/* Contact */}
      <View className="px-4 pb-8">
        <View className="bg-blue-50 rounded-xl p-4">
          <Text className="font-semibold text-gray-900 mb-2">Need Help?</Text>
          <Text className="text-gray-600 text-sm mb-3">
            Our guest services team is available 24/7
          </Text>
          <Pressable className="bg-blue-600 rounded-lg py-3 items-center">
            <Text className="text-white font-semibold">Call 252-987-2000</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const villages = [
  { name: 'Rodanthe', slug: 'rodanthe', image: '/images/villages/rodanthe.jpg', propertyCount: 85 },
  { name: 'Waves', slug: 'waves', image: '/images/villages/waves.jpg', propertyCount: 120 },
  { name: 'Avon', slug: 'avon', image: '/images/villages/avon.jpg', propertyCount: 180 },
  { name: 'Buxton', slug: 'buxton', image: '/images/villages/buxton.jpg', propertyCount: 95 },
];
