import { 
  FileText, 
  Lightbulb, 
  Database,
  TrendingUp
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white geometric-pattern">
      <DashboardHeader 
        title="Dashboard" 
        subtitle="Welcome back! Here's what's happening with your content." 
      />
      
      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsLoading ? (
            // Loading skeletons for stats cards
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-20" />
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
                trend={{ value: 12, label: "from last month" }}
              />
              <StatsCard
                title="Knowledge Base Items"
                value={stats?.knowledgeBaseItems || 0}
                description="Across all knowledge bases"
                icon={Database}
                trend={{ value: 8, label: "from last week" }}
              />
              <StatsCard
                title="Active Ideas"
                value={stats?.activeIdeas || 0}
                description="Ready for brief creation"
                icon={Lightbulb}
                trend={{ value: -3, label: "from last week" }}
              />
              <StatsCard
                title="Monthly Publications"
                value={stats?.monthlyPublications || 0}
                description="Content published this month"
                icon={TrendingUp}
                trend={{ value: 15, label: "from last month" }}
              />
            </>
          )}
        </div>

        {/* Auto Generation Controls */}
        <div className="grid grid-cols-1 gap-6">
          <AutoGenerationControls />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Todo Section */}
          <div className="lg:col-span-2">
            <TodoSection />
          </div>

          {/* Quick Actions */}
          <div>
            <QuickActions />
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 gap-6">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
