
export interface GeneralContentItem {
  id: string;
  user_id: string;
  title: string;
  content?: string;
  derivative_type: string;
  derivative_types?: string[];
  category: string;
  content_type: string;
  source_type: 'manual' | 'url' | 'file';
  source_data: Record<string, any>;
  target_audience: string;
  status: 'draft' | 'ready_for_review' | 'approved' | 'published';
  word_count?: number;
  metadata: Record<string, any>;
  file_path?: string;
  file_url?: string;
  file_size?: string;
  mime_type?: string;
  created_at: string;
  updated_at: string;
}

export interface GeneralContentFilters {
  category: string;
  derivativeType: string;
  status: string;
  search: string;
}

export interface CreateGeneralContentRequest {
  title: string;
  content?: string;
  derivative_type: string;
  derivative_types?: string[];
  category: string;
  content_type: string;
  source_type: 'manual' | 'url' | 'file';
  source_data: Record<string, any>;
  target_audience: string;
  file_path?: string;
  file_url?: string;
  file_size?: string;
  mime_type?: string;
}
