// Fix for default marker icons in Next.js/Webpack
// This is needed because Leaflet's default icon paths don't work with bundlers

export async function fixLeafletIcons() {
  // Only run on client side
  if (typeof window === 'undefined') return;

  // Dynamically import leaflet to avoid SSR issues
  const L = (await import('leaflet')).default;

  // Delete the default icon prototype to prevent caching issues
  delete (L.Icon.Default.prototype as any)._getIconUrl;

  // Set up icon paths using CDN
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// Custom marker icons - must be called client-side only
export const createCustomIcon = async (color: string = '#0891b2') => {
  if (typeof window === 'undefined') return null;
  const L = (await import('leaflet')).default;
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export const createPriceMarker = async (price: number) => {
  if (typeof window === 'undefined') return null;
  const L = (await import('leaflet')).default;
  return L.divIcon({
    className: 'price-marker',
    html: `
      <div style="
        background: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 13px;
        color: #1f2937;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        border: 2px solid #e5e7eb;
        white-space: nowrap;
        cursor: pointer;
        transition: all 0.2s;
      " onmouseover="this.style.transform='scale(1.1)'; this.style.borderColor='#0891b2';"
         onmouseout="this.style.transform='scale(1)'; this.style.borderColor='#e5e7eb';">
        $${price}
      </div>
    `,
    iconSize: [80, 32],
    iconAnchor: [40, 16],
    popupAnchor: [0, -16],
  });
};
