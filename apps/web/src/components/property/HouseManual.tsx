'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Book,
  Wifi,
  Key,
  Thermometer,
  Tv,
  UtensilsCrossed,
  Shirt,
  Car,
  Trash2,
  Phone,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Search,
  Coffee,
  Waves,
  Flame,
  Home,
  Lock,
  Lightbulb,
  Wind,
  Droplets,
  MapPin,
  Clock,
  Shield,
  Heart,
} from 'lucide-react';

interface ManualSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: ManualItem[];
}

interface ManualItem {
  title: string;
  description: string;
  steps?: string[];
  warning?: string;
  tip?: string;
}

const houseManualSections: ManualSection[] = [
  {
    id: 'arrival',
    title: 'Check-In & Access',
    icon: <Key className="w-5 h-5" />,
    content: [
      {
        title: 'Door Lock Code',
        description: 'Your entry code is: 1234#. Enter this on the keypad to unlock.',
        steps: [
          'Approach the front door keypad',
          'Enter your 4-digit code followed by #',
          'Wait for the green light and click',
          'Turn the handle to enter',
        ],
        tip: 'The code auto-locks after 30 seconds. Lock manually when leaving.',
      },
      {
        title: 'Parking',
        description: 'You have 2 designated parking spots in the driveway.',
        tip: 'Additional street parking is available. No parking on grass.',
      },
      {
        title: 'Check-In Time',
        description: 'Check-in is at 4:00 PM. Early check-in may be available upon request.',
      },
    ],
  },
  {
    id: 'wifi',
    title: 'WiFi & Entertainment',
    icon: <Wifi className="w-5 h-5" />,
    content: [
      {
        title: 'WiFi Connection',
        description: 'Network: BeachHouse_5G | Password: SunsetWaves2024',
        steps: [
          'Open WiFi settings on your device',
          'Select "BeachHouse_5G" from available networks',
          'Enter password: SunsetWaves2024',
        ],
        tip: 'For best streaming, use the 5G network. Regular network available as backup.',
      },
      {
        title: 'Smart TV',
        description: 'The living room has a 65" Smart TV with Netflix, Hulu, and Disney+.',
        steps: [
          'Use the Samsung remote to power on',
          'Press the Home button to access apps',
          'Log into your streaming accounts or use guest mode',
        ],
        tip: 'Please log out of all streaming accounts before checkout.',
      },
      {
        title: 'Bluetooth Speaker',
        description: 'A Sonos speaker is available on the deck.',
        steps: [
          'Open Spotify or Apple Music',
          'Select "Deck Speaker" from available devices',
          'Please keep volume reasonable after 10 PM',
        ],
      },
    ],
  },
  {
    id: 'climate',
    title: 'Climate Control',
    icon: <Thermometer className="w-5 h-5" />,
    content: [
      {
        title: 'Thermostat',
        description: 'The Nest thermostat is located in the main hallway.',
        steps: [
          'Tap the display to wake the thermostat',
          'Turn the dial to adjust temperature',
          'Press to switch between heating/cooling',
        ],
        tip: 'Please set to 72-76°F when leaving to conserve energy.',
        warning: 'Do not set below 68°F as it may freeze the AC unit.',
      },
      {
        title: 'Ceiling Fans',
        description: 'All bedrooms have ceiling fans with remote controls.',
        steps: [
          'Find the remote on the nightstand',
          'Press Fan button to cycle speeds',
          'Press Light button to control lights',
        ],
      },
    ],
  },
  {
    id: 'kitchen',
    title: 'Kitchen',
    icon: <UtensilsCrossed className="w-5 h-5" />,
    content: [
      {
        title: 'Appliances',
        description: 'Full kitchen with stainless steel appliances.',
        tip: 'Coffee maker, toaster, and blender are in the pantry cabinet.',
      },
      {
        title: 'Dishwasher',
        description: 'Please run the dishwasher before checkout.',
        steps: [
          'Load dishes with glasses on top rack',
          'Add detergent pod to dispenser',
          'Select Normal cycle and press Start',
        ],
      },
      {
        title: 'Gas Stove',
        description: 'The stove uses natural gas ignition.',
        steps: [
          'Turn knob and push in',
          'Wait for click and flame',
          'Adjust flame as needed',
        ],
        warning: 'If you smell gas and no flame, turn off immediately and ventilate.',
      },
    ],
  },
  {
    id: 'laundry',
    title: 'Laundry',
    icon: <Shirt className="w-5 h-5" />,
    content: [
      {
        title: 'Washer & Dryer',
        description: 'Located in the hallway closet. Detergent provided.',
        steps: [
          'Add clothes and detergent',
          'Select cycle (Normal for most loads)',
          'Press Start',
        ],
        tip: 'Clean the lint trap before each dryer use.',
      },
    ],
  },
  {
    id: 'outdoor',
    title: 'Outdoor Amenities',
    icon: <Waves className="w-5 h-5" />,
    content: [
      {
        title: 'Hot Tub',
        description: 'The hot tub is on the back deck and ready for use.',
        steps: [
          'Remove the cover using the lift mechanism',
          'Check temperature (preset to 102°F)',
          'Use the panel to adjust jets',
        ],
        warning: 'No glass near the hot tub. Please shower before entering.',
      },
      {
        title: 'Grill',
        description: 'Propane grill on the deck. Tank is connected.',
        steps: [
          'Open the lid first',
          'Turn on propane at tank',
          'Turn burner knobs to ignite',
          'Preheat for 10-15 minutes',
        ],
        tip: 'Grill brush and tools are in the deck storage box.',
      },
      {
        title: 'Beach Gear',
        description: 'Beach chairs, umbrella, and boogie boards in the garage.',
        tip: 'Please rinse sand off equipment before storing.',
      },
    ],
  },
  {
    id: 'checkout',
    title: 'Check-Out',
    icon: <Home className="w-5 h-5" />,
    content: [
      {
        title: 'Check-Out Time',
        description: 'Please check out by 10:00 AM.',
      },
      {
        title: 'Departure Checklist',
        description: 'Please complete before leaving:',
        steps: [
          'Run dishwasher with any dirty dishes',
          'Take out trash to outdoor bins',
          'Turn off all lights and fans',
          'Set thermostat to 72°F',
          'Lock all doors and windows',
          'Return keys/remotes to their locations',
        ],
      },
      {
        title: 'Linens',
        description: 'Leave used towels and linens in the bathtubs. No need to make beds.',
      },
    ],
  },
  {
    id: 'emergency',
    title: 'Emergency Info',
    icon: <AlertTriangle className="w-5 h-5" />,
    content: [
      {
        title: 'Emergency Contacts',
        description: 'In case of emergency:',
        steps: [
          '911 for police, fire, or medical emergency',
          'Property Manager: (252) 555-0123',
          'Maintenance Emergency: (252) 555-0124',
        ],
      },
      {
        title: 'Fire Safety',
        description: 'Smoke detectors and fire extinguisher are located on each floor.',
        tip: 'Fire extinguisher is under the kitchen sink.',
        warning: 'In case of fire, evacuate immediately and call 911.',
      },
      {
        title: 'Hurricane Preparedness',
        description: 'Monitor local news during storm season.',
        tip: 'Hurricane shutters are in the garage. We will contact you if evacuation is needed.',
      },
    ],
  },
];

interface HouseManualProps {
  propertyName?: string;
  customSections?: ManualSection[];
}

export default function HouseManual({
  propertyName = 'Oceanfront Paradise',
  customSections = houseManualSections,
}: HouseManualProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['arrival']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<ManualSection | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const filteredSections = searchQuery
    ? customSections.filter(
        (section) =>
          section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.content.some(
            (item) =>
              item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : customSections;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Book className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">House Manual</h2>
            <p className="text-emerald-100">{propertyName}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-200" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search the manual..."
            className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-emerald-200 focus:outline-none focus:bg-white/30"
          />
        </div>
      </div>

      {/* Quick Access */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <p className="text-sm text-gray-500 mb-2">Quick Access</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'wifi', label: 'WiFi', icon: <Wifi className="w-4 h-4" /> },
            { id: 'arrival', label: 'Lock Code', icon: <Key className="w-4 h-4" /> },
            { id: 'climate', label: 'Thermostat', icon: <Thermometer className="w-4 h-4" /> },
            { id: 'emergency', label: 'Emergency', icon: <Phone className="w-4 h-4" /> },
          ].map((quick) => (
            <button
              key={quick.id}
              onClick={() => {
                setExpandedSections([quick.id]);
                document.getElementById(`section-${quick.id}`)?.scrollIntoView({
                  behavior: 'smooth',
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 transition-colors whitespace-nowrap"
            >
              {quick.icon}
              {quick.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="divide-y divide-gray-100">
        {filteredSections.map((section) => (
          <div key={section.id} id={`section-${section.id}`}>
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                  {section.icon}
                </div>
                <span className="font-semibold text-gray-900">{section.title}</span>
              </div>
              {expandedSections.includes(section.id) ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>

            <AnimatePresence>
              {expandedSections.includes(section.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-4">
                    {section.content.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-xl"
                      >
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {item.title}
                        </h4>
                        <p className="text-gray-600 text-sm mb-3">
                          {item.description}
                        </p>

                        {item.steps && (
                          <ol className="space-y-2 mb-3">
                            {item.steps.map((step, stepIndex) => (
                              <li
                                key={stepIndex}
                                className="flex items-start gap-2 text-sm"
                              >
                                <span className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {stepIndex + 1}
                                </span>
                                <span className="text-gray-700">{step}</span>
                              </li>
                            ))}
                          </ol>
                        )}

                        {item.warning && (
                          <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg text-sm">
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-red-700">{item.warning}</p>
                          </div>
                        )}

                        {item.tip && (
                          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-sm mt-2">
                            <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-blue-700">{item.tip}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Help Footer */}
      <div className="p-4 bg-emerald-50 border-t border-emerald-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-900">Need Help?</p>
              <p className="text-sm text-emerald-700">
                Contact us anytime at (252) 555-0123
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
            Message Us
          </button>
        </div>
      </div>
    </div>
  );
}
