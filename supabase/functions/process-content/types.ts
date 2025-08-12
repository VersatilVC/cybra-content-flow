
export interface TriggerRequestBody {
  submissionId: string;
  type?: string;
  brief_id?: string;
  user_id?: string;
  brief_title?: string;
  brief_type?: string;
  target_audience?: string;
  timestamp?: string;
  // General content specific fields
  general_content_id?: string;
  title?: string;
  category?: string;
  derivative_types?: string[];
  content_type?: string;
  source_type?: string;
  source_data?: Record<string, any>;
}

export interface CallbackRequestBody {
  submission_id: string;
  status?: string;
  error_message?: string;
  brief_id?: string;
  content_item_id?: string;
  general_content_id?: string;
}

export interface WebhookPayload {
  submission_id: string;
  user_id: string;
  knowledge_base: string;
  content_type: string;
  file_url?: string;
  original_filename?: string;
  file_size?: number;
  mime_type?: string;
  timestamp: string;
  general_content_id?: string;
  // General content specific fields
  title?: string;
  category?: string;
  derivative_types?: string[];
  source_type?: string;
  source_data?: Record<string, any>;
  target_audience?: string;
}
