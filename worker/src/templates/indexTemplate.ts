/**
 * Returns the HTML for the application, injecting the environment variables
 * This is used to ensure Supabase credentials are available to the client
 */
export function getIndexHtmlTemplate(env?: any): string {
  // Determine if we have the necessary Supabase environment variables
  const hasSupabaseUrl = !!env?.SUPABASE_URL;
  const hasSupabaseAnonKey = !!env?.SUPABASE_ANON_KEY;
  
  // Create a stripped-down version of the env object to inject
  const safeEnv = {
    VITE_SUPABASE_URL: env?.SUPABASE_URL || '',
    VITE_SUPABASE_ANON_KEY: env?.SUPABASE_ANON_KEY || '',
    VITE_API_BASE_URL: env?.API_BASE_URL || 'https://api.trademe.co.nz/v1',
    WORKER_ENV: env?.ENVIRONMENT || 'production',
    WORKER_URL: env?.WORKER_URL || '',
    SUPABASE_URL: env?.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: env?.SUPABASE_ANON_KEY || '',
    IS_INJECTED: true
  };
  
  // Environment variables injection script
  const envScript = `
  <script>
    // Inject environment variables from Cloudflare Worker
    window.ENV = ${JSON.stringify(safeEnv)};
    
    // Also create a mock import.meta.env for compatibility with Vite
    window.import = window.import || {};
    window.import.meta = window.import.meta || {};
    window.import.meta.env = ${JSON.stringify(safeEnv)};
    
    console.log('Environment variables injected from Cloudflare Worker');
  </script>
  `;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TradeMe Property Tracker</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta name="description" content="Track and analyze property listings from TradeMe">
  ${envScript}
  <style>
    /* App loading styles */
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f9fafb;
    }
    #root {
      min-height: 100vh;
    }
    .landing-page {
      padding: 20px;
      max-width: 900px;
      margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .landing-header {
      text-align: center;
      margin-bottom: 40px;
    }
    .landing-title {
      color: #4f46e5;
      font-size: 2.5rem;
      margin-bottom: 16px;
    }
    .landing-subtitle {
      font-size: 1.25rem;
      color: #4b5563;
      max-width: 600px;
      margin: 0 auto;
    }
    .features-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin: 40px 0;
      justify-content: center;
    }
    .feature-card {
      flex: 1;
      min-width: 250px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 24px;
      background-color: white;
    }
    .feature-title {
      color: #111827;
      margin-top: 0;
    }
    .feature-description {
      color: #6b7280;
    }
    .cta-buttons {
      text-align: center;
      margin: 40px 0;
    }
    .btn-primary {
      display: inline-block;
      margin: 0 8px;
      padding: 12px 24px;
      background: #4f46e5;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
    }
    .btn-secondary {
      display: inline-block;
      margin: 0 8px;
      padding: 12px 24px;
      background: white;
      color: #4f46e5;
      text-decoration: none;
      border-radius: 6px;
      border: 1px solid #4f46e5;
      font-weight: bold;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 0.875rem;
    }
    .error-container {
      display: none;
      margin: 2rem auto;
      max-width: 800px;
      padding: 2rem;
      border: 1px solid #f56565;
      border-radius: 0.5rem;
      background-color: #fff5f5;
      color: #c53030;
    }
    .error-details {
      margin-top: 1rem;
      padding: 1rem;
      background-color: #f7fafc;
      border-radius: 0.25rem;
      font-family: monospace;
      white-space: pre-wrap;
      overflow-x: auto;
    }
    body.has-error .error-container {
      display: block;
    }
    body.has-error #root {
      display: none;
    }
    .demo-button {
      display: block;
      margin: 16px auto 0;
      padding: 10px 16px;
      background: #f3f4f6;
      color: #4f46e5;
      text-decoration: none;
      border-radius: 6px;
      border: 1px solid #d1d5db;
      font-weight: bold;
      max-width: 200px;
      text-align: center;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="root">
    <!-- Content will change based on the route -->
    <div class="landing-page">
      <div class="landing-header">
        <h1 class="landing-title">TradeMe Property Tracker</h1>
        <p class="landing-subtitle">
          Track property listings from TradeMe, monitor price changes, and get AI-powered insights into the New Zealand property market.
        </p>
      </div>
      
      <div class="features-grid">
        <div class="feature-card">
          <h3 class="feature-title">Automated Tracking</h3>
          <p class="feature-description">
            Daily tracking of your TradeMe favorites with price, status, and listing changes stored permanently.
          </p>
        </div>
        
        <div class="feature-card">
          <h3 class="feature-title">AI-Powered Insights</h3>
          <p class="feature-description">
            Claude 3.7 Sonnet analyzes your properties, providing intelligent summaries and investment assessments.
          </p>
        </div>
        
        <div class="feature-card">
          <h3 class="feature-title">Multiple Views</h3>
          <p class="feature-description">
            View your properties in cards, tables, or on an interactive map with powerful filtering options.
          </p>
        </div>
      </div>
      
      <div class="cta-buttons">
        <a href="/login" class="btn-primary">Sign in</a>
        <a href="/register" class="btn-secondary">Create account</a>
        <a href="#" id="demo-btn" class="demo-button">Try Demo</a>
      </div>
      
      <div class="footer">
        <p>© 2025 TradeMe Property Tracker. All rights reserved. This is an unofficial third-party application not affiliated with TradeMe Ltd.</p>
      </div>
    </div>
  </div>
  
  <!-- Error display container -->
  <div class="error-container">
    <h2>Application Error</h2>
    <p>There was a problem loading the application. Technical details below:</p>
    <div class="error-details" id="error-details">No specific error details available.</div>
    <div style="margin-top: 1rem;">
      <button onclick="location.reload()">Reload Page</button>
      <button onclick="localStorage.clear(); sessionStorage.clear(); location.reload()">Clear Storage & Reload</button>
      <a href="/debug/static-report" style="margin-left: 10px;">Debug Report</a>
    </div>
  </div>
  
  <script>
    // Enhanced debug information
    const envInfo = {
      location: window.location.toString(),
      href: window.location.href,
      origin: window.location.origin,
      pathname: window.location.pathname,
      host: window.location.host,
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      timestamp: new Date().toISOString(),
      hasWorkerENV: !!window.ENV && Object.keys(window.ENV).length > 0
    };
    console.log('Environment:', envInfo);
    
    // Add debug info to the error details
    const errorDetails = document.getElementById('error-details');
    if (errorDetails) {
      errorDetails.textContent += '\\n\\nEnvironment Info:\\n' + 
        JSON.stringify(envInfo, null, 2);
      
      if (window.ENV) {
        errorDetails.textContent += '\\n\\nInjected Environment Variables:\\n' +
          JSON.stringify({
            SUPABASE_URL_LENGTH: window.ENV.SUPABASE_URL ? window.ENV.SUPABASE_URL.length : 0,
            SUPABASE_ANON_KEY_LENGTH: window.ENV.SUPABASE_ANON_KEY ? window.ENV.SUPABASE_ANON_KEY.length : 0,
            API_BASE_URL: window.ENV.API_BASE_URL,
            WORKER_ENV: window.ENV.WORKER_ENV,
            IS_INJECTED: window.ENV.IS_INJECTED
          }, null, 2);
      }
    }
    
    // Add demo mode functionality
    document.getElementById('demo-btn')?.addEventListener('click', function(e) {
      e.preventDefault();
      document.cookie = 'demo_session=true; path=/; max-age=3600';
      window.location.href = '/dashboard';
    });
    
    // Check if already authenticated and redirect to dashboard
    if ((window.location.pathname === '/' || window.location.pathname === '') && 
        (document.cookie.includes('demo_session=true') || document.cookie.includes('auth_session=true'))) {
      window.location.href = '/dashboard';
    }
    
    // Check if the page loaded correctly with error handling
    window.addEventListener('error', function(e) {
      console.error('Resource error:', e.target.src || e.target.href, e);
      
      // Display error in the UI
      document.body.classList.add('has-error');
      const errorDetails = document.getElementById('error-details');
      if (errorDetails) {
        errorDetails.textContent = 'Resource Error: ' + 
          (e.target.src || e.target.href || 'unknown resource') + 
          '\\nError: ' + (e.message || 'Unknown error') + 
          '\\nTimestamp: ' + new Date().toISOString();
      }
    }, true);
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', function(e) {
      console.error('Unhandled Promise Rejection:', e.reason);
      
      // Display error in the UI
      document.body.classList.add('has-error');
      const errorDetails = document.getElementById('error-details');
      if (errorDetails) {
        errorDetails.textContent = 'Unhandled Promise Rejection: ' + 
          (e.reason ? (e.reason.stack || e.reason.message || JSON.stringify(e.reason)) : 'Unknown error') +
          '\\nTimestamp: ' + new Date().toISOString();
      }
    });
  </script>
  
  <!-- Load the actual app, with event handlers for the fallback UI -->
  <script>
    console.log('Loading React application...');
    
    // Attempt to load the actual React app
    try {
      // Load styles first
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = '/assets/main-CmgkazeW.css';
      document.head.appendChild(cssLink);
      
      // Then load the script
      const script = document.createElement('script');
      script.type = 'module';
      script.src = '/assets/main-HvxJpTcG.js';
      document.body.appendChild(script);
    } catch (e) {
      console.error('Error loading app assets:', e);
    }
  </script>
</body>
</html>`;
}