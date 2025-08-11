-- Fix database function security by adding proper search_path settings
-- This prevents potential privilege escalation attacks

-- Fix is_domain_approved function
CREATE OR REPLACE FUNCTION public.is_domain_approved(email_address text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  domain_part TEXT;
BEGIN
  -- Extract domain from email
  domain_part := split_part(email_address, '@', 2);
  
  -- Check if domain exists in approved_domains
  RETURN EXISTS (
    SELECT 1 FROM public.approved_domains 
    WHERE domain = domain_part
  );
END;
$$;

-- Fix get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- Fix is_admin_user function  
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (SELECT role IN ('admin', 'super_admin') FROM public.profiles WHERE id = auth.uid());
END;
$$;

-- Fix is_company_user function
CREATE OR REPLACE FUNCTION public.is_company_user()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_email TEXT;
  domain_part TEXT;
BEGIN
  -- Get the current user's email from profiles
  SELECT email INTO user_email
  FROM public.profiles
  WHERE id = auth.uid();
  
  -- If no email found, return false
  IF user_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Extract domain from email
  domain_part := split_part(user_email, '@', 2);
  
  -- Check if domain is either cyabra.com or versatil.vc
  RETURN domain_part IN ('cyabra.com', 'versatil.vc');
END;
$$;