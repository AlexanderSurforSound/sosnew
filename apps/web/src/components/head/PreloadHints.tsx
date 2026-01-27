/**
 * Preload Hints Component
 *
 * Adds resource hints to improve page load performance:
 * - preconnect: Establish early connections to important origins
 * - dns-prefetch: Resolve DNS for third-party domains
 * - preload: Load critical resources early
 */
export function PreloadHints() {
  return (
    <>
      {/* Preconnect to critical origins */}
      <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* DNS prefetch for third-party services */}
      <link rel="dns-prefetch" href="https://track-pm.s3.amazonaws.com" />
      <link rel="dns-prefetch" href="https://track-files.s3.amazonaws.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

      {/* Preload critical fonts */}
      <link
        rel="preload"
        href="/fonts/nunito-sans-var.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />

      {/* Preload critical images (hero, logo) */}
      <link
        rel="preload"
        href="/images/hero-bg.webp"
        as="image"
        type="image/webp"
      />
    </>
  );
}

/**
 * Dynamic preload for property images
 * Call this when user is likely to navigate to a property
 */
export function preloadPropertyImages(imageUrls: string[]) {
  if (typeof window === 'undefined') return;

  // Only preload first 3 images
  const imagesToPreload = imageUrls.slice(0, 3);

  imagesToPreload.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Prefetch a page for instant navigation
 */
export function prefetchPage(href: string) {
  if (typeof window === 'undefined') return;

  // Check if already prefetched
  const existing = document.querySelector(`link[rel="prefetch"][href="${href}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
}
