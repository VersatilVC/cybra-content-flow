
import { File, Link, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RecentContentItemProps {
  id: string;
  originalFilename?: string;
  fileUrl?: string;
  knowledgeBase: string;
  contentType: string;
  processingStatus: string;
  fileSize?: number;
  createdAt: string;
  errorMessage?: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'processing':
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    case 'failed':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-yellow-500" />;
  }
};

const getStatusBadge = (status: string) => {
  const colors = {
    completed: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800',
    queued: 'bg-yellow-100 text-yellow-800'
  };
  
  return colors[status as keyof typeof colors] || colors.queued;
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const getKnowledgeBaseColor = (kb: string) => {
  const colors = {
    cyabra: 'bg-primary',
    industry: 'bg-blue-500',
    news: 'bg-green-500',
    competitor: 'bg-orange-500'
  };
  return colors[kb as keyof typeof colors] || 'bg-muted';
};

const getKnowledgeBaseName = (kb: string) => {
  const names = {
    cyabra: 'Cyabra KB',
    industry: 'Industry KB',
    news: 'News KB',
    competitor: 'Competitor KB'
  };
  return names[kb as keyof typeof names] || kb;
};

export function RecentContentItem({ 
  originalFilename, 
  fileUrl, 
  knowledgeBase, 
  contentType,
  processingStatus,
  fileSize,
  createdAt,
  errorMessage
}: RecentContentItemProps) {
  const isFile = contentType === 'file';
  const displayName = originalFilename || fileUrl || 'Unknown content';
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {isFile ? (
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <File className="w-5 h-5 text-blue-600" />
            </div>
          ) : (
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Link className="w-5 h-5 text-green-600" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {displayName}
            </h4>
            {getStatusIcon(processingStatus)}
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(processingStatus)}`}>
              {processingStatus.charAt(0).toUpperCase() + processingStatus.slice(1)}
            </span>
            <div className={`w-2 h-2 rounded-full ${getKnowledgeBaseColor(knowledgeBase)}`}></div>
            <span className="text-xs text-gray-500">{getKnowledgeBaseName(knowledgeBase)}</span>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
            {fileSize && <span>{formatFileSize(fileSize)}</span>}
            <span className="capitalize">{contentType}</span>
          </div>
          
          {errorMessage && (
            <p className="text-xs text-red-600 mt-1 truncate" title={errorMessage}>
              Error: {errorMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
