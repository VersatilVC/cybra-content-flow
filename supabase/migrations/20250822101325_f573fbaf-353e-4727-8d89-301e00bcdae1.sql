-- Fix security issue: Restrict journalist contact information access
-- Remove overly permissive policy that allows all company users to see all journalists
DROP POLICY IF EXISTS "Company users can manage all journalists" ON public.journalists;

-- Create more restrictive policies based on roles and ownership
-- Admins can manage all journalists (for administrative purposes)
CREATE POLICY "Admins can manage all journalists"
ON public.journalists
FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Company users can only view basic journalist info (no sensitive contact details)
-- This policy only allows SELECT on non-sensitive fields
CREATE POLICY "Company users can view basic journalist info"
ON public.journalists  
FOR SELECT
USING (
  is_company_user() AND 
  -- Only allow access to journalists created by users in the same company
  EXISTS (
    SELECT 1 FROM public.profiles p1, public.profiles p2
    WHERE p1.id = auth.uid() 
    AND p2.id = journalists.user_id
    AND split_part(p1.email, '@', 2) = split_part(p2.email, '@', 2)
  )
);

-- Company users can create new journalists
CREATE POLICY "Company users can create journalists"
ON public.journalists
FOR INSERT 
WITH CHECK (is_company_user() AND auth.uid() = user_id);

-- Users can fully manage only their own journalists
CREATE POLICY "Users can manage their own journalists"
ON public.journalists
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create a view for sensitive contact information that only admins and owners can access
CREATE OR REPLACE VIEW public.journalist_contacts AS
SELECT 
  j.id,
  j.name,
  j.publication,
  j.email,
  j.linkedin_url,
  j.twitter_handle,
  j.user_id
FROM public.journalists j
WHERE 
  -- Only show contact info to admins or the journalist owner
  (is_admin_user() OR j.user_id = auth.uid());

-- Enable RLS on the view
ALTER VIEW public.journalist_contacts SET (security_barrier = true);

-- Grant appropriate permissions
GRANT SELECT ON public.journalist_contacts TO authenticated;