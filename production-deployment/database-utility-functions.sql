-- ===================================================================
-- TIMESTAMP UPDATE AND UTILITY FUNCTIONS
-- Version: 2.0.0-security-hardened  
-- Date: 2025-07-09
-- Target: Clean Production Environment
-- ===================================================================

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

CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.last_active = now();
  RETURN NEW;
END;
$$;

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