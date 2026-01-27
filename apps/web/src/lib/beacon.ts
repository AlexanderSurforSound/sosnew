/**
 * BeaconOS Client for Next.js
 *
 * Server-side singleton instance for BeaconOS integration
 */

// Local type definition until beacon-os package is fully built
interface BeaconConfig {
  environment: 'development' | 'staging' | 'production';
  database: {
    sqlServer: string;
    redis?: string;
  };
  integrations: {
    track?: {
      apiUrl: string;
      apiKey: string;
      apiSecret: string;
    };
    sanity?: {
      projectId: string;
      dataset: string;
      token?: string;
    };
    stripe?: {
      secretKey: string;
      webhookSecret: string;
    };
    openai?: {
      apiKey: string;
      model: string;
    };
    anthropic?: {
      apiKey: string;
      model: string;
    };
  };
  features: {
    dynamicPricing: boolean;
    aiConcierge: boolean;
    automatedMessaging: boolean;
    smartLocks: boolean;
    ownerPortal: boolean;
  };
}

// Configuration from environment
const beaconConfig: BeaconConfig = {
  environment:
    (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',

  database: {
    sqlServer: process.env.DATABASE_URL || '',
    redis: process.env.REDIS_URL,
  },

  integrations: {
    track: {
      apiUrl: process.env.TRACK_API_URL || 'https://surforsound.tracksandbox.io/api',
      apiKey: process.env.TRACK_API_KEY || '',
      apiSecret: process.env.TRACK_API_SECRET || '',
    },
    sanity: process.env.SANITY_PROJECT_ID
      ? {
          projectId: process.env.SANITY_PROJECT_ID,
          dataset: process.env.SANITY_DATASET || 'production',
          token: process.env.SANITY_API_TOKEN,
        }
      : undefined,
    stripe: process.env.STRIPE_SECRET_KEY
      ? {
          secretKey: process.env.STRIPE_SECRET_KEY,
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
        }
      : undefined,
    openai: process.env.OPENAI_API_KEY
      ? {
          apiKey: process.env.OPENAI_API_KEY,
          model: 'gpt-4o',
        }
      : undefined,
    anthropic: process.env.ANTHROPIC_API_KEY
      ? {
          apiKey: process.env.ANTHROPIC_API_KEY,
          model: 'claude-sonnet-4-20250514',
        }
      : undefined,
  },

  features: {
    dynamicPricing: true,
    aiConcierge: !!process.env.OPENAI_API_KEY,
    automatedMessaging: true,
    smartLocks: false,
    ownerPortal: true,
  },
};

// Lazy-loaded BeaconOS instance (only loads on server)
let beaconInstance: any = null;

export async function getBeacon() {
  if (typeof window !== 'undefined') {
    throw new Error('BeaconOS can only be used on the server');
  }

  if (!beaconInstance) {
    // BeaconOS package not yet built - return config as placeholder
    // TODO: Enable when beacon-os package is complete
    // const { createOS } = await import('@surf-or-sound/beacon-os');
    // beaconInstance = await createOS(beaconConfig);
    beaconInstance = { config: beaconConfig };
  }

  return beaconInstance;
}

// Export config for type checking
export { beaconConfig };
export type { BeaconConfig };
