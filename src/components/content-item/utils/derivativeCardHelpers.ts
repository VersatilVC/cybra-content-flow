
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800 border-green-200';
    case 'published': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'discarded': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getContentTypeIcon = (contentType: string) => {
  switch (contentType) {
    case 'image': return 'Image';
    case 'video': return 'Video';
    case 'audio': return 'Music';
    case 'document': return 'File';
    case 'composite': return 'Layers';
    default: return 'FileText';
  }
};

export const formatFileSize = (sizeString: string | null) => {
  if (!sizeString) return '';
  
  const bytes = parseInt(sizeString, 10);
  if (isNaN(bytes)) return '';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

export const truncateTitle = (title: string, maxLength: number = 50) => {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength) + '...';
};
