
import { Clock, User, FileText, MessageSquare, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ActivityItem {
  id: string;
  type: 'content_created' | 'brief_approved' | 'comment_added' | 'content_published';
  title: string;
  description: string;
  user: string;
  timestamp: string;
  status?: string;
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'content_created',
    title: 'New content item generated',
    description: 'AI Detection in Financial Services',
    user: 'Sarah Chen',
    timestamp: '5 minutes ago',
    status: 'pending'
  },
  {
    id: '2',
    type: 'brief_approved',
    title: 'Brief approved',
    description: 'Government Sector Cybersecurity Guide',
    user: 'John Doe',
    timestamp: '15 minutes ago',
    status: 'approved'
  },
  {
    id: '3',
    type: 'comment_added',
    title: 'Comment added',
    description: 'Private Sector Threat Detection',
    user: 'Mike Johnson',
    timestamp: '1 hour ago'
  },
  {
    id: '4',
    type: 'content_published',
    title: 'Content published',
    description: 'Social Media Manipulation Trends',
    user: 'Sarah Chen',
    timestamp: '2 hours ago',
    status: 'published'
  },
  {
    id: '5',
    type: 'content_created',
    title: 'New content idea generated',
    description: 'Enterprise Security Solutions',
    user: 'Alex Rivera',
    timestamp: '3 hours ago',
    status: 'pending'
  }
];

export function RecentActivity() {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'content_created':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'brief_approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'comment_added':
        return <MessageSquare className="w-4 h-4 text-orange-500" />;
      case 'content_published':
        return <CheckCircle className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'published':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  {activity.status && (
                    <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{activity.user}</span>
                  </div>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{activity.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
