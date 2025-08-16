-- Create journalists table with comprehensive profile data
CREATE TABLE public.journalists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  publication TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'traditional_journalist'::text,
  email TEXT,
  linkedin_url TEXT,
  twitter_handle TEXT,
  relevance_score INTEGER DEFAULT 0,
  coverage_type TEXT,
  audience_match TEXT,
  expertise_level TEXT DEFAULT 'knowledgeable'::text,
  coverage_frequency TEXT DEFAULT 'monthly'::text,
  recent_activity TEXT,
  historical_coverage TEXT,
  best_contact_method TEXT DEFAULT 'email'::text,
  pitch_angle TEXT,
  timing_considerations TEXT,
  publication_tier TEXT,
  publication_circulation TEXT,
  journalist_influence TEXT DEFAULT 'medium'::text,
  previous_cyabra_coverage BOOLEAN DEFAULT false,
  competitive_coverage TEXT DEFAULT 'neutral'::text,
  database_source TEXT DEFAULT 'manual'::text,
  relationship_status TEXT DEFAULT 'cold_contact'::text,
  last_industry_coverage DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

-- Enable RLS on journalists table
ALTER TABLE public.journalists ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for journalists
CREATE POLICY "Company users can manage all journalists" 
ON public.journalists 
FOR ALL 
USING (is_company_user());

CREATE POLICY "Users can manage their own journalists" 
ON public.journalists 
FOR ALL 
USING (auth.uid() = user_id);

-- Create journalist expertise table for beat coverage analysis
CREATE TABLE public.journalist_expertise (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journalist_id UUID NOT NULL REFERENCES public.journalists(id) ON DELETE CASCADE,
  coverage_category TEXT NOT NULL, -- 'core', 'contextual', 'extended', 'deep'
  beat_area TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on journalist_expertise table
ALTER TABLE public.journalist_expertise ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for journalist_expertise
CREATE POLICY "Company users can manage all journalist expertise" 
ON public.journalist_expertise 
FOR ALL 
USING (is_company_user());

CREATE POLICY "Users can manage expertise for their journalists" 
ON public.journalist_expertise 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.journalists 
  WHERE journalists.id = journalist_expertise.journalist_id 
  AND journalists.user_id = auth.uid()
));

-- Create journalist articles table for recent work tracking
CREATE TABLE public.journalist_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journalist_id UUID NOT NULL REFERENCES public.journalists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  publication TEXT NOT NULL,
  date DATE,
  url TEXT,
  relevance TEXT,
  coverage_type TEXT DEFAULT 'core'::text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on journalist_articles table
ALTER TABLE public.journalist_articles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for journalist_articles
CREATE POLICY "Company users can manage all journalist articles" 
ON public.journalist_articles 
FOR ALL 
USING (is_company_user());

CREATE POLICY "Users can manage articles for their journalists" 
ON public.journalist_articles 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.journalists 
  WHERE journalists.id = journalist_articles.journalist_id 
  AND journalists.user_id = auth.uid()
));

-- Create PR campaigns table to group pitches for content items
CREATE TABLE public.pr_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_item_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'::text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on pr_campaigns table
ALTER TABLE public.pr_campaigns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for pr_campaigns
CREATE POLICY "Company users can manage all PR campaigns" 
ON public.pr_campaigns 
FOR ALL 
USING (is_company_user());

CREATE POLICY "Users can manage their own PR campaigns" 
ON public.pr_campaigns 
FOR ALL 
USING (auth.uid() = user_id);

-- Create PR pitches table linking content items to journalists
CREATE TABLE public.pr_pitches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pr_campaign_id UUID NOT NULL REFERENCES public.pr_campaigns(id) ON DELETE CASCADE,
  journalist_id UUID NOT NULL REFERENCES public.journalists(id) ON DELETE CASCADE,
  content_item_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  pitch_content TEXT,
  subject_line TEXT,
  status TEXT NOT NULL DEFAULT 'draft'::text,
  sent_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  coverage_confirmed BOOLEAN DEFAULT false,
  coverage_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on pr_pitches table
ALTER TABLE public.pr_pitches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for pr_pitches
CREATE POLICY "Company users can manage all PR pitches" 
ON public.pr_pitches 
FOR ALL 
USING (is_company_user());

CREATE POLICY "Users can manage their own PR pitches" 
ON public.pr_pitches 
FOR ALL 
USING (auth.uid() = user_id);

-- Create contact history table for relationship tracking
CREATE TABLE public.contact_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journalist_id UUID NOT NULL REFERENCES public.journalists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  contact_type TEXT NOT NULL DEFAULT 'email'::text,
  subject TEXT,
  message TEXT,
  response_received BOOLEAN DEFAULT false,
  contact_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on contact_history table
ALTER TABLE public.contact_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contact_history
CREATE POLICY "Company users can manage all contact history" 
ON public.contact_history 
FOR ALL 
USING (is_company_user());

CREATE POLICY "Users can manage their own contact history" 
ON public.contact_history 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for updated_at on journalists
CREATE TRIGGER update_journalists_updated_at
  BEFORE UPDATE ON public.journalists
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for updated_at on pr_campaigns
CREATE TRIGGER update_pr_campaigns_updated_at
  BEFORE UPDATE ON public.pr_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for updated_at on pr_pitches
CREATE TRIGGER update_pr_pitches_updated_at
  BEFORE UPDATE ON public.pr_pitches
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();