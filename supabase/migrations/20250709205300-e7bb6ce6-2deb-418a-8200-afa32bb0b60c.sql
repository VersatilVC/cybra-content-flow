-- Fix storage bucket policies for content-derivatives downloads
-- First, ensure the bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'content-derivatives';

-- Drop existing policies if they exist (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Users can download their own content derivative files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own content derivative files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own content derivative files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own content derivative files" ON storage.objects;

-- Create comprehensive RLS policies for storage.objects to allow downloads
CREATE POLICY "Users can download their own content derivative files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'content-derivatives' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own content derivative files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'content-derivatives' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own content derivative files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'content-derivatives' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own content derivative files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'content-derivatives' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);