import { Brain } from "lucide-react";
import { SidebarHeader as UISidebarHeader } from "@/components/ui/sidebar";
import { useState } from "react";
import { NotificationCenter } from "@/components/NotificationCenter";
export function SidebarHeader() {
  const [logoError, setLogoError] = useState(false);
  const handleLogoError = () => {
    console.log("Logo failed to load, switching to fallback");
    setLogoError(true);
  };
  return <UISidebarHeader className="border-b border-sidebar-border/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            {!logoError ? <img src="/lovable-uploads/587a1505-0f54-4162-ba43-eff1c5c1287a.png" alt="Marko Logo" className="w-10 h-10 object-contain" onError={handleLogoError} onLoad={() => console.log("Logo loaded successfully")} /> : <Brain className="w-8 h-8 text-white" />}
          </div>
          <div>
            <h2 className="font-semibold text-white text-lg">Marko</h2>
            <p className="text-xs text-white/70"></p>
          </div>
        </div>
        <NotificationCenter />
      </div>
    </UISidebarHeader>;
}