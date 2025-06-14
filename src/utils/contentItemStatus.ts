
export const getStatusInfo = (status: string) => {
  switch (status) {
    case 'ready_for_review':
      return { color: 'bg-yellow-100 text-yellow-800', label: 'Ready for Review' };
    case 'derivatives_created':
      return { color: 'bg-green-100 text-green-800', label: 'Derivatives Created' };
    case 'published':
      return { color: 'bg-blue-100 text-blue-800', label: 'Published' };
    case 'discarded':
      return { color: 'bg-red-100 text-red-800', label: 'Discarded' };
    case 'needs_revision':
      return { color: 'bg-orange-100 text-orange-800', label: 'Needs Revision' };
    case 'needs_fix':
      return { color: 'bg-purple-100 text-purple-800', label: 'Needs Fix' };
    default:
      return { color: 'bg-gray-100 text-gray-800', label: status.charAt(0).toUpperCase() + status.slice(1) };
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
