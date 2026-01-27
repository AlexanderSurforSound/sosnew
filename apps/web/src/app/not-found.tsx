'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Search, MapPin, ArrowLeft, Waves } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-ocean-50 to-cyan-50">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated Waves */}
          <div className="relative mb-8">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="flex justify-center"
            >
              <div className="w-32 h-32 bg-ocean-100 rounded-full flex items-center justify-center">
                <Waves className="w-16 h-16 text-ocean-500" />
              </div>
            </motion.div>
          </div>

          {/* 404 Text */}
          <h1 className="text-8xl font-bold text-ocean-600 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Looks like you've drifted off course
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            The page you're looking for has either moved, been washed away by the tide,
            or never existed in the first place.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ocean-600 text-white rounded-xl font-semibold hover:bg-ocean-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
            <Link
              href="/properties"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <Search className="w-5 h-5" />
              Search Properties
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Maybe you were looking for:</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <Link
                href="/explore"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-ocean-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-ocean-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Explore</p>
                  <p className="text-sm text-gray-500">Discover Hatteras Island</p>
                </div>
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-ocean-100 rounded-lg flex items-center justify-center">
                  <ArrowLeft className="w-5 h-5 text-ocean-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Contact Us</p>
                  <p className="text-sm text-gray-500">Get help from our team</p>
                </div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
