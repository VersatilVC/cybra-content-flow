
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/LoadingSpinner';

interface SignupFormProps {
  onSubmit: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  isSubmitting: boolean;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSubmit, isSubmitting }) => {
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(
      signupData.email,
      signupData.password,
      signupData.firstName,
      signupData.lastName
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="signup-firstname">First Name</Label>
          <Input
            id="signup-firstname"
            type="text"
            placeholder="First name"
            value={signupData.firstName}
            onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-lastname">Last Name</Label>
          <Input
            id="signup-lastname"
            type="text"
            placeholder="Last name"
            value={signupData.lastName}
            onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="Enter your email"
          value={signupData.email}
          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          placeholder="Create a password"
          value={signupData.password}
          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : null}
        {isSubmitting ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
};
