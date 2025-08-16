-- Check and fix any remaining default ACL issues specifically for the profiles table
-- The scanner may be detecting old default ACLs that still grant broad access

-- Create a more restrictive default ACL for future tables if needed
-- But first, let's ensure the profiles table specifically has no unauthorized access

-- Remove any default grants that might still be affecting the profiles table
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;

-- Now specifically remove those grants from profiles since we want custom policies
REVOKE ALL ON public.profiles FROM service_role;

-- Ensure our policies are the only way service_role can access profiles
-- (The policies we created earlier are still in effect)

-- Also, let's be extra explicit about public access
REVOKE ALL ON public.profiles FROM public;
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM authenticated;

-- Grant only what authenticated users need (existing RLS policies will control access)
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Grant minimal access to anon (for registration purposes only, controlled by RLS)
GRANT INSERT ON public.profiles TO anon;