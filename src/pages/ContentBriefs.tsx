
import React, { useEffect, useState, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useContentBriefs } from '@/hooks/useContentBriefs';
import { useOptimizedAuthContext } from '@/contexts/OptimizedAuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import ViewBriefModal from '@/components/ViewBriefModal';
import EditBriefModal from '@/components/EditBriefModal';
import ContentBriefsHeader from '@/components/content-briefs/ContentBriefsHeader';
import ContentBriefsFilters from '@/components/content-briefs/ContentBriefsFilters';
import BriefsGrid from '@/components/content-briefs/BriefsGrid';
import ContentBriefsTable from '@/components/content-briefs/ContentBriefsTable';
import { useContentBriefsState } from '@/hooks/useContentBriefsState';
import { useContentBriefsActions } from '@/hooks/useContentBriefsActions';
import { ContentBrief } from '@/types/contentBriefs';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious, PaginationLink, PaginationEllipsis } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';

const ContentBriefs = () => {
  const { user, loading: authLoading } = useOptimizedAuthContext();
  
  const {
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
} = useContentBriefsState();

  const debouncedFilters = useDebounce(filters, 400);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  const [selectedBriefs, setSelectedBriefs] = useState<ContentBrief[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const initializedRef = useRef(false);
  // Persist page size per user in localStorage
useEffect(() => {
    if (!user) return;
    const key = `ui:briefs:pageSize:${user.id}`;
    const stored = localStorage.getItem(key);
    const urlPageSize = new URLSearchParams(window.location.search).get('pageSize');
    if (!urlPageSize && stored) setPageSize(Number(stored));
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    const key = `ui:briefs:pageSize:${user.id}`;
    localStorage.setItem(key, String(pageSize));
  }, [pageSize, user?.id]);

useEffect(() => {
  if (initializedRef.current) return;
  const params = new URLSearchParams(window.location.search);
  const p = Number(params.get('page') || '1');
  setPage(isNaN(p) || p < 1 ? 1 : p);
  const ps = params.get('pageSize');
  if (ps) setPageSize(Math.max(1, Number(ps)));
  const s = params.get('search');
  if (s !== null) handleFilterChange('search', s);
  const bt = params.get('briefType');
  if (bt) handleFilterChange('briefType', bt);
  const ta = params.get('targetAudience');
  if (ta) handleFilterChange('targetAudience', ta);
  const stParam = params.get('status');
  if (stParam) handleFilterChange('status', stParam);
  initializedRef.current = true;
}, []);

const { 
    briefs, 
    totalCount,
    isLoading, 
    error,
    deleteBrief,
    updateBrief,
    isUpdating 
  } = useContentBriefs(debouncedFilters, { page, pageSize });

  const { handleSaveBrief, handleCreateContentItem } = useContentBriefsActions({
    briefs,
    isLoading,
    pendingBriefId,
    setPendingBriefId,
    setSelectedBrief,
    setViewModalOpen,
    isCreatingContent,
    setIsCreatingContent,
    toast,
    updateBrief,
    setEditModalOpen,
  });

  console.log('ContentBriefs Debug:', {
    user: !!user,
    userId: user?.id,
    authLoading,
    isLoading,
    error: error?.message,
    briefsCount: briefs.length,
    retryCount
  });

  // Reset to first page when filters or page size change
  useEffect(() => {
    setPage(1);
  }, [JSON.stringify(debouncedFilters), pageSize]);

  useEffect(() => {
    if (!initializedRef.current) return;
    const params: Record<string, string> = {};
    if (page && page !== 1) params.page = String(page);
    if (pageSize && pageSize !== 12) params.pageSize = String(pageSize);
    if (debouncedFilters.search) params.search = debouncedFilters.search;
    if (debouncedFilters.briefType && debouncedFilters.briefType !== 'All Brief Types') params.briefType = debouncedFilters.briefType;
    if (debouncedFilters.targetAudience && debouncedFilters.targetAudience !== 'All Audiences') params.targetAudience = debouncedFilters.targetAudience;
    if (debouncedFilters.status && debouncedFilters.status !== 'All Statuses') params.status = debouncedFilters.status;
    setSearchParams(params, { replace: true });
  }, [page, pageSize, debouncedFilters, setSearchParams]);

  // Show loading while auth is still loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-gray-600">Loading authentication...</span>
      </div>
    );
  }

  // Show auth error if user is not authenticated
  if (!user) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <Alert className="mb-6">
          <AlertDescription>
            You need to be logged in to view content briefs. Please log in and try again.
          </AlertDescription>
        </Alert>
        <Button onClick={() => window.location.href = '/auth'}>
          Go to Login
        </Button>
      </div>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            Failed to load content briefs: {error.message}
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button onClick={handleRetry} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          <Button onClick={() => window.location.href = '/dashboard'} variant="outline">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Show loading while data is being fetched
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-gray-600">Loading content briefs...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <ContentBriefsHeader 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      <ContentBriefsFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <div className="mt-4 flex justify-end">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Items per page</span>
          <Select value={String(pageSize)} onValueChange={(v) => { setPage(1); setPageSize(Number(v)); }}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="48">48</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>


      {viewMode === 'table' ? (
        <ContentBriefsTable
          briefs={briefs}
          onEdit={handleEdit}
          onDiscard={deleteBrief}
          onCreateContentItem={handleCreateContentItem}
          onView={handleView}
          selectedItems={selectedBriefs}
          onSelectionChange={setSelectedBriefs}
        />
      ) : (
        <BriefsGrid
          briefs={briefs}
          onEdit={handleEdit}
          onDiscard={deleteBrief}
          onCreateContentItem={handleCreateContentItem}
          onView={handleView}
        />
      )}

      {(() => {
        const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));
        const pages: number[] = [];
        const add = (n: number) => { if (n >= 1 && n <= totalPages && !pages.includes(n)) pages.push(n); };
        if (totalPages <= 7) {
          for (let i = 1; i <= totalPages; i++) add(i);
        } else {
          add(1);
          add(2);
          add(page - 1);
          add(page);
          add(page + 1);
          add(totalPages - 1);
          add(totalPages);
          pages.sort((a,b) => a - b);
        }
        return (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {pages.map((p, idx) => {
                const prev = pages[idx - 1];
                const showEllipsis = prev !== undefined && p - prev > 1;
                return (
                  <React.Fragment key={p}>
                    {showEllipsis && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        isActive={p === page}
                        onClick={(e) => { e.preventDefault(); setPage(p); }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  </React.Fragment>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(page + 1); }}
                  className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        );
      })()}


      {/* Modals */}
      <ViewBriefModal
        brief={selectedBrief}
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedBrief(null);
        }}
        onEdit={handleEdit}
        onCreateContentItem={handleCreateContentItem}
      />
      
      <EditBriefModal
        brief={selectedBrief}
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedBrief(null);
        }}
        onSave={handleSaveBrief}
        isUpdating={isUpdating}
      />
    </div>
  );
};

export default ContentBriefs;
