
import React from 'react';
import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const AccountLinkingInfo: React.FC = () => {
  return (
    <Alert className="mb-4">
      <Info className="h-4 w-4" />
      <AlertDescription className="text-sm">
        <strong>Account Linking:</strong> If you have an existing account with the same email, 
        your accounts will be automatically linked. You can then use either sign-in method to access your data.
      </AlertDescription>
    </Alert>
  );
};
