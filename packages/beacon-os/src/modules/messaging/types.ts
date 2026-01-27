/**
 * Messaging Types for BeaconOS
 */

export interface Message {
  id: string;
  conversationId: string;
  sender: 'guest' | 'host' | 'ai' | 'system';
  content: string;
  channel: MessageChannel;
  timestamp: Date;
  read: boolean;
  metadata?: Record<string, unknown>;
}

export type MessageChannel = 'email' | 'sms' | 'web' | 'app' | 'airbnb' | 'vrbo';

export interface Conversation {
  id: string;
  guestId: string;
  propertyId?: string;
  reservationId?: string;
  channel: MessageChannel;
  status: 'active' | 'resolved' | 'escalated';
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  type: MessageTemplateType;
  subject?: string;
  content: string;
  variables: string[];
  channel: MessageChannel[];
}

export type MessageTemplateType =
  | 'booking_confirmation'
  | 'check_in_instructions'
  | 'welcome'
  | 'checkout_reminder'
  | 'review_request'
  | 'property_ready'
  | 'maintenance_notification'
  | 'payment_reminder'
  | 'custom';

export interface ConciergeRequest {
  message: string;
  guestId?: string;
  propertyId?: string;
  reservationId?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface ConciergeResponse {
  response: string;
  confidence: number;
  suggestedActions?: string[];
  escalate: boolean;
  escalateReason?: string;
}

export interface LocalRecommendation {
  name: string;
  type: 'restaurant' | 'activity' | 'attraction' | 'shopping' | 'service';
  description: string;
  distance?: string;
  rating?: number;
  priceLevel?: number;
  website?: string;
  phone?: string;
}
