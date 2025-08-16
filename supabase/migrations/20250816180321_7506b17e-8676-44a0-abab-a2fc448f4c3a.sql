-- Add unique constraint to journalist_articles.url column
-- This will allow n8n to use URL for matching operations
ALTER TABLE public.journalist_articles 
ADD CONSTRAINT journalist_articles_url_unique UNIQUE (url);