import React, { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';

// Standard Loading States
export const LoadingSpinner = memo(function LoadingSpinner({ 
  size = 'default',
  text = 'Loading...' 
}: { 
  size?: 'sm' | 'default' | 'lg';
  text?: string;
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="text-center space-y-2">
        <Loader2 className={`${sizeClasses[size]} animate-spin mx-auto text-primary`} />
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
});

export const LoadingSkeleton = memo(function LoadingSkeleton({
  type = 'card',
  count = 1
}: {
  type?: 'card' | 'list' | 'table' | 'text';
  count?: number;
}) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[180px]" />
            </CardContent>
          </Card>
        );
      case 'list':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </div>
        );
      case 'table':
        return (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        );
      case 'text':
        return (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        );
      default:
        return <Skeleton className="h-4 w-full" />;
    }
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
});

// Standard Status Components
export const StatusBadge = memo(function StatusBadge({
  status,
  variant = 'default'
}: {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'draft' | 'published';
  variant?: 'default' | 'outline';
}) {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
      case 'published':
        return {
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 hover:bg-green-200',
          text: status
        };
      case 'processing':
        return {
          icon: Clock,
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
          text: 'Processing'
        };
      case 'pending':
      case 'draft':
        return {
          icon: AlertCircle,
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
          text: status
        };
      case 'failed':
        return {
          icon: XCircle,
          className: 'bg-red-100 text-red-800 hover:bg-red-200',
          text: 'Failed'
        };
      default:
        return {
          icon: AlertCircle,
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
          text: status
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant={variant} className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.text}
    </Badge>
  );
});

// Standard Empty State Component
export const EmptyState = memo(function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionText = 'Get Started'
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: () => void;
  actionText?: string;
}) {
  return (
    <div className="text-center py-12">
      {Icon && <Icon className="mx-auto h-12 w-12 text-gray-400" />}
      <h3 className="mt-2 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {action && (
        <div className="mt-6">
          <Button onClick={action}>{actionText}</Button>
        </div>
      )}
    </div>
  );
});

// Standard Data Table Row Component
export const DataTableRow = memo(function DataTableRow({
  children,
  onClick,
  className = ''
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <tr 
      className={`hover:bg-gray-50 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
});

// Standard Action Button Group
export const ActionButtonGroup = memo(function ActionButtonGroup({
  actions,
  size = 'sm'
}: {
  actions: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    icon?: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
  }>;
  size?: 'sm' | 'default' | 'lg';
}) {
  return (
    <div className="flex items-center gap-2">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Button
            key={index}
            size={size}
            variant={action.variant || 'outline'}
            onClick={action.onClick}
            disabled={action.disabled}
            className="flex items-center gap-1"
          >
            {Icon && <Icon className="w-4 h-4" />}
            {action.label}
          </Button>
        );
      })}
    </div>
  );
});

// Standard Search and Filter Bar
export const SearchFilterBar = memo(function SearchFilterBar({
  searchValue,
  onSearchChange,
  placeholder = 'Search...',
  filters,
  onFilterChange
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filters?: Array<{
    key: string;
    label: string;
    value: string;
    options: Array<{ label: string; value: string }>;
  }>;
  onFilterChange?: (key: string, value: string) => void;
}) {
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  return (
    <div className="flex items-center gap-4 p-4 bg-white border-b">
      <div className="flex-1">
        <input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={handleSearchChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      {filters && onFilterChange && (
        <div className="flex items-center gap-2">
          {filters.map((filter) => (
            <select
              key={filter.key}
              value={filter.value}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">{filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}
    </div>
  );
});

// Standard Page Header
export const PageHeader = memo(function PageHeader({
  title,
  description,
  actions
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-6 bg-white border-b">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
});

// Export all components for easy usage
export const StandardComponents = {
  LoadingSpinner,
  LoadingSkeleton,
  StatusBadge,
  EmptyState,
  DataTableRow,
  ActionButtonGroup,
  SearchFilterBar,
  PageHeader
};