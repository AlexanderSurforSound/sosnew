'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Check,
  X,
  ChevronDown,
  AlertTriangle,
  Cloud,
  Car,
  Heart,
  Home,
  HelpCircle,
} from 'lucide-react';

interface TravelInsuranceProps {
  tripTotal: number;
  onInsuranceChange: (selected: boolean, plan?: InsurancePlan) => void;
  selectedPlan: InsurancePlan | null;
}

export interface InsurancePlan {
  id: string;
  name: string;
  price: number;
  coverage: string[];
  maxCoverage: number;
}

const insurancePlans: InsurancePlan[] = [
  {
    id: 'travel-protection',
    name: 'Travel Protection',
    price: 0.07, // 7% of trip total
    coverage: [
      'Trip cancellation (illness, injury)',
      'Trip interruption',
      'Hurricane/storm coverage',
      'Travel delay coverage',
      '24/7 travel assistance',
      'Emergency evacuation',
    ],
    maxCoverage: 10000,
  },
];

const coverageDetails = [
  {
    icon: Cloud,
    title: 'Weather Protection',
    description: 'Coverage if hurricanes or severe weather affect your trip',
  },
  {
    icon: Heart,
    title: 'Medical Coverage',
    description: 'Illness or injury that prevents travel',
  },
  {
    icon: Car,
    title: 'Travel Delays',
    description: 'Reimbursement for unexpected travel delays',
  },
  {
    icon: Home,
    title: 'Property Protection',
    description: 'Coverage for accidental damage to the rental',
  },
];

export function TravelInsurance({ tripTotal, onInsuranceChange, selectedPlan }: TravelInsuranceProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [declineReason, setDeclineReason] = useState<string | null>(null);

  const calculatePlanPrice = (plan: InsurancePlan) => {
    return Math.round(tripTotal * plan.price);
  };

  const handleSelectPlan = (plan: InsurancePlan | null) => {
    if (plan) {
      onInsuranceChange(true, plan);
      setDeclineReason(null);
    } else {
      onInsuranceChange(false);
    }
  };

  const handleDecline = () => {
    setDeclineReason('acknowledged');
    onInsuranceChange(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Protect Your Trip</h2>
        <p className="text-gray-600">
          Travel insurance can help protect your vacation investment
        </p>
      </div>

      {/* Why Protect Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Why travel protection matters</h3>
            <p className="text-sm text-blue-700 mt-1">
              Outer Banks vacations can be affected by hurricanes and tropical storms during season.
              Protect your ${tripTotal.toLocaleString()} investment with comprehensive coverage.
            </p>
          </div>
        </div>
      </div>

      {/* Coverage Highlights */}
      <div className="grid grid-cols-2 gap-3">
        {coverageDetails.map((detail) => {
          const Icon = detail.icon;
          return (
            <div
              key={detail.title}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <Icon className="w-5 h-5 text-ocean-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-gray-900">{detail.title}</p>
                <p className="text-xs text-gray-600">{detail.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Insurance Plans */}
      <div className="space-y-3">
        {insurancePlans.map((plan) => {
          const price = calculatePlanPrice(plan);
          const isSelected = selectedPlan?.id === plan.id;

          return (
            <div
              key={plan.id}
              onClick={() => handleSelectPlan(plan)}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-ocean-500 bg-ocean-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Recommended badge */}
              <div className="absolute -top-3 left-4 px-2 py-0.5 bg-gradient-to-r from-ocean-500 to-cyan-500 text-white text-xs font-medium rounded-full">
                Recommended
              </div>

              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-ocean-500 bg-ocean-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Up to ${plan.maxCoverage.toLocaleString()} in coverage
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-gray-900">${price}</p>
                  <p className="text-xs text-gray-600">one-time</p>
                </div>
              </div>

              <div className="mt-4 ml-10">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {plan.coverage.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}

        {/* Decline Option */}
        <div
          onClick={handleDecline}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            declineReason === 'acknowledged'
              ? 'border-gray-400 bg-gray-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                declineReason === 'acknowledged'
                  ? 'border-gray-500 bg-gray-500'
                  : 'border-gray-300'
              }`}
            >
              {declineReason === 'acknowledged' && <X className="w-4 h-4 text-white" />}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">No thanks, I'll risk it</h4>
              <p className="text-sm text-gray-600 mt-1">
                I understand my booking is non-refundable without travel protection
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Learn More */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 text-ocean-600 hover:text-ocean-700 font-medium text-sm"
      >
        <HelpCircle className="w-4 h-4" />
        Learn more about coverage
        <ChevronDown className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-gray-50 rounded-xl space-y-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">What's covered?</h4>
                <p className="text-gray-600">
                  Our travel protection plans cover you for unexpected events that could
                  force you to cancel or cut short your trip, including illness, injury,
                  severe weather, and more.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">How do I file a claim?</h4>
                <p className="text-gray-600">
                  If something happens, contact our 24/7 assistance line. We'll guide you
                  through the simple claims process and help you get reimbursed quickly.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Hurricane season notice</h4>
                <p className="text-gray-600">
                  Hurricane season runs June 1 - November 30. During this time, we strongly
                  recommend the Premium Protection plan for its comprehensive weather coverage.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning if declined */}
      {declineReason === 'acknowledged' && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-800">Proceeding without protection</p>
            <p className="text-amber-700 mt-1">
              Without travel protection, you won't receive a refund if you need to cancel
              due to illness, weather, or other covered reasons.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export { insurancePlans };
