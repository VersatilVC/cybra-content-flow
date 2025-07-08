-- Update ilan.hertz@versatil.vc to super_admin role
UPDATE public.profiles 
SET role = 'super_admin'::app_role,
    updated_at = now()
WHERE email = 'ilan.hertz@versatil.vc';