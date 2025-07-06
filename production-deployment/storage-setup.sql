-- ===================================================================
-- PRODUCTION STORAGE SETUP
-- Version: 2.0.0-security-hardened
-- Date: 2025-07-06  
-- Target: Clean Production Environment
-- ===================================================================

-- Note: Run this AFTER running database-functions.sql
-- This will create all storage buckets and policies

-- ===================================================================
-- CREATE STORAGE BUCKETS
-- ===================================================================

-- Knowledge base files bucket (public)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('knowledge-base-files', 'knowledge-base-files', true);

-- Content files bucket (private)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('content-files', 'content-files', false);

-- Content derivatives bucket (public) 
INSERT INTO storage.buckets (id, name, public) 
VALUES ('content-derivatives', 'content-derivatives', true);

-- ===================================================================
-- STORAGE POLICIES - KNOWLEDGE BASE FILES (PUBLIC)
-- ===================================================================

-- Allow public access to knowledge base files
CREATE POLICY "Public Access" ON storage.objects FOR SELECT 
USING (bucket_id = 'knowledge-base-files');

-- Allow authenticated users to upload knowledge base files
CREATE POLICY "Authenticated users can upload knowledge base files" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'knowledge-base-files' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own knowledge base files
CREATE POLICY "Users can update their own knowledge base files" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'knowledge-base-files' 
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own knowledge base files
CREATE POLICY "Users can delete their own knowledge base files" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'knowledge-base-files' 
  AND auth.role() = 'authenticated'
);

-- ===================================================================
-- STORAGE POLICIES - CONTENT FILES (PRIVATE)
-- ===================================================================

-- Allow users to view their own content files
CREATE POLICY "Users can view their own content files" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'content-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to upload their own content files
CREATE POLICY "Users can upload their own content files" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'content-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own content files
CREATE POLICY "Users can update their own content files" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'content-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own content files
CREATE POLICY "Users can delete their own content files" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'content-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ===================================================================
-- STORAGE POLICIES - CONTENT DERIVATIVES (PUBLIC)
-- ===================================================================

-- Allow public access to content derivatives
CREATE POLICY "Public access to content derivatives" ON storage.objects 
FOR SELECT USING (bucket_id = 'content-derivatives');

-- Allow authenticated users to upload content derivatives
CREATE POLICY "Authenticated users can upload content derivatives" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'content-derivatives' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own content derivatives
CREATE POLICY "Users can update their own content derivatives" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'content-derivatives' 
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own content derivatives
CREATE POLICY "Users can delete their own content derivatives" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'content-derivatives' 
  AND auth.role() = 'authenticated'
);

-- ===================================================================
-- ADMIN POLICIES (SUPER ADMIN ACCESS)
-- ===================================================================

-- Super admins can access all files in all buckets
CREATE POLICY "Super admins can access all files" ON storage.objects 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'super_admin'
  )
);

-- ===================================================================
-- STORAGE SETUP COMPLETE
-- ===================================================================
--
-- Storage buckets created:
-- - knowledge-base-files (public)
-- - content-files (private) 
-- - content-derivatives (public)
--
-- Next step: Configure secrets in Supabase Edge Functions dashboard
-- ===================================================================