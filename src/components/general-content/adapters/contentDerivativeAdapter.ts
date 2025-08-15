import { GeneralContentItem } from '@/types/generalContent';
import { ContentDerivative } from '@/services/contentDerivativesApi';

/**
 * Adapter to convert GeneralContentItem to ContentDerivative interface
 * for compatibility with existing preview components
 */
export const adaptGeneralContentToDerivative = (item: GeneralContentItem): ContentDerivative => {
  // Map general content type to valid derivative content type
  const mapContentType = (contentType: string): 'text' | 'image' | 'audio' | 'video' | 'document' | 'composite' => {
    switch (contentType) {
      case 'text': return 'text';
      case 'image': return 'image';
      case 'audio': return 'audio';
      case 'video': return 'video';
      case 'document': return 'document';
      case 'composite': return 'composite';
      default: return 'text'; // Default fallback
    }
  };

  // Map general content status to valid derivative status
  const mapStatus = (status: string): 'draft' | 'approved' | 'published' | 'discarded' => {
    switch (status) {
      case 'approved': return 'approved';
      case 'published': return 'published';
      case 'failed': return 'discarded';
      case 'ready': return 'approved'; // Map ready to approved
      default: return 'draft'; // Default for draft, ready_for_review, processing
    }
  };

  return {
    id: item.id,
    content_item_id: item.id, // Use the same ID since it's the primary content
    derivative_type: item.derivative_type,
    content_type: mapContentType(item.content_type),
    title: item.title,
    content: item.content || null,
    file_url: item.file_url || null,
    file_path: item.file_path || null,
    file_size: item.file_size || null,
    mime_type: item.mime_type || null,
    status: mapStatus(item.status),
    category: item.category as 'General' | 'Social' | 'Ads',
    metadata: item.metadata || {},
    word_count: item.word_count || null,
    user_id: item.user_id,
    created_at: item.created_at,
    updated_at: item.updated_at
  };
};