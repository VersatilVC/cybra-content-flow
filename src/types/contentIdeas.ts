
export interface ContentIdea {
  id: string;
  title: string;
  description: string | null;
  content_type: 'Blog Post' | 'Guide' | 'Blog Post (Topical)';
  target_audience: 'Private Sector' | 'Government Sector';
  status: 'processing' | 'ready' | 'brief_created' | 'discarded' | 'failed';
  source_type: 'manual' | 'file' | 'url' | 'auto_generated';
  source_data: any;
  internal_name?: string;
  created_at: string;
  updated_at: string;
  idea_research_summary?: string;
  processing_started_at?: string;
  processing_timeout_at?: string;
  retry_count?: number;
  last_error_message?: string;
}

export interface ContentIdeaFilters {
  contentType?: string;
  targetAudience?: string;
  status?: string;
  search?: string;
}

export interface CreateContentIdeaData {
  title: string;
  description: string | null;
  content_type: 'Blog Post' | 'Guide' | 'Blog Post (Topical)';
  target_audience: 'Private Sector' | 'Government Sector';
  status: 'processing' | 'ready' | 'brief_created' | 'discarded' | 'failed';
  source_type: 'manual' | 'file' | 'url' | 'auto_generated';
  source_data: any;
  internal_name?: string;
  processing_started_at?: string;
  processing_timeout_at?: string;
  retry_count?: number;
}

export interface ContentSuggestion {
  id: string;
  content_idea_id: string;
  title: string;
  description: string | null;
  content_type: string;
  relevance_score: number | null;
  source_url: string | null;
  source_title: string | null;
  status: 'ready' | 'processing' | 'failed' | 'completed';
  created_at: string;
  updated_at: string;
  processing_started_at?: string;
  processing_timeout_at?: string;
  last_error_message?: string;
  retry_count?: number;
  file_summary?: string;
}
