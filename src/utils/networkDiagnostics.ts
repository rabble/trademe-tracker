/**
 * Network diagnostics utility to help troubleshoot connection issues
 */
import { logErrorDetails } from '../lib/debugUtils';

/**
 * Check if a domain is reachable
 * @param domain Domain to check
 * @param path Optional path to check (defaults to /favicon.ico)
 * @returns Promise with ping result
 */
export async function pingDomain(
  domain: string, 
  path: string = '/favicon.ico'
): Promise<{
  success: boolean;
  time: number | null;
  error: string | null;
  status?: number;
  headers?: Record<string, string>;
}> {
  const startTime = performance.now();
  
  try {
    // Try to fetch a small resource from the domain
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const url = `https://${domain}${path}`;
    console.log(`Pinging URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors', // This allows us to ping the domain without CORS issues
      cache: 'no-cache',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const endTime = performance.now();
    
    // Try to extract headers (may fail due to CORS)
    let headers: Record<string, string> = {};
    try {
      headers = Object.fromEntries([...response.headers.entries()]);
    } catch (e) {
      console.log('Could not extract headers:', e);
    }
    
    return {
      success: true,
      time: Math.round(endTime - startTime),
      error: null,
      status: response.status,
      headers
    };
  } catch (error) {
    const endTime = performance.now();
    console.error(`Error pinging ${domain}:`, error);
    logErrorDetails(`Ping ${domain}`, error);
    
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
  console.log('Starting network diagnostics...');
  
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    browser: {
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled
    },
    location: {
      protocol: window.location.protocol,
      host: window.location.host,
      pathname: window.location.pathname,
      href: window.location.href,
      origin: window.location.origin
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
    },
    environment: {
      nodeEnv: import.meta.env?.MODE || 'unknown',
      hasSupabaseUrl: !!import.meta.env?.VITE_SUPABASE_URL,
      hasSupabaseKey: !!import.meta.env?.VITE_SUPABASE_ANON_KEY,
      supabaseUrlLength: (import.meta.env?.VITE_SUPABASE_URL as string || '').length,
      supabaseKeyLength: (import.meta.env?.VITE_SUPABASE_ANON_KEY as string || '').length
    }
  };
  
  // Test connectivity to key domains
  console.log('Testing connectivity to key domains...');
  
  const domains = [
    { name: 'supabase', domain: 'tkflwbqtspizculeiizm.supabase.co' },
    { name: 'trademe', domain: 'api.trademe.co.nz' },
    { name: 'trademeSandbox', domain: 'api.tmsandbox.co.nz' },
    { name: 'trademeOAuth', domain: 'api.trademe.co.nz', path: '/Oauth' },
    { name: 'trademeSandboxOAuth', domain: 'api.tmsandbox.co.nz', path: '/Oauth' },
    { name: 'google', domain: 'google.com' },
    { name: 'cloudflare', domain: 'cloudflare.com' }
  ];
  
  results.connectivity = {};
  
  // Run pings sequentially to avoid overwhelming the network
  for (const { name, domain, path = '/favicon.ico' } of domains) {
    console.log(`Testing connectivity to ${domain}${path}...`);
    results.connectivity[name] = await pingDomain(domain, path);
  }
  
  // Test direct Supabase API access
  try {
    console.log('Testing direct Supabase API access...');
    const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL as string;
    if (supabaseUrl) {
      const healthUrl = `${supabaseUrl}/rest/v1/`;
      console.log(`Fetching Supabase health at ${healthUrl}...`);
      
      const startTime = performance.now();
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      const endTime = performance.now();
      
      results.supabaseDirectAccess = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        time: Math.round(endTime - startTime),
        headers: Object.fromEntries([...response.headers.entries()])
      };
    } else {
      results.supabaseDirectAccess = {
        success: false,
        error: 'No Supabase URL available'
      };
    }
  } catch (error) {
    console.error('Error testing direct Supabase access:', error);
    logErrorDetails('Supabase Direct Access', error);
    
    results.supabaseDirectAccess = {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
  
  console.log('Network diagnostics completed:', results);
  return results;
}
