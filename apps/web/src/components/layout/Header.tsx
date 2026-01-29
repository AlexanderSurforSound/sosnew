'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X, User, Heart, Phone, Calendar, GitCompare, Mic, Search, Compass, Home, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useCompare } from '@/contexts/CompareContext';
import { VoiceSearchModal } from '@/components/search/VoiceSearch';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isLoading } = useAuth();
  const { favorites } = useFavorites();
  const { compareList } = useCompare();

  // Track scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#0f172a]/95 backdrop-blur-md shadow-lg' : 'bg-[#0f172a]'
    }`}>
      {/* Top bar - same base color, slightly darker */}
      <div className="bg-black/20 text-white/90 text-sm border-b border-white/5">
        <div className="container-page py-2 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="tel:800-237-1138" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5" />
              <span>800.237.1138</span>
            </a>
            <span className="hidden sm:inline text-white/70">|</span>
            <span className="hidden sm:inline text-white/80">Hatteras Island, NC</span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/owner-portal" className="hover:text-white transition-colors">Owner Login</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="container-page">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/surfOrSound_logo_whiteHT.svg"
              alt="Surf or Sound Realty"
              width={320}
              height={80}
              className="h-16 md:h-20 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/properties"
              className="px-5 py-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-lg text-lg font-medium transition-colors"
            >
              Vacation Rentals
            </Link>

            {/* Island Guide Link */}
            <Link
              href="/island-guide"
              className="px-5 py-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-lg text-lg font-medium transition-colors"
            >
              Island Guide
            </Link>

            <Link
              href="/specials"
              className="px-5 py-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-lg text-lg font-medium transition-colors"
            >
              Specials
            </Link>

            <a
              href="https://surforsoundsales.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-lg text-lg font-medium transition-colors"
            >
              Sales
            </a>

            <Link
              href="/owners"
              className="px-5 py-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-lg text-lg font-medium transition-colors"
            >
              Property Management
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search button */}
            <Link
              href="/properties"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/90 rounded-lg transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="text-sm font-medium">Search</span>
            </Link>

            {/* Voice Search */}
            <button
              onClick={() => setShowVoiceSearch(true)}
              className="hidden md:flex items-center justify-center w-9 h-9 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Voice Search"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Compare indicator */}
            {compareList.length > 0 && (
              <Link
                href="/compare"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-colors"
              >
                <GitCompare className="w-4 h-4" />
                <span className="text-sm font-medium">{compareList.length}</span>
              </Link>
            )}

            {/* Notifications - only show when logged in */}
            {user && (
              <div className="hidden sm:block">
                <NotificationCenter />
              </div>
            )}

            {/* Favorites - Adequate touch target */}
            <Link
              href="/favorites"
              className="relative p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <Heart className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>

            {!isLoading && (
              <>
                {user ? (
                  <Link
                    href="/account"
                    className="hidden sm:flex items-center gap-2 px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">{user.firstName || 'Account'}</span>
                  </Link>
                ) : (
                  <div className="hidden sm:flex items-center gap-2">
                    <Link
                      href="/auth/login"
                      className="px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      className="px-4 py-2 bg-white text-slate-900 rounded-lg font-semibold hover:bg-white/90 transition-colors"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile menu button - Larger touch target */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-white/10 py-4">
            <div className="flex flex-col gap-1">
              <Link
                href="/properties"
                className="flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Search className="w-5 h-5 text-cyan-400" />
                Vacation Rentals
              </Link>
              <Link
                href="/island-guide"
                className="flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Compass className="w-5 h-5 text-cyan-400" />
                Island Guide
              </Link>
              <Link
                href="/specials"
                className="flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Specials
              </Link>
              <a
                href="https://surforsoundsales.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Building2 className="w-5 h-5 text-emerald-400" />
                Sales
              </a>
              <Link
                href="/owners"
                className="flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-5 h-5 text-violet-400" />
                Property Management
              </Link>

              <hr className="border-white/10 my-2" />

              <Link
                href="/favorites"
                className="flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Heart className="w-5 h-5 text-rose-400" />
                Favorites {favorites.length > 0 && `(${favorites.length})`}
              </Link>
              {compareList.length > 0 && (
                <Link
                  href="/compare"
                  className="flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <GitCompare className="w-5 h-5 text-blue-400" />
                  Compare ({compareList.length})
                </Link>
              )}
              {user && (
                <Link
                  href="/trips"
                  className="flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  My Trips
                </Link>
              )}

              <hr className="border-white/10 my-3" />

              {user ? (
                <Link
                  href="/account"
                  className="flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  My Account
                </Link>
              ) : (
                <div className="flex flex-col gap-2 px-4">
                  <Link
                    href="/auth/login"
                    className="py-3 text-center text-white/90 hover:text-white font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="py-3 text-center bg-white text-slate-900 rounded-lg font-semibold hover:bg-white/90 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Voice Search Modal */}
      <VoiceSearchModal
        isOpen={showVoiceSearch}
        onClose={() => setShowVoiceSearch(false)}
        onSearch={(query) => {
          setShowVoiceSearch(false);
          window.location.href = `/properties?q=${encodeURIComponent(query)}`;
        }}
      />
    </header>
  );
}
