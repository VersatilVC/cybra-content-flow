
import { Sidebar } from "@/components/ui/sidebar";
import { SidebarHeader } from "@/components/sidebar/SidebarHeader";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";
import { SidebarFooter } from "@/components/sidebar/SidebarFooter";

export function AppSidebar() {
  return (
    <Sidebar className="border-r-0">
      <div className="flex h-full w-full flex-col overflow-x-hidden">
        <SidebarHeader />
        <SidebarNavigation />
        <SidebarFooter />
      </div>
    </Sidebar>
  );
}
