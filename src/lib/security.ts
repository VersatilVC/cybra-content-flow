
import DOMPurify from 'dompurify';
import { z } from 'zod';

// Input sanitization utilities
export const sanitizeHtml = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
  });
};

export const sanitizeText = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .substring(0, 10000); // Limit length
};

// Enhanced validation schemas
export const secureStringSchema = z.string()
  .min(1, 'Field is required')
  .max(1000, 'Input too long')
  .refine((val) => !/<script|javascript:|data:|vbscript:/i.test(val), 
    'Potentially malicious content detected');

export const secureEmailSchema = z.string()
  .email('Invalid email format')
  .max(254, 'Email too long')
  .refine((val) => !/<script|javascript:/i.test(val), 
    'Invalid email format');

export const secureUrlSchema = z.string()
  .url('Invalid URL format')
  .refine((url) => {
    try {
      const parsed = new URL(url);
      // Prevent SSRF attacks
      const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
      const blockedPorts = ['22', '23', '25', '53', '80', '110', '143', '993', '995'];
      
      if (blockedHosts.includes(parsed.hostname.toLowerCase())) {
        return false;
      }
      
      // Check for private IP ranges
      if (/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(parsed.hostname)) {
        return false;
      }
      
      // Allow only HTTP/HTTPS
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }, 'Invalid or potentially unsafe URL');

// File validation utilities
export const validateFileType = async (file: File, allowedTypes: string[]): Promise<boolean> => {
  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return false;
  }
  
  // Additional validation based on file signature (magic numbers)
  return new Promise<boolean>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (!buffer) {
        resolve(false);
        return;
      }
      
      const bytes = new Uint8Array(buffer.slice(0, 4));
      const header = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Common file signatures
      const signatures: Record<string, string[]> = {
        'image/jpeg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2'],
        'image/png': ['89504e47'],
        'image/gif': ['47494638'],
        'application/pdf': ['25504446'],
        'text/plain': [], // Text files don't have reliable signatures
        'application/json': [],
      };
      
      const expectedSignatures = signatures[file.type] || [];
      if (expectedSignatures.length === 0) {
        resolve(true); // No signature check for this type
        return;
      }
      
      const isValid = expectedSignatures.some(sig => header.startsWith(sig));
      resolve(isValid);
    };
    
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 4));
  });
};

export const validateFileSize = (file: File, maxSizeInMB: number = 10): boolean => {
  const maxSize = maxSizeInMB * 1024 * 1024; // Convert to bytes
  return file.size <= maxSize;
};

// Rate limiting utility
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier)!;
    
    // Remove expired requests
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
  
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

// Create a global rate limiter instance
export const globalRateLimiter = new RateLimiter(50, 60000); // 50 requests per minute

// Security headers utility
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Audit logging
export const logSecurityEvent = (event: string, details: Record<string, any>, userId?: string) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userId,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };
  
  console.warn('[SECURITY]', logEntry);
  
  // In production, you might want to send this to a security monitoring service
  // await fetch('/api/security-log', { method: 'POST', body: JSON.stringify(logEntry) });
};
