
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import { useAutoGeneration } from '@/hooks/useAutoGeneration';

export default function AutoGenerationControls() {
  const { generateNow, isGenerating } = useAutoGeneration();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Auto-Generate Content Ideas
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Generate Ideas Now</h3>
            <p className="text-sm text-gray-600">Automatically generate new content ideas based on current trends and data</p>
          </div>
          <Button 
            onClick={() => generateNow()} 
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Generate Ideas'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
