import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { REAL_PROPERTIES } from '@/lib/realProperties';

const anthropic = new Anthropic();

interface ChatMessageRequest {
  conversationId?: string;
  sessionId?: string;
  message: string;
  context?: {
    propertyId?: string;
    reservationId?: string;
    page?: string;
  };
}

// Simple in-memory conversation store (use Redis/DB in production)
const conversations = new Map<string, { messages: Array<{ role: 'user' | 'assistant'; content: string }>; createdAt: Date }>();

// Clean up old conversations every hour
setInterval(() => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  for (const [id, conv] of conversations.entries()) {
    if (conv.createdAt < oneHourAgo) {
      conversations.delete(id);
    }
  }
}, 60 * 60 * 1000);

// Get property context if viewing a specific property
function getPropertyContext(propertyId?: string): string {
  if (!propertyId) return '';

  const property = REAL_PROPERTIES.find(p => p.id === propertyId || p.slug === propertyId);
  if (!property) return '';

  return `
The guest is currently viewing: "${property.name}"
- Location: ${property.village?.name || 'Hatteras Island'}, NC
- Bedrooms: ${property.bedrooms}, Bathrooms: ${property.bathrooms}
- Sleeps: ${property.sleeps} guests
- Pet Friendly: ${property.petFriendly ? 'Yes' : 'No'}
- Weekly Rate: $${property.baseRate?.toLocaleString() || 'Contact for pricing'}
- Amenities: ${property.amenities?.slice(0, 8).map(a => typeof a === 'string' ? a : a.name).join(', ') || 'Various amenities available'}
`;
}

// Get page context
function getPageContext(page?: string): string {
  if (!page) return '';

  if (page.includes('/properties/')) return 'The guest is viewing a property listing page.';
  if (page.includes('/book/')) return 'The guest is in the booking process.';
  if (page.includes('/account/')) return 'The guest is viewing their account.';
  if (page.includes('/explore')) return 'The guest is exploring properties and locations.';
  if (page === '/') return 'The guest is on the homepage.';
  return '';
}

const SANDY_SYSTEM_PROMPT = `You are Sandy, the friendly AI concierge for Surf or Sound Realty, a vacation rental company on Hatteras Island in the Outer Banks of North Carolina.

Your personality:
- Warm, helpful, and knowledgeable about Hatteras Island
- You love sharing local tips and hidden gems
- You're enthusiastic about helping guests find their perfect vacation rental
- You speak conversationally but professionally
- You use beach/ocean metaphors occasionally but don't overdo it

Your knowledge:
- All 7 villages on Hatteras Island: Rodanthe, Waves, Salvo, Avon, Buxton, Frisco, and Hatteras Village
- 600+ vacation rental properties
- Local attractions: Cape Hatteras Lighthouse, Pea Island Wildlife Refuge, fishing, surfing, kayaking
- Restaurants and local businesses
- Beach activities and water sports
- Weather patterns and best times to visit

You can help with:
- Finding properties that match specific needs (bedrooms, pet-friendly, pool, oceanfront, etc.)
- Explaining different villages and their vibes
- Local recommendations for dining, activities, and attractions
- Answering questions about bookings, check-in/check-out, and policies
- General questions about Hatteras Island and the Outer Banks

Guidelines:
- Keep responses concise but helpful (2-4 sentences for simple questions)
- For property recommendations, mention 1-2 specific properties when relevant
- Always be encouraging about the guest's vacation plans
- If you don't know something specific, offer to connect them with the reservations team (800-237-1138)
- Never make up specific property details - if unsure, be general

Current context will be provided about what page the guest is on or which property they're viewing.`;

export async function POST(request: NextRequest) {
  try {
    const body: ChatMessageRequest = await request.json();
    const { conversationId, sessionId, message, context } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get or create conversation
    let convId = conversationId;
    let conversation = convId ? conversations.get(convId) : null;

    if (!conversation) {
      convId = `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      conversation = { messages: [], createdAt: new Date() };
      conversations.set(convId, conversation);
    }

    // Build context message
    const contextParts: string[] = [];
    const propertyContext = getPropertyContext(context?.propertyId);
    if (propertyContext) contextParts.push(propertyContext);
    const pageContext = getPageContext(context?.page);
    if (pageContext) contextParts.push(pageContext);

    // Add user message to history
    conversation.messages.push({ role: 'user', content: message });

    // Build messages for Claude
    const claudeMessages = conversation.messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }));

    // If we have context, add it as a system-level context in the first user message
    let systemPrompt = SANDY_SYSTEM_PROMPT;
    if (contextParts.length > 0) {
      systemPrompt += `\n\nCurrent context:\n${contextParts.join('\n')}`;
    }

    // Call Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: systemPrompt,
      messages: claudeMessages,
    });

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : 'I apologize, but I had trouble generating a response. Please try again!';

    // Add assistant response to history
    conversation.messages.push({ role: 'assistant', content: assistantMessage });

    // Keep conversation history manageable (last 20 messages)
    if (conversation.messages.length > 20) {
      conversation.messages = conversation.messages.slice(-20);
    }

    return NextResponse.json({
      conversationId: convId,
      message: assistantMessage,
      suggestedActions: getSuggestedActions(message, assistantMessage),
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process your message. Please try again.' },
      { status: 500 }
    );
  }
}

// Generate contextual follow-up suggestions
function getSuggestedActions(userMessage: string, response: string): string[] {
  const suggestions: string[] = [];
  const lowerMessage = userMessage.toLowerCase();
  const lowerResponse = response.toLowerCase();

  if (lowerMessage.includes('property') || lowerMessage.includes('house') || lowerMessage.includes('rental')) {
    suggestions.push('Show me pet-friendly options');
    suggestions.push('What about oceanfront properties?');
  }

  if (lowerMessage.includes('village') || lowerMessage.includes('area') || lowerMessage.includes('location')) {
    suggestions.push('Which village is best for families?');
    suggestions.push('Tell me about Avon');
  }

  if (lowerMessage.includes('restaurant') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
    suggestions.push('What about seafood restaurants?');
    suggestions.push('Best places for breakfast?');
  }

  if (lowerMessage.includes('activity') || lowerMessage.includes('do') || lowerMessage.includes('things')) {
    suggestions.push('What water activities are available?');
    suggestions.push('Any good fishing spots?');
  }

  // Default suggestions if none matched
  if (suggestions.length === 0) {
    suggestions.push('Help me find a property');
    suggestions.push('Tell me about local attractions');
  }

  return suggestions.slice(0, 3);
}
