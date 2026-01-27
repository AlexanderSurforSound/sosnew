import React from 'react';

export interface RatingProps {
  value: number;
  maxValue?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

const sizeStyles = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

const textSizeStyles = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function Rating({
  value,
  maxValue = 5,
  size = 'md',
  showValue = true,
  reviewCount,
  className = '',
}: RatingProps) {
  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.5;
  const emptyStars = maxValue - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Full stars */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <StarIcon key={`full-${i}`} className={sizeStyles[size]} filled />
      ))}

      {/* Half star */}
      {hasHalfStar && <StarIcon className={sizeStyles[size]} half />}

      {/* Empty stars */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <StarIcon key={`empty-${i}`} className={sizeStyles[size]} />
      ))}

      {/* Value text */}
      {showValue && (
        <span className={`ml-1 font-medium text-gray-700 ${textSizeStyles[size]}`}>
          {value.toFixed(1)}
        </span>
      )}

      {/* Review count */}
      {reviewCount !== undefined && (
        <span className={`text-gray-500 ${textSizeStyles[size]}`}>
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}

function StarIcon({
  className = '',
  filled = false,
  half = false,
}: {
  className?: string;
  filled?: boolean;
  half?: boolean;
}) {
  if (half) {
    return (
      <svg
        className={`text-yellow-400 ${className}`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="halfGradient">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="url(#halfGradient)"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>
    );
  }

  return (
    <svg
      className={`${filled ? 'text-yellow-400' : 'text-gray-300'} ${className}`}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
