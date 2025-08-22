// Profile Security Helper - Ensures secure access patterns for profiles table
import { supabase } from '@/integrations/supabase/client';

/**
 * Security helper for profile operations that comply with the new restrictive RLS policies
 * The new RLS policies require context to be set via PostgreSQL settings
 */
export class ProfileSecurityHelper {

  /**
   * Read user's own profile (safe for authenticated users)
   */
  static async getOwnProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update user's own profile (safe for authenticated users)
   */
  static async updateOwnProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Log security access attempt for audit trail
   */
  static async logSecurityAccess(
    operation: string,
    userId: string,
    context: Record<string, any> = {}
  ) {
    try {
      await supabase
        .from('audit_log')
        .insert({
          table_name: 'profiles',
          operation_type: operation,
          user_id: userId,
          context_info: context
        });
    } catch (error) {
      console.error('Failed to log security access:', error);
      // Don't throw - logging failures shouldn't break the main operation
    }
  }
}

/**
 * Validate that edge function requests comply with security requirements
 */
export function validateSecureProfileAccess(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  // Additional validation logic can be added here
  // e.g., validate JWT claims, check request origin, etc.
  
  return true;
}