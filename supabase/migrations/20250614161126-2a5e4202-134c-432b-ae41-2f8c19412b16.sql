
-- Create extensions schema and move vector extension
CREATE SCHEMA IF NOT EXISTS extensions;
DROP EXTENSION IF EXISTS vector CASCADE;
CREATE EXTENSION vector WITH SCHEMA extensions;

-- Fix function search path issues by recreating all affected functions with SET search_path = ''
-- We need to handle triggers that depend on these functions

-- 1. Drop triggers that depend on functions we need to recreate
DROP TRIGGER IF EXISTS update_profiles_last_active ON public.profiles;
DROP TRIGGER IF EXISTS handle_updated_at_content_briefs ON public.content_briefs;
DROP TRIGGER IF EXISTS handle_updated_at_content_derivatives ON public.content_derivatives;
DROP TRIGGER IF EXISTS handle_updated_at_content_ideas ON public.content_ideas;
DROP TRIGGER IF EXISTS handle_updated_at_content_items ON public.content_items;
DROP TRIGGER IF EXISTS handle_updated_at_content_submissions ON public.content_submissions;
DROP TRIGGER IF EXISTS handle_updated_at_feedback_submissions ON public.feedback_submissions;
DROP TRIGGER IF EXISTS handle_updated_at_general_content_items ON public.general_content_items;
DROP TRIGGER IF EXISTS handle_updated_at_notifications ON public.notifications;
DROP TRIGGER IF EXISTS handle_updated_at_profiles ON public.profiles;
DROP TRIGGER IF EXISTS handle_updated_at_webhook_configurations ON public.webhook_configurations;
DROP TRIGGER IF EXISTS handle_updated_at_auto_generation_schedules ON public.auto_generation_schedules;
DROP TRIGGER IF EXISTS handle_updated_at_chat_sessions ON public.chat_sessions;
DROP TRIGGER IF EXISTS update_chat_session_updated_at_trigger ON public.chat_messages;
DROP TRIGGER IF EXISTS update_content_suggestions_updated_at_trigger ON public.content_suggestions;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop ALL RLS policies that depend on functions we need to recreate
DROP POLICY IF EXISTS "Company users can view all ideas" ON public.content_ideas;
DROP POLICY IF EXISTS "Company users can create ideas" ON public.content_ideas;
DROP POLICY IF EXISTS "Company users can update all ideas" ON public.content_ideas;
DROP POLICY IF EXISTS "Company users can delete all ideas" ON public.content_ideas;

DROP POLICY IF EXISTS "Company users can view all briefs" ON public.content_briefs;
DROP POLICY IF EXISTS "Company users can create briefs" ON public.content_briefs;
DROP POLICY IF EXISTS "Company users can update all briefs" ON public.content_briefs;
DROP POLICY IF EXISTS "Company users can delete all briefs" ON public.content_briefs;

DROP POLICY IF EXISTS "Company users can view all items" ON public.content_items;
DROP POLICY IF EXISTS "Company users can create items" ON public.content_items;
DROP POLICY IF EXISTS "Company users can update all items" ON public.content_items;
DROP POLICY IF EXISTS "Company users can delete all items" ON public.content_items;

DROP POLICY IF EXISTS "Company users can view all derivatives" ON public.content_derivatives;
DROP POLICY IF EXISTS "Company users can create derivatives" ON public.content_derivatives;
DROP POLICY IF EXISTS "Company users can update all derivatives" ON public.content_derivatives;
DROP POLICY IF EXISTS "Company users can delete all derivatives" ON public.content_derivatives;

DROP POLICY IF EXISTS "Company users can view all suggestions" ON public.content_suggestions;
DROP POLICY IF EXISTS "Company users can create suggestions" ON public.content_suggestions;
DROP POLICY IF EXISTS "Company users can update all suggestions" ON public.content_suggestions;
DROP POLICY IF EXISTS "Company users can delete all suggestions" ON public.content_suggestions;

DROP POLICY IF EXISTS "Company users can view all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Company users can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Company users can update all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Company users can delete all notifications" ON public.notifications;

-- Drop feedback submission policies that depend on get_current_user_role
DROP POLICY IF EXISTS "Admins and super admins can view all feedback, users can view their own" ON public.feedback_submissions;
DROP POLICY IF EXISTS "Admins and super admins can update all feedback, users can update their own" ON public.feedback_submissions;
DROP POLICY IF EXISTS "Authenticated users can create feedback" ON public.feedback_submissions;
DROP POLICY IF EXISTS "Admins and super admins can delete all feedback" ON public.feedback_submissions;

-- Drop webhook configuration policies that depend on is_admin_user
DROP POLICY IF EXISTS "Admins can view all webhooks" ON public.webhook_configurations;
DROP POLICY IF EXISTS "Admins can manage all webhooks" ON public.webhook_configurations;

-- Drop profiles policies that depend on is_admin_user
DROP POLICY IF EXISTS "admin_all_profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "admin_all_profiles_update" ON public.profiles;

-- 3. Fix is_domain_approved function
DROP FUNCTION IF EXISTS public.is_domain_approved(text);
CREATE OR REPLACE FUNCTION public.is_domain_approved(email_address text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- 4. Fix match_documents function
DROP FUNCTION IF EXISTS public.match_documents(extensions.vector, integer, jsonb);
CREATE OR REPLACE FUNCTION public.match_documents(query_embedding extensions.vector, match_count integer DEFAULT NULL::integer, filter jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(id bigint, content text, metadata jsonb, similarity double precision)
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
#variable_conflict use_column
begin
  return query
  select
    public.documents.id,
    public.documents.content,
    public.documents.metadata,
    1 - (public.documents.embedding <=> query_embedding) as similarity
  from public.documents
  where public.documents.metadata @> filter
  order by public.documents.embedding <=> query_embedding
  limit match_count;
end;
$function$;

-- 5. Fix update_last_active function
DROP FUNCTION IF EXISTS public.update_last_active() CASCADE;
CREATE OR REPLACE FUNCTION public.update_last_active()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  NEW.last_active = now();
  RETURN NEW;
END;
$function$;

-- 6. Fix handle_updated_at function
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 7. Fix is_company_user function
DROP FUNCTION IF EXISTS public.is_company_user();
CREATE OR REPLACE FUNCTION public.is_company_user()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;

-- 8. Fix handle_new_user function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Check if email domain is approved
  IF NOT public.is_domain_approved(NEW.email) THEN
    RAISE EXCEPTION 'Email domain not approved for registration';
  END IF;
  
  -- Insert profile for new user with better handling of metadata
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', NEW.raw_user_meta_data ->> 'given_name', split_part(NEW.raw_user_meta_data ->> 'full_name', ' ', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', NEW.raw_user_meta_data ->> 'family_name', split_part(NEW.raw_user_meta_data ->> 'full_name', ' ', 2))
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.profiles.last_name),
    updated_at = now();
  
  RETURN NEW;
END;
$function$;

-- 9. Fix match_documents_competitor function
DROP FUNCTION IF EXISTS public.match_documents_competitor(extensions.vector, integer, jsonb);
CREATE OR REPLACE FUNCTION public.match_documents_competitor(query_embedding extensions.vector, match_count integer DEFAULT NULL::integer, filter jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(id bigint, content text, metadata jsonb, similarity double precision)
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
#variable_conflict use_column
begin
  return query
  select
    public.documents_competitor.id,
    public.documents_competitor.content,
    public.documents_competitor.metadata,
    1 - (public.documents_competitor.embedding <=> query_embedding) as similarity
  from public.documents_competitor
  where public.documents_competitor.metadata @> filter
  order by public.documents_competitor.embedding <=> query_embedding
  limit match_count;
end;
$function$;

-- 10. Fix match_documents_industry function
DROP FUNCTION IF EXISTS public.match_documents_industry(extensions.vector, integer, jsonb);
CREATE OR REPLACE FUNCTION public.match_documents_industry(query_embedding extensions.vector, match_count integer DEFAULT NULL::integer, filter jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(id bigint, content text, metadata jsonb, similarity double precision)
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
#variable_conflict use_column
begin
  return query
  select
    public.documents_industry.id,
    public.documents_industry.content,
    public.documents_industry.metadata,
    1 - (public.documents_industry.embedding <=> query_embedding) as similarity
  from public.documents_industry
  where public.documents_industry.metadata @> filter
  order by public.documents_industry.embedding <=> query_embedding
  limit match_count;
end;
$function$;

-- 11. Fix update_chat_session_updated_at function
DROP FUNCTION IF EXISTS public.update_chat_session_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_chat_session_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  UPDATE public.chat_sessions 
  SET updated_at = now() 
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$function$;

-- 12. Fix get_current_user_role function
DROP FUNCTION IF EXISTS public.get_current_user_role();
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$function$;

-- 13. Fix update_content_suggestions_updated_at function
DROP FUNCTION IF EXISTS public.update_content_suggestions_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_content_suggestions_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 14. Fix is_admin_user function
DROP FUNCTION IF EXISTS public.is_admin_user();
CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN (SELECT role IN ('admin', 'super_admin') FROM public.profiles WHERE id = auth.uid());
END;
$function$;

-- 15. Fix match_documents_news function
DROP FUNCTION IF EXISTS public.match_documents_news(extensions.vector, integer, jsonb);
CREATE OR REPLACE FUNCTION public.match_documents_news(query_embedding extensions.vector, match_count integer DEFAULT NULL::integer, filter jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(id bigint, content text, metadata jsonb, similarity double precision)
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
#variable_conflict use_column
begin
  return query
  select
    public.documents_news.id,
    public.documents_news.content,
    public.documents_news.metadata,
    1 - (public.documents_news.embedding <=> query_embedding) as similarity
  from public.documents_news
  where public.documents_news.metadata @> filter
  order by public.documents_news.embedding <=> query_embedding
  limit match_count;
end;
$function$;

-- Recreate all the triggers that were dropped
CREATE TRIGGER update_profiles_last_active
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_last_active();

CREATE TRIGGER handle_updated_at_content_briefs
  BEFORE UPDATE ON public.content_briefs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_content_derivatives
  BEFORE UPDATE ON public.content_derivatives
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_content_ideas
  BEFORE UPDATE ON public.content_ideas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_content_items
  BEFORE UPDATE ON public.content_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_content_submissions
  BEFORE UPDATE ON public.content_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_feedback_submissions
  BEFORE UPDATE ON public.feedback_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_general_content_items
  BEFORE UPDATE ON public.general_content_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_notifications
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_webhook_configurations
  BEFORE UPDATE ON public.webhook_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_auto_generation_schedules
  BEFORE UPDATE ON public.auto_generation_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_chat_sessions
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_chat_session_updated_at_trigger
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chat_session_updated_at();

CREATE TRIGGER update_content_suggestions_updated_at_trigger
  BEFORE UPDATE ON public.content_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_content_suggestions_updated_at();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Recreate all the RLS policies that were dropped
CREATE POLICY "Company users can view all ideas" 
  ON public.content_ideas 
  FOR SELECT 
  TO authenticated
  USING (public.is_company_user());

CREATE POLICY "Company users can create ideas" 
  ON public.content_ideas 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.is_company_user());

CREATE POLICY "Company users can update all ideas" 
  ON public.content_ideas 
  FOR UPDATE 
  TO authenticated
  USING (public.is_company_user());

CREATE POLICY "Company users can delete all ideas" 
  ON public.content_ideas 
  FOR DELETE 
  TO authenticated
  USING (public.is_company_user());

CREATE POLICY "Company users can view all briefs" 
  ON public.content_briefs 
  FOR SELECT 
  TO authenticated
  USING (public.is_company_user());

CREATE POLICY "Company users can create briefs" 
  ON public.content_briefs 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.is_company_user());

CREATE POLICY "Company users can update all briefs" 
  ON public.content_briefs 
  FOR UPDATE 
  TO authenticated
  USING (public.is_company_user());

CREATE POLICY "Company users can delete all briefs" 
  ON public.content_briefs 
  FOR DELETE 
  TO authenticated
  USING (public.is_company_user());

CREATE POLICY "Company users can view all items" 
  ON public.content_items 
  FOR SELECT 
  TO authenticated
  USING (public.is_company_user());

CREATE POLICY "Company users can create items" 
  ON public.content_items 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.is_company_user());

CREATE POLICY "Company users can update all items" 
  ON public.content_items 
  FOR UPDATE 
  TO authenticated
  USING (public.is_company_user());

CREATE POLICY "Company users can delete all items" 
  ON public.content_items 
  FOR DELETE 
  TO authenticated
  USING (public.is_company_user());

CREATE POLICY "Company users can view all derivatives" 
  ON public.content_derivatives 
  FOR SELECT 
  TO authenticated
  USING (public.is_company_user());

CREATE POLICY "Company users can create derivatives" 
  ON public.content_derivatives 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.is_company_user());

CREATE POLICY "Company users can update all derivatives" 
  ON public.content_derivatives 
  FOR UPDATE 
  TO authenticated
  USING (public.is_company_user());

CREATE POLICY "Company users can delete all derivatives" 
  ON public.content_derivatives 
  FOR DELETE 
  TO authenticated
  USING (public.is_company_user());

CREATE POLICY "Company users can view all suggestions" 
  ON public.content_suggestions 
  FOR SELECT 
  TO authenticated
  USING (public.is_company_user());

CREATE POLICY "Company users can create suggestions" 
  ON public.content_suggestions 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.is_company_user());

CREATE POLICY "Company users can update all suggestions" 
  ON public.content_suggestions 
  FOR UPDATE 
  TO authenticated
  USING (public.is_company_user());

CREATE POLICY "Company users can delete all suggestions" 
  ON public.content_suggestions 
  FOR DELETE 
  TO authenticated
  USING (public.is_company_user());

CREATE POLICY "Company users can view all notifications" 
  ON public.notifications 
  FOR SELECT 
  TO authenticated
  USING (public.is_company_user());

CREATE POLICY "Company users can create notifications" 
  ON public.notifications 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.is_company_user());

CREATE POLICY "Company users can update all notifications" 
  ON public.notifications 
  FOR UPDATE 
  TO authenticated
  USING (public.is_company_user());

CREATE POLICY "Company users can delete all notifications" 
  ON public.notifications 
  FOR DELETE 
  TO authenticated
  USING (public.is_company_user());

-- Recreate feedback submission policies
CREATE POLICY "Admins and super admins can view all feedback, users can view their own" 
  ON public.feedback_submissions 
  FOR SELECT 
  USING (
    public.get_current_user_role() IN ('admin', 'super_admin') 
    OR submitter_id = auth.uid()
  );

CREATE POLICY "Admins and super admins can update all feedback, users can update their own" 
  ON public.feedback_submissions 
  FOR UPDATE 
  USING (
    public.get_current_user_role() IN ('admin', 'super_admin') 
    OR submitter_id = auth.uid()
  );

CREATE POLICY "Authenticated users can create feedback" 
  ON public.feedback_submissions 
  FOR INSERT 
  WITH CHECK (auth.uid() = submitter_id);

CREATE POLICY "Admins and super admins can delete all feedback" 
  ON public.feedback_submissions 
  FOR DELETE 
  USING (public.get_current_user_role() IN ('admin', 'super_admin'));

-- Recreate webhook configuration policies
CREATE POLICY "Admins can view all webhooks" 
  ON public.webhook_configurations 
  FOR SELECT 
  TO authenticated
  USING (public.is_admin_user());

CREATE POLICY "Admins can manage all webhooks" 
  ON public.webhook_configurations 
  FOR ALL 
  TO authenticated
  USING (public.is_admin_user());

-- Recreate profiles policies
CREATE POLICY "admin_all_profiles_select" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated
  USING (public.is_admin_user());

CREATE POLICY "admin_all_profiles_update" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated
  USING (public.is_admin_user());
