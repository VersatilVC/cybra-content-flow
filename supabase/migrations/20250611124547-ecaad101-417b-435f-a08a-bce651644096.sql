
-- First, let's check current RLS policies on feedback_submissions table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'feedback_submissions';

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can only see their own feedback" ON public.feedback_submissions;
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.feedback_submissions;
DROP POLICY IF EXISTS "Users can only view their own feedback" ON public.feedback_submissions;

-- Create a security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create new RLS policies that allow admins and super admins to see all feedback
CREATE POLICY "Admins and super admins can view all feedback, users can view their own" 
  ON public.feedback_submissions 
  FOR SELECT 
  USING (
    public.get_current_user_role() IN ('admin', 'super_admin') 
    OR submitter_id = auth.uid()
  );

CREATE POLICY "Admins and super admins can update all feedback, users can update their own" 
  ON public.feedback_submissions 
  FOR UPDATE 
  USING (
    public.get_current_user_role() IN ('admin', 'super_admin') 
    OR submitter_id = auth.uid()
  );

CREATE POLICY "Authenticated users can create feedback" 
  ON public.feedback_submissions 
  FOR INSERT 
  WITH CHECK (auth.uid() = submitter_id);

CREATE POLICY "Admins and super admins can delete all feedback" 
  ON public.feedback_submissions 
  FOR DELETE 
  USING (public.get_current_user_role() IN ('admin', 'super_admin'));
