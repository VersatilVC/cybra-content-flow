
// Security validation for request parsing
function validateRequestSize(bodyText: string): void {
  const maxSize = 10 * 1024 * 1024; // 10MB limit
  if (bodyText.length > maxSize) {
    throw new Error('Request body too large');
  }
}

function sanitizeRequestBody(body: any): any {
  // Basic sanitization - remove potential script tags and dangerous content
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.replace(/<script[^>]*>.*?<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/data:/gi, '');
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = Array.isArray(obj) ? [] : {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };
  
  return sanitize(body);
}

export async function parseRequestBody<T>(req: Request, actionType: string): Promise<T> {
  try {
    const bodyText = await req.text();
    
    // Validate request size
    validateRequestSize(bodyText);
    
    if (!bodyText || bodyText.trim() === '') {
      throw new Error(`${actionType} body is empty`);
    }
    
    const body = JSON.parse(bodyText);
    
    // Sanitize the parsed body
    const sanitizedBody = sanitizeRequestBody(body);
    
    console.log(`${actionType} processed securely`);
    return sanitizedBody;
  } catch (error) {
    console.error(`Error parsing ${actionType} body:`, error);
    throw new Error(`Invalid or unsafe content in ${actionType} body`);
  }
}
