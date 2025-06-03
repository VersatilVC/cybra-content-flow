
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface LinkedInAdEditFormProps {
  headline: string;
  setHeadline: (headline: string) => void;
  introText: string;
  setIntroText: (introText: string) => void;
  imageUrl: string;
  setImageUrl: (imageUrl: string) => void;
}

export const LinkedInAdEditForm: React.FC<LinkedInAdEditFormProps> = ({
  headline,
  setHeadline,
  introText,
  setIntroText,
  imageUrl,
  setImageUrl
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="headline">Headline</Label>
        <Input
          id="headline"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="Enter LinkedIn ad headline"
          maxLength={150}
        />
        <p className="text-sm text-gray-500 mt-1">
          {headline.length}/150 characters
        </p>
      </div>

      <div>
        <Label htmlFor="introText">Intro Text</Label>
        <Textarea
          id="introText"
          value={introText}
          onChange={(e) => setIntroText(e.target.value)}
          placeholder="Enter LinkedIn ad intro text"
          rows={4}
          className="resize-none"
          maxLength={600}
        />
        <p className="text-sm text-gray-500 mt-1">
          {introText.length}/600 characters
        </p>
      </div>

      <div>
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Enter image URL for the ad"
          type="url"
        />
        {imageUrl && (
          <div className="mt-2">
            <img
              src={imageUrl}
              alt="LinkedIn Ad Preview"
              className="w-32 h-20 object-cover rounded border"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
