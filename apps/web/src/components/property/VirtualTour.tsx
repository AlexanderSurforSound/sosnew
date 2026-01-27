'use client';

import { useState } from 'react';
import { Play, Maximize2 } from 'lucide-react';

interface VirtualTourProps {
  url: string;
}

export function VirtualTour({ url }: VirtualTourProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Convert Matterport URLs to embed format
  const embedUrl = url.includes('matterport.com')
    ? url.replace('/show/', '/show/?m=').replace('&play=1', '') + '&play=1'
    : url;

  return (
    <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
      {!isLoaded && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => setIsLoaded(true)}
        >
          <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center mb-4">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
          <span className="text-gray-700 font-medium">Click to load virtual tour</span>
          <span className="text-gray-500 text-sm mt-1">Powered by Matterport</span>
        </div>
      )}

      {isLoaded && (
        <>
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="fullscreen; vr"
            allowFullScreen
          />
          <button
            onClick={() => window.open(url, '_blank')}
            className="absolute top-4 right-4 p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
            title="Open in fullscreen"
          >
            <Maximize2 className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )}
    </div>
  );
}
