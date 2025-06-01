
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Eye, CheckCircle, AlertCircle, Search, Filter, Loader2 } from 'lucide-react';
import { useContentItems } from '@/hooks/useContentItems';
import { ContentItem } from '@/services/contentItemsApi';

const ContentItems = () => {
  const navigate = useNavigate();
  const { contentItems, isLoading, error } = useContentItems();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'ready_for_review':
        return { 
          color: 'bg-yellow-100 text-yellow-800',
          icon: AlertCircle,
          label: 'Ready for Review'
        };
      case 'approved':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          label: 'Approved'
        };
      case 'needs_revision':
        return {
          color: 'bg-red-100 text-red-800',
          icon: AlertCircle,
          label: 'Needs Revision'
        };
      case 'draft':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: FileText,
          label: 'Draft'
        };
      case 'published':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: CheckCircle,
          label: 'Published'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: FileText,
          label: status.charAt(0).toUpperCase() + status.slice(1)
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const filteredItems = contentItems.filter((item: ContentItem) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.summary?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesType = typeFilter === 'all' || item.content_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewItem = (itemId: string) => {
    navigate(`/content-items/${itemId}`);
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading content items</h3>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Items</h1>
          <p className="text-gray-600">Review and manage your generated content</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {filteredItems.length} items
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search content items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="ready_for_review">Ready for Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="needs_revision">Needs Revision</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Blog Post">Blog Post</SelectItem>
              <SelectItem value="Guide">Guide</SelectItem>
              <SelectItem value="Article">Article</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Items List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No content items found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create content briefs to generate content items'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item: ContentItem) => {
            const statusInfo = getStatusInfo(item.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {item.title}
                        </h3>
                        {item.summary && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {item.summary}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span>Type: {item.content_type}</span>
                          <span>•</span>
                          {item.word_count && (
                            <>
                              <span>{item.word_count} words</span>
                              <span>•</span>
                            </>
                          )}
                          <span>Modified {formatDate(item.updated_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="w-4 h-4" />
                          <Badge className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleViewItem(item.id)}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContentItems;
