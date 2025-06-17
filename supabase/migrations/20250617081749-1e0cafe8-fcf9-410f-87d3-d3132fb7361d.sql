
-- Ensure vector extension is enabled in extensions schema
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Add embedding columns to all knowledge base tables
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS embedding extensions.vector(1536);

ALTER TABLE public.documents_competitor 
ADD COLUMN IF NOT EXISTS embedding extensions.vector(1536);

ALTER TABLE public.documents_industry 
ADD COLUMN IF NOT EXISTS embedding extensions.vector(1536);

ALTER TABLE public.documents_news 
ADD COLUMN IF NOT EXISTS embedding extensions.vector(1536);

-- Create indexes on embedding columns for faster similarity searches
CREATE INDEX IF NOT EXISTS documents_embedding_idx ON public.documents 
USING ivfflat (embedding extensions.vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS documents_competitor_embedding_idx ON public.documents_competitor 
USING ivfflat (embedding extensions.vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS documents_industry_embedding_idx ON public.documents_industry 
USING ivfflat (embedding extensions.vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS documents_news_embedding_idx ON public.documents_news 
USING ivfflat (embedding extensions.vector_cosine_ops) WITH (lists = 100);
