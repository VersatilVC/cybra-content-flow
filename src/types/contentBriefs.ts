
export interface ContentBrief {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  status: 'draft' | 'ready' | 'processing' | 'completed' | 'discarded' | 'failed';
  source_type: 'idea' | 'suggestion';
  source_id: string;
  brief_type: 'Blog Post' | 'Guide' | 'Blog Post (Topical)';
  target_audience: 'Private Sector' | 'Government Sector';
  user_id: string;
  created_at: string;
  updated_at: string;
  processing_started_at?: string;
  processing_timeout_at?: string;
  last_error_message?: string;
  retry_count?: number;
  submission_id?: string;
  file_summary?: string;
}

export interface ContentBriefFilters {
  briefType?: string;
  targetAudience?: string;
  status?: string;
  search?: string;
}

export interface CreateContentBriefData {
  title: string;
  description: string | null;
  content: string | null;
  status: 'draft' | 'ready' | 'processing' | 'completed' | 'discarded' | 'failed';
  source_type: 'idea' | 'suggestion';
  source_id: string;
  brief_type: 'Blog Post' | 'Guide' | 'Blog Post (Topical)';
  target_audience: 'Private Sector' | 'Government Sector';
  user_id: string;
}
