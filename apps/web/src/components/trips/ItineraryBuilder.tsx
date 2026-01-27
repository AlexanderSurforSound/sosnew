'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Calendar,
  Plus,
  X,
  GripVertical,
  MapPin,
  Clock,
  Utensils,
  Waves,
  Camera,
  ShoppingBag,
  Fish,
  Sun,
  Sunset,
  Moon,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Sparkles,
} from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  type: 'dining' | 'beach' | 'activity' | 'shopping' | 'attraction' | 'custom';
  time?: string;
  duration?: string;
  location?: string;
  notes?: string;
  booked?: boolean;
}

interface DayPlan {
  date: Date;
  activities: Activity[];
}

interface ItineraryBuilderProps {
  checkIn: Date;
  checkOut: Date;
  propertyName: string;
  propertyLocation: string;
}

const activityTypes = [
  { type: 'beach', icon: Waves, label: 'Beach', color: 'bg-cyan-500' },
  { type: 'dining', icon: Utensils, label: 'Dining', color: 'bg-orange-500' },
  { type: 'activity', icon: Fish, label: 'Activity', color: 'bg-green-500' },
  { type: 'shopping', icon: ShoppingBag, label: 'Shopping', color: 'bg-pink-500' },
  { type: 'attraction', icon: Camera, label: 'Attraction', color: 'bg-purple-500' },
  { type: 'custom', icon: MapPin, label: 'Custom', color: 'bg-gray-500' },
];

const suggestedActivities: Activity[] = [
  { id: 'sug-1', title: 'Cape Hatteras Lighthouse', type: 'attraction', duration: '2 hours', location: 'Buxton' },
  { id: 'sug-2', title: 'Surfing Lessons', type: 'activity', duration: '2 hours', location: 'Waves' },
  { id: 'sug-3', title: 'Breakfast at Rusty\'s', type: 'dining', duration: '1 hour', location: 'Buxton' },
  { id: 'sug-4', title: 'Beach Day at Coquina Beach', type: 'beach', duration: '4 hours', location: 'Nags Head' },
  { id: 'sug-5', title: 'Fishing Charter', type: 'activity', duration: '4 hours', location: 'Hatteras' },
  { id: 'sug-6', title: 'Sunset at Pamlico Sound', type: 'attraction', duration: '1 hour', location: 'Salvo' },
];

export default function ItineraryBuilder({
  checkIn,
  checkOut,
  propertyName,
  propertyLocation,
}: ItineraryBuilderProps) {
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  const initializeDays = (): DayPlan[] => {
    const days: DayPlan[] = [];
    for (let i = 0; i <= nights; i++) {
      const date = new Date(checkIn);
      date.setDate(date.getDate() + i);
      days.push({
        date,
        activities: i === 0 ? [
          { id: 'check-in', title: 'Check-in at ' + propertyName, type: 'custom', time: '4:00 PM', location: propertyLocation }
        ] : i === nights ? [
          { id: 'check-out', title: 'Check-out', type: 'custom', time: '10:00 AM' }
        ] : [],
      });
    }
    return days;
  };

  const [days, setDays] = useState<DayPlan[]>(initializeDays);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    type: 'custom',
    title: '',
    time: '',
    duration: '',
    location: '',
    notes: '',
  });

  const selectedDay = days[selectedDayIndex];

  const addActivity = () => {
    if (!newActivity.title) return;

    const activity: Activity = {
      id: Date.now().toString(),
      title: newActivity.title || '',
      type: newActivity.type as Activity['type'] || 'custom',
      time: newActivity.time,
      duration: newActivity.duration,
      location: newActivity.location,
      notes: newActivity.notes,
    };

    setDays((prev) =>
      prev.map((day, index) =>
        index === selectedDayIndex
          ? { ...day, activities: [...day.activities, activity] }
          : day
      )
    );

    setNewActivity({ type: 'custom', title: '', time: '', duration: '', location: '', notes: '' });
    setShowAddActivity(false);
  };

  const addSuggestedActivity = (suggestion: Activity) => {
    const activity: Activity = {
      ...suggestion,
      id: Date.now().toString(),
    };

    setDays((prev) =>
      prev.map((day, index) =>
        index === selectedDayIndex
          ? { ...day, activities: [...day.activities, activity] }
          : day
      )
    );
  };

  const removeActivity = (activityId: string) => {
    setDays((prev) =>
      prev.map((day, index) =>
        index === selectedDayIndex
          ? { ...day, activities: day.activities.filter((a) => a.id !== activityId) }
          : day
      )
    );
  };

  const reorderActivities = (newOrder: Activity[]) => {
    setDays((prev) =>
      prev.map((day, index) =>
        index === selectedDayIndex ? { ...day, activities: newOrder } : day
      )
    );
  };

  const getActivityIcon = (type: Activity['type']) => {
    const config = activityTypes.find((t) => t.type === type);
    if (!config) return MapPin;
    return config.icon;
  };

  const getActivityColor = (type: Activity['type']) => {
    const config = activityTypes.find((t) => t.type === type);
    return config?.color || 'bg-gray-500';
  };

  const getTimeOfDay = (time?: string) => {
    if (!time) return null;
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return { icon: Sun, label: 'Morning', color: 'text-amber-500' };
    if (hour < 17) return { icon: Sun, label: 'Afternoon', color: 'text-orange-500' };
    if (hour < 20) return { icon: Sunset, label: 'Evening', color: 'text-pink-500' };
    return { icon: Moon, label: 'Night', color: 'text-indigo-500' };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Trip Itinerary</h2>
              <p className="text-indigo-200 text-sm">
                {nights} nights · {formatDate(checkIn)} - {formatDate(checkOut)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex items-center p-2 gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedDayIndex(Math.max(0, selectedDayIndex - 1))}
            disabled={selectedDayIndex === 0}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {days.map((day, index) => (
            <button
              key={index}
              onClick={() => setSelectedDayIndex(index)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors ${
                index === selectedDayIndex
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="text-xs opacity-75">Day {index + 1}</span>
              <span className="block text-sm">
                {day.date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
              </span>
            </button>
          ))}

          <button
            onClick={() => setSelectedDayIndex(Math.min(days.length - 1, selectedDayIndex + 1))}
            disabled={selectedDayIndex === days.length - 1}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
        {/* Activities List */}
        <div className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              {formatDate(selectedDay.date)}
            </h3>
            <button
              onClick={() => setShowAddActivity(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Activity
            </button>
          </div>

          {selectedDay.activities.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-2">No activities planned yet</p>
              <p className="text-sm text-gray-500">
                Add activities from suggestions or create your own
              </p>
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={selectedDay.activities}
              onReorder={reorderActivities}
              className="space-y-3"
            >
              {selectedDay.activities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                const timeOfDay = getTimeOfDay(activity.time);

                return (
                  <Reorder.Item
                    key={activity.id}
                    value={activity}
                    className="bg-gray-50 rounded-xl p-4 cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 cursor-grab">
                        <GripVertical className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className={`w-10 h-10 ${getActivityColor(activity.type)} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{activity.title}</h4>
                            {activity.location && (
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {activity.location}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeActivity(activity.id)}
                            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          {activity.time && (
                            <span className="flex items-center gap-1 text-gray-600">
                              <Clock className="w-3 h-3" />
                              {activity.time}
                            </span>
                          )}
                          {activity.duration && (
                            <span className="text-gray-500">{activity.duration}</span>
                          )}
                          {activity.booked && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              Booked
                            </span>
                          )}
                        </div>
                        {activity.notes && (
                          <p className="text-sm text-gray-500 mt-2">{activity.notes}</p>
                        )}
                      </div>
                    </div>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          )}

          {/* Add Activity Form */}
          <AnimatePresence>
            {showAddActivity && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 border-2 border-dashed border-indigo-300 rounded-xl bg-indigo-50"
              >
                <h4 className="font-medium text-gray-900 mb-3">Add New Activity</h4>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {activityTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.type}
                          onClick={() => setNewActivity((prev) => ({ ...prev, type: type.type as Activity['type'] }))}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            newActivity.type === type.type
                              ? `${type.color} text-white`
                              : 'bg-white text-gray-700 border border-gray-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    value={newActivity.title}
                    onChange={(e) => setNewActivity((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Activity name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="time"
                      value={newActivity.time}
                      onChange={(e) => setNewActivity((prev) => ({ ...prev, time: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={newActivity.duration}
                      onChange={(e) => setNewActivity((prev) => ({ ...prev, duration: e.target.value }))}
                      placeholder="Duration (e.g., 2 hours)"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <input
                    type="text"
                    value={newActivity.location}
                    onChange={(e) => setNewActivity((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddActivity(false)}
                      className="flex-1 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addActivity}
                      disabled={!newActivity.title}
                      className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      Add Activity
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Suggestions */}
        <div className="p-6 bg-gray-50">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-gray-900">Suggested Activities</h3>
          </div>
          <div className="space-y-2">
            {suggestedActivities.map((suggestion) => {
              const Icon = getActivityIcon(suggestion.type);
              return (
                <button
                  key={suggestion.id}
                  onClick={() => addSuggestedActivity(suggestion)}
                  className="w-full p-3 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${getActivityColor(suggestion.type)} rounded-lg flex items-center justify-center text-white`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {suggestion.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {suggestion.location} · {suggestion.duration}
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Click to add to your itinerary
          </p>
        </div>
      </div>
    </div>
  );
}
