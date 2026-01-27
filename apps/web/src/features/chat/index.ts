/**
 * Chat Feature Module
 *
 * This is an example of how to structure a feature module.
 * Each feature is self-contained and can be enabled/disabled
 * without affecting other features.
 */

import { registerFeature } from '@/lib/features/registry';
import type { FeatureDefinition } from '@/lib/features/types';
import { MessageCircle } from 'lucide-react';

// Import feature components
import { ChatWidget } from './components/ChatWidget';
import { ChatButton } from './components/ChatButton';

// Define the feature
const chatFeature: FeatureDefinition = {
  id: 'chat-widget',
  name: 'Sandy AI Chat',
  description: 'AI-powered chat assistant for guest support and questions',
  category: 'engagement',
  status: 'stable',
  version: '1.0.0',
  defaultEnabled: true,

  // This feature doesn't depend on others
  dependencies: {
    features: [],
    envVars: [],
    services: [],
  },

  // What this feature provides to the app
  provides: {
    // Components that can be used elsewhere
    components: {
      ChatWidget,
      ChatButton,
    },

    // Overlay components (automatically added to layout)
    overlays: [ChatWidget],

    // Navigation items
    navItems: [],

    // No property page sections for chat
    propertyPageSections: [],

    // No booking steps
    bookingSteps: [],

    // No search filters
    searchFilters: [],
  },

  // Called when feature is enabled
  initialize: () => {
    console.log('[Chat Feature] Initialized');
  },

  // Called when feature is disabled
  cleanup: () => {
    console.log('[Chat Feature] Cleaned up');
  },
};

// Register the feature when this module is imported
registerFeature(chatFeature);

// Export components for direct use
export { ChatWidget, ChatButton };
export default chatFeature;
