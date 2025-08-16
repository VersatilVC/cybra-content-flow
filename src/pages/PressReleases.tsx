import { DashboardHeader } from "@/components/DashboardHeader";

const PressReleases = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-white">
      <DashboardHeader 
        title="Press Releases" 
        subtitle="Create, publish, and manage your press releases" 
      />
      
      <div className="px-6 pb-8 space-y-8">
        <div className="max-w-4xl">
          <div className="bg-white rounded-lg border p-8 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Press Release Management
            </h3>
            <p className="text-muted-foreground">
              Create professional press releases, track distribution, and measure media coverage impact.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PressReleases;