'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Home,
  DollarSign,
  Users,
  Phone,
  Mail,
  ArrowRight,
  Check,
  Wrench,
  ClipboardCheck,
  TrendingUp,
  LucideIcon,
} from 'lucide-react';

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, LucideIcon> = {
  Home,
  DollarSign,
  Users,
  Wrench,
  ClipboardCheck,
  TrendingUp,
  Phone,
  Mail,
};

interface ContentProps {
  heroTagline: string;
  heroHeading: string;
  heroText: string;
  heroPrimaryButton: { text: string; url: string };
  heroSecondaryButton: { text: string; url: string };
  stats: Array<{ value: string; label: string }>;
  benefitsSectionHeading: string;
  benefitsSectionSubheading: string;
  benefits: Array<{ icon: string; title: string; description: string }>;
  servicesSectionHeading: string;
  serviceTiers: Array<{
    name: string;
    description: string;
    popular: boolean;
    features: string[];
  }>;
  contactHeading: string;
  contactText: string;
  contactPhone: string;
  contactEmail: string;
}

export default function OwnersPageClient({ content }: { content: ContentProps }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyAddress: '',
    bedrooms: '',
    currentlyRenting: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Home className="w-6 h-6 text-cyan-400" />
                <span className="font-medium text-cyan-400">{content.heroTagline}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {content.heroHeading}
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                {content.heroText}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={content.heroPrimaryButton.url}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  {content.heroPrimaryButton.text}
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href={content.heroSecondaryButton.url}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  {content.heroSecondaryButton.text}
                </a>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-cols-2 gap-6"
            >
              {content.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center"
                >
                  <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-gray-300">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-cyan-600 font-semibold text-sm uppercase tracking-wider mb-2 block">
              Why Partner With Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {content.benefitsSectionHeading}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {content.benefitsSectionSubheading}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.benefits.map((benefit, index) => {
              const Icon = iconMap[benefit.icon] || Home;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-cyan-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* What's Included */}
      {content.serviceTiers.length > 0 && (
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-cyan-600 font-semibold text-sm uppercase tracking-wider mb-2 block">
                What's Included
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {content.servicesSectionHeading}
              </h2>
            </div>

            <div className="max-w-2xl mx-auto">
              {content.serviceTiers.map((tier) => (
                <div
                  key={tier.name}
                  className="bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-2xl p-8"
                >
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-cyan-100 mb-6">{tier.description}</p>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 flex-shrink-0 mt-0.5 text-cyan-200" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contact Form */}
      <div id="contact-form" className="py-20 bg-gradient-to-br from-slate-900 to-cyan-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <span className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-2 block">
                Get Started
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {content.contactHeading}
              </h2>
              <p className="text-gray-300 mb-8">
                {content.contactText}
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-medium">Call Us</p>
                    <a href={`tel:${content.contactPhone.replace(/\D/g, '')}`} className="text-cyan-400 hover:text-cyan-300">
                      {content.contactPhone}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-medium">Email Us</p>
                    <a href={`mailto:${content.contactEmail}`} className="text-cyan-400 hover:text-cyan-300">
                      {content.contactEmail}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 text-gray-900">
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Address</label>
                  <input
                    type="text"
                    required
                    value={formData.propertyAddress}
                    onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Street address, Village"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                    <select
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, '9+'].map((num) => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currently Renting?</label>
                    <select
                      value={formData.currentlyRenting}
                      onChange={(e) => setFormData({ ...formData, currentlyRenting: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="yes-other">Yes, with another company</option>
                      <option value="yes-self">Yes, self-managed</option>
                      <option value="no">No, not currently renting</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Tell us about your property or any questions you have..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2"
                >
                  Submit Inquiry
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
