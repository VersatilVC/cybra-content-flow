
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  className = ""
}: StatsCardProps) {
  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white/80 backdrop-blur-sm ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground/80 group-hover:text-muted-foreground transition-colors">
          {title}
        </CardTitle>
        {Icon && (
          <div className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
      </CardHeader>
      <CardContent className="pb-6">
        <div className="text-3xl font-bold text-foreground mb-2">{value}</div>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-3 pt-3 border-t border-border/50">
            <span className={`text-sm font-medium ${
              trend.value >= 0 ? 'text-emerald-600' : 'text-red-500'
            }`}>
              {trend.value >= 0 ? '+' : ''}{trend.value}%
            </span>
            <span className="text-sm text-muted-foreground ml-2">
              {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
