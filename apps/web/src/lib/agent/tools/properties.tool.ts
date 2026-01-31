/**
 * Property Search Tool
 *
 * Enables Sandy to search for vacation rental properties based on
 * various criteria like location, bedrooms, amenities, and dates.
 *
 * @module agent/tools/properties
 */

import { BaseTool } from './base';
import type { ToolDefinition, ToolResult, PropertySearchResult, PropertySummary } from '../types';
import { searchRealProperties, REAL_PROPERTIES } from '@/lib/realProperties';
import type { Property } from '@/types';

/**
 * Input schema for property search
 */
export interface SearchPropertiesInput {
  /** Village name (Rodanthe, Waves, Salvo, Avon, Buxton, Frisco, Hatteras) */
  village?: string;
  /** Minimum number of bedrooms */
  minBedrooms?: number;
  /** Maximum number of bedrooms */
  maxBedrooms?: number;
  /** Whether pets are allowed */
  petFriendly?: boolean;
  /** Check-in date (YYYY-MM-DD) */
  checkIn?: string;
  /** Check-out date (YYYY-MM-DD) */
  checkOut?: string;
  /** Number of guests */
  guests?: number;
  /** Desired amenities */
  amenities?: string[];
  /** Free-text search query */
  query?: string;
  /** Maximum results to return */
  maxResults?: number;
}

/**
 * Property Search Tool
 *
 * @example
 * ```typescript
 * const result = await tool.execute({
 *   village: 'Avon',
 *   minBedrooms: 3,
 *   petFriendly: true
 * });
 * ```
 */
export class PropertiesTool extends BaseTool<SearchPropertiesInput, PropertySearchResult> {
  readonly name = 'search_properties';

  readonly description = 'Search for vacation rental properties by location, bedrooms, amenities, and dates';

  readonly definition: ToolDefinition = {
    name: 'search_properties',
    description:
      'Search for vacation rental properties based on criteria like location, bedrooms, amenities, dates, and pet-friendliness. Use this when guests are looking for properties or describe what they want.',
    input_schema: {
      type: 'object' as const,
      properties: {
        village: {
          type: 'string',
          description: 'Village name (Rodanthe, Waves, Salvo, Avon, Buxton, Frisco, or Hatteras)',
        },
        minBedrooms: {
          type: 'number',
          description: 'Minimum number of bedrooms needed',
        },
        maxBedrooms: {
          type: 'number',
          description: 'Maximum number of bedrooms',
        },
        petFriendly: {
          type: 'boolean',
          description: 'Whether pets are allowed',
        },
        checkIn: {
          type: 'string',
          description: 'Check-in date in YYYY-MM-DD format',
        },
        checkOut: {
          type: 'string',
          description: 'Check-out date in YYYY-MM-DD format',
        },
        guests: {
          type: 'number',
          description: 'Number of guests',
        },
        amenities: {
          type: 'array',
          items: { type: 'string' },
          description: 'Desired amenities (e.g., "pool", "hot tub", "oceanfront")',
        },
        query: {
          type: 'string',
          description: 'Free-text search query for property names',
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of results to return (default 5)',
        },
      },
      required: [],
    },
  };

  /**
   * Execute property search
   */
  async execute(input: SearchPropertiesInput): Promise<ToolResult<PropertySearchResult>> {
    const maxResults = input.maxResults || 5;

    // Use existing search function
    let properties = searchRealProperties({
      village: input.village,
      bedrooms: input.minBedrooms,
      petFriendly: input.petFriendly,
    });

    // Additional filtering
    if (input.maxBedrooms) {
      properties = properties.filter(p => p.bedrooms <= input.maxBedrooms!);
    }

    if (input.guests) {
      properties = properties.filter(p => p.sleeps >= input.guests!);
    }

    if (input.query) {
      const query = input.query.toLowerCase();
      properties = properties.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.village?.name.toLowerCase().includes(query)
      );
    }

    // Filter by amenities if provided
    if (input.amenities && input.amenities.length > 0) {
      const searchAmenities = input.amenities.map(a => a.toLowerCase());
      properties = properties.filter(p => {
        const propertyAmenities = (p.amenities || []).map(a =>
          (typeof a === 'string' ? a : a.name).toLowerCase()
        );
        return searchAmenities.some(sa =>
          propertyAmenities.some(pa => pa.includes(sa))
        );
      });
    }

    const total = properties.length;
    const results = properties.slice(0, maxResults).map(this.formatProperty);

    // Generate appropriate message
    let message = '';
    if (total === 0) {
      message = 'No properties found matching your criteria. Try adjusting your search.';
    } else if (total === 1) {
      message = 'Found 1 property matching your criteria.';
    } else {
      message = `Found ${total} properties. Showing top ${results.length}.`;
    }

    return this.success({ properties: results, total, message }, message);
  }

  /**
   * Format a property for the search result
   */
  private formatProperty(property: Property): PropertySummary {
    return {
      id: property.id,
      slug: property.slug,
      name: property.name,
      village: property.village?.name || 'Hatteras Island',
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      sleeps: property.sleeps,
      petFriendly: property.petFriendly,
      baseRate: property.baseRate,
      primaryImage: property.primaryImage || property.images?.[0]?.url,
      amenityHighlights: (property.amenities || [])
        .slice(0, 5)
        .map(a => typeof a === 'string' ? a : a.name),
    };
  }
}
