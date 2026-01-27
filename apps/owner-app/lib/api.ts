import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.surfsound.com';
const TOKEN_KEY = 'owner_auth_token';

class ApiClient {
  private token: string | null = null;

  async getToken(): Promise<string | null> {
    if (this.token) return this.token;
    this.token = await SecureStore.getItemAsync(TOKEN_KEY);
    return this.token;
  }

  async setToken(token: string): Promise<void> {
    this.token = token;
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }

  async clearToken(): Promise<void> {
    this.token = null;
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: any }>('/api/auth/owner/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await this.setToken(data.token);
    return data;
  }

  async logout() {
    await this.clearToken();
  }

  async getMe() {
    return this.request<any>('/api/owner/me');
  }

  // Dashboard & Stats
  async getOwnerStats() {
    return this.request<{
      monthlyRevenue: number;
      revenueChange: number;
      monthlyBookings: number;
      bookingsChange: number;
      occupancyRate: number;
      occupancyChange: number;
      averageRate: number;
      rateChange: number;
      alerts: string[];
    }>('/api/owner/stats');
  }

  // Properties
  async getOwnerProperties() {
    return this.request<Array<{
      id: string;
      name: string;
      images: { url: string }[];
      bedrooms: number;
      bathrooms: number;
      nextReservation?: string;
      monthlyRevenue?: number;
    }>>('/api/owner/properties');
  }

  async getOwnerProperty(id: string) {
    return this.request<any>(`/api/owner/properties/${id}`);
  }

  async updatePropertySettings(id: string, settings: any) {
    return this.request<any>(`/api/owner/properties/${id}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Reservations
  async getOwnerReservations(params: {
    status?: string;
    propertyId?: string;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append('status', params.status);
    if (params.propertyId) searchParams.append('propertyId', params.propertyId);
    if (params.limit) searchParams.append('limit', String(params.limit));

    return this.request<Array<{
      id: string;
      property?: { name: string };
      guestName: string;
      adults: number;
      children: number;
      checkIn: string;
      checkOut: string;
      totalAmount: number;
      status: string;
    }>>(`/api/owner/reservations?${searchParams}`);
  }

  async getOwnerReservation(id: string) {
    return this.request<any>(`/api/owner/reservations/${id}`);
  }

  // Calendar
  async getOwnerCalendar(params: {
    year: number;
    month: number;
    propertyId?: string;
  }) {
    const searchParams = new URLSearchParams({
      year: String(params.year),
      month: String(params.month),
    });
    if (params.propertyId) searchParams.append('propertyId', params.propertyId);

    return this.request<Array<{
      id: string;
      property?: { name: string };
      guestName: string;
      checkIn: string;
      checkOut: string;
      totalAmount: number;
      status: string;
    }>>(`/api/owner/calendar?${searchParams}`);
  }

  // Analytics
  async getOwnerAnalytics(params: {
    timeRange: string;
    propertyId?: string;
  }) {
    const searchParams = new URLSearchParams({ timeRange: params.timeRange });
    if (params.propertyId) searchParams.append('propertyId', params.propertyId);

    return this.request<{
      totalRevenue: number;
      revenueGrowth: number;
      totalBookings: number;
      avgNightsPerBooking: number;
      occupancyRate: number;
      bookedNights: number;
      availableNights: number;
      avgDailyRate: number;
      revPan: number;
      maxRevenue: number;
      revenueByPeriod: { label: string; amount: number }[];
      propertyPerformance: Array<{
        id: string;
        name: string;
        revenue: number;
        occupancy: number;
        bookings: number;
        avgRate: number;
      }>;
    }>(`/api/owner/analytics?${searchParams}`);
  }

  // Notifications
  async getOwnerNotifications(params: { filter: string }) {
    return this.request<Array<{
      id: string;
      type: string;
      title: string;
      message: string;
      createdAt: string;
      read: boolean;
      propertyId?: string;
      propertyName?: string;
    }>>(`/api/owner/notifications?filter=${params.filter}`);
  }

  async markNotificationRead(id: string) {
    return this.request<void>(`/api/owner/notifications/${id}/read`, {
      method: 'POST',
    });
  }

  async markAllNotificationsRead() {
    return this.request<void>('/api/owner/notifications/read-all', {
      method: 'POST',
    });
  }

  // Payouts
  async getPayoutHistory() {
    return this.request<Array<{
      id: string;
      amount: number;
      date: string;
      status: string;
    }>>('/api/owner/payouts');
  }

  async getPayoutSettings() {
    return this.request<{
      bankName: string;
      accountLast4: string;
      payoutSchedule: string;
    }>('/api/owner/payouts/settings');
  }
}

export const api = new ApiClient();
