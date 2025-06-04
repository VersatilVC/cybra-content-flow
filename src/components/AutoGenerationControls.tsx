
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap } from 'lucide-react';
import { useAutoGeneration } from '@/hooks/useAutoGeneration';

export default function AutoGenerationControls() {
  const [contentType, setContentType] = useState<'Blog Post' | 'Guide'>('Blog Post');
  const [targetAudience, setTargetAudience] = useState<'Private Sector' | 'Government Sector'>('Private Sector');
  
  const { generateNow, isGenerating } = useAutoGeneration();

  const handleGenerate = () => {
    generateNow(contentType, targetAudience);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Auto-Generate Content Ideas
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-3">Generate Ideas Now</h3>
            <p className="text-sm text-gray-600 mb-4">Automatically generate new content ideas based on current trends and data</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Content Type</label>
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
            
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Target Audience</label>
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
            
            <div className="flex items-end">
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <Zap className="w-4 h-4" />
                {isGenerating ? 'Generating...' : 'Generate Ideas'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
