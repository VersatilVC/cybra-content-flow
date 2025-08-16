import React, { useState } from 'react';
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, Search, Filter, Eye, Edit, Send, Check, Clock, User, Building2, Mail, ExternalLink } from "lucide-react";
import { usePRManagement } from "@/hooks/usePRManagement";
import { formatDistanceToNow } from "date-fns";
import PRPitchGenerationSection from "@/components/pr-pitches/PRPitchGenerationSection";

const PRPitches = () => {
  const { pitches, pitchesLoading, campaigns, updatePitchStatus } = usePRManagement();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');

  const filteredPitches = pitches.filter(pitch => {
    const matchesSearch = pitch.journalist?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pitch.journalist?.publication.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pitch.content_item?.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || pitch.status === statusFilter;
    const matchesCampaign = campaignFilter === 'all' || pitch.pr_campaign_id === campaignFilter;
    
    return matchesSearch && matchesStatus && matchesCampaign;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-secondary text-secondary-foreground';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'responded': return 'bg-green-100 text-green-800';
      case 'covered': return 'bg-purple-100 text-purple-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="w-3 h-3" />;
      case 'sent': return <Send className="w-3 h-3" />;
      case 'responded': return <Check className="w-3 h-3" />;
      case 'covered': return <ExternalLink className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
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

        {/* Pitches List */}
        <div className="grid gap-4">
          {pitchesLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 animate-spin" />
                  Loading pitches...
                </div>
              </CardContent>
            </Card>
          ) : filteredPitches.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Megaphone className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No PR Pitches Found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Use the generation section above to create PR pitches for your topical blog posts.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPitches.map(pitch => (
              <Card key={pitch.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Journalist Info */}
                    <div className="lg:col-span-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">
                            {pitch.journalist?.name}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {pitch.journalist?.title}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Building2 className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground truncate">
                              {pitch.journalist?.publication}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Item */}
                    <div className="lg:col-span-3">
                      <p className="text-sm font-medium text-foreground truncate mb-1">
                        {pitch.content_item?.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {pitch.content_item?.content_type}
                      </p>
                    </div>

                    {/* Status & Actions */}
                    <div className="lg:col-span-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(pitch.status)}>
                          {getStatusIcon(pitch.status)}
                          <span className="ml-1">{pitch.status}</span>
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created {formatDistanceToNow(new Date(pitch.created_at), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {pitch.journalist?.email && (
                          <Button size="sm" variant="outline">
                            <Mail className="w-4 h-4" />
                          </Button>
                        )}
                        <Select
                          value={pitch.status}
                          onValueChange={(newStatus) => 
                            updatePitchStatus({ 
                              pitchId: pitch.id, 
                              status: newStatus 
                            })
                          }
                        >
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="responded">Responded</SelectItem>
                            <SelectItem value="covered">Covered</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PRPitches;