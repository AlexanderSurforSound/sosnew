'use client';

import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  amount: number;
  originalAmount?: number;
  unit?: 'night' | 'week' | 'total';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCurrency?: boolean;
  className?: string;
}

export function PriceDisplay({
  amount,
  originalAmount,
  unit = 'week',
  size = 'md',
  showCurrency = true,
  className,
}: PriceDisplayProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: showCurrency ? 'currency' : 'decimal',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  const unitLabels = {
    night: '/night',
    week: '/week',
    total: ' total',
  };

  const hasDiscount = originalAmount && originalAmount > amount;
  const discountPercent = hasDiscount
    ? Math.round(((originalAmount - amount) / originalAmount) * 100)
    : 0;

  return (
    <div className={cn('flex flex-col', className)}>
      {hasDiscount && (
        <div className="flex items-center gap-2 mb-1">
          <span className="text-primary line-through text-sm opacity-70">
            {formatPrice(originalAmount)}
          </span>
          <span className="bg-success text-white text-xs font-bold px-2 py-0.5 rounded">
            {discountPercent}% OFF
          </span>
        </div>
      )}
      <div className="flex items-baseline gap-1">
        <span className={cn('font-bold text-primary', sizeClasses[size])}>
          {formatPrice(amount)}
        </span>
        <span className="text-primary/70 text-sm">{unitLabels[unit]}</span>
      </div>
    </div>
  );
}
