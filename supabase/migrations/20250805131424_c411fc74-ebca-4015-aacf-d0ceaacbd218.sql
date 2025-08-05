-- Find and update content ideas that should have brief_created status
-- These are ideas that have suggestions with briefs created from them, but the parent idea still shows 'ready'

UPDATE content_ideas 
SET status = 'brief_created', updated_at = now()
WHERE status = 'ready' 
AND id IN (
  SELECT DISTINCT ci.id 
  FROM content_ideas ci
  JOIN content_suggestions cs ON ci.id = cs.content_idea_id
  JOIN content_briefs cb ON cs.id = cb.source_id AND cb.source_type = 'suggestion'
  WHERE ci.status = 'ready'
);