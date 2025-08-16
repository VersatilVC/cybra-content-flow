import React, { useState } from 'react';
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Filter, Plus, Eye, Mail, Linkedin, Twitter, Building2, Phone, Calendar, Star } from "lucide-react";
import { usePRManagement } from "@/hooks/usePRManagement";
import { formatDistanceToNow } from "date-fns";
import { JournalistPreviewModal } from "@/components/pr-pitches/JournalistPreviewModal";
import { AddJournalistModal } from "@/components/pr-pitches/AddJournalistModal";
import type { Journalist, JournalistArticle } from "@/hooks/usePRManagement";

const Journalists = () => {
  const { journalists, journalistsLoading, fetchJournalistArticles } = usePRManagement();
  const [searchTerm, setSearchTerm] = useState('');
  const [publicationFilter, setPublicationFilter] = useState('all');
  const [influenceFilter, setInfluenceFilter] = useState('all');
  const [selectedJournalist, setSelectedJournalist] = useState<Journalist | null>(null);
  const [journalistArticles, setJournalistArticles] = useState<JournalistArticle[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredJournalists = journalists.filter(journalist => {
    const matchesSearch = journalist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      journalist.publication.toLowerCase().includes(searchTerm.toLowerCase()) ||
      journalist.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPublication = publicationFilter === 'all' || journalist.publication === publicationFilter;
    const matchesInfluence = influenceFilter === 'all' || journalist.journalist_influence === influenceFilter;
    
    return matchesSearch && matchesPublication && matchesInfluence;
  });

  const uniquePublications = [...new Set(journalists.map(j => j.publication))];

  const getInfluenceColor = (influence: string) => {
    switch (influence) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRelationshipColor = (status: string) => {
    switch (status) {
      case 'warm_lead': return 'bg-green-100 text-green-800';
      case 'cold_contact': return 'bg-blue-100 text-blue-800';
      case 'established': return 'bg-purple-100 text-purple-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handlePreview = async (journalist: Journalist) => {
    setSelectedJournalist(journalist);
    setIsPreviewModalOpen(true);
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

  const handleEmail = (journalist: Journalist) => {
    if (journalist.email) {
      window.open(`mailto:${journalist.email}`, '_blank');
    }
  };

  const handleLinkedIn = (journalist: Journalist) => {
    if (journalist.linkedin_url) {
      window.open(journalist.linkedin_url, '_blank');
    }
  };

  const handleTwitter = (journalist: Journalist) => {
    if (journalist.twitter_handle) {
      const twitterUrl = journalist.twitter_handle.startsWith('@') 
        ? `https://twitter.com/${journalist.twitter_handle.slice(1)}`
        : `https://twitter.com/${journalist.twitter_handle}`;
      window.open(twitterUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-white">
      <DashboardHeader 
        title="Journalists" 
        subtitle="Manage your journalist contacts and media relationships" 
      />
      
      <div className="px-6 pb-8 space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-medium">
              {filteredJournalists.length} journalist{filteredJournalists.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <Button className="flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Journalist
          </Button>
        </div>

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
                    placeholder="Search journalists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Publication</label>
                <Select value={publicationFilter} onValueChange={setPublicationFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Publications</SelectItem>
                    {uniquePublications.map(publication => (
                      <SelectItem key={publication} value={publication}>
                        {publication}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Influence</label>
                <Select value={influenceFilter} onValueChange={setInfluenceFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Journalists Grid */}
        <div className="grid gap-4">
          {journalistsLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4 animate-spin" />
                  Loading journalists...
                </div>
              </CardContent>
            </Card>
          ) : filteredJournalists.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No Journalists Found</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  Your journalist database is empty. Add journalists manually or they will be populated automatically when generating PR pitches.
                </p>
                <Button className="flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="w-4 h-4" />
                  Add Your First Journalist
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredJournalists.map(journalist => (
              <Card key={journalist.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Basic Info */}
                    <div className="lg:col-span-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground">
                            {journalist.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {journalist.title}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Building2 className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {journalist.publication}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="lg:col-span-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">
                            Score: {journalist.relevance_score}
                          </span>
                        </div>
                        <Badge className={getInfluenceColor(journalist.journalist_influence)}>
                          {journalist.journalist_influence} influence
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {journalist.expertise_level} • {journalist.coverage_frequency}
                        </p>
                      </div>
                    </div>

                    {/* Relationship */}
                    <div className="lg:col-span-2">
                      <Badge className={getRelationshipColor(journalist.relationship_status)}>
                        {journalist.relationship_status.replace('_', ' ')}
                      </Badge>
                      {journalist.last_industry_coverage && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Last coverage: {new Date(journalist.last_industry_coverage).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* Contact Methods */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-1">
                        {journalist.email && (
                          <Button size="sm" variant="outline" onClick={() => handleEmail(journalist)}>
                            <Mail className="w-3 h-3" />
                          </Button>
                        )}
                        {journalist.linkedin_url && (
                          <Button size="sm" variant="outline" onClick={() => handleLinkedIn(journalist)}>
                            <Linkedin className="w-3 h-3" />
                          </Button>
                        )}
                        {journalist.twitter_handle && (
                          <Button size="sm" variant="outline" onClick={() => handleTwitter(journalist)}>
                            <Twitter className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-1">
                      <Button size="sm" variant="outline" onClick={() => handlePreview(journalist)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <JournalistPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        journalist={selectedJournalist}
        articles={journalistArticles}
        isLoadingArticles={isLoadingArticles}
      />
      
      <AddJournalistModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

export default Journalists;