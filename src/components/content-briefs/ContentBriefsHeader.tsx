
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link as LinkIcon } from 'lucide-react';

export default function ContentBriefsHeader() {
  const { toast } = useToast();
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied', description: 'Current view URL copied to clipboard.' });
    } catch {
      toast({ title: 'Copy failed', description: 'Unable to copy link.', variant: 'destructive' });
    }
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Briefs</h1>
        <p className="text-gray-600">Manage and review your content briefs</p>
      </div>
      <Button variant="outline" onClick={handleCopy} aria-label="Copy shareable view link">
        <LinkIcon className="w-4 h-4 mr-2" /> Copy link
      </Button>
    </div>
  );
}
