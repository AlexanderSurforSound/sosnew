'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  ChevronDown,
  Check,
  AlertCircle,
  PenLine,
  Download,
  Printer,
  X,
  Shield,
  Calendar,
  Users,
  Home,
  DollarSign,
} from 'lucide-react';
import { format } from 'date-fns';
import SignaturePad from 'signature_pad';

interface LeaseAgreementProps {
  propertyName: string;
  propertyAddress: string;
  checkIn: string;
  checkOut: string;
  guests: { adults: number; children: number; pets: number };
  totalAmount: number;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  addendums?: Addendum[];
  onComplete: (signature: string, agreedAddendums: string[]) => void;
  onBack: () => void;
}

interface Addendum {
  id: string;
  title: string;
  content: string;
  required: boolean;
}

const defaultAddendums: Addendum[] = [
  {
    id: 'pet-policy',
    title: 'Pet Policy Addendum',
    content: `PET POLICY

1. AUTHORIZED PETS: Only pets registered at the time of booking are permitted on the premises. No additional pets may be brought without prior written approval.

2. PET FEE: A non-refundable pet fee has been charged for each pet. This fee covers additional cleaning but does not cover damages.

3. PET AREAS: Pets must be kept off all furniture and beds. Pet beds or blankets must be used. Pets are not permitted in the pool area.

4. WASTE DISPOSAL: Pet waste must be immediately picked up and properly disposed of in outdoor trash receptacles. Failure to do so may result in additional cleaning fees.

5. SUPERVISION: Pets must be supervised at all times and must not be left unattended in the property. Pets left alone may trigger noise complaints.

6. DAMAGES: Guest is fully responsible for any damages caused by pets, including but not limited to: furniture damage, carpet stains, scratches, odors, and flea treatments.

7. BREED RESTRICTIONS: Certain breeds may not be permitted as determined by insurance requirements. Please verify your pet is allowed before booking.

8. BARKING/NOISE: Excessive barking or noise complaints may result in immediate termination of the rental agreement without refund.

By signing below, you acknowledge and agree to all terms of this Pet Policy Addendum.`,
    required: true,
  },
  {
    id: 'pool-rules',
    title: 'Pool/Hot Tub Rules',
    content: `POOL AND HOT TUB RULES & SAFETY GUIDELINES

1. NO LIFEGUARD ON DUTY: Swimming is at your own risk. Children must be supervised by an adult at all times.

2. POOL HOURS: Pool/hot tub may be used between 8:00 AM and 10:00 PM. Please be respectful of neighbors.

3. POOL GATE: The pool gate must remain closed and latched at all times when the pool is not in use.

4. NO GLASS: No glass containers of any kind are permitted in the pool area.

5. NO DIVING: Diving is strictly prohibited. Pool depth may not be suitable for diving.

6. HOT TUB TEMPERATURE: The hot tub is maintained at safe temperatures. Do not attempt to adjust heating beyond 104°F.

7. HEALTH ADVISORY: Persons with heart conditions, pregnant women, and small children should consult a physician before using the hot tub.

8. NO PETS: Pets are not permitted in the pool or hot tub area.

9. POOL FURNITURE: Please return all pool furniture to its proper location after use.

10. LIABILITY: Guest assumes all risks associated with pool/hot tub use. Owner is not responsible for injuries.

By signing below, you acknowledge and agree to all Pool/Hot Tub Rules.`,
    required: true,
  },
  {
    id: 'parking',
    title: 'Parking Agreement',
    content: `PARKING AGREEMENT

1. DESIGNATED SPACES: Guests may only park in designated parking areas for this property. Do not park on grass, neighboring properties, or block driveways.

2. VEHICLE LIMIT: Maximum of [X] vehicles permitted. Additional vehicles must be approved in advance.

3. BOAT/TRAILER PARKING: Boats, trailers, RVs, and oversized vehicles require prior approval and may incur additional fees.

4. NO REPAIRS: Vehicle repairs, oil changes, or car washing is not permitted on the property.

5. TOWING: Vehicles parked in unauthorized areas or blocking access may be towed at owner's expense.

6. LIABILITY: Owner is not responsible for damage, theft, or loss to vehicles or their contents.

By signing below, you acknowledge and agree to the Parking Agreement.`,
    required: false,
  },
];

export function LeaseAgreement({
  propertyName,
  propertyAddress,
  checkIn,
  checkOut,
  guests,
  totalAmount,
  guestInfo,
  addendums = defaultAddendums,
  onComplete,
  onBack,
}: LeaseAgreementProps) {
  const [hasReadAgreement, setHasReadAgreement] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [agreedAddendums, setAgreedAddendums] = useState<Set<string>>(new Set());
  const [expandedAddendum, setExpandedAddendum] = useState<string | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const agreementRef = useRef<HTMLDivElement>(null);

  // Track scroll progress
  useEffect(() => {
    const element = agreementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const progress = scrollTop / (scrollHeight - clientHeight);
      setScrollProgress(progress);

      if (progress > 0.9) {
        setHasReadAgreement(true);
      }
    };

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleAddendum = (addendumId: string) => {
    const newAgreed = new Set(agreedAddendums);
    if (newAgreed.has(addendumId)) {
      newAgreed.delete(addendumId);
    } else {
      newAgreed.add(addendumId);
    }
    setAgreedAddendums(newAgreed);
  };

  const requiredAddendums = addendums.filter((a) => a.required);
  const optionalAddendums = addendums.filter((a) => !a.required);
  const allRequiredAgreed = requiredAddendums.every((a) => agreedAddendums.has(a.id));

  const canSubmit = hasReadAgreement && signature && allRequiredAgreed;

  const handleSubmit = () => {
    if (!canSubmit || !signature) return;
    onComplete(signature, Array.from(agreedAddendums));
  };

  const todayDate = format(new Date(), 'MMMM d, yyyy');
  const checkInDate = format(new Date(checkIn), 'MMMM d, yyyy');
  const checkOutDate = format(new Date(checkOut), 'MMMM d, yyyy');
  const guestName = `${guestInfo.firstName} ${guestInfo.lastName}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Rental Agreement</h2>
        <p className="text-gray-500">
          Please read and sign the rental agreement to complete your booking
        </p>
      </div>

      {/* Agreement Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <Home className="w-5 h-5 text-gray-400 mb-1" />
          <p className="text-xs text-gray-500">Property</p>
          <p className="font-medium text-sm truncate">{propertyName}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <Calendar className="w-5 h-5 text-gray-400 mb-1" />
          <p className="text-xs text-gray-500">Dates</p>
          <p className="font-medium text-sm">
            {format(new Date(checkIn), 'MMM d')} - {format(new Date(checkOut), 'MMM d')}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <Users className="w-5 h-5 text-gray-400 mb-1" />
          <p className="text-xs text-gray-500">Guests</p>
          <p className="font-medium text-sm">
            {guests.adults + guests.children} {guests.pets > 0 && `+ ${guests.pets} pet`}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <DollarSign className="w-5 h-5 text-gray-400 mb-1" />
          <p className="text-xs text-gray-500">Total</p>
          <p className="font-medium text-sm">${totalAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Scroll Progress */}
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-ocean-500 transition-all duration-300"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Main Agreement */}
      <div
        ref={agreementRef}
        className="h-96 overflow-y-auto border rounded-xl p-6 bg-white prose prose-sm max-w-none"
      >
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold">VACATION RENTAL AGREEMENT</h1>
          <p className="text-gray-500">Surf or Sound Realty</p>
        </div>

        <p>
          This Vacation Rental Agreement ("Agreement") is entered into as of <strong>{todayDate}</strong> by
          and between:
        </p>

        <p>
          <strong>OWNER/AGENT:</strong> Surf or Sound Realty, LLC<br />
          <strong>TENANT:</strong> {guestName}
        </p>

        <h2>1. PROPERTY</h2>
        <p>
          Owner/Agent agrees to rent to Tenant the vacation rental property located at:
          <br />
          <strong>{propertyName}</strong>
          <br />
          {propertyAddress}
        </p>

        <h2>2. RENTAL PERIOD</h2>
        <p>
          The rental period shall begin on <strong>{checkInDate}</strong> at 4:00 PM and end on{' '}
          <strong>{checkOutDate}</strong> at 10:00 AM.
        </p>
        <p>
          <strong>CHECK-IN:</strong> After 4:00 PM on arrival date
          <br />
          <strong>CHECK-OUT:</strong> Before 10:00 AM on departure date
        </p>

        <h2>3. RENTAL RATE AND PAYMENT</h2>
        <p>
          Tenant agrees to pay Owner/Agent the total rental amount of{' '}
          <strong>${totalAmount.toLocaleString()}</strong> according to the payment schedule agreed upon at
          booking.
        </p>

        <h2>4. SECURITY DEPOSIT</h2>
        <p>
          A security deposit or damage protection fee has been collected. Tenant is responsible for any
          damages exceeding this amount. The security deposit will be returned within 14 days of
          check-out, minus any deductions for damages or excessive cleaning.
        </p>

        <h2>5. OCCUPANCY</h2>
        <p>
          The maximum number of occupants shall not exceed the number registered at booking:
          <br />
          <strong>Adults:</strong> {guests.adults}
          <br />
          <strong>Children:</strong> {guests.children}
          <br />
          <strong>Pets:</strong> {guests.pets}
        </p>
        <p>
          No parties, events, or gatherings exceeding the registered occupancy are permitted. Violation
          may result in immediate termination without refund.
        </p>

        <h2>6. CANCELLATION POLICY</h2>
        <p>
          Cancellations made more than 30 days prior to check-in: Full refund minus processing fee.
          <br />
          Cancellations made 15-30 days prior: 50% refund.
          <br />
          Cancellations made less than 15 days prior: No refund.
          <br />
          <br />
          Travel insurance is strongly recommended.
        </p>

        <h2>7. HOUSE RULES</h2>
        <ul>
          <li>No smoking in the property or on decks. Violation fee: $500</li>
          <li>No illegal activities</li>
          <li>Noise levels must be reasonable, especially after 10:00 PM</li>
          <li>Garbage must be placed in designated containers</li>
          <li>All doors and windows must be secured when leaving the property</li>
          <li>Report any maintenance issues immediately</li>
        </ul>

        <h2>8. LIABILITY</h2>
        <p>
          Tenant agrees to hold Owner/Agent harmless from any liability, claims, or demands arising
          from Tenant's use of the premises. Owner/Agent is not responsible for any accidents, injuries,
          or illness that occur on the premises or while using any equipment or amenities.
        </p>

        <h2>9. MAINTENANCE AND REPAIRS</h2>
        <p>
          Tenant shall immediately report any malfunctions, damage, or needed repairs to Owner/Agent.
          Tenant shall not attempt repairs. Owner/Agent will make reasonable efforts to address issues
          promptly but is not responsible for temporary outages of utilities or amenities.
        </p>

        <h2>10. GOVERNING LAW</h2>
        <p>
          This Agreement shall be governed by and construed in accordance with the laws of the State of
          North Carolina.
        </p>

        <div className="mt-8 pt-8 border-t text-center text-gray-500">
          <p>
            By signing below, Tenant acknowledges having read this Agreement and agrees to all terms
            and conditions contained herein.
          </p>
        </div>
      </div>

      {!hasReadAgreement && (
        <div className="flex items-center gap-2 text-amber-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          Please scroll through the entire agreement to continue
        </div>
      )}

      {/* Addendums */}
      {addendums.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Additional Terms & Addendums</h3>

          {requiredAddendums.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Required:</p>
              {requiredAddendums.map((addendum) => (
                <AddendumItem
                  key={addendum.id}
                  addendum={addendum}
                  isAgreed={agreedAddendums.has(addendum.id)}
                  isExpanded={expandedAddendum === addendum.id}
                  onToggle={() => toggleAddendum(addendum.id)}
                  onExpand={() =>
                    setExpandedAddendum(expandedAddendum === addendum.id ? null : addendum.id)
                  }
                />
              ))}
            </div>
          )}

          {optionalAddendums.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Optional:</p>
              {optionalAddendums.map((addendum) => (
                <AddendumItem
                  key={addendum.id}
                  addendum={addendum}
                  isAgreed={agreedAddendums.has(addendum.id)}
                  isExpanded={expandedAddendum === addendum.id}
                  onToggle={() => toggleAddendum(addendum.id)}
                  onExpand={() =>
                    setExpandedAddendum(expandedAddendum === addendum.id ? null : addendum.id)
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Signature Section */}
      <div className="border rounded-xl p-6 bg-gray-50">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <PenLine className="w-5 h-5" />
          Electronic Signature
        </h3>

        {signature ? (
          <div className="space-y-3">
            <div className="bg-white border rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2">Your signature:</p>
              <img src={signature} alt="Signature" className="max-h-20" />
            </div>
            <button
              onClick={() => {
                setSignature(null);
                setShowSignaturePad(true);
              }}
              className="text-sm text-ocean-600 hover:text-ocean-700"
            >
              Clear and re-sign
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSignaturePad(true)}
            disabled={!hasReadAgreement}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-ocean-500 hover:text-ocean-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Click to sign
          </button>
        )}

        <p className="text-xs text-gray-500 mt-3">
          By signing, I agree that my electronic signature is the legal equivalent of my handwritten
          signature on this Agreement.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button onClick={onBack} className="btn-outline btn-lg">
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="btn-primary btn-lg flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {canSubmit ? 'Sign & Continue' : 'Complete all requirements above'}
        </button>
      </div>

      {/* Print/Download */}
      <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
        <button className="flex items-center gap-1 hover:text-gray-700">
          <Download className="w-4 h-4" />
          Download PDF
        </button>
        <button className="flex items-center gap-1 hover:text-gray-700">
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>

      {/* Signature Pad Modal */}
      <AnimatePresence>
        {showSignaturePad && (
          <SignaturePadModal
            guestName={guestName}
            onSave={(sig) => {
              setSignature(sig);
              setShowSignaturePad(false);
            }}
            onClose={() => setShowSignaturePad(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AddendumItem({
  addendum,
  isAgreed,
  isExpanded,
  onToggle,
  onExpand,
}: {
  addendum: Addendum;
  isAgreed: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onExpand: () => void;
}) {
  return (
    <div
      className={`border rounded-lg overflow-hidden transition-colors ${
        isAgreed ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between p-4">
        <button
          onClick={onExpand}
          className="flex items-center gap-3 text-left flex-1"
        >
          <FileText className="w-5 h-5 text-gray-400" />
          <span className="font-medium">{addendum.title}</span>
          {addendum.required && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
              Required
            </span>
          )}
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
        <button
          onClick={onToggle}
          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
            isAgreed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {isAgreed && <Check className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                {addendum.content}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SignaturePadModal({
  guestName,
  onSave,
  onClose,
}: {
  guestName: string;
  onSave: (signature: string) => void;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (canvasRef.current) {
      signaturePadRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)',
      });

      signaturePadRef.current.addEventListener('endStroke', () => {
        setIsEmpty(signaturePadRef.current?.isEmpty() ?? true);
      });

      // Resize canvas
      const resizeCanvas = () => {
        if (canvasRef.current) {
          const ratio = Math.max(window.devicePixelRatio || 1, 1);
          const canvas = canvasRef.current;
          canvas.width = canvas.offsetWidth * ratio;
          canvas.height = canvas.offsetHeight * ratio;
          canvas.getContext('2d')?.scale(ratio, ratio);
          signaturePadRef.current?.clear();
        }
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      return () => {
        window.removeEventListener('resize', resizeCanvas);
        signaturePadRef.current?.off();
      };
    }
  }, []);

  const handleClear = () => {
    signaturePadRef.current?.clear();
    setIsEmpty(true);
  };

  const handleSave = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      onSave(signaturePadRef.current.toDataURL());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white rounded-xl max-w-lg w-full p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Sign Agreement</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Please sign in the box below. Your signature represents:
          <br />
          <strong>{guestName}</strong>
        </p>

        <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            className="w-full"
            style={{ height: '200px', touchAction: 'none' }}
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <button onClick={handleClear} className="text-sm text-gray-500 hover:text-gray-700">
            Clear
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-outline">
              Cancel
            </button>
            <button onClick={handleSave} disabled={isEmpty} className="btn-primary disabled:opacity-50">
              Save Signature
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
          <Shield className="w-4 h-4" />
          Your signature is encrypted and securely stored
        </div>
      </motion.div>
    </motion.div>
  );
}
