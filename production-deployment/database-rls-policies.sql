-- ===================================================================
-- PRODUCTION DATABASE RLS POLICIES
-- Version: 2.0.0-security-hardened
-- Date: 2025-07-06
-- Target: Clean Production Environment
-- ===================================================================

-- Note: Run this AFTER running database-schema-export.sql
-- This will create all Row Level Security policies

-- ===================================================================
-- ENABLE RLS ON ALL TABLES
-- ===================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_linking_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approved_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_derivatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.general_content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents_competitor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents_industry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_generation_schedules ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- PROFILES TABLE POLICIES
-- ===================================================================

CREATE POLICY "users_own_profile_select" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_own_profile_insert" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_own_profile_update" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "admin_all_profiles_select" ON public.profiles
    FOR SELECT USING (is_admin_user());

CREATE POLICY "admin_all_profiles_update" ON public.profiles
    FOR UPDATE USING (is_admin_user());

-- ===================================================================
-- ACCOUNT LINKING AUDIT POLICIES
-- ===================================================================

CREATE POLICY "Admins can view account linking audit" ON public.account_linking_audit
    FOR SELECT USING (is_admin_user());

-- ===================================================================
-- APPROVED DOMAINS POLICIES
-- ===================================================================

CREATE POLICY "Authenticated users can view approved domains" ON public.approved_domains
    FOR SELECT USING (true);

-- ===================================================================
-- CHAT POLICIES
-- ===================================================================

CREATE POLICY "Users can view their own chat sessions" ON public.chat_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions" ON public.chat_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions" ON public.chat_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions" ON public.chat_sessions
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages from their own sessions" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_sessions 
            WHERE chat_sessions.id = chat_messages.session_id 
            AND chat_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in their own sessions" ON public.chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_sessions 
            WHERE chat_sessions.id = chat_messages.session_id 
            AND chat_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update messages in their own sessions" ON public.chat_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM chat_sessions 
            WHERE chat_sessions.id = chat_messages.session_id 
            AND chat_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete messages from their own sessions" ON public.chat_messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM chat_sessions 
            WHERE chat_sessions.id = chat_messages.session_id 
            AND chat_sessions.user_id = auth.uid()
        )
    );

-- ===================================================================
-- CONTENT MANAGEMENT POLICIES
-- ===================================================================

-- Content Submissions
CREATE POLICY "Users can view their own submissions" ON public.content_submissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own submissions" ON public.content_submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions" ON public.content_submissions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all submissions" ON public.content_submissions
    FOR SELECT USING (
        (EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = ANY(ARRAY['super_admin'::app_role, 'admin'::app_role])
        )) OR (user_id = auth.uid())
    );

-- Content Ideas
CREATE POLICY "Users can view their own content ideas" ON public.content_ideas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content ideas" ON public.content_ideas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content ideas" ON public.content_ideas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content ideas" ON public.content_ideas
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Company users can view all ideas" ON public.content_ideas
    FOR SELECT USING (is_company_user());

CREATE POLICY "Company users can create ideas" ON public.content_ideas
    FOR INSERT WITH CHECK (is_company_user());

CREATE POLICY "Company users can update all ideas" ON public.content_ideas
    FOR UPDATE USING (is_company_user());

CREATE POLICY "Company users can delete all ideas" ON public.content_ideas
    FOR DELETE USING (is_company_user());

-- Content Suggestions
CREATE POLICY "Users can view content suggestions for their own ideas" ON public.content_suggestions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM content_ideas 
            WHERE content_ideas.id = content_suggestions.content_idea_id 
            AND content_ideas.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can insert content suggestions" ON public.content_suggestions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Company users can view all suggestions" ON public.content_suggestions
    FOR SELECT USING (is_company_user());

CREATE POLICY "Company users can create suggestions" ON public.content_suggestions
    FOR INSERT WITH CHECK (is_company_user());

CREATE POLICY "Company users can update all suggestions" ON public.content_suggestions
    FOR UPDATE USING (is_company_user());

CREATE POLICY "Company users can delete all suggestions" ON public.content_suggestions
    FOR DELETE USING (is_company_user());

-- Content Briefs
CREATE POLICY "Company users can view all briefs" ON public.content_briefs
    FOR SELECT USING (is_company_user());

CREATE POLICY "Company users can create briefs" ON public.content_briefs
    FOR INSERT WITH CHECK (is_company_user());

CREATE POLICY "Company users can update all briefs" ON public.content_briefs
    FOR UPDATE USING (is_company_user());

CREATE POLICY "Company users can delete all briefs" ON public.content_briefs
    FOR DELETE USING (is_company_user());

-- Content Items
CREATE POLICY "Users can view their own content items" ON public.content_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content items" ON public.content_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content items" ON public.content_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content items" ON public.content_items
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Company users can view all items" ON public.content_items
    FOR SELECT USING (is_company_user());

CREATE POLICY "Company users can create items" ON public.content_items
    FOR INSERT WITH CHECK (is_company_user());

CREATE POLICY "Company users can update all items" ON public.content_items
    FOR UPDATE USING (is_company_user());

CREATE POLICY "Company users can delete all items" ON public.content_items
    FOR DELETE USING (is_company_user());

-- Content Derivatives
CREATE POLICY "Users can view their own content derivatives" ON public.content_derivatives
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content derivatives" ON public.content_derivatives
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content derivatives" ON public.content_derivatives
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content derivatives" ON public.content_derivatives
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Company users can view all derivatives" ON public.content_derivatives
    FOR SELECT USING (is_company_user());

CREATE POLICY "Company users can create derivatives" ON public.content_derivatives
    FOR INSERT WITH CHECK (is_company_user());

CREATE POLICY "Company users can update all derivatives" ON public.content_derivatives
    FOR UPDATE USING (is_company_user());

CREATE POLICY "Company users can delete all derivatives" ON public.content_derivatives
    FOR DELETE USING (is_company_user());

-- General Content Items
CREATE POLICY "Users can view their own general content" ON public.general_content_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own general content" ON public.general_content_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own general content" ON public.general_content_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own general content" ON public.general_content_items
    FOR DELETE USING (auth.uid() = user_id);

-- ===================================================================
-- KNOWLEDGE BASE POLICIES
-- ===================================================================

CREATE POLICY "Authenticated users can read documents" ON public.documents
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can read competitor documents" ON public.documents_competitor
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can read industry documents" ON public.documents_industry
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can read news documents" ON public.documents_news
    FOR SELECT USING (true);

-- ===================================================================
-- SYSTEM POLICIES
-- ===================================================================

-- Notifications
CREATE POLICY "Company users can view all notifications" ON public.notifications
    FOR SELECT USING (is_company_user());

CREATE POLICY "Company users can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (is_company_user());

CREATE POLICY "Company users can update all notifications" ON public.notifications
    FOR UPDATE USING (is_company_user());

CREATE POLICY "Company users can delete all notifications" ON public.notifications
    FOR DELETE USING (is_company_user());

-- Feedback Submissions
CREATE POLICY "Authenticated users can create feedback" ON public.feedback_submissions
    FOR INSERT WITH CHECK (auth.uid() = submitter_id);

CREATE POLICY "Users can submit feedback" ON public.feedback_submissions
    FOR INSERT WITH CHECK (auth.uid() = submitter_id);

CREATE POLICY "Admins and super admins can view all feedback, users can view t" ON public.feedback_submissions
    FOR SELECT USING (
        (get_current_user_role() = ANY(ARRAY['admin'::text, 'super_admin'::text])) 
        OR (submitter_id = auth.uid())
    );

CREATE POLICY "Admins and super admins can update all feedback, users can upda" ON public.feedback_submissions
    FOR UPDATE USING (
        (get_current_user_role() = ANY(ARRAY['admin'::text, 'super_admin'::text])) 
        OR (submitter_id = auth.uid())
    );

CREATE POLICY "Admins and super admins can delete all feedback" ON public.feedback_submissions
    FOR DELETE USING (get_current_user_role() = ANY(ARRAY['admin'::text, 'super_admin'::text]));

CREATE POLICY "Super admins can view all feedback" ON public.feedback_submissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'::app_role
        )
    );

-- Webhook Configurations
CREATE POLICY "Users can view own webhooks" ON public.webhook_configurations
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert own webhooks" ON public.webhook_configurations
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own webhooks" ON public.webhook_configurations
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Admins can view all webhooks" ON public.webhook_configurations
    FOR SELECT USING (is_admin_user());

CREATE POLICY "Admins can manage all webhooks" ON public.webhook_configurations
    FOR ALL USING (is_admin_user());

CREATE POLICY "Admins can manage webhook configurations" ON public.webhook_configurations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'super_admin'::app_role
        )
    );

-- Auto Generation Schedules
CREATE POLICY "Users can manage their own auto generation schedules" ON public.auto_generation_schedules
    FOR ALL USING (auth.uid() = user_id);

-- ===================================================================
-- RLS POLICIES COMPLETE
-- ===================================================================
-- 
-- Next step: Run database-functions.sql to create security functions
-- ===================================================================