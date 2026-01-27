'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Heart,
  Users,
  Phone,
  Waves,
  Sun,
  Shield,
} from 'lucide-react';

const villages = [
  'Rodanthe',
  'Waves',
  'Salvo',
  'Avon',
  'Buxton',
  'Frisco',
  'Hatteras',
];

const values = [
  {
    icon: Heart,
    title: 'Local Knowledge',
    description: 'Our team lives and works on Hatteras Island. We know these properties and this community firsthand.',
  },
  {
    icon: Shield,
    title: 'Clear Pricing',
    description: 'No hidden fees. What you see is what you pay. We provide detailed quotes before you book.',
  },
  {
    icon: Users,
    title: 'Responsive Service',
    description: 'Three offices across the island means help is always nearby. Call us at 800.237.1138.',
  },
  {
    icon: Sun,
    title: 'Inspected Properties',
    description: 'We know every property we rent. Our team visits homes regularly to ensure quality standards.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-ocean-600 via-ocean-700 to-ocean-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-cyan-300 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 text-ocean-200 mb-4">
              <Waves className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wide">Our Story</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              We Help You Find Your
              <span className="text-cyan-300"> Happy Place</span>
            </h1>
            <p className="text-xl text-ocean-100 leading-relaxed">
              Surf or Sound Realty has been the trusted name in Hatteras Island vacation rentals for decades. With offices in Avon, Salvo, and Hatteras, we offer local expertise and personalized service across all seven villages.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Villages We Serve */}
      <div className="bg-white py-12 border-b">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Serving All of Hatteras Island</h2>
            <p className="text-gray-600">Vacation rentals in every village from Rodanthe to Hatteras</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {villages.map((village, index) => (
              <motion.span
                key={village}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="px-4 py-2 bg-ocean-50 text-ocean-700 rounded-full font-medium"
              >
                {village}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                We connect vacationers with quality rental homes across Hatteras Island. From oceanfront estates to soundside cottages, we have options for families of all sizes and budgets.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Our local offices in Avon, Salvo, and Hatteras are staffed daily from 8:30am to 5pm. Stop by to pick up keys, ask questions, or get recommendations for your stay.
              </p>
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 px-6 py-3 bg-ocean-600 text-white rounded-xl font-semibold hover:bg-ocean-700 transition-colors"
              >
                Explore Properties
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-96 bg-gradient-to-br from-ocean-200 to-cyan-200 rounded-2xl flex items-center justify-center"
            >
              <Waves className="w-24 h-24 text-ocean-400" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="py-20">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What We Stand For</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our values guide everything we do, from selecting properties to serving guests.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-ocean-100 rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="w-7 h-7 text-ocean-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="py-20 bg-gradient-to-r from-ocean-600 to-ocean-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Book?</h2>
          <p className="text-ocean-100 text-lg mb-8">
            Call us or visit one of our three offices on Hatteras Island. Open daily 8:30am - 5pm.
          </p>

          <a
            href="tel:800-237-1138"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-ocean-700 rounded-xl font-semibold hover:bg-ocean-50 transition-colors text-xl mb-8"
          >
            <Phone className="w-6 h-6" />
            800.237.1138
          </a>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-ocean-500/30 rounded-xl p-4">
              <h3 className="font-semibold mb-1">Avon Office</h3>
              <p className="text-ocean-100 text-sm">40974 NC Highway 12<br />Avon, NC 27915</p>
            </div>
            <div className="bg-ocean-500/30 rounded-xl p-4">
              <h3 className="font-semibold mb-1">Salvo Office</h3>
              <p className="text-ocean-100 text-sm">26204 Rampart St<br />Salvo, NC 27972</p>
            </div>
            <div className="bg-ocean-500/30 rounded-xl p-4">
              <h3 className="font-semibold mb-1">Hatteras Office</h3>
              <p className="text-ocean-100 text-sm">58079 NC Highway 12<br />Hatteras, NC 27943</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
