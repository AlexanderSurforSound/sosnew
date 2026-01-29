'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
  Edit3,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import SignaturePad from 'signature_pad';
import { PortableText } from '@portabletext/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Types for CMS content
interface LeaseSection {
  name: string;
  title: string;
  content: any; // Portable Text content
  requiresInitials: boolean;
  isTextFragment: boolean;
}

interface Addendum {
  id: string;
  title: string;
  content: any; // Portable Text content or string
  required: boolean;
  appliesTo?: string[];
}

interface CMSLeaseAgreement {
  _id: string;
  title: string;
  effectiveDate: string;
  headerText?: string;
  sections: LeaseSection[];
  addendums: Addendum[];
  consumerDisclosure?: any;
  signatureText?: string;
}

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
  cmsLease?: CMSLeaseAgreement | null;
  propertyAmenities?: string[]; // For determining which addendums apply
  onComplete: (data: {
    signature: string;
    sectionInitials: Record<string, string>;
    agreedAddendums: string[];
    signedAt: string;
  }) => void;
  onBack: () => void;
}

// Default sections for fallback when CMS content isn't available
const defaultSections: LeaseSection[] = [
  {
    name: 'property',
    title: '1. PROPERTY',
    content: null, // Will be rendered dynamically
    requiresInitials: true,
    isTextFragment: false,
  },
  {
    name: 'rental-period',
    title: '2. RENTAL PERIOD',
    content: null,
    requiresInitials: true,
    isTextFragment: false,
  },
  {
    name: 'payment',
    title: '3. RENTAL RATE AND PAYMENT',
    content: null,
    requiresInitials: true,
    isTextFragment: false,
  },
  {
    name: 'security-deposit',
    title: '4. SECURITY DEPOSIT',
    content: null,
    requiresInitials: true,
    isTextFragment: false,
  },
  {
    name: 'occupancy',
    title: '5. OCCUPANCY',
    content: null,
    requiresInitials: true,
    isTextFragment: false,
  },
  {
    name: 'cancellation',
    title: '6. CANCELLATION POLICY',
    content: null,
    requiresInitials: true,
    isTextFragment: false,
  },
  {
    name: 'house-rules',
    title: '7. HOUSE RULES',
    content: null,
    requiresInitials: true,
    isTextFragment: false,
  },
  {
    name: 'liability',
    title: '8. LIABILITY',
    content: null,
    requiresInitials: true,
    isTextFragment: false,
  },
];

const defaultAddendums: Addendum[] = [
  {
    id: 'pet-policy',
    title: 'Pet Policy Addendum',
    content: `PET POLICY

1. AUTHORIZED PETS: Only pets registered at the time of booking are permitted on the premises. No additional pets may be brought without prior written approval.

2. PET FEE: A non-refundable pet fee has been charged for each pet. This fee covers additional cleaning but does not cover damages.

3. PET AREAS: Pets must be kept off all furniture and beds. Pet beds or blankets must be used. Pets are not permitted in the pool area.

4. WASTE DISPOSAL: Pet waste must be immediately picked up and properly disposed of in outdoor trash receptacles.

5. SUPERVISION: Pets must be supervised at all times and must not be left unattended in the property.

6. DAMAGES: Guest is fully responsible for any damages caused by pets.

By initialing below, you acknowledge and agree to all terms of this Pet Policy Addendum.`,
    required: true,
    appliesTo: ['pets'],
  },
  {
    id: 'pool-rules',
    title: 'Pool/Hot Tub Rules',
    content: `POOL AND HOT TUB RULES & SAFETY GUIDELINES

1. NO LIFEGUARD ON DUTY: Swimming is at your own risk. Children must be supervised by an adult at all times.

2. POOL HOURS: Pool/hot tub may be used between 8:00 AM and 10:00 PM.

3. POOL GATE: The pool gate must remain closed and latched at all times when the pool is not in use.

4. NO GLASS: No glass containers of any kind are permitted in the pool area.

5. NO DIVING: Diving is strictly prohibited.

6. LIABILITY: Guest assumes all risks associated with pool/hot tub use.

By initialing below, you acknowledge and agree to all Pool/Hot Tub Rules.`,
    required: true,
    appliesTo: ['pool', 'hotTub'],
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
  cmsLease,
  propertyAmenities = [],
  onComplete,
  onBack,
}: LeaseAgreementProps) {
  // Use CMS content or fallback to defaults
  const sections = cmsLease?.sections?.length ? cmsLease.sections : defaultSections;
  const addendums = cmsLease?.addendums?.length ? cmsLease.addendums : defaultAddendums;

  // Filter addendums based on property amenities and booking details
  const applicableAddendums = addendums.filter((addendum) => {
    if (!addendum.appliesTo || addendum.appliesTo.includes('all')) return true;
    if (addendum.appliesTo.includes('pets') && guests.pets > 0) return true;
    if (addendum.appliesTo.includes('pool') && propertyAmenities.includes('pool')) return true;
    if (addendum.appliesTo.includes('hotTub') && propertyAmenities.includes('hotTub')) return true;
    return false;
  });

  const [hasReadAgreement, setHasReadAgreement] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [sectionInitials, setSectionInitials] = useState<Record<string, string>>({});
  const [agreedAddendums, setAgreedAddendums] = useState<Set<string>>(new Set());
  const [addendumInitials, setAddendumInitials] = useState<Record<string, string>>({});
  const [expandedAddendum, setExpandedAddendum] = useState<string | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeInitialSection, setActiveInitialSection] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const agreementRef = useRef<HTMLDivElement>(null);
  const printContentRef = useRef<HTMLDivElement>(null);

  const guestInitials = `${guestInfo.firstName.charAt(0)}${guestInfo.lastName.charAt(0)}`.toUpperCase();
  const guestName = `${guestInfo.firstName} ${guestInfo.lastName}`;

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

  const handleInitialChange = (sectionName: string, value: string) => {
    setSectionInitials((prev) => ({
      ...prev,
      [sectionName]: value.toUpperCase().slice(0, 3),
    }));
  };

  const handleAddendumInitialChange = (addendumId: string, value: string) => {
    setAddendumInitials((prev) => ({
      ...prev,
      [addendumId]: value.toUpperCase().slice(0, 3),
    }));
  };

  const toggleAddendum = (addendumId: string) => {
    const newAgreed = new Set(agreedAddendums);
    if (newAgreed.has(addendumId)) {
      newAgreed.delete(addendumId);
    } else {
      newAgreed.add(addendumId);
    }
    setAgreedAddendums(newAgreed);
  };

  // Check if all required sections are initialed
  const sectionsRequiringInitials = sections.filter((s) => s.requiresInitials && !s.isTextFragment);
  const allSectionsInitialed = sectionsRequiringInitials.every(
    (section) => sectionInitials[section.name]?.length >= 2
  );

  // Check addendums
  const requiredAddendums = applicableAddendums.filter((a) => a.required);
  const allRequiredAddendumsAgreed = requiredAddendums.every(
    (a) => agreedAddendums.has(a.id) && addendumInitials[a.id]?.length >= 2
  );

  const canSubmit = hasReadAgreement && signature && allSectionsInitialed && allRequiredAddendumsAgreed;

  const handleSubmit = () => {
    if (!canSubmit || !signature) return;
    onComplete({
      signature,
      sectionInitials: { ...sectionInitials, ...addendumInitials },
      agreedAddendums: Array.from(agreedAddendums),
      signedAt: new Date().toISOString(),
    });
  };

  // Generate PDF of the lease agreement
  const handleDownloadPdf = useCallback(async () => {
    if (!agreementRef.current) return;

    setIsGeneratingPdf(true);
    try {
      const element = agreementRef.current;
      const originalHeight = element.style.height;
      const originalOverflow = element.style.overflow;

      // Temporarily expand to full height for capture
      element.style.height = 'auto';
      element.style.overflow = 'visible';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowHeight: element.scrollHeight,
      });

      // Restore original styles
      element.style.height = originalHeight;
      element.style.overflow = originalOverflow;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10; // Start with 10mm top margin

      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - 20);

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 20);
      }

      const fileName = `Rental_Agreement_${propertyName.replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(checkIn), 'yyyy-MM-dd')}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [propertyName, checkIn]);

  // Print the lease agreement
  const handlePrint = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !agreementRef.current) return;

    const content = agreementRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rental Agreement - ${propertyName}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 { font-size: 18px; text-align: center; margin-bottom: 20px; }
            h2 { font-size: 14px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; }
            p { margin: 10px 0; font-size: 12px; }
            ul { margin: 10px 0; padding-left: 20px; font-size: 12px; }
            li { margin: 5px 0; }
            strong { font-weight: 600; }
            .initial-box {
              display: inline-block;
              border: 1px solid #000;
              padding: 5px 15px;
              margin: 10px 0;
              min-width: 60px;
              text-align: center;
            }
            input { display: none; }
            .bg-gray-50, .bg-green-50, .bg-ocean-50 { background: #f9fafb; padding: 10px; border-radius: 5px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }, [propertyName]);

  const todayDate = format(new Date(), 'MMMM d, yyyy');
  const checkInDate = format(new Date(checkIn), 'MMMM d, yyyy');
  const checkOutDate = format(new Date(checkOut), 'MMMM d, yyyy');

  // Render default section content when CMS content isn't available
  const renderDefaultSectionContent = (section: LeaseSection) => {
    switch (section.name) {
      case 'property':
        return (
          <p>
            Owner/Agent agrees to rent to Tenant the vacation rental property located at:
            <br />
            <strong>{propertyName}</strong>
            <br />
            {propertyAddress}
          </p>
        );
      case 'rental-period':
        return (
          <>
            <p>
              The rental period shall begin on <strong>{checkInDate}</strong> at 4:00 PM and end on{' '}
              <strong>{checkOutDate}</strong> at 10:00 AM.
            </p>
            <p>
              <strong>CHECK-IN:</strong> After 4:00 PM on arrival date
              <br />
              <strong>CHECK-OUT:</strong> Before 10:00 AM on departure date
            </p>
          </>
        );
      case 'payment':
        return (
          <p>
            Tenant agrees to pay Owner/Agent the total rental amount of{' '}
            <strong>${totalAmount.toLocaleString()}</strong> according to the payment schedule agreed upon at
            booking.
          </p>
        );
      case 'security-deposit':
        return (
          <p>
            A security deposit or damage protection fee has been collected. Tenant is responsible for any
            damages exceeding this amount. The security deposit will be returned within 14 days of
            check-out, minus any deductions for damages or excessive cleaning.
          </p>
        );
      case 'occupancy':
        return (
          <>
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
              No parties, events, or gatherings exceeding the registered occupancy are permitted.
            </p>
          </>
        );
      case 'cancellation':
        return (
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
        );
      case 'house-rules':
        return (
          <ul className="list-disc pl-5 space-y-1">
            <li>No smoking in the property or on decks. Violation fee: $500</li>
            <li>No illegal activities</li>
            <li>Noise levels must be reasonable, especially after 10:00 PM</li>
            <li>Garbage must be placed in designated containers</li>
            <li>All doors and windows must be secured when leaving the property</li>
            <li>Report any maintenance issues immediately</li>
          </ul>
        );
      case 'liability':
        return (
          <p>
            Tenant agrees to hold Owner/Agent harmless from any liability, claims, or demands arising
            from Tenant&apos;s use of the premises. Owner/Agent is not responsible for any accidents, injuries,
            or illness that occur on the premises or while using any equipment or amenities.
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Rental Agreement</h2>
        <p className="text-gray-500">
          Please read and initial each section, then sign the rental agreement to complete your booking
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

      {/* Progress indicators */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
            hasReadAgreement ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {hasReadAgreement ? <Check className="w-3 h-3" /> : '1'}
          </div>
          <span className={hasReadAgreement ? 'text-green-600' : 'text-gray-500'}>Read Agreement</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
            allSectionsInitialed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {allSectionsInitialed ? <Check className="w-3 h-3" /> : '2'}
          </div>
          <span className={allSectionsInitialed ? 'text-green-600' : 'text-gray-500'}>Initial Sections</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
            signature ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {signature ? <Check className="w-3 h-3" /> : '3'}
          </div>
          <span className={signature ? 'text-green-600' : 'text-gray-500'}>Sign</span>
        </div>
      </div>

      {/* Scroll Progress */}
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-ocean-500 transition-all duration-300"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Main Agreement with Section Initials */}
      <div
        ref={agreementRef}
        className="h-[500px] overflow-y-auto border rounded-xl bg-white"
      >
        <div className="p-6 prose prose-sm max-w-none">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold">VACATION RENTAL AGREEMENT</h1>
            <p className="text-gray-500">Surf or Sound Realty</p>
            {cmsLease?.headerText && <p className="text-sm">{cmsLease.headerText}</p>}
          </div>

          <p>
            This Vacation Rental Agreement (&quot;Agreement&quot;) is entered into as of <strong>{todayDate}</strong> by
            and between:
          </p>

          <p>
            <strong>OWNER/AGENT:</strong> Surf or Sound Realty, LLC<br />
            <strong>TENANT:</strong> {guestName}
          </p>

          {/* Render each section with initials */}
          {sections.map((section) => (
            <div key={section.name} className="relative border-l-4 border-gray-200 pl-4 my-6 py-2 hover:border-ocean-300 transition-colors">
              <h2 className="text-base font-bold mt-0">{section.title}</h2>

              {section.content ? (
                <div className="prose prose-sm">
                  <PortableText value={section.content} />
                </div>
              ) : (
                renderDefaultSectionContent(section)
              )}

              {section.requiresInitials && !section.isTextFragment && (
                <div className="mt-4 flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm text-gray-600">Initial here:</span>
                  <div className="relative">
                    <input
                      type="text"
                      value={sectionInitials[section.name] || ''}
                      onChange={(e) => handleInitialChange(section.name, e.target.value)}
                      placeholder={guestInitials}
                      maxLength={3}
                      className={`w-16 h-10 text-center text-lg font-semibold border-2 rounded-lg uppercase tracking-wide ${
                        sectionInitials[section.name]?.length >= 2
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 focus:border-ocean-500'
                      } focus:outline-none transition-colors`}
                    />
                    {sectionInitials[section.name]?.length >= 2 && (
                      <Check className="absolute -right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="mt-8 pt-8 border-t text-center text-gray-500">
            <p>
              {cmsLease?.signatureText ||
                'By signing below, Tenant acknowledges having read this Agreement and agrees to all terms and conditions contained herein.'}
            </p>
          </div>
        </div>
      </div>

      {!hasReadAgreement && (
        <div className="flex items-center gap-2 text-amber-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          Please scroll through the entire agreement to continue
        </div>
      )}

      {/* Section Initials Summary */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Edit3 className="w-5 h-5" />
          Section Initials ({Object.keys(sectionInitials).filter(k => sectionInitials[k]?.length >= 2).length} of {sectionsRequiringInitials.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {sectionsRequiringInitials.map((section) => (
            <div
              key={section.name}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
                sectionInitials[section.name]?.length >= 2
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {sectionInitials[section.name]?.length >= 2 ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="w-4 h-4 rounded-full border-2 border-current" />
              )}
              {section.title.split('.')[0]}
            </div>
          ))}
        </div>
      </div>

      {/* Addendums */}
      {applicableAddendums.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Additional Terms & Addendums</h3>

          {applicableAddendums.map((addendum) => (
            <AddendumItem
              key={addendum.id}
              addendum={addendum}
              isAgreed={agreedAddendums.has(addendum.id)}
              isExpanded={expandedAddendum === addendum.id}
              initials={addendumInitials[addendum.id] || ''}
              defaultInitials={guestInitials}
              onToggle={() => toggleAddendum(addendum.id)}
              onExpand={() =>
                setExpandedAddendum(expandedAddendum === addendum.id ? null : addendum.id)
              }
              onInitialChange={(value) => handleAddendumInitialChange(addendum.id, value)}
            />
          ))}
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
            disabled={!hasReadAgreement || !allSectionsInitialed}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-ocean-500 hover:text-ocean-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!hasReadAgreement
              ? 'Read the full agreement first'
              : !allSectionsInitialed
                ? 'Initial all sections first'
                : 'Click to sign'}
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
        <button
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="flex items-center gap-1 hover:text-gray-700 disabled:opacity-50"
        >
          {isGeneratingPdf ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1 hover:text-gray-700"
        >
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
  initials,
  defaultInitials,
  onToggle,
  onExpand,
  onInitialChange,
}: {
  addendum: Addendum;
  isAgreed: boolean;
  isExpanded: boolean;
  initials: string;
  defaultInitials: string;
  onToggle: () => void;
  onExpand: () => void;
  onInitialChange: (value: string) => void;
}) {
  const isComplete = isAgreed && initials.length >= 2;

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-colors ${
        isComplete ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'
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
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={initials}
            onChange={(e) => onInitialChange(e.target.value)}
            placeholder={defaultInitials}
            maxLength={3}
            className={`w-14 h-8 text-center text-sm font-semibold border-2 rounded uppercase ${
              initials.length >= 2
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300'
            } focus:outline-none focus:border-ocean-500`}
          />
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
              {typeof addendum.content === 'string' ? (
                <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                  {addendum.content}
                </pre>
              ) : (
                <div className="prose prose-sm bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                  <PortableText value={addendum.content} />
                </div>
              )}
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
