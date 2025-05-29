
import { Lightbulb, Plus, Filter, FileText, Link as LinkIcon } from "lucide-react";

const ContentIdeas = () => {
  const ideas = [
    {
      id: 1,
      title: "The Future of AI in Cybersecurity",
      description: "Exploring how artificial intelligence is revolutionizing threat detection and response",
      contentType: "Blog Post",
      targetAudience: "Private Sector",
      status: "pending",
      createdAt: "2 hours ago"
    },
    {
      id: 2,
      title: "Government Compliance Best Practices",
      description: "A comprehensive guide to meeting regulatory requirements in government organizations",
      contentType: "Guide",
      targetAudience: "Government Sector",
      status: "approved",
      createdAt: "1 day ago"
    },
    {
      id: 3,
      title: "Social Media Threat Landscape 2024",
      description: "Analysis of emerging threats on social media platforms and mitigation strategies",
      contentType: "Blog Post",
      targetAudience: "Private Sector",
      status: "in_progress",
      createdAt: "3 days ago"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Ideas</h1>
          <p className="text-gray-600">Generate and manage content ideas for your marketing campaigns</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
            <FileText className="w-4 h-4" />
            Upload File
          </button>
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
            <LinkIcon className="w-4 h-4" />
            Add URL
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" />
            New Idea
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
          <option>All Content Types</option>
          <option>Blog Post</option>
          <option>Guide</option>
        </select>
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
          <option>All Audiences</option>
          <option>Private Sector</option>
          <option>Government Sector</option>
        </select>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4" />
          More Filters
        </button>
      </div>

      <div className="space-y-4">
        {ideas.map((idea) => (
          <div key={idea.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{idea.title}</h3>
                  <p className="text-gray-600 mb-3">{idea.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Type: {idea.contentType}</span>
                    <span>•</span>
                    <span>Audience: {idea.targetAudience}</span>
                    <span>•</span>
                    <span>{idea.createdAt}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(idea.status)}`}>
                  {idea.status.replace('_', ' ')}
                </span>
                <div className="flex gap-2">
                  <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                    Create Brief
                  </button>
                  <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                    Discard
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentIdeas;
