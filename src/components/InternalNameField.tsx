import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { generateInternalName } from "@/utils/internalNameGenerator";

interface InternalNameFieldProps {
  value: string;
  onChange: (value: string) => void;
  title: string;
  contentType?: string;
  targetAudience?: string;
  derivativeType?: string;
  category?: string;
  disabled?: boolean;
  required?: boolean;
}

export const InternalNameField: React.FC<InternalNameFieldProps> = ({
  value,
  onChange,
  title,
  contentType,
  targetAudience,
  derivativeType,
  category,
  disabled = false,
  required = false
}) => {
  const handleUseTitle = () => {
    const { sanitizeTitle } = require('@/utils/titleBasedNaming');
    const generated = sanitizeTitle(title);
    onChange(generated);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="internal_name" className="text-sm font-medium">
        Internal Name {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="flex gap-2">
        <Input
          id="internal_name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., My Blog Post About Cybersecurity"
          disabled={disabled}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUseTitle}
          disabled={disabled || !title}
          className="flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          Use Title
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Based on your title, this name will be used throughout the entire content workflow for easy tracking.
      </p>
    </div>
  );
};