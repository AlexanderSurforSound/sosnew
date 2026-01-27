# CMS Gateway

A provider-agnostic CMS abstraction layer that allows you to switch CMS providers without changing application code.

## Quick Start

```typescript
import { cms } from '@/lib/cms';

// Get featured properties
const featured = await cms.getFeaturedProperties(6);

// Get a specific property
const property = await cms.getProperty('oceanfront-paradise');

// Get all villages
const villages = await cms.getVillages();

// Search across content
const results = await cms.search('beach house', ['property', 'blogPost']);
```

## Switching CMS Providers

### Step 1: Set Environment Variable

```bash
# .env.local

# Choose your provider
CMS_PROVIDER=sanity  # or: contentful, strapi, prismic
```

### Step 2: Configure Provider Credentials

**Sanity:**
```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-token  # For preview mode
```

**Contentful:**
```bash
CONTENTFUL_SPACE_ID=your-space-id
CONTENTFUL_ACCESS_TOKEN=your-access-token
CONTENTFUL_PREVIEW_TOKEN=your-preview-token  # Optional
```

**Strapi:**
```bash
STRAPI_API_URL=http://localhost:1337
STRAPI_API_TOKEN=your-api-token
```

### Step 3: That's It!

No code changes needed. The gateway automatically uses the configured provider.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Your Application                      │
│                                                         │
│   import { cms } from '@/lib/cms';                      │
│   const property = await cms.getProperty('slug');       │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                     CMS Gateway                          │
│                                                         │
│   • Unified interface (CMSAdapter)                      │
│   • Type-safe responses                                 │
│   • Automatic provider selection                        │
│   • Preview mode support                                │
└──────────────────────────┬──────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Sanity Adapter  │ │Contentful Adapter│ │ Strapi Adapter │
│                 │ │                 │ │                 │
│ • GROQ queries  │ │ • GraphQL/REST  │ │ • REST API     │
│ • Image URLs    │ │ • Asset URLs    │ │ • Media URLs   │
│ • Preview       │ │ • Preview       │ │ • Preview      │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         ▼                   ▼                   ▼
    [Sanity.io]        [Contentful]         [Strapi]
```

## Adding a New CMS Provider

1. Create a new adapter in `/lib/cms/adapters/`:

```typescript
// adapters/strapi.ts
import type { CMSAdapter } from '../adapter';

export class StrapiAdapter implements CMSAdapter {
  readonly name = 'strapi';
  readonly version = '1.0.0';

  // Implement all interface methods...
  async getProperty(slug: string) {
    // Strapi-specific implementation
  }

  // ... etc
}
```

2. Register it in `/lib/cms/index.ts`:

```typescript
import { StrapiAdapter } from './adapters/strapi';

function createAdapter(config: CMSConfig): CMSAdapter {
  switch (config.provider) {
    case 'strapi':
      return new StrapiAdapter(config);
    // ...
  }
}
```

3. Add environment variables for the new provider.

## Type Safety

All content is transformed to CMS-agnostic types:

```typescript
// Your code always works with these types
interface CMSProperty {
  _id: string;
  name: string;
  slug: string;
  images?: CMSImage[];
  // ... consistent structure regardless of CMS
}
```

## Preview Mode

Enable draft content preview:

```typescript
// In your preview API route
import { cms } from '@/lib/cms';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  await cms.enablePreview(token);

  // Now all queries return draft content
  const property = await cms.getProperty('my-draft');
}
```

## Best Practices

1. **Never import adapters directly** - Always use the `cms` export
2. **Handle null returns** - Content may not exist
3. **Use the types** - Import from `@/lib/cms` for type safety
4. **Cache appropriately** - Use Next.js caching features

```typescript
import { cms, type CMSProperty } from '@/lib/cms';

// Good
const property = await cms.getProperty(slug);
if (!property) notFound();

// Bad - don't import adapter directly
import { SanityAdapter } from '@/lib/cms/adapters/sanity';
```
