
-- Remove unauthorized public email domains from approved_domains
DELETE FROM public.approved_domains 
WHERE domain IN ('gmail.com', 'outlook.com');
