
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap } from 'lucide-react';
import { useAutoGeneration } from '@/hooks/useAutoGeneration';

export default function AutoGenerationControls() {
  const [contentType, setContentType] = useState<'Blog Post' | 'Guide'>('Blog Post');
  const [targetAudience, setTargetAudience] = useState<'Private Sector' | 'Government Sector'>('Private Sector');
  const [isOpen, setIsOpen] = useState(false);
  
  const { generateNow, isGenerating } = useAutoGeneration();

  const handleGenerate = () => {
    generateNow(contentType, targetAudience);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-3">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            disabled={isGenerating}
          >
            <Zap className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Auto-Generate Ideas'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Generate Content Ideas</h4>
              <p className="text-sm text-gray-600 mb-4">
                Select preferences for auto-generated content ideas
              </p>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Content Type
                </label>
                <Select value={contentType} onValueChange={(value: 'Blog Post' | 'Guide') => setContentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Blog Post">Blog Post</SelectItem>
                    <SelectItem value="Guide">Guide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Target Audience
                </label>
                <Select value={targetAudience} onValueChange={(value: 'Private Sector' | 'Government Sector') => setTargetAudience(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Private Sector">Private Sector</SelectItem>
                    <SelectItem value="Government Sector">Government Sector</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="w-full flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Generate Ideas'}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
