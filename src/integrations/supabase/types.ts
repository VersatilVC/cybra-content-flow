export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      account_linking_audit: {
        Row: {
          created_at: string
          id: string
          linked_auth_id: string
          linking_method: string
          original_auth_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          linked_auth_id: string
          linking_method: string
          original_auth_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          linked_auth_id?: string
          linking_method?: string
          original_auth_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_linking_audit_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      approved_domains: {
        Row: {
          created_at: string
          domain: string
          id: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          accessed_at: string
          context_info: Json | null
          id: string
          operation_type: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          accessed_at?: string
          context_info?: Json | null
          id?: string
          operation_type: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          accessed_at?: string
          context_info?: Json | null
          id?: string
          operation_type?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      auto_generation_schedules: {
        Row: {
          created_at: string
          frequency: string
          id: string
          is_active: boolean
          next_run_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          frequency: string
          id?: string
          is_active?: boolean
          next_run_at: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          frequency?: string
          id?: string
          is_active?: boolean
          next_run_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
          sources: string[] | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
          sources?: string[] | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
          sources?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_history: {
        Row: {
          contact_date: string
          contact_type: string
          created_at: string
          id: string
          journalist_id: string
          message: string | null
          response_received: boolean | null
          subject: string | null
          user_id: string
        }
        Insert: {
          contact_date?: string
          contact_type?: string
          created_at?: string
          id?: string
          journalist_id: string
          message?: string | null
          response_received?: boolean | null
          subject?: string | null
          user_id: string
        }
        Update: {
          contact_date?: string
          contact_type?: string
          created_at?: string
          id?: string
          journalist_id?: string
          message?: string | null
          response_received?: boolean | null
          subject?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_history_journalist_id_fkey"
            columns: ["journalist_id"]
            isOneToOne: false
            referencedRelation: "journalists"
            referencedColumns: ["id"]
          },
        ]
      }
      content_briefs: {
        Row: {
          brief_type: string
          content: string | null
          created_at: string
          description: string | null
          file_summary: string | null
          id: string
          internal_name: string
          last_error_message: string | null
          processing_started_at: string | null
          processing_timeout_at: string | null
          retry_count: number
          source_id: string
          source_type: string
          status: string
          submission_id: string | null
          target_audience: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brief_type: string
          content?: string | null
          created_at?: string
          description?: string | null
          file_summary?: string | null
          id?: string
          internal_name: string
          last_error_message?: string | null
          processing_started_at?: string | null
          processing_timeout_at?: string | null
          retry_count?: number
          source_id: string
          source_type: string
          status?: string
          submission_id?: string | null
          target_audience: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brief_type?: string
          content?: string | null
          created_at?: string
          description?: string | null
          file_summary?: string | null
          id?: string
          internal_name?: string
          last_error_message?: string | null
          processing_started_at?: string | null
          processing_timeout_at?: string | null
          retry_count?: number
          source_id?: string
          source_type?: string
          status?: string
          submission_id?: string | null
          target_audience?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_derivatives: {
        Row: {
          category: string
          content: string | null
          content_item_id: string
          content_type: string
          created_at: string
          derivative_type: string
          file_path: string | null
          file_size: string | null
          file_url: string | null
          id: string
          internal_name: string
          last_error_message: string | null
          metadata: Json | null
          mime_type: string | null
          processing_started_at: string | null
          processing_timeout_at: string | null
          retry_count: number
          status: string
          title: string
          updated_at: string
          user_id: string
          word_count: number | null
        }
        Insert: {
          category: string
          content?: string | null
          content_item_id: string
          content_type?: string
          created_at?: string
          derivative_type: string
          file_path?: string | null
          file_size?: string | null
          file_url?: string | null
          id?: string
          internal_name: string
          last_error_message?: string | null
          metadata?: Json | null
          mime_type?: string | null
          processing_started_at?: string | null
          processing_timeout_at?: string | null
          retry_count?: number
          status?: string
          title: string
          updated_at?: string
          user_id: string
          word_count?: number | null
        }
        Update: {
          category?: string
          content?: string | null
          content_item_id?: string
          content_type?: string
          created_at?: string
          derivative_type?: string
          file_path?: string | null
          file_size?: string | null
          file_url?: string | null
          id?: string
          internal_name?: string
          last_error_message?: string | null
          metadata?: Json | null
          mime_type?: string | null
          processing_started_at?: string | null
          processing_timeout_at?: string | null
          retry_count?: number
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_derivatives_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      content_ideas: {
        Row: {
          content_type: string
          created_at: string
          description: string | null
          file_summary: string | null
          id: string
          idea_research_summary: string | null
          internal_name: string | null
          last_error_message: string | null
          processing_started_at: string | null
          processing_timeout_at: string | null
          retry_count: number | null
          source_data: Json | null
          source_type: string
          status: string
          target_audience: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_type: string
          created_at?: string
          description?: string | null
          file_summary?: string | null
          id?: string
          idea_research_summary?: string | null
          internal_name?: string | null
          last_error_message?: string | null
          processing_started_at?: string | null
          processing_timeout_at?: string | null
          retry_count?: number | null
          source_data?: Json | null
          source_type: string
          status?: string
          target_audience: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_type?: string
          created_at?: string
          description?: string | null
          file_summary?: string | null
          id?: string
          idea_research_summary?: string | null
          internal_name?: string | null
          last_error_message?: string | null
          processing_started_at?: string | null
          processing_timeout_at?: string | null
          retry_count?: number | null
          source_data?: Json | null
          source_type?: string
          status?: string
          target_audience?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_items: {
        Row: {
          content: string | null
          content_brief_id: string | null
          content_type: string
          created_at: string
          file_summary: string | null
          id: string
          internal_name: string
          last_error_message: string | null
          multimedia_suggestions: string | null
          processing_started_at: string | null
          processing_timeout_at: string | null
          resources: string[] | null
          retry_count: number
          status: string
          submission_id: string | null
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          word_count: number | null
          wordpress_url: string | null
        }
        Insert: {
          content?: string | null
          content_brief_id?: string | null
          content_type?: string
          created_at?: string
          file_summary?: string | null
          id?: string
          internal_name: string
          last_error_message?: string | null
          multimedia_suggestions?: string | null
          processing_started_at?: string | null
          processing_timeout_at?: string | null
          resources?: string[] | null
          retry_count?: number
          status?: string
          submission_id?: string | null
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          word_count?: number | null
          wordpress_url?: string | null
        }
        Update: {
          content?: string | null
          content_brief_id?: string | null
          content_type?: string
          created_at?: string
          file_summary?: string | null
          id?: string
          internal_name?: string
          last_error_message?: string | null
          multimedia_suggestions?: string | null
          processing_started_at?: string | null
          processing_timeout_at?: string | null
          resources?: string[] | null
          retry_count?: number
          status?: string
          submission_id?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          word_count?: number | null
          wordpress_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_items_content_brief_id_fkey"
            columns: ["content_brief_id"]
            isOneToOne: false
            referencedRelation: "content_briefs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_items_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "content_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      content_submissions: {
        Row: {
          completed_at: string | null
          content_type: string
          created_at: string
          error_message: string | null
          file_path: string | null
          file_size: number | null
          file_url: string | null
          id: string
          knowledge_base: string
          mime_type: string | null
          original_filename: string | null
          processing_status: string
          updated_at: string
          user_id: string
          webhook_triggered_at: string | null
        }
        Insert: {
          completed_at?: string | null
          content_type: string
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          knowledge_base: string
          mime_type?: string | null
          original_filename?: string | null
          processing_status?: string
          updated_at?: string
          user_id: string
          webhook_triggered_at?: string | null
        }
        Update: {
          completed_at?: string | null
          content_type?: string
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          knowledge_base?: string
          mime_type?: string | null
          original_filename?: string | null
          processing_status?: string
          updated_at?: string
          user_id?: string
          webhook_triggered_at?: string | null
        }
        Relationships: []
      }
      content_suggestions: {
        Row: {
          content_idea_id: string
          content_type: string
          created_at: string
          description: string | null
          file_summary: string | null
          id: string
          last_error_message: string | null
          processing_started_at: string | null
          processing_timeout_at: string | null
          relevance_score: number | null
          retry_count: number
          source_title: string | null
          source_url: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          content_idea_id: string
          content_type: string
          created_at?: string
          description?: string | null
          file_summary?: string | null
          id?: string
          last_error_message?: string | null
          processing_started_at?: string | null
          processing_timeout_at?: string | null
          relevance_score?: number | null
          retry_count?: number
          source_title?: string | null
          source_url?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          content_idea_id?: string
          content_type?: string
          created_at?: string
          description?: string | null
          file_summary?: string | null
          id?: string
          last_error_message?: string | null
          processing_started_at?: string | null
          processing_timeout_at?: string | null
          relevance_score?: number | null
          retry_count?: number
          source_title?: string | null
          source_url?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_suggestions_content_idea_id_fkey"
            columns: ["content_idea_id"]
            isOneToOne: false
            referencedRelation: "content_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_competitor: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_industry: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_news: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      feedback_submissions: {
        Row: {
          assigned_to: string | null
          attachment_filename: string | null
          attachment_url: string | null
          category: Database["public"]["Enums"]["feedback_category"]
          created_at: string
          description: string
          id: string
          internal_notes: string | null
          priority: Database["public"]["Enums"]["feedback_priority"]
          status: Database["public"]["Enums"]["feedback_status"]
          submitter_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          attachment_filename?: string | null
          attachment_url?: string | null
          category?: Database["public"]["Enums"]["feedback_category"]
          created_at?: string
          description: string
          id?: string
          internal_notes?: string | null
          priority?: Database["public"]["Enums"]["feedback_priority"]
          status?: Database["public"]["Enums"]["feedback_status"]
          submitter_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          attachment_filename?: string | null
          attachment_url?: string | null
          category?: Database["public"]["Enums"]["feedback_category"]
          created_at?: string
          description?: string
          id?: string
          internal_notes?: string | null
          priority?: Database["public"]["Enums"]["feedback_priority"]
          status?: Database["public"]["Enums"]["feedback_status"]
          submitter_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      general_content_items: {
        Row: {
          category: string
          content: string | null
          content_type: string
          created_at: string
          derivative_type: string
          derivative_types: Json | null
          file_path: string | null
          file_size: string | null
          file_url: string | null
          id: string
          internal_name: string
          metadata: Json | null
          mime_type: string | null
          source_data: Json | null
          source_type: string
          status: string
          submission_id: string | null
          target_audience: string
          title: string
          updated_at: string
          user_id: string
          word_count: number | null
        }
        Insert: {
          category: string
          content?: string | null
          content_type?: string
          created_at?: string
          derivative_type: string
          derivative_types?: Json | null
          file_path?: string | null
          file_size?: string | null
          file_url?: string | null
          id?: string
          internal_name: string
          metadata?: Json | null
          mime_type?: string | null
          source_data?: Json | null
          source_type?: string
          status?: string
          submission_id?: string | null
          target_audience: string
          title: string
          updated_at?: string
          user_id: string
          word_count?: number | null
        }
        Update: {
          category?: string
          content?: string | null
          content_type?: string
          created_at?: string
          derivative_type?: string
          derivative_types?: Json | null
          file_path?: string | null
          file_size?: string | null
          file_url?: string | null
          id?: string
          internal_name?: string
          metadata?: Json | null
          mime_type?: string | null
          source_data?: Json | null
          source_type?: string
          status?: string
          submission_id?: string | null
          target_audience?: string
          title?: string
          updated_at?: string
          user_id?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "general_content_items_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "content_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      journalist_articles: {
        Row: {
          coverage_type: string | null
          created_at: string
          date: string | null
          id: string
          journalist_id: string
          publication: string
          relevance: string | null
          title: string
          url: string | null
        }
        Insert: {
          coverage_type?: string | null
          created_at?: string
          date?: string | null
          id?: string
          journalist_id: string
          publication: string
          relevance?: string | null
          title: string
          url?: string | null
        }
        Update: {
          coverage_type?: string | null
          created_at?: string
          date?: string | null
          id?: string
          journalist_id?: string
          publication?: string
          relevance?: string | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journalist_articles_journalist_id_fkey"
            columns: ["journalist_id"]
            isOneToOne: false
            referencedRelation: "journalists"
            referencedColumns: ["id"]
          },
        ]
      }
      journalist_expertise: {
        Row: {
          beat_area: string
          coverage_category: string
          created_at: string
          id: string
          journalist_id: string
        }
        Insert: {
          beat_area: string
          coverage_category: string
          created_at?: string
          id?: string
          journalist_id: string
        }
        Update: {
          beat_area?: string
          coverage_category?: string
          created_at?: string
          id?: string
          journalist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journalist_expertise_journalist_id_fkey"
            columns: ["journalist_id"]
            isOneToOne: false
            referencedRelation: "journalists"
            referencedColumns: ["id"]
          },
        ]
      }
      journalists: {
        Row: {
          audience_match: string | null
          best_contact_method: string | null
          competitive_coverage: string | null
          coverage_frequency: string | null
          coverage_type: string | null
          created_at: string
          database_source: string | null
          email: string | null
          expertise_level: string | null
          historical_coverage: string | null
          id: string
          journalist_influence: string | null
          last_industry_coverage: string | null
          linkedin_url: string | null
          name: string
          pitch_angle: string | null
          previous_cyabra_coverage: boolean | null
          publication: string
          publication_circulation: string | null
          publication_tier: string | null
          recent_activity: string | null
          relationship_status: string | null
          relevance_score: number | null
          timing_considerations: string | null
          title: string
          twitter_handle: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audience_match?: string | null
          best_contact_method?: string | null
          competitive_coverage?: string | null
          coverage_frequency?: string | null
          coverage_type?: string | null
          created_at?: string
          database_source?: string | null
          email?: string | null
          expertise_level?: string | null
          historical_coverage?: string | null
          id?: string
          journalist_influence?: string | null
          last_industry_coverage?: string | null
          linkedin_url?: string | null
          name: string
          pitch_angle?: string | null
          previous_cyabra_coverage?: boolean | null
          publication: string
          publication_circulation?: string | null
          publication_tier?: string | null
          recent_activity?: string | null
          relationship_status?: string | null
          relevance_score?: number | null
          timing_considerations?: string | null
          title: string
          twitter_handle?: string | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audience_match?: string | null
          best_contact_method?: string | null
          competitive_coverage?: string | null
          coverage_frequency?: string | null
          coverage_type?: string | null
          created_at?: string
          database_source?: string | null
          email?: string | null
          expertise_level?: string | null
          historical_coverage?: string | null
          id?: string
          journalist_influence?: string | null
          last_industry_coverage?: string | null
          linkedin_url?: string | null
          name?: string
          pitch_angle?: string | null
          previous_cyabra_coverage?: boolean | null
          publication?: string
          publication_circulation?: string | null
          publication_tier?: string | null
          recent_activity?: string | null
          relationship_status?: string | null
          relevance_score?: number | null
          timing_considerations?: string | null
          title?: string
          twitter_handle?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_entity_id: string | null
          related_entity_type: string | null
          related_submission_id: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          related_submission_id?: string | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          related_submission_id?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pr_campaigns: {
        Row: {
          content_item_id: string
          created_at: string
          id: string
          source_id: string | null
          source_type: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_item_id: string
          created_at?: string
          id?: string
          source_id?: string | null
          source_type?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_item_id?: string
          created_at?: string
          id?: string
          source_id?: string | null
          source_type?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pr_campaigns_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "general_content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      pr_pitches: {
        Row: {
          content_item_id: string
          coverage_confirmed: boolean | null
          coverage_url: string | null
          created_at: string
          id: string
          journalist_id: string
          notes: string | null
          pitch_content: string | null
          pr_campaign_id: string
          responded_at: string | null
          sent_at: string | null
          source_id: string | null
          source_type: string | null
          status: string
          subject_line: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content_item_id: string
          coverage_confirmed?: boolean | null
          coverage_url?: string | null
          created_at?: string
          id?: string
          journalist_id: string
          notes?: string | null
          pitch_content?: string | null
          pr_campaign_id: string
          responded_at?: string | null
          sent_at?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          subject_line?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content_item_id?: string
          coverage_confirmed?: boolean | null
          coverage_url?: string | null
          created_at?: string
          id?: string
          journalist_id?: string
          notes?: string | null
          pitch_content?: string | null
          pr_campaign_id?: string
          responded_at?: string | null
          sent_at?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          subject_line?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pr_pitches_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pr_pitches_journalist_id_fkey"
            columns: ["journalist_id"]
            isOneToOne: false
            referencedRelation: "journalists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pr_pitches_pr_campaign_id_fkey"
            columns: ["pr_campaign_id"]
            isOneToOne: false
            referencedRelation: "pr_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_active: string | null
          last_name: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_active?: string | null
          last_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_active?: string | null
          last_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      webhook_configurations: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          webhook_type: string
          webhook_url: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          webhook_type?: string
          webhook_url: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          webhook_type?: string
          webhook_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      audit_content_idea_file_access: {
        Args: Record<PropertyKey, never>
        Returns: {
          ideas_missing_paths: number
          ideas_with_invalid_urls: number
          ideas_with_mismatched_user_ids: number
          path_user_ids_extracted: number
          total_file_ideas: number
        }[]
      }
      cleanup_historical_data: {
        Args: {
          batch_size?: number
          cleanup_older_than_days?: number
          dry_run?: boolean
        }
        Returns: {
          cleaned_briefs: number
          cleaned_derivatives: number
          cleaned_ideas: number
          cleaned_items: number
          cleaned_suggestions: number
          cleanup_summary: Json
          total_cleaned: number
        }[]
      }
      extract_user_id_from_path: {
        Args: { file_path: string }
        Returns: string
      }
      force_check_timed_out_general_content: {
        Args: Record<PropertyKey, never>
        Returns: {
          failed_items: Json
          updated_count: number
        }[]
      }
      force_check_timed_out_ideas: {
        Args: Record<PropertyKey, never>
        Returns: {
          failed_ideas: Json
          updated_count: number
        }[]
      }
      force_check_timed_out_submissions: {
        Args: Record<PropertyKey, never>
        Returns: {
          failed_submissions: Json
          updated_count: number
        }[]
      }
      generate_signed_file_url: {
        Args: {
          bucket_name: string
          expiry_seconds?: number
          file_path: string
        }
        Returns: string
      }
      generate_unique_internal_name: {
        Args: {
          category_text?: string
          content_type_text?: string
          created_at_date?: string
          derivative_type_text?: string
          table_name_param?: string
          target_audience_text?: string
          title_text: string
          user_id_param?: string
        }
        Returns: string
      }
      get_cleanup_candidates: {
        Args: { older_than_days?: number }
        Returns: {
          entity_id: string
          entity_type: string
          last_error_message: string
          retry_count: number
          status: string
          title: string
          updated_at: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_derivative_counts: {
        Args: { item_ids: string[] }
        Returns: {
          approved: number
          category: string
          content_item_id: string
          published: number
          total: number
        }[]
      }
      get_journalist_contacts: {
        Args: { journalist_ids?: string[] }
        Returns: {
          email: string
          id: string
          linkedin_url: string
          name: string
          publication: string
          twitter_handle: string
          user_id: string
        }[]
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_company_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_domain_approved: {
        Args: { email_address: string }
        Returns: boolean
      }
      is_service_operation_allowed: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_competitor: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_industry: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_news: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      monitor_all_timeouts: {
        Args: Record<PropertyKey, never>
        Returns: {
          failed_ideas: Json
          failed_submissions: Json
          failed_suggestions: Json
          idea_timeouts: number
          submission_timeouts: number
          suggestion_timeouts: number
          total_processed: number
        }[]
      }
      validate_content_idea_retry_state: {
        Args: Record<PropertyKey, never>
        Returns: {
          failed_ideas: number
          processing_ideas: number
          retryable_ideas: number
          stuck_ideas: number
          total_ideas: number
        }[]
      }
      validate_email_domain: {
        Args: { email_address: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "creator"
      feedback_category:
        | "bug"
        | "feature_request"
        | "general_feedback"
        | "improvement"
      feedback_priority: "low" | "medium" | "high" | "critical"
      feedback_status:
        | "open"
        | "in_review"
        | "in_progress"
        | "testing"
        | "resolved"
        | "closed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "creator"],
      feedback_category: [
        "bug",
        "feature_request",
        "general_feedback",
        "improvement",
      ],
      feedback_priority: ["low", "medium", "high", "critical"],
      feedback_status: [
        "open",
        "in_review",
        "in_progress",
        "testing",
        "resolved",
        "closed",
      ],
    },
  },
} as const
