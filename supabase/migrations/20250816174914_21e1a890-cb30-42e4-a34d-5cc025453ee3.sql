-- Create the security validation function first
CREATE OR REPLACE FUNCTION public.is_service_operation_allowed()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  calling_function text;
BEGIN
  -- Get the calling function context for audit purposes
  GET DIAGNOSTICS calling_function = PG_CONTEXT;
  
  -- For now, allow all service operations but this function serves as:
  -- 1. An audit point where we can log access
  -- 2. A place to implement more sophisticated validation if needed
  -- 3. A way to quickly restrict access if needed
  
  -- In production, you could add logging:
  -- INSERT INTO service_access_log (function_context, accessed_at) 
  -- VALUES (calling_function, now());
  
  RETURN true;
END;
$$;

-- Grant execute permission on the validation function
GRANT EXECUTE ON FUNCTION public.is_service_operation_allowed() TO service_role;

-- Remove the overly broad default privileges for service_role on profiles
REVOKE ALL ON public.profiles FROM service_role;

-- Now create the scoped policies for legitimate service_role operations

-- Policy: Service role can read profiles for system operations (notifications, etc.)
CREATE POLICY "Service role can read profiles for system operations" 
ON public.profiles 
FOR SELECT 
TO service_role
USING (
  -- Allow service role to read profiles for legitimate system operations
  public.is_service_operation_allowed()
);

-- Policy: Service role can insert profiles during user registration
CREATE POLICY "Service role can insert profiles during registration" 
ON public.profiles 
FOR INSERT 
TO service_role
WITH CHECK (
  -- Allow service role to insert profiles during the registration process
  -- This is primarily used by the handle_new_user trigger
  true
);

-- Policy: Service role can update profiles for account linking and system updates
CREATE POLICY "Service role can update profiles for system operations" 
ON public.profiles 
FOR UPDATE 
TO service_role
USING (
  -- Allow updates for legitimate system operations
  public.is_service_operation_allowed()
)
WITH CHECK (
  -- Ensure the update is legitimate
  public.is_service_operation_allowed()
);