-- ===================================================================
-- AUTHENTICATION AND DOMAIN VALIDATION FUNCTIONS
-- Version: 2.0.0-security-hardened  
-- Date: 2025-07-09
-- Target: Clean Production Environment
-- ===================================================================

-- DOMAIN VALIDATION FUNCTIONS
-- ===================================================================

CREATE OR REPLACE FUNCTION public.is_domain_approved(email_address TEXT)
RETURNS BOOLEAN
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

-- USER ROLE AND PERMISSION FUNCTIONS  
-- ===================================================================

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (SELECT role IN ('admin', 'super_admin') FROM public.profiles WHERE id = auth.uid());
END;
$$;

CREATE OR REPLACE FUNCTION public.is_company_user()
RETURNS BOOLEAN
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