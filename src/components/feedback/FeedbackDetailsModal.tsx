
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import { FeedbackSubmission } from '@/hooks/useFeedback';

interface FeedbackDetailsModalProps {
  feedback: FeedbackSubmission;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  getCategoryIcon: (category: string) => React.ReactNode;
}

const FeedbackDetailsModal: React.FC<FeedbackDetailsModalProps> = ({
  feedback,
  getPriorityColor,
  getStatusColor,
  getCategoryIcon
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{feedback.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{feedback.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-1">Category</h4>
              <div className="flex items-center space-x-2">
                {getCategoryIcon(feedback.category)}
                <span className="text-sm capitalize">
                  {feedback.category.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-1">Priority</h4>
              <Badge 
                variant="secondary"
                className={`${getPriorityColor(feedback.priority)} text-white`}
              >
                {feedback.priority}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-1">Status</h4>
              <Badge 
                variant="secondary"
                className={`${getStatusColor(feedback.status)} text-white`}
              >
                {feedback.status.replace('_', ' ')}
              </Badge>
            </div>
            <div>
              <h4 className="font-medium mb-1">Submitter</h4>
              <p className="text-sm">
                {feedback.profiles?.first_name && feedback.profiles?.last_name
                  ? `${feedback.profiles.first_name} ${feedback.profiles.last_name}`
                  : feedback.profiles?.email || 'Unknown'}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-1">Created</h4>
            <p className="text-sm">
              {format(new Date(feedback.created_at), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>

          {feedback.internal_notes && (
            <div>
              <h4 className="font-medium mb-2">Internal Notes</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                {feedback.internal_notes}
              </p>
            </div>
          )}

          {feedback.attachment_url && (
            <div>
              <h4 className="font-medium mb-2">Attachment</h4>
              <a 
                href={feedback.attachment_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                {feedback.attachment_filename || 'Download attachment'}
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDetailsModal;
