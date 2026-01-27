'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Camera,
  Image,
  MapPin,
  Calendar,
  Heart,
  Plus,
  Trash2,
  Edit2,
  Download,
  Share2,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  Move,
  Type,
  Smile,
  Sun,
  Waves,
  Fish,
  Utensils,
  Music,
} from 'lucide-react';

interface ScrapbookMemory {
  id: string;
  type: 'photo' | 'text' | 'highlight';
  content: string;
  caption?: string;
  date?: Date;
  location?: string;
  mood?: 'happy' | 'relaxed' | 'adventurous' | 'romantic' | 'fun';
}

interface TripScrapbookProps {
  tripName?: string;
  tripDates?: { start: Date; end: Date };
  propertyName?: string;
  location?: string;
  memories?: ScrapbookMemory[];
  onSave?: (memories: ScrapbookMemory[]) => void;
}

const moodIcons = {
  happy: <Smile className="w-4 h-4" />,
  relaxed: <Sun className="w-4 h-4" />,
  adventurous: <Waves className="w-4 h-4" />,
  romantic: <Heart className="w-4 h-4" />,
  fun: <Music className="w-4 h-4" />,
};

const moodColors = {
  happy: 'bg-amber-100 text-amber-600',
  relaxed: 'bg-blue-100 text-blue-600',
  adventurous: 'bg-green-100 text-green-600',
  romantic: 'bg-pink-100 text-pink-600',
  fun: 'bg-purple-100 text-purple-600',
};

const demoMemories: ScrapbookMemory[] = [
  {
    id: '1',
    type: 'highlight',
    content: 'Beach Day',
    caption: 'Our first morning waking up to the sound of waves',
    date: new Date(2024, 6, 15),
    location: 'Cape Point Beach',
    mood: 'happy',
  },
  {
    id: '2',
    type: 'text',
    content: 'We found the most amazing seafood restaurant! The sunset views from the deck were incredible. Already planning to come back.',
    date: new Date(2024, 6, 16),
    mood: 'relaxed',
  },
  {
    id: '3',
    type: 'highlight',
    content: 'Lighthouse Tour',
    caption: 'Climbed all 257 steps of Cape Hatteras Lighthouse!',
    date: new Date(2024, 6, 17),
    location: 'Cape Hatteras Lighthouse',
    mood: 'adventurous',
  },
  {
    id: '4',
    type: 'text',
    content: 'Kids spotted dolphins from the deck this morning! Best vacation ever.',
    date: new Date(2024, 6, 18),
    mood: 'happy',
  },
  {
    id: '5',
    type: 'highlight',
    content: 'Fishing Trip',
    caption: 'Dad caught a 30lb king mackerel on the charter!',
    date: new Date(2024, 6, 19),
    location: 'Offshore',
    mood: 'fun',
  },
];

export default function TripScrapbook({
  tripName = 'Summer Beach Getaway',
  tripDates = { start: new Date(2024, 6, 15), end: new Date(2024, 6, 22) },
  propertyName = 'Oceanfront Paradise',
  location = 'Hatteras Island, NC',
  memories: initialMemories = demoMemories,
  onSave,
}: TripScrapbookProps) {
  const [memories, setMemories] = useState<ScrapbookMemory[]>(initialMemories);
  const [editMode, setEditMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<ScrapbookMemory | null>(null);
  const [newMemory, setNewMemory] = useState<Partial<ScrapbookMemory>>({
    type: 'text',
    content: '',
    mood: 'happy',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addMemory = () => {
    if (!newMemory.content) return;

    const memory: ScrapbookMemory = {
      id: Date.now().toString(),
      type: newMemory.type || 'text',
      content: newMemory.content,
      caption: newMemory.caption,
      date: new Date(),
      location: newMemory.location,
      mood: newMemory.mood,
    };

    setMemories([...memories, memory]);
    setShowAddModal(false);
    setNewMemory({ type: 'text', content: '', mood: 'happy' });

    if (onSave) {
      onSave([...memories, memory]);
    }
  };

  const deleteMemory = (id: string) => {
    const updated = memories.filter((m) => m.id !== id);
    setMemories(updated);
    if (onSave) onSave(updated);
  };

  const handleReorder = (newOrder: ScrapbookMemory[]) => {
    setMemories(newOrder);
    if (onSave) onSave(newOrder);
  };

  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${tripDates.start.toLocaleDateString('en-US', options)} - ${tripDates.end.toLocaleDateString('en-US', options)}, ${tripDates.end.getFullYear()}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Cover Header */}
      <div className="relative h-48 bg-gradient-to-br from-ocean-400 via-ocean-500 to-blue-600 p-6 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-4 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
          <div className="absolute bottom-4 right-4 w-24 h-24 bg-white/20 rounded-full blur-xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-ocean-100 text-sm mb-2">
            <Calendar className="w-4 h-4" />
            {formatDateRange()}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">{tripName}</h1>
          <div className="flex items-center gap-2 text-ocean-100">
            <MapPin className="w-4 h-4" />
            {propertyName} • {location}
          </div>
        </div>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`p-2 rounded-lg transition-colors ${
              editMode ? 'bg-white text-ocean-600' : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex justify-around py-4 bg-gray-50 border-b border-gray-100">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{memories.length}</p>
          <p className="text-sm text-gray-500">Memories</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {Math.ceil((tripDates.end.getTime() - tripDates.start.getTime()) / (1000 * 60 * 60 * 24))}
          </p>
          <p className="text-sm text-gray-500">Days</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {new Set(memories.filter((m) => m.location).map((m) => m.location)).size}
          </p>
          <p className="text-sm text-gray-500">Places</p>
        </div>
      </div>

      {/* Memories Grid */}
      <div className="p-4">
        {editMode ? (
          <Reorder.Group
            axis="y"
            values={memories}
            onReorder={handleReorder}
            className="space-y-4"
          >
            {memories.map((memory) => (
              <Reorder.Item
                key={memory.id}
                value={memory}
                className="cursor-grab active:cursor-grabbing"
              >
                <MemoryCard
                  memory={memory}
                  editMode={editMode}
                  onDelete={() => deleteMemory(memory.id)}
                  onClick={() => setSelectedMemory(memory)}
                />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          <div className="space-y-4">
            {memories.map((memory, index) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MemoryCard
                  memory={memory}
                  editMode={editMode}
                  onClick={() => setSelectedMemory(memory)}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Memory Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="w-full mt-4 p-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-ocean-400 hover:text-ocean-600 transition-colors flex flex-col items-center gap-2"
        >
          <Plus className="w-8 h-8" />
          <span className="font-medium">Add a Memory</span>
        </motion.button>
      </div>

      {/* Add Memory Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-lg">Add Memory</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Memory Type */}
                <div className="flex gap-2">
                  {[
                    { type: 'text', icon: <Type className="w-5 h-5" />, label: 'Note' },
                    { type: 'highlight', icon: <Sparkles className="w-5 h-5" />, label: 'Highlight' },
                  ].map((option) => (
                    <button
                      key={option.type}
                      onClick={() =>
                        setNewMemory({ ...newMemory, type: option.type as ScrapbookMemory['type'] })
                      }
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-colors ${
                        newMemory.type === option.type
                          ? 'border-ocean-500 bg-ocean-50 text-ocean-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {newMemory.type === 'highlight' ? 'Highlight Title' : 'Your Memory'}
                  </label>
                  <textarea
                    value={newMemory.content}
                    onChange={(e) => setNewMemory({ ...newMemory, content: e.target.value })}
                    placeholder={
                      newMemory.type === 'highlight'
                        ? 'e.g., "Beach Bonfire Night"'
                        : 'Write about your favorite moment...'
                    }
                    rows={newMemory.type === 'highlight' ? 1 : 4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500 resize-none"
                  />
                </div>

                {/* Caption (for highlights) */}
                {newMemory.type === 'highlight' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Caption
                    </label>
                    <input
                      type="text"
                      value={newMemory.caption || ''}
                      onChange={(e) => setNewMemory({ ...newMemory, caption: e.target.value })}
                      placeholder="Add more details..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
                    />
                  </div>
                )}

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (optional)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={newMemory.location || ''}
                      onChange={(e) => setNewMemory({ ...newMemory, location: e.target.value })}
                      placeholder="Where was this?"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500"
                    />
                  </div>
                </div>

                {/* Mood */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How did it feel?
                  </label>
                  <div className="flex gap-2">
                    {(Object.keys(moodIcons) as Array<keyof typeof moodIcons>).map((mood) => (
                      <button
                        key={mood}
                        onClick={() => setNewMemory({ ...newMemory, mood })}
                        className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-colors ${
                          newMemory.mood === mood
                            ? 'border-ocean-500 bg-ocean-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className={`p-1.5 rounded-lg ${moodColors[mood]}`}>
                          {moodIcons[mood]}
                        </span>
                        <span className="text-xs capitalize text-gray-600">{mood}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={addMemory}
                  disabled={!newMemory.content}
                  className="w-full py-3 bg-ocean-600 text-white rounded-xl font-semibold hover:bg-ocean-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Memory
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Memory Card Component
function MemoryCard({
  memory,
  editMode,
  onDelete,
  onClick,
}: {
  memory: ScrapbookMemory;
  editMode: boolean;
  onDelete?: () => void;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-xl transition-all ${
        memory.type === 'highlight'
          ? 'bg-gradient-to-br from-ocean-50 to-blue-50 border-2 border-ocean-200'
          : 'bg-gray-50'
      } ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
    >
      {editMode && (
        <div className="absolute top-2 right-2 flex gap-1">
          <button className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-gray-50">
            <Move className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="p-1.5 bg-white rounded-lg shadow-sm hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}

      <div className="flex items-start gap-3">
        {memory.mood && (
          <div className={`p-2 rounded-lg ${moodColors[memory.mood]}`}>
            {moodIcons[memory.mood]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {memory.type === 'highlight' ? (
            <>
              <h4 className="font-bold text-gray-900 text-lg">{memory.content}</h4>
              {memory.caption && (
                <p className="text-gray-600 mt-1">{memory.caption}</p>
              )}
            </>
          ) : (
            <p className="text-gray-700">{memory.content}</p>
          )}

          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            {memory.date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {memory.date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
            {memory.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {memory.location}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
