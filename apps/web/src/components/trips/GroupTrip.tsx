'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  X,
  Mail,
  Check,
  Crown,
  MessageSquare,
  Vote,
  Calendar,
  MapPin,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Send,
  UserPlus,
  Link as LinkIcon,
  Copy,
} from 'lucide-react';

interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'organizer' | 'member';
  status: 'active' | 'invited' | 'pending';
  joinedAt?: Date;
}

interface PropertyVote {
  propertyId: string;
  propertyName: string;
  votes: { memberId: string; vote: 'up' | 'down' }[];
}

interface DateOption {
  id: string;
  checkIn: Date;
  checkOut: Date;
  votes: string[]; // member IDs
}

interface ChatMessage {
  id: string;
  memberId: string;
  memberName: string;
  message: string;
  timestamp: Date;
}

interface GroupTripProps {
  tripId: string;
  tripName: string;
  onInvite?: (email: string) => void;
}

export default function GroupTrip({ tripId, tripName, onInvite }: GroupTripProps) {
  const [members, setMembers] = useState<GroupMember[]>([
    {
      id: '1',
      name: 'You',
      email: 'you@example.com',
      role: 'organizer',
      status: 'active',
      joinedAt: new Date(),
    },
  ]);

  const [propertyVotes, setPropertyVotes] = useState<PropertyVote[]>([
    {
      propertyId: 'prop-1',
      propertyName: 'Oceanfront Paradise',
      votes: [{ memberId: '1', vote: 'up' }],
    },
    {
      propertyId: 'prop-2',
      propertyName: 'Sunset Beach House',
      votes: [],
    },
  ]);

  const [dateOptions, setDateOptions] = useState<DateOption[]>([
    {
      id: 'date-1',
      checkIn: new Date('2024-07-15'),
      checkOut: new Date('2024-07-20'),
      votes: ['1'],
    },
    {
      id: 'date-2',
      checkIn: new Date('2024-07-22'),
      checkOut: new Date('2024-07-27'),
      votes: [],
    },
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      memberId: '1',
      memberName: 'You',
      message: 'Hey everyone! Looking forward to planning this trip!',
      timestamp: new Date(),
    },
  ]);

  const [activeTab, setActiveTab] = useState<'members' | 'properties' | 'dates' | 'chat'>('members');
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareLink = `https://surforsound.com/trips/join/${tripId}`;

  const handleInvite = () => {
    if (!newInviteEmail) return;

    const newMember: GroupMember = {
      id: Date.now().toString(),
      name: newInviteEmail.split('@')[0],
      email: newInviteEmail,
      role: 'member',
      status: 'invited',
    };

    setMembers((prev) => [...prev, newMember]);
    onInvite?.(newInviteEmail);
    setNewInviteEmail('');
    setShowInviteModal(false);
  };

  const handleVoteProperty = (propertyId: string, vote: 'up' | 'down') => {
    setPropertyVotes((prev) =>
      prev.map((pv) =>
        pv.propertyId === propertyId
          ? {
              ...pv,
              votes: [
                ...pv.votes.filter((v) => v.memberId !== '1'),
                { memberId: '1', vote },
              ],
            }
          : pv
      )
    );
  };

  const handleVoteDate = (dateId: string) => {
    setDateOptions((prev) =>
      prev.map((d) =>
        d.id === dateId
          ? {
              ...d,
              votes: d.votes.includes('1')
                ? d.votes.filter((id) => id !== '1')
                : [...d.votes, '1'],
            }
          : d
      )
    );
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      memberId: '1',
      memberName: 'You',
      message: newMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage('');
  };

  const copyShareLink = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{tripName}</h2>
              <p className="text-violet-200 text-sm">
                {members.length} member{members.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Invite
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {[
            { id: 'members', label: 'Members', icon: Users },
            { id: 'properties', label: 'Properties', icon: Heart },
            { id: 'dates', label: 'Dates', icon: Calendar },
            { id: 'chat', label: 'Chat', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-violet-600 border-b-2 border-violet-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {member.name[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{member.name}</span>
                    {member.role === 'organizer' && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        <Crown className="w-3 h-3" />
                        Organizer
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    member.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : member.status === 'invited'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {member.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              Vote on properties to help the group decide!
            </p>
            {propertyVotes.map((pv) => {
              const upVotes = pv.votes.filter((v) => v.vote === 'up').length;
              const downVotes = pv.votes.filter((v) => v.vote === 'down').length;
              const myVote = pv.votes.find((v) => v.memberId === '1')?.vote;

              return (
                <div
                  key={pv.propertyId}
                  className="p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-violet-600" />
                      <span className="font-medium text-gray-900">{pv.propertyName}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-green-600 flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {upVotes}
                      </span>
                      <span className="text-red-500 flex items-center gap-1">
                        <ThumbsDown className="w-4 h-4" />
                        {downVotes}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVoteProperty(pv.propertyId, 'up')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
                        myVote === 'up'
                          ? 'bg-green-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:border-green-300'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Love it
                    </button>
                    <button
                      onClick={() => handleVoteProperty(pv.propertyId, 'down')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
                        myVote === 'down'
                          ? 'bg-red-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:border-red-300'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      Not for me
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dates Tab */}
        {activeTab === 'dates' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              Vote on the dates that work best for you!
            </p>
            {dateOptions.map((option) => {
              const isVoted = option.votes.includes('1');
              const voteCount = option.votes.length;

              return (
                <button
                  key={option.id}
                  onClick={() => handleVoteDate(option.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    isVoted
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className={`w-5 h-5 ${isVoted ? 'text-violet-600' : 'text-gray-400'}`} />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">
                          {option.checkIn.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          -{' '}
                          {option.checkOut.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-gray-500">
                          {Math.ceil(
                            (option.checkOut.getTime() - option.checkIn.getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}{' '}
                          nights
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{voteCount} vote{voteCount !== 1 ? 's' : ''}</span>
                      {isVoted && <Check className="w-5 h-5 text-violet-600" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div>
            <div className="h-64 overflow-y-auto mb-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.memberId === '1' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-xl ${
                      msg.memberId === '1'
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">{msg.memberName}</p>
                    <p>{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.memberId === '1' ? 'text-violet-200' : 'text-gray-500'
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInviteModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Invite to Trip</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invite by email
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={newInviteEmail}
                      onChange={(e) => setNewInviteEmail(e.target.value)}
                      placeholder="friend@email.com"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleInvite}
                      disabled={!newInviteEmail}
                      className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
                    >
                      <Mail className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or share invite link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm"
                    />
                    <button
                      onClick={copyShareLink}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowInviteModal(false)}
                className="w-full mt-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                Done
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
