import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

// Custom SVG icons for social platforms not in lucide
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

const TruthSocialIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2zm4 8h-2v-4h2v4zm0-6h-2V9h2v2z"/>
  </svg>
);

const XTwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const PinterestIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
  </svg>
);

interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  return (
    <footer id="footer" className={`bg-gray-900 text-white ${className}`}>
      <div className="container-page py-10 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Company Info */}
          <div>
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/images/surfOrSound_logo_white_blue.svg"
                alt="Surf or Sound Realty"
                width={400}
                height={160}
                className="h-32 md:h-36 w-auto"
              />
            </Link>
            <p className="text-gray-400 text-lg mb-6">
              Premier vacation rentals on Hatteras Island, NC. Experience the best of the Outer Banks.
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <a href="https://facebook.com/surforsound" target="_blank" rel="noopener noreferrer" className="w-11 h-11 sm:w-10 sm:h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all touch-manipulation" title="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com/surforsound" target="_blank" rel="noopener noreferrer" className="w-11 h-11 sm:w-10 sm:h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all touch-manipulation" title="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/surforsound" target="_blank" rel="noopener noreferrer" className="w-11 h-11 sm:w-10 sm:h-10 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all touch-manipulation" title="YouTube">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="https://tiktok.com/@surforsound" target="_blank" rel="noopener noreferrer" className="w-11 h-11 sm:w-10 sm:h-10 bg-gray-800 hover:bg-black rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all touch-manipulation" title="TikTok">
                <TikTokIcon className="w-5 h-5" />
              </a>
              <a href="https://x.com/surforsound" target="_blank" rel="noopener noreferrer" className="w-11 h-11 sm:w-10 sm:h-10 bg-gray-800 hover:bg-black rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all touch-manipulation" title="X (Twitter)">
                <XTwitterIcon className="w-5 h-5" />
              </a>
              <a href="https://pinterest.com/surforsound" target="_blank" rel="noopener noreferrer" className="w-11 h-11 sm:w-10 sm:h-10 bg-gray-800 hover:bg-red-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all touch-manipulation" title="Pinterest">
                <PinterestIcon className="w-5 h-5" />
              </a>
              <a href="https://truthsocial.com/@surforsound" target="_blank" rel="noopener noreferrer" className="w-11 h-11 sm:w-10 sm:h-10 bg-gray-800 hover:bg-blue-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all touch-manipulation" title="Truth Social">
                <TruthSocialIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Vacation Rentals */}
          <div>
            <h4 className="font-semibold text-xl mb-5">Vacation Rentals</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/properties" className="text-gray-400 hover:text-white text-lg transition-colors">
                  All Properties
                </Link>
              </li>
              <li>
                <Link href="/properties?petFriendly=true" className="text-gray-400 hover:text-white text-lg transition-colors">
                  Pet Friendly
                </Link>
              </li>
              <li>
                <Link href="/properties?featured=true" className="text-gray-400 hover:text-white text-lg transition-colors">
                  Featured Homes
                </Link>
              </li>
              <li>
                <Link href="/specials" className="text-gray-400 hover:text-white text-lg transition-colors">
                  Last Minute Deals
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-gray-400 hover:text-white text-lg transition-colors">
                  Compare Properties
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="text-gray-400 hover:text-white text-lg transition-colors">
                  My Favorites
                </Link>
              </li>
            </ul>
          </div>

          {/* Explore Hatteras */}
          <div>
            <h4 className="font-semibold text-xl mb-5">Explore Hatteras</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/island-guide" className="text-gray-400 hover:text-white text-lg transition-colors">
                  Island Guide
                </Link>
              </li>
              <li>
                <Link href="/island-guide?tab=dining" className="text-gray-400 hover:text-white text-lg transition-colors">
                  Dining & Restaurants
                </Link>
              </li>
              <li>
                <Link href="/island-guide?tab=events" className="text-gray-400 hover:text-white text-lg transition-colors">
                  Events & Activities
                </Link>
              </li>
              <li>
                <Link href="/island-guide?tab=blog" className="text-gray-400 hover:text-white text-lg transition-colors">
                  Blog & Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-xl mb-5">Contact Us</h4>
            <ul className="space-y-3">
              <li>
                <a href="tel:800-237-1138" className="flex items-center gap-3 text-gray-400 hover:text-white text-xl font-medium transition-colors">
                  <Phone className="w-6 h-6" />
                  800.237.1138
                </a>
              </li>
              <li className="text-gray-400 text-base">Open Daily 8:30am - 5pm</li>
            </ul>

            {/* Office Locations */}
            <div className="mt-6 space-y-3">
              <h5 className="font-medium text-gray-300 text-lg">Our Offices</h5>
              <div className="text-gray-400">
                <p className="font-medium text-gray-300">Avon Office</p>
                <p className="text-base">40974 NC Highway 12, Avon, NC 27915</p>
              </div>
              <div className="text-gray-400">
                <p className="font-medium text-gray-300">Salvo Office</p>
                <p className="text-base">26204 Rampart St, Salvo, NC 27972</p>
              </div>
              <div className="text-gray-400">
                <p className="font-medium text-gray-300">Hatteras Office</p>
                <p className="text-base">58079 NC Highway 12, Hatteras, NC 27943</p>
              </div>
            </div>

            {/* Resources links */}
            <div className="mt-6">
              <h5 className="font-medium text-base mb-3 text-gray-300">Resources</h5>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-base">
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link>
                <Link href="/owners" className="text-gray-400 hover:text-white transition-colors">Owners</Link>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQs</Link>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter signup */}
        <div className="border-t border-gray-800 mt-10 sm:mt-12 pt-8 sm:pt-10">
          <div className="max-w-xl">
            <h4 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3">Stay Updated</h4>
            <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-5">
              Get exclusive deals, travel tips, and island updates delivered to your inbox.
            </p>
            <form className="flex flex-col xs:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 sm:px-5 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-base sm:text-lg placeholder-gray-500 focus:outline-none focus:border-ocean-500 min-h-[48px]"
              />
              <button
                type="submit"
                className="px-6 sm:px-8 py-3 bg-ocean-600 text-white rounded-lg text-base sm:text-lg font-medium hover:bg-ocean-700 transition-colors min-h-[48px] touch-manipulation"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-base">
            &copy; {new Date().getFullYear()} Surf or Sound Realty. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-base">
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/accessibility" className="text-gray-400 hover:text-white transition-colors">
              Accessibility
            </Link>
            <span className="text-gray-500">Press ? for keyboard shortcuts</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
