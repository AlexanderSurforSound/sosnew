/**
 * Track PMS API Service
 *
 * Wraps Track's REST API for use in GraphQL resolvers
 */

// Track API Configuration
const TRACK_CONFIG = {
  baseUrl: process.env.TRACK_API_URL || 'https://surforsound.tracksandbox.io/api',
  key: process.env.TRACK_API_KEY || '',
  secret: process.env.TRACK_API_SECRET || '',
};

// Create Basic Auth header
function getAuthHeader(): string {
  return 'Basic ' + Buffer.from(`${TRACK_CONFIG.key}:${TRACK_CONFIG.secret}`).toString('base64');
}

// Generic fetch function with error handling
async function fetchFromTrack<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
  const url = new URL(`${TRACK_CONFIG.baseUrl}${endpoint}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: getAuthHeader(),
      Accept: 'application/json',
    },
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Track API error ${response.status}: ${text}`);
  }

  return response.json();
}

// ==========================================
// UNITS (Properties)
// ==========================================

interface TrackUnit {
  id: number;
  name: string;
  unitCode: string;
  shortDescription?: string;
  description?: string;
  bedrooms: number;
  fullBathrooms: number;
  threeQuarterBathrooms: number;
  halfBathrooms: number;
  maxOccupancy: number;
  nodeId: number;
  petsFriendly: boolean;
  latitude?: string;
  longitude?: string;
  streetAddress?: string;
  locality?: string;
  region?: string;
  postal?: string;
  amenities?: Array<{ id: number; name: string }>;
}

interface TrackUnitsResponse {
  _embedded?: {
    units: TrackUnit[];
  };
  page?: {
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export async function getUnits(page = 1, size = 100): Promise<{ units: TrackUnit[]; total: number }> {
  const data = await fetchFromTrack<TrackUnitsResponse>('/pms/units', { page, size });
  return {
    units: data._embedded?.units || [],
    total: data.page?.totalElements || 0,
  };
}

export async function getUnit(unitId: string | number): Promise<TrackUnit | null> {
  try {
    return await fetchFromTrack<TrackUnit>(`/pms/units/${unitId}`);
  } catch (e) {
    return null;
  }
}

export async function searchUnits(params: {
  bedrooms?: number;
  maxOccupancy?: number;
  petsFriendly?: boolean;
  nodeId?: number;
  page?: number;
  size?: number;
}): Promise<{ units: TrackUnit[]; total: number }> {
  const data = await fetchFromTrack<TrackUnitsResponse>('/pms/units', params);
  return {
    units: data._embedded?.units || [],
    total: data.page?.totalElements || 0,
  };
}

// ==========================================
// NODES (Villages/Locations)
// ==========================================

interface TrackNode {
  id: number;
  name: string;
  description?: string;
}

interface TrackNodesResponse {
  _embedded?: {
    nodes: TrackNode[];
  };
}

export async function getNodes(): Promise<TrackNode[]> {
  const data = await fetchFromTrack<TrackNodesResponse>('/pms/nodes', { size: 100 });
  return data._embedded?.nodes || [];
}

export async function getNode(nodeId: string | number): Promise<TrackNode | null> {
  try {
    return await fetchFromTrack<TrackNode>(`/pms/nodes/${nodeId}`);
  } catch (e) {
    return null;
  }
}

// ==========================================
// IMAGES
// ==========================================

interface TrackImage {
  id: number;
  name?: string;
  original: string;
  large?: string;
  medium?: string;
  small?: string;
  thumbnail?: string;
}

interface TrackImagesResponse {
  _embedded?: {
    images: TrackImage[];
  };
}

export async function getUnitImages(unitId: string | number, limit = 10): Promise<TrackImage[]> {
  try {
    const data = await fetchFromTrack<TrackImagesResponse>(`/pms/units/${unitId}/images`, {
      size: limit,
    });
    return data._embedded?.images || [];
  } catch (e) {
    return [];
  }
}

// ==========================================
// AVAILABILITY
// ==========================================

interface TrackAvailability {
  date: string;
  available: boolean;
  rate?: number;
  minimumStay?: number;
  checkInAllowed?: boolean;
  checkOutAllowed?: boolean;
}

interface TrackAvailabilityResponse {
  _embedded?: {
    availability: TrackAvailability[];
  };
}

export async function getUnitAvailability(
  unitId: string | number,
  startDate: string,
  endDate: string
): Promise<TrackAvailability[]> {
  try {
    const data = await fetchFromTrack<TrackAvailabilityResponse>(
      `/pms/units/${unitId}/availability`,
      { startDate, endDate }
    );
    return data._embedded?.availability || [];
  } catch (e) {
    return [];
  }
}

// ==========================================
// RATES
// ==========================================

interface TrackRate {
  baseRate: number;
  totalRate: number;
  taxes: number;
  fees: Array<{
    name: string;
    amount: number;
    type: string;
  }>;
  minimumStay?: number;
}

export async function getUnitRates(
  unitId: string | number,
  checkIn: string,
  checkOut: string,
  guests?: number
): Promise<TrackRate | null> {
  try {
    return await fetchFromTrack<TrackRate>(`/pms/units/${unitId}/rates`, {
      checkIn,
      checkOut,
      guests,
    });
  } catch (e) {
    return null;
  }
}

// ==========================================
// RESERVATIONS
// ==========================================

interface TrackReservation {
  id: number;
  confirmationNumber: string;
  unitId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: string;
}

export async function createReservation(data: {
  unitId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}): Promise<TrackReservation> {
  const response = await fetch(`${TRACK_CONFIG.baseUrl}/pms/reservations`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create reservation: ${text}`);
  }

  return response.json();
}

export async function getReservation(reservationId: string | number): Promise<TrackReservation | null> {
  try {
    return await fetchFromTrack<TrackReservation>(`/pms/reservations/${reservationId}`);
  } catch (e) {
    return null;
  }
}

// ==========================================
// HELPERS
// ==========================================

export function mapTrackUnitToProperty(unit: TrackUnit, node?: TrackNode | null, images?: TrackImage[]) {
  const rawVillageName = node?.name || 'Hatteras Island';

  // Format display name: remove "Village" suffix except for "Hatteras Village"
  const villageName =
    rawVillageName.toLowerCase() === 'hatteras village'
      ? 'Hatteras Village'
      : rawVillageName.replace(/\s+village$/i, '').trim();

  // Generate slug: always remove "Village" suffix for consistent filtering
  // "Salvo Village" -> "salvo", "Hatteras Village" -> "hatteras-village"
  const villageSlug = rawVillageName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const fullBaths = unit.fullBathrooms || 0;
  const threeQuarterBaths = unit.threeQuarterBathrooms || 0;
  const halfBaths = unit.halfBathrooms || 0;
  const totalBaths = fullBaths + threeQuarterBaths + halfBaths * 0.5;

  const propertyImages =
    images && images.length > 0
      ? images.map((img) => ({
          url: img.original || img.large || img.medium || '',
          alt: img.name || unit.name,
        }))
      : [{ url: '/images/placeholder-property.svg', alt: unit.name }];

  return {
    id: `prop-${unit.id}`,
    trackId: String(unit.id),
    houseNumber: unit.unitCode || '',
    slug: createSlug(unit.name, unit.unitCode),
    name: unit.name,
    headline: unit.shortDescription || `Beautiful vacation rental on the Outer Banks`,
    description: unit.description,
    bedrooms: unit.bedrooms || 3,
    bathrooms: totalBaths || 2,
    sleeps: unit.maxOccupancy || 6,
    propertyType: 'House',
    village: { id: villageSlug, name: villageName, slug: villageSlug },
    petFriendly: unit.petsFriendly || false,
    featured: false,
    isNew: false,
    latitude: unit.latitude ? parseFloat(unit.latitude) : null,
    longitude: unit.longitude ? parseFloat(unit.longitude) : null,
    streetAddress: unit.streetAddress,
    baseRate: undefined,
    images: propertyImages,
    amenities: (unit.amenities || []).map((a) => ({
      id: String(a.id),
      name: a.name,
      slug: a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      icon: mapAmenityIcon(a.name),
    })),
  };
}

function createSlug(name: string, houseNumber?: string): string {
  const base = name
    .toLowerCase()
    .replace(/[#']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return houseNumber ? `${base}-${houseNumber}` : base;
}

function mapAmenityIcon(name: string): string {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('wifi') || nameLower.includes('internet')) return 'wifi';
  if (nameLower.includes('pool')) return 'waves';
  if (nameLower.includes('hot tub') || nameLower.includes('jacuzzi')) return 'hot-tub';
  if (nameLower.includes('air') || nameLower.includes('ac')) return 'snowflake';
  if (nameLower.includes('parking') || nameLower.includes('garage')) return 'car';
  if (nameLower.includes('grill') || nameLower.includes('bbq')) return 'flame';
  if (nameLower.includes('washer') || nameLower.includes('laundry')) return 'shirt';
  if (nameLower.includes('tv') || nameLower.includes('television')) return 'tv';
  if (nameLower.includes('pet') || nameLower.includes('dog')) return 'dog';
  if (nameLower.includes('beach')) return 'umbrella-beach';
  if (nameLower.includes('ocean') || nameLower.includes('view')) return 'eye';
  if (nameLower.includes('elevator')) return 'elevator';
  return 'check';
}
