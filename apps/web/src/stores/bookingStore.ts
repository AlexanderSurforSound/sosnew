import { create } from 'zustand';
import type { PropertyDetail, GuestInfo, Pricing } from '@/types';

interface Guests {
  adults: number;
  children: number;
  pets: number;
}

interface BookingState {
  property: PropertyDetail | null;
  checkIn: string | null;
  checkOut: string | null;
  guests: Guests;
  pricing: Pricing | null;
  guestInfo: GuestInfo;

  setProperty: (property: PropertyDetail) => void;
  setDates: (checkIn: string, checkOut: string) => void;
  setGuests: (guests: Partial<Guests>) => void;
  setPricing: (pricing: Pricing) => void;
  setGuestInfo: (info: GuestInfo) => void;
  reset: () => void;
}

const initialGuestInfo: GuestInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
};

const initialGuests: Guests = {
  adults: 2,
  children: 0,
  pets: 0,
};

export const useBookingStore = create<BookingState>((set) => ({
  property: null,
  checkIn: null,
  checkOut: null,
  guests: initialGuests,
  pricing: null,
  guestInfo: initialGuestInfo,

  setProperty: (property) => set({ property }),

  setDates: (checkIn, checkOut) => set({ checkIn, checkOut }),

  setGuests: (guests) =>
    set((state) => ({
      guests: { ...state.guests, ...guests },
    })),

  setPricing: (pricing) => set({ pricing }),

  setGuestInfo: (guestInfo) => set({ guestInfo }),

  reset: () =>
    set({
      property: null,
      checkIn: null,
      checkOut: null,
      guests: initialGuests,
      pricing: null,
      guestInfo: initialGuestInfo,
    }),
}));
