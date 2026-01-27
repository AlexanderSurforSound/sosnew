import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Home, Waves, Sun, Fish, Camera, ChevronRight } from 'lucide-react';
import { villages, pointsOfInterest } from '@/lib/island-data';
import { PropertyGrid } from '@/components/property/PropertyGrid';
import SeasonalHighlights from '@/components/explore/SeasonalHighlights';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return villages.map((village) => ({
    slug: village.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const village = villages.find((v) => v.slug === params.slug);
  if (!village) return { title: 'Village Not Found' };

  return {
    title: `${village.name} Vacation Rentals | Hatteras Island`,
    description: village.description,
  };
}

export default function VillagePage({ params }: Props) {
  const village = villages.find((v) => v.slug === params.slug);

  if (!village) {
    notFound();
  }

  const villagePOIs = pointsOfInterest.filter((poi) => poi.village === village.id);

  // Mock properties for this village
  const mockProperties = Array.from({ length: 6 }).map((_, i) => ({
    id: `${village.id}-${i}`,
    trackId: `TRACK-${village.id}-${i}`,
    name: `${village.name} Beach House ${i + 1}`,
    slug: `${village.slug}-beach-house-${i + 1}`,
    bedrooms: 3 + (i % 3),
    bathrooms: 2 + (i % 2),
    sleeps: 6 + (i * 2),
    propertyType: 'House',
    images: [{ url: `/images/properties/${village.slug}-${(i % 3) + 1}.jpg`, isPrimary: true }],
    amenities: [],
    petFriendly: i % 2 === 0,
    featured: i < 2,
    baseRate: 250 + (i * 50),
    village: { id: village.id, name: village.name, slug: village.slug },
    primaryImage: `/images/properties/${village.slug}-${(i % 3) + 1}.jpg`,
    pricePerNight: 250 + (i * 50),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px]">
        <Image
          src={village.image || `/images/villages/${village.slug}.jpg`}
          alt={village.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Breadcrumb */}
        <div className="absolute top-6 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-white/80 text-sm">
              <Link href="/" className="hover:text-white">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <Link href="/explore" className="hover:text-white">Explore</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white">{village.name}</span>
            </nav>
          </div>
        </div>

        {/* Village Info */}
        <div className="absolute bottom-0 left-0 right-0 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-white/90 mb-2">
              <MapPin className="w-5 h-5" />
              <span>Hatteras Island, North Carolina</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{village.name}</h1>
            <p className="text-xl text-white/90 max-w-2xl">{village.shortDescription}</p>
            <div className="flex items-center gap-6 mt-6">
              <div className="flex items-center gap-2 text-white">
                <Home className="w-5 h-5" />
                <span className="font-semibold">{village.propertyCount}+ rentals</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-20 relative z-10 mb-12">
          {[
            { icon: Home, label: 'Properties', value: `${village.propertyCount}+` },
            { icon: Waves, label: 'Beach Access', value: 'Direct' },
            { icon: Fish, label: 'Fishing', value: 'World-Class' },
            { icon: Camera, label: 'Attractions', value: `${villagePOIs.length}` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-lg p-6 text-center"
            >
              <stat.icon className="w-8 h-8 text-ocean-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* About Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About {village.name}</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">{village.description}</p>

            {/* Highlights */}
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Village Highlights</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {village.highlights.map((highlight, i) => (
                <div key={i} className="flex items-center gap-3 bg-ocean-50 rounded-lg p-3">
                  <Sun className="w-5 h-5 text-ocean-600 flex-shrink-0" />
                  <span className="text-gray-700">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Points of Interest */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Things to Do</h3>
            <div className="space-y-3">
              {villagePOIs.slice(0, 5).map((poi) => (
                <div key={poi.id} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-ocean-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-ocean-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{poi.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{poi.type}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/local-guide"
              className="flex items-center justify-center gap-2 w-full mt-4 py-3 bg-ocean-50 text-ocean-700 rounded-xl font-medium hover:bg-ocean-100 transition-colors"
            >
              View Full Local Guide
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Properties Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Vacation Rentals in {village.name}
            </h2>
            <Link
              href={`/properties?village=${village.slug}`}
              className="text-ocean-600 font-medium hover:text-ocean-700 flex items-center gap-1"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <PropertyGrid properties={mockProperties as any} />
        </div>

        {/* Seasonal Highlights */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Best Time to Visit</h2>
          <SeasonalHighlights />
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-ocean-600 to-ocean-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to explore {village.name}?</h2>
          <p className="text-ocean-100 text-lg mb-8 max-w-2xl mx-auto">
            Browse our selection of {village.propertyCount}+ vacation rentals and find your perfect getaway.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/properties?village=${village.slug}`}
              className="px-8 py-4 bg-white text-ocean-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Browse Properties
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 bg-ocean-500 text-white rounded-xl font-semibold hover:bg-ocean-400 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
