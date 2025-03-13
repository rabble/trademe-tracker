/**
 * Debugging utilities for the application
 */

/**
 * Log detailed information about an error
 * 
 * @param context - Context where the error occurred
 * @param error - The error object
 */
export function logErrorDetails(context: string, error: any): void {
  console.error(`=== ERROR in ${context} ===`);
  
  if (error instanceof Error) {
    console.error(`Name: ${error.name}`);
    console.error(`Message: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    
    // Log any additional properties
    const additionalProps = Object.entries(error)
      .filter(([key]) => !['name', 'message', 'stack'].includes(key))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    
    if (Object.keys(additionalProps).length > 0) {
      console.error('Additional properties:', additionalProps);
    }
  } else {
    console.error('Raw error:', error);
  }
  
  console.error('=== END ERROR ===');
}

/**
 * Log environment information
 */
export function logEnvironmentInfo(): void {
  console.log('=== ENVIRONMENT INFO ===');
  console.log('User Agent:', navigator.userAgent);
  console.log('Platform:', navigator.platform);
  console.log('Language:', navigator.language);
  console.log('Online:', navigator.onLine);
  console.log('Window Location:', window.location.href);
  
  // Log environment variables (without exposing secrets)
  const envVars = Object.keys(import.meta.env || {})
    .filter(key => !key.includes('SECRET') && !key.includes('KEY'))
    .reduce((acc, key) => {
      // @ts-ignore
      return { ...acc, [key]: import.meta.env[key] };
    }, {});
  
  console.log('Environment Variables:', envVars);
  console.log('=== END ENVIRONMENT INFO ===');
}

/**
 * Log network request details
 * 
 * @param method - HTTP method
 * @param url - Request URL
 * @param options - Request options
 * @param response - Response object (optional)
 */
export function logNetworkRequest(
  method: string,
  url: string,
  options?: RequestInit,
  response?: Response
): void {
  console.log('=== NETWORK REQUEST ===');
  console.log('Method:', method);
  console.log('URL:', url);
  
  if (options) {
    // Log headers without authorization
    const safeHeaders: Record<string, string> = {};
    if (options.headers) {
      const headers = options.headers as Record<string, string>;
      Object.keys(headers).forEach(key => {
        if (key.toLowerCase() !== 'authorization') {
          safeHeaders[key] = headers[key];
        } else {
          safeHeaders[key] = '[REDACTED]';
        }
      });
    }
    
    console.log('Headers:', safeHeaders);
    console.log('Mode:', options.mode);
    console.log('Credentials:', options.credentials);
  }
  
  if (response) {
    console.log('Response Status:', response.status);
    console.log('Response OK:', response.ok);
    console.log('Response Type:', response.type);
    console.log('Response Headers:', Object.fromEntries([...response.headers.entries()]));
  }
  
  console.log('=== END NETWORK REQUEST ===');
}
