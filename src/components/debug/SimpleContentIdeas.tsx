import React from 'react';
import { logger } from '@/utils/logger';

// Minimal Content Ideas component for debugging
export default function SimpleContentIdeas() {
  logger.info('🔍 SimpleContentIdeas component rendering');

  React.useEffect(() => {
    logger.info('🔍 SimpleContentIdeas component mounted');
    return () => {
      logger.info('🔍 SimpleContentIdeas component unmounting');
    };
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        <strong>✅ Content Ideas Route Working!</strong>
        <p className="mt-2">This is a simplified version of the Content Ideas page for debugging purposes.</p>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Ideas (Debug Mode)</h1>
        <p className="text-gray-600">
          If you can see this page, the routing is working. The issue was likely in the full ContentIdeas component.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900">Next Steps:</h3>
          <ul className="list-disc list-inside text-blue-800 mt-2 space-y-1">
            <li>Check browser console for detailed logs</li>
            <li>If this renders successfully, the issue is in the ContentIdeas component</li>
            <li>If this fails, the issue is in authentication or routing</li>
          </ul>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-900">Debug Information:</h3>
          <ul className="list-disc list-inside text-yellow-800 mt-2 space-y-1">
            <li>Route: /content-ideas</li>
            <li>Component: SimpleContentIdeas (debug version)</li>
            <li>Authentication: Should be checked by OptimizedProtectedRoute</li>
            <li>Layout: Wrapped in AppLayout</li>
          </ul>
        </div>
      </div>
    </div>
  );
}