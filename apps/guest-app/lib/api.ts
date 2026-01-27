import * as SecureStore from 'expo-secure-store';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

class ApiClient {
  private token: string | null = null;

  async getToken(): Promise<string | null> {
    if (this.token) return this.token;
    try {
      this.token = await SecureStore.getItemAsync('auth_token');
      return this.token;
    } catch {
      return null;
    }
  }

  async setToken(token: string | null) {
    this.token = token;
    if (token) {
      await SecureStore.setItemAsync('auth_token', token);
    } else {
      await SecureStore.deleteItemAsync('auth_token');
    }
  }

  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = await this.getToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Request failed');
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const response = await this.fetch<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await this.setToken(response.token);
    return response;
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    const response = await this.fetch<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await this.setToken(response.token);
    return response;
  }

  async logout() {
    await this.setToken(null);
  }

  async getMe() {
    return this.fetch<any>('/me');
  }

  // Properties
  async getProperties(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.fetch<{ items: any[]; total: number }>(`/properties${query ? `?${query}` : ''}`);
  }

  async getProperty(slug: string) {
    return this.fetch<any>(`/properties/${slug}`);
  }

  async getFeaturedProperties() {
    return this.fetch<any[]>('/properties/featured');
  }

  // Reservations
  async getMyReservations() {
    return this.fetch<any[]>('/reservations/mine');
  }

  async getReservation(id: string) {
    return this.fetch<any>(`/reservations/${id}`);
  }

  async createReservation(data: any) {
    return this.fetch<any>('/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Devices
  async getReservationDevices(reservationId: string) {
    return this.fetch<any[]>(`/reservations/${reservationId}/devices`);
  }

  async unlockDevice(deviceId: string) {
    return this.fetch<void>(`/devices/${deviceId}/unlock`, { method: 'POST' });
  }

  async lockDevice(deviceId: string) {
    return this.fetch<void>(`/devices/${deviceId}/lock`, { method: 'POST' });
  }

  async setThermostat(deviceId: string, temperature: number) {
    return this.fetch<void>(`/devices/${deviceId}/thermostat`, {
      method: 'PUT',
      body: JSON.stringify({ temperature }),
    });
  }

  // Favorites
  async getFavorites() {
    return this.fetch<any[]>('/me/favorites');
  }

  async addFavorite(propertyId: string) {
    return this.fetch<void>(`/me/favorites/${propertyId}`, { method: 'POST' });
  }

  async removeFavorite(propertyId: string) {
    return this.fetch<void>(`/me/favorites/${propertyId}`, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
