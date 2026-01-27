'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Info, X } from 'lucide-react';

interface LineItem {
  id: string;
  description: string;
  amount: number;
  type: 'base' | 'fee' | 'tax' | 'discount' | 'insurance' | 'addon';
  isRemovable?: boolean;
  tooltip?: string;
}

interface CostSummaryProps {
  lineItems: LineItem[];
  originalBaseRate?: number;
  hasSpecialRate?: boolean;
  priorPayments?: number;
  onRemoveItem?: (itemId: string) => void;
  className?: string;
}

export function CostSummary({
  lineItems,
  originalBaseRate,
  hasSpecialRate = false,
  priorPayments = 0,
  onRemoveItem,
  className,
}: CostSummaryProps) {
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Separate items by type
  const preTaxItems = lineItems.filter(
    (item) => item.type !== 'tax' && item.type !== 'discount'
  );
  const taxItems = lineItems.filter((item) => item.type === 'tax');
  const discountItems = lineItems.filter((item) => item.type === 'discount');

  // Calculate totals
  const subtotal = preTaxItems.reduce((sum, item) => sum + item.amount, 0);
  const taxTotal = taxItems.reduce((sum, item) => sum + item.amount, 0);
  const discountTotal = discountItems.reduce((sum, item) => sum + item.amount, 0);
  const totalCost = subtotal + taxTotal - Math.abs(discountTotal);
  const totalDue = totalCost - priorPayments;

  const TooltipButton = ({ tooltip, itemId }: { tooltip: string; itemId: string }) => (
    <div className="relative inline-block">
      <button
        className="w-5 h-5 rounded-full border-2 border-info bg-white flex items-center justify-center ml-1 hover:bg-info/10 transition-colors"
        onClick={() => setOpenTooltip(openTooltip === itemId ? null : itemId)}
        aria-label="More information"
      >
        <Info className="w-3 h-3 text-info" />
      </button>
      {openTooltip === itemId && (
        <div className="absolute z-10 left-0 top-full mt-2 w-64 p-3 bg-white rounded-lg shadow-lg border border-gray-200 text-sm text-primary">
          {tooltip}
          <button
            className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
            onClick={() => setOpenTooltip(null)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        'bg-white rounded-lg p-4 border-2 border-primary/20',
        className
      )}
    >
      {/* Header */}
      <h3 className="text-primary font-bold text-center border-b border-gray-200 pb-2 mb-3">
        Cost Summary
      </h3>

      {/* Original Rate (if special) */}
      {hasSpecialRate && originalBaseRate && (
        <div className="flex justify-between items-center text-primary mb-2">
          <span className="line-through opacity-70">Base Rate</span>
          <span className="line-through opacity-70">
            {formatCurrency(originalBaseRate)}
          </span>
        </div>
      )}

      {/* Pre-tax Line Items */}
      {preTaxItems.map((item) => (
        <div
          key={item.id}
          className="flex justify-between items-center text-primary mb-2"
        >
          <span className="flex items-center">
            {item.type === 'base' && hasSpecialRate ? 'Special Rate' : item.description}
            {item.tooltip && <TooltipButton tooltip={item.tooltip} itemId={item.id} />}
          </span>
          <span className="flex items-center">
            {item.isRemovable && onRemoveItem && (
              <button
                className="text-danger underline text-sm mr-2 hover:text-danger/80"
                onClick={() => onRemoveItem(item.id)}
              >
                Remove
              </button>
            )}
            {formatCurrency(item.amount)}
          </span>
        </div>
      ))}

      {/* Discounts */}
      {discountItems.map((item) => (
        <div
          key={item.id}
          className="flex justify-between items-center text-success mb-2"
        >
          <span>{item.description}</span>
          <span>-{formatCurrency(Math.abs(item.amount))}</span>
        </div>
      ))}

      {/* Tax Section */}
      {taxItems.length > 0 && (
        <div className="border-t border-gray-200 pt-3 mt-3">
          {taxItems.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center text-primary mb-2"
            >
              <span>{item.description}</span>
              <span>{formatCurrency(item.amount)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Prior Payments & Total Due */}
      {priorPayments > 0 ? (
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between items-center text-primary mb-2">
            <span>Subtotal</span>
            <span>{formatCurrency(totalCost)}</span>
          </div>
          <div className="flex justify-between items-center text-primary mb-2">
            <span className="flex items-center">
              Prior Payments
              <TooltipButton
                tooltip="Payments previously made toward this reservation."
                itemId="prior-payments"
              />
            </span>
            <span>({formatCurrency(priorPayments)})</span>
          </div>
          <div className="flex justify-between items-center text-info font-bold text-xl mt-3">
            <span>Total Due</span>
            <span>{formatCurrency(totalDue)}</span>
          </div>
        </div>
      ) : (
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between items-center text-info font-bold text-xl">
            <span>Total</span>
            <span>{formatCurrency(totalCost)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
