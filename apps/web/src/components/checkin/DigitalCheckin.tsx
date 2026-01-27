'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ChevronRight,
  Clock,
  MapPin,
  Key,
  Phone,
  Wifi,
  Car,
  AlertTriangle,
  FileText,
  Camera,
  Users,
  Calendar,
  Home,
  MessageSquare,
  ThumbsUp,
  Star,
  Shield,
  ArrowRight,
} from 'lucide-react';

interface CheckinStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: React.ReactNode;
}

interface PropertyInfo {
  name: string;
  address: string;
  checkInTime: string;
  checkOutTime: string;
  wifiName: string;
  wifiPassword: string;
  lockCode: string;
  parkingInfo: string;
  emergencyContact: string;
  specialInstructions?: string;
}

interface GuestInfo {
  name: string;
  email: string;
  phone: string;
  guests: number;
  arrivalTime?: string;
  licensePlate?: string;
}

interface DigitalCheckinProps {
  propertyInfo: PropertyInfo;
  bookingDates: { checkIn: Date; checkOut: Date };
  onComplete?: (guestInfo: GuestInfo) => void;
}

export default function DigitalCheckin({
  propertyInfo,
  bookingDates,
  onComplete,
}: DigitalCheckinProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    name: '',
    email: '',
    phone: '',
    guests: 2,
    arrivalTime: '',
    licensePlate: '',
  });
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [checkinComplete, setCheckinComplete] = useState(false);

  const steps: CheckinStep[] = [
    {
      id: 'verify',
      title: 'Verify Details',
      description: 'Confirm your booking information',
      completed: currentStep > 0,
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: 'guests',
      title: 'Guest Information',
      description: 'Add arrival details',
      completed: currentStep > 1,
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'rules',
      title: 'House Rules',
      description: 'Review and accept policies',
      completed: currentStep > 2,
      icon: <Shield className="w-5 h-5" />,
    },
    {
      id: 'access',
      title: 'Access Info',
      description: 'Get your entry details',
      completed: currentStep > 3,
      icon: <Key className="w-5 h-5" />,
    },
  ];

  const houseRules = [
    'No smoking inside the property',
    'No parties or events',
    'Quiet hours from 10 PM to 8 AM',
    'Maximum occupancy must be respected',
    'Pets must be disclosed in advance',
    'Take out trash on departure',
    'Report any damages immediately',
  ];

  const handleComplete = () => {
    setCheckinComplete(true);
    if (onComplete) {
      onComplete(guestInfo);
    }
  };

  if (checkinComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 overflow-hidden"
      >
        <div className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-green-600" />
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">You're All Checked In!</h2>
          <p className="text-gray-600 mb-8">
            Welcome to {propertyInfo.name}. Have a wonderful stay!
          </p>

          {/* Access Card */}
          <div className="bg-gradient-to-br from-ocean-500 to-ocean-600 rounded-2xl p-6 text-white text-left mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5" />
              <span className="font-semibold">Your Access Information</span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-ocean-200 text-sm">Lock Code</p>
                <p className="text-2xl font-bold font-mono tracking-wider">
                  {propertyInfo.lockCode}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-ocean-200 text-sm">WiFi Network</p>
                  <p className="font-medium">{propertyInfo.wifiName}</p>
                </div>
                <div>
                  <p className="text-ocean-200 text-sm">WiFi Password</p>
                  <p className="font-medium font-mono">{propertyInfo.wifiPassword}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 text-left">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Check-in</span>
              </div>
              <p className="font-semibold text-gray-900">{propertyInfo.checkInTime}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-left">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Check-out</span>
              </div>
              <p className="font-semibold text-gray-900">{propertyInfo.checkOutTime}</p>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 text-left mb-6">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">Need Help?</p>
                <p className="text-sm text-amber-700">
                  Contact us anytime at {propertyInfo.emergencyContact}
                </p>
              </div>
            </div>
          </div>

          <button className="w-full py-4 bg-ocean-600 text-white rounded-xl font-semibold hover:bg-ocean-700 transition-colors flex items-center justify-center gap-2">
            <MapPin className="w-5 h-5" />
            Get Directions
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-ocean-500 to-ocean-600 text-white">
        <h2 className="text-xl font-bold mb-1">Digital Check-In</h2>
        <p className="text-ocean-100">{propertyInfo.name}</p>
        <div className="flex items-center gap-2 mt-2 text-ocean-200 text-sm">
          <Calendar className="w-4 h-4" />
          {bookingDates.checkIn.toLocaleDateString()} -{' '}
          {bookingDates.checkOut.toLocaleDateString()}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.completed
                      ? 'bg-green-500 text-white'
                      : currentStep === index
                      ? 'bg-ocean-600 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step.completed ? <Check className="w-5 h-5" /> : step.icon}
                </div>
                <span
                  className={`text-xs mt-1 hidden sm:block ${
                    currentStep >= index ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-2 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Verify Details */}
          {currentStep === 0 && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Your Booking
              </h3>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Home className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{propertyInfo.name}</p>
                      <p className="text-sm text-gray-500">{propertyInfo.address}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">Check-in</p>
                    <p className="font-medium text-gray-900">
                      {bookingDates.checkIn.toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">{propertyInfo.checkInTime}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500 mb-1">Check-out</p>
                    <p className="font-medium text-gray-900">
                      {bookingDates.checkOut.toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">{propertyInfo.checkOutTime}</p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-700">
                      Please verify this information is correct before proceeding.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Guest Information */}
          {currentStep === 1 && (
            <motion.div
              key="guests"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Guest Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Guest Name
                </label>
                <input
                  type="text"
                  value={guestInfo.name}
                  onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={guestInfo.phone}
                  onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Guests
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      setGuestInfo({ ...guestInfo, guests: Math.max(1, guestInfo.guests - 1) })
                    }
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <Users className="w-5 h-5" />
                  </button>
                  <span className="text-2xl font-bold w-12 text-center">{guestInfo.guests}</span>
                  <button
                    onClick={() =>
                      setGuestInfo({ ...guestInfo, guests: Math.min(20, guestInfo.guests + 1) })
                    }
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <Users className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Arrival Time
                </label>
                <input
                  type="time"
                  value={guestInfo.arrivalTime}
                  onChange={(e) => setGuestInfo({ ...guestInfo, arrivalTime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle License Plate (optional)
                </label>
                <input
                  type="text"
                  value={guestInfo.licensePlate}
                  onChange={(e) =>
                    setGuestInfo({ ...guestInfo, licensePlate: e.target.value })
                  }
                  placeholder="ABC-1234"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>
            </motion.div>
          )}

          {/* Step 3: House Rules */}
          {currentStep === 2 && (
            <motion.div
              key="rules"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                House Rules
              </h3>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Please review and agree to the following house rules:
                </p>
                <ul className="space-y-3">
                  {houseRules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-ocean-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-ocean-600">{index + 1}</span>
                      </div>
                      <span className="text-gray-700">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToRules}
                  onChange={(e) => setAgreedToRules(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-ocean-600 focus:ring-ocean-500 mt-0.5"
                />
                <span className="text-sm text-gray-700">
                  I have read and agree to follow all house rules and property policies
                  during my stay.
                </span>
              </label>
            </motion.div>
          )}

          {/* Step 4: Access Info */}
          {currentStep === 3 && (
            <motion.div
              key="access"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Property Access
              </h3>

              <div className="space-y-4">
                <div className="bg-ocean-50 rounded-xl p-4 border border-ocean-200">
                  <div className="flex items-center gap-2 text-ocean-700 mb-2">
                    <Key className="w-5 h-5" />
                    <span className="font-semibold">Door Lock Code</span>
                  </div>
                  <p className="text-3xl font-bold font-mono text-ocean-900 tracking-wider">
                    {propertyInfo.lockCode}
                  </p>
                  <p className="text-sm text-ocean-600 mt-2">
                    Enter this code on the keypad to unlock the front door
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-700 mb-2">
                    <Wifi className="w-5 h-5" />
                    <span className="font-semibold">WiFi Information</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Network</p>
                      <p className="font-medium">{propertyInfo.wifiName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Password</p>
                      <p className="font-medium font-mono">{propertyInfo.wifiPassword}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-700 mb-2">
                    <Car className="w-5 h-5" />
                    <span className="font-semibold">Parking</span>
                  </div>
                  <p className="text-gray-600">{propertyInfo.parkingInfo}</p>
                </div>

                {propertyInfo.specialInstructions && (
                  <div className="bg-amber-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-amber-700 mb-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-semibold">Special Instructions</span>
                    </div>
                    <p className="text-amber-700">{propertyInfo.specialInstructions}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-100 flex justify-between">
        {currentStep > 0 ? (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium"
          >
            Back
          </button>
        ) : (
          <div />
        )}

        {currentStep < steps.length - 1 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={
              (currentStep === 1 && (!guestInfo.name || !guestInfo.phone)) ||
              (currentStep === 2 && !agreedToRules)
            }
            className="px-6 py-3 bg-ocean-600 text-white rounded-xl font-medium hover:bg-ocean-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleComplete}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            Complete Check-In
          </button>
        )}
      </div>
    </div>
  );
}

// Guestbook Component
export function DigitalGuestbook({ propertyId }: { propertyId: string }) {
  const [entries, setEntries] = useState([
    {
      id: '1',
      guestName: 'The Johnson Family',
      date: 'December 2023',
      message:
        'What an amazing week! The kids loved the beach access and we enjoyed every sunset from the deck. Already planning our return trip!',
      rating: 5,
    },
    {
      id: '2',
      guestName: 'Mike & Sarah',
      date: 'November 2023',
      message:
        'Perfect getaway for our anniversary. The house was spotless and had everything we needed. The local restaurant recommendations were spot on!',
      rating: 5,
    },
    {
      id: '3',
      guestName: 'The Martinez Group',
      date: 'October 2023',
      message:
        'Great location for our family reunion. Plenty of space for everyone and the hot tub was a hit. Thank you for a memorable stay!',
      rating: 5,
    },
  ]);

  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({ message: '', rating: 5 });

  const addEntry = () => {
    setEntries([
      {
        id: Date.now().toString(),
        guestName: 'You',
        date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        message: newEntry.message,
        rating: newEntry.rating,
      },
      ...entries,
    ]);
    setShowAddEntry(false);
    setNewEntry({ message: '', rating: 5 });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">Guest Book</h2>
              <p className="text-amber-100 text-sm">Messages from past guests</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddEntry(true)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
          >
            Sign Book
          </button>
        </div>
      </div>

      {/* Add Entry Form */}
      <AnimatePresence>
        {showAddEntry && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-100 overflow-hidden"
          >
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Leave a Message</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewEntry({ ...newEntry, rating: star })}
                      className="p-1"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= newEntry.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  value={newEntry.message}
                  onChange={(e) => setNewEntry({ ...newEntry, message: e.target.value })}
                  placeholder="Share your experience..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddEntry(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={addEntry}
                  disabled={!newEntry.message}
                  className="px-6 py-2 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  Sign Guestbook
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries */}
      <div className="divide-y divide-gray-100">
        {entries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{entry.guestName}</h4>
                <p className="text-sm text-gray-500">{entry.date}</p>
              </div>
              <div className="flex">
                {Array.from({ length: entry.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-gray-600 italic">"{entry.message}"</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
