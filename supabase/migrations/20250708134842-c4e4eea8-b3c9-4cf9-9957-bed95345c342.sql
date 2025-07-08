-- Update user role to super_admin in PRODUCTION database
UPDATE public.profiles 
SET role = 'super_admin'::app_role,
    updated_at = now()
WHERE id = '477b1676-802b-47b1-a4e5-b1a60269e515' AND email = 'ilan.hertz@versatil.vc';