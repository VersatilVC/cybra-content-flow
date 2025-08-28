export interface GeneralContentItem {
  id: string;
  user_id: string;
  title: string;
  content?: string;
  derivative_type: string;
  derivative_types?: string[]; // Array of derivative types
  category: string;
  content_type: string;
  source_type: 'manual' | 'url' | 'file';
  source_data: Record<string, any>;
  target_audience: string;
  status: 'draft' | 'ready_for_review' | 'approved' | 'published' | 'ready' | 'failed' | 'processing';
  internal_name: string;
  word_count?: number;
  metadata: Record<string, any>;
  file_path?: string;
  file_url?: string;
  file_size?: string;
  mime_type?: string;
  submission_id?: string;
  created_at: string;
  updated_at: string;
}

export interface GeneralContentFilters {
  category: string;
  derivativeType: string;
  status: string;
  search: string;
  page?: number;
  pageSize?: number;
}

export interface CreateGeneralContentRequest {
  title: string;
  content?: string;
  derivative_type: string;
  derivative_types?: string[]; // Array of derivative types for multi-select
  category: string;
  content_type: string;
  source_type: 'manual' | 'url' | 'file';
  source_data: Record<string, any>;
  target_audience: string;
  internal_name?: string;
  file_path?: string;
  file_url?: string;
  file_size?: string;
  mime_type?: string;
  submission_id?: string;
}

export interface GeneralContentStats {
  total: number;
  approved: number;
  published: number;
  failed: number;
}

export interface CategorizedGeneralContent {
  General: GeneralContentItem[];
  Social: GeneralContentItem[];
  Ads: GeneralContentItem[];
}