-- Fix security vulnerability: Remove overly permissive notification policies
-- and replace with secure admin-only policies

-- Drop the problematic policies that allow all company users to access all notifications
DROP POLICY IF EXISTS "Company users can view all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Company users can update all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Company users can delete all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Company users can create notifications" ON public.notifications;

-- Create secure admin-only policies for administrative access
-- Only admin and super_admin roles can view all notifications for system administration
CREATE POLICY "Admins can view all notifications for administration" 
ON public.notifications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- Only admin and super_admin roles can update notifications for administration
CREATE POLICY "Admins can update all notifications for administration" 
ON public.notifications 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- Only admin and super_admin roles can delete notifications for administration
CREATE POLICY "Admins can delete all notifications for administration" 
ON public.notifications 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- Allow authenticated users to create notifications (they will be created for their own user_id)
CREATE POLICY "Users can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);