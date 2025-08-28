import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface JournalistArticle {
  id: string;
  journalist_id: string;
  title: string;
  url?: string;
  publication: string;
  date?: string;
  coverage_type: string;
  relevance?: string;
  created_at: string;
}

export interface Journalist {
  id: string;
  name: string;
  title: string;
  publication: string;
  type: string;
  email?: string;
  linkedin_url?: string;
  twitter_handle?: string;
  relevance_score: number;
  coverage_type?: string;
  audience_match?: string;
  expertise_level: string;
  coverage_frequency: string;
  recent_activity?: string;
  historical_coverage?: string;
  best_contact_method: string;
  pitch_angle?: string;
  timing_considerations?: string;
  publication_tier?: string;
  publication_circulation?: string;
  journalist_influence: string;
  previous_cyabra_coverage: boolean;
  competitive_coverage: string;
  database_source: string;
  relationship_status: string;
  last_industry_coverage?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface PRPitch {
  id: string;
  pr_campaign_id: string;
  journalist_id: string;
  content_item_id: string;
  user_id: string;
  pitch_content?: string;
  subject_line?: string;
  status: string;
  sent_at?: string;
  responded_at?: string;
  coverage_confirmed: boolean;
  coverage_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  source_type?: string;
  source_id?: string;
  journalist?: Journalist | {
    name: string;
    publication: string;
    email: string;
  };
  content_item?: {
    id: string;
    title: string;
    content_type: string;
  };
}

export interface PRCampaign {
  id: string;
  content_item_id: string;
  user_id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  source_type?: string;
  source_id?: string;
  content_item?: {
    id: string;
    title: string;
    content_type: string;
  };
  pitches?: PRPitch[];
}

export const usePRManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch journalists
  const { data: journalists = [], isLoading: journalistsLoading } = useQuery({
    queryKey: ['journalists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journalists')
        .select('*')
        .order('relevance_score', { ascending: false });
      
      if (error) throw error;
      return data as Journalist[];
    }
  });

  // Fetch PR campaigns with related data
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['pr-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pr_campaigns')
        .select(`
          *,
          content_item:content_items(id, title, content_type),
          pitches:pr_pitches(
            *,
            journalist:journalists(name, publication, email)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as PRCampaign[];
    }
  });

  // Fetch PR pitches with related data
  const { data: pitches = [], isLoading: pitchesLoading } = useQuery({
    queryKey: ['pr-pitches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pr_pitches')
        .select(`
          *,
          journalist:journalists(*),
          content_item:content_items(id, title, content_type)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PRPitch[];
    }
  });

  // Fetch journalist articles by journalist ID
  const fetchJournalistArticles = async (journalistId: string) => {
    const { data, error } = await supabase
      .from('journalist_articles')
      .select('*')
      .eq('journalist_id', journalistId)
      .order('date', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    return data as JournalistArticle[];
  };

  // Fetch journalist article by URL
  const fetchJournalistArticleByUrl = async (url: string) => {
    const { data, error } = await supabase
      .from('journalist_articles')
      .select('*')
      .eq('url', url)
      .maybeSingle();
    
    if (error) throw error;
    return data as JournalistArticle | null;
  };

  // Find journalist articles by partial URL match
  const searchJournalistArticlesByUrl = async (urlPattern: string) => {
    const { data, error } = await supabase
      .from('journalist_articles')
      .select('*')
      .ilike('url', `%${urlPattern}%`)
      .order('date', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    return data as JournalistArticle[];
  };

  // Create journalist
  const createJournalistMutation = useMutation({
    mutationFn: async (journalistData: any) => {
      const { data, error } = await supabase
        .from('journalists')
        .insert(journalistData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalists'] });
      toast({
        title: "Success",
        description: "Journalist added successfully"
      });
    }
  });

  // Generate PR pitches mutation
  const generatePRPitchesMutation = useMutation({
    mutationFn: async ({ 
      sourceType, 
      sourceId, 
      title 
    }: { 
      sourceType?: 'content_item' | 'general_content'; 
      sourceId: string; 
      title: string;
      // Legacy support
      contentItemId?: string;
    }) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Handle legacy parameters
      const finalSourceType = sourceType || 'content_item';
      const finalSourceId = sourceId;
      let contentItemId = finalSourceId;

      // If source is general_content, create a corresponding content_item
      if (finalSourceType === 'general_content') {
        // Get the general content item details
        const { data: generalContent, error: generalError } = await supabase
          .from('general_content_items')
          .select('*')
          .eq('id', finalSourceId)
          .single();
        
        if (generalError) throw generalError;

        // Create a content_item record linked to the general content
        const { data: contentItem, error: contentItemError } = await supabase
          .from('content_items')
          .insert({
            title: generalContent.title,
            content: generalContent.content || '',
            user_id: user.id,
            content_type: 'Blog Post',
            status: 'ready',
            internal_name: generalContent.internal_name || `REPORT_${Date.now()}`,
            file_summary: `Report: ${generalContent.title}`,
            summary: `Generated from report: ${generalContent.title}`
          })
          .select()
          .single();
        
        if (contentItemError) throw contentItemError;
        contentItemId = contentItem.id;
      }

      // Create a PR campaign with proper content_item_id
      const campaignData = {
        title: `PR Campaign: ${title}`,
        status: 'processing',
        user_id: user.id,
        source_type: finalSourceType,
        source_id: finalSourceId,
        content_item_id: contentItemId
      };

      const { data: campaign, error: campaignError } = await supabase
        .from('pr_campaigns')
        .insert(campaignData)
        .select()
        .single();
      
      if (campaignError) throw campaignError;

      // Trigger webhook for PR pitch generation with required IDs
      const webhookResponse = await supabase.functions.invoke('dispatch-webhook', {
        body: {
          webhook_type: 'pr_pitch_generation',
          payload: {
            request_type: 'pr_pitch_generation',
            campaign_id: campaign.id,
            content_item_id: contentItemId,
            source_type: finalSourceType,
            source_id: finalSourceId,
            title: title,
            user_id: user.id,
            timestamp: new Date().toISOString()
          }
        }
      });

      if (webhookResponse.error) throw webhookResponse.error;
      
      return campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pr-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['pr-pitches'] });
      toast({
        title: "Success",
        description: "PR pitch generation started successfully"
      });
    }
  });

  // Update pitch status
  const updatePitchStatusMutation = useMutation({
    mutationFn: async ({ pitchId, status, notes }: { pitchId: string; status: string; notes?: string }) => {
      const updateData: any = { status };
      if (notes) updateData.notes = notes;
      if (status === 'sent') updateData.sent_at = new Date().toISOString();
      if (status === 'responded') updateData.responded_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('pr_pitches')
        .update(updateData)
        .eq('id', pitchId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pr-pitches'] });
      queryClient.invalidateQueries({ queryKey: ['pr-campaigns'] });
      toast({
        title: "Success",
        description: "Pitch status updated successfully"
      });
    }
  });

  return {
    journalists,
    journalistsLoading,
    campaigns,
    campaignsLoading,
    pitches,
    pitchesLoading,
    createJournalist: createJournalistMutation.mutate,
    generatePRPitches: generatePRPitchesMutation.mutate,
    updatePitchStatus: updatePitchStatusMutation.mutate,
    isGeneratingPitches: generatePRPitchesMutation.isPending,
    fetchJournalistArticles,
    fetchJournalistArticleByUrl,
    searchJournalistArticlesByUrl
  };
};