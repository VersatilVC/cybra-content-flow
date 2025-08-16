import React, { useState } from 'react';
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, Search, Filter, Clock } from "lucide-react";
import { usePRManagement } from "@/hooks/usePRManagement";
import PRPitchGenerationSection from "@/components/pr-pitches/PRPitchGenerationSection";
import PRPitchesTable from "@/components/pr-pitches/PRPitchesTable";
import PRPitchPreviewModal from "@/components/pr-pitches/PRPitchPreviewModal";
import { JournalistPreviewModal } from "@/components/pr-pitches/JournalistPreviewModal";

const PRPitches = () => {
  const { pitches, pitchesLoading, campaigns, updatePitchStatus, fetchJournalistArticles } = usePRManagement();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [selectedPitch, setSelectedPitch] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedJournalist, setSelectedJournalist] = useState<any>(null);
  const [isJournalistModalOpen, setIsJournalistModalOpen] = useState(false);
  const [journalistArticles, setJournalistArticles] = useState<any[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);

  const filteredPitches = pitches.filter(pitch => {
    const matchesSearch = pitch.journalist?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pitch.journalist?.publication.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pitch.content_item?.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || pitch.status === statusFilter;
    const matchesCampaign = campaignFilter === 'all' || pitch.pr_campaign_id === campaignFilter;
    
    return matchesSearch && matchesStatus && matchesCampaign;
  });

  const handlePreview = (pitch: any) => {
    setSelectedPitch(pitch);
    setIsPreviewOpen(true);
  };

  const handleEmail = (pitch: any) => {
    if (pitch.journalist?.email) {
      const subject = encodeURIComponent(pitch.subject_line || `Re: ${pitch.content_item?.title}`);
      const body = encodeURIComponent(pitch.pitch_content || '');
      window.open(`mailto:${pitch.journalist.email}?subject=${subject}&body=${body}`, '_blank');
    }
  };

  const handleStatusChange = (pitchId: string, status: string) => {
    updatePitchStatus({ pitchId, status });
  };

  const handleJournalistClick = async (journalist: any) => {
    setSelectedJournalist(journalist);
    setIsJournalistModalOpen(true);
    setIsLoadingArticles(true);
    
    try {
      const articles = await fetchJournalistArticles(journalist.id);
      setJournalistArticles(articles);
    } catch (error) {
      console.error('Failed to fetch journalist articles:', error);
      setJournalistArticles([]);
    } finally {
      setIsLoadingArticles(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-white">
      <DashboardHeader 
        title="PR Pitches" 
        subtitle="Manage and track your PR pitches and outreach campaigns" 
      />
      
      <div className="px-6 pb-8 space-y-6">
        {/* PR Pitch Generation */}
        <PRPitchGenerationSection />

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search pitches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="covered">Covered</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Campaign</label>
                <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Campaigns</SelectItem>
                    {campaigns.map(campaign => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pitches Table */}
        <Card>
          <CardHeader>
            <CardTitle>PR Pitches</CardTitle>
          </CardHeader>
          <CardContent>
            {pitchesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 animate-spin" />
                  Loading pitches...
                </div>
              </div>
            ) : filteredPitches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Megaphone className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No PR Pitches Found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Use the generation section above to create PR pitches for your topical blog posts.
                </p>
              </div>
            ) : (
              <PRPitchesTable
                pitches={filteredPitches}
                onPreview={handlePreview}
                onEmail={handleEmail}
                onStatusChange={handleStatusChange}
                onJournalistClick={handleJournalistClick}
              />
            )}
          </CardContent>
        </Card>

        {/* Preview Modal */}
        <PRPitchPreviewModal
          pitch={selectedPitch}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />

        {/* Journalist Preview Modal */}
        <JournalistPreviewModal
          journalist={selectedJournalist}
          isOpen={isJournalistModalOpen}
          onClose={() => setIsJournalistModalOpen(false)}
          articles={journalistArticles}
          isLoadingArticles={isLoadingArticles}
        />
      </div>
    </div>
  );
};

export default PRPitches;