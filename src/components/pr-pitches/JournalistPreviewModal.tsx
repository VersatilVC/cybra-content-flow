import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  Building2, 
  Star, 
  Calendar, 
  Mail, 
  Linkedin, 
  Twitter, 
  Phone,
  Globe,
  Target,
  Clock,
  TrendingUp,
  BookOpen,
  ExternalLink,
  FileText
} from "lucide-react";
import type { Journalist, JournalistArticle } from "@/hooks/usePRManagement";

interface JournalistPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  journalist: Journalist | null;
  articles?: JournalistArticle[];
  isLoadingArticles?: boolean;
}

export const JournalistPreviewModal: React.FC<JournalistPreviewModalProps> = ({
  isOpen,
  onClose,
  journalist,
  articles = [],
  isLoadingArticles = false
}) => {
  if (!journalist) return null;

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

  const getRelevanceColor = (relevance?: string) => {
    switch (relevance) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleEmailClick = () => {
    if (journalist.email) {
      window.open(`mailto:${journalist.email}`, '_blank');
    }
  };

  const handleLinkedInClick = () => {
    if (journalist.linkedin_url) {
      window.open(journalist.linkedin_url, '_blank');
    }
  };

  const handleTwitterClick = () => {
    if (journalist.twitter_handle) {
      const twitterUrl = journalist.twitter_handle.startsWith('@') 
        ? `https://twitter.com/${journalist.twitter_handle.slice(1)}`
        : `https://twitter.com/${journalist.twitter_handle}`;
      window.open(twitterUrl, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{journalist.name}</h2>
              <p className="text-sm text-muted-foreground">{journalist.title}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Publication Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Publication:</span>
                      <span className="text-sm">{journalist.publication}</span>
                    </div>
                    {journalist.publication_tier && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Tier:</span>
                        <Badge variant="outline">{journalist.publication_tier}</Badge>
                      </div>
                    )}
                    {journalist.publication_circulation && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Circulation:</span>
                        <span className="text-sm">{journalist.publication_circulation}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Influence & Metrics
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">Relevance Score:</span>
                      <span className="text-sm">{journalist.relevance_score}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Influence:</span>
                      <Badge className={getInfluenceColor(journalist.journalist_influence)}>
                        {journalist.journalist_influence}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Expertise Level:</span>
                      <span className="text-sm">{journalist.expertise_level}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Relationship Status
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge className={getRelationshipColor(journalist.relationship_status)}>
                        {journalist.relationship_status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Previous Coverage:</span>
                      <span className="text-sm">
                        {journalist.previous_cyabra_coverage ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Best Contact:</span>
                      <span className="text-sm">{journalist.best_contact_method}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Coverage Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Frequency:</span>
                      <span className="text-sm">{journalist.coverage_frequency}</span>
                    </div>
                    {journalist.coverage_type && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Coverage Type:</span>
                        <span className="text-sm">{journalist.coverage_type}</span>
                      </div>
                    )}
                    {journalist.last_industry_coverage && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Last Coverage:</span>
                        <span className="text-sm">
                          {new Date(journalist.last_industry_coverage).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {journalist.email && (
                  <Button variant="outline" onClick={handleEmailClick} className="justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    {journalist.email}
                  </Button>
                )}
                {journalist.linkedin_url && (
                  <Button variant="outline" onClick={handleLinkedInClick} className="justify-start">
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn Profile
                  </Button>
                )}
                {journalist.twitter_handle && (
                  <Button variant="outline" onClick={handleTwitterClick} className="justify-start">
                    <Twitter className="w-4 h-4 mr-2" />
                    @{journalist.twitter_handle.replace('@', '')}
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            {/* Latest Publications */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Latest Publications
              </h3>
              
              {isLoadingArticles ? (
                <div className="flex items-center gap-2 text-muted-foreground py-4">
                  <FileText className="w-4 h-4 animate-spin" />
                  Loading articles...
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No articles found for this journalist</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {articles.map((article) => (
                    <div key={article.id} className="p-3 border rounded-lg bg-card">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {article.url ? (
                              <Button
                                variant="link"
                                className="p-0 h-auto text-left font-medium text-foreground hover:text-primary"
                                onClick={() => window.open(article.url, '_blank')}
                              >
                                {article.title}
                                <ExternalLink className="w-3 h-3 ml-1 inline" />
                              </Button>
                            ) : (
                              <h4 className="font-medium text-foreground text-sm">{article.title}</h4>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {article.publication}
                            </span>
                            {article.date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(article.date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {article.coverage_type}
                            </Badge>
                            {article.relevance && (
                              <Badge className={`text-xs ${getRelevanceColor(article.relevance)}`}>
                                {article.relevance} relevance
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Information */}
            {(journalist.pitch_angle || journalist.timing_considerations || journalist.audience_match || journalist.competitive_coverage) && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Additional Notes
                  </h3>
                  
                  {journalist.pitch_angle && (
                    <div>
                      <span className="text-sm font-medium">Pitch Angle:</span>
                      <p className="text-sm text-muted-foreground mt-1">{journalist.pitch_angle}</p>
                    </div>
                  )}
                  
                  {journalist.timing_considerations && (
                    <div>
                      <span className="text-sm font-medium">Timing Considerations:</span>
                      <p className="text-sm text-muted-foreground mt-1">{journalist.timing_considerations}</p>
                    </div>
                  )}
                  
                  {journalist.audience_match && (
                    <div>
                      <span className="text-sm font-medium">Audience Match:</span>
                      <p className="text-sm text-muted-foreground mt-1">{journalist.audience_match}</p>
                    </div>
                  )}
                  
                  {journalist.competitive_coverage && (
                    <div>
                      <span className="text-sm font-medium">Competitive Coverage:</span>
                      <p className="text-sm text-muted-foreground mt-1">{journalist.competitive_coverage}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};