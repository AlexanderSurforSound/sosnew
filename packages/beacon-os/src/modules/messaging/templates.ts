/**
 * Message Templates for BeaconOS
 *
 * Pre-built templates for common guest communications
 */

import { MessageTemplate, MessageTemplateType } from './types';

export class MessageTemplates {
  private templates: Map<MessageTemplateType, MessageTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Get a template by type
   */
  get(type: MessageTemplateType): MessageTemplate {
    const template = this.templates.get(type);
    if (!template) {
      throw new Error(`Template not found: ${type}`);
    }
    return template;
  }

  /**
   * Render a template with variables
   */
  render(template: MessageTemplate, variables: Record<string, string | number>): string {
    let content = template.content;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, String(value));
    }

    return content;
  }

  /**
   * Initialize default templates
   */
  private initializeTemplates(): void {
    this.templates.set('booking_confirmation', {
      id: 'booking_confirmation',
      name: 'Booking Confirmation',
      type: 'booking_confirmation',
      subject: 'Your Reservation is Confirmed - {{propertyName}}',
      content: `Hi {{guestName}},

Great news! Your reservation at {{propertyName}} is confirmed.

RESERVATION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━
Confirmation Code: {{confirmationCode}}
Check-in: {{checkIn}} at 4:00 PM
Check-out: {{checkOut}} at 10:00 AM
Total: ${{totalAmount}}

WHAT'S NEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━
• 7 days before arrival: We'll send your check-in instructions
• Day of arrival: You'll receive door codes and WiFi info
• During your stay: Our concierge is available 24/7

We can't wait to host you at Surf or Sound!

Best regards,
The Surf or Sound Team
(252) 555-0123
surforsound.com`,
      variables: [
        'guestName',
        'propertyName',
        'confirmationCode',
        'checkIn',
        'checkOut',
        'totalAmount',
      ],
      channel: ['email'],
    });

    this.templates.set('check_in_instructions', {
      id: 'check_in_instructions',
      name: 'Check-in Instructions',
      type: 'check_in_instructions',
      subject: 'Your Check-in Instructions for {{propertyName}}',
      content: `Hi {{guestName}},

Your beach vacation starts tomorrow! Here's everything you need to know.

CHECK-IN DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━
Property: {{propertyName}}
Address: {{address}}
Check-in Time: {{checkInTime}}

ACCESS
━━━━━━━━━━━━━━━━━━━━━━━━━━
Door Code: {{doorCode}}
Lockbox Location: {{lockboxLocation}}

WIFI
━━━━━━━━━━━━━━━━━━━━━━━━━━
Network: {{wifiNetwork}}
Password: {{wifiPassword}}

PARKING
━━━━━━━━━━━━━━━━━━━━━━━━━━
{{parkingInstructions}}

CONTACT US
━━━━━━━━━━━━━━━━━━━━━━━━━━
24/7 Support: (252) 555-0123
Text or call anytime!

Safe travels and enjoy your stay!

The Surf or Sound Team`,
      variables: [
        'guestName',
        'propertyName',
        'address',
        'checkInTime',
        'doorCode',
        'lockboxLocation',
        'wifiNetwork',
        'wifiPassword',
        'parkingInstructions',
      ],
      channel: ['email', 'sms'],
    });

    this.templates.set('welcome', {
      id: 'welcome',
      name: 'Welcome Message',
      type: 'welcome',
      subject: 'Welcome to {{propertyName}}!',
      content: `Welcome to {{propertyName}}, {{guestName}}! 🏖️

WiFi: {{wifiNetwork}} / {{wifiPassword}}
Door: {{doorCode}}
Check-out: {{checkOutTime}}

Need anything? Text us at (252) 555-0123 or chat with our AI concierge!

Enjoy your stay!`,
      variables: [
        'guestName',
        'propertyName',
        'wifiNetwork',
        'wifiPassword',
        'doorCode',
        'checkOutTime',
      ],
      channel: ['sms', 'email'],
    });

    this.templates.set('checkout_reminder', {
      id: 'checkout_reminder',
      name: 'Checkout Reminder',
      type: 'checkout_reminder',
      subject: 'Checkout Reminder - {{propertyName}}',
      content: `Hi {{guestName}},

We hope you've had an amazing stay at {{propertyName}}!

CHECKOUT REMINDERS
━━━━━━━━━━━━━━━━━━━━━━━━━━
• Checkout time: {{checkOutTime}}
• Please load and run the dishwasher
• Place all trash in outdoor bins
• Leave keys on the kitchen counter
• Lock all doors and windows

Thank you for staying with Surf or Sound!

Safe travels,
The Surf or Sound Team`,
      variables: ['guestName', 'propertyName', 'checkOutTime'],
      channel: ['email', 'sms'],
    });

    this.templates.set('review_request', {
      id: 'review_request',
      name: 'Review Request',
      type: 'review_request',
      subject: 'How was your stay at {{propertyName}}?',
      content: `Hi {{guestName}},

We hope you had a wonderful time at {{propertyName}}!

Your feedback means the world to us. Would you take a moment to share your experience?

⭐ Leave a Review: {{reviewLink}}

As a thank you, you'll receive a 10% discount on your next stay!

We'd love to host you again soon.

Warmly,
The Surf or Sound Team`,
      variables: ['guestName', 'propertyName', 'reviewLink'],
      channel: ['email'],
    });

    this.templates.set('property_ready', {
      id: 'property_ready',
      name: 'Property Ready',
      type: 'property_ready',
      subject: 'Great news! {{propertyName}} is ready for you',
      content: `Hi {{guestName}},

{{propertyName}} is all cleaned and ready for your arrival! 🏠✨

Check-in at {{checkInTime}}
Door code: {{doorCode}}

Text us when you arrive - we're here to help!

The Surf or Sound Team`,
      variables: ['guestName', 'propertyName', 'checkInTime', 'doorCode'],
      channel: ['sms'],
    });

    this.templates.set('maintenance_notification', {
      id: 'maintenance_notification',
      name: 'Maintenance Notification',
      type: 'maintenance_notification',
      subject: 'Update on {{issue}} at {{propertyName}}',
      content: `Hi {{guestName}},

We were notified about {{issue}} at {{propertyName}}.

A member of our team will be there {{eta}} to resolve this.

We apologize for any inconvenience and appreciate your patience!

If you have questions, call us at (252) 555-0123.

The Surf or Sound Team`,
      variables: ['guestName', 'propertyName', 'issue', 'eta'],
      channel: ['sms', 'email'],
    });

    this.templates.set('payment_reminder', {
      id: 'payment_reminder',
      name: 'Payment Reminder',
      type: 'payment_reminder',
      subject: 'Payment Reminder for {{propertyName}}',
      content: `Hi {{guestName}},

This is a friendly reminder that your remaining balance of ${{balanceAmount}} for {{propertyName}} is due on {{dueDate}}.

Pay securely here: {{paymentLink}}

If you've already made this payment, please disregard this message.

Questions? Reply to this email or call (252) 555-0123.

Thanks!
The Surf or Sound Team`,
      variables: ['guestName', 'propertyName', 'balanceAmount', 'dueDate', 'paymentLink'],
      channel: ['email'],
    });
  }
}
