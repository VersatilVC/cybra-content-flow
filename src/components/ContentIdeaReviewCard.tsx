
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContentIdea } from '@/types/contentIdeas';
import { CheckCircle, FileText, Eye } from 'lucide-react';

interface ContentIdeaReviewCardProps {
  idea: ContentIdea;
  onCreateBrief: (id: string) => void;
  isCreatingBrief: (id: string) => boolean;
}

export default function ContentIdeaReviewCard({ 
  idea, 
  onCreateBrief, 
  isCreatingBrief 
}: ContentIdeaReviewCardProps) {
  return (
    <Card className="border-2 border-yellow-200 bg-yellow-50">
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-700">Review Required</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{idea.title}</h3>
          {idea.description && (
            <p className="text-gray-700 mb-4">{idea.description}</p>
          )}
        </div>

        <div className="flex items-center gap-4 mb-4">
          <Badge variant="outline" className="bg-white">
            {idea.content_type}
          </Badge>
          <Badge variant="outline" className="bg-white">
            {idea.target_audience}
          </Badge>
          <Badge variant="secondary">
            {idea.status}
          </Badge>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => onCreateBrief(idea.id)}
            disabled={isCreatingBrief(idea.id)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isCreatingBrief(idea.id) ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating Brief...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Create Content Brief
              </>
            )}
          </Button>
        </div>

        <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Review Action:</strong> This idea has been processed and is ready for content brief creation. 
            Review the details above and click "Create Content Brief" to proceed to the next step.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
