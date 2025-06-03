
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
    title: "Content Calendar",
    url: "/content-calendar",
    icon: Calendar,
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
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
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function SidebarNavigation() {
  const location = useLocation();
  const { profile, loading } = useProfile();
  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin';

  console.log('SidebarNavigation render:', { profile, loading, isAdmin });

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
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {isAdmin && (
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
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
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
    </SidebarContent>
  );
}
