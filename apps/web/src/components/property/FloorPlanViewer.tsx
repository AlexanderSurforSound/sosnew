'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ChevronLeft, ChevronRight, X, ZoomIn, Bed, Bath } from 'lucide-react';
import Image from 'next/image';

interface FloorLevel {
  level: string;
  image: string;
  bedrooms?: {
    name: string;
    beds: string;
    bathroom?: string;
  }[];
}

interface FloorPlanViewerProps {
  floors: FloorLevel[];
  propertyName: string;
}

export function FloorPlanViewer({ floors, propertyName }: FloorPlanViewerProps) {
  const [activeFloor, setActiveFloor] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  if (!floors || floors.length === 0) {
    return null;
  }

  const currentFloor = floors[activeFloor];

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Layers className="w-5 h-5 text-ocean-600" />
        <h3 className="text-lg font-semibold">Floor Plans</h3>
      </div>

      {/* Floor Selector */}
      {floors.length > 1 && (
        <div className="flex gap-2 mb-4">
          {floors.map((floor, index) => (
            <button
              key={floor.level}
              onClick={() => setActiveFloor(index)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFloor === index
                  ? 'bg-ocean-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {floor.level}
            </button>
          ))}
        </div>
      )}

      {/* Floor Plan Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFloor}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Image */}
          <div
            className="relative aspect-video bg-white rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => setShowLightbox(true)}
          >
            <Image
              src={currentFloor.image}
              alt={`${propertyName} - ${currentFloor.level} floor plan`}
              fill
              className="object-contain"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-3 shadow-lg">
                <ZoomIn className="w-6 h-6 text-gray-700" />
              </div>
            </div>
          </div>

          {/* Room Details */}
          {currentFloor.bedrooms && currentFloor.bedrooms.length > 0 && (
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {currentFloor.bedrooms.map((bedroom, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200"
                >
                  <div className="w-10 h-10 bg-ocean-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bed className="w-5 h-5 text-ocean-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{bedroom.name}</p>
                    <p className="text-sm text-gray-500">{bedroom.beds}</p>
                  </div>
                  {bedroom.bathroom && (
                    <div className="ml-auto flex items-center gap-1 text-gray-500">
                      <Bath className="w-4 h-4" />
                      <span className="text-sm">{bedroom.bathroom}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setShowLightbox(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Navigation */}
            {floors.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFloor((prev) => (prev > 0 ? prev - 1 : floors.length - 1));
                  }}
                  className="absolute left-4 p-3 text-white hover:bg-white/20 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFloor((prev) => (prev < floors.length - 1 ? prev + 1 : 0));
                  }}
                  className="absolute right-4 p-3 text-white hover:bg-white/20 rounded-full transition-colors"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Image */}
            <motion.div
              key={activeFloor}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={currentFloor.image}
                alt={`${propertyName} - ${currentFloor.level} floor plan`}
                fill
                className="object-contain"
              />
            </motion.div>

            {/* Floor Name */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full">
              {currentFloor.level}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
