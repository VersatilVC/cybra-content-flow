
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useContentItems } from '@/hooks/useContentItems';
import { ContentItem } from '@/services/contentItemsApi';
import ContentItemsHeader from '@/components/content-items/ContentItemsHeader';
import ContentItemsFilters from '@/components/content-items/ContentItemsFilters';
import ContentItemCard from '@/components/content-items/ContentItemCard';
import EmptyContentItemsState from '@/components/content-items/EmptyContentItemsState';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious, PaginationLink, PaginationEllipsis } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';

const ContentItems = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { contentItems, totalCount, isLoading, error } = useContentItems(
    {
      search: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      type: typeFilter !== 'all' ? typeFilter : undefined,
    },
    { page, pageSize }
  );

const { user } = useAuth();

useEffect(() => {
  const key = `ui:content-items:pageSize:${user?.id || 'anon'}`;
  const stored = localStorage.getItem(key);
  if (stored) setPageSize(Number(stored));
}, [user?.id]);

useEffect(() => {
  const key = `ui:content-items:pageSize:${user?.id || 'anon'}`;
  localStorage.setItem(key, String(pageSize));
}, [pageSize, user?.id]);

useEffect(() => {
  setPage(1);
}, [searchTerm, statusFilter, typeFilter, pageSize]);

const filteredItems = contentItems.filter((item: ContentItem) => {
  const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.summary?.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
  const matchesType = typeFilter === 'all' || item.content_type === typeFilter;
  
  return matchesSearch && matchesStatus && matchesType;
});

  const handleViewItem = (itemId: string, activeTab?: string) => {
    if (activeTab) {
      navigate(`/content-items/${itemId}?tab=${activeTab}`);
    } else {
      navigate(`/content-items/${itemId}`);
    }
  };

  const handleNavigateToDerivatives = (itemId: string) => {
    handleViewItem(itemId, 'derivatives');
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading content items</h3>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <ContentItemsHeader itemCount={filteredItems.length} />
      
      <ContentItemsFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onTypeFilterChange={setTypeFilter}
      />

      <div className="mt-4 flex justify-end">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Items per page</span>
          <Select value={String(pageSize)} onValueChange={(v) => { setPage(1); setPageSize(Number(v)); }}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>


      {filteredItems.length === 0 ? (
        <EmptyContentItemsState
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
        />
      ) : (
        <> 
          <div className="space-y-4">
            {filteredItems.map((item: ContentItem) => (
              <ContentItemCard
                key={item.id}
                item={item}
                onViewItem={handleViewItem}
                onNavigateToDerivatives={handleNavigateToDerivatives}
              />
            ))}
          </div>

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
              // Ensure sorted unique
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
        </>
      )}
    </div>
  );
};

export default ContentItems;
