export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
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
      content_briefs: {
        Row: {
          brief_type: string
          content: string | null
          created_at: string
          description: string | null
          id: string
          source_id: string
          source_type: string
          status: string
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
          id?: string
          source_id: string
          source_type: string
          status?: string
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
          id?: string
          source_id?: string
          source_type?: string
          status?: string
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
          metadata: Json | null
          mime_type: string | null
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
          metadata?: Json | null
          mime_type?: string | null
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
          metadata?: Json | null
          mime_type?: string | null
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
          id: string
          idea_research_summary: string | null
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
          id?: string
          idea_research_summary?: string | null
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
          id?: string
          idea_research_summary?: string | null
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
          id: string
          multimedia_suggestions: string | null
          resources: string[] | null
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
          id?: string
          multimedia_suggestions?: string | null
          resources?: string[] | null
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
          id?: string
          multimedia_suggestions?: string | null
          resources?: string[] | null
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
          id: string
          relevance_score: number | null
          source_title: string | null
          source_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content_idea_id: string
          content_type: string
          created_at?: string
          description?: string | null
          id?: string
          relevance_score?: number | null
          source_title?: string | null
          source_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content_idea_id?: string
          content_type?: string
          created_at?: string
          description?: string | null
          id?: string
          relevance_score?: number | null
          source_title?: string | null
          source_url?: string | null
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
          id: number
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
          metadata: Json | null
          mime_type: string | null
          source_data: Json | null
          source_type: string
          status: string
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
          metadata?: Json | null
          mime_type?: string | null
          source_data?: Json | null
          source_type?: string
          status?: string
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
          metadata?: Json | null
          mime_type?: string | null
          source_data?: Json | null
          source_type?: string
          status?: string
          target_audience?: string
          title?: string
          updated_at?: string
          user_id?: string
          word_count?: number | null
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
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
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
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      match_documents: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_competitor: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_industry: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      match_documents_news: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
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
