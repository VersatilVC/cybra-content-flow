import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  BarChart3,
  Calendar,
  FileText
} from 'lucide-react';
import { GeneralContentItem } from '@/types/generalContent';

interface GeneralContentInsightsProps {
  items: GeneralContentItem[];
}

const GeneralContentInsights: React.FC<GeneralContentInsightsProps> = ({ items }) => {
  // Calculate insights
  const totalItems = items.length;
  const completedItems = items.filter(item => ['approved', 'published'].includes(item.status)).length;
  const failedItems = items.filter(item => item.status === 'failed').length;
  const processingItems = items.filter(item => item.status === 'ready').length;
  
  const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const failureRate = totalItems > 0 ? (failedItems / totalItems) * 100 : 0;
  
  // Category breakdown
  const categoryStats = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Type breakdown
  const typeStats = items.reduce((acc, item) => {
    acc[item.derivative_type] = (acc[item.derivative_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Recent activity (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentItems = items.filter(item => new Date(item.created_at) > weekAgo);
  
  // Success metrics
  const publishedItems = items.filter(item => item.status === 'published').length;
  const publishRate = totalItems > 0 ? (publishedItems / totalItems) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
      case 'published':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'processing':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (totalItems === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No content data available for insights</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Content</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalItems}</div>
          <p className="text-xs text-muted-foreground">
            {recentItems.length} created this week
          </p>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
          <Progress value={completionRate} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {completedItems} of {totalItems} completed
          </p>
        </CardContent>
      </Card>

      {/* Published Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Published Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{publishRate.toFixed(1)}%</div>
          <Progress value={publishRate} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {publishedItems} published
          </p>
        </CardContent>
      </Card>

      {/* Active Processing */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Processing</CardTitle>
          <Clock className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{processingItems}</div>
          <p className="text-xs text-muted-foreground">
            Currently being processed
          </p>
          {failedItems > 0 && (
            <div className="flex items-center mt-1">
              <AlertCircle className="h-3 w-3 text-red-500 mr-1" />
              <span className="text-xs text-red-600">{failedItems} failed</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(categoryStats).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">
                    {category}
                  </Badge>
                  <span className="text-sm text-gray-600">{count} items</span>
                </div>
                <div className="text-sm font-medium">
                  {((count / totalItems) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Types */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center">
            <Target className="h-4 w-4 mr-2" />
            Popular Content Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(typeStats)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm">{type}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">{count}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full"
                        style={{ width: `${(count / totalItems) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralContentInsights;