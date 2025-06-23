
import React, { useState } from 'react';

interface SocialPostImageProps {
  imageUrl: string;
  platform: 'linkedin' | 'x';
}

const SocialPostImage: React.FC<SocialPostImageProps> = ({ imageUrl, platform }) => {
  const [imageError, setImageError] = useState(false);
  const [loadingState, setLoadingState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const platformName = platform === 'linkedin' ? 'LinkedIn' : 'X';

  // Enhanced URL validation
  const validateImageUrl = (url: string): boolean => {
    console.log(`🔍 [SocialPostImage] ${platform} - Validating URL:`, url);
    
    if (!url || typeof url !== 'string') {
      console.error(`❌ [SocialPostImage] ${platform} - Invalid URL type:`, typeof url, url);
      return false;
    }
    
    if (!url.startsWith('http')) {
      console.error(`❌ [SocialPostImage] ${platform} - URL doesn't start with http:`, url);
      return false;
    }
    
    // Check if it's a proper Supabase URL
    const isSupabaseUrl = url.includes('supabase.co');
    const hasPublicPath = url.includes('/public/');
    
    console.log(`🔍 [SocialPostImage] ${platform} - URL analysis:`, {
      isSupabaseUrl,
      hasPublicPath,
      length: url.length,
      protocol: url.split('://')[0],
      domain: url.split('/')[2]
    });
    
    return true;
  };

  const isValidUrl = validateImageUrl(imageUrl);

  const handleImageLoad = () => {
    console.log(`✅ [SocialPostImage] ${platform} - Image loaded successfully:`, imageUrl);
    setLoadingState('loaded');
    setImageError(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`❌ [SocialPostImage] ${platform} - Image failed to load:`, {
      url: imageUrl,
      naturalWidth: e.currentTarget.naturalWidth,
      naturalHeight: e.currentTarget.naturalHeight,
      complete: e.currentTarget.complete,
      currentSrc: e.currentTarget.currentSrc
    });
    
    setLoadingState('error');
    setImageError(true);
    
    // Hide the broken image
    e.currentTarget.style.display = 'none';
    
    // Create and show fallback message
    const fallback = document.createElement('div');
    fallback.className = 'text-xs text-gray-400 text-center p-4 border rounded bg-gray-50';
    fallback.innerHTML = `
      <div class="mb-2">Image failed to load</div>
      <div class="text-xs text-gray-300 break-all">${imageUrl}</div>
      <button class="mt-2 text-blue-500 hover:text-blue-700 text-xs" onclick="window.open('${imageUrl}', '_blank')">
        Test URL directly
      </button>
    `;
    e.currentTarget.parentNode?.appendChild(fallback);
  };

  const handleRetryImage = () => {
    console.log(`🔄 [SocialPostImage] ${platform} - Retrying image load:`, imageUrl);
    setImageError(false);
    setLoadingState('loading');
    
    // Force reload by adding timestamp
    const img = new Image();
    img.onload = () => {
      console.log(`✅ [SocialPostImage] ${platform} - Retry successful`);
      setLoadingState('loaded');
    };
    img.onerror = () => {
      console.error(`❌ [SocialPostImage] ${platform} - Retry failed`);
      setLoadingState('error');
      setImageError(true);
    };
    img.src = imageUrl + '?t=' + Date.now();
  };

  // Test URL accessibility
  const testUrlAccessibility = async () => {
    console.log(`🧪 [SocialPostImage] ${platform} - Testing URL accessibility:`, imageUrl);
    
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      console.log(`🧪 [SocialPostImage] ${platform} - HEAD request result:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
    } catch (error) {
      console.error(`❌ [SocialPostImage] ${platform} - HEAD request failed:`, error);
    }
  };

  // Run accessibility test on mount
  React.useEffect(() => {
    if (isValidUrl) {
      testUrlAccessibility();
    }
  }, [imageUrl, platform]);

  if (!isValidUrl) {
    return (
      <div className="mt-4">
        <div className="text-xs text-red-500 mb-2">Invalid Image URL</div>
        <div className="text-xs text-gray-400 bg-red-50 p-2 rounded border">
          <div>URL: {imageUrl}</div>
          <div className="mt-1 text-red-600">Please check the console for validation details</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="text-xs text-gray-500 mb-2 flex items-center justify-between">
        <span>Attached Image:</span>
        <span className="text-xs text-gray-400">
          Status: {loadingState} | Platform: {platform}
        </span>
      </div>
      
      {!imageError ? (
        <div className="relative">
          {loadingState === 'loading' && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
              <span className="text-xs text-gray-500">Loading...</span>
            </div>
          )}
          <img
            src={imageUrl}
            alt={`${platformName} post image`}
            className="w-full max-w-md mx-auto rounded-lg shadow-sm border"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: imageError ? 'none' : 'block' }}
          />
        </div>
      ) : (
        <div className="w-full max-w-md mx-auto bg-gray-100 border rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-2">Image failed to load</div>
          <div className="text-xs text-gray-400 break-all mb-3 bg-white p-2 rounded">
            {imageUrl}
          </div>
          <div className="space-y-2">
            <button
              onClick={handleRetryImage}
              className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
            >
              Retry Loading
            </button>
            <button
              onClick={() => window.open(imageUrl, '_blank')}
              className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600 ml-2"
            >
              Test URL Directly
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialPostImage;
