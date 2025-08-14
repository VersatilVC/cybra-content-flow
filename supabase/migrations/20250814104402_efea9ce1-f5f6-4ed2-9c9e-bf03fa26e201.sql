-- Security Fix 1: Restrict approved_domains access to admin users only
-- Current policy allows all authenticated users to view approved domains,
-- which could reveal business relationships and partnership information

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view approved domains" ON public.approved_domains;

-- Create restrictive policy - only admins can view approved domains
CREATE POLICY "Admin users can view approved domains" 
ON public.approved_domains 
FOR SELECT 
USING (is_admin_user());

-- Create policy for domain validation during registration (system use)
-- This allows the handle_new_user function to check domain approval
CREATE POLICY "System can validate domains during registration" 
ON public.approved_domains 
FOR SELECT 
TO service_role
USING (true);