// Property Types
export interface Property {
  id: string;
  trackId: string;
  name: string;
  slug: string;
  headline?: string;
  description?: string;
  village?: Village;
  bedrooms: number;
  bathrooms: number;
  sleeps: number;
  propertyType: string;
  images: PropertyImage[];
  amenities: Amenity[];
  petFriendly: boolean;
  featured: boolean;
  baseRate?: number;
  isFavorite?: boolean;
}

export interface PropertyDetail extends Property {
  highlights?: string[];
  virtualTourUrl?: string;
  videoUrl?: string;
  houseRules?: string;
  checkInInstructions?: string;
  parkingInstructions?: string;
  wifiName?: string;
  wifiPassword?: string;
  localTips?: string;
  address?: Address;
  seo?: SEO;
}

export interface PropertyImage {
  url: string;
  alt?: string;
  caption?: string;
  isPrimary?: boolean;
}

export interface Village {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  heroImage?: string;
  highlights?: string[];
  location?: GeoPoint;
}

export interface Amenity {
  id: string;
  name: string;
  slug: string;
  category?: string;
  icon?: string;
  description?: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  lat?: number;
  lng?: number;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface SEO {
  title?: string;
  description?: string;
}

// Availability Types
export interface Availability {
  propertyId: string;
  dates: AvailabilityDate[];
}

export interface AvailabilityDate {
  date: string;
  isAvailable: boolean;
  rate?: number;
  minimumStay: number;
}

export interface Pricing {
  nights: number;
  baseRate: number;
  accommodationTotal: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  total: number;
  deposit?: number;
}

// Reservation Types
export interface Reservation {
  id: string;
  propertyId: string;
  property?: Property;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  pets: number;
  totalAmount: number;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'deposit_paid' | 'paid' | 'refunded';

export interface ReservationDetail extends Reservation {
  guest?: GuestInfo;
  payment?: PaymentInfo;
}

// User Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  loyaltyTier: LoyaltyTier;
  loyaltyPoints: number;
  totalStays: number;
}

export type LoyaltyTier = 'Explorer' | 'Adventurer' | 'Islander' | 'Legend';

export interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: Address;
}

export interface PaymentInfo {
  transactionId?: string;
  amountPaid: number;
  amountDue: number;
  status: string;
}

// Device Types
export interface Device {
  id: string;
  propertyTrackId: string;
  externalDeviceId: string;
  deviceType: DeviceType;
  name: string;
  location?: string;
  status: DeviceStatus;
  currentTemp?: number;
  targetTemp?: number;
}

export type DeviceType = 'lock' | 'thermostat' | 'sensor';
export type DeviceStatus = 'online' | 'offline' | 'low_battery' | 'unknown';

// API Types
export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PropertyQueryParams {
  village?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  amenities?: string[];
  petFriendly?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  status: number;
}
