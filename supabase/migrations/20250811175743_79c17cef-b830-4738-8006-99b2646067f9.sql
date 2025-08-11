-- Fix remaining database functions missing search_path settings
-- These are the remaining functions identified by the linter

-- Fix handle_updated_at function (utility function)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_chat_session_updated_at function
CREATE OR REPLACE FUNCTION public.update_chat_session_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.chat_sessions 
  SET updated_at = now() 
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$;

-- Fix update_content_suggestions_updated_at function
CREATE OR REPLACE FUNCTION public.update_content_suggestions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix handle_new_user function (ensure it has proper search_path)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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