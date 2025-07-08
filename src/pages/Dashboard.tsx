import { 
  FileText, 
  Database
} from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StatsCard } from "@/components/StatsCard";
import { QuickActions } from "@/components/QuickActions";
import { RecentActivity } from "@/components/RecentActivity";
import { TodoSection } from "@/components/dashboard/TodoSection";
import AutoGenerationControls from "@/components/AutoGenerationControls";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-white">
      <DashboardHeader 
        title="Dashboard" 
        subtitle="Welcome back! Here's your content overview." 
      />
      
      <div className="px-6 pb-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
          {statsLoading ? (
            // Loading skeletons for stats cards
            [...Array(2)].map((_, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border-0 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            ))
          ) : (
            <>
              <StatsCard
                title="Total Content Items"
                value={stats?.totalContentItems || 0}
                description={`${stats?.pendingContentItems || 0} pending review`}
                icon={FileText}
              />
              <StatsCard
                title="Knowledge Base Items"
                value={stats?.knowledgeBaseItems || 0}
                description="Across all knowledge bases"
                icon={Database}
              />
            </>
          )}
        </div>

        {/* Auto Generation Controls */}
        <div className="max-w-6xl">
          <AutoGenerationControls />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl">
          {/* Todo Section - Takes up more space */}
          <div className="xl:col-span-2">
            <TodoSection />
          </div>

          {/* Quick Actions */}
          <div className="xl:col-span-1">
            <QuickActions />
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="max-w-7xl">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
