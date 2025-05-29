
import { 
  Brain, 
  FileText, 
  Lightbulb, 
  Database,
  Calendar,
  Users,
  MessageSquare,
  TrendingUp
} from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StatsCard } from "@/components/StatsCard";
import { ContentWorkflowCard } from "@/components/ContentWorkflowCard";
import { QuickActions } from "@/components/QuickActions";
import { RecentActivity } from "@/components/RecentActivity";

const Dashboard = () => {
  const workflowData = [
    {
      id: 'ideas',
      title: 'Content Ideas',
      count: 12,
      status: 'active' as const,
      items: [
        { id: '1', title: 'AI Detection in Financial Services', status: 'pending', updatedAt: '2 hours ago' },
        { id: '2', title: 'Government Cybersecurity Trends', status: 'approved', updatedAt: '4 hours ago' },
        { id: '3', title: 'Private Sector Threat Analysis', status: 'needs_fix', updatedAt: '1 day ago' },
      ]
    },
    {
      id: 'briefs',
      title: 'Content Briefs',
      count: 8,
      status: 'active' as const,
      items: [
        { id: '1', title: 'Enterprise Security Solutions Brief', status: 'pending', updatedAt: '1 hour ago' },
        { id: '2', title: 'Social Media Manipulation Guide', status: 'approved', updatedAt: '3 hours ago' },
      ]
    },
    {
      id: 'content',
      title: 'Content Items',
      count: 15,
      status: 'active' as const,
      items: [
        { id: '1', title: 'Complete Guide to AI Detection', status: 'pending', updatedAt: '30 minutes ago' },
        { id: '2', title: 'Government Sector Security Best Practices', status: 'approved', updatedAt: '2 hours ago' },
        { id: '3', title: 'Private Sector Threat Landscape', status: 'needs_fix', updatedAt: '5 hours ago' },
      ]
    },
    {
      id: 'published',
      title: 'Published',
      count: 23,
      status: 'completed' as const,
      items: []
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white geometric-pattern">
      <DashboardHeader 
        title="Dashboard" 
        subtitle="Welcome back! Here's what's happening with your content." 
      />
      
      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Content Items"
            value={58}
            description="15 pending review"
            icon={FileText}
            trend={{ value: 12, label: "from last month" }}
          />
          <StatsCard
            title="Knowledge Base Items"
            value={234}
            description="Across 4 knowledge bases"
            icon={Database}
            trend={{ value: 8, label: "from last week" }}
          />
          <StatsCard
            title="Active Ideas"
            value={12}
            description="8 ready for brief creation"
            icon={Lightbulb}
            trend={{ value: -3, label: "from last week" }}
          />
          <StatsCard
            title="Monthly Publications"
            value={23}
            description="Content published this month"
            icon={TrendingUp}
            trend={{ value: 15, label: "from last month" }}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Content Workflow */}
          <div className="lg:col-span-2">
            <ContentWorkflowCard
              title="Content Workflow Status"
              steps={workflowData}
            />
          </div>

          {/* Quick Actions */}
          <div>
            <QuickActions />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <RecentActivity />

          {/* Additional Stats */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <StatsCard
                title="AI Chat Sessions"
                value={45}
                description="This week"
                icon={MessageSquare}
              />
              <StatsCard
                title="Team Members"
                value={8}
                description="Active users"
                icon={Users}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StatsCard
                title="Scheduled Content"
                value={12}
                description="Next 7 days"
                icon={Calendar}
              />
              <StatsCard
                title="Processing"
                value={3}
                description="N8N workflows running"
                icon={Brain}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
