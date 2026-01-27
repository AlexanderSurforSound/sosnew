/**
 * GraphQL Resolvers
 *
 * Combines data from Track PMS, SQL Server, and Sanity
 */

import * as Track from './services/track';

// Cache for nodes (villages don't change often)
let nodesCache: Map<number, any> | null = null;
let nodesCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getNodesMap(): Promise<Map<number, any>> {
  const now = Date.now();
  if (nodesCache && now - nodesCacheTime < CACHE_TTL) {
    return nodesCache;
  }

  const nodes = await Track.getNodes();
  nodesCache = new Map(nodes.map((n) => [n.id, n]));
  nodesCacheTime = now;
  return nodesCache;
}

export const resolvers = {
  Query: {
    // ==========================================
    // PROPERTIES
    // ==========================================

    property: async (_: any, args: { id?: string; slug?: string; trackId?: string }) => {
      if (args.trackId) {
        const unit = await Track.getUnit(args.trackId);
        if (!unit) return null;

        const nodesMap = await getNodesMap();
        const images = await Track.getUnitImages(unit.id, 10);
        return Track.mapTrackUnitToProperty(unit, nodesMap.get(unit.nodeId), images);
      }

      // For slug/id lookup, we need to search
      const { units } = await Track.getUnits(1, 1000);
      const nodesMap = await getNodesMap();

      const unit = units.find((u) => {
        if (args.id && `prop-${u.id}` === args.id) return true;
        if (args.slug) {
          const slug = Track.mapTrackUnitToProperty(u, nodesMap.get(u.nodeId)).slug;
          return slug === args.slug;
        }
        return false;
      });

      if (!unit) return null;

      const images = await Track.getUnitImages(unit.id, 10);
      return Track.mapTrackUnitToProperty(unit, nodesMap.get(unit.nodeId), images);
    },

    properties: async (
      _: any,
      args: {
        page?: number;
        pageSize?: number;
        village?: string;
        featured?: boolean;
        petFriendly?: boolean;
      }
    ) => {
      const page = args.page || 1;
      const pageSize = args.pageSize || 20;

      const { units, total } = await Track.getUnits(page, pageSize);
      const nodesMap = await getNodesMap();

      let properties = units.map((u) => Track.mapTrackUnitToProperty(u, nodesMap.get(u.nodeId)));

      // Apply filters
      if (args.village) {
        properties = properties.filter((p) => p.village.slug === args.village);
      }
      if (args.petFriendly) {
        properties = properties.filter((p) => p.petFriendly);
      }

      return {
        properties,
        totalCount: total,
        page,
        pageSize,
        hasNextPage: page * pageSize < total,
        facets: null, // TODO: Implement facets
      };
    },

    searchProperties: async (
      _: any,
      args: {
        input: {
          query?: string;
          village?: string;
          guests?: number;
          bedrooms?: number;
          bedroomsMin?: number;
          bedroomsMax?: number;
          priceMin?: number;
          priceMax?: number;
          petFriendly?: boolean;
          amenities?: string[];
          sortBy?: string;
          sortOrder?: string;
        };
        page?: number;
        pageSize?: number;
      }
    ) => {
      const page = args.page || 1;
      const pageSize = args.pageSize || 20;
      const input = args.input;

      // Build Track API search params
      const searchParams: any = {};
      if (input.bedrooms) searchParams.bedrooms = input.bedrooms;
      if (input.guests) searchParams.maxOccupancy = input.guests;
      if (input.petFriendly) searchParams.petsFriendly = true;

      const { units, total } = await Track.searchUnits({
        ...searchParams,
        page,
        size: pageSize,
      });

      const nodesMap = await getNodesMap();
      let properties = units.map((u) => Track.mapTrackUnitToProperty(u, nodesMap.get(u.nodeId)));

      // Additional filtering not supported by Track API
      if (input.village) {
        properties = properties.filter((p) => p.village.slug === input.village);
      }
      if (input.bedroomsMin) {
        properties = properties.filter((p) => p.bedrooms >= input.bedroomsMin!);
      }
      if (input.bedroomsMax) {
        properties = properties.filter((p) => p.bedrooms <= input.bedroomsMax!);
      }
      if (input.query) {
        const q = input.query.toLowerCase();
        properties = properties.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.headline?.toLowerCase().includes(q) ||
            p.village.name.toLowerCase().includes(q)
        );
      }

      // Sorting
      if (input.sortBy) {
        const order = input.sortOrder === 'DESC' ? -1 : 1;
        properties.sort((a, b) => {
          switch (input.sortBy) {
            case 'PRICE':
              return ((a.baseRate || 0) - (b.baseRate || 0)) * order;
            case 'BEDROOMS':
              return (a.bedrooms - b.bedrooms) * order;
            case 'NAME':
              return a.name.localeCompare(b.name) * order;
            default:
              return 0;
          }
        });
      }

      // Calculate facets
      const facets = calculateFacets(properties);

      return {
        properties,
        totalCount: total,
        page,
        pageSize,
        hasNextPage: page * pageSize < total,
        facets,
      };
    },

    featuredProperties: async (_: any, args: { limit?: number }) => {
      const { units } = await Track.getUnits(1, args.limit || 10);
      const nodesMap = await getNodesMap();

      // For now, return first N properties as "featured"
      // TODO: Mark featured in database or Sanity
      return units.map((u) => Track.mapTrackUnitToProperty(u, nodesMap.get(u.nodeId)));
    },

    // ==========================================
    // VILLAGES
    // ==========================================

    villages: async () => {
      const nodes = await Track.getNodes();
      return nodes.map((n) => ({
        name: n.name,
        slug: n.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, ''),
        description: n.description,
      }));
    },

    village: async (_: any, args: { slug: string }) => {
      const nodes = await Track.getNodes();
      const node = nodes.find((n) => {
        const slug = n.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        return slug === args.slug;
      });

      if (!node) return null;

      return {
        name: node.name,
        slug: args.slug,
        description: node.description,
      };
    },

    // ==========================================
    // AVAILABILITY & RATES
    // ==========================================

    propertyAvailability: async (
      _: any,
      args: { propertyId: string; startDate: string; endDate: string }
    ) => {
      const trackId = args.propertyId.replace('prop-', '');
      const availability = await Track.getUnitAvailability(trackId, args.startDate, args.endDate);

      return availability.map((a) => ({
        date: a.date,
        available: a.available,
        rate: a.rate,
        minimumStay: a.minimumStay,
        checkInAllowed: a.checkInAllowed ?? true,
        checkOutAllowed: a.checkOutAllowed ?? true,
      }));
    },

    propertyRates: async (
      _: any,
      args: { propertyId: string; checkIn: string; checkOut: string; guests?: number }
    ) => {
      const trackId = args.propertyId.replace('prop-', '');
      const rates = await Track.getUnitRates(trackId, args.checkIn, args.checkOut, args.guests);

      if (!rates) return null;

      return {
        baseRate: rates.baseRate,
        totalRate: rates.totalRate,
        taxes: rates.taxes,
        fees: rates.fees.map((f) => ({
          name: f.name,
          amount: f.amount,
          type: f.type.toUpperCase(),
        })),
        minimumStay: rates.minimumStay,
      };
    },

    // ==========================================
    // GUEST/MEMBER (Placeholder - connect to SQL Server)
    // ==========================================

    me: async (_: any, __: any, context: any) => {
      // TODO: Get from session/auth context
      // const userId = context.userId;
      // const guest = await db.guests.findUnique({ where: { id: userId } });
      return null;
    },

    myReservations: async (_: any, __: any, context: any) => {
      // TODO: Get from database
      return [];
    },
  },

  // ==========================================
  // FIELD RESOLVERS
  // ==========================================

  Property: {
    availability: async (parent: any, args: { startDate: string; endDate: string }) => {
      const trackId = parent.trackId;
      const availability = await Track.getUnitAvailability(trackId, args.startDate, args.endDate);

      return availability.map((a) => ({
        date: a.date,
        available: a.available,
        rate: a.rate,
        minimumStay: a.minimumStay,
        checkInAllowed: a.checkInAllowed ?? true,
        checkOutAllowed: a.checkOutAllowed ?? true,
      }));
    },

    rates: async (parent: any, args: { checkIn?: string; checkOut?: string }) => {
      if (!args.checkIn || !args.checkOut) return null;

      const rates = await Track.getUnitRates(parent.trackId, args.checkIn, args.checkOut);
      if (!rates) return null;

      return {
        baseRate: rates.baseRate,
        totalRate: rates.totalRate,
        taxes: rates.taxes,
        fees: rates.fees,
        minimumStay: rates.minimumStay,
      };
    },

    reviews: async (parent: any, args: { limit?: number }) => {
      // TODO: Fetch from SQL Server
      return [];
    },

    averageRating: async (parent: any) => {
      // TODO: Calculate from SQL Server
      return 4.8;
    },

    reviewCount: async (parent: any) => {
      // TODO: Get from SQL Server
      return 0;
    },

    similarProperties: async (parent: any, args: { limit?: number }) => {
      const { units } = await Track.searchUnits({
        bedrooms: parent.bedrooms,
        size: (args.limit || 4) + 1,
      });

      const nodesMap = await getNodesMap();

      return units
        .filter((u) => String(u.id) !== parent.trackId)
        .slice(0, args.limit || 4)
        .map((u) => Track.mapTrackUnitToProperty(u, nodesMap.get(u.nodeId)));
    },
  },

  Mutation: {
    // TODO: Implement mutations
    updateProfile: async () => {
      throw new Error('Not implemented');
    },
    addFavorite: async () => {
      throw new Error('Not implemented');
    },
    removeFavorite: async () => {
      throw new Error('Not implemented');
    },
    createReservation: async () => {
      throw new Error('Not implemented');
    },
    cancelReservation: async () => {
      throw new Error('Not implemented');
    },
    submitReview: async () => {
      throw new Error('Not implemented');
    },
    markReviewHelpful: async () => {
      throw new Error('Not implemented');
    },
    submitInquiry: async () => {
      throw new Error('Not implemented');
    },
  },
};

// ==========================================
// HELPERS
// ==========================================

function calculateFacets(properties: any[]) {
  const villages: Record<string, number> = {};
  const bedrooms: Record<string, number> = {};
  const amenities: Record<string, number> = {};

  properties.forEach((p) => {
    // Villages
    villages[p.village.name] = (villages[p.village.name] || 0) + 1;

    // Bedrooms
    bedrooms[p.bedrooms] = (bedrooms[p.bedrooms] || 0) + 1;

    // Amenities
    p.amenities?.forEach((a: any) => {
      amenities[a.name] = (amenities[a.name] || 0) + 1;
    });
  });

  return {
    villages: Object.entries(villages).map(([value, count]) => ({ value, count })),
    bedrooms: Object.entries(bedrooms)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([value, count]) => ({ value, count })),
    amenities: Object.entries(amenities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([value, count]) => ({ value, count })),
    priceRanges: [], // TODO: Calculate price ranges
  };
}
