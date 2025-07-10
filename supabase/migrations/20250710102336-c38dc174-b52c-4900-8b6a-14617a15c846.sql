-- Add policy to allow company users to view all active webhooks for triggering
-- This will allow creator role users like Rafi and Rotem to trigger webhooks for brief creation
CREATE POLICY "Company users can view all active webhooks for triggering" ON public.webhook_configurations
    FOR SELECT 
    USING (is_company_user() AND is_active = true);

-- Note: This policy specifically only allows SELECT on active webhooks
-- INSERT, UPDATE, DELETE policies remain restrictive as intended