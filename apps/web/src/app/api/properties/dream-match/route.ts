import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { REAL_PROPERTIES } from '@/lib/realProperties';

const anthropic = new Anthropic();

interface DreamMatcherRequest {
  query: string;
  checkIn?: string;
  checkOut?: string;
  maxResults?: number;
}

interface ExtractedCriteria {
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

export async function POST(request: NextRequest) {
  try {
    const body: DreamMatcherRequest = await request.json();
    const { query, maxResults = 6 } = body;

    if (!query || query.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide a more detailed description of your dream vacation' },
        { status: 400 }
      );
    }

    // Step 1: Use Claude to extract search criteria from the natural language query
    const criteriaResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a vacation rental search assistant for Surf or Sound Realty on Hatteras Island, NC (Outer Banks).

Analyze this vacation search request and extract structured search criteria:

"${query}"

Available villages on Hatteras Island: Rodanthe, Waves, Salvo, Avon, Buxton, Frisco, Hatteras Village

Common amenities: Pool, Hot Tub, Ocean View, Oceanfront, Soundfront, Pet Friendly, Game Room, Private Beach Access, Elevator, Wheelchair Accessible, Linens Provided, WiFi, Air Conditioning

Respond with ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "minBedrooms": <number or null>,
  "maxBedrooms": <number or null>,
  "guests": <number or null>,
  "petFriendly": <boolean or null>,
  "preferredVillage": "<village name or null>",
  "requiredAmenities": ["<amenity1>", "<amenity2>"],
  "preferredAmenities": ["<amenity1>", "<amenity2>"],
  "locationPreference": "<oceanfront/soundfront/central or null>",
  "budgetLevel": "<budget/moderate/luxury or null>",
  "vibe": "<romantic/family/adventure/relaxation or null>",
  "keywords": ["<keyword1>", "<keyword2>"]
}`
        }
      ]
    });

    let extractedCriteria: ExtractedCriteria;
    try {
      const criteriaText = criteriaResponse.content[0].type === 'text'
        ? criteriaResponse.content[0].text
        : '';
      extractedCriteria = JSON.parse(criteriaText);
    } catch {
      extractedCriteria = {
        requiredAmenities: [],
        preferredAmenities: [],
        keywords: query.toLowerCase().split(' ').filter(w => w.length > 3)
      };
    }

    // Step 2: Score and rank properties based on extracted criteria
    const scoredProperties = REAL_PROPERTIES.map(property => {
      let score = 0;
      const matchedFeatures: string[] = [];

      // Bedroom match
      if (extractedCriteria.minBedrooms && property.bedrooms >= extractedCriteria.minBedrooms) {
        score += 20;
        matchedFeatures.push(`${property.bedrooms} bedrooms`);
      }
      if (extractedCriteria.maxBedrooms && property.bedrooms <= extractedCriteria.maxBedrooms) {
        score += 10;
      }

      // Guest capacity
      if (extractedCriteria.guests && property.sleeps >= extractedCriteria.guests) {
        score += 15;
        matchedFeatures.push(`Sleeps ${property.sleeps}`);
      }

      // Pet friendly
      if (extractedCriteria.petFriendly && property.petFriendly) {
        score += 25;
        matchedFeatures.push('Pet friendly');
      }

      // Village preference
      if (extractedCriteria.preferredVillage) {
        const villageName = property.village?.name?.toLowerCase() || '';
        if (villageName.includes(extractedCriteria.preferredVillage.toLowerCase())) {
          score += 30;
          matchedFeatures.push(`Located in ${property.village?.name}`);
        }
      }

      // Amenities matching
      const propertyAmenities = property.amenities?.map(a =>
        (typeof a === 'string' ? a : a.name).toLowerCase()
      ) || [];

      // Required amenities (must have)
      const requiredMatches = extractedCriteria.requiredAmenities.filter(req =>
        propertyAmenities.some(pa => pa.includes(req.toLowerCase()))
      );
      score += requiredMatches.length * 20;
      matchedFeatures.push(...requiredMatches.map(a => a.charAt(0).toUpperCase() + a.slice(1)));

      // Preferred amenities (nice to have)
      const preferredMatches = extractedCriteria.preferredAmenities.filter(pref =>
        propertyAmenities.some(pa => pa.includes(pref.toLowerCase()))
      );
      score += preferredMatches.length * 10;

      // Location preference
      if (extractedCriteria.locationPreference) {
        const locPref = extractedCriteria.locationPreference.toLowerCase();
        if (propertyAmenities.some(a => a.includes(locPref))) {
          score += 25;
          matchedFeatures.push(extractedCriteria.locationPreference);
        }
      }

      // Keyword matching in name/description
      const searchText = `${property.name} ${property.headline || ''} ${property.description || ''}`.toLowerCase();
      const keywordMatches = extractedCriteria.keywords.filter(kw =>
        searchText.includes(kw.toLowerCase())
      );
      score += keywordMatches.length * 5;

      // Budget level (rough estimation based on base rate)
      if (extractedCriteria.budgetLevel && property.baseRate) {
        const rate = property.baseRate;
        if (extractedCriteria.budgetLevel === 'budget' && rate < 2000) score += 15;
        if (extractedCriteria.budgetLevel === 'moderate' && rate >= 2000 && rate < 4000) score += 15;
        if (extractedCriteria.budgetLevel === 'luxury' && rate >= 4000) score += 15;
      }

      return {
        property,
        score,
        matchedFeatures: [...new Set(matchedFeatures)].slice(0, 5)
      };
    });

    // Sort by score and take top results
    const topMatches = scoredProperties
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);

    // Step 3: Generate match explanations using Claude
    const matchExplanations = await Promise.all(
      topMatches.slice(0, 3).map(async (match) => {
        try {
          const explanationResponse = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 150,
            messages: [
              {
                role: 'user',
                content: `In 1-2 short sentences, explain why "${match.property.name}" (${match.property.bedrooms}BR, sleeps ${match.property.sleeps}, ${match.property.village?.name || 'Hatteras Island'}) is a good match for someone looking for: "${query}". Focus on what makes it special. Be warm and helpful.`
              }
            ]
          });
          return explanationResponse.content[0].type === 'text'
            ? explanationResponse.content[0].text
            : '';
        } catch {
          return `${match.property.name} matches your search with ${match.matchedFeatures.join(', ')}.`;
        }
      })
    );

    // Build response
    const matches = topMatches.map((match, index) => ({
      property: {
        id: match.property.id,
        trackId: match.property.trackId,
        name: match.property.name,
        slug: match.property.slug,
        headline: match.property.headline,
        bedrooms: match.property.bedrooms,
        bathrooms: match.property.bathrooms,
        sleeps: match.property.sleeps,
        petFriendly: match.property.petFriendly,
        baseRate: match.property.baseRate,
        village: match.property.village,
        images: match.property.images?.slice(0, 3) || [],
        amenities: match.property.amenities?.slice(0, 6) || [],
      },
      matchScore: Math.min(100, Math.round((match.score / 100) * 100)),
      matchExplanation: index < 3 && matchExplanations[index]
        ? matchExplanations[index]
        : `Great match with ${match.matchedFeatures.slice(0, 3).join(', ')}.`,
      highlightedFeatures: match.matchedFeatures,
    }));

    // Generate summary
    let summary = `Found ${matches.length} properties matching your search`;
    if (extractedCriteria.preferredVillage) {
      summary += ` in ${extractedCriteria.preferredVillage}`;
    }
    if (extractedCriteria.minBedrooms) {
      summary += ` with ${extractedCriteria.minBedrooms}+ bedrooms`;
    }
    if (extractedCriteria.petFriendly) {
      summary += `, pet-friendly`;
    }
    summary += '.';

    return NextResponse.json({
      matches,
      searchCriteria: extractedCriteria,
      totalPropertiesAnalyzed: REAL_PROPERTIES.length,
      summary,
    });

  } catch (error) {
    console.error('Dream Matcher error:', error);
    return NextResponse.json(
      { error: 'Failed to process your search. Please try again.' },
      { status: 500 }
    );
  }
}
