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
import { useOptimizedDashboardStats } from "@/hooks/useOptimizedDashboardStats";
import OptimizedLoadingSpinner from "@/components/performance/OptimizedLoadingSpinner";

const OptimizedDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useOptimizedDashboardStats();

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
            <OptimizedLoadingSpinner showSkeleton skeletonType="dashboard" />
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

export default OptimizedDashboard;