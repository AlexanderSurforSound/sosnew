'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  showLoadingState?: boolean;
}

// Generate a simple blur placeholder
const generateBlurPlaceholder = (primaryColor = '#e0f2fe') => {
  return `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 5">
      <filter id="b" colorInterpolationFilters="sRGB">
        <feGaussianBlur stdDeviation="1"/>
      </filter>
      <rect preserveAspectRatio="none" filter="url(#b)" x="0" y="0" height="100%" width="100%" fill="${primaryColor}"/>
    </svg>`
  ).toString('base64')}`;
};

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className = '',
  containerClassName = '',
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  showLoadingState = true,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div
        className={`bg-gradient-to-br from-ocean-100 to-ocean-200 flex items-center justify-center ${containerClassName}`}
      >
        <div className="text-center text-ocean-400">
          <svg
            className="w-12 h-12 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">Image unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      <AnimatePresence>
        {isLoading && showLoadingState && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-10"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        className="w-full h-full"
      >
        {fill ? (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            quality={quality}
            className={`object-cover ${className}`}
            placeholder={placeholder}
            blurDataURL={blurDataURL || generateBlurPlaceholder()}
            onLoad={handleLoad}
            onError={handleError}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            priority={priority}
            quality={quality}
            className={className}
            placeholder={placeholder}
            blurDataURL={blurDataURL || generateBlurPlaceholder()}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </motion.div>
    </div>
  );
}

// Progressive image load with low-quality placeholder
export function ProgressiveImage({
  src,
  lowQualitySrc,
  alt,
  fill = false,
  className = '',
  containerClassName = '',
}: {
  src: string;
  lowQualitySrc?: string;
  alt: string;
  fill?: boolean;
  className?: string;
  containerClassName?: string;
}) {
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Low quality placeholder */}
      {lowQualitySrc && !isHighQualityLoaded && (
        <Image
          src={lowQualitySrc}
          alt={alt}
          fill={fill}
          className={`${className} blur-lg scale-105`}
        />
      )}

      {/* High quality image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHighQualityLoaded ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0"
      >
        <Image
          src={src}
          alt={alt}
          fill={fill}
          className={className}
          onLoad={() => setIsHighQualityLoaded(true)}
        />
      </motion.div>
    </div>
  );
}

// Image gallery with lazy loading
export function LazyImageGrid({
  images,
  columns = 3,
  gap = 4,
}: {
  images: Array<{ src: string; alt: string }>;
  columns?: number;
  gap?: number;
}) {
  return (
    <div
      className={`grid gap-${gap}`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {images.map((image, index) => (
        <motion.div
          key={image.src}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: index * 0.1 }}
          className="relative aspect-square rounded-xl overflow-hidden"
        >
          <OptimizedImage
            src={image.src}
            alt={image.alt}
            fill
            containerClassName="w-full h-full"
            className="hover:scale-105 transition-transform duration-500"
          />
        </motion.div>
      ))}
    </div>
  );
}

// Hero image with Ken Burns effect
export function HeroImage({
  src,
  alt,
  overlay = true,
  overlayOpacity = 0.4,
  kenBurns = true,
}: {
  src: string;
  alt: string;
  overlay?: boolean;
  overlayOpacity?: number;
  kenBurns?: boolean;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        animate={
          kenBurns
            ? {
                scale: [1, 1.1],
              }
            : {}
        }
        transition={
          kenBurns
            ? {
                duration: 20,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'linear',
              }
            : {}
        }
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          quality={90}
          className="object-cover"
        />
      </motion.div>
      {overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
    </div>
  );
}

// Image with zoom on hover
export function ZoomableImage({
  src,
  alt,
  fill = true,
  className = '',
}: {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
}) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <motion.div
      className="relative overflow-hidden cursor-zoom-in"
      onHoverStart={() => setIsZoomed(true)}
      onHoverEnd={() => setIsZoomed(false)}
    >
      <motion.div
        animate={{ scale: isZoomed ? 1.1 : 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full h-full"
      >
        <Image
          src={src}
          alt={alt}
          fill={fill}
          className={`object-cover ${className}`}
        />
      </motion.div>
    </motion.div>
  );
}
