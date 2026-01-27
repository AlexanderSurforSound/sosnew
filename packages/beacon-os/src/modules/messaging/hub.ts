/**
 * Messaging Hub for BeaconOS
 *
 * Central hub for all guest communication with AI-powered automation
 */

import { BeaconConfig, BeaconEvent } from '../../core/types';
import { EventBus } from '../../utils/events';
import { IntegrationHub } from '../integrations/hub';
import { AIConcierge } from './concierge';
import { MessageTemplates } from './templates';
import {
  Message,
  Conversation,
  MessageChannel,
  ConciergeRequest,
  ConciergeResponse,
} from './types';

export class MessagingHub {
  private config: BeaconConfig;
  private eventBus: EventBus;
  private integrations: IntegrationHub;
  private concierge: AIConcierge;
  private templates: MessageTemplates;
  private initialized = false;

  constructor(config: BeaconConfig, eventBus: EventBus, integrations: IntegrationHub) {
    this.config = config;
    this.eventBus = eventBus;
    this.integrations = integrations;
    this.concierge = new AIConcierge(config);
    this.templates = new MessageTemplates();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('[MessagingHub] Initializing messaging hub...');

    // Register message event handlers
    this.eventBus.on('message.received', (event) => this.onMessageReceived(event));

    this.initialized = true;
    console.log('[MessagingHub] Messaging hub initialized');
  }

  async shutdown(): Promise<void> {
    console.log('[MessagingHub] Shutting down messaging hub...');
    this.initialized = false;
  }

  async healthCheck(): Promise<boolean> {
    return this.initialized;
  }

  /**
   * Send a message to a guest
   */
  async sendMessage(
    guestId: string,
    content: string,
    channel: MessageChannel,
    options?: {
      subject?: string;
      propertyId?: string;
      reservationId?: string;
    }
  ): Promise<Message> {
    const message: Message = {
      id: crypto.randomUUID(),
      conversationId: '', // Would be set by conversation lookup
      sender: 'host',
      content,
      channel,
      timestamp: new Date(),
      read: false,
      metadata: options,
    };

    // Send via appropriate channel
    switch (channel) {
      case 'email':
        await this.sendEmail(guestId, content, options?.subject);
        break;
      case 'sms':
        await this.sendSMS(guestId, content);
        break;
      default:
        // Store for web/app display
        break;
    }

    this.eventBus.emit('message.sent', message, 'messaging-hub');
    return message;
  }

  /**
   * Send reservation confirmation
   */
  async sendReservationConfirmation(reservationId: string): Promise<void> {
    console.log(`[MessagingHub] Sending confirmation for reservation ${reservationId}`);

    // Get reservation details
    const reservation = await this.getReservationDetails(reservationId);
    if (!reservation) return;

    const template = this.templates.get('booking_confirmation');
    const content = this.templates.render(template, {
      guestName: reservation.guestName,
      propertyName: reservation.propertyName,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      confirmationCode: reservation.confirmationNumber,
      totalAmount: reservation.totalAmount,
    });

    await this.sendMessage(reservation.guestId, content, 'email', {
      subject: `Booking Confirmed - ${reservation.propertyName}`,
      reservationId,
    });
  }

  /**
   * Send welcome message with house info
   */
  async sendWelcomeMessage(reservationId: string): Promise<void> {
    console.log(`[MessagingHub] Sending welcome message for reservation ${reservationId}`);

    const reservation = await this.getReservationDetails(reservationId);
    if (!reservation) return;

    const template = this.templates.get('welcome');
    const content = this.templates.render(template, {
      guestName: reservation.guestName,
      propertyName: reservation.propertyName,
      wifiNetwork: reservation.property?.wifiNetwork || 'BeachHouse_5G',
      wifiPassword: reservation.property?.wifiPassword || 'SunsetViews2024',
      doorCode: reservation.property?.doorCode || '1234',
      checkOutTime: '11:00 AM',
      emergencyContact: '(252) 555-0123',
    });

    await this.sendMessage(reservation.guestId, content, 'sms', { reservationId });
    await this.sendMessage(reservation.guestId, content, 'email', {
      subject: `Welcome to ${reservation.propertyName}!`,
      reservationId,
    });
  }

  /**
   * Schedule review request
   */
  async scheduleReviewRequest(reservationId: string): Promise<void> {
    console.log(`[MessagingHub] Scheduling review request for reservation ${reservationId}`);

    // In production, this would queue a job to send 2 days after checkout
    // For now, just log it
  }

  /**
   * Send property ready notification
   */
  async sendPropertyReadyNotification(propertyId: string): Promise<void> {
    console.log(`[MessagingHub] Property ${propertyId} is ready for guests`);

    // Find upcoming check-in for this property and notify guest
    // This would query the database for the next reservation
  }

  /**
   * Send maintenance notification
   */
  async sendMaintenanceNotification(propertyId: string, issue: string): Promise<void> {
    console.log(`[MessagingHub] Sending maintenance notification for property ${propertyId}`);

    // Find current guest at property and notify them
    // This would query the database for active reservations
  }

  /**
   * Process incoming message with AI concierge
   */
  async processWithConcierge(request: ConciergeRequest): Promise<ConciergeResponse> {
    return this.concierge.process(request);
  }

  /**
   * Get local recommendations
   */
  async getLocalRecommendations(
    location: string,
    type: 'restaurant' | 'activity' | 'attraction' = 'restaurant'
  ) {
    return this.concierge.getRecommendations(location, type);
  }

  /**
   * Handle incoming message event
   */
  private async onMessageReceived(event: BeaconEvent): Promise<void> {
    const message = event.payload as Message;

    // If AI concierge is enabled, process automatically
    if (this.config.features.aiConcierge && message.sender === 'guest') {
      const response = await this.processWithConcierge({
        message: message.content,
        guestId: message.metadata?.guestId as string,
        propertyId: message.metadata?.propertyId as string,
        reservationId: message.metadata?.reservationId as string,
      });

      if (!response.escalate) {
        // Auto-respond
        await this.sendMessage(
          message.metadata?.guestId as string,
          response.response,
          message.channel,
          {
            propertyId: message.metadata?.propertyId as string,
            reservationId: message.metadata?.reservationId as string,
          }
        );

        this.eventBus.emit(
          'message.ai_response',
          { originalMessage: message, response },
          'messaging-hub'
        );
      }
    }
  }

  /**
   * Send email via integration
   */
  private async sendEmail(
    guestId: string,
    content: string,
    subject?: string
  ): Promise<void> {
    // Would use SendGrid or similar
    console.log(`[MessagingHub] Email to guest ${guestId}: ${subject}`);
  }

  /**
   * Send SMS via integration
   */
  private async sendSMS(guestId: string, content: string): Promise<void> {
    // Would use Twilio or similar
    console.log(`[MessagingHub] SMS to guest ${guestId}`);
  }

  /**
   * Get reservation details (helper)
   */
  private async getReservationDetails(reservationId: string): Promise<any> {
    // Would fetch from database
    return {
      id: reservationId,
      guestId: 'guest-123',
      guestName: 'John Smith',
      propertyName: 'Oceanfront Villa',
      checkIn: '2024-06-15',
      checkOut: '2024-06-22',
      confirmationNumber: 'SOS-12345',
      totalAmount: 2500,
      property: {
        wifiNetwork: 'BeachHouse_5G',
        wifiPassword: 'SunsetViews2024',
        doorCode: '1234',
      },
    };
  }
}
