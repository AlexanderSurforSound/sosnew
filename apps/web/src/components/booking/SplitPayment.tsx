'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, X, Mail, Check, AlertCircle, DollarSign, Percent, Equal } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  email: string;
  amount: number;
  percentage: number;
  status: 'pending' | 'invited' | 'accepted' | 'paid';
}

interface SplitPaymentProps {
  totalAmount: number;
  onConfirm?: (participants: Participant[]) => void;
}

export default function SplitPayment({ totalAmount, onConfirm }: SplitPaymentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [splitType, setSplitType] = useState<'equal' | 'custom' | 'percentage'>('equal');
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: '1',
      name: 'You',
      email: '',
      amount: totalAmount,
      percentage: 100,
      status: 'accepted',
    },
  ]);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const addParticipant = () => {
    if (!newName || !newEmail) return;

    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: newName,
      email: newEmail,
      amount: 0,
      percentage: 0,
      status: 'pending',
    };

    const updated = [...participants, newParticipant];
    setParticipants(recalculateSplit(updated, splitType));
    setNewName('');
    setNewEmail('');
    setShowAddForm(false);
  };

  const removeParticipant = (id: string) => {
    if (id === '1') return; // Can't remove yourself
    const updated = participants.filter((p) => p.id !== id);
    setParticipants(recalculateSplit(updated, splitType));
  };

  const recalculateSplit = (
    parts: Participant[],
    type: 'equal' | 'custom' | 'percentage'
  ): Participant[] => {
    if (type === 'equal') {
      const perPerson = Math.floor(totalAmount / parts.length);
      const remainder = totalAmount - perPerson * parts.length;
      return parts.map((p, i) => ({
        ...p,
        amount: perPerson + (i === 0 ? remainder : 0),
        percentage: Math.round((100 / parts.length) * 100) / 100,
      }));
    }
    return parts;
  };

  const updateParticipantAmount = (id: string, amount: number) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, amount, percentage: Math.round((amount / totalAmount) * 100 * 100) / 100 }
          : p
      )
    );
  };

  const updateParticipantPercentage = (id: string, percentage: number) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, percentage, amount: Math.round((percentage / 100) * totalAmount) }
          : p
      )
    );
  };

  const totalAllocated = participants.reduce((sum, p) => sum + p.amount, 0);
  const isBalanced = Math.abs(totalAllocated - totalAmount) < 1;

  const handleConfirm = () => {
    if (!isBalanced) return;
    onConfirm?.(participants);
    setIsOpen(false);
  };

  const getStatusBadge = (status: Participant['status']) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            Confirmed
          </span>
        );
      case 'paid':
        return (
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            Paid
          </span>
        );
      case 'invited':
        return (
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            Invited
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
            Pending
          </span>
        );
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
      >
        <Users className="w-4 h-4" />
        <span className="text-sm font-medium">Split Payment</span>
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
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Split Payment</h2>
                      <p className="text-purple-200 text-sm">Share the cost with friends & family</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Total Amount */}
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                  <p className="text-3xl font-bold text-gray-900">${totalAmount.toLocaleString()}</p>
                </div>

                {/* Split Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How do you want to split?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setSplitType('equal');
                        setParticipants(recalculateSplit(participants, 'equal'));
                      }}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-colors ${
                        splitType === 'equal'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Equal className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium">Equal</span>
                    </button>
                    <button
                      onClick={() => setSplitType('custom')}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-colors ${
                        splitType === 'custom'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <DollarSign className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium">Custom $</span>
                    </button>
                    <button
                      onClick={() => setSplitType('percentage')}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-colors ${
                        splitType === 'percentage'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Percent className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium">Percentage</span>
                    </button>
                  </div>
                </div>

                {/* Participants */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">
                      Participants ({participants.length})
                    </label>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add person
                    </button>
                  </div>

                  <div className="space-y-3">
                    {participants.map((participant) => (
                      <motion.div
                        key={participant.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{participant.name}</span>
                              {getStatusBadge(participant.status)}
                            </div>
                            {participant.email && (
                              <p className="text-sm text-gray-500">{participant.email}</p>
                            )}
                          </div>
                          {participant.id !== '1' && (
                            <button
                              onClick={() => removeParticipant(participant.id)}
                              className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4 text-gray-400" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {splitType === 'percentage' ? (
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="number"
                                value={participant.percentage}
                                onChange={(e) =>
                                  updateParticipantPercentage(participant.id, Number(e.target.value))
                                }
                                min={0}
                                max={100}
                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                              <span className="text-gray-500">%</span>
                              <span className="text-gray-400">=</span>
                              <span className="font-semibold text-gray-900">
                                ${participant.amount.toLocaleString()}
                              </span>
                            </div>
                          ) : splitType === 'custom' ? (
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-gray-500">$</span>
                              <input
                                type="number"
                                value={participant.amount}
                                onChange={(e) =>
                                  updateParticipantAmount(participant.id, Number(e.target.value))
                                }
                                min={0}
                                max={totalAmount}
                                className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                              <span className="text-gray-400 text-sm">
                                ({participant.percentage}%)
                              </span>
                            </div>
                          ) : (
                            <div className="flex-1">
                              <span className="text-2xl font-bold text-gray-900">
                                ${participant.amount.toLocaleString()}
                              </span>
                              <span className="text-gray-500 ml-2">
                                ({participant.percentage.toFixed(1)}%)
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Add Form */}
                  <AnimatePresence>
                    {showAddForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-4 border-2 border-dashed border-gray-300 rounded-xl"
                      >
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Email address"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowAddForm(false)}
                              className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={addParticipant}
                              disabled={!newName || !newEmail}
                              className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Balance Check */}
                {!isBalanced && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-sm text-red-700">
                      Split doesn't add up. Allocated: ${totalAllocated.toLocaleString()} / Total: $
                      {totalAmount.toLocaleString()}
                    </p>
                  </div>
                )}

                {isBalanced && participants.length > 1 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <p className="text-sm text-green-700">
                      Split is balanced! Each person will receive a payment request.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!isBalanced || participants.length < 2}
                    className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    Send Invites
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Each participant will receive an email with a secure payment link.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
