'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Unlock,
  Thermometer,
  Wifi,
  Loader2,
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Home,
  Zap,
  RefreshCw,
  Shield,
  Key,
  Smartphone,
  Lightbulb,
} from 'lucide-react';
import { useDevices } from '@/hooks/useDevices';

interface SmartHomeControlsProps {
  reservationId: string;
  checkInDate: string;
  checkOutDate: string;
}

export function SmartHomeControls({ reservationId, checkInDate, checkOutDate }: SmartHomeControlsProps) {
  const {
    devices,
    isLoading,
    error,
    refresh,
    unlockDevice,
    lockDevice,
    setThermostat,
    isDeviceLoading,
  } = useDevices({ reservationId, autoRefresh: true, refreshInterval: 30000 });

  const [expandedDevice, setExpandedDevice] = useState<string | null>(null);

  // Check if we're within the valid access period
  const now = new Date();
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const isAccessible = now >= checkIn && now <= checkOut;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-ocean-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading smart home devices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="font-semibold text-gray-900 mb-2">Unable to Load Devices</h3>
        <p className="text-gray-600 mb-4">There was a problem connecting to the smart home system.</p>
        <button
          onClick={refresh}
          className="inline-flex items-center gap-2 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (!devices || devices.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="font-semibold text-gray-900 mb-2">No Smart Devices</h3>
        <p className="text-gray-600">This property doesn't have smart home devices configured.</p>
      </div>
    );
  }

  if (!isAccessible) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center mb-6">
          <Shield className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Access Not Yet Available</h3>
          <p className="text-gray-600">
            Smart home controls will be available starting on your check-in date.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Check-in: {new Date(checkInDate).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Preview of devices */}
        <div className="border-t pt-6">
          <p className="text-sm text-gray-500 mb-4">Devices you'll be able to control:</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {devices.map((device) => (
              <div
                key={device.id}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg opacity-60"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  {getDeviceIcon(device.deviceType)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{device.name}</p>
                  <p className="text-sm text-gray-500">{device.deviceType}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-ocean-500 to-ocean-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Smart Home Controls</h2>
              <p className="text-sm text-gray-500">{devices.length} devices connected</p>
            </div>
          </div>
          <button
            onClick={refresh}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh device status"
          >
            <RefreshCw className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Security Notice */}
        <div className="bg-green-50 rounded-lg p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-800">Your access is active</p>
            <p className="text-sm text-green-700">
              Device controls are available until {new Date(checkOutDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
              })} at 10:00 AM
            </p>
          </div>
        </div>
      </div>

      {/* Device Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {devices.map((device) => (
          <DeviceCard
            key={device.id}
            device={device}
            isExpanded={expandedDevice === device.id}
            onToggleExpand={() => setExpandedDevice(expandedDevice === device.id ? null : device.id)}
            isLoading={isDeviceLoading(device.id)}
            onLock={() => lockDevice(device.id)}
            onUnlock={() => unlockDevice(device.id)}
            onSetTemperature={(temp) => setThermostat(device.id, temp)}
          />
        ))}
      </div>

      {/* Help Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-ocean-600" />
          Need Help?
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-1">Lock Trouble?</h4>
            <p className="text-sm text-gray-600">
              If the lock doesn't respond, wait 30 seconds and try again. Make sure you're within range of the property.
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-1">Thermostat Issues?</h4>
            <p className="text-sm text-gray-600">
              Temperature changes may take a few minutes to take effect. The system has limits to protect the HVAC.
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          For urgent issues, contact us at <a href="tel:800-237-1138" className="text-ocean-600 font-medium">800.237.1138</a>
        </p>
      </div>
    </div>
  );
}

function getDeviceIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'lock':
      return <Lock className="w-5 h-5 text-gray-600" />;
    case 'thermostat':
      return <Thermometer className="w-5 h-5 text-gray-600" />;
    case 'light':
      return <Lightbulb className="w-5 h-5 text-gray-600" />;
    default:
      return <Home className="w-5 h-5 text-gray-600" />;
  }
}

interface Device {
  id: string;
  name: string;
  deviceType: string;
  status: string;
  currentTemperature?: number;
  targetTemperature?: number;
  isLocked?: boolean;
  batteryLevel?: number;
}

interface DeviceCardProps {
  device: Device;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isLoading: boolean;
  onLock: () => void;
  onUnlock: () => void;
  onSetTemperature: (temp: number) => void;
}

function DeviceCard({
  device,
  isExpanded,
  onToggleExpand,
  isLoading,
  onLock,
  onUnlock,
  onSetTemperature,
}: DeviceCardProps) {
  const [tempValue, setTempValue] = useState(device.targetTemperature || 72);

  const getStatusColor = () => {
    if (device.status === 'online') return 'bg-green-500';
    if (device.status === 'offline') return 'bg-red-500';
    return 'bg-amber-500';
  };

  const isLock = device.deviceType.toLowerCase() === 'lock';
  const isThermostat = device.deviceType.toLowerCase() === 'thermostat';

  return (
    <motion.div
      layout
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
    >
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isLock ? 'bg-purple-100' : isThermostat ? 'bg-orange-100' : 'bg-blue-100'
          }`}>
            {isLock ? (
              device.isLocked ? (
                <Lock className={`w-6 h-6 ${isLock ? 'text-purple-600' : 'text-blue-600'}`} />
              ) : (
                <Unlock className="w-6 h-6 text-purple-600" />
              )
            ) : isThermostat ? (
              <Thermometer className="w-6 h-6 text-orange-600" />
            ) : (
              <Home className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{device.name}</h3>
            <div className="flex items-center gap-2 text-sm">
              <span className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
              <span className="text-gray-500 capitalize">{device.status}</span>
              {isLock && (
                <span className={device.isLocked ? 'text-green-600' : 'text-amber-600'}>
                  • {device.isLocked ? 'Locked' : 'Unlocked'}
                </span>
              )}
              {isThermostat && device.currentTemperature && (
                <span className="text-gray-600">• {device.currentTemperature}°F</span>
              )}
            </div>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100"
          >
            <div className="p-4">
              {/* Lock Controls */}
              {isLock && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Current Status</span>
                    <span className={`font-semibold ${device.isLocked ? 'text-green-600' : 'text-amber-600'}`}>
                      {device.isLocked ? 'Secured' : 'Unsecured'}
                    </span>
                  </div>

                  {device.batteryLevel !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Battery Level</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              device.batteryLevel > 50 ? 'bg-green-500' :
                              device.batteryLevel > 20 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${device.batteryLevel}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{device.batteryLevel}%</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={onUnlock}
                      disabled={isLoading || !device.isLocked}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
                        device.isLocked
                          ? 'bg-ocean-600 text-white hover:bg-ocean-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Unlock className="w-5 h-5" />
                      )}
                      Unlock
                    </button>
                    <button
                      onClick={onLock}
                      disabled={isLoading || device.isLocked}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
                        !device.isLocked
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                      Lock
                    </button>
                  </div>

                  {/* Access Code Display */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-purple-700 mb-2">
                      <Key className="w-4 h-4" />
                      <span className="text-sm font-medium">Your Access Code</span>
                    </div>
                    <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
                      ••••••
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Code sent to your registered phone number
                    </p>
                  </div>
                </div>
              )}

              {/* Thermostat Controls */}
              {isThermostat && (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <div className="text-5xl font-bold text-gray-900 mb-1">
                      {device.currentTemperature || '--'}°
                    </div>
                    <p className="text-gray-500">Current Temperature</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-600">Set Temperature</span>
                      <span className="font-semibold text-gray-900">{tempValue}°F</span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={80}
                      value={tempValue}
                      onChange={(e) => setTempValue(parseInt(e.target.value))}
                      className="w-full accent-ocean-600"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>60°F</span>
                      <span>80°F</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSetTemperature(tempValue)}
                    disabled={isLoading || tempValue === device.targetTemperature}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : tempValue === device.targetTemperature ? (
                      <>
                        <Check className="w-5 h-5" />
                        Temperature Set
                      </>
                    ) : (
                      <>
                        <Thermometer className="w-5 h-5" />
                        Set Temperature
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Note: Temperature limits are set to protect the HVAC system (60°F - 80°F)
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
