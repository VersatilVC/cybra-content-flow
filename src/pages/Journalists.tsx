import { DashboardHeader } from "@/components/DashboardHeader";

const Journalists = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-white">
      <DashboardHeader 
        title="Journalists" 
        subtitle="Manage your journalist contacts and media relationships" 
      />
      
      <div className="px-6 pb-8 space-y-8">
        <div className="max-w-4xl">
          <div className="bg-white rounded-lg border p-8 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Journalist Database
            </h3>
            <p className="text-muted-foreground">
              Build and maintain relationships with journalists, track contacts, and manage your media outreach.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journalists;