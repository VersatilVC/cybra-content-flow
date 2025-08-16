import { DashboardHeader } from "@/components/DashboardHeader";

const PRPitches = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-white">
      <DashboardHeader 
        title="PR Pitches" 
        subtitle="Manage and track your PR pitches and outreach campaigns" 
      />
      
      <div className="px-6 pb-8 space-y-8">
        <div className="max-w-4xl">
          <div className="bg-white rounded-lg border p-8 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              PR Pitches Management
            </h3>
            <p className="text-muted-foreground">
              This page will help you create, manage, and track your PR pitches to journalists and media outlets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PRPitches;