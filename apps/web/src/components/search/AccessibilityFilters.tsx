'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Accessibility,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  Home,
  Bath,
  DoorOpen,
  Bed,
  Car,
  Waves,
  Eye,
  Ear,
  Brain,
  Heart,
  X,
  Filter,
} from 'lucide-react';

interface AccessibilityFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'mobility' | 'visual' | 'hearing' | 'cognitive' | 'general';
}

const accessibilityFeatures: AccessibilityFeature[] = [
  // Mobility
  {
    id: 'step-free-entry',
    name: 'Step-free entry',
    description: 'No steps to enter the property',
    icon: <DoorOpen className="w-5 h-5" />,
    category: 'mobility',
  },
  {
    id: 'wheelchair-accessible',
    name: 'Wheelchair accessible',
    description: 'Wide doorways and accessible paths throughout',
    icon: <Accessibility className="w-5 h-5" />,
    category: 'mobility',
  },
  {
    id: 'ground-floor-bedroom',
    name: 'Ground floor bedroom',
    description: 'At least one bedroom on the main level',
    icon: <Bed className="w-5 h-5" />,
    category: 'mobility',
  },
  {
    id: 'ground-floor-bathroom',
    name: 'Ground floor bathroom',
    description: 'Full bathroom on the main level',
    icon: <Bath className="w-5 h-5" />,
    category: 'mobility',
  },
  {
    id: 'roll-in-shower',
    name: 'Roll-in shower',
    description: 'Shower with no step or curb',
    icon: <Waves className="w-5 h-5" />,
    category: 'mobility',
  },
  {
    id: 'grab-bars',
    name: 'Grab bars',
    description: 'Grab bars in bathroom',
    icon: <Bath className="w-5 h-5" />,
    category: 'mobility',
  },
  {
    id: 'shower-chair',
    name: 'Shower/bath chair',
    description: 'Seating available for shower or bath',
    icon: <Bath className="w-5 h-5" />,
    category: 'mobility',
  },
  {
    id: 'accessible-parking',
    name: 'Accessible parking',
    description: 'Designated accessible parking spot',
    icon: <Car className="w-5 h-5" />,
    category: 'mobility',
  },
  {
    id: 'elevator',
    name: 'Elevator',
    description: 'Elevator access to all floors',
    icon: <Home className="w-5 h-5" />,
    category: 'mobility',
  },
  {
    id: 'pool-lift',
    name: 'Pool lift or ramp',
    description: 'Accessible pool entry',
    icon: <Waves className="w-5 h-5" />,
    category: 'mobility',
  },
  // Visual
  {
    id: 'braille-signage',
    name: 'Braille signage',
    description: 'Braille labels on key areas',
    icon: <Eye className="w-5 h-5" />,
    category: 'visual',
  },
  {
    id: 'high-contrast-lighting',
    name: 'High contrast lighting',
    description: 'Well-lit paths and areas',
    icon: <Eye className="w-5 h-5" />,
    category: 'visual',
  },
  // Hearing
  {
    id: 'visual-doorbell',
    name: 'Visual doorbell/alerts',
    description: 'Flashing lights for doorbell and alarms',
    icon: <Ear className="w-5 h-5" />,
    category: 'hearing',
  },
  {
    id: 'closed-captioning',
    name: 'Closed captioning TVs',
    description: 'TVs with closed captioning support',
    icon: <Ear className="w-5 h-5" />,
    category: 'hearing',
  },
  // Cognitive
  {
    id: 'simple-layout',
    name: 'Simple layout',
    description: 'Easy to navigate floor plan',
    icon: <Brain className="w-5 h-5" />,
    category: 'cognitive',
  },
  {
    id: 'clear-signage',
    name: 'Clear signage',
    description: 'Clearly labeled rooms and amenities',
    icon: <Brain className="w-5 h-5" />,
    category: 'cognitive',
  },
  // General
  {
    id: 'service-animal-friendly',
    name: 'Service animal friendly',
    description: 'Service animals welcome',
    icon: <Heart className="w-5 h-5" />,
    category: 'general',
  },
  {
    id: 'medical-equipment-friendly',
    name: 'Medical equipment space',
    description: 'Space for medical equipment',
    icon: <Heart className="w-5 h-5" />,
    category: 'general',
  },
];

const categories = [
  { id: 'mobility', name: 'Mobility', icon: <Accessibility className="w-5 h-5" /> },
  { id: 'visual', name: 'Visual', icon: <Eye className="w-5 h-5" /> },
  { id: 'hearing', name: 'Hearing', icon: <Ear className="w-5 h-5" /> },
  { id: 'cognitive', name: 'Cognitive', icon: <Brain className="w-5 h-5" /> },
  { id: 'general', name: 'General', icon: <Heart className="w-5 h-5" /> },
];

interface AccessibilityFiltersProps {
  selectedFeatures: string[];
  onFeaturesChange: (features: string[]) => void;
  compact?: boolean;
}

export default function AccessibilityFilters({
  selectedFeatures,
  onFeaturesChange,
  compact = false,
}: AccessibilityFiltersProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['mobility']);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const toggleFeature = (featureId: string) => {
    onFeaturesChange(
      selectedFeatures.includes(featureId)
        ? selectedFeatures.filter((f) => f !== featureId)
        : [...selectedFeatures, featureId]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getCategoryFeatures = (categoryId: string) =>
    accessibilityFeatures.filter((f) => f.category === categoryId);

  const getSelectedCount = (categoryId: string) =>
    getCategoryFeatures(categoryId).filter((f) => selectedFeatures.includes(f.id)).length;

  if (compact) {
    return (
      <CompactAccessibilityFilters
        selectedFeatures={selectedFeatures}
        onFeaturesChange={onFeaturesChange}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Accessibility className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">Accessibility Features</h2>
              <p className="text-indigo-100 text-sm">
                Find properties that meet your needs
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowInfoModal(true)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>

        {selectedFeatures.length > 0 && (
          <div className="mt-4 flex items-center justify-between bg-white/20 rounded-lg px-4 py-2">
            <span className="text-sm">
              {selectedFeatures.length} feature{selectedFeatures.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => onFeaturesChange([])}
              className="text-sm font-medium hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="divide-y divide-gray-100">
        {categories.map((category) => {
          const features = getCategoryFeatures(category.id);
          const selectedCount = getSelectedCount(category.id);
          const isExpanded = expandedCategories.includes(category.id);

          return (
            <div key={category.id}>
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                    {category.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">
                      {features.length} features available
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {selectedCount > 0 && (
                    <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                      {selectedCount}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2">
                      {features.map((feature) => {
                        const isSelected = selectedFeatures.includes(feature.id);
                        return (
                          <button
                            key={feature.id}
                            onClick={() => toggleFeature(feature.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                              isSelected
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isSelected
                                  ? 'bg-indigo-500 text-white'
                                  : 'bg-white text-gray-400'
                              }`}
                            >
                              {isSelected ? (
                                <Check className="w-5 h-5" />
                              ) : (
                                feature.icon
                              )}
                            </div>
                            <div className="text-left flex-1">
                              <p
                                className={`font-medium ${
                                  isSelected ? 'text-indigo-900' : 'text-gray-700'
                                }`}
                              >
                                {feature.name}
                              </p>
                              <p className="text-sm text-gray-500">{feature.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInfoModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
                <h3 className="font-semibold text-lg">About Accessibility Filters</h3>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-gray-600">
                  Our accessibility filters help you find vacation rentals that meet your
                  specific needs. Each property's accessibility features have been verified
                  by our team.
                </p>

                <div className="bg-indigo-50 rounded-xl p-4">
                  <h4 className="font-semibold text-indigo-900 mb-2">How it works</h4>
                  <ul className="space-y-2 text-sm text-indigo-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Select the accessibility features you need
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      We'll only show properties matching your criteria
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Each listing shows detailed accessibility info
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-50 rounded-xl p-4">
                  <h4 className="font-semibold text-amber-900 mb-2">Need more info?</h4>
                  <p className="text-sm text-amber-700 mb-3">
                    If you have specific accessibility questions about a property, our
                    team is happy to help.
                  </p>
                  <button className="text-sm font-medium text-amber-700 hover:underline">
                    Contact us for assistance →
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact version for search bar
function CompactAccessibilityFilters({
  selectedFeatures,
  onFeaturesChange,
}: {
  selectedFeatures: string[];
  onFeaturesChange: (features: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFeature = (featureId: string) => {
    onFeaturesChange(
      selectedFeatures.includes(featureId)
        ? selectedFeatures.filter((f) => f !== featureId)
        : [...selectedFeatures, featureId]
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-colors ${
          selectedFeatures.length > 0
            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
            : 'border-gray-200 text-gray-700 hover:border-gray-300'
        }`}
      >
        <Accessibility className="w-5 h-5" />
        <span className="text-sm font-medium">Accessibility</span>
        {selectedFeatures.length > 0 && (
          <span className="ml-1 px-1.5 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-full">
            {selectedFeatures.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
            >
              <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                <span className="font-medium text-gray-900">Accessibility Features</span>
                {selectedFeatures.length > 0 && (
                  <button
                    onClick={() => onFeaturesChange([])}
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="p-2 space-y-1">
                {accessibilityFeatures.slice(0, 10).map((feature) => {
                  const isSelected = selectedFeatures.includes(feature.id);
                  return (
                    <button
                      key={feature.id}
                      onClick={() => toggleFeature(feature.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm">{feature.name}</span>
                    </button>
                  );
                })}
              </div>
              <div className="p-3 border-t border-gray-100">
                <button className="w-full text-sm text-indigo-600 font-medium hover:underline">
                  Show all accessibility options
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Badge for property cards
export function AccessibilityBadge({ features }: { features: string[] }) {
  if (features.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
      <Accessibility className="w-3.5 h-3.5" />
      <span className="text-xs font-medium">
        {features.length} accessibility feature{features.length !== 1 ? 's' : ''}
      </span>
    </div>
  );
}

// Property detail section
export function AccessibilitySection({ features }: { features: string[] }) {
  const matchedFeatures = accessibilityFeatures.filter((f) => features.includes(f.id));

  if (matchedFeatures.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Accessibility className="w-5 h-5 text-indigo-600" />
        <h3 className="font-semibold text-gray-900">Accessibility Features</h3>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {matchedFeatures.map((feature) => (
          <div
            key={feature.id}
            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 flex-shrink-0">
              {feature.icon}
            </div>
            <div>
              <p className="font-medium text-gray-900">{feature.name}</p>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
