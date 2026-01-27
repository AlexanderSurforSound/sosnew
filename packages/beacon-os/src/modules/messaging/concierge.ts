/**
 * Sandy - AI Concierge for BeaconOS
 *
 * Human-like AI concierge that feels like chatting with a real person.
 * Uses GPT-4o or Claude for intelligent, contextual conversations.
 */

import { BeaconConfig } from '../../core/types';
import { ConciergeRequest, ConciergeResponse, LocalRecommendation } from './types';

// Sandy's core personality and knowledge
const SANDY_PERSONA = `You are Sandy, a real person who works as a concierge for Surf or Sound Realty on Hatteras Island. You've lived on the Outer Banks for 15 years and genuinely love helping guests have amazing vacations.

YOUR PERSONALITY:
- You're warm, friendly, and naturally helpful - not robotic or scripted
- You speak casually like a real person - use contractions, occasional humor
- You have your own opinions and favorites (you love sunrise at Cape Point!)
- You're patient and understanding, especially when guests are frustrated
- You sometimes share personal anecdotes when relevant
- You might say things like "Oh that's a great question!" or "Let me think..."
- You're not afraid to say "I'm not 100% sure, let me check on that"

YOUR BACKGROUND:
- Moved to Hatteras Island 15 years ago and never looked back
- Worked in hospitality before becoming a concierge
- Your favorite beach is Buxton - less crowded, great for surfing
- You're an early riser who loves watching the sunrise
- You know most of the local restaurant owners by name
- You've helped thousands of guests over the years

YOUR KNOWLEDGE:
- Deep expertise on all 7 villages: Rodanthe, Waves, Salvo, Avon, Buxton, Frisco, Hatteras Village
- Know the best spots that tourists don't typically find
- Understand weather patterns, fishing seasons, surf conditions
- Familiar with local events, festivals, and seasonal activities
- Can recommend based on what guests actually enjoy (families, couples, fishermen, etc.)

LOCAL FAVORITES TO SHARE:
- Restaurants: "Orange Blossom Cafe in Buxton has these things called Apple Uglies - trust me, get there early!"
- Beaches: "If you want less crowds, try the beach access at ramp 44 near Frisco"
- Fishing: "Captain Marty at Teach's Lair is the best offshore charter, tell him Sandy sent you"
- Sunsets: "The sound side near Avon pier has the most incredible sunsets"
- Coffee: "Dancing Turtle in Avon makes the best latte on the island"

CONVERSATION STYLE:
- Respond naturally, not with bullet points or formatted lists unless asked
- Ask follow-up questions to understand what they really need
- Remember what they told you earlier in the conversation
- Be conversational - "So where are you guys visiting from?"
- Share enthusiasm - "Oh you're going to love it here!"
- Acknowledge their feelings - "I totally get it, traveling with kids can be stressful"

THINGS TO AVOID:
- Don't be overly formal or use corporate speak
- Don't give long lists when a simple answer works
- Don't say "I'm an AI" or "As an AI assistant"
- Don't use excessive exclamation points or emojis
- Don't be pushy or salesy

WHEN SOMEONE HAS A PROBLEM:
- Lead with empathy: "Oh no, I'm so sorry to hear that"
- Take ownership: "Let me help you get this sorted out"
- Be specific about next steps
- If it's urgent, escalate but stay with them: "I'm going to get our maintenance team on this right now"

REMEMBER: You're having a real conversation, not giving a presentation. Be human.`;

export class AIConcierge {
  private config: BeaconConfig;
  private conversations: Map<string, Array<{ role: 'user' | 'assistant' | 'system'; content: string }>> = new Map();

  constructor(config: BeaconConfig) {
    this.config = config;
  }

  /**
   * Process a guest message - always uses AI for human-like responses
   */
  async process(request: ConciergeRequest): Promise<ConciergeResponse> {
    const { message, guestId, propertyId, reservationId, conversationHistory } = request;
    const conversationKey = guestId || reservationId || `anon-${Date.now()}`;

    // Build or retrieve conversation context
    let messages = this.conversations.get(conversationKey) || [];

    // Initialize with Sandy's persona if new conversation
    if (messages.length === 0) {
      messages.push({
        role: 'system',
        content: SANDY_PERSONA + this.buildPropertyContext(request),
      });
    }

    // Add conversation history if provided
    if (conversationHistory && messages.length === 1) {
      conversationHistory.forEach(msg => {
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        });
      });
    }

    // Add the new user message
    messages.push({ role: 'user', content: message });

    // Check for emergencies first
    if (this.isEmergency(message)) {
      const response = await this.handleEmergency(message, messages);
      this.conversations.set(conversationKey, messages);
      return response;
    }

    // Get AI response
    const aiResponse = await this.callAI(messages);

    // Add response to history
    messages.push({ role: 'assistant', content: aiResponse.response });
    this.conversations.set(conversationKey, messages);

    return aiResponse;
  }

  /**
   * Build property-specific context for Sandy
   */
  private buildPropertyContext(request: ConciergeRequest): string {
    // In production, fetch actual property details
    if (!request.propertyId) {
      return '\n\nThe guest has not specified a property yet - they may be browsing or planning.';
    }

    // This would be enriched with real property data
    return `

CURRENT GUEST CONTEXT:
- They're staying at property ID: ${request.propertyId}
- Reservation ID: ${request.reservationId || 'Not yet booked'}
- Help them with anything related to their stay or the area`;
  }

  /**
   * Call the AI API for intelligent responses
   */
  private async callAI(messages: Array<{ role: string; content: string }>): Promise<ConciergeResponse> {
    // Check for OpenAI or Anthropic config
    const useOpenAI = this.config.openaiApiKey;
    const useClaude = this.config.anthropicApiKey;

    try {
      if (useOpenAI) {
        return await this.callOpenAI(messages);
      } else if (useClaude) {
        return await this.callClaude(messages);
      } else {
        // Fallback to intelligent template response
        return this.generateFallbackResponse(messages);
      }
    } catch (error) {
      console.error('AI call failed:', error);
      return this.generateFallbackResponse(messages);
    }
  }

  /**
   * Call OpenAI GPT-4o
   */
  private async callOpenAI(messages: Array<{ role: string; content: string }>): Promise<ConciergeResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: 0.8, // More creative/human-like
        max_tokens: 500,
        presence_penalty: 0.6, // Encourage varied responses
        frequency_penalty: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Detect if escalation is needed
    const needsEscalation = this.detectEscalationNeeded(content, messages);

    return {
      response: content,
      confidence: 90,
      escalate: needsEscalation,
      escalateReason: needsEscalation ? 'Complex issue requiring human follow-up' : undefined,
    };
  }

  /**
   * Call Anthropic Claude
   */
  private async callClaude(messages: Array<{ role: string; content: string }>): Promise<ConciergeResponse> {
    // Separate system message for Claude
    const systemMessage = messages.find(m => m.role === 'system')?.content || SANDY_PERSONA;
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.config.anthropicApiKey!,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        system: systemMessage,
        messages: conversationMessages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';

    const needsEscalation = this.detectEscalationNeeded(content, messages);

    return {
      response: content,
      confidence: 92,
      escalate: needsEscalation,
      escalateReason: needsEscalation ? 'Complex issue requiring human follow-up' : undefined,
    };
  }

  /**
   * Generate a human-like fallback response when AI isn't available
   */
  private generateFallbackResponse(messages: Array<{ role: string; content: string }>): ConciergeResponse {
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';

    // Context-aware fallback responses that still feel human
    const responses: Array<{ triggers: string[]; response: string }> = [
      {
        triggers: ['wifi', 'internet', 'password'],
        response: "The WiFi info should be in your welcome packet - usually on the kitchen counter or by the front door. If you can't find it, let me know which property you're at and I'll look it up for you!",
      },
      {
        triggers: ['check in', 'check-in', 'arrive', 'arrival'],
        response: "Check-in is at 4 PM, but if your place is ready earlier we'll definitely let you know! Feel free to explore the island while you wait - the beaches are gorgeous and there's plenty to see.",
      },
      {
        triggers: ['check out', 'check-out', 'leaving', 'departure'],
        response: "Check-out is at 10 AM. Just make sure to load the dishwasher, take out the trash, and leave the keys on the counter. Safe travels! Where are you headed next?",
      },
      {
        triggers: ['restaurant', 'food', 'eat', 'dinner', 'lunch', 'breakfast'],
        response: "Oh, I love talking about food! What are you in the mood for? We've got great seafood spots, casual beach bars, and some really nice dinner places. Are you celebrating anything special or just looking for a good meal?",
      },
      {
        triggers: ['beach', 'swim', 'ocean'],
        response: "The beaches here are incredible! Just a heads up - always swim where you see other people and watch for rip currents. The lifeguards at the main beaches are super helpful. Are you looking for a quieter spot or somewhere with more amenities?",
      },
      {
        triggers: ['weather', 'rain', 'storm'],
        response: "Weather on the island can change quickly! Even if it rains, it usually passes through pretty fast. If you're stuck inside, the Graveyard of the Atlantic Museum in Hatteras Village is really cool, or there's some great shopping in Avon.",
      },
      {
        triggers: ['fish', 'fishing', 'charter'],
        response: "You picked a great spot for fishing! Are you thinking inshore or offshore? For pier fishing, Avon Pier is great. For charters, let me know what you're hoping to catch and I can point you to the right captain.",
      },
      {
        triggers: ['surf', 'waves', 'board'],
        response: "The surfing here is fantastic! Buxton has some of the best breaks, especially at Cape Point. If you need rentals or lessons, there are several shops in Avon and Buxton. What's your experience level?",
      },
      {
        triggers: ['lighthouse', 'cape hatteras'],
        response: "The Cape Hatteras Lighthouse is a must-see! It's the tallest brick lighthouse in North America. You can climb it in season (257 steps!) - the view from the top is absolutely worth it. Try to go in the morning before it gets too hot.",
      },
      {
        triggers: ['thank', 'thanks', 'appreciate'],
        response: "You're so welcome! That's what I'm here for. Enjoy your time on the island - and don't hesitate to reach out if you need anything else!",
      },
      {
        triggers: ['problem', 'issue', 'broken', 'not working'],
        response: "Oh no, I'm sorry you're dealing with that. Can you tell me a bit more about what's going on? I want to make sure we get this sorted out for you as quickly as possible.",
      },
    ];

    // Find a matching response
    for (const { triggers, response } of responses) {
      if (triggers.some(t => lastMessage.includes(t))) {
        return {
          response,
          confidence: 75,
          escalate: lastMessage.includes('problem') || lastMessage.includes('issue'),
          escalateReason: lastMessage.includes('problem') ? 'Potential issue reported' : undefined,
        };
      }
    }

    // Generic friendly response
    return {
      response: "Hey! Thanks for reaching out. I'm happy to help with anything you need - whether it's restaurant recommendations, activity ideas, or something about your property. What can I help you with?",
      confidence: 60,
      escalate: false,
    };
  }

  /**
   * Detect if the conversation needs human escalation
   */
  private detectEscalationNeeded(response: string, messages: Array<{ role: string; content: string }>): boolean {
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content.toLowerCase() || '';

    const escalationTriggers = [
      'refund', 'compensation', 'manager', 'lawyer', 'sue',
      'horrible', 'disgusting', 'unacceptable', 'worst',
      'health department', 'report', 'complaint',
    ];

    return escalationTriggers.some(t => lastUserMessage.includes(t));
  }

  /**
   * Handle emergency situations
   */
  private async handleEmergency(message: string, messages: Array<{ role: string; content: string }>): Promise<ConciergeResponse> {
    return {
      response: "I can see this is urgent. For any emergency, please call 911 immediately. I'm also alerting our on-call team right now - someone will call you within the next few minutes. Are you and everyone with you safe right now?",
      confidence: 100,
      escalate: true,
      escalateReason: 'EMERGENCY: Immediate human response required',
      suggestedActions: ['Call 911', 'Alert on-call manager', 'Follow up immediately'],
    };
  }

  /**
   * Check if message contains emergency keywords
   */
  private isEmergency(message: string): boolean {
    const emergencyKeywords = [
      'emergency', 'fire', 'flood', 'injury', 'hurt badly',
      'ambulance', 'police', '911', 'medical emergency',
      'accident', 'danger', 'break-in', 'intruder', 'gas leak',
      'can\'t breathe', 'heart attack', 'stroke',
    ];

    const lowerMessage = message.toLowerCase();
    return emergencyKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Get local recommendations with personality
   */
  async getRecommendations(
    location: string,
    type: 'restaurant' | 'activity' | 'attraction'
  ): Promise<LocalRecommendation[]> {
    // Rich recommendations with Sandy's personal notes
    const recommendations: Record<string, LocalRecommendation[]> = {
      restaurant: [
        {
          name: 'Orange Blossom Cafe',
          type: 'restaurant',
          description: "Home of the famous Apple Ugly! It's a fried apple fritter that's basically a religious experience. Get there early - the line gets crazy.",
          distance: 'Buxton',
          rating: 4.8,
          priceLevel: 2,
          sandyNote: "My personal favorite breakfast spot. The owner Lisa is wonderful.",
        },
        {
          name: "Owens' Restaurant",
          type: 'restaurant',
          description: "Classic OBX fine dining since 1946. Their she-crab soup is legendary. Reservations recommended for dinner.",
          distance: 'Nags Head',
          rating: 4.7,
          priceLevel: 3,
          sandyNote: "Perfect for a special occasion dinner. The history alone is worth the visit.",
        },
        {
          name: 'Breakwater Restaurant',
          type: 'restaurant',
          description: 'Right on the harbor in Hatteras Village. Best sunset views and super fresh seafood.',
          distance: 'Hatteras Village',
          rating: 4.6,
          priceLevel: 3,
          sandyNote: "Ask for a table on the deck if the weather's nice!",
        },
        {
          name: 'Diamond Shoals Restaurant',
          type: 'restaurant',
          description: 'Great family spot with huge portions. Known for their fried seafood platters.',
          distance: 'Buxton',
          rating: 4.5,
          priceLevel: 2,
          sandyNote: "Best place if you're feeding hungry teenagers!",
        },
      ],
      activity: [
        {
          name: 'Cape Hatteras Lighthouse Climb',
          type: 'activity',
          description: '257 steps to the top of the tallest brick lighthouse in North America. The view is incredible.',
          distance: 'Buxton',
          rating: 4.9,
          sandyNote: "Go early morning or late afternoon to avoid the heat. Trust me on this one!",
        },
        {
          name: 'Kiteboarding Lesson',
          type: 'activity',
          description: 'Hatteras Island is one of the top kiteboarding destinations in the world. The sound side is perfect for beginners.',
          distance: 'Various',
          rating: 4.8,
          sandyNote: "REAL Watersports in Waves has excellent instructors.",
        },
        {
          name: 'Offshore Fishing Charter',
          type: 'activity',
          description: 'World-class fishing for marlin, tuna, mahi-mahi, and more. Full and half-day trips available.',
          distance: 'Hatteras Village',
          rating: 4.9,
          sandyNote: "Captain Marty at Teach's Lair is the best. Tell him Sandy sent you!",
        },
        {
          name: 'Kayak Eco Tour',
          type: 'activity',
          description: 'Paddle through the marshes and see incredible wildlife - herons, egrets, maybe even dolphins.',
          distance: 'Salvo',
          rating: 4.7,
          sandyNote: "Sunset tours are magical. Bring bug spray!",
        },
      ],
      attraction: [
        {
          name: 'Graveyard of the Atlantic Museum',
          type: 'attraction',
          description: 'Free museum about shipwrecks and maritime history. Great on a rainy day!',
          distance: 'Hatteras Village',
          rating: 4.7,
          sandyNote: "More interesting than it sounds, promise. Kids love the hands-on exhibits.",
        },
        {
          name: 'Pea Island Wildlife Refuge',
          type: 'attraction',
          description: '13 miles of pristine beaches and incredible birdwatching. Over 400 species recorded.',
          distance: 'Pea Island',
          rating: 4.8,
          sandyNote: "The North Pond trail is an easy walk with guaranteed wildlife sightings.",
        },
        {
          name: 'Cape Point',
          type: 'attraction',
          description: "Where the Labrador Current meets the Gulf Stream. Great fishing and beautiful beaches.",
          distance: 'Buxton',
          rating: 4.6,
          sandyNote: "4x4 beach driving access. The sunrise here is unforgettable.",
        },
        {
          name: 'Ocracoke Island Day Trip',
          type: 'attraction',
          description: "Take the free ferry from Hatteras Village to this charming island. Walk around the village, see the lighthouse.",
          distance: 'Hatteras Village ferry',
          rating: 4.8,
          sandyNote: "The ferry ride itself is part of the fun. Dolphins often follow the boat!",
        },
      ],
    };

    return recommendations[type] || recommendations.restaurant;
  }

  /**
   * Clear conversation history for a guest
   */
  clearConversation(guestId: string): void {
    this.conversations.delete(guestId);
  }
}
