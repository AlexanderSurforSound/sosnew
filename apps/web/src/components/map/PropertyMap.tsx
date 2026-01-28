'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { X, Bed, Bath, Users, Dog, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Property } from '@/types';
import { cn } from '@/lib/utils';
import { fixLeafletIcons } from '@/lib/leaflet-setup';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface PropertyMapProps {
  properties: Property[];
  className?: string;
  onPropertySelect?: (property: Property) => void;
}

// Hatteras Island center
const HATTERAS_CENTER: [number, number] = [35.35, -75.52];
const DEFAULT_ZOOM = 11;

// Village coordinates for generating property locations
// Supports multiple slug formats (e.g., "salvo", "salvo-village")
const villageCoordinates: Record<string, { lat: number; lng: number }> = {
  'rodanthe': { lat: 35.5936, lng: -75.4636 },
  'rodanthe-village': { lat: 35.5936, lng: -75.4636 },
  'waves': { lat: 35.5672, lng: -75.4697 },
  'waves-village': { lat: 35.5672, lng: -75.4697 },
  'salvo': { lat: 35.5386, lng: -75.4758 },
  'salvo-village': { lat: 35.5386, lng: -75.4758 },
  'avon': { lat: 35.3519, lng: -75.5050 },
  'avon-village': { lat: 35.3519, lng: -75.5050 },
  'buxton': { lat: 35.2668, lng: -75.5272 },
  'buxton-village': { lat: 35.2668, lng: -75.5272 },
  'frisco': { lat: 35.2375, lng: -75.6192 },
  'frisco-village': { lat: 35.2375, lng: -75.6192 },
  'hatteras-village': { lat: 35.2086, lng: -75.6900 },
  'hatteras': { lat: 35.2086, lng: -75.6900 },
};

// Get base village coordinates from slug
const getVillageBase = (slug: string): { lat: number; lng: number } => {
  const normalizedSlug = slug.toLowerCase().trim();

  // Direct match
  if (villageCoordinates[normalizedSlug]) {
    return villageCoordinates[normalizedSlug];
  }

  // Try without "-village" suffix
  const withoutVillage = normalizedSlug.replace(/-village$/, '');
  if (villageCoordinates[withoutVillage]) {
    return villageCoordinates[withoutVillage];
  }

  // Try matching by name containment
  for (const [key, coords] of Object.entries(villageCoordinates)) {
    if (normalizedSlug.includes(key) || key.includes(normalizedSlug)) {
      return coords;
    }
  }

  // Default to Avon (middle of island)
  return villageCoordinates['avon'];
};

// Generate coordinates for a property based on village
const getPropertyCoordinates = (property: Property, index: number): [number, number] => {
  // Use village-based coordinates with offset
  const villageSlug = property.village?.slug || property.village?.name?.toLowerCase().replace(/\s+/g, '-') || 'avon';
  const base = getVillageBase(villageSlug);

  // Add deterministic offset based on property id to spread markers
  const seed = (property.id || String(index)).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const latOffset = ((seed % 100) - 50) * 0.002;
  const lngOffset = (((seed * 7) % 100) - 50) * 0.002;

  return [base.lat + latOffset, base.lng + lngOffset];
};

export function PropertyMap({ properties, className, onPropertySelect }: PropertyMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    // fixLeafletIcons is now async
    fixLeafletIcons();
  }, []);

  const propertyMarkers = useMemo(() => {
    return properties.map((property, index) => ({
      property,
      coordinates: getPropertyCoordinates(property, index),
    }));
  }, [properties]);

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    if (onPropertySelect) {
      onPropertySelect(property);
    }
  };

  if (!isMounted) {
    return (
      <div className={cn('relative bg-gray-100 rounded-xl overflow-hidden', className)}>
        <div className="flex items-center justify-center h-[600px]">
          <div className="text-gray-500 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-gray-300 border-t-ocean-600 rounded-full animate-spin" />
            <span>Loading map...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative rounded-xl overflow-hidden shadow-lg', className)}>
      <MapContainer
        center={HATTERAS_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-[600px] z-10"
        zoomControl={true}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri"
        />

        {propertyMarkers.map(({ property, coordinates }) => (
          <Marker
            key={property.id}
            position={coordinates}
            eventHandlers={{
              click: () => handlePropertyClick(property),
              mouseover: () => setHoveredProperty(property.id),
              mouseout: () => setHoveredProperty(null),
            }}
          >
            <Popup>
              <PropertyPopupCard property={property} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Property count badge */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
          <p className="font-semibold text-gray-900">{properties.length} Properties</p>
          <p className="text-xs text-gray-500">Click markers to view details</p>
        </div>
      </div>

      {/* Selected property card */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto md:w-96 z-30"
          >
            <PropertyDetailCard
              property={selectedProperty}
              onClose={() => setSelectedProperty(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PropertyPopupCard({ property }: { property: Property }) {
  return (
    <div className="min-w-[200px]">
      <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{property.name}</h3>
      <p className="text-xs text-gray-500 mb-2">{property.village?.name || 'Hatteras Island'}</p>
      <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
        <span className="flex items-center gap-1">
          <Bed className="w-3 h-3" />
          {property.bedrooms}
        </span>
        <span className="flex items-center gap-1">
          <Bath className="w-3 h-3" />
          {property.bathrooms}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {property.sleeps}
        </span>
      </div>
      <div className="flex items-center justify-between pt-2 border-t">
        <span className="font-semibold text-ocean-600">
          ${property.pricePerNight || property.baseRate || 299}/night
        </span>
        <Link
          href={`/properties/${property.slug}`}
          className="text-xs text-ocean-600 font-medium hover:underline"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}

function PropertyDetailCard({ property, onClose }: { property: Property; onClose: () => void }) {
  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
      {/* Image */}
      <div className="relative h-48">
        {property.images?.[0]?.url ? (
          <Image
            src={property.images[0].url}
            alt={property.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center">
            <MapPin className="w-12 h-12 text-white/50" />
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
        {property.petFriendly && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            <Dog className="w-3 h-3" />
            Pet Friendly
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-1">{property.name}</h3>
        <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {property.village?.name || 'Hatteras Island'}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            {property.bedrooms} Beds
          </span>
          <span className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            {property.bathrooms} Baths
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {property.sleeps} Guests
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              ${property.pricePerNight || property.baseRate || 299}
            </span>
            <span className="text-gray-500">/night</span>
          </div>
          <Link
            href={`/properties/${property.slug}`}
            className="px-4 py-2 bg-ocean-600 text-white rounded-lg font-medium hover:bg-ocean-700 transition-colors"
          >
            View Property
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PropertyMap;
