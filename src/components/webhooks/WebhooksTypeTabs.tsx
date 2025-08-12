import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface TypeTabItem {
  value: string; // webhook type value
  label: string;
  count: number;
}

interface WebhooksTypeTabsProps {
  items: TypeTabItem[];
  selected: string; // 'all' or type value
  onChange: (value: string) => void;
}

export function WebhooksTypeTabs({ items, selected, onChange }: WebhooksTypeTabsProps) {
  return (
    <Tabs value={selected} onValueChange={onChange} className="w-full">
      <TabsList className={cn("w-full overflow-x-auto flex flex-nowrap justify-start gap-2")}> 
        <TabsTrigger value="all" className="shrink-0">
          All <span className="ml-2 rounded-full bg-muted px-2 text-xs">{items.reduce((a, b) => a + b.count, 0)}</span>
        </TabsTrigger>
        {items.map((it) => (
          <TabsTrigger key={it.value} value={it.value} className="capitalize shrink-0">
            {it.label}
            <span className="ml-2 rounded-full bg-muted px-2 text-xs">{it.count}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

export default WebhooksTypeTabs;
