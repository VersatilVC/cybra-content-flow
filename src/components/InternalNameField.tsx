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
  const handleGenerateInternal = () => {
    const generated = generateInternalName(
      title,
      contentType,
      targetAudience,
      derivativeType,
      category
    );
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
          placeholder="e.g., BLOG_CYBERSEC_GUIDE_1224"
          disabled={disabled}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGenerateInternal}
          disabled={disabled || !title}
          className="flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          Generate
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        A unique identifier for easy tracking across all content stages. Auto-generated if left empty.
      </p>
    </div>
  );
};