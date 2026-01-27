'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedPropertyImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
  containerClassName?: string;
  quality?: number;
  blurDataURL?: string;
}

/**
 * Optimized Property Image Component
 *
 * Implements Wander-style image optimizations:
 * - WebP/AVIF format (handled by Next.js)
 * - Lazy loading by default
 * - Blur placeholder while loading
 * - Responsive srcset
 * - Proper aspect ratio to prevent CLS
 */
export function OptimizedPropertyImage({
  src,
  alt,
  fill = false,
  width,
  height,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  className,
  containerClassName,
  quality = 80,
  blurDataURL,
}: OptimizedPropertyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generate a simple blur placeholder if none provided
  const placeholder = blurDataURL || generateBlurPlaceholder();

  if (hasError) {
    return (
      <div
        className={cn(
          'bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center',
          fill ? 'absolute inset-0' : '',
          containerClassName
        )}
        style={!fill ? { width, height } : undefined}
      >
        <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder="blur"
        blurDataURL={placeholder}
        className={cn(
          'transition-all duration-500',
          isLoading ? 'scale-105 blur-sm' : 'scale-100 blur-0',
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
      />

      {/* Loading shimmer overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      )}
    </div>
  );
}

/**
 * Generate a simple SVG blur placeholder
 */
function generateBlurPlaceholder(): string {
  // Simple gray placeholder
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f1f5f9"/>
          <stop offset="100%" style="stop-color:#e2e8f0"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Property Gallery with optimized images
 */
interface PropertyGalleryOptimizedProps {
  images: Array<{ url: string; alt?: string }>;
  propertyName: string;
  className?: string;
}

export function PropertyGalleryOptimized({
  images,
  propertyName,
  className,
}: PropertyGalleryOptimizedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayImages = images.slice(0, 5);

  return (
    <div className={cn('relative', className)}>
      {/* Main image - priority load */}
      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
        <OptimizedPropertyImage
          src={displayImages[currentIndex]?.url || ''}
          alt={displayImages[currentIndex]?.alt || propertyName}
          fill
          priority={currentIndex === 0}
          sizes="(max-width: 768px) 100vw, 70vw"
          quality={85}
        />
      </div>

      {/* Thumbnail strip */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-hide">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden transition-all',
                index === currentIndex
                  ? 'ring-2 ring-primary ring-offset-2'
                  : 'opacity-70 hover:opacity-100'
              )}
            >
              <OptimizedPropertyImage
                src={image.url}
                alt={image.alt || `${propertyName} - Image ${index + 1}`}
                fill
                sizes="80px"
                quality={60}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
