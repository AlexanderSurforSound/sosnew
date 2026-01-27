import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ChevronRight, Compass, Waves, Sun, Fish, Landmark, Moon, PawPrint, Cloud } from 'lucide-react';
import { InteractiveIslandMap } from '@/components/map/InteractiveIslandMap';
import { villages, pointsOfInterest } from '@/lib/island-data';
import FishingReports from '@/components/activities/FishingReports';
import NightSkyCalendar from '@/components/weather/NightSkyCalendar';
import SeasonalHighlights from '@/components/explore/SeasonalHighlights';
import WeatherActivities from '@/components/weather/WeatherActivities';
import PetAmenities from '@/components/pets/PetAmenities';
import SurfReport from '@/components/weather/SurfReport';

export const metadata: Metadata = {
  title: 'Explore Hatteras Island',
  description: 'Discover the seven villages of Hatteras Island, from Rodanthe to Hatteras Village. Find attractions, beaches, and the perfect vacation rental.',
};

export default function ExplorePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-16">
        <div className="container-page">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-blue-300 mb-4">
              <Compass className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wide">Explore</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Hatteras Island
            </h1>
            <p className="text-xl text-blue-100 mb-6">
              Seven unique villages stretching 50 miles along the Outer Banks, each with its own character and charm.
              From historic lighthouses to world-class surfing, find your perfect spot on the island.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <Waves className="w-5 h-5 text-cyan-300" />
                <span>50+ Miles of Beach</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <Sun className="w-5 h-5 text-amber-300" />
                <span>7 Unique Villages</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <Landmark className="w-5 h-5 text-amber-300" />
                <span>Historic Lighthouse</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-12 bg-gray-50">
        <div className="container-page">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Interactive Island Map</h2>
            <p className="text-gray-600">
              Click on villages and attractions to learn more about each location
            </p>
          </div>
          <InteractiveIslandMap showPOIs={true} className="max-w-4xl mx-auto" />
        </div>
      </section>

      {/* Villages Grid */}
      <section className="py-16">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Seven Villages</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Each village has its own personality - from the kiteboarding haven of Rodanthe
              to the working fishing village of Hatteras. Find the one that's right for you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {villages.map((village, index) => (
              <Link
                key={village.id}
                href={`/properties?village=${village.slug}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100"
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-400 to-indigo-500">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-white/30" />
                  </div>
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-gray-700">
                    #{index + 1} from North
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {village.name}
                    </h3>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-blue-600 text-sm font-medium mb-3">{village.shortDescription}</p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{village.description}</p>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {village.highlights.slice(0, 3).map((highlight) => (
                      <span
                        key={highlight}
                        className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>

                  {/* Property Count */}
                  <div className="pt-4 border-t text-sm text-gray-500">
                    {village.propertyCount} vacation rentals available
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Attractions Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Must-See Attractions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From the tallest brick lighthouse in America to pristine wildlife refuges,
              Hatteras Island offers unforgettable experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pointsOfInterest
              .filter((poi) => ['lighthouse', 'museum', 'nature', 'ferry'].includes(poi.type))
              .slice(0, 8)
              .map((poi) => (
                <div
                  key={poi.id}
                  className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                    {poi.type === 'lighthouse' && <Landmark className="w-6 h-6" />}
                    {poi.type === 'museum' && <Landmark className="w-6 h-6" />}
                    {poi.type === 'nature' && <Fish className="w-6 h-6" />}
                    {poi.type === 'ferry' && <Waves className="w-6 h-6" />}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{poi.name}</h3>
                  <p className="text-sm text-blue-600 mb-2 capitalize">{poi.type}</p>
                  <p className="text-sm text-gray-600 mb-3">{poi.description}</p>
                  <p className="text-xs text-gray-500">
                    {villages.find((v) => v.id === poi.village)?.name}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Seasonal Highlights */}
      <section className="py-16">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Best Time to Visit</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Each season offers unique experiences on Hatteras Island. Discover what awaits you.
            </p>
          </div>
          <SeasonalHighlights />
        </div>
      </section>

      {/* Fishing Reports */}
      <section className="py-16 bg-gray-50">
        <div className="container-page">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
              <Fish className="w-5 h-5" />
              <span className="font-medium">World-Class Fishing</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Fishing Reports</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hatteras Island is known as the "Blue Marlin Capital of the World." Check current conditions and what's biting.
            </p>
          </div>
          <FishingReports />
        </div>
      </section>

      {/* Weather & Activities */}
      <section className="py-16">
        <div className="container-page">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 text-amber-600 mb-2">
              <Cloud className="w-5 h-5" />
              <span className="font-medium">Plan Your Days</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Weather & Activities</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get activity recommendations based on current weather conditions.
            </p>
          </div>
          <WeatherActivities />
        </div>
      </section>

      {/* Surf Report */}
      <section className="py-16 bg-cyan-50">
        <div className="container-page">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 text-cyan-600 mb-2">
              <Waves className="w-5 h-5" />
              <span className="font-medium">Catch the Perfect Wave</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Surf Report</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real-time surf conditions and forecasts for Hatteras Island beaches.
            </p>
          </div>
          <SurfReport />
        </div>
      </section>

      {/* Night Sky Calendar */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container-page">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 text-purple-400 mb-2">
              <Moon className="w-5 h-5" />
              <span className="font-medium">Dark Sky Destination</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Stargazing Calendar</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              With minimal light pollution, Hatteras Island offers spectacular night sky viewing. Plan your stargazing around lunar phases and celestial events.
            </p>
          </div>
          <NightSkyCalendar />
        </div>
      </section>

      {/* Pet-Friendly */}
      <section className="py-16">
        <div className="container-page">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
              <PawPrint className="w-5 h-5" />
              <span className="font-medium">Bring Your Furry Friends</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pet-Friendly Paradise</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Many of our rentals welcome pets. Discover pet-friendly beaches, vets, and services.
            </p>
          </div>
          <PetAmenities />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container-page text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Find your perfect vacation rental in any of our seven villages.
            From oceanfront retreats to cozy cottages, your Hatteras adventure awaits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/properties"
              className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Browse All Properties
            </Link>
            <Link
              href="/"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Use AI Dream Matcher
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
