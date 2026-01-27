import { View, Text, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { MapPin, Utensils, Waves, Camera, ShoppingBag } from 'lucide-react-native';

export default function ExploreScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Hero */}
      <View className="bg-blue-600 px-4 pt-6 pb-8">
        <Text className="text-white text-2xl font-bold mb-2">
          Explore Hatteras Island
        </Text>
        <Text className="text-blue-100">
          Discover local attractions, dining, and activities
        </Text>
      </View>

      {/* Categories */}
      <View className="px-4 -mt-4 mb-6">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <Pressable
              key={category.slug}
              className="bg-white rounded-xl shadow-sm p-4 mr-4 w-24 items-center"
            >
              <category.icon color="#2563eb" size={28} />
              <Text className="text-xs text-gray-600 mt-2 text-center">
                {category.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Villages */}
      <View className="px-4 mb-6">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Villages</Text>
        {villages.map((village) => (
          <Pressable
            key={village.slug}
            className="bg-white rounded-xl overflow-hidden shadow-sm mb-4"
          >
            <Image
              source={{ uri: village.image }}
              className="w-full h-40"
              contentFit="cover"
            />
            <View className="p-4">
              <Text className="font-semibold text-gray-900 text-lg mb-1">
                {village.name}
              </Text>
              <Text className="text-gray-500 text-sm mb-2">
                {village.description}
              </Text>
              <View className="flex-row flex-wrap">
                {village.highlights.map((highlight, index) => (
                  <View
                    key={index}
                    className="bg-blue-50 rounded-full px-3 py-1 mr-2 mb-2"
                  >
                    <Text className="text-blue-600 text-xs">{highlight}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Popular Activities */}
      <View className="px-4 mb-6">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Popular Activities
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {activities.map((activity) => (
            <Pressable
              key={activity.name}
              className="bg-white rounded-xl overflow-hidden shadow-sm mr-4 w-48"
            >
              <Image
                source={{ uri: activity.image }}
                className="w-full h-32"
                contentFit="cover"
              />
              <View className="p-3">
                <Text className="font-semibold text-gray-900 mb-1">
                  {activity.name}
                </Text>
                <Text className="text-gray-500 text-xs" numberOfLines={2}>
                  {activity.description}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Emergency Info */}
      <View className="px-4 pb-8">
        <View className="bg-red-50 rounded-xl p-4">
          <Text className="font-semibold text-red-800 mb-2">
            Emergency Information
          </Text>
          <Text className="text-red-700 text-sm mb-2">
            In case of emergency, dial 911
          </Text>
          <Text className="text-red-600 text-xs">
            Nearest hospital: The Outer Banks Hospital{'\n'}
            4800 S Croatan Hwy, Nags Head, NC 27959{'\n'}
            Phone: (252) 449-4500
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const categories = [
  { name: 'Beaches', slug: 'beaches', icon: Waves },
  { name: 'Dining', slug: 'dining', icon: Utensils },
  { name: 'Attractions', slug: 'attractions', icon: Camera },
  { name: 'Shopping', slug: 'shopping', icon: ShoppingBag },
];

const villages = [
  {
    name: 'Rodanthe',
    slug: 'rodanthe',
    image: '/images/villages/rodanthe.jpg',
    description: 'Known for the "Nights in Rodanthe" house and world-class kiteboarding',
    highlights: ['Kiteboarding', 'Pier Fishing', 'Beach Access'],
  },
  {
    name: 'Avon',
    slug: 'avon',
    image: '/images/villages/avon.jpg',
    description: 'A quiet village perfect for families with great shopping and dining',
    highlights: ['Shopping', 'Restaurants', 'Family Beach'],
  },
  {
    name: 'Buxton',
    slug: 'buxton',
    image: '/images/villages/buxton.jpg',
    description: 'Home to the iconic Cape Hatteras Lighthouse',
    highlights: ['Lighthouse', 'Surfing', 'Nature Trails'],
  },
];

const activities = [
  {
    name: 'Surfing',
    image: '/images/activities/surfing.jpg',
    description: 'World-renowned surf spots for all skill levels',
  },
  {
    name: 'Fishing',
    image: '/images/activities/fishing.jpg',
    description: 'Charter boats and pier fishing available',
  },
  {
    name: 'Lighthouse Tour',
    image: '/images/activities/lighthouse.jpg',
    description: 'Climb the iconic Cape Hatteras Lighthouse',
  },
  {
    name: 'Kayaking',
    image: '/images/activities/kayaking.jpg',
    description: 'Explore the sound side waterways',
  },
];
