import { useEffect, useRef, useCallback } from 'react';

interface ProgressiveImageOptions {
  threshold?: number;
  rootMargin?: string;
  placeholderQuality?: number;
  enableWebP?: boolean;
}

export function useProgressiveImageLoading({
  threshold = 0.1,
  rootMargin = '50px',
  placeholderQuality = 20,
  enableWebP = true
}: ProgressiveImageOptions = {}) {
  const observer = useRef<IntersectionObserver | null>(null);
  const loadedImages = useRef<Set<string>>(new Set());
  const imageCache = useRef<Map<string, string>>(new Map());

  // Create optimized image URL
  const createOptimizedUrl = useCallback((src: string, quality: number = 80) => {
    // In a real app, this would integrate with an image optimization service
    // For now, we'll simulate the concept
    if (enableWebP && 'WebPFormat' in window) {
      return `${src}?format=webp&quality=${quality}`;
    }
    return `${src}?quality=${quality}`;
  }, [enableWebP]);

  // Generate low-quality placeholder
  const generatePlaceholder = useCallback((src: string) => {
    const cachedPlaceholder = imageCache.current.get(`${src}_placeholder`);
    if (cachedPlaceholder) return cachedPlaceholder;

    // Create a very low quality version for placeholder
    const placeholderUrl = createOptimizedUrl(src, placeholderQuality);
    imageCache.current.set(`${src}_placeholder`, placeholderUrl);
    return placeholderUrl;
  }, [createOptimizedUrl, placeholderQuality]);

  // Preload image
  const preloadImage = useCallback((src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (loadedImages.current.has(src)) {
        resolve(src);
        return;
      }

      const img = new Image();
      img.onload = () => {
        loadedImages.current.add(src);
        resolve(src);
      };
      img.onerror = reject;
      img.src = createOptimizedUrl(src);
    });
  }, [createOptimizedUrl]);

  // Setup intersection observer
  const setupObserver = useCallback(() => {
    if (observer.current) return observer.current;

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            
            if (src) {
              preloadImage(src)
                .then((loadedSrc) => {
                  img.src = loadedSrc;
                  img.classList.add('loaded');
                  img.classList.remove('loading');
                })
                .catch((error) => {
                  console.warn('Failed to load image:', src, error);
                  img.classList.add('error');
                  img.classList.remove('loading');
                });
              
              observer.current?.unobserve(img);
            }
          }
        });
      },
      { threshold, rootMargin }
    );

    return observer.current;
  }, [threshold, rootMargin, preloadImage]);

  // Observe image element
  const observeImage = useCallback((element: HTMLImageElement, src: string) => {
    if (!element) return;

    const obs = setupObserver();
    element.dataset.src = src;
    element.src = generatePlaceholder(src);
    element.classList.add('loading');
    obs.observe(element);
  }, [setupObserver, generatePlaceholder]);

  // Batch preload images
  const batchPreloadImages = useCallback(async (srcs: string[], batchSize = 3) => {
    const results = [];
    
    for (let i = 0; i < srcs.length; i += batchSize) {
      const batch = srcs.slice(i, i + batchSize);
      const batchPromises = batch.map(src => preloadImage(src).catch(err => ({ error: err, src })));
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches to avoid overwhelming the browser
      if (i + batchSize < srcs.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }, [preloadImage]);

  // Cleanup observer
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }
    };
  }, []);

  return {
    observeImage,
    preloadImage,
    batchPreloadImages,
    generatePlaceholder,
    createOptimizedUrl,
    isImageLoaded: (src: string) => loadedImages.current.has(src)
  };
}