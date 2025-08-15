-- Add submission_id column to general_content_items table
ALTER TABLE public.general_content_items 
ADD COLUMN submission_id UUID REFERENCES public.content_submissions(id);

-- Create index for better query performance
CREATE INDEX idx_general_content_items_submission_id ON public.general_content_items(submission_id);