'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, TrendingDown, TrendingUp, Minus, Info } from 'lucide-react';

interface PriceCalendarProps {
  propertyId: string;
  baseRate: number;
  onDateSelect?: (checkIn: Date, checkOut: Date) => void;
  minNights?: number;
}

interface DayPrice {
  date: Date;
  price: number;
  available: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  demandLevel: 'low' | 'medium' | 'high';
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Simulated pricing logic
const generatePricing = (baseRate: number, month: number, year: number): DayPrice[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prices: DayPrice[] = [];

  // Peak season months (June-August)
  const isPeakSeason = month >= 5 && month <= 7;
  // Shoulder season (April-May, September-October)
  const isShoulderSeason = (month >= 3 && month <= 4) || (month >= 8 && month <= 9);

  // Holiday dates (simplified)
  const holidays = [
    { month: 6, day: 4 }, // July 4th
    { month: 8, day: 1 }, // Labor Day weekend (approx)
    { month: 4, day: 25 }, // Memorial Day weekend (approx)
  ];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Fri-Sat
    const isHoliday = holidays.some(h => h.month === month && Math.abs(h.day - day) <= 3);

    let multiplier = 1;
    let demandLevel: 'low' | 'medium' | 'high' = 'medium';

    // Season adjustments
    if (isPeakSeason) {
      multiplier *= 1.5;
      demandLevel = 'high';
    } else if (isShoulderSeason) {
      multiplier *= 1.2;
      demandLevel = 'medium';
    } else {
      multiplier *= 0.8;
      demandLevel = 'low';
    }

    // Weekend premium
    if (isWeekend) {
      multiplier *= 1.15;
    }

    // Holiday premium
    if (isHoliday) {
      multiplier *= 1.3;
      demandLevel = 'high';
    }

    // Add some randomness for realism
    multiplier *= 0.95 + Math.random() * 0.1;

    // Some dates unavailable
    const available = Math.random() > 0.15;

    prices.push({
      date,
      price: Math.round(baseRate * multiplier),
      available,
      isWeekend,
      isHoliday,
      demandLevel,
    });
  }

  return prices;
};

export default function PriceCalendar({
  propertyId,
  baseRate,
  onDateSelect,
  minNights = 3,
}: PriceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCheckIn, setSelectedCheckIn] = useState<Date | null>(null);
  const [selectedCheckOut, setSelectedCheckOut] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [flexibleMode, setFlexibleMode] = useState(false);
  const [flexibleMonths, setFlexibleMonths] = useState<number[]>([]);

  const pricing = useMemo(
    () => generatePricing(baseRate, currentMonth.getMonth(), currentMonth.getFullYear()),
    [baseRate, currentMonth]
  );

  const nextMonthPricing = useMemo(() => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return generatePricing(baseRate, nextMonth.getMonth(), nextMonth.getFullYear());
  }, [baseRate, currentMonth]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const isDateInRange = (date: Date) => {
    if (!selectedCheckIn || !hoveredDate) return false;
    const checkIn = selectedCheckIn.getTime();
    const hover = hoveredDate.getTime();
    const current = date.getTime();
    return current > checkIn && current <= hover;
  };

  const isDateSelected = (date: Date) => {
    if (selectedCheckIn && date.toDateString() === selectedCheckIn.toDateString()) return true;
    if (selectedCheckOut && date.toDateString() === selectedCheckOut.toDateString()) return true;
    return false;
  };

  const handleDateClick = (dayPrice: DayPrice) => {
    if (!dayPrice.available) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dayPrice.date < today) return;

    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      setSelectedCheckIn(dayPrice.date);
      setSelectedCheckOut(null);
    } else {
      if (dayPrice.date > selectedCheckIn) {
        setSelectedCheckOut(dayPrice.date);
        onDateSelect?.(selectedCheckIn, dayPrice.date);
      } else {
        setSelectedCheckIn(dayPrice.date);
      }
    }
  };

  const getPriceColor = (demandLevel: 'low' | 'medium' | 'high') => {
    switch (demandLevel) {
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-amber-600 bg-amber-50';
      case 'high':
        return 'text-red-600 bg-red-50';
    }
  };

  const calculateTotalPrice = () => {
    if (!selectedCheckIn || !selectedCheckOut) return null;

    let total = 0;
    let nights = 0;
    const current = new Date(selectedCheckIn);

    while (current < selectedCheckOut) {
      const dayPrice = pricing.find(
        (p) => p.date.toDateString() === current.toDateString()
      );
      if (dayPrice) {
        total += dayPrice.price;
        nights++;
      }
      current.setDate(current.getDate() + 1);
    }

    return { total, nights, average: Math.round(total / nights) };
  };

  const totalPrice = calculateTotalPrice();

  const lowestPriceDay = useMemo(() => {
    const available = pricing.filter((p) => p.available);
    return available.reduce((min, p) => (p.price < min.price ? p : min), available[0]);
  }, [pricing]);

  const renderCalendarMonth = (monthOffset: number) => {
    const monthDate = new Date(currentMonth);
    monthDate.setMonth(monthDate.getMonth() + monthOffset);
    const { firstDay, daysInMonth } = getDaysInMonth(monthDate);
    const monthPricing = monthOffset === 0 ? pricing : nextMonthPricing;

    return (
      <div className="flex-1">
        <h3 className="text-center font-semibold text-gray-900 mb-4">
          {months[monthDate.getMonth()]} {monthDate.getFullYear()}
        </h3>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {days.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Day cells */}
          {monthPricing.map((dayPrice, index) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isPast = dayPrice.date < today;
            const selected = isDateSelected(dayPrice.date);
            const inRange = isDateInRange(dayPrice.date);

            return (
              <motion.button
                key={index}
                onClick={() => handleDateClick(dayPrice)}
                onMouseEnter={() => setHoveredDate(dayPrice.date)}
                onMouseLeave={() => setHoveredDate(null)}
                disabled={!dayPrice.available || isPast}
                className={`
                  aspect-square p-1 rounded-lg text-center transition-all relative
                  ${!dayPrice.available || isPast ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:ring-2 hover:ring-ocean-300'}
                  ${selected ? 'bg-ocean-600 text-white ring-2 ring-ocean-600' : ''}
                  ${inRange ? 'bg-ocean-100' : ''}
                  ${!selected && !inRange ? 'hover:bg-gray-50' : ''}
                `}
                whileHover={{ scale: dayPrice.available && !isPast ? 1.05 : 1 }}
                whileTap={{ scale: dayPrice.available && !isPast ? 0.95 : 1 }}
              >
                <div className={`text-sm font-medium ${selected ? 'text-white' : 'text-gray-900'}`}>
                  {dayPrice.date.getDate()}
                </div>
                {dayPrice.available && !isPast && (
                  <div
                    className={`text-[10px] font-semibold mt-0.5 rounded px-1 ${
                      selected ? 'text-white/90' : getPriceColor(dayPrice.demandLevel)
                    }`}
                  >
                    ${dayPrice.price}
                  </div>
                )}
                {!dayPrice.available && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-[1px] bg-gray-400 rotate-45" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  const toggleFlexibleMonth = (month: number) => {
    setFlexibleMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Select Dates</h2>
            <p className="text-sm text-gray-500">Prices vary by date and demand</p>
          </div>
          <button
            onClick={() => setFlexibleMode(!flexibleMode)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              flexibleMode
                ? 'bg-ocean-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            I'm Flexible
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
            <span className="text-gray-600">Low demand</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
            <span className="text-gray-600">Medium demand</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-100 border border-red-300" />
            <span className="text-gray-600">High demand</span>
          </div>
        </div>
      </div>

      {/* Flexible Mode */}
      <AnimatePresence>
        {flexibleMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-gray-100"
          >
            <div className="p-4 bg-ocean-50">
              <p className="text-sm text-ocean-800 mb-3">
                Select the months you're flexible with:
              </p>
              <div className="flex flex-wrap gap-2">
                {months.map((month, index) => {
                  const monthDate = new Date();
                  monthDate.setMonth(index);
                  const isPast = index < new Date().getMonth();

                  return (
                    <button
                      key={month}
                      onClick={() => !isPast && toggleFlexibleMonth(index)}
                      disabled={isPast}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        isPast
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : flexibleMonths.includes(index)
                          ? 'bg-ocean-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:border-ocean-300'
                      }`}
                    >
                      {month.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
              {flexibleMonths.length > 0 && (
                <div className="mt-4 p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-2 text-green-600">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Best rates in {months[flexibleMonths[0]]}: from ${lowestPriceDay?.price}/night
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <button
          onClick={() => {
            const prev = new Date(currentMonth);
            prev.setMonth(prev.getMonth() - 1);
            if (prev >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)) {
              setCurrentMonth(prev);
            }
          }}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <span className="font-medium text-gray-900">
          {months[currentMonth.getMonth()]} - {months[(currentMonth.getMonth() + 1) % 12]}{' '}
          {currentMonth.getFullYear()}
        </span>
        <button
          onClick={() => {
            const next = new Date(currentMonth);
            next.setMonth(next.getMonth() + 1);
            setCurrentMonth(next);
          }}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Calendars */}
      <div className="p-4">
        <div className="flex gap-8">
          {renderCalendarMonth(0)}
          <div className="hidden lg:block w-px bg-gray-200" />
          <div className="hidden lg:flex flex-1">{renderCalendarMonth(1)}</div>
        </div>
      </div>

      {/* Selection Summary */}
      <AnimatePresence>
        {(selectedCheckIn || totalPrice) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 overflow-hidden"
          >
            <div className="p-4 bg-gray-50">
              {selectedCheckIn && !selectedCheckOut && (
                <div className="flex items-center gap-2 text-ocean-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Select your checkout date</span>
                </div>
              )}

              {totalPrice && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        {selectedCheckIn?.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        -{' '}
                        {selectedCheckOut?.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {totalPrice.nights} nights · ${totalPrice.average}/night avg
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">${totalPrice.total}</p>
                      <p className="text-xs text-gray-500">before fees & taxes</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedCheckIn(null);
                        setSelectedCheckOut(null);
                      }}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Clear dates
                    </button>
                    <button className="flex-1 py-2 px-4 bg-ocean-600 text-white rounded-lg text-sm font-medium hover:bg-ocean-700 transition-colors">
                      Continue
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      <div className="p-4 border-t border-gray-100 bg-amber-50">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Pro tip:</p>
            <p>
              Book midweek stays for the best rates. Prices are typically 15-20% lower Sunday-Thursday.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
