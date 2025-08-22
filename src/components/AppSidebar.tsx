
import { Sidebar } from "@/components/ui/sidebar";
import { SidebarHeader } from "@/components/sidebar/SidebarHeader";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";
import { SidebarFooter } from "@/components/sidebar/SidebarFooter";

export function AppSidebar() {
  return (
    <Sidebar className="border-r-0 overflow-x-hidden">
      <div className="flex h-full w-full flex-col overflow-x-hidden min-w-0">
        <SidebarHeader />
        <SidebarNavigation />
        <SidebarFooter />
      </div>
    </Sidebar>
  );
}
