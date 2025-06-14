
-- Enable Row Level Security on all document tables
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents_industry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents_competitor ENABLE ROW LEVEL SECURITY;

-- Create policies to allow authenticated users to read from all document tables
-- These are shared knowledge bases used for AI/RAG functionality

-- Policies for documents (Cyabra knowledge base)
CREATE POLICY "Authenticated users can read documents" 
  ON public.documents 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Policies for documents_industry (Industry knowledge base)
CREATE POLICY "Authenticated users can read industry documents" 
  ON public.documents_industry 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Policies for documents_news (News knowledge base)
CREATE POLICY "Authenticated users can read news documents" 
  ON public.documents_news 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Policies for documents_competitor (Competitor knowledge base)
CREATE POLICY "Authenticated users can read competitor documents" 
  ON public.documents_competitor 
  FOR SELECT 
  TO authenticated
  USING (true);
