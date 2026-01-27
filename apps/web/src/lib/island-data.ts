// Hatteras Island geographic and point of interest data

export interface Village {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  position: { x: number; y: number }; // Percentage position on map
  propertyCount: number;
  highlights: string[];
  image: string;
}

export interface PointOfInterest {
  id: string;
  name: string;
  type: 'lighthouse' | 'ferry' | 'pier' | 'beach' | 'nature' | 'museum' | 'restaurant' | 'shop' | 'landmark';
  description: string;
  village: string;
  position: { x: number; y: number };
  icon: string;
  website?: string;
}

export const villages: Village[] = [
  {
    id: 'rodanthe',
    name: 'Rodanthe',
    slug: 'rodanthe',
    description: 'The northernmost village on Hatteras Island, Rodanthe is famous for the iconic "Nights in Rodanthe" house and the historic Chicamacomico Life-Saving Station. Known for excellent kiteboarding and windsurfing conditions.',
    shortDescription: 'Historic charm & kiteboarding paradise',
    position: { x: 28, y: 8 },
    propertyCount: 85,
    highlights: ['Chicamacomico Life-Saving Station', 'Nights in Rodanthe House', 'Kiteboarding', 'Quiet beaches'],
    image: '/images/villages/rodanthe.jpg'
  },
  {
    id: 'waves',
    name: 'Waves',
    slug: 'waves',
    description: 'A small, tranquil village perfect for those seeking solitude and unspoiled beaches. Waves offers a peaceful retreat with easy access to both ocean and sound.',
    shortDescription: 'Peaceful retreat & pristine beaches',
    position: { x: 32, y: 18 },
    propertyCount: 65,
    highlights: ['Uncrowded beaches', 'Water sports', 'Family-friendly', 'Stargazing'],
    image: '/images/villages/waves.jpg'
  },
  {
    id: 'salvo',
    name: 'Salvo',
    slug: 'salvo',
    description: 'A family-friendly village with excellent beach access and a welcoming community atmosphere. Salvo is the perfect base for a relaxed beach vacation.',
    shortDescription: 'Family-friendly & great beach access',
    position: { x: 36, y: 28 },
    propertyCount: 95,
    highlights: ['Family beaches', 'Sound-side sunsets', 'Fishing', 'Community feel'],
    image: '/images/villages/salvo.jpg'
  },
  {
    id: 'avon',
    name: 'Avon',
    slug: 'avon',
    description: 'The largest village on Hatteras Island, Avon offers the most amenities including shops, restaurants, and the famous Avon Fishing Pier. A great mix of activity and relaxation.',
    shortDescription: 'Shopping, dining & fishing pier',
    position: { x: 42, y: 42 },
    propertyCount: 180,
    highlights: ['Avon Fishing Pier', 'Shopping & dining', 'Grocery stores', 'Beach access'],
    image: '/images/villages/avon.jpg'
  },
  {
    id: 'buxton',
    name: 'Buxton',
    slug: 'buxton',
    description: 'Home to the iconic Cape Hatteras Lighthouse, Buxton is a surfer\'s paradise with some of the best waves on the East Coast. The village also offers excellent fishing at "The Point."',
    shortDescription: 'Lighthouse, surfing & fishing',
    position: { x: 52, y: 58 },
    propertyCount: 150,
    highlights: ['Cape Hatteras Lighthouse', 'World-class surfing', 'The Point fishing', 'Maritime forest'],
    image: '/images/villages/buxton.jpg'
  },
  {
    id: 'frisco',
    name: 'Frisco',
    slug: 'frisco',
    description: 'A quieter village known for the Frisco Native American Museum and beautiful, less crowded beaches. Frisco offers a more laid-back atmosphere for those seeking tranquility.',
    shortDescription: 'Native American museum & quiet charm',
    position: { x: 62, y: 72 },
    propertyCount: 75,
    highlights: ['Native American Museum', 'Quiet beaches', 'Mini golf', 'Local art'],
    image: '/images/villages/frisco.jpg'
  },
  {
    id: 'hatteras-village',
    name: 'Hatteras Village',
    slug: 'hatteras-village',
    description: 'The southernmost village and gateway to Ocracoke Island via the free ferry. A working fishing village with charter boats, fresh seafood, and authentic Outer Banks character.',
    shortDescription: 'Fishing village & Ocracoke ferry',
    position: { x: 72, y: 85 },
    propertyCount: 60,
    highlights: ['Ocracoke Ferry', 'Charter fishing', 'Fresh seafood', 'Village character'],
    image: '/images/villages/hatteras-village.jpg'
  }
];

export const pointsOfInterest: PointOfInterest[] = [
  {
    id: 'chicamacomico',
    name: 'Chicamacomico Life-Saving Station',
    type: 'museum',
    description: 'Historic 1874 life-saving station with museum exhibits and weekly reenactments.',
    village: 'rodanthe',
    position: { x: 26, y: 10 },
    icon: 'anchor',
    website: 'https://chicamacomico.org'
  },
  {
    id: 'nights-house',
    name: 'Nights in Rodanthe House',
    type: 'landmark',
    description: 'The iconic oceanfront house featured in the 2008 movie, now an inn.',
    village: 'rodanthe',
    position: { x: 30, y: 6 },
    icon: 'home'
  },
  {
    id: 'avon-pier',
    name: 'Avon Fishing Pier',
    type: 'pier',
    description: 'Popular fishing pier extending 600 feet into the Atlantic.',
    village: 'avon',
    position: { x: 44, y: 40 },
    icon: 'fish',
    website: 'https://avonpier.com'
  },
  {
    id: 'cape-hatteras-lighthouse',
    name: 'Cape Hatteras Lighthouse',
    type: 'lighthouse',
    description: 'America\'s tallest brick lighthouse at 198 feet. Climb 257 steps for panoramic views.',
    village: 'buxton',
    position: { x: 54, y: 55 },
    icon: 'landmark',
    website: 'https://www.nps.gov/caha'
  },
  {
    id: 'the-point',
    name: 'Cape Point (The Point)',
    type: 'beach',
    description: 'Where the Atlantic meets the sea - famous for surf fishing and surfing.',
    village: 'buxton',
    position: { x: 58, y: 62 },
    icon: 'waves'
  },
  {
    id: 'buxton-woods',
    name: 'Buxton Woods Nature Trail',
    type: 'nature',
    description: 'Maritime forest with hiking trails through diverse coastal ecosystem.',
    village: 'buxton',
    position: { x: 50, y: 60 },
    icon: 'trees'
  },
  {
    id: 'frisco-museum',
    name: 'Frisco Native American Museum',
    type: 'museum',
    description: 'Unique museum showcasing Native American artifacts and natural history.',
    village: 'frisco',
    position: { x: 60, y: 74 },
    icon: 'museum'
  },
  {
    id: 'hatteras-ferry',
    name: 'Hatteras-Ocracoke Ferry',
    type: 'ferry',
    description: 'Free 40-minute scenic ferry to Ocracoke Island. No reservations needed.',
    village: 'hatteras-village',
    position: { x: 75, y: 88 },
    icon: 'ship'
  },
  {
    id: 'graveyard-atlantic',
    name: 'Graveyard of the Atlantic Museum',
    type: 'museum',
    description: 'Museum dedicated to the maritime history and shipwrecks of the Outer Banks.',
    village: 'hatteras-village',
    position: { x: 70, y: 83 },
    icon: 'anchor'
  },
  {
    id: 'pea-island',
    name: 'Pea Island National Wildlife Refuge',
    type: 'nature',
    description: 'Protected habitat for migratory birds with nature trails and observation decks.',
    village: 'rodanthe',
    position: { x: 24, y: 3 },
    icon: 'bird'
  }
];

export const getVillageById = (id: string): Village | undefined => {
  return villages.find(v => v.id === id);
};

export const getVillageBySlug = (slug: string): Village | undefined => {
  return villages.find(v => v.slug === slug);
};

export const getPOIsByVillage = (villageId: string): PointOfInterest[] => {
  return pointsOfInterest.filter(poi => poi.village === villageId);
};

export const getAllPOITypes = (): string[] => {
  return [...new Set(pointsOfInterest.map(poi => poi.type))];
};
