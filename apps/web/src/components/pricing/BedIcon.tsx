'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BedIconProps {
  bedCount: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

/**
 * Displays a custom bed icon based on the bedroom count.
 * Uses the SOS custom isometric bed SVGs (sos-bed-1.svg through sos-bed-24.svg)
 */
export function BedIcon({
  bedCount,
  size = 'md',
  className,
  showLabel = false,
}: BedIconProps) {
  // Clamp to available icons (1-24)
  const iconNumber = Math.max(1, Math.min(24, bedCount));

  const sizeMap = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
  };

  const { width, height } = sizeMap[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Image
        src={`/icons/beds/sos-bed-${iconNumber}.svg`}
        alt={`${bedCount} bedroom${bedCount !== 1 ? 's' : ''}`}
        width={width}
        height={height}
        className="object-contain"
      />
      {showLabel && (
        <span className="text-primary font-medium">
          {bedCount} BR
        </span>
      )}
    </div>
  );
}

/**
 * Displays bedroom configuration with multiple bed icons
 */
interface BedroomConfigProps {
  config: {
    type: 'king' | 'queen' | 'full' | 'twin' | 'bunk';
    count: number;
  }[];
  className?: string;
}

export function BedroomConfig({ config, className }: BedroomConfigProps) {
  const bedTypeIcons: Record<string, number> = {
    king: 1,
    queen: 2,
    full: 3,
    twin: 4,
    bunk: 5,
  };

  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {config.map((bed, index) => (
        <div key={index} className="flex items-center gap-1">
          <Image
            src={`/icons/beds/sos-bed-${bedTypeIcons[bed.type] || 1}.svg`}
            alt={`${bed.type} bed`}
            width={32}
            height={32}
            className="object-contain"
          />
          <span className="text-sm text-primary">
            {bed.count}x {bed.type.charAt(0).toUpperCase() + bed.type.slice(1)}
          </span>
        </div>
      ))}
    </div>
  );
}
