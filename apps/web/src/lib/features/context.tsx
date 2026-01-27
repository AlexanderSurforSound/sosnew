'use client';

/**
 * Feature Context & Hooks
 *
 * React integration for the feature system. Use these hooks in components
 * to conditionally render based on feature flags.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isFeatureEnabled, getFeatureConfig } from './config';
import { isEnabled, getEnabledFeatures, getAllFeatures, getOverlayComponents } from './registry';
import type { FeatureDefinition } from './types';

interface FeatureContextValue {
  isEnabled: (featureId: string) => boolean;
  getConfig: <T = Record<string, any>>(featureId: string) => T | undefined;
  enabledFeatures: string[];
  allFeatures: FeatureDefinition[];
}

const FeatureContext = createContext<FeatureContextValue | null>(null);

interface FeatureProviderProps {
  children: ReactNode;
}

export function FeatureProvider({ children }: FeatureProviderProps) {
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([]);
  const [allFeatures, setAllFeatures] = useState<FeatureDefinition[]>([]);

  useEffect(() => {
    // Update state from registry
    setEnabledFeatures(getEnabledFeatures().map((f) => f.id));
    setAllFeatures(getAllFeatures());
  }, []);

  const value: FeatureContextValue = {
    isEnabled: (featureId: string) => isFeatureEnabled(featureId) && isEnabled(featureId),
    getConfig: <T = Record<string, any>>(featureId: string) => getFeatureConfig<T>(featureId),
    enabledFeatures,
    allFeatures,
  };

  return (
    <FeatureContext.Provider value={value}>
      {children}
    </FeatureContext.Provider>
  );
}

/**
 * Hook to access feature context
 */
export function useFeatures(): FeatureContextValue {
  const context = useContext(FeatureContext);
  if (!context) {
    // Return default implementation if not in provider
    return {
      isEnabled: isFeatureEnabled,
      getConfig: getFeatureConfig,
      enabledFeatures: [],
      allFeatures: [],
    };
  }
  return context;
}

/**
 * Hook to check if a specific feature is enabled
 */
export function useFeature(featureId: string): {
  enabled: boolean;
  config: Record<string, any> | undefined;
} {
  const { isEnabled, getConfig } = useFeatures();
  return {
    enabled: isEnabled(featureId),
    config: getConfig(featureId),
  };
}

/**
 * Component that only renders children if feature is enabled
 */
interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  const { enabled } = useFeature(feature);

  if (!enabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component that renders all registered overlay components
 * Add this to your layout to automatically include feature overlays
 */
export function FeatureOverlays() {
  const overlays = getOverlayComponents();

  return (
    <>
      {overlays.map((Overlay, index) => (
        <Overlay key={index} />
      ))}
    </>
  );
}

/**
 * HOC to wrap a component with feature check
 */
export function withFeature<P extends object>(
  Component: React.ComponentType<P>,
  featureId: string,
  Fallback?: React.ComponentType<P>
): React.ComponentType<P> {
  return function WrappedComponent(props: P) {
    const { enabled } = useFeature(featureId);

    if (!enabled) {
      return Fallback ? <Fallback {...props} /> : null;
    }

    return <Component {...props} />;
  };
}
