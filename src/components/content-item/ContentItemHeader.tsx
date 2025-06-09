
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ContentItemHeaderProps {
  title: string;
}

const ContentItemHeader: React.FC<ContentItemHeaderProps> = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4 mb-6">
      <Button 
        onClick={() => navigate('/content-items')} 
        variant="ghost" 
        size="sm"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Content Items
      </Button>
      <div className="h-6 w-px bg-gray-300" />
      <nav className="text-sm text-gray-500">
        Content Items / {title}
      </nav>
    </div>
  );
};

export default ContentItemHeader;
