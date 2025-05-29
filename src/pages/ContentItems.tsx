
import { FileText, Eye, CheckCircle, AlertCircle } from "lucide-react";

const ContentItems = () => {
  const contentItems = [
    {
      id: 1,
      title: "The Future of AI in Cybersecurity",
      type: "Blog Post",
      audience: "Private Sector",
      status: "ready_for_review",
      lastModified: "2 hours ago",
      wordCount: 1250
    },
    {
      id: 2,
      title: "Government Compliance Best Practices",
      type: "Guide",
      audience: "Government Sector",
      status: "approved",
      lastModified: "1 day ago",
      wordCount: 3400
    },
    {
      id: 3,
      title: "Social Media Threat Landscape 2024",
      type: "Blog Post",
      audience: "Private Sector",
      status: "needs_revision",
      lastModified: "3 days ago",
      wordCount: 980
    }
  ];

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'ready_for_review':
        return { 
          color: 'bg-yellow-100 text-yellow-800',
          icon: AlertCircle,
          label: 'Ready for Review'
        };
      case 'approved':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          label: 'Approved'
        };
      case 'needs_revision':
        return {
          color: 'bg-red-100 text-red-800',
          icon: AlertCircle,
          label: 'Needs Revision'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: FileText,
          label: status
        };
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Items</h1>
          <p className="text-gray-600">Review and manage your generated content</p>
        </div>
        <div className="flex gap-3">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            <option>All Statuses</option>
            <option>Ready for Review</option>
            <option>Approved</option>
            <option>Needs Revision</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {contentItems.map((item) => {
          const statusInfo = getStatusInfo(item.status);
          const StatusIcon = statusInfo.icon;
          
          return (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span>Type: {item.type}</span>
                      <span>•</span>
                      <span>Audience: {item.audience}</span>
                      <span>•</span>
                      <span>{item.wordCount} words</span>
                      <span>•</span>
                      <span>Modified {item.lastModified}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIcon className="w-4 h-4" />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-3 py-1.5 text-purple-600 hover:text-purple-700 text-sm font-medium border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
                    <Eye className="w-4 h-4" />
                    Review
                  </button>
                  {item.status === 'approved' && (
                    <button className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
                      Publish
                    </button>
                  )}
                  {item.status === 'ready_for_review' && (
                    <>
                      <button className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
                        Approve
                      </button>
                      <button className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors">
                        Request Fix
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContentItems;
