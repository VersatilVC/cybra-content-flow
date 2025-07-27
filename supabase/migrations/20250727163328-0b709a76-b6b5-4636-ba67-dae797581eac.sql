-- Fix the is_company_user function to properly handle cyabra.com domain
CREATE OR REPLACE FUNCTION public.is_company_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
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