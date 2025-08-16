import React, { useState, useRef, useEffect } from 'react';
import { useProgressiveImageLoading } from '@/hooks/useProgressiveImageLoading';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  blurDataURL?: string;
  priority?: boolean;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  fallback = '/placeholder.svg',
  blurDataURL,
  priority = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const { observeImage, generatePlaceholder, isImageLoaded } = useProgressiveImageLoading({
    threshold: 0.1,
    rootMargin: '50px',
    enableWebP: true
  });

  useEffect(() => {
    if (!imgRef.current || priority) return;

    // Use progressive loading hook
    observeImage(imgRef.current, src);
    
    // Listen for load events
    const handleLoad = () => setIsLoaded(true);
    const handleError = () => setHasError(true);
    
    imgRef.current.addEventListener('load', handleLoad);
    imgRef.current.addEventListener('error', handleError);
    
    return () => {
      if (imgRef.current) {
        imgRef.current.removeEventListener('load', handleLoad);
        imgRef.current.removeEventListener('error', handleError);
      }
    };
  }, [src, priority, observeImage]);

  useEffect(() => {
    // For priority images, load immediately
    if (priority && imgRef.current) {
      imgRef.current.src = src;
      setIsLoaded(isImageLoaded(src));
    }
  }, [priority, src, isImageLoaded]);

  const imageSrc = priority ? src : (isLoaded ? src : (blurDataURL || fallback));

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={cn(
          "transition-all duration-300",
          !isLoaded && !hasError && "blur-sm scale-105",
          isLoaded && "blur-0 scale-100",
          className
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        {...props}
      />
      {!isLoaded && !hasError && blurDataURL && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      )}
    </div>
  );
};

export default LazyImage;