
import { ArrowRight, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface WorkflowStep {
  id: string;
  title: string;
  count: number;
  status: 'pending' | 'active' | 'completed';
  items?: {
    id: string;
    title: string;
    status: string;
    updatedAt: string;
  }[];
}

interface ContentWorkflowCardProps {
  title: string;
  steps: WorkflowStep[];
}

export function ContentWorkflowCard({ title, steps }: ContentWorkflowCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'needs_fix':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'needs_fix':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.status === 'completed' ? 'bg-green-100' :
                  step.status === 'active' ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  <span className={`text-sm font-medium ${
                    step.status === 'completed' ? 'text-green-600' :
                    step.status === 'active' ? 'text-purple-600' : 'text-gray-500'
                  }`}>
                    {step.count}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-px h-8 bg-gray-200 mt-2" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{step.title}</h4>
                  {step.count > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {step.count} items
                    </Badge>
                  )}
                </div>
                
                {step.items && step.items.length > 0 && (
                  <div className="space-y-2">
                    {step.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        {getStatusIcon(item.status)}
                        <span className="text-xs text-gray-700 flex-1 truncate">
                          {item.title}
                        </span>
                        <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                    {step.items.length > 3 && (
                      <Button variant="ghost" size="sm" className="w-full text-xs">
                        View {step.items.length - 3} more <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
