import { supabase } from '@/integrations/supabase/client';

/**
 * Database consistency checker for file-related data
 */

export interface FileConsistencyReport {
  totalFileIdeas: number;
  ideasWithInvalidUrls: number;
  ideasMissingPaths: number;
  ideasWithUserIdMismatch: number;
  fixableIdeas: number;
  unfixableIdeas: number;
  recommendations: string[];
}

/**
 * Run a comprehensive audit of content ideas file consistency
 */
export async function checkFileConsistency(): Promise<FileConsistencyReport> {
  console.log('Starting file consistency check...');
  
  try {
    // Use the database function to get audit data
    const { data: auditData, error } = await supabase.rpc('audit_content_idea_file_access');
    
    if (error) {
      console.error('Failed to run file consistency audit:', error);
      throw error;
    }
    
    const audit = auditData[0];
    const recommendations: string[] = [];
    
    // Generate recommendations based on findings
    if (audit.ideas_with_invalid_urls > 0) {
      recommendations.push(
        `${audit.ideas_with_invalid_urls} content ideas have invalid public URLs for private buckets - these should be removed`
      );
    }
    
    if (audit.ideas_missing_paths > 0) {
      recommendations.push(
        `${audit.ideas_missing_paths} content ideas are missing file paths - these files cannot be accessed`
      );
    }
    
    if (audit.ideas_with_mismatched_user_ids > 0) {
      recommendations.push(
        `${audit.ideas_with_mismatched_user_ids} content ideas have user ID mismatches between records and file paths`
      );
    }
    
    const fixableIdeas = audit.path_user_ids_extracted;
    const unfixableIdeas = audit.total_file_ideas - fixableIdeas;
    
    if (fixableIdeas > 0) {
      recommendations.push(`${fixableIdeas} ideas can be fixed using path-derived user IDs`);
    }
    
    if (unfixableIdeas > 0) {
      recommendations.push(`${unfixableIdeas} ideas may require manual intervention`);
    }
    
    const report: FileConsistencyReport = {
      totalFileIdeas: audit.total_file_ideas,
      ideasWithInvalidUrls: audit.ideas_with_invalid_urls,
      ideasMissingPaths: audit.ideas_missing_paths,
      ideasWithUserIdMismatch: audit.ideas_with_mismatched_user_ids,
      fixableIdeas,
      unfixableIdeas,
      recommendations
    };
    
    console.log('File consistency check completed:', report);
    return report;
    
  } catch (error) {
    console.error('File consistency check failed:', error);
    throw error;
  }
}

/**
 * Get detailed information about problematic content ideas
 */
export async function getProblematicFileIdeas(limit: number = 10) {
  console.log('Fetching problematic file ideas...');
  
  try {
    const { data: ideas, error } = await supabase
      .from('content_ideas')
      .select('id, title, user_id, source_type, source_data, status, created_at')
      .eq('source_type', 'file')
      .or('source_data->>url.like.%/storage/v1/object/public/content-files/%,source_data->>path.is.null')
      .limit(limit);
    
    if (error) {
      console.error('Failed to fetch problematic ideas:', error);
      throw error;
    }
    
    return ideas || [];
  } catch (error) {
    console.error('Error fetching problematic file ideas:', error);
    throw error;
  }
}

/**
 * Validate retry state for all content ideas
 */
export async function validateRetryState() {
  console.log('Validating content idea retry state...');
  
  try {
    const { data: retryData, error } = await supabase.rpc('validate_content_idea_retry_state');
    
    if (error) {
      console.error('Failed to validate retry state:', error);
      throw error;
    }
    
    const state = retryData[0];
    console.log('Content idea retry state:', state);
    
    return state;
  } catch (error) {
    console.error('Error validating retry state:', error);
    throw error;
  }
}

/**
 * Test file access for a specific content idea
 */
export async function testFileAccess(ideaId: string, userId: string) {
  console.log(`Testing file access for idea ${ideaId}...`);
  
  try {
    // Get the content idea
    const { data: idea, error } = await supabase
      .from('content_ideas')
      .select('*')
      .eq('id', ideaId)
      .single();
    
    if (error) {
      console.error('Failed to fetch content idea:', error);
      throw error;
    }
    
    if (idea.source_type !== 'file') {
      return { success: false, message: 'Not a file-based content idea' };
    }
    
    const sourceData = idea.source_data as Record<string, any>;
    if (!sourceData?.filename) {
      return { success: false, message: 'No filename in source data' };
    }
    
    // Try to generate signed URL using the validation utility
    const { generateValidatedSignedUrl } = await import('./fileAccessValidation');
    const result = await generateValidatedSignedUrl(sourceData as Record<string, any>, userId);
    
    if (result.success) {
      return { 
        success: true, 
        message: `File access successful using ${result.method}`,
        url: result.url,
        method: result.method
      };
    } else {
      return { 
        success: false, 
        message: `File access failed: ${result.error}`,
        error: result.error
      };
    }
  } catch (error) {
    console.error('Error testing file access:', error);
    return { 
      success: false, 
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}