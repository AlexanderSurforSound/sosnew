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
- **Database:** Azure SQL
- **CMS:** Sanity
- **Integrations:** Track PMS, Track Payments, Smart Home APIs

## Getting Started

### Prerequisites

- Node.js 18+
- .NET 8 SDK
- Azure CLI (for deployment)

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
