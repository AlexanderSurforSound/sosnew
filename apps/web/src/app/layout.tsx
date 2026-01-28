import type { Metadata } from 'next';
import { Merriweather, Nunito_Sans } from 'next/font/google';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { CompareBar } from '@/components/compare/CompareBar';
import { ToastContainer } from '@/components/notifications';
import { SkipLinks, KeyboardShortcuts } from '@/components/accessibility';
import MobileNav from '@/components/layout/MobileNav';
import { WebVitals } from '@/components/performance';
import { Providers } from './providers';

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-merriweather',
  fallback: ['Georgia', 'serif'],
  display: 'swap',
});

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-nunito-sans',
  fallback: ['system-ui', 'arial'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Surf or Sound Realty | Hatteras Island Vacation Rentals',
    template: '%s | Surf or Sound Realty',
  },
  description:
    'Discover vacation rentals on Hatteras Island, NC. Oceanfront homes, pet-friendly properties, and luxury beach houses. Book your Outer Banks getaway today.',
  keywords: [
    'Hatteras Island vacation rentals',
    'Outer Banks rentals',
    'OBX vacation homes',
    'beach house rentals',
    'oceanfront rentals',
    'pet-friendly vacation rentals',
  ],
  authors: [{ name: 'Surf or Sound Realty' }],
  creator: 'Surf or Sound Realty',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Surf or Sound',
  },
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.surforsound.com',
    siteName: 'Surf or Sound Realty',
    title: 'Surf or Sound Realty | Hatteras Island Vacation Rentals',
    description:
      'Discover vacation rentals on Hatteras Island, NC. Book your Outer Banks getaway today.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Surf or Sound Realty | Hatteras Island Vacation Rentals',
    description: 'Discover vacation rentals on Hatteras Island, NC.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'msapplication-TileColor': '#0891b2',
    'msapplication-tap-highlight': 'no',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${merriweather.variable} ${nunitoSans.variable}`}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <meta name="theme-color" content="#0891b2" />
      </head>
      <body className="flex min-h-screen flex-col">
        <Providers>
          <WebVitals />
          <SkipLinks />
          <Header />
          <main id="main-content" className="flex-1 pb-20 lg:pb-0">{children}</main>
          <Footer className="hidden lg:block" />
          <MobileNav />
          <CompareBar />
          <ChatWidget />
          <ToastContainer />
          <KeyboardShortcuts />
        </Providers>
      </body>
    </html>
  );
}
