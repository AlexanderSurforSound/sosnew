// Property Types
export interface Property {
  id: string;
  trackId: string;
  houseNumber?: string;
  name: string;
  slug: string;
  headline?: string;
  description?: string;
  village?: Village;
  bedrooms: number;
  bathrooms: number;
  sleeps: number;
  propertyType?: string;
  images: PropertyImage[];
  amenities?: Amenity[];
  petFriendly: boolean;
  featured: boolean;
  isNew?: boolean;
  baseRate?: number;
  isFavorite?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  streetAddress?: string;
  locality?: string;
  region?: string;
  postal?: string;
  // Flex stay / partial week booking
  isFlexStay?: boolean; // Properties with "Partial Weeks - Yes" amenity
  minNights?: number; // Minimum nights (3 for flex, 7 for weekly)
  // Computed/convenience fields
  primaryImage?: string;
  pricePerNight?: number;
  // Review data (populated from reviews API)
  rating?: number;
  reviewCount?: number;
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
  seo?: {
    title?: string;
    description?: string;
  };
}

export interface PropertyImage {
  url: string;
  alt?: string;
  caption?: string;
  isPrimary?: boolean;
}

export interface Village {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  heroImage?: string;
  highlights?: string[];
  location?: {
    lat: number;
    lng: number;
  };
}

export interface Amenity {
  id: string;
  name: string;
  slug?: string;
  category?: string;
  icon?: string;
  description?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  lat?: number;
  lng?: number;
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
  weeks: number;
  baseRate: number;
  accommodationTotal: number;
  // Fees from Track PMS (in display order)
  petFee?: number; // Dog Fee - per week if pets
  poolHeat?: number; // Pool Heat - per week if selected
  earlyCheckin?: number; // Early Check-in by 1:00pm
  protectionPlan?: number; // Protection Plan (VRPPP)
  homeServiceFee: number; // Home Service Fee (cleaning)
  securityDeposit?: number; // Security Deposit
  advanceDeposit?: number; // Advance Reservation Deposit
  travelInsurance?: number; // Travel Insurance (optional)
  convenienceFee?: number; // Convenience Fee (CC/DC) or Check Processing Fee
  taxes: number;
  subtotal: number;
  total: number;
  // Legacy fields for compatibility
  cleaningFee: number;
  serviceFee: number;
  damageWaiver?: number; // Alias for securityDeposit
}

// Reservation Types
export interface Reservation {
  id: string;
  propertyId: string;
  property: Property;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  pets: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'deposit_paid' | 'paid' | 'refunded';
  createdAt: string;
}

export interface ReservationDetail extends Reservation {
  guest: GuestInfo;
  payment: PaymentInfo;
}

export interface CreateReservationRequest {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  pets: number;
  guest: GuestInfo;
  addons?: { id: string; quantity: number }[];
  insurance?: {
    planId: string;
    amount: number;
  };
  agreement?: {
    signature: string;
    sectionInitials?: Record<string, string>;
    agreedAddendums: string[];
    signedAt: string;
  };
  payment: {
    token: string;
    amount: number;
    type: 'full' | 'deposit';
    method?: 'credit' | 'debit' | 'mail';
    plan?: 'one' | 'two' | 'three' | 'four';
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  loyaltyTier: 'Explorer' | 'Adventurer' | 'Islander' | 'Legend';
  loyaltyPoints: number;
  totalStays: number;
}

export interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: Address;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// Payment Types
export interface PaymentInfo {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  method: 'card' | 'ach';
  last4?: string;
  transactionId?: string;
}

// Device Types
export interface Device {
  id: string;
  propertyTrackId: string;
  externalDeviceId: string;
  deviceType: 'lock' | 'thermostat' | 'sensor';
  name: string;
  location?: string;
  status: 'online' | 'offline' | 'low_battery' | 'unknown';
  currentTemp?: number;
  targetTemp?: number;
}

// API Response Types
export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PropertyQueryParams {
  q?: string; // Search by property name or number (fuzzy)
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
  sortBy?: 'price_asc' | 'price_desc' | 'bedrooms_asc' | 'bedrooms_desc' | 'name';
}

// Analytics Types
export interface AnalyticsEvent {
  eventType: string;
  eventData?: Record<string, unknown>;
  pageUrl?: string;
}
