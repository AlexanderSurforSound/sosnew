'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, Users, ChevronDown, Play, Pause, Volume2, VolumeX, ArrowRight, Sun, Cloud, CloudRain, CloudSun, Wind } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWeather } from '@/hooks/useWeather';

const MIN_NIGHTS = 3;

// Cinematic text that rotates - synced to 40-second video (8 × 5 sec)
const heroTexts = [
  { main: "Hatteras Island", accent: "Is Calling" },
  { main: "Ocean on One Side", accent: "Sound on the Other" },
  { main: "Fifty Miles of", accent: "Untouched Shoreline" },
  { main: "Legends", accent: "Are Made Here" },
  { main: "Morning Tides", accent: "Evening Fires" },
  { main: "Find Your Place", accent: "Find Your Peace" },
  { main: "Cast Your Line", accent: "Clear Your Mind" },
  { main: "Your Story", accent: "Begins Here" },
];

export default function HeroSection() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const weatherRef = useRef<HTMLDivElement>(null);

  // Live weather data
  const { weather, forecast, isLoading: weatherLoading } = useWeather();
  const [showForecast, setShowForecast] = useState(false);

  // Get weather icon component
  const WeatherIcon = () => {
    if (!weather) return <Sun className="w-5 h-5" />;
    const condition = weather.condition.toLowerCase();
    if (condition.includes('clear') || condition.includes('sunny')) return <Sun className="w-5 h-5 text-amber-300" />;
    if (condition.includes('partly')) return <CloudSun className="w-5 h-5 text-amber-200" />;
    if (condition.includes('cloud') || condition.includes('overcast')) return <Cloud className="w-5 h-5 text-gray-300" />;
    if (condition.includes('rain')) return <CloudRain className="w-5 h-5 text-blue-300" />;
    return <Sun className="w-5 h-5 text-amber-300" />;
  };

  // Optimized scroll handler with RAF
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const progress = Math.min(scrollY / 600, 1);
          setScrollProgress(progress);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Rotate hero text
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % heroTexts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Close forecast when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (weatherRef.current && !weatherRef.current.contains(event.target as Node)) {
        setShowForecast(false);
      }
    };
    if (showForecast) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showForecast]);

  // Calculate minimum checkout date
  const getMinCheckout = (checkInDate: string) => {
    if (!checkInDate) return new Date().toISOString().split('T')[0];
    const date = new Date(checkInDate);
    date.setDate(date.getDate() + MIN_NIGHTS);
    return date.toISOString().split('T')[0];
  };

  const handleCheckInChange = (date: string) => {
    setCheckIn(date);
    if (date) {
      const minCheckout = getMinCheckout(date);
      if (!checkOut || checkOut < minCheckout) {
        setCheckOut(minCheckout);
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests.toString());
    router.push(`/properties?${params.toString()}`);
  };

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div ref={containerRef} className="relative h-screen overflow-hidden bg-black">
      {/* Video/Image Background with Parallax - using CSS transforms for performance */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: `translate3d(0, ${scrollProgress * 150}px, 0) scale(${1 + scrollProgress * 0.1})`,
        }}
      >
        {/* Fallback gradient - shows behind video or if video fails */}
        <div className={`absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 transition-opacity duration-1000 ${videoLoaded && !videoError ? 'opacity-0' : 'opacity-100'}`} />

        {/* Video Background */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ filter: 'contrast(1.05) saturate(1.1) brightness(1.02)' }}
          poster="/images/hero-poster.jpg"
          onCanPlay={() => setVideoLoaded(true)}
          onError={(e) => {
            // Only set error if video truly failed to load, not on loop
            const video = e.currentTarget;
            if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
              setVideoError(true);
            }
          }}
        >
          <source src="/videos/hatteras-aerial.mp4?v=2" type="video/mp4" />
        </video>

        {/* Cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />

        {/* Film grain effect */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Video Controls - Hidden on small mobile for cleaner look */}
      <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 z-30 hidden xs:flex gap-2">
        <button
          onClick={toggleVideo}
          className="p-2.5 sm:p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors border border-white/20 touch-manipulation"
          aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
        >
          {isVideoPlaying ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 text-white" />
          )}
        </button>
        <button
          onClick={toggleMute}
          className="p-2.5 sm:p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors border border-white/20 touch-manipulation"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-white" />
          ) : (
            <Volume2 className="w-4 h-4 text-white" />
          )}
        </button>
      </div>

      {/* Main Content */}
      <div
        className="relative z-20 flex flex-col items-center justify-center h-full px-4 will-change-opacity"
        style={{ opacity: 1 - scrollProgress }}
      >
        {/* Minimal top branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute top-8 left-1/2 -translate-x-1/2"
        >
          <span className="text-white/60 text-sm tracking-[0.3em] uppercase font-light">
            Hatteras Island • Outer Banks
          </span>
        </motion.div>

        {/* Hero Text - Cinematic Typography */}
        <div className="text-center mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTextIndex}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-white tracking-tight leading-[1.1]">
                <span className="block">{heroTexts[currentTextIndex].main}</span>
                <span className="block mt-2 font-serif italic text-amber-200/90">
                  {heroTexts[currentTextIndex].accent}
                </span>
              </h1>
            </motion.div>
          </AnimatePresence>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="mt-8 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Seven villages. One unforgettable escape.
            <span className="block mt-2 text-white/50 text-base">
              The premier vacation rental collection on North Carolina's most iconic barrier island.
            </span>
          </motion.p>
        </div>

        {/* Search Box - Refined */}
        <motion.form
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          onSubmit={handleSearch}
          className="w-full max-w-4xl"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20 shadow-2xl">
            <div className="flex flex-col lg:flex-row gap-2">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Check-in */}
                <div className="relative bg-white/95 rounded-xl overflow-hidden group">
                  <label className="absolute left-4 top-2 text-xs text-gray-500 font-medium">Arrive</label>
                  <Calendar className="absolute left-4 bottom-3.5 w-4 h-4 text-gray-400 group-focus-within:text-cyan-600 transition-colors" />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => handleCheckInChange(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 pt-7 pb-3 bg-transparent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 text-gray-900 font-medium"
                  />
                </div>

                {/* Check-out */}
                <div className="relative bg-white/95 rounded-xl overflow-hidden group">
                  <label className="absolute left-4 top-2 text-xs text-gray-500 font-medium">Depart</label>
                  <Calendar className="absolute left-4 bottom-3.5 w-4 h-4 text-gray-400 group-focus-within:text-cyan-600 transition-colors" />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn ? getMinCheckout(checkIn) : new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 pt-7 pb-3 bg-transparent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 text-gray-900 font-medium"
                  />
                </div>

                {/* Guests */}
                <div className="relative bg-white/95 rounded-xl overflow-hidden group">
                  <label className="absolute left-4 top-2 text-xs text-gray-500 font-medium">Guests</label>
                  <Users className="absolute left-4 bottom-3.5 w-4 h-4 text-gray-400 group-focus-within:text-cyan-600 transition-colors" />
                  <select
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full pl-10 pr-8 pt-7 pb-3 bg-transparent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 text-gray-900 font-medium appearance-none cursor-pointer"
                  >
                    {[...Array(20)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 bottom-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                className="px-10 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all flex items-center justify-center gap-3 shadow-lg group"
              >
                <Search className="w-5 h-5" />
                <span>Search</span>
                <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
              </button>
            </div>
          </div>

          {/* Subtle helper text */}
          <p className="text-center text-white/40 text-sm mt-4">
            {MIN_NIGHTS}-night minimum stay
          </p>
        </motion.form>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-3"
          >
            <span className="text-white/40 text-xs tracking-widest uppercase">Explore</span>
            <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
          </motion.div>
        </motion.div>
      </div>

      {/* Live Conditions Badge - Clickable for Forecast - Hidden on mobile */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 z-30 hidden md:block"
      >
        <div ref={weatherRef} className="relative">
          {/* Main Weather Widget */}
          <button
            onClick={() => setShowForecast(!showForecast)}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-white text-left hover:bg-white/15 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/60">Right now on Hatteras</span>
              <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showForecast ? 'rotate-180' : ''}`} />
            </div>
            <div className="mt-2 flex gap-6">
              <div className="flex items-center gap-2">
                <WeatherIcon />
                <div>
                  <div className="text-2xl font-light">
                    {weatherLoading ? '—' : `${weather?.temp || 72}°`}
                  </div>
                  <div className="text-xs text-white/50">
                    {weather?.condition || 'Loading...'}
                  </div>
                </div>
              </div>
              <div className="border-l border-white/20 pl-6">
                <div className="text-2xl font-light flex items-center gap-1">
                  <Wind className="w-4 h-4 text-white/50" />
                  {weatherLoading ? '—' : `${weather?.windSpeed || 0}`}
                </div>
                <div className="text-xs text-white/50">
                  MPH {weather?.windDirection || ''}
                </div>
              </div>
              <div className="border-l border-white/20 pl-6">
                <div className="text-2xl font-light">
                  {weather?.sunset || '7:48 PM'}
                </div>
                <div className="text-xs text-white/50">Sunset</div>
              </div>
            </div>
          </button>

          {/* Forecast Dropdown */}
          <AnimatePresence>
            {showForecast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full mb-2 right-0 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 min-w-[320px]"
              >
                <h3 className="text-white font-semibold mb-3 text-sm">5-Day Forecast</h3>
                <div className="space-y-2">
                  {forecast.length > 0 ? (
                    forecast.slice(0, 5).map((day, index) => {
                      // Parse date without timezone issues (add T12:00 to treat as noon local time)
                      const dayDate = new Date(day.date + 'T12:00:00');
                      const dayName = index === 0 ? 'Today' : dayDate.toLocaleDateString('en-US', { weekday: 'short' });
                      return (
                        <div key={day.date} className="flex items-center justify-between text-white py-1.5 border-b border-white/10 last:border-0">
                          <span className="text-sm text-white/70 w-16">{dayName}</span>
                          <span className="text-xs text-white/50 flex-1 text-center">{day.condition}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{day.high}°</span>
                            <span className="text-xs text-white/50">{day.low}°</span>
                          </div>
                          {day.precipitation > 0 && (
                            <span className="text-xs text-blue-300 ml-2">{day.precipitation}%</span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    // Fallback forecast display with dynamic dates
                    Array.from({ length: 5 }, (_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() + i);
                      const dayName = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
                      return (
                        <div key={i} className="flex items-center justify-between text-white py-1.5 border-b border-white/10 last:border-0">
                          <span className="text-sm text-white/70 w-16">{dayName}</span>
                          <span className="text-xs text-white/50 flex-1 text-center">—</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">—</span>
                            <span className="text-xs text-white/50">—</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <p className="text-xs text-white/40 mt-3 text-center">Click outside to close</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
