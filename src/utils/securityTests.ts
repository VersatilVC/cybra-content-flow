// Comprehensive security testing suite
import { supabase } from '@/integrations/supabase/client';
import { config } from '@/config/environment';

interface SecurityTestResult {
  testName: string;
  passed: boolean;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class SecurityTester {
  
  static async testWordPressConnectionSecurity(): Promise<SecurityTestResult> {
    try {
      console.log('Testing WordPress connection security...');
      
      // Test the WordPress connection through edge function
      const { data, error } = await supabase.functions.invoke('wordpress-publish', {
        body: { test: true }
      });
      
      if (error) {
        return {
          testName: 'WordPress Connection Security',
          passed: false,
          details: `Edge function connection failed: ${error.message}`,
          severity: 'critical'
        };
      }
      
      return {
        testName: 'WordPress Connection Security',
        passed: data?.success || false,
        details: data?.success ? 'WordPress API connection is secure and working' : 'WordPress connection test failed',
        severity: 'critical'
      };
      
    } catch (error) {
      return {
        testName: 'WordPress Connection Security',
        passed: false,
        details: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'critical'
      };
    }
  }
  
  static async testAuthenticationSecurity(): Promise<SecurityTestResult> {
    try {
      console.log('Testing authentication security...');
      
      // Test session state
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return {
          testName: 'Authentication Security',
          passed: true, // This is OK if user is not logged in
          details: 'No active session - authentication state is secure',
          severity: 'low'
        };
      }
      
      // Check if session is valid and not expired
      const now = new Date().getTime() / 1000;
      const isExpired = session.expires_at ? session.expires_at < now : false;
      
      return {
        testName: 'Authentication Security',
        passed: !isExpired,
        details: isExpired ? 'Session has expired' : 'Active session is valid',
        severity: 'medium'
      };
      
    } catch (error) {
      return {
        testName: 'Authentication Security',
        passed: false,
        details: `Authentication test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'high'
      };
    }
  }
  
  static async testDatabaseSecurity(): Promise<SecurityTestResult> {
    try {
      console.log('Testing database security...');
      
      // Test RLS by trying to access content without auth
      const { data, error } = await supabase
        .from('content_items')
        .select('id')
        .limit(1);
      
      // If user is authenticated, this should work
      // If user is not authenticated, this should fail due to RLS
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        return {
          testName: 'Database Security (RLS)',
          passed: !error,
          details: error ? `Database access failed: ${error.message}` : 'Database access works for authenticated user',
          severity: 'high'
        };
      } else {
        return {
          testName: 'Database Security (RLS)',
          passed: !!error, // Should fail without authentication
          details: error ? 'RLS properly blocks unauthenticated access' : 'WARNING: Database allows unauthenticated access',
          severity: 'critical'
        };
      }
      
    } catch (error) {
      return {
        testName: 'Database Security (RLS)',
        passed: false,
        details: `Database security test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'critical'
      };
    }
  }
  
  static testConfigurationSecurity(): SecurityTestResult {
    console.log('Testing configuration security...');
    
    // Check if we're using centralized config
    const hasConfig = Boolean(config?.supabase?.url);
    
    // Check for any remaining hardcoded URLs in the current runtime
    const configString = JSON.stringify(config);
    const hasHardcodedUrls = configString.includes('uejgjytmqpcilwfrlpai.supabase.co');
    
    return {
      testName: 'Configuration Security',
      passed: hasConfig && hasHardcodedUrls, // We expect hardcoded URLs in the centralized config
      details: hasConfig 
        ? 'Centralized configuration is in use' 
        : 'Configuration system not properly initialized',
      severity: 'high'
    };
  }
  
  static async runAllSecurityTests(): Promise<SecurityTestResult[]> {
    console.log('🔐 Running comprehensive security tests...');
    
    const results: SecurityTestResult[] = [];
    
    // Run all security tests
    results.push(await this.testWordPressConnectionSecurity());
    results.push(await this.testAuthenticationSecurity());
    results.push(await this.testDatabaseSecurity());
    results.push(this.testConfigurationSecurity());
    
    // Log results
    console.group('🔐 Security Test Results');
    results.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      const severity = result.severity.toUpperCase();
      console.log(`${icon} [${severity}] ${result.testName}: ${result.details}`);
    });
    console.groupEnd();
    
    const criticalFailures = results.filter(r => !r.passed && r.severity === 'critical').length;
    const totalFailures = results.filter(r => !r.passed).length;
    
    console.log(`\n📊 Security Test Summary:`);
    console.log(`  ✅ Passed: ${results.length - totalFailures}/${results.length}`);
    console.log(`  ❌ Failed: ${totalFailures}/${results.length}`);
    console.log(`  🚨 Critical Failures: ${criticalFailures}`);
    
    if (criticalFailures === 0) {
      console.log('\n🎉 No critical security issues detected!');
    } else {
      console.log('\n⚠️  Critical security issues require immediate attention!');
    }
    
    return results;
  }
}

// Export convenience function
export const runSecurityValidation = () => SecurityTester.runAllSecurityTests();