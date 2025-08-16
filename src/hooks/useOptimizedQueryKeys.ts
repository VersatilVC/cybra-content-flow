import { useOptimizedAuth } from './useOptimizedAuth';

// Standardized cache keys for all React Query operations
export function useOptimizedQueryKeys() {
  const { user } = useOptimizedAuth();
  
  const createKey = (domain: string, params?: Record<string, any>) => {
    const baseKey: (string | Record<string, any>)[] = [domain, user?.id].filter(Boolean);
    if (params) {
      baseKey.push(params);
    }
    return baseKey;
  };

  return {
    // Dashboard related
    dashboardStats: () => createKey('dashboard-stats'),
    dashboardActivity: () => createKey('dashboard-activity'),
    dashboardTodos: () => createKey('dashboard-todos'),
    
    // Content Ideas
    contentIdeas: (params?: any) => createKey('content-ideas', params),
    contentIdea: (id: string) => createKey('content-idea', { id }),
    
    // Content Briefs
    contentBriefs: (params?: any) => createKey('content-briefs', params),
    contentBrief: (id: string) => createKey('content-brief', { id }),
    
    // Content Items
    contentItems: (params?: any) => createKey('content-items', params),
    contentItem: (id: string) => createKey('content-item', { id }),
    
    // Content Derivatives
    contentDerivatives: (contentItemId?: string) => createKey('content-derivatives', { contentItemId }),
    contentDerivative: (id: string) => createKey('content-derivative', { id }),
    
    // General Content
    generalContent: (params?: any) => createKey('general-content', params),
    generalContentItem: (id: string) => createKey('general-content-item', { id }),
    
    // PR Management
    journalists: (params?: any) => createKey('journalists', params),
    journalist: (id: string) => createKey('journalist', { id }),
    journalistArticles: (journalistId: string) => createKey('journalist-articles', { journalistId }),
    prCampaigns: (params?: any) => createKey('pr-campaigns', params),
    prPitches: (params?: any) => createKey('pr-pitches', params),
    
    // User & Profile
    profile: () => createKey('profile'),
    users: (params?: any) => createKey('users', params),
    
    // Notifications
    notifications: (params?: any) => createKey('notifications', params),
    
    // Chat
    chatSessions: () => createKey('chat-sessions'),
    chatMessages: (sessionId: string) => createKey('chat-messages', { sessionId }),
    
    // Feedback
    feedback: (params?: any) => createKey('feedback', params),
    
    // Webhooks
    webhooks: (params?: any) => createKey('webhooks', params),
    
    // Knowledge Base
    knowledgeBases: () => createKey('knowledge-bases'),
    knowledgeBaseData: (params?: any) => createKey('knowledge-base-data', params),
  };
}