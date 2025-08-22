-- ===================================================================
-- SECURITY FIX: Restrict Service Role Access to Profiles Table
-- ===================================================================

-- Drop the overly permissive service role policies
DROP POLICY IF EXISTS "Service role can read profiles for system operations" ON public.profiles;
DROP POLICY IF EXISTS "Service role can update profiles for system operations" ON public.profiles;

-- Create more restrictive service role policies
CREATE POLICY "Service role can read specific profiles for auth operations"
ON public.profiles
FOR SELECT
USING (
  -- Allow service role to read profiles only during authentication flows
  -- or when specifically needed for account linking operations
  auth.role() = 'service_role' AND (
    -- Allow reading during new user registration
    current_setting('app.operation_type', true) = 'user_registration' OR
    -- Allow reading for account linking validation
    current_setting('app.operation_type', true) = 'account_linking' OR
    -- Allow reading specific profile by ID for system operations
    (current_setting('app.target_user_id', true) IS NOT NULL AND 
     id::text = current_setting('app.target_user_id', true))
  )
);

CREATE POLICY "Service role can update profiles during registration and linking"
ON public.profiles  
FOR UPDATE
USING (
  auth.role() = 'service_role' AND (
    current_setting('app.operation_type', true) = 'user_registration' OR
    current_setting('app.operation_type', true) = 'account_linking' OR
    (current_setting('app.target_user_id', true) IS NOT NULL AND 
     id::text = current_setting('app.target_user_id', true))
  )
)
WITH CHECK (
  auth.role() = 'service_role' AND (
    current_setting('app.operation_type', true) = 'user_registration' OR
    current_setting('app.operation_type', true) = 'account_linking' OR
    (current_setting('app.target_user_id', true) IS NOT NULL AND 
     id::text = current_setting('app.target_user_id', true))
  )
);

-- Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  operation_type text NOT NULL,
  user_id uuid,
  accessed_at timestamptz NOT NULL DEFAULT now(),
  context_info jsonb
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can read audit logs"
ON public.audit_log
FOR SELECT
USING (is_admin_user());

-- Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
ON public.audit_log
FOR INSERT
WITH CHECK (auth.role() = 'service_role');