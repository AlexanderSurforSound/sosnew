/**
 * Village Information Tool
 *
 * Provides information about the 7 villages on Hatteras Island.
 *
 * @module agent/tools/village
 */

import { BaseTool } from './base';
import type { ToolDefinition, ToolResult, VillageInfo } from '../types';
import { REAL_PROPERTIES } from '@/lib/realProperties';

/**
 * Input schema for village info
 */
export interface GetVillageInfoInput {
  /** Village name */
  village: string;
}

/**
 * Village data - comprehensive information about each village
 */
const VILLAGES: Record<string, Omit<VillageInfo, 'propertyCount'>> = {
  rodanthe: {
    name: 'Rodanthe',
    slug: 'rodanthe',
    description:
      'The northernmost village on Hatteras Island, Rodanthe is famous for the Chicamacomico Life-Saving Station and its appearance in the movie "Nights in Rodanthe." It offers a quieter, more secluded beach experience with historic charm.',
    highlights: [
      'Historic Chicamacomico Life-Saving Station',
      'Quieter, less crowded beaches',
      'Rodanthe Fishing Pier',
      'Featured in "Nights in Rodanthe" movie',
      'Close to Pea Island Wildlife Refuge',
    ],
    attractions: [
      'Chicamacomico Life-Saving Station Museum',
      'Rodanthe Fishing Pier',
      'Pea Island National Wildlife Refuge (nearby)',
      'Mirlo Beach',
    ],
  },
  waves: {
    name: 'Waves',
    slug: 'waves',
    description:
      'A small, tight-knit community known for world-class surfing and water sports. Waves offers a laid-back atmosphere and is a paradise for surfers, windsurfers, and kiteboarders.',
    highlights: [
      'World-class surfing conditions',
      'Premier windsurfing destination',
      'Excellent kiteboarding',
      'Local surf shops',
      'Relaxed beach town vibe',
    ],
    attractions: [
      'REAL Watersports',
      'Hatteras Island Surf Shop',
      'Kitty Hawk Kites',
      'Local surfing lessons',
    ],
  },
  salvo: {
    name: 'Salvo',
    slug: 'salvo',
    description:
      'The smallest and quietest of the Tri-Villages (Rodanthe, Waves, Salvo), Salvo offers a peaceful retreat with beautiful beaches and easy access to the Pamlico Sound for kayaking and paddleboarding.',
    highlights: [
      'Most peaceful village atmosphere',
      'Excellent sound-side access',
      'Family-friendly environment',
      'Less crowded beaches',
      'Great for paddleboarding and kayaking',
    ],
    attractions: [
      'Pamlico Sound water activities',
      'Quiet beach walks',
      'Day trips to Pea Island',
      'Beach bonfires',
    ],
  },
  avon: {
    name: 'Avon',
    slug: 'avon',
    description:
      'The commercial hub of Hatteras Island, Avon offers the most shopping, dining, and entertainment options while maintaining its beach town charm. Ideal for families who want convenience alongside their beach vacation.',
    highlights: [
      'Most shopping and dining options',
      'Avon Fishing Pier',
      'Kite Point for kiteboarding',
      'Family-friendly amenities',
      'Central island location',
    ],
    attractions: [
      'Avon Fishing Pier',
      'Kite Point (world-famous kiteboarding)',
      'Food Lion shopping center',
      'Multiple restaurants and cafes',
      'Spa of Koru',
    ],
  },
  buxton: {
    name: 'Buxton',
    slug: 'buxton',
    description:
      'Home to the iconic Cape Hatteras Lighthouse, Buxton is the most visited village on the island. It offers excellent surfing at "The Point" and is centrally located, making it perfect for exploring the entire island.',
    highlights: [
      'Cape Hatteras Lighthouse',
      'The Point - famous surf spot',
      'Central island location',
      'Cape Hatteras National Seashore',
      'Canadian Hole windsurfing',
    ],
    attractions: [
      'Cape Hatteras Lighthouse',
      'Buxton Woods Nature Trail',
      'Canadian Hole (windsurfing)',
      'Museum of the Sea',
      'The Point surf break',
    ],
  },
  frisco: {
    name: 'Frisco',
    slug: 'frisco',
    description:
      'A quiet village between Buxton and Hatteras Village, Frisco is known for the Native American Museum and offers a more relaxed pace. Great for families with go-karts and mini golf.',
    highlights: [
      'Frisco Native American Museum',
      'Quiet, relaxed atmosphere',
      'Family entertainment options',
      'Beautiful oceanfront properties',
      'Historic Frisco Pier ruins',
    ],
    attractions: [
      'Frisco Native American Museum',
      'Frisco Woods Campground',
      'Go-kart racing',
      'Mini golf courses',
      'Frisco Pier (ruins)',
    ],
  },
  hatteras: {
    name: 'Hatteras Village',
    slug: 'hatteras',
    description:
      'The southernmost village and a historic fishing community, Hatteras Village is the departure point for the Ocracoke ferry. Known for charter fishing, fresh seafood, and the Graveyard of the Atlantic Museum.',
    highlights: [
      'World-class charter fishing',
      'Fresh seafood restaurants',
      'Ocracoke Island ferry',
      'Historic fishing village charm',
      'Graveyard of the Atlantic Museum',
    ],
    attractions: [
      'Graveyard of the Atlantic Museum',
      'Hatteras Harbor Marina',
      'Charter fishing boats',
      'Ocracoke Island day trips',
      'Fresh seafood markets',
    ],
  },
};

/**
 * Normalize village name for lookup
 */
function normalizeVillageName(village: string): string {
  const normalized = village.toLowerCase().trim();
  if (normalized === 'hatteras village' || normalized === 'hatteras') return 'hatteras';
  return normalized;
}

/**
 * Village Information Tool
 *
 * @example
 * ```typescript
 * const result = await tool.execute({ village: 'Avon' });
 * // Returns comprehensive info about Avon
 * ```
 */
export class VillageTool extends BaseTool<GetVillageInfoInput, VillageInfo> {
  readonly name = 'get_village_info';

  readonly description = 'Get information about villages on Hatteras Island';

  readonly definition: ToolDefinition = {
    name: 'get_village_info',
    description:
      'Get information about a specific village on Hatteras Island including description, highlights, and nearby attractions. Use this when guests ask about villages, areas, or where to stay.',
    input_schema: {
      type: 'object' as const,
      properties: {
        village: {
          type: 'string',
          description: 'Village name (Rodanthe, Waves, Salvo, Avon, Buxton, Frisco, or Hatteras)',
        },
      },
      required: ['village'],
    },
  };

  /**
   * Execute village info lookup
   */
  async execute(input: GetVillageInfoInput): Promise<ToolResult<VillageInfo>> {
    const normalizedVillage = normalizeVillageName(input.village);
    const villageData = VILLAGES[normalizedVillage];

    if (!villageData) {
      const validVillages = Object.values(VILLAGES).map(v => v.name).join(', ');
      return this.error(
        `Village not found: "${input.village}". Valid villages are: ${validVillages}`
      );
    }

    // Count properties in this village
    const propertyCount = REAL_PROPERTIES.filter(p =>
      p.village?.slug === normalizedVillage ||
      p.village?.name.toLowerCase() === normalizedVillage
    ).length;

    const result: VillageInfo = {
      ...villageData,
      propertyCount,
    };

    const message = `${villageData.name} has ${propertyCount} vacation rentals available.`;

    return this.success(result, message);
  }

  /**
   * Get all village names (useful for validation)
   */
  static getVillageNames(): string[] {
    return Object.values(VILLAGES).map(v => v.name);
  }
}
