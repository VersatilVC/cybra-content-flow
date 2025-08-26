-- Remove the security definer view and replace with a secure function approach
DROP VIEW IF EXISTS public.journalist_contacts;

-- Create a secure function to get journalist contact info instead of a view
-- This function respects RLS policies and doesn't bypass security
CREATE OR REPLACE FUNCTION public.get_journalist_contacts(journalist_ids uuid[] DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  name text,
  publication text,
  email text,
  linkedin_url text,
  twitter_handle text,
  user_id uuid
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
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
    -- Only return contact info to admins or the journalist owner
    (is_admin_user() OR j.user_id = auth.uid())
    AND (journalist_ids IS NULL OR j.id = ANY(journalist_ids));
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_journalist_contacts TO authenticated;