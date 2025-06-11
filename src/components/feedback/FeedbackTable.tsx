
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
  User,
  Circle
} from 'lucide-react';
import { format } from 'date-fns';
import { FeedbackSubmission } from '@/hooks/useFeedback';
import FeedbackDetailsModal from './FeedbackDetailsModal';
import FeedbackDeleteDialog from './FeedbackDeleteDialog';

interface FeedbackTableProps {
  feedback: FeedbackSubmission[];
  onStatusUpdate: (id: string, status: string) => void;
  onPriorityUpdate: (id: string, priority: string) => void;
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
  onPriorityUpdate,
  onDelete,
  getPriorityColor,
  getStatusColor,
  getCategoryIcon,
  isUpdating,
  showStatusSelect = true
}) => {
  const getPriorityIcon = (priority: string) => {
    const colorClass = getPriorityColor(priority).replace('bg-', 'text-');
    return <Circle className={`w-3 h-3 fill-current ${colorClass}`} />;
  };

  const getPrioritySelectStyle = (priority: string) => {
    const baseColor = getPriorityColor(priority);
    const isLight = priority === 'medium';
    
    return {
      backgroundColor: baseColor.replace('bg-', ''),
      color: isLight ? '#000' : '#fff',
      fontWeight: '500'
    };
  };

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
              {showStatusSelect ? (
                <Select
                  value={item.priority}
                  onValueChange={(value) => onPriorityUpdate(item.id, value)}
                  disabled={isUpdating}
                >
                  <SelectTrigger className={`w-32 border-2 ${getPriorityColor(item.priority)} text-white font-medium`}>
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(item.priority)}
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border shadow-lg">
                    <SelectItem 
                      value="low" 
                      className="bg-green-500 text-white font-medium hover:bg-green-600 focus:bg-green-600 mb-1 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <Circle className="w-3 h-3 fill-current text-green-100" />
                        Low
                      </div>
                    </SelectItem>
                    <SelectItem 
                      value="medium" 
                      className="bg-yellow-500 text-black font-medium hover:bg-yellow-600 focus:bg-yellow-600 mb-1 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <Circle className="w-3 h-3 fill-current text-yellow-100" />
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem 
                      value="high" 
                      className="bg-orange-500 text-white font-medium hover:bg-orange-600 focus:bg-orange-600 mb-1 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <Circle className="w-3 h-3 fill-current text-orange-100" />
                        High
                      </div>
                    </SelectItem>
                    <SelectItem 
                      value="critical" 
                      className="bg-red-500 text-white font-medium hover:bg-red-600 focus:bg-red-600 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <Circle className="w-3 h-3 fill-current text-red-100" />
                        Critical
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge 
                  variant="secondary"
                  className={`${getPriorityColor(item.priority)} text-white font-medium border-0 px-3 py-1`}
                >
                  <div className="flex items-center gap-1">
                    {getPriorityIcon(item.priority)}
                    <span className="capitalize">{item.priority}</span>
                  </div>
                </Badge>
              )}
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
