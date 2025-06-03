
export interface ContentIdea {
  id: string;
  title: string;
  description: string | null;
  content_type: 'Blog Post' | 'Guide';
  target_audience: 'Private Sector' | 'Government Sector';
  status: 'processing' | 'processed' | 'brief_created' | 'discarded';
  source_type: 'manual' | 'file' | 'url' | 'auto_generated';
  source_data: any;
  created_at: string;
  updated_at: string;
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
  content_type: 'Blog Post' | 'Guide';
  target_audience: 'Private Sector' | 'Government Sector';
  status: 'processing' | 'processed' | 'brief_created' | 'discarded';
  source_type: 'manual' | 'file' | 'url' | 'auto_generated';
  source_data: any;
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
  created_at: string;
  updated_at: string;
}
