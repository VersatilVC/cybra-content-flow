
import { useState, useEffect } from 'react';
import { ContentBrief, ContentBriefFilters } from '@/types/contentBriefs';
import { useToast } from '@/hooks/use-toast';

export function useContentBriefsState() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<ContentBriefFilters>({
    briefType: 'All Brief Types',
    targetAudience: 'All Audiences',
    status: 'All Statuses',
    search: '',
  });

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBrief, setSelectedBrief] = useState<ContentBrief | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isCreatingContent, setIsCreatingContent] = useState(false);
  const [pendingBriefId, setPendingBriefId] = useState<string | null>(null);

  const handleFilterChange = (key: keyof ContentBriefFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleEdit = (brief: ContentBrief) => {
    setSelectedBrief(brief);
    setEditModalOpen(true);
    setViewModalOpen(false); // Close view modal if open
  };

  const handleView = (brief: ContentBrief) => {
    setSelectedBrief(brief);
    setViewModalOpen(true);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    window.location.reload();
  };

  // Check URL params for auto-opening brief details on initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewBriefId = urlParams.get('view');
    
    if (viewBriefId) {
      setPendingBriefId(viewBriefId);
      // Clear the URL parameter immediately
      window.history.replaceState({}, '', '/content-briefs');
    }
  }, []);

  return {
    filters,
    viewModalOpen,
    editModalOpen,
    selectedBrief,
    retryCount,
    isCreatingContent,
    pendingBriefId,
    handleFilterChange,
    handleEdit,
    handleView,
    handleRetry,
    setViewModalOpen,
    setEditModalOpen,
    setSelectedBrief,
    setIsCreatingContent,
    setPendingBriefId,
    toast,
  };
}
