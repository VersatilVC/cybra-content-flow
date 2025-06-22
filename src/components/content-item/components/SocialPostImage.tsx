
import React from 'react';

interface SocialPostImageProps {
  imageUrl: string;
  platform: 'linkedin' | 'x';
}

const SocialPostImage: React.FC<SocialPostImageProps> = ({ imageUrl, platform }) => {
  const platformName = platform === 'linkedin' ? 'LinkedIn' : 'X';

  return (
    <div className="mt-4">
      <div className="text-xs text-gray-500 mb-2">Attached Image:</div>
      <img
        src={imageUrl}
        alt={`${platformName} post image`}
        className="w-full max-w-md mx-auto rounded-lg shadow-sm border"
        onError={(e) => {
          console.error(`❌ [SocialPostImage] ${platform} - Failed to load image:`, imageUrl);
          e.currentTarget.style.display = 'none';
          // Show a fallback message
          const fallback = document.createElement('div');
          fallback.className = 'text-xs text-gray-400 text-center p-2 border rounded bg-gray-100';
          fallback.textContent = 'Image failed to load';
          e.currentTarget.parentNode?.appendChild(fallback);
        }}
        onLoad={() => {
          console.log(`✅ [SocialPostImage] ${platform} - Image loaded successfully:`, imageUrl);
        }}
      />
    </div>
  );
};

export default SocialPostImage;
