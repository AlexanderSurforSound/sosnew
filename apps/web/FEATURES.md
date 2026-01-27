# Feature Module System

This document explains how to create, configure, and manage features in the Surf or Sound application.

## Overview

The feature system allows you to:
- **Toggle features on/off** without code changes
- **Add new features** without breaking existing functionality
- **Self-contained modules** that register themselves
- **Graceful degradation** - disabled features simply don't render

## Quick Start

### Enabling/Disabling Features

Edit `src/lib/features/config.ts`:

```typescript
'chat-widget': {
  enabled: true,  // Set to false to disable
  config: {
    position: 'bottom-right',
    showOnMobile: true,
  },
},
```

### Using Feature Gates in Components

```tsx
import { FeatureGate, useFeature } from '@/features';

// Option 1: FeatureGate component
function MyComponent() {
  return (
    <FeatureGate feature="chat-widget" fallback={<SimpleChatLink />}>
      <ChatWidget />
    </FeatureGate>
  );
}

// Option 2: useFeature hook
function MyComponent() {
  const { enabled, config } = useFeature('chat-widget');

  if (!enabled) return null;

  return <ChatWidget position={config?.position} />;
}
```

## Creating a New Feature

### 1. Create Feature Folder Structure

```
src/features/
  my-feature/
    index.ts           # Feature definition & registration
    components/        # Feature components
      MyWidget.tsx
      MyButton.tsx
    hooks/            # Feature hooks (optional)
      useMyFeature.ts
    utils/            # Feature utilities (optional)
```

### 2. Define the Feature (`index.ts`)

```typescript
import { registerFeature } from '@/lib/features/registry';
import type { FeatureDefinition } from '@/lib/features/types';

// Import components
import { MyWidget } from './components/MyWidget';
import { MyButton } from './components/MyButton';

const myFeature: FeatureDefinition = {
  id: 'my-feature',
  name: 'My Feature',
  description: 'Description of what this feature does',
  category: 'engagement', // core | engagement | ai | social | analytics | experimental
  status: 'stable',       // stable | beta | experimental | deprecated
  version: '1.0.0',
  defaultEnabled: true,

  dependencies: {
    features: [],        // Other features this depends on
    envVars: [],         // Required environment variables
    services: [],        // External services (stripe, sanity, etc.)
  },

  provides: {
    // Components available to other parts of the app
    components: {
      MyWidget,
      MyButton,
    },

    // Overlay components (added to layout automatically)
    overlays: [MyWidget],

    // Navigation items
    navItems: [
      {
        id: 'my-nav-item',
        label: 'My Feature',
        href: '/my-feature',
        position: 'header', // header | footer | mobile | account
        order: 10,
      },
    ],

    // Property page sections
    propertyPageSections: [
      {
        id: 'my-section',
        title: 'My Section',
        component: MySectionComponent,
        position: 'main', // main | sidebar | bottom
        order: 5,
      },
    ],

    // Booking flow steps
    bookingSteps: [
      {
        id: 'my-step',
        label: 'My Step',
        icon: MyIcon,
        component: MyStepComponent,
        order: 3,
        required: false,
      },
    ],

    // Search filters
    searchFilters: [
      {
        id: 'my-filter',
        label: 'My Filter',
        type: 'checkbox',
      },
    ],
  },

  initialize: () => {
    console.log('[My Feature] Initialized');
  },

  cleanup: () => {
    console.log('[My Feature] Cleaned up');
  },
};

// Register when imported
registerFeature(myFeature);

// Export components
export { MyWidget, MyButton };
export default myFeature;
```

### 3. Add Configuration

In `src/lib/features/config.ts`:

```typescript
'my-feature': {
  enabled: true,
  config: {
    // Feature-specific configuration
    option1: 'value',
    option2: true,
  },
},
```

### 4. Import in Features Index

In `src/features/index.ts`:

```typescript
import './my-feature';
```

### 5. Use Feature Components

```tsx
import { useFeature, FeatureGate } from '@/features';
import { MyWidget, MyButton } from '@/features/my-feature';

// The components automatically check if feature is enabled
function Page() {
  return (
    <div>
      <MyWidget />
      <MyButton />
    </div>
  );
}
```

## Feature Categories

| Category | Description | Examples |
|----------|-------------|----------|
| `core` | Essential features | Search, Booking, Auth |
| `engagement` | User engagement | Chat, Reviews, Favorites |
| `ai` | AI-powered | Sandy AI, Recommendations |
| `social` | Social features | Sharing, Referrals |
| `analytics` | Tracking | Page views, Conversions |
| `experimental` | Beta features | AR, Voice |

## Best Practices

### 1. Keep Features Self-Contained

Each feature should work independently. If feature B depends on feature A, declare it in dependencies:

```typescript
dependencies: {
  features: ['feature-a'],
},
```

### 2. Use Feature Gates for Optional Content

```tsx
<FeatureGate feature="reviews" fallback={<ContactUsLink />}>
  <ReviewSection />
</FeatureGate>
```

### 3. Handle Missing Config Gracefully

```tsx
const { config } = useFeature('my-feature');
const position = config?.position ?? 'bottom-right'; // Default value
```

### 4. Test Feature Toggles

Always test that your app works with the feature both enabled and disabled.

### 5. Version Your Features

Update the version when making changes to help track compatibility.

## API Reference

### Hooks

```typescript
// Check if feature is enabled
const { enabled, config } = useFeature('feature-id');

// Get all feature info
const { isEnabled, getConfig, enabledFeatures, allFeatures } = useFeatures();
```

### Components

```tsx
// Conditional rendering
<FeatureGate feature="id" fallback={<Fallback />}>
  <Content />
</FeatureGate>

// Auto-render all overlays
<FeatureOverlays />
```

### HOC

```typescript
// Wrap component with feature check
const MyComponentWithFeature = withFeature(MyComponent, 'feature-id', FallbackComponent);
```

### Registry Functions

```typescript
import {
  registerFeature,
  isEnabled,
  getEnabledFeatures,
  getAllNavItems,
  getPropertyPageSections,
  getBookingSteps,
  getSearchFilters,
} from '@/lib/features';
```

## Troubleshooting

### Feature Not Loading

1. Check that feature is imported in `src/features/index.ts`
2. Check that config exists in `src/lib/features/config.ts`
3. Check browser console for registration logs

### Component Not Rendering

1. Verify feature is enabled in config
2. Check for `useFeature` or `FeatureGate` wrapping
3. Look for dependency issues

### Config Not Applying

1. Make sure you're using `useFeature` hook
2. Check config key names match exactly
