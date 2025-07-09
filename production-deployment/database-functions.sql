-- ===================================================================
-- PRODUCTION DATABASE FUNCTIONS
-- Version: 2.0.0-security-hardened  
-- Date: 2025-07-06
-- Target: Clean Production Environment
-- ===================================================================

-- Note: Run this AFTER running database-rls-policies.sql
-- This will create all database functions, triggers, and utilities

-- ===================================================================
-- DOMAIN VALIDATION FUNCTIONS
-- ===================================================================

CREATE OR REPLACE FUNCTION public.is_domain_approved(email_address TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
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

-- ===================================================================
-- USER ROLE AND PERMISSION FUNCTIONS  
-- ===================================================================

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN (SELECT role IN ('admin', 'super_admin') FROM public.profiles WHERE id = auth.uid());
END;
$$;

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

-- ===================================================================
-- USER MANAGEMENT AND ACCOUNT LINKING
-- ===================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
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

-- ===================================================================
-- TIMESTAMP UPDATE FUNCTIONS
-- ===================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  NEW.last_active = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_chat_session_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
  UPDATE public.chat_sessions 
  SET updated_at = now() 
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_content_suggestions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ===================================================================
-- VECTOR SEARCH FUNCTIONS
-- ===================================================================

CREATE OR REPLACE FUNCTION public.match_documents(query_embedding vector, match_count INTEGER DEFAULT NULL, filter JSONB DEFAULT '{}')
RETURNS TABLE(id BIGINT, content TEXT, metadata JSONB, similarity DOUBLE PRECISION)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    public.documents.id,
    public.documents.content,
    public.documents.metadata,
    1 - (public.documents.embedding <=> query_embedding) AS similarity
  FROM public.documents
  WHERE public.documents.metadata @> filter
  ORDER BY public.documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.match_documents_competitor(query_embedding vector, match_count INTEGER DEFAULT NULL, filter JSONB DEFAULT '{}')
RETURNS TABLE(id BIGINT, content TEXT, metadata JSONB, similarity DOUBLE PRECISION)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    public.documents_competitor.id,
    public.documents_competitor.content,
    public.documents_competitor.metadata,
    1 - (public.documents_competitor.embedding <=> query_embedding) AS similarity
  FROM public.documents_competitor
  WHERE public.documents_competitor.metadata @> filter
  ORDER BY public.documents_competitor.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.match_documents_industry(query_embedding vector, match_count INTEGER DEFAULT NULL, filter JSONB DEFAULT '{}')
RETURNS TABLE(id BIGINT, content TEXT, metadata JSONB, similarity DOUBLE PRECISION)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    public.documents_industry.id,
    public.documents_industry.content,
    public.documents_industry.metadata,
    1 - (public.documents_industry.embedding <=> query_embedding) AS similarity
  FROM public.documents_industry
  WHERE public.documents_industry.metadata @> filter
  ORDER BY public.documents_industry.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.match_documents_news(query_embedding vector, match_count INTEGER DEFAULT NULL, filter JSONB DEFAULT '{}')
RETURNS TABLE(id BIGINT, content TEXT, metadata JSONB, similarity DOUBLE PRECISION)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    public.documents_news.id,
    public.documents_news.content,
    public.documents_news.metadata,
    1 - (public.documents_news.embedding <=> query_embedding) AS similarity
  FROM public.documents_news
  WHERE public.documents_news.metadata @> filter
  ORDER BY public.documents_news.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ===================================================================
-- TRIGGERS
-- ===================================================================

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create triggers for updated_at timestamps
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.content_submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.content_ideas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.content_briefs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.content_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.content_derivatives
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.general_content_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.feedback_submissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.webhook_configurations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.auto_generation_schedules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Special trigger for chat messages updating chat sessions
CREATE TRIGGER update_chat_session_updated_at
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_chat_session_updated_at();

-- Special trigger for content suggestions
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.content_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.update_content_suggestions_updated_at();

-- ===================================================================
-- DATABASE FUNCTIONS COMPLETE
-- ===================================================================
--
-- Next step: Run storage-setup.sql to create storage buckets
-- ===================================================================