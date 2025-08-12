-- Fix security vulnerability: Restrict document access to company users only

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can read documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can read competitor documents" ON public.documents_competitor;
DROP POLICY IF EXISTS "Authenticated users can read industry documents" ON public.documents_industry;

-- Create secure policies that only allow company users to access documents
CREATE POLICY "Company users can read documents" 
ON public.documents 
FOR SELECT 
USING (is_company_user());

CREATE POLICY "Company users can read competitor documents" 
ON public.documents_competitor 
FOR SELECT 
USING (is_company_user());

CREATE POLICY "Company users can read industry documents" 
ON public.documents_industry 
FOR SELECT 
USING (is_company_user());

-- Also create a policy for news documents (if it exists)
DROP POLICY IF EXISTS "Authenticated users can read news documents" ON public.documents_news;
CREATE POLICY "Company users can read news documents" 
ON public.documents_news 
FOR SELECT 
USING (is_company_user());