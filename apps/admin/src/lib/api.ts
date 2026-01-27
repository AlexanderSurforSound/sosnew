const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class AdminApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('admin_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();

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

  // Dashboard
  async getDashboardStats() {
    return this.request<{
      totalRevenue: number;
      revenueChange: number;
      totalBookings: number;
      bookingsChange: number;
      activeProperties: number;
      occupiedTonight: number;
      totalGuests: number;
      guestsChange: number;
      revenueByMonth: { month: string; revenue: number }[];
      occupancyByMonth: { month: string; occupancy: number }[];
    }>('/api/admin/dashboard');
  }

  // Reservations
  async getRecentReservations(limit: number = 10) {
    return this.request<Array<{
      id: string;
      guestName: string;
      guestEmail: string;
      propertyName: string;
      checkIn: string;
      checkOut: string;
      nights: number;
      totalAmount: number;
      status: string;
    }>>(`/api/admin/reservations?limit=${limit}`);
  }

  async getReservations(params: {
    page?: number;
    pageSize?: number;
    status?: string;
    propertyId?: string;
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', String(params.page));
    if (params.pageSize) searchParams.append('pageSize', String(params.pageSize));
    if (params.status) searchParams.append('status', params.status);
    if (params.propertyId) searchParams.append('propertyId', params.propertyId);
    if (params.search) searchParams.append('search', params.search);

    return this.request<{
      items: any[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>(`/api/admin/reservations?${searchParams}`);
  }

  async getReservation(id: string) {
    return this.request<any>(`/api/admin/reservations/${id}`);
  }

  async updateReservationStatus(id: string, status: string) {
    return this.request<any>(`/api/admin/reservations/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Properties
  async getProperties(params: {
    page?: number;
    pageSize?: number;
    village?: string;
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', String(params.page));
    if (params.pageSize) searchParams.append('pageSize', String(params.pageSize));
    if (params.village) searchParams.append('village', params.village);
    if (params.search) searchParams.append('search', params.search);

    return this.request<{
      items: any[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>(`/api/admin/properties?${searchParams}`);
  }

  async getProperty(id: string) {
    return this.request<any>(`/api/admin/properties/${id}`);
  }

  async updateProperty(id: string, data: any) {
    return this.request<any>(`/api/admin/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async syncProperty(id: string) {
    return this.request<any>(`/api/admin/properties/${id}/sync`, {
      method: 'POST',
    });
  }

  // Guests
  async getGuests(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    loyaltyTier?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', String(params.page));
    if (params.pageSize) searchParams.append('pageSize', String(params.pageSize));
    if (params.search) searchParams.append('search', params.search);
    if (params.loyaltyTier) searchParams.append('loyaltyTier', params.loyaltyTier);

    return this.request<{
      items: any[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>(`/api/admin/guests?${searchParams}`);
  }

  async getGuest(id: string) {
    return this.request<any>(`/api/admin/guests/${id}`);
  }

  async updateGuestLoyalty(id: string, points: number, reason: string) {
    return this.request<any>(`/api/admin/guests/${id}/loyalty`, {
      method: 'POST',
      body: JSON.stringify({ points, reason }),
    });
  }

  // Payments
  async getPayments(params: {
    page?: number;
    pageSize?: number;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', String(params.page));
    if (params.pageSize) searchParams.append('pageSize', String(params.pageSize));
    if (params.status) searchParams.append('status', params.status);

    return this.request<{
      items: any[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>(`/api/admin/payments?${searchParams}`);
  }

  async processRefund(paymentId: string, amount: number, reason: string) {
    return this.request<any>(`/api/admin/payments/${paymentId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
  }

  // Analytics
  async getAnalytics(params: { startDate: string; endDate: string; propertyId?: string }) {
    const searchParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    });
    if (params.propertyId) searchParams.append('propertyId', params.propertyId);

    return this.request<any>(`/api/admin/analytics?${searchParams}`);
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: any }>('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async logout() {
    this.clearToken();
  }
}

export const api = new AdminApiClient();
