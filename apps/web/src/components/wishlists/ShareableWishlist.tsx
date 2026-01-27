'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Share2,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  Mail,
  MessageSquare,
  Link,
  Users,
  Lock,
  Globe,
  Check,
  X,
  MapPin,
  Star,
  Bed,
  Bath,
  ChevronRight,
  FolderPlus,
} from 'lucide-react';

interface WishlistProperty {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  bedrooms: number;
  bathrooms: number;
  image?: string;
  addedAt: Date;
  notes?: string;
}

interface Wishlist {
  id: string;
  name: string;
  description?: string;
  privacy: 'private' | 'shared' | 'public';
  shareLink?: string;
  collaborators: Collaborator[];
  properties: WishlistProperty[];
  createdAt: Date;
  updatedAt: Date;
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  canEdit: boolean;
}

const demoWishlists: Wishlist[] = [
  {
    id: '1',
    name: 'Summer Getaway 2024',
    description: 'Options for our family beach trip',
    privacy: 'shared',
    shareLink: 'https://surfororsound.com/wishlist/abc123',
    collaborators: [
      { id: 'c1', name: 'Sarah M.', email: 'sarah@email.com', canEdit: true },
      { id: 'c2', name: 'John D.', email: 'john@email.com', canEdit: false },
    ],
    properties: [
      {
        id: 'p1',
        name: 'Oceanfront Paradise',
        location: 'Avon',
        price: 450,
        rating: 4.9,
        bedrooms: 5,
        bathrooms: 4,
        addedAt: new Date(Date.now() - 86400000 * 3),
        notes: 'Love the pool!',
      },
      {
        id: 'p2',
        name: 'Sunset Beach House',
        location: 'Buxton',
        price: 325,
        rating: 4.7,
        bedrooms: 4,
        bathrooms: 3,
        addedAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        id: 'p3',
        name: 'Lighthouse View Cottage',
        location: 'Hatteras',
        price: 275,
        rating: 4.8,
        bedrooms: 3,
        bathrooms: 2,
        addedAt: new Date(Date.now() - 86400000),
        notes: 'Great for small groups',
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 7),
    updatedAt: new Date(Date.now() - 86400000),
  },
  {
    id: '2',
    name: 'Romantic Weekend',
    description: 'Anniversary trip options',
    privacy: 'private',
    collaborators: [],
    properties: [
      {
        id: 'p4',
        name: 'Cozy Oceanside Retreat',
        location: 'Rodanthe',
        price: 195,
        rating: 4.9,
        bedrooms: 1,
        bathrooms: 1,
        addedAt: new Date(Date.now() - 86400000 * 5),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 10),
    updatedAt: new Date(Date.now() - 86400000 * 5),
  },
];

interface ShareableWishlistProps {
  onPropertyClick?: (propertyId: string) => void;
}

export default function ShareableWishlist({ onPropertyClick }: ShareableWishlistProps) {
  const [wishlists, setWishlists] = useState<Wishlist[]>(demoWishlists);
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Create new wishlist state
  const [newWishlistName, setNewWishlistName] = useState('');
  const [newWishlistDescription, setNewWishlistDescription] = useState('');
  const [newWishlistPrivacy, setNewWishlistPrivacy] = useState<Wishlist['privacy']>('private');

  const createWishlist = () => {
    const newWishlist: Wishlist = {
      id: Date.now().toString(),
      name: newWishlistName,
      description: newWishlistDescription,
      privacy: newWishlistPrivacy,
      collaborators: [],
      properties: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setWishlists((prev) => [newWishlist, ...prev]);
    setShowCreateModal(false);
    setNewWishlistName('');
    setNewWishlistDescription('');
    setNewWishlistPrivacy('private');
  };

  const copyShareLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const removeFromWishlist = (wishlistId: string, propertyId: string) => {
    setWishlists((prev) =>
      prev.map((wl) =>
        wl.id === wishlistId
          ? { ...wl, properties: wl.properties.filter((p) => p.id !== propertyId) }
          : wl
      )
    );
    if (selectedWishlist?.id === wishlistId) {
      setSelectedWishlist((prev) =>
        prev
          ? { ...prev, properties: prev.properties.filter((p) => p.id !== propertyId) }
          : null
      );
    }
  };

  const getPrivacyIcon = (privacy: Wishlist['privacy']) => {
    switch (privacy) {
      case 'private':
        return <Lock className="w-4 h-4" />;
      case 'shared':
        return <Users className="w-4 h-4" />;
      case 'public':
        return <Globe className="w-4 h-4" />;
    }
  };

  const getPrivacyLabel = (privacy: Wishlist['privacy']) => {
    switch (privacy) {
      case 'private':
        return 'Only you';
      case 'shared':
        return 'Shared';
      case 'public':
        return 'Public';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">My Wishlists</h2>
              <p className="text-pink-100 text-sm">
                {wishlists.length} {wishlists.length === 1 ? 'list' : 'lists'} •{' '}
                {wishlists.reduce((sum, wl) => sum + wl.properties.length, 0)} properties saved
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New List
          </button>
        </div>
      </div>

      {/* Wishlists Grid */}
      <div className="p-4 grid sm:grid-cols-2 gap-4">
        {wishlists.map((wishlist) => (
          <motion.div
            key={wishlist.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setSelectedWishlist(wishlist)}
            className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
          >
            {/* Preview Images */}
            <div className="grid grid-cols-2 gap-1 mb-3 aspect-[2/1] rounded-lg overflow-hidden">
              {wishlist.properties.slice(0, 4).map((property, i) => (
                <div
                  key={property.id}
                  className={`bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center ${
                    wishlist.properties.length === 1 ? 'col-span-2 row-span-2' : ''
                  } ${wishlist.properties.length === 2 ? 'row-span-2' : ''} ${
                    wishlist.properties.length === 3 && i === 0 ? 'row-span-2' : ''
                  }`}
                >
                  <Heart className="w-6 h-6 text-pink-300" />
                </div>
              ))}
              {wishlist.properties.length === 0 && (
                <div className="col-span-2 bg-gray-100 flex items-center justify-center">
                  <FolderPlus className="w-8 h-8 text-gray-300" />
                </div>
              )}
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{wishlist.name}</h3>
                <p className="text-sm text-gray-500">
                  {wishlist.properties.length}{' '}
                  {wishlist.properties.length === 1 ? 'property' : 'properties'}
                </p>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                {getPrivacyIcon(wishlist.privacy)}
              </div>
            </div>

            {wishlist.collaborators.length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <div className="flex -space-x-2">
                  {wishlist.collaborators.slice(0, 3).map((collab) => (
                    <div
                      key={collab.id}
                      className="w-6 h-6 bg-pink-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                    >
                      {collab.name.charAt(0)}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">
                  Shared with {wishlist.collaborators.length}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Wishlist Detail Modal */}
      <AnimatePresence>
        {selectedWishlist && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedWishlist(null)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-50 shadow-xl overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 p-4 z-10">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => setSelectedWishlist(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Share2 className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{selectedWishlist.name}</h2>
                {selectedWishlist.description && (
                  <p className="text-gray-500 text-sm">{selectedWishlist.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    {getPrivacyIcon(selectedWishlist.privacy)}
                    {getPrivacyLabel(selectedWishlist.privacy)}
                  </span>
                  <span>
                    {selectedWishlist.properties.length}{' '}
                    {selectedWishlist.properties.length === 1 ? 'property' : 'properties'}
                  </span>
                </div>

                {/* Collaborators */}
                {selectedWishlist.collaborators.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-2">Shared with</p>
                    <div className="flex items-center gap-2">
                      {selectedWishlist.collaborators.map((collab) => (
                        <div
                          key={collab.id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full"
                        >
                          <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {collab.name.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-700">{collab.name}</span>
                          {collab.canEdit && (
                            <Edit2 className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      ))}
                      <button className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200">
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Properties */}
              <div className="p-4 space-y-4">
                {selectedWishlist.properties.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No properties saved yet</p>
                    <p className="text-sm text-gray-400">
                      Start browsing and save properties you love
                    </p>
                  </div>
                ) : (
                  selectedWishlist.properties.map((property) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-xl overflow-hidden"
                    >
                      <div
                        className="flex gap-4 p-4 cursor-pointer"
                        onClick={() => onPropertyClick?.(property.id)}
                      >
                        {/* Image */}
                        <div className="w-28 h-28 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                          <Heart className="w-8 h-8 text-pink-300" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 line-clamp-1">
                            {property.name}
                          </h4>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {property.location}
                          </p>

                          <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              {property.rating}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bed className="w-4 h-4" />
                              {property.bedrooms}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bath className="w-4 h-4" />
                              {property.bathrooms}
                            </span>
                          </div>

                          <p className="mt-2 font-bold text-gray-900">
                            ${property.price}
                            <span className="text-sm font-normal text-gray-500">/night</span>
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromWishlist(selectedWishlist.id, property.id);
                          }}
                          className="p-2 hover:bg-gray-200 rounded-lg h-fit"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>

                      {/* Notes */}
                      {property.notes && (
                        <div className="px-4 pb-4">
                          <div className="bg-white rounded-lg p-3 text-sm">
                            <p className="text-gray-600">
                              <span className="font-medium">Note:</span> {property.notes}
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create Wishlist Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl z-50"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-lg">Create New Wishlist</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newWishlistName}
                    onChange={(e) => setNewWishlistName(e.target.value)}
                    placeholder="e.g., Summer Vacation"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={newWishlistDescription}
                    onChange={(e) => setNewWishlistDescription(e.target.value)}
                    placeholder="Add notes about this trip..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Privacy
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        value: 'private',
                        icon: <Lock className="w-5 h-5" />,
                        label: 'Private',
                        description: 'Only you can see',
                      },
                      {
                        value: 'shared',
                        icon: <Users className="w-5 h-5" />,
                        label: 'Shared',
                        description: 'Share with specific people',
                      },
                      {
                        value: 'public',
                        icon: <Globe className="w-5 h-5" />,
                        label: 'Public',
                        description: 'Anyone with link can view',
                      },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          setNewWishlistPrivacy(option.value as Wishlist['privacy'])
                        }
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                          newWishlistPrivacy === option.value
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            newWishlistPrivacy === option.value
                              ? 'bg-pink-500 text-white'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {option.icon}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{option.label}</p>
                          <p className="text-sm text-gray-500">{option.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={createWishlist}
                  disabled={!newWishlistName.trim()}
                  className="w-full py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Wishlist
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && selectedWishlist && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl z-50"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-lg">Share "{selectedWishlist.name}"</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Share Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Share Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={
                        selectedWishlist.shareLink ||
                        `https://surfororsound.com/wishlist/${selectedWishlist.id}`
                      }
                      readOnly
                      className="flex-1 px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm"
                    />
                    <button
                      onClick={() =>
                        copyShareLink(
                          selectedWishlist.shareLink ||
                            `https://surfororsound.com/wishlist/${selectedWishlist.id}`
                        )
                      }
                      className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Share Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Share via
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <Mail className="w-6 h-6 text-gray-600" />
                      <span className="text-sm text-gray-700">Email</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <MessageSquare className="w-6 h-6 text-gray-600" />
                      <span className="text-sm text-gray-700">Message</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <Link className="w-6 h-6 text-gray-600" />
                      <span className="text-sm text-gray-700">More</span>
                    </button>
                  </div>
                </div>

                {/* Invite Collaborators */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invite to collaborate
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter email address"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      Invite
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Collaborators can add and remove properties
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Add to wishlist button component
export function AddToWishlistButton({
  propertyId,
  wishlists,
  onAdd,
}: {
  propertyId: string;
  wishlists: { id: string; name: string; hasProperty: boolean }[];
  onAdd: (wishlistId: string, propertyId: string) => void;
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 bg-white/90 backdrop-blur rounded-full shadow-sm hover:bg-white transition-colors"
      >
        <Heart
          className={`w-5 h-5 ${
            wishlists.some((w) => w.hasProperty)
              ? 'fill-red-500 text-red-500'
              : 'text-gray-600'
          }`}
        />
      </button>

      <AnimatePresence>
        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden"
            >
              <div className="p-2">
                <p className="text-xs font-medium text-gray-500 px-2 py-1">
                  Save to wishlist
                </p>
                {wishlists.map((wishlist) => (
                  <button
                    key={wishlist.id}
                    onClick={() => {
                      onAdd(wishlist.id, propertyId);
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span className="text-sm text-gray-700">{wishlist.name}</span>
                    {wishlist.hasProperty && (
                      <Check className="w-4 h-4 text-pink-500" />
                    )}
                  </button>
                ))}
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Create new list</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
