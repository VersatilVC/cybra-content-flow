-- Remove the overly permissive policy from approved_domains
DROP POLICY IF EXISTS "System can validate domains during registration" ON public.approved_domains;

-- Create a secure domain validation function that doesn't expose the full table
CREATE OR REPLACE FUNCTION public.validate_email_domain(email_address text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  domain_part text;
BEGIN
  -- Extract domain from email
  domain_part := split_part(email_address, '@', 2);
  
  -- Check if domain exists in approved_domains
  -- This function runs with definer rights, so it can access approved_domains
  -- even though regular users cannot
  RETURN EXISTS (
    SELECT 1 FROM public.approved_domains 
    WHERE domain = domain_part
  );
END;
$$;

-- Update the existing is_domain_approved function to use the new secure approach
CREATE OR REPLACE FUNCTION public.is_domain_approved(email_address text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Use the new secure validation function
  RETURN public.validate_email_domain(email_address);
END;
$$;

-- Create a policy that allows the system to validate domains during registration
-- but only through the secure function, not direct table access
CREATE POLICY "Service role can read approved domains for validation"
ON public.approved_domains
FOR SELECT
TO service_role
USING (true);

-- Ensure that only authenticated service operations can validate domains
-- This prevents public enumeration of approved domains
GRANT EXECUTE ON FUNCTION public.validate_email_domain(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_domain_approved(text) TO authenticated;