-- Temporarily make internal_name nullable to prevent constraint violations during debugging
ALTER TABLE content_ideas ALTER COLUMN internal_name DROP NOT NULL;