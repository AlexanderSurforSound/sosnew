'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Download, Check, Apple, Chrome, Mail, Copy, ExternalLink } from 'lucide-react';

interface CalendarSyncProps {
  tripName: string;
  propertyName: string;
  propertyAddress: string;
  checkIn: Date;
  checkOut: Date;
  confirmationNumber?: string;
}

type CalendarType = 'google' | 'apple' | 'outlook' | 'ics';

export default function CalendarSync({
  tripName,
  propertyName,
  propertyAddress,
  checkIn,
  checkOut,
  confirmationNumber,
}: CalendarSyncProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState<CalendarType | null>(null);

  const formatDateForGoogle = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const formatDateForICS = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const generateDescription = () => {
    return `Beach vacation at ${propertyName}

Property: ${propertyName}
Address: ${propertyAddress}
Check-in: ${checkIn.toLocaleDateString()} at 4:00 PM
Check-out: ${checkOut.toLocaleDateString()} at 10:00 AM
${confirmationNumber ? `Confirmation: ${confirmationNumber}` : ''}

Booked through Surf or Sound Realty
www.surforsound.com`;
  };

  const generateGoogleCalendarUrl = () => {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: tripName,
      dates: `${formatDateForGoogle(checkIn)}/${formatDateForGoogle(checkOut)}`,
      details: generateDescription(),
      location: propertyAddress,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const generateOutlookUrl = () => {
    const params = new URLSearchParams({
      subject: tripName,
      startdt: checkIn.toISOString(),
      enddt: checkOut.toISOString(),
      body: generateDescription(),
      location: propertyAddress,
      path: '/calendar/action/compose',
      rru: 'addevent',
    });
    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  };

  const generateICSContent = () => {
    const uid = `${Date.now()}@surforsound.com`;
    const description = generateDescription().replace(/\n/g, '\\n');

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Surf or Sound Realty//Beach Vacation//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatDateForICS(new Date())}
DTSTART:${formatDateForICS(checkIn)}
DTEND:${formatDateForICS(checkOut)}
SUMMARY:${tripName}
DESCRIPTION:${description}
LOCATION:${propertyAddress}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
  };

  const downloadICS = () => {
    setDownloading('ics');
    const content = generateICSContent();
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tripName.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => setDownloading(null), 1000);
  };

  const copyToClipboard = async () => {
    const text = generateDescription();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const calendarOptions = [
    {
      type: 'google' as CalendarType,
      name: 'Google Calendar',
      icon: <Chrome className="w-5 h-5" />,
      color: 'bg-blue-500',
      action: () => window.open(generateGoogleCalendarUrl(), '_blank'),
    },
    {
      type: 'apple' as CalendarType,
      name: 'Apple Calendar',
      icon: <Apple className="w-5 h-5" />,
      color: 'bg-gray-800',
      action: downloadICS,
    },
    {
      type: 'outlook' as CalendarType,
      name: 'Outlook',
      icon: <Mail className="w-5 h-5" />,
      color: 'bg-blue-600',
      action: () => window.open(generateOutlookUrl(), '_blank'),
    },
    {
      type: 'ics' as CalendarType,
      name: 'Download .ics',
      icon: <Download className="w-5 h-5" />,
      color: 'bg-gray-600',
      action: downloadICS,
    },
  ];

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
      >
        <Calendar className="w-4 h-4" />
        <span className="text-sm font-medium">Add to Calendar</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Add to Calendar</h2>
                    <p className="text-blue-200 text-sm">Never forget your trip details</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Trip Summary */}
                <div className="p-4 bg-gray-50 rounded-xl mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{tripName}</h3>
                  <p className="text-sm text-gray-600 mb-1">{propertyName}</p>
                  <p className="text-sm text-gray-500">
                    {checkIn.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    -{' '}
                    {checkOut.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* Calendar Options */}
                <div className="space-y-3 mb-6">
                  {calendarOptions.map((option) => (
                    <button
                      key={option.type}
                      onClick={option.action}
                      className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all group"
                    >
                      <div
                        className={`w-10 h-10 ${option.color} rounded-lg flex items-center justify-center text-white`}
                      >
                        {option.icon}
                      </div>
                      <span className="font-medium text-gray-900 flex-1 text-left">
                        {option.name}
                      </span>
                      {downloading === option.type ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Copy Details */}
                <div className="border-t border-gray-200 pt-4">
                  <button
                    onClick={copyToClipboard}
                    className="w-full flex items-center justify-center gap-2 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-green-600">Copied to clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy trip details</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
