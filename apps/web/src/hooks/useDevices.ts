'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSignalR } from '@/contexts/SignalRContext';
import { signalRClient, DeviceStatusUpdate } from '@/lib/signalr';
import { api } from '@/lib/api';
import type { Device } from '@/types';

interface UseDevicesOptions {
  reservationId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseDevicesReturn {
  devices: Device[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  unlockDevice: (deviceId: string) => Promise<void>;
  lockDevice: (deviceId: string) => Promise<void>;
  setThermostat: (deviceId: string, temperature: number) => Promise<void>;
  isDeviceLoading: (deviceId: string) => boolean;
}

export function useDevices({
  reservationId,
  autoRefresh = true,
  refreshInterval = 30000,
}: UseDevicesOptions): UseDevicesReturn {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingDevices, setLoadingDevices] = useState<Set<string>>(new Set());
  const { isConnected, joinReservationGroup, leaveReservationGroup } = useSignalR();

  // Fetch devices from API
  const fetchDevices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getReservationDevices(reservationId);
      setDevices(data);
    } catch (err) {
      setError('Failed to load devices');
      console.error('Error fetching devices:', err);
    } finally {
      setIsLoading(false);
    }
  }, [reservationId]);

  // Handle real-time device status updates
  const handleDeviceUpdate = useCallback((update: DeviceStatusUpdate) => {
    setDevices(prev =>
      prev.map(device =>
        device.id === update.deviceId
          ? {
              ...device,
              status: update.status as Device['status'],
              currentTemp: update.temperature,
            }
          : device
      )
    );
  }, []);

  // Subscribe to device updates
  useEffect(() => {
    const unsubscribe = signalRClient.onDeviceStatus(handleDeviceUpdate);
    return unsubscribe;
  }, [handleDeviceUpdate]);

  // Join reservation group for targeted updates
  useEffect(() => {
    if (isConnected && reservationId) {
      joinReservationGroup(reservationId);
      return () => {
        leaveReservationGroup(reservationId);
      };
    }
  }, [isConnected, reservationId, joinReservationGroup, leaveReservationGroup]);

  // Initial fetch
  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh && !isConnected) {
      // Only auto-refresh if not connected to SignalR (fallback)
      const interval = setInterval(fetchDevices, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, isConnected, refreshInterval, fetchDevices]);

  // Device actions
  const setDeviceLoading = useCallback((deviceId: string, loading: boolean) => {
    setLoadingDevices(prev => {
      const next = new Set(prev);
      if (loading) {
        next.add(deviceId);
      } else {
        next.delete(deviceId);
      }
      return next;
    });
  }, []);

  const unlockDevice = useCallback(async (deviceId: string) => {
    try {
      setDeviceLoading(deviceId, true);
      await api.unlockDevice(deviceId);
      // Optimistically update - device is still online after unlock
      setDevices(prev =>
        prev.map(d =>
          d.id === deviceId ? { ...d, status: 'online' as const } : d
        )
      );
    } catch (err) {
      console.error('Failed to unlock device:', err);
      throw err;
    } finally {
      setDeviceLoading(deviceId, false);
    }
  }, [setDeviceLoading]);

  const lockDevice = useCallback(async (deviceId: string) => {
    try {
      setDeviceLoading(deviceId, true);
      await api.lockDevice(deviceId);
      // Optimistically update - device is still online after lock
      setDevices(prev =>
        prev.map(d =>
          d.id === deviceId ? { ...d, status: 'online' as const } : d
        )
      );
    } catch (err) {
      console.error('Failed to lock device:', err);
      throw err;
    } finally {
      setDeviceLoading(deviceId, false);
    }
  }, [setDeviceLoading]);

  const setThermostat = useCallback(async (deviceId: string, temperature: number) => {
    try {
      setDeviceLoading(deviceId, true);
      await api.setThermostat(deviceId, temperature);
      // Optimistically update
      setDevices(prev =>
        prev.map(d =>
          d.id === deviceId ? { ...d, targetTemp: temperature } : d
        )
      );
    } catch (err) {
      console.error('Failed to set thermostat:', err);
      throw err;
    } finally {
      setDeviceLoading(deviceId, false);
    }
  }, [setDeviceLoading]);

  const isDeviceLoading = useCallback(
    (deviceId: string) => loadingDevices.has(deviceId),
    [loadingDevices]
  );

  return {
    devices,
    isLoading,
    error,
    refresh: fetchDevices,
    unlockDevice,
    lockDevice,
    setThermostat,
    isDeviceLoading,
  };
}
