-- Add missing embedding columns to all documents tables
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

ALTER TABLE public.documents_competitor 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

ALTER TABLE public.documents_industry 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

ALTER TABLE public.documents_news 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Drop existing vector search functions if they exist
DROP FUNCTION IF EXISTS public.match_documents(vector, integer, jsonb);
DROP FUNCTION IF EXISTS public.match_documents_competitor(vector, integer, jsonb);
DROP FUNCTION IF EXISTS public.match_documents_industry(vector, integer, jsonb);
DROP FUNCTION IF EXISTS public.match_documents_news(vector, integer, jsonb);

-- Recreate vector search functions with correct type references and search paths
CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding vector(1536), 
  match_count INTEGER DEFAULT 10, 
  filter JSONB DEFAULT '{}'
)
RETURNS TABLE(id BIGINT, content TEXT, metadata JSONB, similarity DOUBLE PRECISION)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    public.documents.id,
    public.documents.content,
    public.documents.metadata,
    1 - (public.documents.embedding <=> query_embedding) AS similarity
  FROM public.documents
  WHERE 
    public.documents.embedding IS NOT NULL
    AND public.documents.metadata @> filter
  ORDER BY public.documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.match_documents_competitor(
  query_embedding vector(1536), 
  match_count INTEGER DEFAULT 10, 
  filter JSONB DEFAULT '{}'
)
RETURNS TABLE(id BIGINT, content TEXT, metadata JSONB, similarity DOUBLE PRECISION)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    public.documents_competitor.id,
    public.documents_competitor.content,
    public.documents_competitor.metadata,
    1 - (public.documents_competitor.embedding <=> query_embedding) AS similarity
  FROM public.documents_competitor
  WHERE 
    public.documents_competitor.embedding IS NOT NULL
    AND public.documents_competitor.metadata @> filter
  ORDER BY public.documents_competitor.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.match_documents_industry(
  query_embedding vector(1536), 
  match_count INTEGER DEFAULT 10, 
  filter JSONB DEFAULT '{}'
)
RETURNS TABLE(id BIGINT, content TEXT, metadata JSONB, similarity DOUBLE PRECISION)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    public.documents_industry.id,
    public.documents_industry.content,
    public.documents_industry.metadata,
    1 - (public.documents_industry.embedding <=> query_embedding) AS similarity
  FROM public.documents_industry
  WHERE 
    public.documents_industry.embedding IS NOT NULL
    AND public.documents_industry.metadata @> filter
  ORDER BY public.documents_industry.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.match_documents_news(
  query_embedding vector(1536), 
  match_count INTEGER DEFAULT 10, 
  filter JSONB DEFAULT '{}'
)
RETURNS TABLE(id BIGINT, content TEXT, metadata JSONB, similarity DOUBLE PRECISION)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    public.documents_news.id,
    public.documents_news.content,
    public.documents_news.metadata,
    1 - (public.documents_news.embedding <=> query_embedding) AS similarity
  FROM public.documents_news
  WHERE 
    public.documents_news.embedding IS NOT NULL
    AND public.documents_news.metadata @> filter
  ORDER BY public.documents_news.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create HNSW indexes for fast vector similarity search
CREATE INDEX CONCURRENTLY IF NOT EXISTS documents_embedding_idx 
ON public.documents USING hnsw (embedding vector_cosine_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS documents_competitor_embedding_idx 
ON public.documents_competitor USING hnsw (embedding vector_cosine_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS documents_industry_embedding_idx 
ON public.documents_industry USING hnsw (embedding vector_cosine_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS documents_news_embedding_idx 
ON public.documents_news USING hnsw (embedding vector_cosine_ops);