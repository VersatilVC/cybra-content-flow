
-- Fix notification system RLS policies
-- Add service role policies to allow edge functions to create notifications

-- Allow service role to insert notifications
CREATE POLICY "Service role can insert notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);

-- Allow service role to read notifications for validation
CREATE POLICY "Service role can read notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (true);

-- Allow service role to update notifications (for marking as read, etc.)
CREATE POLICY "Service role can update notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (true);
