
import React from 'react';

interface ContentItemsHeaderProps {
  itemCount: number;
}

const ContentItemsHeader: React.FC<ContentItemsHeaderProps> = ({ itemCount }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Items</h1>
        <p className="text-gray-600">Review and manage your generated content</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">
          {itemCount} items
        </span>
      </div>
    </div>
  );
};

export default ContentItemsHeader;
