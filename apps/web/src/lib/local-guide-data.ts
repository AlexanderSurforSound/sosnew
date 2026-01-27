// Local restaurants, shops, and experiences on Hatteras Island

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  cuisine: string[];
  priceLevel: 1 | 2 | 3 | 4; // $ to $$$$
  village: string;
  address: string;
  phone?: string;
  website?: string;
  hours?: string;
  features: string[];
  image?: string;
  rating: number;
  reviewCount: number;
}

export interface LocalEvent {
  id: string;
  name: string;
  description: string;
  date: string;
  endDate?: string;
  time?: string;
  location: string;
  village: string;
  category: 'festival' | 'market' | 'music' | 'sports' | 'nature' | 'family' | 'community';
  image?: string;
  website?: string;
  isFree: boolean;
  isRecurring: boolean;
  recurrencePattern?: string;
}

export interface LocalShop {
  id: string;
  name: string;
  description: string;
  category: 'surf' | 'gifts' | 'grocery' | 'clothing' | 'art' | 'outdoor' | 'convenience';
  village: string;
  address: string;
  phone?: string;
  website?: string;
  features: string[];
}

export const restaurants: Restaurant[] = [
  {
    id: 'cafe-pamlico',
    name: 'Cafe Pamlico',
    slug: 'cafe-pamlico',
    description: 'Upscale waterfront dining with stunning sunset views over Pamlico Sound. Known for fresh local seafood and creative coastal cuisine.',
    cuisine: ['Seafood', 'American', 'Fine Dining'],
    priceLevel: 4,
    village: 'buxton',
    address: '49684 NC Highway 12, Buxton',
    phone: '(252) 995-7040',
    features: ['Waterfront', 'Sunset Views', 'Full Bar', 'Reservations Recommended'],
    rating: 4.7,
    reviewCount: 324
  },
  {
    id: 'orange-blossom-bakery',
    name: 'Orange Blossom Bakery & Cafe',
    slug: 'orange-blossom-bakery',
    description: 'Famous for their Apple Uglies (legendary cinnamon rolls), fresh pastries, and hearty breakfast. A Buxton institution.',
    cuisine: ['Bakery', 'Breakfast', 'Cafe'],
    priceLevel: 1,
    village: 'buxton',
    address: '47206 NC Highway 12, Buxton',
    phone: '(252) 995-4109',
    hours: '6:30 AM - 2:00 PM',
    features: ['Apple Uglies', 'Fresh Baked', 'Breakfast', 'Coffee'],
    rating: 4.8,
    reviewCount: 892
  },
  {
    id: 'dinky-doo-dads',
    name: "Dinky's Waterfront Restaurant",
    slug: 'dinkys-waterfront',
    description: 'Casual waterfront dining overlooking Hatteras Harbor. Fresh catch of the day and classic seafood favorites.',
    cuisine: ['Seafood', 'American'],
    priceLevel: 2,
    village: 'hatteras-village',
    address: '57878 NC Highway 12, Hatteras Village',
    phone: '(252) 986-2347',
    features: ['Waterfront', 'Fresh Catch', 'Family Friendly', 'Outdoor Seating'],
    rating: 4.5,
    reviewCount: 567
  },
  {
    id: 'angelos-pizza',
    name: "Angelo's Pizza",
    slug: 'angelos-pizza',
    description: 'Family-owned Italian restaurant serving hand-tossed pizzas, pasta, and subs. Perfect for a casual family dinner.',
    cuisine: ['Italian', 'Pizza'],
    priceLevel: 2,
    village: 'buxton',
    address: '46878 NC Highway 12, Buxton',
    phone: '(252) 995-6364',
    features: ['Pizza', 'Takeout', 'Family Friendly', 'Delivery'],
    rating: 4.4,
    reviewCount: 421
  },
  {
    id: 'good-winds-seafood',
    name: 'Good Winds Seafood & Wine Bar',
    slug: 'good-winds-seafood',
    description: 'Elevated seafood dishes with an extensive wine selection. Intimate atmosphere perfect for a special dinner.',
    cuisine: ['Seafood', 'Wine Bar'],
    priceLevel: 3,
    village: 'avon',
    address: '39450 NC Highway 12, Avon',
    phone: '(252) 995-3900',
    features: ['Wine Selection', 'Fresh Seafood', 'Intimate Setting', 'Reservations'],
    rating: 4.6,
    reviewCount: 289
  },
  {
    id: 'uncle-eddies',
    name: "Uncle Eddy's Frozen Custard",
    slug: 'uncle-eddies',
    description: 'Homemade frozen custard, shakes, and sundaes. A must-stop for dessert lovers visiting the Outer Banks.',
    cuisine: ['Dessert', 'Ice Cream'],
    priceLevel: 1,
    village: 'avon',
    address: '40230 NC Highway 12, Avon',
    features: ['Frozen Custard', 'Shakes', 'Kid Friendly', 'Outdoor Seating'],
    rating: 4.9,
    reviewCount: 743
  },
  {
    id: 'diamond-shoals',
    name: 'Diamond Shoals Restaurant',
    slug: 'diamond-shoals',
    description: 'Classic Outer Banks seafood restaurant with generous portions. Known for their seafood platters and friendly service.',
    cuisine: ['Seafood', 'American'],
    priceLevel: 2,
    village: 'buxton',
    address: '46843 NC Highway 12, Buxton',
    phone: '(252) 995-5217',
    features: ['Seafood Platters', 'Family Friendly', 'Local Favorite'],
    rating: 4.3,
    reviewCount: 512
  },
  {
    id: 'quarterdeck',
    name: 'Quarterdeck Seafood Bar',
    slug: 'quarterdeck',
    description: 'Relaxed spot for fresh oysters, steamed seafood, and cold drinks. Great for a casual afternoon by the water.',
    cuisine: ['Seafood', 'Raw Bar'],
    priceLevel: 2,
    village: 'frisco',
    address: '53922 NC Highway 12, Frisco',
    phone: '(252) 986-2425',
    features: ['Raw Bar', 'Oysters', 'Outdoor Deck', 'Casual'],
    rating: 4.5,
    reviewCount: 378
  }
];

export const localEvents: LocalEvent[] = [
  {
    id: 'farmers-market',
    name: 'Hatteras Island Farmers Market',
    description: 'Weekly farmers market featuring local produce, seafood, crafts, and baked goods from island vendors.',
    date: '2024-06-01',
    time: '9:00 AM - 1:00 PM',
    location: 'Rodanthe-Waves-Salvo Community Building',
    village: 'waves',
    category: 'market',
    isFree: true,
    isRecurring: true,
    recurrencePattern: 'Every Saturday, June - September'
  },
  {
    id: 'day-at-the-docks',
    name: 'Day at the Docks',
    description: 'Annual celebration of Hatteras Island\'s commercial fishing heritage. Blessing of the Fleet, fresh seafood, live music, and family activities.',
    date: '2024-09-14',
    location: 'Hatteras Village Harbor',
    village: 'hatteras-village',
    category: 'festival',
    isFree: true,
    isRecurring: true,
    recurrencePattern: 'Second Saturday of September'
  },
  {
    id: 'lighthouse-climb',
    name: 'Cape Hatteras Lighthouse Climbing Season',
    description: 'Climb the 257 steps of America\'s tallest brick lighthouse for panoramic views. Open seasonally.',
    date: '2024-04-19',
    endDate: '2024-10-14',
    time: '9:00 AM - 4:30 PM',
    location: 'Cape Hatteras Lighthouse',
    village: 'buxton',
    category: 'family',
    isFree: false,
    isRecurring: true,
    recurrencePattern: 'Daily, mid-April through mid-October'
  },
  {
    id: 'surf-fishing-tournament',
    name: 'Hatteras Village Surf Fishing Tournament',
    description: 'Annual surf fishing competition attracting anglers from across the East Coast. Great prizes and island camaraderie.',
    date: '2024-10-12',
    endDate: '2024-10-13',
    location: 'Hatteras Village Beach',
    village: 'hatteras-village',
    category: 'sports',
    isFree: false,
    isRecurring: true,
    recurrencePattern: 'October weekend'
  },
  {
    id: 'lifesaving-reenactment',
    name: 'Beach Apparatus Drill Reenactment',
    description: 'Historical reenactment of the lifesaving techniques used by the Chicamacomico Station crews. Educational and exciting for all ages.',
    date: '2024-06-06',
    time: '2:00 PM',
    location: 'Chicamacomico Life-Saving Station',
    village: 'rodanthe',
    category: 'family',
    isFree: false,
    isRecurring: true,
    recurrencePattern: 'Thursdays, June - August'
  },
  {
    id: 'bird-walk',
    name: 'Pea Island Bird Walk',
    description: 'Guided bird watching tour through the wildlife refuge. Spot migratory birds and learn about coastal ecosystems.',
    date: '2024-05-01',
    time: '8:00 AM',
    location: 'Pea Island National Wildlife Refuge',
    village: 'rodanthe',
    category: 'nature',
    isFree: true,
    isRecurring: true,
    recurrencePattern: 'Weekly, Spring and Fall'
  },
  {
    id: 'sunset-yoga',
    name: 'Beach Sunset Yoga',
    description: 'Relaxing yoga sessions on the beach as the sun sets over Pamlico Sound. All skill levels welcome.',
    date: '2024-06-01',
    time: '7:00 PM',
    location: 'Avon Beach Access',
    village: 'avon',
    category: 'community',
    isFree: false,
    isRecurring: true,
    recurrencePattern: 'Tuesday & Thursday evenings, Summer'
  }
];

export const localShops: LocalShop[] = [
  {
    id: 'hatteras-island-surf-shop',
    name: 'Hatteras Island Surf Shop',
    description: 'Full-service surf shop with board rentals, lessons, and all the gear you need.',
    category: 'surf',
    village: 'waves',
    address: '25410 NC Highway 12, Waves',
    phone: '(252) 987-2296',
    website: 'https://hisurfshop.com',
    features: ['Rentals', 'Lessons', 'Gear', 'Repairs']
  },
  {
    id: 'conners-supermarket',
    name: "Conner's Supermarket",
    description: 'Full-service grocery store with everything you need for your beach vacation.',
    category: 'grocery',
    village: 'buxton',
    address: '47458 NC Highway 12, Buxton',
    phone: '(252) 995-5711',
    features: ['Full Grocery', 'Fresh Seafood', 'Deli', 'Beer & Wine']
  },
  {
    id: 'buxton-village-books',
    name: 'Buxton Village Books',
    description: 'Independent bookstore with great beach reads, local history, and gifts.',
    category: 'gifts',
    village: 'buxton',
    address: '47918 NC Highway 12, Buxton',
    phone: '(252) 995-4240',
    features: ['Beach Reads', 'Local Authors', 'Gifts', 'Maps']
  },
  {
    id: 'kinnakeet-clay-studio',
    name: 'Kinnakeet Clay Studio & Showroom',
    description: 'Beautiful handmade pottery by local artists. Take home a unique piece of Hatteras.',
    category: 'art',
    village: 'avon',
    address: '40234 NC Highway 12, Avon',
    features: ['Local Art', 'Handmade Pottery', 'Unique Gifts']
  }
];

// Helper functions
export const getRestaurantsByVillage = (village: string) =>
  restaurants.filter(r => r.village === village);

export const getRestaurantsByCuisine = (cuisine: string) =>
  restaurants.filter(r => r.cuisine.some(c => c.toLowerCase() === cuisine.toLowerCase()));

export const getUpcomingEvents = () => {
  const today = new Date();
  return localEvents.filter(e => new Date(e.endDate || e.date) >= today);
};

export const getEventsByVillage = (village: string) =>
  localEvents.filter(e => e.village === village);

export const getShopsByCategory = (category: LocalShop['category']) =>
  localShops.filter(s => s.category === category);

export const getPriceLevelDisplay = (level: number) => '$'.repeat(level);

export const getAllCuisines = () => {
  const cuisines = new Set<string>();
  restaurants.forEach(r => r.cuisine.forEach(c => cuisines.add(c)));
  return Array.from(cuisines).sort();
};
