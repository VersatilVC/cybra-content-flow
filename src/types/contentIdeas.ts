
export interface ContentIdea {
  id: string;
  title: string;
  description: string | null;
  content_type: 'Blog Post' | 'Guide';
  target_audience: 'Private Sector' | 'Government Sector';
  status: 'submitted' | 'processing' | 'processed' | 'brief_created' | 'discarded';
  source_type: 'manual' | 'file' | 'url';
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
  status: 'submitted' | 'processing' | 'processed' | 'brief_created' | 'discarded';
  source_type: 'manual' | 'file' | 'url';
  source_data: any;
}
