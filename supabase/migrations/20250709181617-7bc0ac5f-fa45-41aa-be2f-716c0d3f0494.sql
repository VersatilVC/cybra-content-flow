-- Fix documents_competitor table ID auto-increment issue
-- The id column should be BIGSERIAL to auto-increment like other document tables

-- Create a sequence for the id column
CREATE SEQUENCE IF NOT EXISTS public.documents_competitor_id_seq;

-- Set the id column to use the sequence as default
ALTER TABLE public.documents_competitor 
ALTER COLUMN id SET DEFAULT nextval('public.documents_competitor_id_seq');

-- Set the sequence ownership to the id column
ALTER SEQUENCE public.documents_competitor_id_seq OWNED BY public.documents_competitor.id;

-- Set the sequence to start from the next available ID
-- If table has data, start from max(id) + 1, otherwise start from 1
SELECT setval('public.documents_competitor_id_seq', 
    COALESCE((SELECT MAX(id) FROM public.documents_competitor), 0) + 1, 
    false);