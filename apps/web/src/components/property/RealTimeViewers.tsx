'use client';

import { useEffect, useState } from 'react';
import { Eye, Users } from 'lucide-react';
import { signalRClient, ViewerUpdate } from '@/lib/signalr';
import { cn } from '@/lib/utils';

interface RealTimeViewersProps {
  propertyId: string;
  className?: string;
  showLabel?: boolean;
  variant?: 'badge' | 'inline' | 'minimal';
}

/**
 * Real-time viewer count component
 * Shows how many people are currently viewing this property
 */
export function RealTimeViewers({
  propertyId,
  className,
  showLabel = true,
  variant = 'badge',
}: RealTimeViewersProps) {
  const [viewerCount, setViewerCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Subscribe to viewer updates
    const unsubscribeViewers = signalRClient.onViewerCountChange((update: ViewerUpdate) => {
      if (update.propertyId === propertyId) {
        setViewerCount(update.viewerCount);
      }
    });

    // Subscribe to connection state
    const unsubscribeConnection = signalRClient.onConnectionStateChange((state) => {
      setIsConnected(state === 'connected');
    });

    // Connect and watch this property
    const connect = async () => {
      try {
        await signalRClient.connect();
        await signalRClient.watchProperty(propertyId);
      } catch (err) {
        console.warn('Failed to connect to SignalR:', err);
      }
    };

    connect();

    return () => {
      unsubscribeViewers();
      unsubscribeConnection();
      signalRClient.unwatchProperty(propertyId).catch(() => {});
    };
  }, [propertyId]);

  // Don't show if no viewers or not connected
  if (!isConnected || viewerCount <= 1) {
    return null;
  }

  const viewerText = viewerCount === 2
    ? '1 other person viewing'
    : `${viewerCount - 1} others viewing`;

  if (variant === 'minimal') {
    return (
      <span className={cn('text-sm text-gray-600 flex items-center gap-1', className)}>
        <Eye className="w-4 h-4" />
        {viewerCount - 1}
      </span>
    );
  }

  if (variant === 'inline') {
    return (
      <span className={cn('text-sm text-amber-700 flex items-center gap-1.5', className)}>
        <Eye className="w-4 h-4" />
        {viewerText}
      </span>
    );
  }

  // Badge variant (default)
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-sm font-medium text-amber-800',
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
      </span>
      <Users className="w-4 h-4" />
      {showLabel && <span>{viewerText}</span>}
    </div>
  );
}

/**
 * Urgency indicator that shows when many people are viewing
 */
export function PropertyUrgencyIndicator({
  propertyId,
  className,
}: {
  propertyId: string;
  className?: string;
}) {
  const [viewerCount, setViewerCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const unsubscribeViewers = signalRClient.onViewerCountChange((update: ViewerUpdate) => {
      if (update.propertyId === propertyId) {
        setViewerCount(update.viewerCount);
      }
    });

    const unsubscribeConnection = signalRClient.onConnectionStateChange((state) => {
      setIsConnected(state === 'connected');
    });

    const connect = async () => {
      try {
        await signalRClient.connect();
        await signalRClient.watchProperty(propertyId);
      } catch (err) {
        console.warn('Failed to connect to SignalR:', err);
      }
    };

    connect();

    return () => {
      unsubscribeViewers();
      unsubscribeConnection();
      signalRClient.unwatchProperty(propertyId).catch(() => {});
    };
  }, [propertyId]);

  // Only show when there's significant interest
  if (!isConnected || viewerCount < 3) {
    return null;
  }

  const urgencyLevel =
    viewerCount >= 10 ? 'high' :
    viewerCount >= 5 ? 'medium' : 'low';

  const messages = {
    high: 'Very high demand - book now!',
    medium: 'Popular property today',
    low: 'Getting attention',
  };

  const colors = {
    high: 'bg-red-50 border-red-200 text-red-800',
    medium: 'bg-orange-50 border-orange-200 text-orange-800',
    low: 'bg-amber-50 border-amber-200 text-amber-800',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-3 rounded-lg border',
        colors[urgencyLevel],
        className
      )}
    >
      <span className="relative flex h-3 w-3">
        <span className={cn(
          'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
          urgencyLevel === 'high' ? 'bg-red-400' :
          urgencyLevel === 'medium' ? 'bg-orange-400' : 'bg-amber-400'
        )} />
        <span className={cn(
          'relative inline-flex rounded-full h-3 w-3',
          urgencyLevel === 'high' ? 'bg-red-500' :
          urgencyLevel === 'medium' ? 'bg-orange-500' : 'bg-amber-500'
        )} />
      </span>
      <div className="flex-1">
        <p className="font-medium text-sm">{messages[urgencyLevel]}</p>
        <p className="text-xs opacity-80">
          {viewerCount} people viewing this property right now
        </p>
      </div>
    </div>
  );
}
