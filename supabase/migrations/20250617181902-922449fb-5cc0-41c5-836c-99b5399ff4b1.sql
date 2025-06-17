
-- First, create an audit table to track account linking events
CREATE TABLE public.account_linking_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_auth_id UUID NOT NULL,
  linked_auth_id UUID NOT NULL,
  profile_id UUID NOT NULL REFERENCES public.profiles(id),
  linking_method TEXT NOT NULL, -- e.g., 'email_to_google', 'google_to_email'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on the audit table
ALTER TABLE public.account_linking_audit ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view audit logs
CREATE POLICY "Admins can view account linking audit" 
  ON public.account_linking_audit 
  FOR SELECT 
  USING (public.is_admin_user());

-- Update the handle_new_user function to implement account linking
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  existing_profile_id UUID;
  linking_method TEXT;
BEGIN
  -- Check if email domain is approved
  IF NOT public.is_domain_approved(NEW.email) THEN
    RAISE EXCEPTION 'Email domain not approved for registration';
  END IF;
  
  -- Check if a profile already exists with this email
  SELECT id INTO existing_profile_id 
  FROM public.profiles 
  WHERE email = NEW.email;
  
  IF existing_profile_id IS NOT NULL THEN
    -- Account linking scenario: profile exists, link this auth record to existing profile
    
    -- Determine linking method based on auth providers
    IF NEW.raw_app_meta_data ? 'provider' AND NEW.raw_app_meta_data ->> 'provider' = 'google' THEN
      linking_method := 'email_to_google';
    ELSE
      linking_method := 'google_to_email';
    END IF;
    
    -- Update the existing profile's updated_at timestamp to indicate recent activity
    UPDATE public.profiles 
    SET updated_at = now(),
        last_active = now()
    WHERE id = existing_profile_id;
    
    -- Log the account linking event
    INSERT INTO public.account_linking_audit (
      original_auth_id, 
      linked_auth_id, 
      profile_id, 
      linking_method
    ) VALUES (
      existing_profile_id, -- The existing profile's auth ID
      NEW.id, -- The new auth record being linked
      existing_profile_id,
      linking_method
    );
    
    -- Note: We don't create a new profile record since one already exists
    -- The auth.users record will be linked to the existing profile via matching email
    
  ELSE
    -- New user scenario: create new profile
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data ->> 'first_name', NEW.raw_user_meta_data ->> 'given_name', split_part(NEW.raw_user_meta_data ->> 'full_name', ' ', 1)),
      COALESCE(NEW.raw_user_meta_data ->> 'last_name', NEW.raw_user_meta_data ->> 'family_name', split_part(NEW.raw_user_meta_data ->> 'full_name', ' ', 2))
    );
  END IF;
  
  RETURN NEW;
END;
$$;
