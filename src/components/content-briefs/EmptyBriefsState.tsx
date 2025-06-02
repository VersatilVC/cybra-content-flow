
import React from 'react';
import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmptyBriefsState() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Briefcase className="w-8 h-8 text-purple-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No content briefs yet</h3>
      <p className="text-gray-600 mb-4">Start by creating briefs from your content ideas and suggestions.</p>
      <Button
        onClick={() => window.location.href = '/ideas'}
        className="bg-purple-600 hover:bg-purple-700 text-white"
      >
        <Briefcase className="w-4 h-4 mr-2" />
        Go to Content Ideas
      </Button>
    </div>
  );
}
