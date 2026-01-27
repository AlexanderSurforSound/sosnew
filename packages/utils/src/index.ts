// Date utilities
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', options ?? {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateRange(checkIn: string | Date, checkOut: string | Date): string {
  const start = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
  const end = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;

  const sameMonth = start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();

  if (sameMonth && sameYear) {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.getDate()}, ${end.getFullYear()}`;
  }

  if (sameYear) {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${end.getFullYear()}`;
  }

  return `${formatDate(start)} - ${formatDate(end)}`;
}

export function getNightsBetween(checkIn: string | Date, checkOut: string | Date): number {
  const start = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
  const end = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}

export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Currency formatting
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyDetailed(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// String utilities
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural ?? singular + 's'}`;
}

// Guest count formatting
export function formatGuestCount(adults: number, children: number, pets: number): string {
  const parts: string[] = [];

  if (adults > 0) {
    parts.push(pluralize(adults, 'adult'));
  }
  if (children > 0) {
    parts.push(pluralize(children, 'child', 'children'));
  }
  if (pets > 0) {
    parts.push(pluralize(pets, 'pet'));
  }

  return parts.join(', ') || 'No guests';
}

// Property utilities
export function formatPropertySpecs(bedrooms: number, bathrooms: number, sleeps: number): string {
  return `${bedrooms} BR • ${bathrooms} BA • Sleeps ${sleeps}`;
}

// Phone formatting
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith('1'));
}

// Loyalty tier utilities
export type LoyaltyTier = 'Explorer' | 'Adventurer' | 'Islander' | 'Legend';

export const LOYALTY_TIERS: Record<LoyaltyTier, { minPoints: number; benefits: string[] }> = {
  Explorer: {
    minPoints: 0,
    benefits: ['Earn 1 point per $1 spent', 'Member-only offers'],
  },
  Adventurer: {
    minPoints: 1000,
    benefits: ['Earn 1.25 points per $1 spent', 'Early booking access', 'Free welcome basket'],
  },
  Islander: {
    minPoints: 5000,
    benefits: ['Earn 1.5 points per $1 spent', 'Priority support', 'Free beach gear rental'],
  },
  Legend: {
    minPoints: 15000,
    benefits: ['Earn 2 points per $1 spent', 'Dedicated concierge', 'Complimentary upgrades'],
  },
};

export function getLoyaltyTier(points: number): LoyaltyTier {
  if (points >= 15000) return 'Legend';
  if (points >= 5000) return 'Islander';
  if (points >= 1000) return 'Adventurer';
  return 'Explorer';
}

export function getPointsToNextTier(points: number): { nextTier: LoyaltyTier | null; pointsNeeded: number } {
  const currentTier = getLoyaltyTier(points);

  switch (currentTier) {
    case 'Explorer':
      return { nextTier: 'Adventurer', pointsNeeded: 1000 - points };
    case 'Adventurer':
      return { nextTier: 'Islander', pointsNeeded: 5000 - points };
    case 'Islander':
      return { nextTier: 'Legend', pointsNeeded: 15000 - points };
    case 'Legend':
      return { nextTier: null, pointsNeeded: 0 };
  }
}

// URL utilities
export function buildQueryString(params: Record<string, string | number | boolean | string[] | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach(v => searchParams.append(key, v));
    } else {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// Error handling
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}

// Async utilities
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Array utilities
export function groupBy<T>(array: T[], key: keyof T | ((item: T) => string)): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : String(item[key]);
    (result[groupKey] = result[groupKey] || []).push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function uniqueBy<T>(array: T[], key: keyof T | ((item: T) => string)): T[] {
  const seen = new Set<string>();
  return array.filter(item => {
    const k = typeof key === 'function' ? key(item) : String(item[key]);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}
