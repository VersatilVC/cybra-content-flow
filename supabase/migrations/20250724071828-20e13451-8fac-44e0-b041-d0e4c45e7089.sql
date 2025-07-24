-- Update content brief statuses where content items have been created
UPDATE content_briefs 
SET status = 'content_item_created' 
WHERE id IN ('d96edc2b-592c-44fd-8697-0d869580cfe2', 'd65b9655-2b0e-4862-95fb-75598a038d9b')
AND status = 'processing_content_item';