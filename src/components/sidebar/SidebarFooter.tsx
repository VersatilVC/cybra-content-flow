
import { LogOut } from "lucide-react";
import { SidebarFooter as UISidebarFooter } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

export function SidebarFooter() {
  const { signOut, user } = useAuth();
  const { profile, loading } = useProfile();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading state while profile is being fetched
  if (loading) {
    return (
      <UISidebarFooter className="border-t border-sidebar-border/50 p-4">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">...</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm">Loading...</p>
          </div>
        </div>
      </UISidebarFooter>
    );
  }

  // Determine display name and email
  const displayName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : profile?.email || user?.email || 'User';
    
  const displayEmail = profile?.email || user?.email;
  const initials = profile?.first_name?.[0] || displayEmail?.[0]?.toUpperCase() || 'U';

  console.log('SidebarFooter render:', { profile, user, displayName, displayEmail });

  return (
    <UISidebarFooter className="border-t border-sidebar-border/50 p-4">
      <div className="flex items-center gap-3 px-2 py-2">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {initials}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">
            {displayName}
          </p>
          <p className="text-white/70 text-xs truncate">{displayEmail}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </UISidebarFooter>
  );
}
