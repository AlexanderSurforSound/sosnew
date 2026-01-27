import type {
  Property,
  PropertyDetail,
  Availability,
  Reservation,
  ReservationDetail,
  CreateReservationRequest,
  User,
  AuthResponse,
  RegisterRequest,
  Device,
  PagedResult,
  PropertyQueryParams,
  AnalyticsEvent,
} from '@/types';
import { REAL_PROPERTIES, REAL_FEATURED_PROPERTIES, getRealProperty, searchRealProperties } from './realProperties';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(response.status, error.message || 'Request failed');
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Properties
  async getProperties(params: PropertyQueryParams = {}): Promise<PagedResult<Property>> {
    if (USE_MOCK_DATA) {
      return this.getMockProperties(params);
    }
    try {
      const query = new URLSearchParams();
      if (params.village) query.set('village', params.village);
      if (params.minBedrooms) query.set('minBedrooms', params.minBedrooms.toString());
      if (params.maxBedrooms) query.set('maxBedrooms', params.maxBedrooms.toString());
      if (params.checkIn) query.set('checkIn', params.checkIn);
      if (params.checkOut) query.set('checkOut', params.checkOut);
      if (params.guests) query.set('guests', params.guests.toString());
      if (params.amenities?.length) query.set('amenities', params.amenities.join(','));
      if (params.petFriendly) query.set('petFriendly', 'true');
      if (params.page) query.set('page', params.page.toString());
      if (params.pageSize) query.set('pageSize', params.pageSize.toString());
      if (params.sortBy) query.set('sortBy', params.sortBy);

      const queryString = query.toString();
      return this.fetch(`/properties${queryString ? `?${queryString}` : ''}`);
    } catch {
      // Fallback to mock data if API fails
      return this.getMockProperties(params);
    }
  }

  private getMockProperties(params: PropertyQueryParams = {}): PagedResult<Property> {
    let items = searchRealProperties({
      village: params.village,
      bedrooms: params.minBedrooms,
      petFriendly: params.petFriendly,
    });

    // Sort
    if (params.sortBy === 'price_asc') items.sort((a, b) => (a.baseRate || 0) - (b.baseRate || 0));
    if (params.sortBy === 'price_desc') items.sort((a, b) => (b.baseRate || 0) - (a.baseRate || 0));
    if (params.sortBy === 'bedrooms_asc') items.sort((a, b) => a.bedrooms - b.bedrooms);
    if (params.sortBy === 'bedrooms_desc') items.sort((a, b) => b.bedrooms - a.bedrooms);

    const page = params.page || 1;
    const pageSize = params.pageSize || 24;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);

    return {
      items: paged,
      total: items.length,
      page,
      pageSize,
      totalPages: Math.ceil(items.length / pageSize),
    };
  }

  async getProperty(slug: string): Promise<PropertyDetail> {
    if (USE_MOCK_DATA) {
      const prop = getRealProperty(slug);
      if (prop) return prop as PropertyDetail;
      throw new ApiError(404, 'Property not found');
    }
    try {
      return this.fetch(`/properties/${slug}`);
    } catch {
      const prop = getRealProperty(slug);
      if (prop) return prop as PropertyDetail;
      throw new ApiError(404, 'Property not found');
    }
  }

  async getPropertyAvailability(
    slug: string,
    start: string,
    end: string
  ): Promise<Availability> {
    if (USE_MOCK_DATA) {
      // Return mock availability - all dates available
      const startDate = new Date(start);
      const endDate = new Date(end);
      const dates = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dates.push({
          date: d.toISOString().split('T')[0],
          isAvailable: true,
          rate: 250,
          minimumStay: 3,
        });
      }
      return { propertyId: slug, dates };
    }
    return this.fetch(`/properties/${slug}/availability?start=${start}&end=${end}`);
  }

  async getFeaturedProperties(): Promise<Property[]> {
    if (USE_MOCK_DATA) {
      return REAL_FEATURED_PROPERTIES;
    }
    try {
      return this.fetch('/properties/featured');
    } catch {
      return REAL_FEATURED_PROPERTIES;
    }
  }

  async searchProperties(query: string, limit = 20): Promise<Property[]> {
    if (USE_MOCK_DATA) {
      const lower = query.toLowerCase();
      return REAL_PROPERTIES.filter(p =>
        p.name.toLowerCase().includes(lower) ||
        p.village?.name.toLowerCase().includes(lower)
      ).slice(0, limit);
    }
    try {
      return this.fetch(`/properties/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    } catch {
      const lower = query.toLowerCase();
      return REAL_PROPERTIES.filter(p =>
        p.name.toLowerCase().includes(lower) ||
        p.village?.name.toLowerCase().includes(lower)
      ).slice(0, limit);
    }
  }

  // Reservations
  async createReservation(data: CreateReservationRequest): Promise<Reservation> {
    return this.fetch('/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyReservations(): Promise<Reservation[]> {
    return this.fetch('/reservations/mine');
  }

  async getReservation(id: string): Promise<ReservationDetail> {
    return this.fetch(`/reservations/${id}`);
  }

  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.fetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.fetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.token);
    return response;
  }

  async logout() {
    this.setToken(null);
  }

  async getMe(): Promise<User> {
    return this.fetch('/me');
  }

  async updateMe(data: Partial<User>): Promise<User> {
    return this.fetch('/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Favorites
  async getFavorites(): Promise<Property[]> {
    return this.fetch('/me/favorites');
  }

  async addFavorite(propertyId: string): Promise<void> {
    return this.fetch(`/me/favorites/${propertyId}`, { method: 'POST' });
  }

  async removeFavorite(propertyId: string): Promise<void> {
    return this.fetch(`/me/favorites/${propertyId}`, { method: 'DELETE' });
  }

  // Smart Home Devices
  async getReservationDevices(reservationId: string): Promise<Device[]> {
    return this.fetch(`/reservations/${reservationId}/devices`);
  }

  async unlockDevice(deviceId: string): Promise<void> {
    return this.fetch(`/devices/${deviceId}/unlock`, { method: 'POST' });
  }

  async lockDevice(deviceId: string): Promise<void> {
    return this.fetch(`/devices/${deviceId}/lock`, { method: 'POST' });
  }

  async setThermostat(deviceId: string, temperature: number): Promise<void> {
    return this.fetch(`/devices/${deviceId}/thermostat`, {
      method: 'PUT',
      body: JSON.stringify({ temperature }),
    });
  }

  // Analytics
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    return this.fetch('/analytics/events', {
      method: 'POST',
      body: JSON.stringify({
        ...event,
        pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      }),
    });
  }

  // Chat / AI Concierge
  async sendChatMessage(request: ChatMessageRequest): Promise<ChatResponse> {
    return this.fetch('/chat/message', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getChatConversations(sessionId?: string): Promise<ConversationSummary[]> {
    const query = sessionId ? `?sessionId=${sessionId}` : '';
    return this.fetch(`/chat/conversations${query}`);
  }

  async getChatConversation(conversationId: string): Promise<ConversationDetail> {
    return this.fetch(`/chat/conversations/${conversationId}`);
  }

  async deleteChatConversation(conversationId: string): Promise<void> {
    return this.fetch(`/chat/conversations/${conversationId}`, { method: 'DELETE' });
  }

  // Dream Matcher
  async dreamMatch(request: DreamMatcherRequest): Promise<DreamMatcherResponse> {
    return this.fetch('/properties/dream-match', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Trip Dashboard
  async getUpcomingTrips(): Promise<TripSummary[]> {
    return this.fetch('/trips');
  }

  async getTripDashboard(reservationId: string): Promise<TripDashboard> {
    return this.fetch(`/trips/${reservationId}`);
  }

  // Reviews
  async getPropertyReviews(propertyId: string, page = 1, pageSize = 10): Promise<ReviewList> {
    return this.fetch(`/reviews/property/${propertyId}?page=${page}&pageSize=${pageSize}`);
  }

  async getPropertyReviewStats(propertyId: string): Promise<ReviewStats> {
    return this.fetch(`/reviews/property/${propertyId}/stats`);
  }

  async createReview(review: CreateReviewRequest): Promise<Review> {
    return this.fetch('/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }

  async markReviewHelpful(reviewId: string, sessionId?: string): Promise<void> {
    const query = sessionId ? `?sessionId=${sessionId}` : '';
    return this.fetch(`/reviews/${reviewId}/helpful${query}`, { method: 'POST' });
  }
}

// Chat types
export interface ChatMessageRequest {
  conversationId?: string;
  sessionId?: string;
  message: string;
  context?: {
    propertyId?: string;
    reservationId?: string;
    page?: string;
  };
}

export interface ChatResponse {
  conversationId: string;
  message: string;
  suggestedActions?: string[];
}

export interface ConversationSummary {
  id: string;
  title: string;
  status: string;
  lastMessageAt: string;
  messageCount: number;
}

export interface ConversationDetail {
  id: string;
  title: string;
  status: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

// Dream Matcher types
export interface DreamMatcherRequest {
  query: string;
  checkIn?: string;
  checkOut?: string;
  maxResults?: number;
}

export interface DreamMatcherResponse {
  matches: DreamMatchResult[];
  searchCriteria: ExtractedSearchCriteria;
  totalPropertiesAnalyzed: number;
  summary: string;
}

export interface DreamMatchResult {
  property: Property;
  matchScore: number;
  matchExplanation: string;
  highlightedFeatures: string[];
}

export interface ExtractedSearchCriteria {
  minBedrooms?: number;
  maxBedrooms?: number;
  guests?: number;
  petFriendly?: boolean;
  preferredVillage?: string;
  requiredAmenities: string[];
  preferredAmenities: string[];
  locationPreference?: string;
  budgetLevel?: string;
  vibe?: string;
  keywords: string[];
}

// Trip Dashboard types
export interface TripSummary {
  reservationId: string;
  propertyName: string;
  propertySlug: string;
  propertyImage?: string;
  village?: string;
  checkIn: string;
  checkOut: string;
  daysUntil: number;
  status: string;
  isCurrentTrip: boolean;
}

export interface TripDashboard {
  reservationId: string;
  property: PropertySummary;
  countdown: Countdown;
  milestones: Milestone[];
  weather: WeatherDay[];
  activities: ActivitySuggestion[];
  packingList: PackingCategory[];
  checkInInfo: CheckInInfo;
  guests: GuestCount;
  payment: PaymentSummary;
}

export interface PropertySummary {
  id: string;
  name: string;
  slug: string;
  village?: string;
  bedrooms: number;
  bathrooms: number;
  sleeps: number;
  primaryImage?: string;
  address?: string;
}

export interface Countdown {
  daysUntilTrip: number;
  tripDuration: number;
  checkInDate: string;
  checkOutDate: string;
  phase: string;
  phaseMessage: string;
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  daysFromNow: number;
  icon: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface WeatherDay {
  date: string;
  dayOfWeek: string;
  condition: string;
  icon: string;
  highTemp: number;
  lowTemp: number;
  precipChance: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
}

export interface ActivitySuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  duration: string;
  distance: string;
}

export interface PackingCategory {
  category: string;
  icon: string;
  items: PackingItem[];
}

export interface PackingItem {
  name: string;
  isEssential: boolean;
  isPacked: boolean;
}

export interface CheckInInfo {
  date: string;
  time: string;
  address: string;
  instructions?: string;
  wifiName?: string;
  wifiPassword?: string;
  parkingInstructions?: string;
  doorCode?: string;
}

export interface GuestCount {
  adults: number;
  children: number;
  pets: number;
  total: number;
}

export interface PaymentSummary {
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: string;
  dueDate: string;
}

// Review types
export interface ReviewList {
  reviews: Review[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Review {
  id: string;
  overallRating: number;
  cleanlinessRating?: number;
  accuracyRating?: number;
  communicationRating?: number;
  locationRating?: number;
  valueRating?: number;
  title?: string;
  content: string;
  ownerResponse?: string;
  ownerResponseDate?: string;
  stayDate: string;
  tripType?: string;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  guest?: ReviewGuest;
}

export interface ReviewGuest {
  firstName: string;
  lastInitial?: string;
  location?: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  averageCleanliness?: number;
  averageAccuracy?: number;
  averageCommunication?: number;
  averageLocation?: number;
  averageValue?: number;
  ratingDistribution: Record<number, number>;
}

export interface CreateReviewRequest {
  propertyId: string;
  reservationId?: string;
  overallRating: number;
  cleanlinessRating?: number;
  accuracyRating?: number;
  communicationRating?: number;
  locationRating?: number;
  valueRating?: number;
  title?: string;
  content: string;
  stayDate: string;
  tripType?: string;
}

export const api = new ApiClient();
export { ApiError };

// Re-export types for convenience
export type {
  Property,
  PropertyDetail,
  Availability,
  Reservation,
  ReservationDetail,
  CreateReservationRequest,
  User,
  AuthResponse,
  RegisterRequest,
  Device,
  PagedResult,
  PropertyQueryParams,
  AnalyticsEvent,
} from '@/types';
