
import { useState, useEffect } from "react";
import {
  Calendar,
  Database,
  FileText,
  Home,
  Lightbulb,
  MessageSquare,
  Settings,
  Users,
  Zap,
  Briefcase,
  Bell,
  Bug,
  PenTool,
  Activity,
  ChevronDown,
  ChevronRight,
  Megaphone,
  UsersRound,
  Newspaper,
} from "lucide-react";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useLocation, Link } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useUnreadFeedbackCount } from "@/hooks/useFeedback";
import { SubmitFeedbackModal } from "@/components/feedback/SubmitFeedbackModal";
import { logger } from '@/utils/logger';

interface CategoryState {
  [key: string]: boolean;
}

const knowledgeBaseItems = [
  {
    title: "Knowledge Bases",
    url: "/knowledge-bases",
    icon: Database,
  },
  {
    title: "AI Chat",
    url: "/chat",
    icon: MessageSquare,
  },
];

const contentManagementItems = [
  {
    title: "Content Ideas",
    url: "/content-ideas",
    icon: Lightbulb,
  },
  {
    title: "Content Briefs",
    url: "/content-briefs",
    icon: Briefcase,
  },
  {
    title: "Content Items",
    url: "/content-items",
    icon: FileText,
  },
  {
    title: "General Content",
    url: "/general-content",
    icon: PenTool,
  },
];

const prManagementItems = [
  {
    title: "PR Pitches",
    url: "/pr-pitches",
    icon: Megaphone,
  },
  {
    title: "Journalists",
    url: "/journalists",
    icon: UsersRound,
  },
  {
    title: "Press Releases",
    url: "/press-releases",
    icon: Newspaper,
  },
];

const adminItems = [
  {
    title: "User Management",
    url: "/user-management",
    icon: Users,
  },
  {
    title: "Webhooks",
    url: "/webhooks",
    icon: Zap,
  },
  {
    title: "Production Dashboard",
    url: "/production-dashboard",
    icon: Activity,
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
  },
  {
    title: "Feedback Management",
    url: "/feedback-management",
    icon: Bug,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function SidebarNavigation() {
  const location = useLocation();
  const { profile, loading } = useProfile();
  const { data: unreadCount = 0 } = useUnreadFeedbackCount();
  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin';

  // Category state management with localStorage persistence
  const [categoryStates, setCategoryStates] = useState<CategoryState>(() => {
    const saved = localStorage.getItem('sidebar-category-states');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback to defaults if parsing fails
      }
    }
    return {
      knowledgeBase: true,
      contentManagement: true,
      prManagement: false,
      administration: false,
    };
  });

  // Persist category states to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-category-states', JSON.stringify(categoryStates));
  }, [categoryStates]);

  // Auto-expand categories based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    const newStates = { ...categoryStates };

    // Knowledge Base routes
    if (['/knowledge-bases', '/chat'].includes(currentPath)) {
      newStates.knowledgeBase = true;
    }
    // Content Management routes
    else if (['/content-ideas', '/content-briefs', '/content-items', '/general-content'].includes(currentPath)) {
      newStates.contentManagement = true;
    }
    // PR Management routes
    else if (['/pr-pitches', '/journalists', '/press-releases'].includes(currentPath)) {
      newStates.prManagement = true;
    }
    // Admin routes
    else if (['/user-management', '/webhooks', '/production-dashboard', '/notifications', '/feedback-management', '/settings'].includes(currentPath)) {
      newStates.administration = true;
    }

    setCategoryStates(newStates);
  }, [location.pathname]);

  const toggleCategory = (category: string) => {
    setCategoryStates(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const renderMenuItem = (item: any, showBadge = false) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton 
        asChild 
        isActive={location.pathname === item.url}
        className="text-white/90 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/15 data-[active=true]:text-white rounded-lg mx-2"
      >
        <Link to={item.url} className="flex items-center gap-3 px-3 py-2 relative min-w-0 w-full">
          <item.icon className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium truncate flex-1">{item.title}</span>
          {showBadge && item.title === "Feedback Management" && unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold flex-shrink-0">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  const renderCategoryHeader = (title: string, category: string, isOpen: boolean) => (
    <CollapsibleTrigger 
      onClick={() => toggleCategory(category)}
      className="flex items-center justify-between w-full p-2 mx-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-xs font-medium uppercase tracking-wider min-w-0"
    >
      <span className="truncate flex-1">{title}</span>
      {isOpen ? (
        <ChevronDown className="h-3 w-3 flex-shrink-0 ml-2" />
      ) : (
        <ChevronRight className="h-3 w-3 flex-shrink-0 ml-2" />
      )}
    </CollapsibleTrigger>
  );

  logger.info('SidebarNavigation render:', { 
    profile: profile ? { role: profile.role, email: profile.email } : null, 
    loading, 
    isAdmin,
    showAdminSection: !loading && isAdmin
  });

  return (
    <SidebarContent className="px-3 py-4 space-y-4 overflow-x-hidden overflow-y-auto">
      {/* Dashboard - Always visible at top */}
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                isActive={location.pathname === "/dashboard"}
                className="text-white/90 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/15 data-[active=true]:text-white rounded-lg mx-2"
              >
                <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 min-w-0 w-full">
                  <Home className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium truncate flex-1">Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Knowledge Base Category */}
      <Collapsible open={categoryStates.knowledgeBase} onOpenChange={(open) => setCategoryStates(prev => ({ ...prev, knowledgeBase: open }))}>
        <div className="space-y-2 overflow-hidden">
          {renderCategoryHeader("Knowledge Base", "knowledgeBase", categoryStates.knowledgeBase)}
          <CollapsibleContent className="space-y-1 overflow-hidden">
            <SidebarMenu>
              {knowledgeBaseItems.map(item => renderMenuItem(item))}
            </SidebarMenu>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Content Management Category */}
      <Collapsible open={categoryStates.contentManagement} onOpenChange={(open) => setCategoryStates(prev => ({ ...prev, contentManagement: open }))}>
        <div className="space-y-2 overflow-hidden">
          {renderCategoryHeader("Content Management", "contentManagement", categoryStates.contentManagement)}
          <CollapsibleContent className="space-y-1 overflow-hidden">
            <SidebarMenu>
              {contentManagementItems.map(item => renderMenuItem(item))}
            </SidebarMenu>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* PR Management Category */}
      <Collapsible open={categoryStates.prManagement} onOpenChange={(open) => setCategoryStates(prev => ({ ...prev, prManagement: open }))}>
        <div className="space-y-2 overflow-hidden">
          {renderCategoryHeader("PR Management", "prManagement", categoryStates.prManagement)}
          <CollapsibleContent className="space-y-1 overflow-hidden">
            <SidebarMenu>
              {prManagementItems.map(item => renderMenuItem(item))}
            </SidebarMenu>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Feedback Section - Available to All Users */}
      <SidebarGroup>
        <SidebarGroupLabel className="text-white/70 uppercase tracking-wider text-xs font-medium mb-2 mx-2 truncate">
          Feedback
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SubmitFeedbackModal>
                <SidebarMenuButton className="text-white/90 hover:text-white hover:bg-white/10 rounded-lg mx-2 justify-start min-w-0">
                  <div className="flex items-center gap-3 px-3 py-2 w-full min-w-0">
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium truncate flex-1">Submit Feedback</span>
                  </div>
                </SidebarMenuButton>
              </SubmitFeedbackModal>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Administration Category - Admin Only */}
      {!loading && isAdmin && (
        <Collapsible open={categoryStates.administration} onOpenChange={(open) => setCategoryStates(prev => ({ ...prev, administration: open }))}>
          <div className="space-y-2 overflow-hidden">
            {renderCategoryHeader("Administration", "administration", categoryStates.administration)}
            <CollapsibleContent className="space-y-1 overflow-hidden">
              <SidebarMenu>
                {adminItems.map(item => renderMenuItem(item, true))}
              </SidebarMenu>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}

      {loading && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/70 uppercase tracking-wider text-xs font-medium mb-2 mx-2 truncate">
            Loading permissions...
          </SidebarGroupLabel>
        </SidebarGroup>
      )}
    </SidebarContent>
  );
}
