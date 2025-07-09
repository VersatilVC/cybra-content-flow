-- Fix vector operator error by updating search_path in match_documents functions
-- This allows access to vector extension operators in the extensions schema

-- Update match_documents function
CREATE OR REPLACE FUNCTION public.match_documents(query_embedding vector, match_count integer DEFAULT NULL::integer, filter jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(id bigint, content text, metadata jsonb, similarity double precision)
 LANGUAGE plpgsql
 SET search_path TO 'public, extensions'
AS $function$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    public.documents.id,
    public.documents.content,
    public.documents.metadata,
    1 - (public.documents.embedding <=> query_embedding) AS similarity
  FROM public.documents
  WHERE public.documents.metadata @> filter
  ORDER BY public.documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$function$;

-- Update match_documents_competitor function
CREATE OR REPLACE FUNCTION public.match_documents_competitor(query_embedding vector, match_count integer DEFAULT NULL::integer, filter jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(id bigint, content text, metadata jsonb, similarity double precision)
 LANGUAGE plpgsql
 SET search_path TO 'public, extensions'
AS $function$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    public.documents_competitor.id,
    public.documents_competitor.content,
    public.documents_competitor.metadata,
    1 - (public.documents_competitor.embedding <=> query_embedding) AS similarity
  FROM public.documents_competitor
  WHERE public.documents_competitor.metadata @> filter
  ORDER BY public.documents_competitor.embedding <=> query_embedding
  LIMIT match_count;
END;
$function$;

-- Update match_documents_industry function
CREATE OR REPLACE FUNCTION public.match_documents_industry(query_embedding vector, match_count integer DEFAULT NULL::integer, filter jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(id bigint, content text, metadata jsonb, similarity double precision)
 LANGUAGE plpgsql
 SET search_path TO 'public, extensions'
AS $function$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    public.documents_industry.id,
    public.documents_industry.content,
    public.documents_industry.metadata,
    1 - (public.documents_industry.embedding <=> query_embedding) AS similarity
  FROM public.documents_industry
  WHERE public.documents_industry.metadata @> filter
  ORDER BY public.documents_industry.embedding <=> query_embedding
  LIMIT match_count;
END;
$function$;

-- Update match_documents_news function
CREATE OR REPLACE FUNCTION public.match_documents_news(query_embedding vector, match_count integer DEFAULT NULL::integer, filter jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(id bigint, content text, metadata jsonb, similarity double precision)
 LANGUAGE plpgsql
 SET search_path TO 'public, extensions'
AS $function$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    public.documents_news.id,
    public.documents_news.content,
    public.documents_news.metadata,
    1 - (public.documents_news.embedding <=> query_embedding) AS similarity
  FROM public.documents_news
  WHERE public.documents_news.metadata @> filter
  ORDER BY public.documents_news.embedding <=> query_embedding
  LIMIT match_count;
END;
$function$;