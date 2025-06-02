
import { Upload, MessageSquare, Lightbulb, Briefcase, FileText, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AddIdeaModal from "@/components/AddIdeaModal";

const quickActions = [
  {
    title: "Update Knowledge Base",
    description: "Upload files or add URLs",
    icon: Upload,
    color: "bg-blue-100 text-blue-600",
    action: "upload"
  },
  {
    title: "Start AI Chat",
    description: "Chat with knowledge bases",
    icon: MessageSquare,
    color: "bg-green-100 text-green-600",
    action: "chat"
  },
  {
    title: "Generate Ideas",
    description: "Create new content ideas",
    icon: Lightbulb,
    color: "bg-yellow-100 text-yellow-600",
    action: "ideas"
  },
  {
    title: "Review Briefs",
    description: "Review pending briefs",
    icon: Briefcase,
    color: "bg-purple-100 text-purple-600",
    action: "briefs"
  },
  {
    title: "Review Content Items",
    description: "Review content items",
    icon: FileText,
    color: "bg-indigo-100 text-indigo-600",
    action: "content"
  }
];

export function QuickActions() {
  const [showIdeaModal, setShowIdeaModal] = useState(false);

  const handleActionClick = (action: string) => {
    switch (action) {
      case "upload":
        window.location.href = "/knowledge-bases";
        break;
      case "chat":
        window.location.href = "/chat";
        break;
      case "ideas":
        setShowIdeaModal(true);
        break;
      case "briefs":
        window.location.href = "/content-briefs?status=ready,draft";
        break;
      case "content":
        window.location.href = "/content-items?status=pending,needs_fix";
        break;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant="ghost"
                className="h-auto p-4 justify-start flex-row items-center space-x-3 hover:bg-gray-50"
                onClick={() => handleActionClick(action.action)}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-sm text-gray-900">{action.title}</div>
                  <div className="text-xs text-gray-500">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <AddIdeaModal
        isOpen={showIdeaModal}
        onClose={() => setShowIdeaModal(false)}
      />
    </>
  );
}
