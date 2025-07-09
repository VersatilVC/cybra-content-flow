-- Create extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move vector extension from public to extensions schema
DROP EXTENSION IF EXISTS vector CASCADE;
CREATE EXTENSION vector WITH SCHEMA extensions;

-- Grant usage on extensions schema to authenticated users
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO anon;