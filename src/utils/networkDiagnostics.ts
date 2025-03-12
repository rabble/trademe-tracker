/**
 * Network diagnostics utility to help troubleshoot connection issues
 */

/**
 * Check if a domain is reachable
 * @param domain Domain to check
 * @returns Promise with ping result
 */
export async function pingDomain(domain: string): Promise<{
  success: boolean;
  time: number | null;
  error: string | null;
}> {
  const startTime = performance.now();
  
  try {
    // Try to fetch a small resource from the domain
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`https://${domain}/favicon.ico`, {
      method: 'HEAD',
      mode: 'no-cors', // This allows us to ping the domain without CORS issues
      cache: 'no-cache',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const endTime = performance.now();
    
    return {
      success: true,
      time: Math.round(endTime - startTime),
      error: null
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      success: false,
      time: Math.round(endTime - startTime),
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Run a comprehensive network diagnostic
 * @returns Diagnostic results
 */
export async function runNetworkDiagnostics(): Promise<Record<string, any>> {
  const results: Record<string, any> = {
    browser: {
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled
    },
    location: {
      protocol: window.location.protocol,
      host: window.location.host,
      pathname: window.location.pathname
    },
    localStorage: {
      available: (() => {
        try {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
          return true;
        } catch (e) {
          return false;
        }
      })(),
      size: (() => {
        try {
          let total = 0;
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i) || '';
            const value = localStorage.getItem(key) || '';
            total += key.length + value.length;
          }
          return `${Math.round(total / 1024)} KB`;
        } catch (e) {
          return 'Error calculating';
        }
      })()
    }
  };
  
  // Test connectivity to key domains
  results.connectivity = {
    supabase: await pingDomain('tkflwbqtspizculeiizm.supabase.co'),
    trademe: await pingDomain('api.trademe.co.nz'),
    trademeSandbox: await pingDomain('api.tmsandbox.co.nz')
  };
  
  return results;
}
