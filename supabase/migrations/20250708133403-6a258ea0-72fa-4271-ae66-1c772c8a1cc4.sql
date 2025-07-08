-- Update the correct user profile to super_admin role
UPDATE public.profiles 
SET role = 'super_admin'::app_role,
    updated_at = now()
WHERE id = '477b1676-802b-47b1-a4e5-b1a60269e515';