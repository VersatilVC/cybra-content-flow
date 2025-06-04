
export const getStatusInfo = (status: string) => {
  switch (status) {
    case 'ready_for_review':
      return { color: 'bg-yellow-100 text-yellow-800', label: 'Ready for Review' };
    case 'approved':
      return { color: 'bg-green-100 text-green-800', label: 'Approved' };
    case 'needs_revision':
      return { color: 'bg-red-100 text-red-800', label: 'Needs Revision' };
    case 'draft':
      return { color: 'bg-gray-100 text-gray-800', label: 'Draft' };
    case 'published':
      return { color: 'bg-blue-100 text-blue-800', label: 'Published' };
    default:
      return { color: 'bg-gray-100 text-gray-800', label: status };
  }
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
