
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { webhookTypes } from './webhookTypes';
import LoadingSpinner from '@/components/LoadingSpinner';
import { secureStringSchema, secureUrlSchema, sanitizeText } from '@/lib/security';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface SecureWebhookFormFieldsProps {
  name: string;
  setName: (name: string) => void;
  webhookType: string;
  setWebhookType: (type: string) => void;
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  description: string;
  setDescription: (description: string) => void;
  isTestingWebhook: boolean;
  onTestWebhook: () => void;
}

export function SecureWebhookFormFields({
  name,
  setName,
  webhookType,
  setWebhookType,
  webhookUrl,
  setWebhookUrl,
  description,
  setDescription,
  isTestingWebhook,
  onTestWebhook
}: SecureWebhookFormFieldsProps) {
  const [urlValidation, setUrlValidation] = useState<{ isValid: boolean; message: string } | null>(null);
  const [nameValidation, setNameValidation] = useState<{ isValid: boolean; message: string } | null>(null);

  const handleNameChange = (value: string) => {
    const sanitized = sanitizeText(value);
    setName(sanitized);
    
    try {
      secureStringSchema.parse(sanitized);
      setNameValidation({ isValid: true, message: 'Valid name' });
    } catch (error) {
      setNameValidation({ 
        isValid: false, 
        message: error instanceof Error ? error.message : 'Invalid name' 
      });
    }
  };

  const handleUrlChange = (value: string) => {
    const sanitized = value.trim();
    setWebhookUrl(sanitized);
    
    if (!sanitized) {
      setUrlValidation(null);
      return;
    }
    
    try {
      secureUrlSchema.parse(sanitized);
      setUrlValidation({ isValid: true, message: 'Valid and secure URL' });
    } catch (error) {
      setUrlValidation({ 
        isValid: false, 
        message: error instanceof Error ? error.message : 'Invalid URL' 
      });
    }
  };

  const handleDescriptionChange = (value: string) => {
    const sanitized = sanitizeText(value);
    setDescription(sanitized);
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="webhook-name">Name *</Label>
        <Input
          id="webhook-name"
          placeholder="e.g., AI Chat Assistant"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className={nameValidation && !nameValidation.isValid ? 'border-red-500' : ''}
        />
        {nameValidation && (
          <div className={`flex items-center gap-2 text-sm ${
            nameValidation.isValid ? 'text-green-600' : 'text-red-600'
          }`}>
            {nameValidation.isValid ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            {nameValidation.message}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="webhook-type">Type *</Label>
        <Select value={webhookType} onValueChange={setWebhookType}>
          <SelectTrigger>
            <SelectValue placeholder="Select webhook type..." />
          </SelectTrigger>
          <SelectContent>
            {webhookTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  <type.icon className="w-4 h-4" />
                  {type.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="webhook-url">Webhook URL *</Label>
        <div className="flex gap-2">
          <div className="flex-1 space-y-2">
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://your-n8n-instance.com/webhook/..."
              value={webhookUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              className={urlValidation && !urlValidation.isValid ? 'border-red-500' : ''}
            />
            {urlValidation && (
              <div className={`flex items-center gap-2 text-sm ${
                urlValidation.isValid ? 'text-green-600' : 'text-red-600'
              }`}>
                {urlValidation.isValid ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                {urlValidation.message}
              </div>
            )}
          </div>
          <Button
            variant="outline"
            onClick={onTestWebhook}
            disabled={!webhookUrl || isTestingWebhook || (urlValidation && !urlValidation.isValid)}
          >
            {isTestingWebhook ? (
              <LoadingSpinner size="sm" />
            ) : (
              'Test'
            )}
          </Button>
        </div>
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Notice:</strong> Only use trusted webhook URLs. The system validates URLs to prevent SSRF attacks and blocks local/private network addresses.
          </AlertDescription>
        </Alert>
        
        <p className="text-xs text-gray-500">
          Copy your N8N webhook URL here. The webhook will receive POST requests with content data.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="webhook-description">Description</Label>
        <Textarea
          id="webhook-description"
          placeholder="Optional description of what this webhook does..."
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          rows={3}
        />
      </div>
    </>
  );
}
