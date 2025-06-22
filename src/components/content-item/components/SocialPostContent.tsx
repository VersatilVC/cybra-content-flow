
import React from 'react';
import ExpandableText from './ExpandableText';

interface SocialPostContentProps {
  text: string;
  platform: 'linkedin' | 'x';
}

const SocialPostContent: React.FC<SocialPostContentProps> = ({ text, platform }) => {
  // Set different maxLength based on platform for better readability
  const maxLength = platform === 'linkedin' ? 600 : 250;

  return (
    <ExpandableText 
      text={text}
      maxLength={maxLength}
      className="text-sm text-gray-700 leading-relaxed"
    />
  );
};

export default SocialPostContent;
