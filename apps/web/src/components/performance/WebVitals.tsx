'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';

interface Metric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
}

/**
 * Web Vitals monitoring component
 * Tracks Core Web Vitals: LCP, FID, CLS, INP, TTFB
 *
 * Target values (Wander-level performance):
 * - LCP: < 2.5s (good)
 * - INP: < 200ms (good)
 * - CLS: < 0.1 (good)
 * - FCP: < 1.8s (good)
 * - TTFB: < 800ms (good)
 */
export function WebVitals() {
  useReportWebVitals((metric: Metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const color = metric.rating === 'good' ? '🟢' : metric.rating === 'needs-improvement' ? '🟡' : '🔴';
      console.log(`${color} ${metric.name}: ${Math.round(metric.value)}ms (${metric.rating})`);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // Send to your analytics service
      sendToAnalytics(metric);
    }
  });

  return null;
}

function sendToAnalytics(metric: Metric) {
  // Send to Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }

  // Or send to custom analytics endpoint
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    page: window.location.pathname,
    navigationType: metric.navigationType,
  });

  // Use sendBeacon for reliable delivery
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/vitals', body);
  }
}

/**
 * Performance monitoring utilities
 */
export const performanceMonitor = {
  // Mark the start of an operation
  mark: (name: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-start`);
    }
  },

  // Measure duration since mark
  measure: (name: string) => {
    if (typeof performance !== 'undefined') {
      try {
        performance.mark(`${name}-end`);
        const measure = performance.measure(name, `${name}-start`, `${name}-end`);
        console.log(`⏱️ ${name}: ${Math.round(measure.duration)}ms`);
        return measure.duration;
      } catch (e) {
        // Mark doesn't exist
        return 0;
      }
    }
    return 0;
  },

  // Get all performance entries
  getEntries: () => {
    if (typeof performance !== 'undefined') {
      return performance.getEntriesByType('measure');
    }
    return [];
  },
};
