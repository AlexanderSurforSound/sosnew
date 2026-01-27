# Surf or Sound

Premier vacation rental platform for Hatteras Island, NC - managing 600+ properties.

## Project Structure

```
surf-or-sound/
├── apps/
│   ├── web/                    # Next.js 14 (App Router) - Main website
│   ├── guest-app/              # React Native + Expo - Guest mobile app
│   ├── owner-app/              # React Native + Expo - Owner mobile app
│   ├── admin/                  # Next.js - Internal admin dashboard
│   └── sanity/                 # Sanity Studio - CMS
├── packages/
│   ├── beacon-os/              # BeaconOS - Vacation rental operating system
│   ├── ui/                     # Shared React components
│   ├── api-client/             # Typed API client (generated)
│   ├── types/                  # Shared TypeScript types
│   └── utils/                  # Shared utilities
├── services/
│   └── api/                    # C# .NET 8 API
├── infrastructure/
│   ├── terraform/              # Azure infrastructure
│   └── scripts/                # Deployment scripts
└── docs/
    └── api/                    # OpenAPI specs
```

## Tech Stack

- **Frontend:** Next.js 14, React Native/Expo, TailwindCSS
- **Backend:** C# .NET 8, Entity Framework Core
- **Database:** Azure SQL, Redis (optional)
- **CMS:** Sanity
- **Integrations:** Track PMS, RemoteLock, Stripe, Twilio, SendGrid
- **AI:** OpenAI GPT-4o, Anthropic Claude

---

## BeaconOS

BeaconOS is our internal vacation rental operating system that powers automation, pricing, and guest communication.

### Architecture

```
BeaconOS
├── Core
│   ├── EventBus          # Pub/sub event system
│   ├── QueueManager      # Background job processing (BullMQ/Redis)
│   └── Types             # Core entity types
├── Modules
│   ├── Pricing           # Dynamic pricing engine
│   │   ├── Seasonal      # Season-based pricing
│   │   ├── Occupancy     # Demand-based adjustments
│   │   └── Dynamic       # AI-powered optimization
│   ├── Messaging         # Guest communication
│   │   ├── Hub           # Multi-channel messaging
│   │   ├── Concierge     # AI concierge (Sandy)
│   │   └── Templates     # Message templates
│   └── Geofencing        # Location-based automation (planned)
└── Integrations
    ├── Track PMS         # Property management
    ├── RemoteLock        # Smart locks
    ├── Stripe            # Payments
    └── Twilio/SendGrid   # SMS/Email
```

### Event Types

BeaconOS uses an event-driven architecture:

| Event | Description |
|-------|-------------|
| `reservation.created` | New booking made |
| `reservation.confirmed` | Booking confirmed |
| `reservation.checkin` | Guest checked in |
| `reservation.checkout` | Guest checked out |
| `housekeeping.scheduled` | Cleaning scheduled |
| `housekeeping.completed` | Cleaning finished |
| `message.received` | Guest message received |
| `message.ai_response` | AI responded to guest |

### AI Concierge (Sandy)

Sandy is our AI-powered guest concierge that handles:
- Guest inquiries via chat
- Local recommendations (restaurants, activities)
- Property questions
- Emergency detection and escalation
- Multi-language support

```typescript
// Example: Send message to Sandy
const response = await beacon.messaging.concierge.chat({
  guestId: 'guest-123',
  message: 'What restaurants are near my rental?',
  context: { propertyId: 'prop-456' }
});
```

### Usage

```typescript
import { createOS } from '@surf-or-sound/beacon-os';

const beacon = await createOS({
  environment: 'production',
  database: { sqlServer: process.env.DATABASE_URL },
  integrations: {
    track: { apiUrl, apiKey, apiSecret },
    openai: { apiKey: process.env.OPENAI_API_KEY }
  },
  features: {
    dynamicPricing: true,
    aiConcierge: true,
    automatedMessaging: true
  }
});

// Listen for events
beacon.on('reservation.created', async (event) => {
  await beacon.messaging.sendConfirmation(event.payload.id);
});
```

---

## Mobile Apps

### Guest App (`apps/guest-app`)

React Native app for vacation rental guests.

#### Features

- **Trip Management** - View upcoming, current, and past reservations
- **Smart Home Control** - Lock/unlock doors, adjust thermostat
- **Property Details** - Photos, amenities, check-in instructions
- **Local Explore** - Discover restaurants, activities, attractions
- **AI Concierge** - Chat with Sandy for recommendations
- **Push Notifications** - Arrival alerts, check-in reminders

#### Tech Stack

- Expo SDK 50
- Expo Router (file-based navigation)
- React Query (TanStack) for data fetching
- NativeWind (Tailwind for React Native)
- Expo SecureStore for auth tokens

#### Running the App

```bash
cd apps/guest-app

# Install dependencies
npm install

# Start Expo dev server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

#### Project Structure

```
guest-app/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home - featured properties
│   │   ├── explore.tsx    # Discover local attractions
│   │   ├── trips.tsx      # My reservations
│   │   └── account.tsx    # Profile & settings
│   ├── trip/[id].tsx      # Trip detail + smart home
│   └── _layout.tsx        # Root layout
├── lib/
│   └── api.ts             # API client
├── hooks/
│   └── useAuth.ts         # Authentication hook
└── services/              # (planned)
    ├── geofencing/        # Location services
    └── notifications/     # Push notifications
```

### Owner App (`apps/owner-app`)

React Native app for property owners.

#### Features

- **Dashboard** - Revenue, occupancy, upcoming bookings
- **Calendar** - Availability management
- **Analytics** - Performance metrics, trends
- **Notifications** - Booking alerts, maintenance requests
- **Settings** - Payout preferences, property settings

#### Running the App

```bash
cd apps/owner-app
npm install
npx expo start
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- .NET 8 SDK
- Azure CLI (for deployment)
- Expo CLI (`npm install -g expo-cli`)

### Installation

```bash
# Install dependencies
npm install

# Start all services in development
npm run dev

# Start specific app
npm run dev --filter=web
npm run dev --filter=guest-app
```

### Running the API

```bash
cd services/api/SurfOrSound.API
dotnet run
```

## Environment Variables

Copy `.env.example` to `.env.local` in each app and fill in the values.

### Web App (`apps/web/.env.local`)

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
TRACK_API_URL=https://api.trackhs.com/v1
TRACK_API_KEY=your-key
TRACK_API_SECRET=your-secret
SANITY_PROJECT_ID=your-project
SANITY_DATASET=production
OPENAI_API_KEY=sk-...
```

### Mobile Apps

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps in development |
| `npm run build` | Build all apps |
| `npm run lint` | Lint all apps |
| `npm run test` | Run all tests |
| `npm run clean` | Clean all build artifacts |

## Data Sources

- **Track PMS** - Reservations, availability, rates, guest data, payments
- **Sanity CMS** - Content, property descriptions, images, marketing copy
- **Azure SQL** - Platform data (loyalty, marketplace, devices, analytics)

## Deployment

### Web (Vercel)

The web app deploys automatically to Vercel on push to `main`.

### Mobile Apps

```bash
# Build for iOS
cd apps/guest-app
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit
```

### API (.NET)

```bash
cd services/api
dotnet publish -c Release
# Deploy to Azure App Service
```
