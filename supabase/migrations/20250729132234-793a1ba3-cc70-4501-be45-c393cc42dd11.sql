-- Update rotemb@cyabra.com role to admin so she can view all feedback items
UPDATE public.profiles 
SET role = 'admin'::app_role 
WHERE email = 'rotemb@cyabra.com';