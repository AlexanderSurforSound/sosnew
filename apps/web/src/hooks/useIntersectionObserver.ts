'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  freezeOnceVisible?: boolean;
}

/**
 * Hook for intersection observer - useful for lazy loading and infinite scroll
 */
export function useIntersectionObserver<T extends Element>({
  root = null,
  rootMargin = '0px',
  threshold = 0,
  freezeOnceVisible = false,
}: UseIntersectionObserverOptions = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<T | null>(null);
  const frozen = useRef(false);

  const updateEntry = useCallback(
    ([entry]: IntersectionObserverEntry[]) => {
      if (frozen.current) return;

      setEntry(entry);
      setIsIntersecting(entry.isIntersecting);

      if (freezeOnceVisible && entry.isIntersecting) {
        frozen.current = true;
      }
    },
    [freezeOnceVisible]
  );

  useEffect(() => {
    const node = elementRef.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || !node) return;

    const observer = new IntersectionObserver(updateEntry, {
      root,
      rootMargin,
      threshold,
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, [root, rootMargin, threshold, updateEntry]);

  return { ref: elementRef, entry, isIntersecting };
}

/**
 * Hook for lazy loading images when they enter viewport
 */
export function useLazyImage(src: string, options?: UseIntersectionObserverOptions) {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLImageElement>({
    rootMargin: '200px', // Start loading before visible
    freezeOnceVisible: true,
    ...options,
  });

  const [loaded, setLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if (isIntersecting && src) {
      setImageSrc(src);
    }
  }, [isIntersecting, src]);

  return {
    ref,
    src: imageSrc,
    loaded,
    onLoad: () => setLoaded(true),
    isInView: isIntersecting,
  };
}

/**
 * Hook for infinite scroll pagination
 */
export function useInfiniteScroll(
  loadMore: () => Promise<void>,
  hasMore: boolean,
  options?: UseIntersectionObserverOptions
) {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    rootMargin: '200px',
    ...options,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isIntersecting && hasMore && !loading) {
      setLoading(true);
      loadMore().finally(() => setLoading(false));
    }
  }, [isIntersecting, hasMore, loading, loadMore]);

  return { ref, loading };
}

/**
 * Hook for content visibility optimization
 * Hides off-screen content to improve scroll performance
 */
export function useContentVisibility<T extends Element>() {
  const { ref, isIntersecting } = useIntersectionObserver<T>({
    rootMargin: '100px',
  });

  return {
    ref,
    style: {
      contentVisibility: isIntersecting ? 'visible' : 'auto',
      containIntrinsicSize: 'auto 500px',
    } as React.CSSProperties,
  };
}
