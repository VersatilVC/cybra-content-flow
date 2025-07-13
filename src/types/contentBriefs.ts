
export interface ContentBrief {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  status: 'ready_for_review' | 'processing_content_item' | 'content_item_created' | 'discarded';
  source_type: 'idea' | 'suggestion';
  source_id: string;
  brief_type: 'Blog Post' | 'Guide' | 'Blog Post (Topical)';
  target_audience: 'Private Sector' | 'Government Sector';
  user_id: string;
  created_at: string;
  updated_at: string;
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
  status: 'ready_for_review' | 'processing_content_item' | 'content_item_created' | 'discarded';
  source_type: 'idea' | 'suggestion';
  source_id: string;
  brief_type: 'Blog Post' | 'Guide' | 'Blog Post (Topical)';
  target_audience: 'Private Sector' | 'Government Sector';
  user_id: string;
}
