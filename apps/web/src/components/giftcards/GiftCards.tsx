'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift,
  CreditCard,
  Mail,
  Calendar,
  User,
  MessageSquare,
  Check,
  Sparkles,
  Sun,
  Waves,
  Shell,
  Palmtree,
  ChevronRight,
  Copy,
  Download,
  Share2,
} from 'lucide-react';

interface GiftCardDesign {
  id: string;
  name: string;
  gradient: string;
  icon: React.ReactNode;
  pattern?: string;
}

const designs: GiftCardDesign[] = [
  {
    id: 'ocean',
    name: 'Ocean Waves',
    gradient: 'from-ocean-500 to-blue-600',
    icon: <Waves className="w-8 h-8" />,
  },
  {
    id: 'sunset',
    name: 'Beach Sunset',
    gradient: 'from-orange-400 to-pink-500',
    icon: <Sun className="w-8 h-8" />,
  },
  {
    id: 'tropical',
    name: 'Tropical Paradise',
    gradient: 'from-green-400 to-teal-500',
    icon: <Palmtree className="w-8 h-8" />,
  },
  {
    id: 'shell',
    name: 'Sandy Shores',
    gradient: 'from-amber-300 to-orange-400',
    icon: <Shell className="w-8 h-8" />,
  },
];

const presetAmounts = [50, 100, 150, 200, 250, 500];

interface GiftCardPurchaseProps {
  onPurchase?: (giftCard: GiftCardData) => void;
}

interface GiftCardData {
  amount: number;
  design: GiftCardDesign;
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  message: string;
  deliveryDate?: Date;
}

export default function GiftCardPurchase({ onPurchase }: GiftCardPurchaseProps) {
  const [step, setStep] = useState(1);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedDesign, setSelectedDesign] = useState<GiftCardDesign>(designs[0]);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [deliveryOption, setDeliveryOption] = useState<'now' | 'scheduled'>('now');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [giftCardCode, setGiftCardCode] = useState('');

  const amount = selectedAmount || (customAmount ? parseInt(customAmount) : 0);
  const isValidAmount = amount >= 25 && amount <= 1000;

  const handlePurchase = async () => {
    setIsProcessing(true);

    try {
      // Call the gift card API
      const response = await fetch('/api/giftcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          design: selectedDesign.id,
          recipientName,
          recipientEmail,
          senderName,
          message,
          deliveryDate: deliveryOption === 'scheduled' ? deliveryDate : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create gift card');
      }

      setGiftCardCode(data.giftCard.code);
      setPurchaseComplete(true);

      if (onPurchase) {
        onPurchase({
          amount,
          design: selectedDesign,
          recipientName,
          recipientEmail,
          senderName,
          message,
          deliveryDate: deliveryOption === 'scheduled' ? new Date(deliveryDate) : undefined,
        });
      }
    } catch (error) {
      console.error('Gift card purchase error:', error);
      // Could show error to user here
    } finally {
      setIsProcessing(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(giftCardCode);
  };

  if (purchaseComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 overflow-hidden"
      >
        <div className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-green-600" />
          </motion.div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gift Card Sent!</h2>
          <p className="text-gray-600 mb-8">
            {recipientName} will receive their ${amount} gift card
            {deliveryOption === 'scheduled' ? ` on ${new Date(deliveryDate).toLocaleDateString()}` : ' shortly'}.
          </p>

          {/* Gift Card Preview */}
          <div className={`relative mx-auto w-full max-w-sm aspect-[1.6/1] rounded-2xl bg-gradient-to-br ${selectedDesign.gradient} p-6 text-white shadow-xl mb-6`}>
            <div className="absolute top-4 right-4 opacity-30">
              {selectedDesign.icon}
            </div>
            <div className="h-full flex flex-col justify-between">
              <div>
                <p className="text-sm opacity-80">Surf or Sound</p>
                <p className="text-3xl font-bold">${amount}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Gift Card Code</p>
                <p className="text-lg font-mono font-bold">{giftCardCode}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={copyCode}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy Code
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="w-4 h-4" />
              Download
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-ocean-500 to-ocean-600 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Gift className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Gift Cards</h2>
        </div>
        <p className="text-ocean-100">Give the gift of a beach getaway</p>
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {['Amount', 'Design', 'Details', 'Review'].map((label, index) => (
            <div key={label} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step > index + 1
                    ? 'bg-green-500 text-white'
                    : step === index + 1
                    ? 'bg-ocean-600 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step > index + 1 ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <span
                className={`ml-2 text-sm font-medium hidden sm:block ${
                  step >= index + 1 ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
              {index < 3 && (
                <ChevronRight className="w-5 h-5 text-gray-300 mx-2 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Amount */}
          {step === 1 && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Choose an amount
              </h3>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setSelectedAmount(preset);
                      setCustomAmount('');
                    }}
                    className={`py-4 rounded-xl font-bold text-lg transition-all ${
                      selectedAmount === preset
                        ? 'bg-ocean-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">
                  $
                </span>
                <input
                  type="number"
                  placeholder="Enter custom amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  min={25}
                  max={1000}
                  className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Gift cards can be $25 - $1,000
              </p>
            </motion.div>
          )}

          {/* Step 2: Design */}
          {step === 2 && (
            <motion.div
              key="design"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pick a design
              </h3>

              {/* Preview */}
              <div className={`relative mx-auto w-full max-w-sm aspect-[1.6/1] rounded-2xl bg-gradient-to-br ${selectedDesign.gradient} p-6 text-white shadow-xl mb-6`}>
                <div className="absolute top-4 right-4 opacity-30">
                  {selectedDesign.icon}
                </div>
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <p className="text-sm opacity-80">Surf or Sound</p>
                    <p className="text-3xl font-bold">${amount}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">To: {recipientName || 'Recipient Name'}</p>
                    <p className="text-lg font-semibold">Gift Card</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {designs.map((design) => (
                  <button
                    key={design.id}
                    onClick={() => setSelectedDesign(design)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedDesign.id === design.id
                        ? 'border-ocean-500 bg-ocean-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-full aspect-[2/1] rounded-lg bg-gradient-to-br ${design.gradient} mb-2 flex items-center justify-center text-white/50`}>
                      {design.icon}
                    </div>
                    <p className="text-sm font-medium text-gray-700">{design.name}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Add recipient details
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient's Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Enter their name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient's Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="Enter their email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Message (optional)
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a personal message..."
                    rows={3}
                    maxLength={200}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500 resize-none"
                  />
                </div>
                <p className="text-xs text-gray-400 text-right mt-1">
                  {message.length}/200 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeliveryOption('now')}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                      deliveryOption === 'now'
                        ? 'border-ocean-500 bg-ocean-50 text-ocean-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    Send Now
                  </button>
                  <button
                    onClick={() => setDeliveryOption('scheduled')}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                      deliveryOption === 'scheduled'
                        ? 'border-ocean-500 bg-ocean-50 text-ocean-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    Schedule for Later
                  </button>
                </div>

                {deliveryOption === 'scheduled' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3"
                  >
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Review your gift card
              </h3>

              {/* Gift Card Preview */}
              <div className={`relative mx-auto w-full max-w-sm aspect-[1.6/1] rounded-2xl bg-gradient-to-br ${selectedDesign.gradient} p-6 text-white shadow-xl mb-6`}>
                <div className="absolute top-4 right-4 opacity-30">
                  {selectedDesign.icon}
                </div>
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <p className="text-sm opacity-80">Surf or Sound</p>
                    <p className="text-3xl font-bold">${amount}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">To: {recipientName}</p>
                    <p className="text-lg font-semibold">From: {senderName}</p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-semibold text-gray-900">${amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">To</span>
                  <span className="font-semibold text-gray-900">{recipientEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-semibold text-gray-900">
                    {deliveryOption === 'now'
                      ? 'Immediately'
                      : new Date(deliveryDate).toLocaleDateString()}
                  </span>
                </div>
                {message && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Message:</p>
                    <p className="text-gray-900 italic">"{message}"</p>
                  </div>
                )}
              </div>

              {/* Payment Info */}
              <div className="mt-6 p-4 bg-ocean-50 rounded-xl">
                <div className="flex items-center gap-2 text-ocean-700 mb-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-medium">Gift Card Benefits</span>
                </div>
                <ul className="text-sm text-ocean-600 space-y-1">
                  <li>• Never expires</li>
                  <li>• Valid for any property on Surf or Sound</li>
                  <li>• Can be combined with other gift cards</li>
                  <li>• Instant digital delivery</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-100 flex justify-between">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium"
          >
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={
              (step === 1 && !isValidAmount) ||
              (step === 3 && (!recipientName || !recipientEmail || !senderName))
            }
            className="px-6 py-3 bg-ocean-600 text-white rounded-xl font-medium hover:bg-ocean-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="px-6 py-3 bg-ocean-600 text-white rounded-xl font-medium hover:bg-ocean-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Purchase ${amount} Gift Card
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// Gift Card Balance Checker
export function GiftCardBalance() {
  const [code, setCode] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');

  const checkBalance = async () => {
    setIsChecking(true);
    setError('');
    setBalance(null);

    try {
      const response = await fetch(`/api/giftcards/${encodeURIComponent(code)}`);
      const data = await response.json();

      if (!response.ok || !data.valid) {
        setError('Invalid gift card code. Please check and try again.');
        return;
      }

      setBalance(data.balance);
    } catch (err) {
      setError('Unable to check balance. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-ocean-100 rounded-lg flex items-center justify-center">
          <Gift className="w-5 h-5 text-ocean-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Check Gift Card Balance</h3>
          <p className="text-sm text-gray-500">Enter your gift card code</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="SOS-XXXX-XXXX"
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-ocean-500"
        />
        <button
          onClick={checkBalance}
          disabled={!code || isChecking}
          className="px-6 py-3 bg-ocean-600 text-white rounded-xl font-medium hover:bg-ocean-700 transition-colors disabled:opacity-50"
        >
          {isChecking ? 'Checking...' : 'Check'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {balance !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-green-50 rounded-xl"
          >
            <p className="text-sm text-green-600 mb-1">Available Balance</p>
            <p className="text-3xl font-bold text-green-700">${balance.toFixed(2)}</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-red-50 rounded-xl"
          >
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Mini gift card promo component
export function GiftCardPromo() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-ocean-500 to-ocean-600 rounded-2xl p-6 text-white">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold mb-1">Give the Gift of Beach Time</h3>
          <p className="text-ocean-100">Digital gift cards delivered instantly</p>
        </div>
        <button className="px-6 py-3 bg-white text-ocean-600 rounded-xl font-semibold hover:bg-ocean-50 transition-colors">
          Buy Gift Card
        </button>
      </div>
    </div>
  );
}
