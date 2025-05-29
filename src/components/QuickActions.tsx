
import { Plus, Upload, Link, Brain, Calendar, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const quickActions = [
  {
    title: "Add to Knowledge Base",
    description: "Upload files or add URLs",
    icon: Upload,
    color: "bg-blue-100 text-blue-600",
    href: "/knowledge-bases"
  },
  {
    title: "Generate Ideas",
    description: "Create new content ideas",
    icon: Brain,
    color: "bg-purple-100 text-purple-600",
    href: "/ideas"
  },
  {
    title: "Start AI Chat",
    description: "Chat with knowledge bases",
    icon: Link,
    color: "bg-green-100 text-green-600",
    href: "/chat"
  },
  {
    title: "Schedule Content",
    description: "Plan content publication",
    icon: Calendar,
    color: "bg-orange-100 text-orange-600",
    href: "/calendar"
  },
  {
    title: "Create Content",
    description: "Manual content creation",
    icon: FileText,
    color: "bg-indigo-100 text-indigo-600",
    href: "/content"
  },
  {
    title: "Review Items",
    description: "Review pending content",
    icon: Plus,
    color: "bg-pink-100 text-pink-600",
    href: "/content?status=pending"
  }
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.title}
              variant="ghost"
              className="h-auto p-4 justify-start flex-col items-start space-y-2 hover:bg-gray-50"
              asChild
            >
              <a href={action.href}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color}`}>
                  <action.icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm text-gray-900">{action.title}</div>
                  <div className="text-xs text-gray-500">{action.description}</div>
                </div>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
