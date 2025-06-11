
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useFeedback } from '@/hooks/useFeedback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bug, 
  Lightbulb, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle
} from 'lucide-react';
import FeedbackStatsCards from '@/components/feedback/FeedbackStatsCards';
import FeedbackFilters from '@/components/feedback/FeedbackFilters';
import FeedbackTable from '@/components/feedback/FeedbackTable';

const FeedbackManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('active');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const { 
    feedbackList, 
    isLoading, 
    error, 
    updateStatus, 
    updatePriority,
    deleteFeedback,
    isUpdating 
  } = useFeedback();

  // Log feedback data for debugging
  console.log('Feedback Management - feedbackList:', feedbackList);
  console.log('Feedback Management - isLoading:', isLoading);
  console.log('Feedback Management - error:', error);

  // Separate feedback into active and resolved/closed
  const activeFeedback = feedbackList.filter(item => 
    !['resolved', 'closed'].includes(item.status)
  );
  
  const resolvedFeedback = feedbackList.filter(item => 
    ['resolved', 'closed'].includes(item.status)
  );

  // Get current list based on active tab
  const currentFeedbackList = activeTab === 'active' ? activeFeedback : resolvedFeedback;

  // Filter the current list
  const filteredFeedback = currentFeedbackList.filter(item => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesCategory && matchesPriority && matchesSearch;
  });

  // Get status options based on active tab
  const getStatusOptions = () => {
    if (activeTab === 'active') {
      return [
        { value: 'all', label: 'All Statuses' },
        { value: 'open', label: 'Open' },
        { value: 'in_review', label: 'In Review' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'testing', label: 'Testing' },
      ];
    } else {
      return [
        { value: 'all', label: 'All Statuses' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'closed', label: 'Closed' },
      ];
    }
  };

  // Reset status filter when switching tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setStatusFilter('all');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'in_review': return 'bg-purple-500';
      case 'in_progress': return 'bg-orange-500';
      case 'testing': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bug': return <Bug className="w-4 h-4" />;
      case 'feature_request': return <Lightbulb className="w-4 h-4" />;
      case 'improvement': return <TrendingUp className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const stats = {
    total: feedbackList.length,
    active: activeFeedback.length,
    open: feedbackList.filter(f => f.status === 'open').length,
    inProgress: feedbackList.filter(f => ['in_review', 'in_progress', 'testing'].includes(f.status)).length,
    resolved: resolvedFeedback.length,
  };

  const handleStatusUpdate = (id: string, status: string) => {
    console.log('Updating status for feedback:', id, 'to:', status);
    updateStatus({ id, status });
  };

  const handlePriorityUpdate = (id: string, priority: string) => {
    console.log('Updating priority for feedback:', id, 'to:', priority);
    updatePriority({ id, priority });
  };

  const handleDelete = (id: string) => {
    console.log('Deleting feedback:', id);
    deleteFeedback(id);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedback Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all feedback submissions from your team
          </p>
        </div>

        {/* Stats Cards */}
        <FeedbackStatsCards stats={stats} />

        {/* Tabs for Active vs Resolved Feedback */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Bug className="w-4 h-4" />
              Active Feedback ({stats.active})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Resolved & Closed ({stats.resolved})
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <FeedbackFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            statusOptions={getStatusOptions()}
          />

          <TabsContent value="active" className="space-y-4">
            {/* Active Feedback Table */}
            <Card>
              <CardHeader>
                <CardTitle>Active Feedback Submissions ({filteredFeedback.length})</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Items that need attention and are not yet resolved
                </p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">
                    <p>Error loading feedback: {error.message}</p>
                    <p className="text-sm mt-2">Check console for more details</p>
                  </div>
                ) : filteredFeedback.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No active feedback submissions found.</p>
                    {activeFeedback.length === 0 && (
                      <p className="mt-2">All feedback has been resolved or closed! 🎉</p>
                    )}
                  </div>
                ) : (
                  <FeedbackTable
                    feedback={filteredFeedback}
                    onStatusUpdate={handleStatusUpdate}
                    onPriorityUpdate={handlePriorityUpdate}
                    onDelete={handleDelete}
                    getPriorityColor={getPriorityColor}
                    getStatusColor={getStatusColor}
                    getCategoryIcon={getCategoryIcon}
                    isUpdating={isUpdating}
                    showStatusSelect={true}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            {/* Resolved/Closed Feedback Table */}
            <Card>
              <CardHeader>
                <CardTitle>Resolved & Closed Feedback ({filteredFeedback.length})</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Completed feedback items for reference and reporting
                </p>
              </CardHeader>
              <CardContent>
                {filteredFeedback.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No resolved or closed feedback found.</p>
                    {resolvedFeedback.length === 0 && (
                      <p className="mt-2">Complete some feedback items to see them here.</p>
                    )}
                  </div>
                ) : (
                  <FeedbackTable
                    feedback={filteredFeedback}
                    onStatusUpdate={handleStatusUpdate}
                    onPriorityUpdate={handlePriorityUpdate}
                    onDelete={handleDelete}
                    getPriorityColor={getPriorityColor}
                    getStatusColor={getStatusColor}
                    getCategoryIcon={getCategoryIcon}
                    isUpdating={isUpdating}
                    showStatusSelect={false}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FeedbackManagement;
