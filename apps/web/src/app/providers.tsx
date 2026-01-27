'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { CompareProvider } from '@/contexts/CompareContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { RecentlyViewedProvider } from '@/contexts/RecentlyViewedContext';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { SignalRProvider } from '@/contexts/SignalRContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <SignalRProvider autoConnect={true}>
          <RecentlyViewedProvider>
            <FavoritesProvider>
              <CompareProvider>{children}</CompareProvider>
            </FavoritesProvider>
          </RecentlyViewedProvider>
        </SignalRProvider>
      </AccessibilityProvider>
    </QueryClientProvider>
  );
}
