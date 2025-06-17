
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AccountLinkingEvent {
  id: string;
  linking_method: string;
  created_at: string;
}

export function useAccountLinking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasCheckedLinking, setHasCheckedLinking] = useState(false);

  useEffect(() => {
    if (!user || hasCheckedLinking) return;

    const checkForRecentLinking = async () => {
      try {
        console.log('AccountLinking: Checking for recent account linking for user:', user.id);
        console.log('AccountLinking: User email:', user.email);
        console.log('AccountLinking: User providers:', user.app_metadata?.providers);
        
        // Check if this user was recently linked (within last 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        
        const { data: linkingEvents, error } = await supabase
          .from('account_linking_audit')
          .select('id, linking_method, created_at')
          .eq('linked_auth_id', user.id)
          .gte('created_at', fiveMinutesAgo)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('AccountLinking: Error checking account linking:', error);
          return;
        }

        console.log('AccountLinking: Query results:', linkingEvents);

        if (linkingEvents && linkingEvents.length > 0) {
          const linkingEvent = linkingEvents[0];
          const isGoogleLink = linkingEvent.linking_method === 'email_to_google';
          
          console.log('AccountLinking: Found recent linking event:', linkingEvent);
          
          toast({
            title: 'Accounts Successfully Linked!',
            description: isGoogleLink 
              ? 'Your Google account has been linked to your existing profile. You can now sign in using either method.'
              : 'Your email/password account has been linked to your existing Google profile.',
          });
        } else {
          console.log('AccountLinking: No recent linking events found');
        }
      } catch (error) {
        console.error('AccountLinking: Error in account linking check:', error);
      } finally {
        setHasCheckedLinking(true);
      }
    };

    checkForRecentLinking();
  }, [user, hasCheckedLinking, toast]);

  return { hasCheckedLinking };
}
