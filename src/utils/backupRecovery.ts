// Production backup and recovery utilities
import { supabase } from '@/integrations/supabase/client';
import { ProductionMonitoring } from './monitoring';

interface BackupMetadata {
  timestamp: string;
  version: string;
  tables: string[];
  totalRecords: number;
  size: string;
}

interface BackupData {
  metadata: BackupMetadata;
  content_items: any[];
  content_derivatives: any[];
  content_briefs: any[];
  content_ideas: any[];
  profiles: any[];
  notifications: any[];
  general_content_items: any[];
}

export class BackupRecoverySystem {
  
  // Create comprehensive data backup
  static async createBackup(userId: string): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      await ProductionMonitoring.logEvent({
        event_type: 'info',
        source: 'Backup',
        message: 'Starting data backup process',
        user_id: userId
      });
      
      const backup: BackupData = {
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          tables: [],
          totalRecords: 0,
          size: '0KB'
        },
        content_items: [],
        content_derivatives: [],
        content_briefs: [],
        content_ideas: [],
        profiles: [],
        notifications: [],
        general_content_items: []
      };
      
      // Backup user's content items
      const { data: contentItems, error: contentError } = await supabase
        .from('content_items')
        .select('*')
        .eq('user_id', userId);
      
      if (contentError) throw new Error(`Content items backup failed: ${contentError.message}`);
      backup.content_items = contentItems || [];
      backup.metadata.tables.push('content_items');
      
      // Backup user's content derivatives
      const { data: derivatives, error: derivativesError } = await supabase
        .from('content_derivatives')
        .select('*')
        .eq('user_id', userId);
      
      if (derivativesError) throw new Error(`Content derivatives backup failed: ${derivativesError.message}`);
      backup.content_derivatives = derivatives || [];
      backup.metadata.tables.push('content_derivatives');
      
      // Backup user's content briefs
      const { data: briefs, error: briefsError } = await supabase
        .from('content_briefs')
        .select('*')
        .eq('user_id', userId);
      
      if (briefsError) throw new Error(`Content briefs backup failed: ${briefsError.message}`);
      backup.content_briefs = briefs || [];
      backup.metadata.tables.push('content_briefs');
      
      // Backup user's content ideas
      const { data: ideas, error: ideasError } = await supabase
        .from('content_ideas')
        .select('*')
        .eq('user_id', userId);
      
      if (ideasError) throw new Error(`Content ideas backup failed: ${ideasError.message}`);
      backup.content_ideas = ideas || [];
      backup.metadata.tables.push('content_ideas');
      
      // Backup user's profile
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId);
      
      if (profilesError) throw new Error(`Profile backup failed: ${profilesError.message}`);
      backup.profiles = profiles || [];
      backup.metadata.tables.push('profiles');
      
      // Backup user's notifications
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId);
      
      if (notificationsError) throw new Error(`Notifications backup failed: ${notificationsError.message}`);
      backup.notifications = notifications || [];
      backup.metadata.tables.push('notifications');
      
      // Backup user's general content
      const { data: generalContent, error: generalError } = await supabase
        .from('general_content_items')
        .select('*')
        .eq('user_id', userId);
      
      if (generalError) throw new Error(`General content backup failed: ${generalError.message}`);
      backup.general_content_items = generalContent || [];
      backup.metadata.tables.push('general_content_items');
      
      // Calculate backup statistics
      backup.metadata.totalRecords = 
        backup.content_items.length +
        backup.content_derivatives.length +
        backup.content_briefs.length +
        backup.content_ideas.length +
        backup.profiles.length +
        backup.notifications.length +
        backup.general_content_items.length;
      
      const backupJson = JSON.stringify(backup, null, 2);
      backup.metadata.size = `${Math.round(backupJson.length / 1024)}KB`;
      
      await ProductionMonitoring.logEvent({
        event_type: 'info',
        source: 'Backup',
        message: 'Data backup completed successfully',
        user_id: userId,
        details: {
          totalRecords: backup.metadata.totalRecords,
          size: backup.metadata.size,
          tables: backup.metadata.tables
        }
      });
      
      return {
        success: true,
        data: JSON.stringify(backup, null, 2)
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown backup error';
      
      await ProductionMonitoring.logEvent({
        event_type: 'error',
        source: 'Backup',
        message: 'Data backup failed',
        user_id: userId,
        details: { error: errorMessage }
      });
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  // Download backup file
  static downloadBackup(backupData: string, userId: string): void {
    try {
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cyabra-backup-${userId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      ProductionMonitoring.logEvent({
        event_type: 'info',
        source: 'Backup',
        message: 'Backup file downloaded successfully',
        user_id: userId
      });
      
    } catch (error) {
      ProductionMonitoring.logEvent({
        event_type: 'error',
        source: 'Backup',
        message: 'Failed to download backup file',
        user_id: userId,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  }
  
  // Validate backup file
  static validateBackup(backupData: string): { valid: boolean; metadata?: BackupMetadata; error?: string } {
    try {
      const backup = JSON.parse(backupData) as BackupData;
      
      // Check required fields
      if (!backup.metadata || !backup.metadata.timestamp || !backup.metadata.tables) {
        return { valid: false, error: 'Invalid backup format - missing metadata' };
      }
      
      // Check if backup has data
      if (backup.metadata.totalRecords === 0) {
        return { valid: false, error: 'Backup appears to be empty' };
      }
      
      return {
        valid: true,
        metadata: backup.metadata
      };
      
    } catch (error) {
      return {
        valid: false,
        error: `Invalid backup file: ${error instanceof Error ? error.message : 'Parse error'}`
      };
    }
  }
  
  // System status for rollback decisions
  static async getSystemStatus(): Promise<{
    canSafelyRollback: boolean;
    activeUsers: number;
    recentActivity: boolean;
    recommendations: string[];
  }> {
    try {
      // Check for recent user activity (last 10 minutes)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      
      const { data: recentProfiles } = await supabase
        .from('profiles')
        .select('id, last_active')
        .gte('last_active', tenMinutesAgo);
      
      const activeUsers = recentProfiles?.length || 0;
      const recentActivity = activeUsers > 0;
      
      const recommendations: string[] = [];
      
      if (recentActivity) {
        recommendations.push('Recent user activity detected - consider scheduling rollback during maintenance window');
        recommendations.push('Notify active users about upcoming maintenance');
      }
      
      if (activeUsers > 5) {
        recommendations.push('High user activity - strongly recommend waiting for low-traffic period');
      }
      
      const canSafelyRollback = activeUsers < 3; // Safe if fewer than 3 active users
      
      return {
        canSafelyRollback,
        activeUsers,
        recentActivity,
        recommendations
      };
      
    } catch (error) {
      return {
        canSafelyRollback: false,
        activeUsers: -1,
        recentActivity: true,
        recommendations: ['Unable to determine system status - exercise caution with rollback']
      };
    }
  }
  
  // Emergency data export
  static async emergencyExport(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Quick export of critical data only
      const criticalData = {
        timestamp: new Date().toISOString(),
        emergency: true,
        user_id: userId
      };
      
      // Export only the most critical user data
      const { data: contentItems } = await supabase
        .from('content_items')
        .select('id, title, content, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      
      const { data: contentIdeas } = await supabase
        .from('content_ideas')
        .select('id, title, description, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      return {
        success: true,
        data: {
          ...criticalData,
          content_items: contentItems || [],
          content_ideas: contentIdeas || []
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Emergency export failed'
      };
    }
  }
}

// Recovery procedures documentation
export const RECOVERY_PROCEDURES = {
  databaseIssues: [
    '1. Check Supabase dashboard for service status',
    '2. Verify network connectivity',
    '3. Check RLS policies for recent changes',
    '4. Review recent database migrations',
    '5. Contact Supabase support if needed'
  ],
  
  authenticationIssues: [
    '1. Check Supabase Auth settings',
    '2. Verify redirect URLs are correct',
    '3. Check Google OAuth configuration',
    '4. Clear browser cache and cookies',
    '5. Test with incognito/private browsing'
  ],
  
  wordpressIssues: [
    '1. Test WordPress API credentials',
    '2. Check edge function logs',
    '3. Verify WordPress site accessibility',
    '4. Check network connectivity to WordPress',
    '5. Review recent WordPress updates'
  ],
  
  storageIssues: [
    '1. Check Supabase Storage dashboard',
    '2. Verify bucket permissions',
    '3. Test file upload/download manually',
    '4. Check storage policies',
    '5. Review file size limits'
  ]
};