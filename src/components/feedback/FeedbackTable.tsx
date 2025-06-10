
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Calendar,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { FeedbackSubmission } from '@/hooks/useFeedback';
import FeedbackDetailsModal from './FeedbackDetailsModal';
import FeedbackDeleteDialog from './FeedbackDeleteDialog';

interface FeedbackTableProps {
  feedback: FeedbackSubmission[];
  onStatusUpdate: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  getCategoryIcon: (category: string) => React.ReactNode;
  isUpdating: boolean;
  showStatusSelect?: boolean;
}

const FeedbackTable: React.FC<FeedbackTableProps> = ({
  feedback,
  onStatusUpdate,
  onDelete,
  getPriorityColor,
  getStatusColor,
  getCategoryIcon,
  isUpdating,
  showStatusSelect = true
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submitter</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {feedback.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                {getCategoryIcon(item.category)}
                <span className="capitalize">
                  {item.category.replace('_', ' ')}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Badge 
                variant="secondary"
                className={`${getPriorityColor(item.priority)} text-white`}
              >
                {item.priority}
              </Badge>
            </TableCell>
            <TableCell>
              {showStatusSelect ? (
                <Select
                  value={item.status}
                  onValueChange={(value) => onStatusUpdate(item.id, value)}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge 
                  variant="secondary"
                  className={`${getStatusColor(item.status)} text-white`}
                >
                  {item.status.replace('_', ' ')}
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {item.profiles?.first_name && item.profiles?.last_name
                    ? `${item.profiles.first_name} ${item.profiles.last_name}`
                    : item.profiles?.email || 'Unknown'}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(item.created_at), 'MMM dd, yyyy')}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <FeedbackDetailsModal
                  feedback={item}
                  getPriorityColor={getPriorityColor}
                  getStatusColor={getStatusColor}
                  getCategoryIcon={getCategoryIcon}
                />
                <FeedbackDeleteDialog
                  feedbackTitle={item.title}
                  onDelete={() => onDelete(item.id)}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default FeedbackTable;
