'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ChevronDown,
  Search,
  Home,
  CreditCard,
  Calendar,
  Shield,
  Dog,
  HelpCircle,
  MessageSquare,
  Phone,
} from 'lucide-react';

const faqCategories = [
  {
    id: 'booking',
    name: 'Booking & Reservations',
    icon: Calendar,
    faqs: [
      {
        question: 'How do I book a vacation rental?',
        answer: 'Booking is easy! Simply search for properties using our search tool, select your dates, and complete the checkout process. You\'ll receive instant confirmation and all the details you need for your stay.',
      },
      {
        question: 'Can I book for same-day check-in?',
        answer: 'Same-day bookings may be available depending on the property. We recommend booking at least 24-48 hours in advance to ensure the property is properly prepared for your arrival.',
      },
      {
        question: 'What is the minimum stay requirement?',
        answer: 'Minimum stays vary by property and season. During peak summer months (June-August), most properties require a 7-night minimum. Off-season minimums are typically 2-3 nights.',
      },
      {
        question: 'Can I request an early check-in or late check-out?',
        answer: 'Early check-in and late check-out requests are accommodated when possible, subject to availability. Contact us at least 48 hours before your stay to request. A fee may apply.',
      },
    ],
  },
  {
    id: 'payments',
    name: 'Payments & Pricing',
    icon: CreditCard,
    faqs: [
      {
        question: 'What forms of payment do you accept?',
        answer: 'We accept all major credit cards (Visa, MasterCard, American Express, Discover), debit cards, and bank transfers. Payment plans are available for bookings made 60+ days in advance.',
      },
      {
        question: 'When is payment due?',
        answer: 'A 50% deposit is due at booking to secure your reservation. The remaining balance is due 30 days before check-in. For bookings made within 30 days, full payment is required at booking.',
      },
      {
        question: 'Are there any additional fees?',
        answer: 'All mandatory fees (cleaning, service fees) are clearly displayed before you book—no surprises. Some properties may charge optional fees for amenities like pool heating or pet stays.',
      },
      {
        question: 'Do you offer travel insurance?',
        answer: 'Yes! We partner with leading travel insurance providers to offer comprehensive coverage for trip cancellation, interruption, and travel delays. We highly recommend adding protection to your booking.',
      },
    ],
  },
  {
    id: 'cancellation',
    name: 'Cancellation & Refunds',
    icon: Shield,
    faqs: [
      {
        question: 'What is your cancellation policy?',
        answer: 'Cancellations 60+ days before check-in receive a full refund minus a $50 processing fee. Cancellations 30-59 days before receive a 50% refund. Less than 30 days notice is non-refundable unless covered by travel insurance.',
      },
      {
        question: 'What if there\'s a hurricane or weather emergency?',
        answer: 'If a mandatory evacuation is issued for Hatteras Island during your stay, you\'ll receive a full refund or credit for unused nights. We monitor weather closely and communicate proactively.',
      },
      {
        question: 'Can I modify my reservation?',
        answer: 'Date changes are possible subject to availability and may incur a modification fee. Contact us as soon as possible if you need to change your dates.',
      },
    ],
  },
  {
    id: 'properties',
    name: 'Properties & Amenities',
    icon: Home,
    faqs: [
      {
        question: 'What\'s included in the rental?',
        answer: 'All properties include linens, towels, basic toiletries, kitchen essentials, and WiFi. Many include beach chairs, umbrellas, and outdoor equipment. Check individual listings for specific amenities.',
      },
      {
        question: 'Are properties cleaned between guests?',
        answer: 'Absolutely! Every property undergoes professional deep cleaning between guests. We follow enhanced cleaning protocols and all properties are inspected before each arrival.',
      },
      {
        question: 'Do properties have WiFi?',
        answer: 'Yes, all properties include WiFi. Speed varies by location—check the WiFi rating on each listing. For remote work needs, look for properties with our "Work From Beach" badge.',
      },
      {
        question: 'What if something is broken or missing?',
        answer: 'Contact us immediately and we\'ll resolve the issue. Our maintenance team is available 24/7 for urgent issues. For non-urgent matters, we typically respond within 2 hours.',
      },
    ],
  },
  {
    id: 'pets',
    name: 'Pets & Animals',
    icon: Dog,
    faqs: [
      {
        question: 'Are pets allowed?',
        answer: 'Many properties are pet-friendly! Look for the paw icon when searching. Pet fees typically range from $75-$150 per stay. Some properties have breed or size restrictions.',
      },
      {
        question: 'How many pets can I bring?',
        answer: 'Most pet-friendly properties allow up to 2 dogs. Some properties accept cats. Always check the specific property listing for pet policies and any restrictions.',
      },
      {
        question: 'Are there pet-friendly beaches nearby?',
        answer: 'Yes! Most Hatteras Island beaches allow leashed dogs year-round. Some areas have seasonal restrictions for bird nesting. Our team can recommend the best pet-friendly spots.',
      },
    ],
  },
  {
    id: 'checkin',
    name: 'Check-In & Check-Out',
    icon: HelpCircle,
    faqs: [
      {
        question: 'What time is check-in and check-out?',
        answer: 'Standard check-in is 4:00 PM and check-out is 10:00 AM. This allows time for thorough cleaning and property preparation. Early/late options may be available upon request.',
      },
      {
        question: 'How do I access the property?',
        answer: 'Most properties use keyless entry with a unique code sent 24-48 hours before arrival. Some properties have lockboxes. Full instructions are provided in your pre-arrival email.',
      },
      {
        question: 'What should I do when I arrive?',
        answer: 'Check your email for arrival instructions including the door code, parking info, and WiFi password. A welcome guide inside the property has everything else you need to know.',
      },
      {
        question: 'What do I need to do before leaving?',
        answer: 'Please start the dishwasher, take out trash, and leave the property in reasonable condition. No need to strip beds or do laundry—that\'s what the cleaning fee covers!',
      },
    ],
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('booking');
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleQuestion = (question: string) => {
    setExpandedQuestions((prev) =>
      prev.includes(question)
        ? prev.filter((q) => q !== question)
        : [...prev, question]
    );
  };

  const filteredCategories = searchQuery
    ? faqCategories.map((cat) => ({
        ...cat,
        faqs: cat.faqs.filter(
          (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter((cat) => cat.faqs.length > 0)
    : faqCategories;

  const currentCategory = searchQuery
    ? filteredCategories
    : filteredCategories.filter((cat) => cat.id === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-ocean-100 mb-8">
            Find answers to common questions about booking, payments, and your stay.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-ocean-300 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[280px,1fr] gap-8">
          {/* Category Sidebar */}
          {!searchQuery && (
            <aside className="space-y-2">
              {faqCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeCategory === category.id
                      ? 'bg-ocean-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <category.icon className="w-5 h-5" />
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
            </aside>
          )}

          {/* FAQ List */}
          <div className={searchQuery ? 'lg:col-span-2' : ''}>
            {searchQuery && filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any FAQs matching "{searchQuery}"
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-ocean-600 text-white rounded-xl font-semibold hover:bg-ocean-700 transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  Contact Support
                </Link>
              </div>
            ) : (
              currentCategory.map((category) => (
                <div key={category.id} className="mb-8">
                  {searchQuery && (
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <category.icon className="w-5 h-5 text-ocean-600" />
                      {category.name}
                    </h2>
                  )}

                  <div className="space-y-3">
                    {category.faqs.map((faq) => (
                      <div
                        key={faq.question}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleQuestion(faq.question)}
                          className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                              expandedQuestions.includes(faq.question) ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {expandedQuestions.includes(faq.question) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5">
                                <p className="text-gray-600">{faq.answer}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Still Need Help */}
        <div className="mt-16 bg-gradient-to-r from-ocean-600 to-ocean-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Still have questions?
          </h2>
          <p className="text-ocean-100 mb-8 max-w-2xl mx-auto">
            Our friendly team is here to help. Reach out anytime and we'll get back to you as soon as possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-ocean-700 rounded-xl font-semibold hover:bg-ocean-50 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              Send a Message
            </Link>
            <a
              href="tel:+12525550100"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ocean-500 text-white rounded-xl font-semibold hover:bg-ocean-400 transition-colors"
            >
              <Phone className="w-5 h-5" />
              (252) 555-0100
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
