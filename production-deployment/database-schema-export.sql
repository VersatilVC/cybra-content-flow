-- ===================================================================
-- PRODUCTION DATABASE SCHEMA EXPORT
-- Version: 2.0.0-security-hardened
-- Date: 2025-07-06
-- Target: Clean Production Environment
-- ===================================================================

-- Note: Run this in your PRODUCTION Supabase SQL Editor
-- This will create the complete database schema without any development data

-- ===================================================================
-- EXTENSIONS
-- ===================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ===================================================================
-- ENUMS
-- ===================================================================

CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'creator');
CREATE TYPE public.feedback_category AS ENUM ('bug', 'feature_request', 'general_feedback', 'improvement');
CREATE TYPE public.feedback_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.feedback_status AS ENUM ('open', 'in_review', 'in_progress', 'testing', 'resolved', 'closed');

-- ===================================================================
-- CORE TABLES
-- ===================================================================

-- Approved domains for user registration
CREATE TABLE public.approved_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role public.app_role NOT NULL DEFAULT 'creator',
    status TEXT NOT NULL DEFAULT 'active',
    last_active TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Account linking audit
CREATE TABLE public.account_linking_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_auth_id UUID NOT NULL,
    linked_auth_id UUID NOT NULL,
    profile_id UUID NOT NULL,
    linking_method TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);

-- Chat sessions
CREATE TABLE public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Chat messages
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    sources TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    FOREIGN KEY (session_id) REFERENCES public.chat_sessions(id)
);

-- ===================================================================
-- CONTENT MANAGEMENT TABLES
-- ===================================================================

-- Content submissions
CREATE TABLE public.content_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    knowledge_base TEXT NOT NULL,
    content_type TEXT NOT NULL,
    processing_status TEXT NOT NULL DEFAULT 'queued',
    file_path TEXT,
    file_url TEXT,
    file_size BIGINT,
    mime_type TEXT,
    original_filename TEXT,
    error_message TEXT,
    webhook_triggered_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Content ideas
CREATE TABLE public.content_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    source_type TEXT NOT NULL,
    source_data JSONB,
    idea_research_summary TEXT,
    status TEXT NOT NULL DEFAULT 'submitted',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Content suggestions
CREATE TABLE public.content_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_idea_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT NOT NULL,
    source_url TEXT,
    source_title TEXT,
    relevance_score NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    FOREIGN KEY (content_idea_id) REFERENCES public.content_ideas(id)
);

-- Content briefs
CREATE TABLE public.content_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    source_id UUID NOT NULL,
    source_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    brief_type TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    content TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Content items
CREATE TABLE public.content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    summary TEXT,
    content_type TEXT NOT NULL DEFAULT 'Blog Post',
    content_brief_id UUID,
    submission_id UUID,
    status TEXT NOT NULL DEFAULT 'draft',
    tags TEXT[],
    resources TEXT[],
    multimedia_suggestions TEXT,
    word_count INTEGER,
    wordpress_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    FOREIGN KEY (content_brief_id) REFERENCES public.content_briefs(id),
    FOREIGN KEY (submission_id) REFERENCES public.content_submissions(id)
);

-- Content derivatives
CREATE TABLE public.content_derivatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    content_item_id UUID NOT NULL,
    title TEXT NOT NULL,
    derivative_type TEXT NOT NULL,
    category TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'text',
    content TEXT,
    file_path TEXT,
    file_url TEXT,
    file_size TEXT,
    mime_type TEXT,
    word_count INTEGER,
    metadata JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    FOREIGN KEY (content_item_id) REFERENCES public.content_items(id)
);

-- General content items
CREATE TABLE public.general_content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT NOT NULL,
    derivative_type TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'text',
    source_type TEXT NOT NULL DEFAULT 'manual',
    target_audience TEXT NOT NULL,
    source_data JSONB DEFAULT '{}',
    derivative_types JSONB DEFAULT '[]',
    file_path TEXT,
    file_url TEXT,
    file_size TEXT,
    mime_type TEXT,
    word_count INTEGER,
    metadata JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ===================================================================
-- KNOWLEDGE BASE TABLES
-- ===================================================================

-- Documents (Knowledge Base)
CREATE TABLE public.documents (
    id BIGSERIAL PRIMARY KEY,
    content TEXT,
    metadata JSONB,
    embedding vector(1536)
);

-- Competitor documents
CREATE TABLE public.documents_competitor (
    id BIGINT PRIMARY KEY,
    content TEXT,
    metadata JSONB,
    embedding vector(1536)
);

-- Industry documents
CREATE TABLE public.documents_industry (
    id BIGSERIAL PRIMARY KEY,
    content TEXT,
    metadata JSONB,
    embedding vector(1536)
);

-- News documents
CREATE TABLE public.documents_news (
    id BIGSERIAL PRIMARY KEY,
    content TEXT,
    metadata JSONB,
    embedding vector(1536)
);

-- ===================================================================
-- SYSTEM TABLES
-- ===================================================================

-- Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT false,
    related_entity_id UUID,
    related_entity_type TEXT DEFAULT 'submission',
    related_submission_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Feedback submissions
CREATE TABLE public.feedback_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submitter_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category public.feedback_category NOT NULL DEFAULT 'general_feedback',
    priority public.feedback_priority NOT NULL DEFAULT 'medium',
    status public.feedback_status NOT NULL DEFAULT 'open',
    assigned_to UUID,
    attachment_url TEXT,
    attachment_filename TEXT,
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Webhook configurations
CREATE TABLE public.webhook_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    webhook_type TEXT NOT NULL DEFAULT 'knowledge_base',
    webhook_url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Auto generation schedules
CREATE TABLE public.auto_generation_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    frequency TEXT NOT NULL,
    next_run_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ===================================================================
-- BOOTSTRAP DATA
-- ===================================================================

-- Add approved domains (customize for your organization)
INSERT INTO public.approved_domains (domain) VALUES 
    ('cyabra.com'),
    ('versatil.vc');

-- You can add a super admin user after setting up authentication
-- Replace 'your-email@domain.com' with your actual email
-- INSERT INTO public.profiles (id, email, role, first_name, last_name) VALUES 
--     ('00000000-0000-0000-0000-000000000000', 'your-email@domain.com', 'super_admin', 'Admin', 'User');

-- ===================================================================
-- COMPLETE SCHEMA CREATED
-- ===================================================================
-- 
-- Next steps:
-- 1. Run the RLS policies script (database-rls-policies.sql)
-- 2. Run the functions script (database-functions.sql) 
-- 3. Set up storage buckets (storage-setup.sql)
-- 4. Configure secrets in Supabase dashboard
-- 5. Deploy edge functions
-- ===================================================================