-- Fix the public access vulnerability in notifications table
-- Remove overly permissive service role policies that allow unauthenticated access

-- Drop the problematic service role policies that allow unrestricted access
DROP POLICY IF EXISTS "Service role can read notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications; 
DROP POLICY IF EXISTS "Service role can update notifications" ON public.notifications;

-- Create secure service role policies that bypass RLS only for the service role key
-- These policies will only apply when using the service role key, not for public access
CREATE POLICY "Service role can manage notifications for system operations" 
ON public.notifications 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Ensure we have a comprehensive user access policy for SELECT
-- This was already created but making sure it exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Users can view their own notifications' 
        AND polrelid = 'public.notifications'::regclass
    ) THEN
        CREATE POLICY "Users can view their own notifications" 
        ON public.notifications 
        FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;
END
$$;