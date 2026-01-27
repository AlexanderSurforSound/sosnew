'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Check,
  AlertCircle,
  Calendar,
  Users,
  Shield,
  CreditCard,
  Gift,
  Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useBookingStore } from '@/stores/bookingStore';
import { useAuth } from '@/hooks/useAuth';
import { DateSelection } from '@/components/booking/DateSelection';
import { GuestInfo } from '@/components/booking/GuestInfo';
import { PaymentForm } from '@/components/booking/PaymentForm';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { UpsellAddons, availableAddons } from '@/components/booking/UpsellAddons';
import { TravelInsurance, InsurancePlan, insurancePlans } from '@/components/booking/TravelInsurance';
import { PaymentOptions, PaymentOption } from '@/components/booking/PaymentOptions';
import { LeaseAgreement } from '@/components/booking/LeaseAgreement';
import { differenceInDays } from 'date-fns';
import { FileText } from 'lucide-react';

type BookingStep = 'dates' | 'addons' | 'guests' | 'protection' | 'agreement' | 'payment';

const steps: { id: BookingStep; label: string; icon: React.ElementType }[] = [
  { id: 'dates', label: 'Dates', icon: Calendar },
  { id: 'addons', label: 'Enhance', icon: Gift },
  { id: 'guests', label: 'Details', icon: Users },
  { id: 'protection', label: 'Protect', icon: Shield },
  { id: 'agreement', label: 'Agreement', icon: FileText },
  { id: 'payment', label: 'Payment', icon: CreditCard },
];

export default function BookingPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [step, setStep] = useState<BookingStep>('dates');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add-ons state
  const [selectedAddons, setSelectedAddons] = useState<{ id: string; quantity: number }[]>([]);

  // Insurance state
  const [selectedInsurance, setSelectedInsurance] = useState<InsurancePlan | null>(null);

  // Payment option state
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('full');

  // Agreement state
  const [signature, setSignature] = useState<string | null>(null);
  const [agreedAddendums, setAgreedAddendums] = useState<string[]>([]);

  const {
    property,
    checkIn,
    checkOut,
    guests,
    pricing,
    guestInfo,
    setProperty,
    setGuestInfo,
    setPricing,
  } = useBookingStore();

  // Calculate nights
  const nights = checkIn && checkOut
    ? differenceInDays(new Date(checkOut), new Date(checkIn))
    : 0;

  // Calculate total with add-ons and insurance
  const addonsTotal = selectedAddons.reduce((sum, addon) => {
    const addonData = availableAddons.find((a) => a.id === addon.id);
    if (!addonData) return sum;
    const price = addonData.priceType === 'flat' ? addonData.price : addonData.price * nights;
    return sum + price * addon.quantity;
  }, 0);

  const insuranceTotal = selectedInsurance
    ? Math.round((pricing?.total || 0) * selectedInsurance.price)
    : 0;

  const grandTotal = (pricing?.total || 0) + addonsTotal + insuranceTotal;

  // Load property if not in store
  useEffect(() => {
    if (!property) {
      api.getProperty(params.slug).then(setProperty).catch(console.error);
    }
  }, [params.slug, property, setProperty]);

  // Pre-fill guest info from user profile
  useEffect(() => {
    if (user && !guestInfo.email) {
      setGuestInfo({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        phone: user.phone || '',
      });
    }
  }, [user, guestInfo.email, setGuestInfo]);

  const handlePaymentSubmit = async (paymentToken: string) => {
    if (!property || !checkIn || !checkOut || !pricing) return;

    setIsLoading(true);
    setError(null);

    try {
      const reservation = await api.createReservation({
        propertyId: property.trackId,
        checkIn: checkIn,
        checkOut: checkOut,
        adults: guests.adults,
        children: guests.children,
        pets: guests.pets,
        guest: guestInfo,
        addons: selectedAddons,
        insurance: selectedInsurance ? {
          planId: selectedInsurance.id,
          amount: insuranceTotal,
        } : undefined,
        agreement: {
          signature: signature!,
          agreedAddendums,
          signedAt: new Date().toISOString(),
        },
        payment: {
          token: paymentToken,
          amount: paymentOption === 'full' ? grandTotal : Math.round(grandTotal * 0.5),
          type: paymentOption === 'split3' ? 'deposit' : paymentOption,
        },
      });

      router.push(`/account/trips/${reservation.id}?booked=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  const goNext = () => {
    const nextStep = steps[currentStepIndex + 1];
    if (nextStep) setStep(nextStep.id);
  };

  const goBack = () => {
    const prevStep = steps[currentStepIndex - 1];
    if (prevStep) setStep(prevStep.id);
  };

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container-page py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/properties/${property.slug}`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to property</span>
            </Link>

            {/* Progress Indicator */}
            <div className="flex items-center gap-1 sm:gap-2">
              {steps.map((s, index) => {
                const Icon = s.icon;
                const isCompleted = index < currentStepIndex;
                const isCurrent = s.id === step;

                return (
                  <div key={s.id} className="flex items-center">
                    <button
                      onClick={() => isCompleted && setStep(s.id)}
                      disabled={!isCompleted}
                      className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        isCurrent
                          ? 'bg-ocean-100 text-ocean-700'
                          : isCompleted
                          ? 'text-green-600 hover:bg-green-50 cursor-pointer'
                          : 'text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                      <span className="hidden md:inline">{s.label}</span>
                    </button>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-4 sm:w-8 h-0.5 mx-1 ${
                          isCompleted ? 'bg-green-400' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="w-24" /> {/* Spacer */}
          </div>
        </div>
      </div>

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                {step === 'dates' && (
                  <DateSelection
                    property={property}
                    initialCheckIn={checkIn || undefined}
                    initialCheckOut={checkOut || undefined}
                    onComplete={(newCheckIn, newCheckOut, newPricing) => {
                      setPricing(newPricing);
                      goNext();
                    }}
                  />
                )}

                {step === 'addons' && (
                  <div>
                    <UpsellAddons
                      nights={nights}
                      selectedAddons={selectedAddons}
                      onAddonsChange={setSelectedAddons}
                    />

                    <div className="flex gap-4 mt-8 pt-6 border-t">
                      <button onClick={goBack} className="btn-outline btn-lg">
                        Back
                      </button>
                      <button onClick={goNext} className="btn-primary btn-lg flex-1">
                        {selectedAddons.length > 0
                          ? `Continue with ${selectedAddons.length} add-on${selectedAddons.length !== 1 ? 's' : ''}`
                          : 'Continue without add-ons'}
                      </button>
                    </div>
                  </div>
                )}

                {step === 'guests' && (
                  <GuestInfo
                    initialValues={guestInfo}
                    onBack={goBack}
                    onComplete={(info) => {
                      setGuestInfo(info);
                      goNext();
                    }}
                    isLoggedIn={!!user}
                  />
                )}

                {step === 'protection' && pricing && (
                  <div>
                    <TravelInsurance
                      tripTotal={pricing.total + addonsTotal}
                      selectedPlan={selectedInsurance}
                      onInsuranceChange={(selected, plan) => {
                        setSelectedInsurance(selected ? plan || null : null);
                      }}
                    />

                    <div className="flex gap-4 mt-8 pt-6 border-t">
                      <button onClick={goBack} className="btn-outline btn-lg">
                        Back
                      </button>
                      <button onClick={goNext} className="btn-primary btn-lg flex-1">
                        {selectedInsurance
                          ? 'Continue with protection'
                          : 'Continue without protection'}
                      </button>
                    </div>
                  </div>
                )}

                {step === 'agreement' && property && checkIn && checkOut && (
                  <LeaseAgreement
                    propertyName={property.name}
                    propertyAddress={`${property.village?.name || 'Hatteras Island'}, NC`}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    guests={guests}
                    totalAmount={grandTotal}
                    guestInfo={{
                      firstName: guestInfo.firstName,
                      lastName: guestInfo.lastName,
                      email: guestInfo.email,
                      phone: guestInfo.phone,
                      address: guestInfo.address?.street,
                      city: guestInfo.address?.city,
                      state: guestInfo.address?.state,
                      zip: guestInfo.address?.zip,
                    }}
                    addendums={guests.pets > 0 ? undefined : [
                      {
                        id: 'pool-rules',
                        title: 'Pool/Hot Tub Rules',
                        content: 'Pool rules content...',
                        required: property.amenities?.some(a => a.id === 'pool' || a.id === 'hot-tub') || false,
                      },
                    ]}
                    onComplete={(sig, addendumIds) => {
                      setSignature(sig);
                      setAgreedAddendums(addendumIds);
                      goNext();
                    }}
                    onBack={goBack}
                  />
                )}

                {step === 'payment' && pricing && checkIn && (
                  <div className="space-y-8">
                    {/* Payment Options */}
                    <PaymentOptions
                      totalAmount={grandTotal}
                      checkInDate={checkIn}
                      selectedOption={paymentOption}
                      onPaymentOptionChange={setPaymentOption}
                    />

                    <div className="border-t pt-8">
                      <PaymentForm
                        amount={
                          paymentOption === 'full'
                            ? grandTotal
                            : paymentOption === 'deposit'
                            ? Math.round(grandTotal * 0.5)
                            : Math.round(grandTotal / 3)
                        }
                        onBack={goBack}
                        onSubmit={handlePaymentSubmit}
                        isLoading={isLoading}
                        error={error}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Loyalty Points Teaser */}
            {user && pricing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-purple-900">
                      Earn {Math.round(grandTotal * 10)} Surf Points with this booking!
                    </p>
                    <p className="text-sm text-purple-700">
                      That's ${Math.round(grandTotal * 0.1)} toward your next stay
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <BookingSummary
                property={property}
                checkIn={checkIn}
                checkOut={checkOut}
                guests={guests}
                pricing={pricing}
              />

              {/* Add-ons Summary */}
              {selectedAddons.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-4">
                  <h4 className="font-medium mb-3">Selected Add-ons</h4>
                  <div className="space-y-2 text-sm">
                    {selectedAddons.map((selected) => {
                      const addon = availableAddons.find((a) => a.id === selected.id);
                      if (!addon) return null;
                      const price =
                        addon.priceType === 'flat'
                          ? addon.price
                          : addon.price * nights;
                      return (
                        <div key={selected.id} className="flex justify-between">
                          <span className="text-gray-600">{addon.name}</span>
                          <span>${price}</span>
                        </div>
                      );
                    })}
                    <div className="flex justify-between pt-2 border-t font-medium">
                      <span>Add-ons Total</span>
                      <span>${addonsTotal}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Insurance Summary */}
              {selectedInsurance && (
                <div className="bg-white rounded-xl shadow-sm border p-4">
                  <h4 className="font-medium mb-3">Travel Protection</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{selectedInsurance.name}</span>
                    <span>${insuranceTotal}</span>
                  </div>
                </div>
              )}

              {/* Grand Total */}
              {pricing && (addonsTotal > 0 || insuranceTotal > 0) && (
                <div className="bg-ocean-50 border border-ocean-200 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-ocean-900">Grand Total</span>
                    <span className="text-xl font-bold text-ocean-900">
                      ${grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
