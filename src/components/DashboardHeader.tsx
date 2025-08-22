
import React, { useState, useRef, useEffect, memo, useCallback } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationCenter } from "@/components/NotificationCenter";
import { SearchResults } from "@/components/SearchResults";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export const DashboardHeader = memo(function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { results, isLoading, hasQuery } = useGlobalSearch(searchQuery);

  // Handle clicks outside search to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = searchRef.current?.querySelector('input');
        searchInput?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(value.trim().length >= 2);
  }, []);

  const handleSearchFocus = useCallback(() => {
    if (hasQuery) {
      setShowResults(true);
    }
  }, [hasQuery]);

  const handleResultSelect = useCallback(() => {
    setShowResults(false);
    setSearchQuery("");
  }, []);

  return (
    <header className="border-b bg-white/50 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search content... (Cmd+K)"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              className="pl-10 pr-4 w-80 bg-white/70"
            />
            {showResults && (hasQuery || isLoading) && (
              <SearchResults
                results={results}
                isLoading={isLoading}
                onSelect={handleResultSelect}
              />
            )}
          </div>
          
          <NotificationCenter />
        </div>
      </div>
    </header>
  );
});
