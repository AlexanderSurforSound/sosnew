'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, TrendingDown, Check, X, Mail, Smartphone } from 'lucide-react';

interface PriceAlertProps {
  propertyId: string;
  propertyName: string;
  currentPrice: number;
  checkIn?: Date;
  checkOut?: Date;
}

interface ActiveAlert {
  id: string;
  propertyId: string;
  propertyName: string;
  targetPrice: number;
  currentPrice: number;
  checkIn: Date;
  checkOut: Date;
  notifyEmail: boolean;
  notifySms: boolean;
  createdAt: Date;
}

export default function PriceAlert({
  propertyId,
  propertyName,
  currentPrice,
  checkIn,
  checkOut,
}: PriceAlertProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState(Math.round(currentPrice * 0.9));
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const percentOff = Math.round(((currentPrice - targetPrice) / currentPrice) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSuccess(true);

    setTimeout(() => {
      setIsOpen(false);
      setIsSuccess(false);
    }, 2000);
  };

  const presetPrices = [
    { label: '10% off', value: Math.round(currentPrice * 0.9) },
    { label: '15% off', value: Math.round(currentPrice * 0.85) },
    { label: '20% off', value: Math.round(currentPrice * 0.8) },
    { label: '25% off', value: Math.round(currentPrice * 0.75) },
  ];

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors border border-amber-200"
      >
        <Bell className="w-4 h-4" />
        <span className="text-sm font-medium">Price Alert</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <TrendingDown className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Set Price Alert</h2>
                      <p className="text-amber-100 text-sm">Get notified when the price drops</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 text-center"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Alert Created!</h3>
                  <p className="text-gray-600">
                    We'll notify you when the price drops to ${targetPrice}/night or below.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Property Info */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="font-medium text-gray-900 mb-1">{propertyName}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Current price:</span>
                      <span className="font-semibold text-gray-900">${currentPrice}/night</span>
                    </div>
                    {checkIn && checkOut && (
                      <p className="text-sm text-gray-500 mt-1">
                        {checkIn.toLocaleDateString()} - {checkOut.toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Target Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alert me when price drops to:
                    </label>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl font-bold text-gray-900">$</span>
                      <input
                        type="number"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(Number(e.target.value))}
                        min={1}
                        max={currentPrice - 1}
                        className="text-3xl font-bold text-gray-900 w-28 border-b-2 border-gray-300 focus:border-ocean-500 outline-none bg-transparent"
                      />
                      <span className="text-gray-500">/night</span>
                      {percentOff > 0 && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                          {percentOff}% off
                        </span>
                      )}
                    </div>

                    {/* Preset prices */}
                    <div className="flex flex-wrap gap-2">
                      {presetPrices.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setTargetPrice(preset.value)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            targetPrice === preset.value
                              ? 'bg-ocean-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {preset.label} (${preset.value})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notification Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      How should we notify you?
                    </label>
                    <div className="space-y-3">
                      {/* Email */}
                      <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifyEmail}
                            onChange={(e) => setNotifyEmail(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-ocean-600 focus:ring-ocean-500"
                          />
                          <Mail className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-700">Email</span>
                        </label>
                        {notifyEmail && (
                          <motion.input
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            className="mt-2 ml-8 w-[calc(100%-2rem)] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                          />
                        )}
                      </div>

                      {/* SMS */}
                      <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifySms}
                            onChange={(e) => setNotifySms(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-ocean-600 focus:ring-ocean-500"
                          />
                          <Smartphone className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-700">Text message</span>
                        </label>
                        {notifySms && (
                          <motion.input
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(555) 123-4567"
                            required
                            className="mt-2 ml-8 w-[calc(100%-2rem)] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting || (!notifyEmail && !notifySms)}
                    className="w-full py-3 bg-ocean-600 text-white rounded-xl font-semibold hover:bg-ocean-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating alert...
                      </>
                    ) : (
                      <>
                        <Bell className="w-5 h-5" />
                        Create Price Alert
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    We'll only use your contact info to send price alerts. You can unsubscribe anytime.
                  </p>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Component to display active alerts
export function ActivePriceAlerts({ alerts }: { alerts: ActiveAlert[] }) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Bell className="w-4 h-4" />
        Active Price Alerts
      </h3>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between"
        >
          <div>
            <p className="font-medium text-gray-900 text-sm">{alert.propertyName}</p>
            <p className="text-xs text-gray-600">
              Alert when ≤ ${alert.targetPrice}/night (currently ${alert.currentPrice})
            </p>
          </div>
          <button className="p-1.5 hover:bg-amber-100 rounded-lg transition-colors">
            <BellOff className="w-4 h-4 text-amber-600" />
          </button>
        </div>
      ))}
    </div>
  );
}
