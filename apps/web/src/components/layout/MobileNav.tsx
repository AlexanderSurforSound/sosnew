'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Search, Heart, Map, User } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/properties', icon: Search, label: 'Search' },
  { href: '/explore', icon: Map, label: 'Explore' },
  { href: '/favorites', icon: Heart, label: 'Saved' },
  { href: '/account', icon: User, label: 'Account' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { favorites } = useFavorites();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-200 pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          const showBadge = item.href === '/favorites' && favorites.length > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full"
            >
              <motion.div
                initial={false}
                animate={{
                  scale: active ? 1 : 1,
                  y: active ? -2 : 0,
                }}
                className="relative"
              >
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    active ? 'text-ocean-600' : 'text-gray-400'
                  }`}
                  fill={active && item.href === '/favorites' ? 'currentColor' : 'none'}
                />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {favorites.length > 9 ? '9+' : favorites.length}
                  </span>
                )}
              </motion.div>
              <span
                className={`text-xs mt-1 transition-colors ${
                  active ? 'text-ocean-600 font-medium' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
              {active && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-ocean-600 rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
