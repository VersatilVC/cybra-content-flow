
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useContentItems } from '@/hooks/useContentItems';
import { ContentItem } from '@/services/contentItemsApi';
import ContentItemsHeader from '@/components/content-items/ContentItemsHeader';
import ContentItemsFilters from '@/components/content-items/ContentItemsFilters';
import ContentItemCard from '@/components/content-items/ContentItemCard';
import EmptyContentItemsState from '@/components/content-items/EmptyContentItemsState';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const ContentItems = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { contentItems, isLoading, error } = useContentItems({ page, pageSize });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

useEffect(() => {
  setPage(1);
}, [searchTerm, statusFilter, typeFilter]);

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

          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage(page - 1);
                  }}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-3 py-2 text-sm">Page {page}</span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (filteredItems.length >= pageSize) setPage(page + 1);
                  }}
                  className={filteredItems.length < pageSize ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
    </div>
  );
};

export default ContentItems;
