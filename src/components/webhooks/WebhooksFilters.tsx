import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface WebhooksFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: "all" | "active" | "inactive";
  onStatusChange: (v: "all" | "active" | "inactive") => void;
  sort: "updated_desc" | "updated_asc" | "created_desc" | "created_asc" | "name_asc";
  onSortChange: (v: WebhooksFiltersProps["sort"]) => void;
}

export function WebhooksFilters({ search, onSearchChange, status, onStatusChange, sort, onSortChange }: WebhooksFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-3 md:items-end">
      <div className="flex-1">
        <Label htmlFor="webhooks-search" className="mb-1 block">Search</Label>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="webhooks-search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, URL, or description"
            className="pl-8"
          />
        </div>
      </div>

      <div className="w-full md:w-44">
        <Label className="mb-1 block">Status</Label>
        <Select value={status} onValueChange={(v) => onStatusChange(v as any)}>
          <SelectTrigger>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className={cn("z-50 bg-background")}> 
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full md:w-56">
        <Label className="mb-1 block">Sort by</Label>
        <Select value={sort} onValueChange={(v) => onSortChange(v as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Updated (newest)" />
          </SelectTrigger>
          <SelectContent className={cn("z-50 bg-background")}> 
            <SelectItem value="updated_desc">Updated (newest)</SelectItem>
            <SelectItem value="updated_asc">Updated (oldest)</SelectItem>
            <SelectItem value="created_desc">Created (newest)</SelectItem>
            <SelectItem value="created_asc">Created (oldest)</SelectItem>
            <SelectItem value="name_asc">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default WebhooksFilters;
