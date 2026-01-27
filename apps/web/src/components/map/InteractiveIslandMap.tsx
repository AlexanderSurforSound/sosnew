'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Home,
  Fish,
  Ship,
  Landmark,
  Trees,
  X,
  ChevronRight,
  Waves,
  Building2,
  Maximize2,
  Layers
} from 'lucide-react';
import { villages, pointsOfInterest, Village, PointOfInterest } from '@/lib/island-data';
import { cn } from '@/lib/utils';

// Dynamically import the map to avoid SSR issues
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

interface InteractiveIslandMapProps {
  onVillageSelect?: (village: Village) => void;
  selectedVillage?: string;
  showPOIs?: boolean;
  className?: string;
}

// Hatteras Island coordinates (center roughly around Buxton)
const HATTERAS_CENTER: [number, number] = [35.2668, -75.5272];
const DEFAULT_ZOOM = 11;

// Village coordinates on Hatteras Island (accurate lat/lng)
const villageCoordinates: Record<string, [number, number]> = {
  'rodanthe': [35.5936, -75.4636],
  'waves': [35.5672, -75.4697],
  'salvo': [35.5386, -75.4758],
  'avon': [35.3519, -75.5050],
  'buxton': [35.2668, -75.5272],
  'frisco': [35.2375, -75.6192],
  'hatteras-village': [35.2086, -75.6900],
};

// POI coordinates
const poiCoordinates: Record<string, [number, number]> = {
  'pea-island': [35.6969, -75.4883],
  'chicamacomico': [35.5900, -75.4650],
  'cape-hatteras-lighthouse': [35.2508, -75.5286],
  'buxton-woods': [35.2700, -75.5400],
  'hatteras-ferry': [35.1969, -75.6958],
  'avon-pier': [35.3500, -75.5000],
  'frisco-museum': [35.2400, -75.6100],
};

type MapStyle = 'satellite' | 'terrain' | 'streets';

export function InteractiveIslandMap({
  onVillageSelect,
  selectedVillage,
  showPOIs = true,
  className
}: InteractiveIslandMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [showVillageCard, setShowVillageCard] = useState<Village | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<PointOfInterest | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyle>('satellite');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Import Leaflet CSS
    // @ts-ignore - CSS import works at runtime
    import('leaflet/dist/leaflet.css');
  }, []);

  const handleVillageClick = (village: Village) => {
    if (onVillageSelect) {
      onVillageSelect(village);
    } else {
      setShowVillageCard(village);
    }
  };

  const getPoiIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      lighthouse: <Landmark className="w-4 h-4" />,
      ferry: <Ship className="w-4 h-4" />,
      pier: <Fish className="w-4 h-4" />,
      beach: <Waves className="w-4 h-4" />,
      nature: <Trees className="w-4 h-4" />,
      museum: <Building2 className="w-4 h-4" />,
      landmark: <Home className="w-4 h-4" />
    };
    return iconMap[type] || <MapPin className="w-4 h-4" />;
  };

  // Tile layer URLs for different styles
  const tileLayers: Record<MapStyle, { url: string; attribution: string }> = {
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    },
    terrain: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap'
    },
    streets: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors'
    }
  };

  if (!isMounted) {
    return (
      <div className={cn('relative bg-slate-900 rounded-2xl overflow-hidden', className)}>
        <div className="flex items-center justify-center h-[600px]">
          <div className="text-white/60 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
            <span>Loading map...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'relative rounded-2xl overflow-hidden shadow-2xl',
      isFullscreen ? 'fixed inset-4 z-50' : '',
      className
    )}>
      {/* Fullscreen backdrop */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/80 -z-10"
          onClick={() => setIsFullscreen(false)}
        />
      )}

      {/* Map Container */}
      <MapContainer
        center={HATTERAS_CENTER}
        zoom={DEFAULT_ZOOM}
        className={cn(
          'w-full z-10',
          isFullscreen ? 'h-full' : 'h-[600px]'
        )}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url={tileLayers[mapStyle].url}
          attribution={tileLayers[mapStyle].attribution}
        />

        {/* Village Markers */}
        {villages.map((village) => {
          const coords = villageCoordinates[village.id];
          if (!coords) return null;

          return (
            <Marker
              key={village.id}
              position={coords}
              eventHandlers={{
                click: () => handleVillageClick(village),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-gray-900">{village.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{village.shortDescription}</p>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t">
                    <span className="text-xs text-gray-500">{village.propertyCount} rentals</span>
                    <Link
                      href={`/properties?village=${village.slug}`}
                      className="text-xs text-cyan-600 font-medium hover:underline"
                    >
                      View Properties →
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* POI Markers */}
        {showPOIs && pointsOfInterest.map((poi) => {
          const coords = poiCoordinates[poi.id];
          if (!coords) return null;

          return (
            <Marker
              key={poi.id}
              position={coords}
              eventHandlers={{
                click: () => setSelectedPOI(poi),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    {getPoiIcon(poi.type)}
                    <span className="text-xs text-gray-500 capitalize">{poi.type}</span>
                  </div>
                  <h3 className="font-bold text-gray-900">{poi.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{poi.description}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-3 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? (
            <X className="w-5 h-5 text-gray-700" />
          ) : (
            <Maximize2 className="w-5 h-5 text-gray-700" />
          )}
        </button>

        {/* Map Style Selector */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <button
            onClick={() => setMapStyle('satellite')}
            className={cn(
              'p-3 w-full flex items-center gap-2 text-sm transition-colors',
              mapStyle === 'satellite' ? 'bg-cyan-50 text-cyan-700' : 'hover:bg-gray-50 text-gray-700'
            )}
            title="Satellite view"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Style Floating Selector */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-1 flex gap-1">
          {(['satellite', 'terrain', 'streets'] as MapStyle[]).map((style) => (
            <button
              key={style}
              onClick={() => setMapStyle(style)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                mapStyle === style
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Title Badge */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl px-5 py-3 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900">Hatteras Island</h3>
          <p className="text-xs text-gray-500">Outer Banks, North Carolina</p>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-20">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Explore</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-4 h-4 rounded-full bg-cyan-500 border-2 border-white shadow" />
              <span>Villages ({villages.length})</span>
            </div>
            {showPOIs && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow" />
                <span>Points of Interest</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Village Detail Card */}
      <AnimatePresence>
        {showVillageCard && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 left-4 right-4 md:left-4 md:right-auto md:w-96 bg-white rounded-xl shadow-2xl overflow-hidden z-30 border border-gray-100"
          >
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-xl">{showVillageCard.name}</h3>
                  <p className="text-cyan-100 text-sm mt-1">{showVillageCard.shortDescription}</p>
                </div>
                <button
                  onClick={() => setShowVillageCard(null)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-5">
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">{showVillageCard.description}</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {showVillageCard.highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="bg-cyan-50 text-cyan-700 text-xs px-3 py-1 rounded-full font-medium"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-sm">
                  <span className="text-gray-500">Available: </span>
                  <span className="font-semibold text-gray-800">{showVillageCard.propertyCount} vacation rentals</span>
                </div>
                <Link
                  href={`/properties?village=${showVillageCard.slug}`}
                  className="flex items-center gap-1 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors font-medium text-sm"
                >
                  View Properties
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POI Detail Card */}
      <AnimatePresence>
        {selectedPOI && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-20 right-4 w-80 bg-white rounded-xl shadow-2xl overflow-hidden z-30 border border-gray-100"
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    selectedPOI.type === 'lighthouse' ? 'bg-amber-100 text-amber-600' :
                    selectedPOI.type === 'ferry' ? 'bg-blue-100 text-blue-600' :
                    selectedPOI.type === 'nature' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  )}>
                    {getPoiIcon(selectedPOI.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedPOI.name}</h3>
                    <p className="text-xs text-gray-500 capitalize">{selectedPOI.type}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPOI(null)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">{selectedPOI.description}</p>
              <p className="text-xs text-gray-500 mb-4">
                <MapPin className="w-3 h-3 inline mr-1" />
                {villages.find((v) => v.id === selectedPOI.village)?.name}
              </p>
              {selectedPOI.website && (
                <a
                  href={selectedPOI.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center bg-gray-900 text-white text-sm py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Visit Official Website →
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
