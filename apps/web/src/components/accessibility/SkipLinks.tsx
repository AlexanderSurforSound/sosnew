'use client';

export default function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <div className="fixed top-0 left-0 right-0 z-[100] bg-ocean-700 p-2 flex gap-4 justify-center">
        <a
          href="#main-content"
          className="px-4 py-2 bg-white text-ocean-700 rounded font-medium focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to main content
        </a>
        <a
          href="#search"
          className="px-4 py-2 bg-white text-ocean-700 rounded font-medium focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to search
        </a>
        <a
          href="#footer"
          className="px-4 py-2 bg-white text-ocean-700 rounded font-medium focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to footer
        </a>
      </div>
    </div>
  );
}
