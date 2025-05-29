
import { Zap, Plus, CheckCircle, XCircle, Clock } from "lucide-react";

const Webhooks = () => {
  const webhooks = [
    {
      id: 1,
      name: "Knowledge Base Processing",
      endpoint: "/webhook/kb-process",
      status: "active",
      lastTriggered: "2 hours ago",
      successRate: "98.5%"
    },
    {
      id: 2,
      name: "AI Chat Response",
      endpoint: "/webhook/chat",
      status: "active",
      lastTriggered: "5 minutes ago",
      successRate: "99.2%"
    },
    {
      id: 3,
      name: "Content Generation",
      endpoint: "/webhook/generate-content",
      status: "inactive",
      lastTriggered: "1 day ago",
      successRate: "95.8%"
    },
    {
      id: 4,
      name: "WordPress Publishing",
      endpoint: "/webhook/publish-wordpress",
      status: "error",
      lastTriggered: "3 hours ago",
      successRate: "87.3%"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'inactive': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Webhooks</h1>
          <p className="text-gray-600">Manage N8N webhook integrations and monitor their status</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          Add Webhook
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Active</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">2</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Inactive</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">1</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Errors</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">1</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Total Calls</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">12.4k</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Webhook</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Endpoint</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Success Rate</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Last Triggered</th>
                <th className="text-right py-4 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {webhooks.map((webhook) => (
                <tr key={webhook.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="font-medium text-gray-900">{webhook.name}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{webhook.endpoint}</code>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(webhook.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(webhook.status)}`}>
                        {webhook.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-900">{webhook.successRate}</td>
                  <td className="py-4 px-6 text-gray-500">{webhook.lastTriggered}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex gap-2 justify-end">
                      <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                        Test
                      </button>
                      <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                        Logs
                      </button>
                      <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                        Disable
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Webhooks;
