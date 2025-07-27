
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
import { useLocation, Link } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useUnreadFeedbackCount } from "@/hooks/useFeedback";
import { SubmitFeedbackModal } from "@/components/feedback/SubmitFeedbackModal";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
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

  console.log('SidebarNavigation render:', { 
    profile: profile ? { role: profile.role, email: profile.email } : null, 
    loading, 
    isAdmin,
    showAdminSection: !loading && isAdmin
  });

  return (
    <SidebarContent className="px-3 py-4">
      <SidebarGroup>
        <SidebarGroupLabel className="text-white/70 uppercase tracking-wider text-xs font-medium mb-2">
          Content Management
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === item.url}
                  className="text-white/90 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/15 data-[active=true]:text-white rounded-lg"
                >
                  <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                    <item.icon className="w-4 h-4" />
                     <span className="font-medium">{item.title}</span>
                     {item.title === "Feedback Management" && unreadCount > 0 && (
                       <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                         {unreadCount > 99 ? '99+' : unreadCount}
                       </span>
                     )}
                   </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Feedback Section - Available to All Users */}
      <SidebarGroup className="mt-6">
        <SidebarGroupLabel className="text-white/70 uppercase tracking-wider text-xs font-medium mb-2">
          Feedback
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SubmitFeedbackModal>
                <SidebarMenuButton className="text-white/90 hover:text-white hover:bg-white/10 rounded-lg w-full justify-start">
                  <div className="flex items-center gap-3 px-3 py-2 w-full">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-medium">Submit Feedback</span>
                  </div>
                </SidebarMenuButton>
              </SubmitFeedbackModal>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {!loading && isAdmin && (
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-white/70 uppercase tracking-wider text-xs font-medium mb-2">
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="text-white/90 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/15 data-[active=true]:text-white rounded-lg"
                  >
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2 relative">
                      <item.icon className="w-4 h-4" />
                       <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {loading && (
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-white/70 uppercase tracking-wider text-xs font-medium mb-2">
            Loading permissions...
          </SidebarGroupLabel>
        </SidebarGroup>
      )}
    </SidebarContent>
  );
}
