'use client';

import { useState } from 'react';
import AccessibilityPanel, { AccessibilityButton } from './AccessibilityPanel';

/**
 * Accessibility Controls - Floating button and settings panel
 * This component provides users with access to customize their experience
 */
export default function AccessibilityControls() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <>
      <AccessibilityButton onClick={() => setIsPanelOpen(true)} />
      <AccessibilityPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </>
  );
}
