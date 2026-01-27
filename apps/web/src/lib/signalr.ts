import * as signalR from '@microsoft/signalr';

const HUB_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') + '/hubs/notifications'
  || 'http://localhost:5000/hubs/notifications';

export type NotificationType =
  | 'reservation_confirmed'
  | 'reservation_reminder'
  | 'checkin_ready'
  | 'checkout_reminder'
  | 'payment_due'
  | 'payment_received'
  | 'device_unlocked'
  | 'device_status'
  | 'review_request'
  | 'promotion'
  | 'achievement_unlocked'
  | 'loyalty_points'
  | 'message'
  | 'system';

export interface SignalRNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
  actionText?: string;
  imageUrl?: string;
  createdAt: string;
  isRead: boolean;
}

export interface DeviceStatusUpdate {
  deviceId: string;
  deviceType: string;
  status: string;
  batteryLevel?: number;
  temperature?: number;
  isOnline: boolean;
  lastUpdated: string;
}

export interface ReservationUpdate {
  reservationId: string;
  status: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface AchievementUnlock {
  achievementId: string;
  code: string;
  name: string;
  description: string;
  iconUrl?: string;
  points: number;
  unlockedAt: string;
}

export interface LoyaltyUpdate {
  totalPoints: number;
  pointsEarned: number;
  reason: string;
  newTier?: string;
  tierProgress?: number;
}

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

type NotificationCallback = (notification: SignalRNotification) => void;
type DeviceStatusCallback = (update: DeviceStatusUpdate) => void;
type ReservationUpdateCallback = (update: ReservationUpdate) => void;
type AchievementCallback = (achievement: AchievementUnlock) => void;
type LoyaltyCallback = (update: LoyaltyUpdate) => void;
type ConnectionStateCallback = (state: ConnectionState) => void;

class SignalRClient {
  private connection: signalR.HubConnection | null = null;
  private connectionState: ConnectionState = 'disconnected';
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // Event callbacks
  private notificationCallbacks: Set<NotificationCallback> = new Set();
  private deviceStatusCallbacks: Set<DeviceStatusCallback> = new Set();
  private reservationUpdateCallbacks: Set<ReservationUpdateCallback> = new Set();
  private achievementCallbacks: Set<AchievementCallback> = new Set();
  private loyaltyCallbacks: Set<LoyaltyCallback> = new Set();
  private connectionStateCallbacks: Set<ConnectionStateCallback> = new Set();

  setToken(token: string | null) {
    this.token = token;
    if (this.connection && this.connectionState === 'connected') {
      // Reconnect with new token
      this.disconnect().then(() => this.connect());
    }
  }

  private updateConnectionState(state: ConnectionState) {
    this.connectionState = state;
    this.connectionStateCallbacks.forEach(cb => cb(state));
  }

  async connect(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.updateConnectionState('connecting');

    try {
      const builder = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, {
          accessTokenFactory: () => this.token || '',
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount >= this.maxReconnectAttempts) {
              return null; // Stop reconnecting
            }
            // Exponential backoff: 0, 1s, 2s, 4s, 8s, etc.
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
          },
        })
        .configureLogging(signalR.LogLevel.Warning);

      this.connection = builder.build();

      // Set up event handlers
      this.setupEventHandlers();

      // Set up connection state handlers
      this.connection.onreconnecting(() => {
        this.updateConnectionState('reconnecting');
        this.reconnectAttempts++;
      });

      this.connection.onreconnected(() => {
        this.updateConnectionState('connected');
        this.reconnectAttempts = 0;
      });

      this.connection.onclose(() => {
        this.updateConnectionState('disconnected');
      });

      await this.connection.start();
      this.updateConnectionState('connected');
      this.reconnectAttempts = 0;

      console.log('SignalR connected');
    } catch (error) {
      console.error('SignalR connection failed:', error);
      this.updateConnectionState('disconnected');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.updateConnectionState('disconnected');
    }
  }

  private setupEventHandlers() {
    if (!this.connection) return;

    // Notification events
    this.connection.on('ReceiveNotification', (notification: SignalRNotification) => {
      this.notificationCallbacks.forEach(cb => cb(notification));
    });

    // Device status events
    this.connection.on('DeviceStatusChanged', (update: DeviceStatusUpdate) => {
      this.deviceStatusCallbacks.forEach(cb => cb(update));
    });

    // Reservation events
    this.connection.on('ReservationUpdated', (update: ReservationUpdate) => {
      this.reservationUpdateCallbacks.forEach(cb => cb(update));
    });

    // Achievement events
    this.connection.on('AchievementUnlocked', (achievement: AchievementUnlock) => {
      this.achievementCallbacks.forEach(cb => cb(achievement));
    });

    // Loyalty events
    this.connection.on('LoyaltyPointsEarned', (update: LoyaltyUpdate) => {
      this.loyaltyCallbacks.forEach(cb => cb(update));
    });
  }

  // Subscribe to notifications
  onNotification(callback: NotificationCallback): () => void {
    this.notificationCallbacks.add(callback);
    return () => this.notificationCallbacks.delete(callback);
  }

  // Subscribe to device status updates
  onDeviceStatus(callback: DeviceStatusCallback): () => void {
    this.deviceStatusCallbacks.add(callback);
    return () => this.deviceStatusCallbacks.delete(callback);
  }

  // Subscribe to reservation updates
  onReservationUpdate(callback: ReservationUpdateCallback): () => void {
    this.reservationUpdateCallbacks.add(callback);
    return () => this.reservationUpdateCallbacks.delete(callback);
  }

  // Subscribe to achievement unlocks
  onAchievement(callback: AchievementCallback): () => void {
    this.achievementCallbacks.add(callback);
    return () => this.achievementCallbacks.delete(callback);
  }

  // Subscribe to loyalty updates
  onLoyaltyUpdate(callback: LoyaltyCallback): () => void {
    this.loyaltyCallbacks.add(callback);
    return () => this.loyaltyCallbacks.delete(callback);
  }

  // Subscribe to connection state changes
  onConnectionStateChange(callback: ConnectionStateCallback): () => void {
    this.connectionStateCallbacks.add(callback);
    // Immediately call with current state
    callback(this.connectionState);
    return () => this.connectionStateCallbacks.delete(callback);
  }

  // Join a specific group (e.g., for a reservation)
  async joinGroup(groupName: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('JoinGroup', groupName);
    }
  }

  // Leave a group
  async leaveGroup(groupName: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('LeaveGroup', groupName);
    }
  }

  // Get current connection state
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  // Check if connected
  isConnected(): boolean {
    return this.connectionState === 'connected';
  }
}

// Export singleton instance
export const signalRClient = new SignalRClient();

// Helper to get auth token from localStorage
export function getStoredToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}
