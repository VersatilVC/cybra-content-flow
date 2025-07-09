-- Fix storage bucket policies for content-derivatives downloads
-- First, check if the bucket exists and ensure it's public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'content-derivatives';

-- Create comprehensive RLS policies for storage.objects to allow downloads
CREATE POLICY IF NOT EXISTS "Users can download their own content derivative files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'content-derivatives' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can upload their own content derivative files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'content-derivatives' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can update their own content derivative files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'content-derivatives' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can delete their own content derivative files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'content-derivatives' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);