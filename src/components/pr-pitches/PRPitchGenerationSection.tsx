import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Megaphone, FileText, Clock, AlertCircle, BarChart3 } from 'lucide-react';
import { useTopicalBlogPosts } from '@/hooks/useTopicalBlogPosts';
import { useReports } from '@/hooks/useReports';
import { usePRManagement } from '@/hooks/usePRManagement';
import { formatDistanceToNow } from 'date-fns';

const PRPitchGenerationSection = () => {
  const [selectedBlogPost, setSelectedBlogPost] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [sourceType, setSourceType] = useState<'content_item' | 'general_content'>('content_item');
  
  const { data: blogPosts = [], isLoading: blogPostsLoading } = useTopicalBlogPosts();
  const { data: reports = [], isLoading: reportsLoading } = useReports();
  const { generatePRPitches, isGeneratingPitches, campaigns } = usePRManagement();

  const selectedPost = blogPosts.find(post => post.id === selectedBlogPost);
  const selectedReportItem = reports.find(report => report.id === selectedReport);

  const handleGeneratePitches = () => {
    if (sourceType === 'content_item' && selectedPost) {
      generatePRPitches({
        sourceType: 'content_item',
        sourceId: selectedPost.id,
        title: selectedPost.title
      });
      setSelectedBlogPost('');
    } else if (sourceType === 'general_content' && selectedReportItem) {
      generatePRPitches({
        sourceType: 'general_content',
        sourceId: selectedReportItem.id,
        title: selectedReportItem.title
      });
      setSelectedReport('');
    }
  };

  const hasExistingCampaign = (sourceType === 'content_item' && selectedPost && 
    campaigns.some(campaign => 
      campaign.source_type === 'content_item' && campaign.source_id === selectedPost.id
    )) || (sourceType === 'general_content' && selectedReportItem && 
    campaigns.some(campaign => 
      campaign.source_type === 'general_content' && campaign.source_id === selectedReportItem.id
    ));

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Megaphone className="w-5 h-5" />
          Generate New PR Pitches
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={sourceType} onValueChange={(value) => {
          setSourceType(value as 'content_item' | 'general_content');
          setSelectedBlogPost('');
          setSelectedReport('');
        }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content_item" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Blog Posts
            </TabsTrigger>
            <TabsTrigger value="general_content" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Reports
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="content_item" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">
                  Select Topical Blog Post
                </label>
                <Select 
                  value={selectedBlogPost} 
                  onValueChange={setSelectedBlogPost}
                  disabled={blogPostsLoading || isGeneratingPitches}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={
                      blogPostsLoading 
                        ? "Loading blog posts..." 
                        : "Choose a blog post to generate pitches for..."
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {blogPosts.map(post => (
                      <SelectItem key={post.id} value={post.id}>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium truncate max-w-[300px]">
                              {post.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {post.content_type} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={handleGeneratePitches}
                  disabled={!selectedBlogPost || isGeneratingPitches}
                  className="w-full"
                >
                  {isGeneratingPitches ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Megaphone className="w-4 h-4 mr-2" />
                      Generate Pitches
                    </>
                  )}
                </Button>
              </div>
            </div>

            {selectedPost && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Selected Post Details</h4>
                <p className="text-sm text-muted-foreground mb-1">{selectedPost.title}</p>
                {selectedPost.summary && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{selectedPost.summary}</p>
                )}
                {hasExistingCampaign && (
                  <div className="flex items-center gap-2 mt-2 text-amber-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">Campaign already exists for this post</span>
                  </div>
                )}
              </div>
            )}

            {blogPosts.length === 0 && !blogPostsLoading && (
              <div className="text-center py-4 text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No topical blog posts found</p>
                <p className="text-xs">Create some blog posts to generate PR pitches</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="general_content" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">
                  Select Report
                </label>
                <Select 
                  value={selectedReport} 
                  onValueChange={setSelectedReport}
                  disabled={reportsLoading || isGeneratingPitches}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={
                      reportsLoading 
                        ? "Loading reports..." 
                        : "Choose a report to generate pitches for..."
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {reports.map(report => (
                      <SelectItem key={report.id} value={report.id}>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium truncate max-w-[300px]">
                              {report.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {report.derivative_type.replace('_', ' ')} • {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={handleGeneratePitches}
                  disabled={!selectedReport || isGeneratingPitches}
                  className="w-full"
                >
                  {isGeneratingPitches ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Megaphone className="w-4 h-4 mr-2" />
                      Generate Pitches
                    </>
                  )}
                </Button>
              </div>
            </div>

            {selectedReportItem && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Selected Report Details</h4>
                <p className="text-sm text-muted-foreground mb-1">{selectedReportItem.title}</p>
                <p className="text-xs text-muted-foreground mb-1">
                  Type: {selectedReportItem.derivative_type.replace('_', ' ')}
                </p>
                {selectedReportItem.word_count && (
                  <p className="text-xs text-muted-foreground">
                    {selectedReportItem.word_count.toLocaleString()} words
                  </p>
                )}
                {hasExistingCampaign && (
                  <div className="flex items-center gap-2 mt-2 text-amber-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">Campaign already exists for this report</span>
                  </div>
                )}
              </div>
            )}

            {reports.length === 0 && !reportsLoading && (
              <div className="text-center py-4 text-muted-foreground">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No reports found</p>
                <p className="text-xs">Create some reports in General Content to generate PR pitches</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PRPitchGenerationSection;