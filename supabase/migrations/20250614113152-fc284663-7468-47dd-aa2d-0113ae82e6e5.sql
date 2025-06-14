
-- Create table for general content items (standalone derivative content)
CREATE TABLE public.general_content_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  derivative_type TEXT NOT NULL,
  category TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text',
  source_type TEXT NOT NULL DEFAULT 'manual',
  source_data JSONB DEFAULT '{}',
  target_audience TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  word_count INTEGER,
  metadata JSONB DEFAULT '{}',
  file_path TEXT,
  file_url TEXT,
  file_size TEXT,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.general_content_items ENABLE ROW LEVEL SECURITY;

-- Create policies for general_content_items
CREATE POLICY "Users can view their own general content" 
  ON public.general_content_items 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own general content" 
  ON public.general_content_items 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own general content" 
  ON public.general_content_items 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own general content" 
  ON public.general_content_items 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_general_content_items_updated_at
  BEFORE UPDATE ON public.general_content_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
