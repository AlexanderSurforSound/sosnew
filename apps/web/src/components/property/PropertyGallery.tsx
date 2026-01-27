'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Grid } from 'lucide-react';
import type { PropertyImage } from '@/types';

interface PropertyGalleryProps {
  images: PropertyImage[];
  propertyName: string;
}

export function PropertyGallery({ images, propertyName }: PropertyGalleryProps) {
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="bg-gray-200 aspect-[2/1] flex items-center justify-center">
        <span className="text-gray-500">No images available</span>
      </div>
    );
  }

  const primaryImage = images.find((img) => img.isPrimary) || images[0];
  const secondaryImages = images.filter((img) => img !== primaryImage).slice(0, 4);

  const goTo = (index: number) => {
    setCurrentIndex(index);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      {/* Gallery Grid */}
      <div className="container-page py-4">
        <div className="grid grid-cols-4 gap-2 h-[400px] rounded-xl overflow-hidden">
          {/* Main Image */}
          <div
            className="col-span-2 row-span-2 relative cursor-pointer"
            onClick={() => {
              setCurrentIndex(0);
              setShowModal(true);
            }}
          >
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || propertyName}
              fill
              className="object-cover hover:opacity-95 transition-opacity"
              priority
            />
          </div>

          {/* Secondary Images */}
          {secondaryImages.map((image, index) => (
            <div
              key={index}
              className="relative cursor-pointer"
              onClick={() => {
                setCurrentIndex(index + 1);
                setShowModal(true);
              }}
            >
              <Image
                src={image.url}
                alt={image.alt || `${propertyName} photo ${index + 2}`}
                fill
                className="object-cover hover:opacity-95 transition-opacity"
              />

              {/* Show all photos button on last image */}
              {index === secondaryImages.length - 1 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(0);
                      setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
                  >
                    <Grid className="w-4 h-4" />
                    Show all {images.length} photos
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Placeholder for missing images */}
          {secondaryImages.length < 4 &&
            Array.from({ length: 4 - secondaryImages.length }).map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="bg-gray-200 flex items-center justify-center"
              >
                <span className="text-gray-400 text-sm">No image</span>
              </div>
            ))}
        </div>
      </div>

      {/* Modal Gallery */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
            <span className="text-white">
              {currentIndex + 1} / {images.length}
            </span>
            <button
              onClick={() => setShowModal(false)}
              className="p-2 text-white hover:bg-white/10 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Image */}
          <div className="absolute inset-0 flex items-center justify-center p-16">
            <div className="relative w-full h-full">
              <Image
                src={images[currentIndex].url}
                alt={images[currentIndex].alt || `${propertyName} photo ${currentIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Navigation */}
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/10 rounded-full"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/10 rounded-full"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Thumbnails */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex gap-2 justify-center overflow-x-auto hide-scrollbar">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goTo(index)}
                  className={`relative w-16 h-16 rounded overflow-hidden flex-shrink-0 ${
                    index === currentIndex ? 'ring-2 ring-white' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
