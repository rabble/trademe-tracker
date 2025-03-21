import { Router } from 'itty-router';
import { handleCors, withCors } from './middleware/cors';
import { withAuth } from './middleware/auth';
import { withRateLimit } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';
import { propertiesRoutes } from './routes/properties';
import { analyticsRoutes } from './routes/analytics';
import { scheduledScraper } from './services/scraper';
import { getIndexHtmlTemplate } from './templates/indexTemplate';

// Simple HTML for landing page
function getSimpleHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TradeMe Property Tracker</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #4f46e5; }
    .cta { margin-top: 30px; }
    .btn { display: inline-block; padding: 10px 20px; background: #4f46e5; color: white; 
           text-decoration: none; border-radius: 5px; margin-right: 10px; }
    .secondary { background: white; color: #4f46e5; border: 1px solid #4f46e5; }
  </style>
</head>
<body>
  <h1>TradeMe Property Tracker</h1>
  <p>Track property listings from TradeMe, monitor price changes, and get insights into the New Zealand property market.</p>
  
  <div class="cta">
    <a href="/login" class="btn">Sign In</a>
    <a href="/register" class="btn secondary">Create Account</a>
    <a href="#" id="demo-btn" class="btn secondary">Try Demo</a>
  </div>

  <script>
    // Simple script to handle demo mode
    document.getElementById('demo-btn').addEventListener('click', function(e) {
      e.preventDefault();
      document.cookie = 'demo_session=true; path=/; max-age=3600';
      window.location.href = '/dashboard';
    });
  </script>
</body>
</html>`;
}

// Simple HTML for login page
function getSimpleLoginHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In - TradeMe Property Tracker</title>
  <style>
    body { font-family: sans-serif; max-width: 400px; margin: 100px auto; padding: 20px; }
    h1 { color: #4f46e5; }
    input { width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; }
    button { padding: 10px 20px; background: #4f46e5; color: white; border: none; 
             border-radius: 5px; cursor: pointer; width: 100%; }
    .demo-info { margin-top: 15px; color: #666; text-align: center; }
    .demo-btn { width: 100%; padding: 10px; margin-top: 10px; background: #f5f5f5; 
                color: #4f46e5; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; }
  </style>
</head>
<body>
  <h1>Sign In</h1>
  <form id="login-form">
    <input type="email" placeholder="Email" id="email" required>
    <input type="password" placeholder="Password" id="password" required>
    <button type="submit">Sign In</button>
  </form>
  
  <div class="demo-info">
    Demo mode is enabled.<br>
    Use <strong>demo@example.com / password123</strong> to sign in with demo credentials.
  </div>
  
  <button id="demo-btn" class="demo-btn">Quick Demo Access</button>
  
  <script>
    // Form submit handler
    document.getElementById('login-form').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      // Check demo credentials
      if (email === 'demo@example.com' && password === 'password123') {
        document.cookie = 'demo_session=true; path=/; max-age=3600';
        window.location.href = '/dashboard';
      } else {
        alert('Demo credentials only: demo@example.com / password123');
      }
    });
    
    // Demo button handler
    document.getElementById('demo-btn').addEventListener('click', function() {
      document.cookie = 'demo_session=true; path=/; max-age=3600';
      window.location.href = '/dashboard';
    });
  </script>
</body>
</html>`;
}

// Using the getSimpleHtml function defined above
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TradeMe Property Tracker</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #4f46e5; }
    .cta { margin-top: 30px; }
    .btn { display: inline-block; padding: 10px 20px; background: #4f46e5; color: white; 
           text-decoration: none; border-radius: 5px; margin-right: 10px; }
    .secondary { background: white; color: #4f46e5; border: 1px solid #4f46e5; }
  </style>
</head>
<body>
  <h1>TradeMe Property Tracker</h1>
  <p>Track property listings from TradeMe, monitor price changes, and get insights into the New Zealand property market.</p>
  
  <div class="cta">
    <a href="/login" class="btn">Sign In</a>
    <a href="/register" class="btn secondary">Create Account</a>
    <a href="#" id="demo-btn" class="btn secondary">Try Demo</a>
  </div>

  <script>
    // Simple script to handle demo mode
    document.getElementById('demo-btn').addEventListener('click', function(e) {
      e.preventDefault();
      document.cookie = 'demo_session=true; path=/; max-age=3600';
      window.location.href = '/dashboard';
    });
  </script>
</body>
</html>`;
}

// Using the first definition of getSimpleLoginHtml above
/* function getSimpleLoginHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In - TradeMe Property Tracker</title>
  <style>
    body { font-family: sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 400px; margin: 100px auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h2 { color: #4f46e5; text-align: center; margin-bottom: 20px; }
    label { display: block; margin-bottom: 5px; color: #4b5563; }
    input { width: 100%; padding: 8px; margin-bottom: 16px; border: 1px solid #d1d5db; border-radius: 4px; }
    button { width: 100%; background: #4f46e5; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer; font-weight: 500; }
    .error { color: #ef4444; font-size: 14px; margin-bottom: 16px; }
    .demo-info { margin-top: 16px; text-align: center; font-size: 14px; color: #6b7280; }
    .links { margin-top: 16px; text-align: center; }
    a { color: #4f46e5; text-decoration: none; }
    .demo-btn { display: block; width: 100%; background: #f3f4f6; color: #4f46e5; border: 1px solid #d1d5db; padding: 8px; border-radius: 4px; cursor: pointer; font-weight: 500; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Sign In</h2>
    <div id="login-error" class="error"></div>
    <form id="login-form">
      <label for="email">Email</label>
      <input type="email" id="email" required>
      
      <label for="password">Password</label>
      <input type="password" id="password" required>
      
      <button type="submit">Sign In</button>
    </form>
    
    <div class="demo-info">
      Demo mode is enabled.<br>Use <strong>demo@example.com / password123</strong> to sign in with demo credentials.
    </div>
    
    <button id="quick-demo-btn" class="demo-btn">Enter Quick Demo</button>
    
    <div class="links">
      <a href="/">Back to Home</a>
    </div>
  </div>
  
  <script>
    // Login form submission
    document.getElementById('login-form').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const errorElement = document.getElementById('login-error');
      
      // Check for demo credentials
      if (email === 'demo@example.com' && password === 'password123') {
        document.cookie = 'demo_session=true; path=/; max-age=3600';
        window.location.href = '/dashboard';
        return;
      }
      
      // Show error for non-demo credentials
      errorElement.textContent = 'Invalid credentials. Try demo@example.com / password123';
    });
    
    // Quick demo button
    document.getElementById('quick-demo-btn').addEventListener('click', function() {
      document.cookie = 'demo_session=true; path=/; max-age=3600';
      window.location.href = '/dashboard';
    });
  </script>
</body>
</html>`;
*/  // End of commented out function}

function getSimpleDashboardHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard - TradeMe Property Tracker</title>
  <style>
    body { font-family: sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
    h1 { font-size: 1.5rem; font-weight: bold; color: #111827; margin: 0; }
    button { background: transparent; border: none; color: #4f46e5; cursor: pointer; }
    .card { background-color: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h2 { font-size: 1.25rem; font-weight: 600; margin-bottom: 16px; color: #111827; }
    .stats { display: flex; flex-wrap: wrap; gap: 16px; background-color: #f9fafb; padding: 16px; border-radius: 6px; margin-top: 16px; }
    .stat-card { flex: 1; min-width: 200px; background-color: white; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb; }
    .stat-label { font-size: 0.875rem; color: #6b7280; }
    .stat-value { font-size: 1.5rem; font-weight: 600; color: #111827; }
    .insight { padding: 16px; border: 1px solid #e5e7eb; border-radius: 6px; background-color: #f9fafb; margin-bottom: 16px; font-style: italic; color: #4b5563; }
    footer { text-align: center; margin-top: 40px; color: #9ca3af; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>TradeMe Property Tracker</h1>
      <div>
        <span style="color: #6b7280; margin-right: 12px;">Demo User</span>
        <button id="logout-button">Sign Out</button>
      </div>
    </header>
    
    <div class="card">
      <h2>Dashboard</h2>
      <p>Welcome to the demo dashboard! This is a simplified version of the TradeMe Property Tracker dashboard.</p>
      
      <div class="stats">
        <div class="stat-card">
          <div class="stat-label">Properties</div>
          <div class="stat-value">24</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Watchlist</div>
          <div class="stat-value">12</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Price Alerts</div>
          <div class="stat-value">3</div>
        </div>
      </div>
    </div>
    
    <div class="card">
      <h2>Recent AI Insights</h2>
      <div class="insight">
        "Property prices in Wellington have decreased by 2.3% over the past month, while Auckland properties have remained stable."
      </div>
      <div class="insight">
        "Properties in your watchlist have been on the market for an average of 45 days, which is 12 days longer than the market average."
      </div>
    </div>
    
    <footer>
      <p>© 2025 TradeMe Property Tracker Demo</p>
    </footer>
  </div>
  
  <script>
    // Logout functionality
    document.getElementById('logout-button').addEventListener('click', function() {
      // Clear the session cookie
      document.cookie = 'demo_session=; path=/; max-age=0';
      document.cookie = 'auth_session=; path=/; max-age=0';
      // Redirect to home page
      window.location.href = '/';
    });
  </script>
</body>
</html>`;
}

// Create a new router
const router = Router();

// CORS preflight requests
router.options('*', handleCors);

// Apply middleware to all routes
router.all('*', withCors, withRateLimit);

// API routes
router.get('/api/health', () => new Response('OK', { status: 200 }));

// Protected routes
router.all('/api/properties/*', withAuth, propertiesRoutes.handle);
router.all('/api/analytics/*', withAuth, analyticsRoutes.handle);

// 404 for API routes
router.all('/api/*', () => new Response('API Not Found', { status: 404 }));

// Event handlers
export default {
  // Handle HTTP requests
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    console.log('Environment bindings:', {
      hasAssets: !!env.ASSETS,
      hasStaticContent: !!env.__STATIC_CONTENT,
      hasStaticContentManifest: !!env.__STATIC_CONTENT_MANIFEST,
      availableBindings: Object.keys(env)
    });
    
    try {
      const url = new URL(request.url);
      
      // Handle root path directly without any redirect
      if (url.pathname === '/' || url.pathname === '') {
        console.log('Directly handling root path');
        return new Response(getIndexHtmlTemplate(env), {
          headers: { 'Content-Type': 'text/html' }
        });
      }
      
      // Handle login path directly without any redirect
      if (url.pathname === '/login') {
        console.log('Directly handling login path');
        return new Response(getIndexHtmlTemplate(env), {
          headers: { 'Content-Type': 'text/html' }
        });
      }
      
      // Handle dashboard path directly
      if (url.pathname === '/dashboard') {
        console.log('Directly handling dashboard path');
        // Check for auth cookies
        const cookieHeader = request.headers.get('Cookie') || '';
        const hasSession = cookieHeader.includes('demo_session=true') || 
                           cookieHeader.includes('auth_session=true');
        
        // Redirect to login if not authenticated
        if (!hasSession) {
          return Response.redirect(`${url.origin}/login`, 302);
        }
        
        return new Response(getIndexHtmlTemplate(env), {
          headers: { 'Content-Type': 'text/html' }
        });
      }
      
      // Debug endpoints to help diagnose issues
      if (url.pathname === '/debug') {
        return new Response(JSON.stringify({
          bindings: Object.keys(env),
          hasStaticContent: !!env.__STATIC_CONTENT,
          hasStaticContentManifest: !!env.__STATIC_CONTENT_MANIFEST,
          hasAssets: !!env.ASSETS,
          url: request.url,
          method: request.method,
          headers: Object.fromEntries([...request.headers]),
          timestamp: new Date().toISOString()
        }, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Super detailed debug page that works completely independently
      if (url.pathname === '/debug/static-report') {
        try {
          // Get environment bindings
          const bindings: any = {
            hasAssets: !!env.ASSETS,
            hasStaticContent: !!env.__STATIC_CONTENT,
            hasStaticContentManifest: !!env.__STATIC_CONTENT_MANIFEST,
            availableBindings: Object.keys(env),
            environment: env.ENVIRONMENT || 'unknown',
            supabaseUrl: env.SUPABASE_URL ? `${env.SUPABASE_URL.substring(0, 10)}...` : 'missing',
            supabaseKeyAvailable: !!env.SUPABASE_ANON_KEY,
            timestamp: new Date().toISOString()
          };
          
          // Create an HTML response that doesn't rely on any external assets
          const html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Debug Report - TradeMe Tracker</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; padding: 20px; }
              pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
              button { padding: 8px 15px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
              .panel { margin-bottom: 20px; border: 1px solid #ddd; border-radius: 5px; padding: 10px; }
              .success { background-color: #e8f5e9; }
              .error { background-color: #ffebee; }
              table { width: 100%; border-collapse: collapse; }
              th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
              #results { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 15px; }
            </style>
          </head>
          <body>
            <h1>Worker Debug Report</h1>
            <p>This is a standalone debugging page for the TradeMe Tracker worker.</p>
            
            <div class="panel ${bindings.hasStaticContent ? 'success' : 'error'}">
              <h2>Environment Bindings</h2>
              <table>
                <tr>
                  <th>Binding</th>
                  <th>Status</th>
                </tr>
                <tr>
                  <td>__STATIC_CONTENT</td>
                  <td>${bindings.hasStaticContent ? '✅ Available' : '❌ Missing'}</td>
                </tr>
                <tr>
                  <td>__STATIC_CONTENT_MANIFEST</td>
                  <td>${bindings.hasStaticContentManifest ? '✅ Available' : '❌ Missing'}</td>
                </tr>
                <tr>
                  <td>ASSETS</td>
                  <td>${bindings.hasAssets ? '✅ Available' : '❌ Missing'}</td>
                </tr>
                <tr>
                  <td>SUPABASE_URL</td>
                  <td>${bindings.supabaseUrl || '❌ Missing'}</td>
                </tr>
                <tr>
                  <td>SUPABASE_ANON_KEY</td>
                  <td>${bindings.supabaseKeyAvailable ? '✅ Available' : '❌ Missing'}</td>
                </tr>
              </table>
              <p>Available bindings: ${bindings.availableBindings.join(', ')}</p>
            </div>
            
            <div class="panel">
              <h2>Request Information</h2>
              <pre>${JSON.stringify({
                url: request.url,
                method: request.method,
                headers: Object.fromEntries([...request.headers]),
                userAgent: request.headers.get('user-agent') || 'unknown'
              }, null, 2)}</pre>
            </div>
            
            <div class="panel">
              <h2>Asset Tests</h2>
              <p>Click these buttons to test loading specific assets directly:</p>
              <div>
                <button onclick="testAsset('/assets/main-C7ba_0wZ.js')">Test main JS</button>
                <button onclick="testAsset('/assets/main-DZ89tJPn.css')">Test main CSS</button>
                <button onclick="testAsset('/favicon.svg')">Test favicon</button>
                <button onclick="testAsset('/index.html')">Test index.html</button>
                <button onclick="testManifest()">Test manifest parsing</button>
                <button onclick="testGenIndex()">Test generated index.html</button>
              </div>
              <div id="results">Results will appear here...</div>
            </div>
            
            <script>
              // Function to test loading an asset
              async function testAsset(path) {
                const results = document.getElementById('results');
                results.innerHTML = 'Loading ' + path + '...';
                
                try {
                  const start = performance.now();
                  const response = await fetch(path);
                  const elapsed = (performance.now() - start).toFixed(2);
                  
                  if (!response.ok) {
                    throw new Error('HTTP error ' + response.status);
                  }
                  
                  const contentType = response.headers.get('content-type');
                  let body = '';
                  
                  if (contentType && contentType.includes('image')) {
                    body = '[Image data]';
                  } else if (contentType && (contentType.includes('javascript') || contentType.includes('css') || contentType.includes('html'))) {
                    const text = await response.text();
                    body = text.substring(0, 500) + (text.length > 500 ? '...' : '');
                  } else {
                    body = await response.text();
                  }
                  
                  results.innerHTML = \`
                    <h3>✅ Success loading \${path}</h3>
                    <p>Loaded in \${elapsed}ms</p>
                    <p>Content-Type: \${contentType || 'not specified'}</p>
                    <p>Content-Length: \${response.headers.get('content-length') || 'unknown'}</p>
                    <p>Response status: \${response.status}</p>
                    <pre>\${body}</pre>
                  \`;
                } catch (error) {
                  results.innerHTML = \`
                    <h3>❌ Error loading \${path}</h3>
                    <p>Error: \${error.message}</p>
                    <p>This means the worker failed to serve this asset.</p>
                  \`;
                }
              }
              
              // Test the manifest directly
              async function testManifest() {
                const results = document.getElementById('results');
                results.innerHTML = 'Testing manifest...';
                
                try {
                  const response = await fetch('/debug/static-content');
                  const data = await response.json();
                  
                  results.innerHTML = \`
                    <h3>Manifest Test Results</h3>
                    <pre>\${JSON.stringify(data, null, 2)}</pre>
                  \`;
                } catch (error) {
                  results.innerHTML = \`
                    <h3>❌ Error testing manifest</h3>
                    <p>Error: \${error.message}</p>
                  \`;
                }
              }
              
              // Test the generated index HTML
              async function testGenIndex() {
                const results = document.getElementById('results');
                results.innerHTML = 'Testing generated index.html...';
                
                try {
                  const response = await fetch('/');
                  const html = await response.text();
                  
                  // Check if it contains injected ENV
                  const hasEnv = html.includes('window.ENV');
                  const hasSupabaseUrl = html.includes('SUPABASE_URL');
                  const hasRootDiv = html.includes('<div id="root">');
                  
                  results.innerHTML = \`
                    <h3>Generated Index HTML Test</h3>
                    <p>Response length: \${html.length} characters</p>
                    <p>Contains ENV injection: \${hasEnv ? '✅ Yes' : '❌ No'}</p>
                    <p>Contains Supabase URL: \${hasSupabaseUrl ? '✅ Yes' : '❌ No'}</p>
                    <p>Contains root div: \${hasRootDiv ? '✅ Yes' : '❌ No'}</p>
                    <p>First 500 characters:</p>
                    <pre>\${html.substring(0, 500)}...</pre>
                  \`;
                } catch (error) {
                  results.innerHTML = \`
                    <h3>❌ Error testing generated index</h3>
                    <p>Error: \${error.message}</p>
                  \`;
                }
              }
            </script>
          </body>
          </html>
          `;
          
          return new Response(html, {
            headers: { 'Content-Type': 'text/html' }
          });
        } catch (error) {
          return new Response('Error generating debug page: ' + (error instanceof Error ? error.message : String(error)), {
            status: 500,
            headers: { 'Content-Type': 'text/plain' }
          });
        }
      }
      
      // Debug endpoint to list all static content
      if (url.pathname === '/debug/static-content') {
        try {
          const debug: any = {
            timestamp: new Date().toISOString(),
            bindings: {
              has_static_content: !!env.__STATIC_CONTENT,
              has_static_content_manifest: !!env.__STATIC_CONTENT_MANIFEST,
              has_assets: !!env.ASSETS
            }
          };
          
          // Try to list assets from __STATIC_CONTENT binding
          if (env.__STATIC_CONTENT) {
            try {
              const assets = await env.__STATIC_CONTENT.list();
              debug.static_content = {
                assets: assets.keys.map(k => k.name),
                count: assets.keys.length
              };
            } catch (listError) {
              debug.static_content_error = listError instanceof Error ? 
                listError.message : String(listError);
            }
          }
          
          // Try to parse the manifest
          if (env.__STATIC_CONTENT_MANIFEST) {
            try {
              const manifest = JSON.parse(env.__STATIC_CONTENT_MANIFEST);
              debug.manifest = {
                entries: Object.keys(manifest),
                count: Object.keys(manifest).length,
                sample: Object.entries(manifest).slice(0, 5)
              };
            } catch (manifestError) {
              debug.manifest_error = manifestError instanceof Error ? 
                manifestError.message : String(manifestError);
            }
          }
          
          return new Response(JSON.stringify(debug, null, 2), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
          }, null, 2), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      
      // Debug endpoint that provides a very complete HTML page with diagnostics
      if (url.pathname === '/debug-page') {
        const html = `<!DOCTYPE html>
<html>
<head>
  <title>TradeMe Tracker - Debug Page</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: sans-serif; margin: 0; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { color: #333; }
    h2 { color: #555; margin-top: 30px; }
    .card { background: #f5f5f5; border-radius: 5px; padding: 15px; margin-bottom: 20px; }
    .success { background: #e6ffe6; border-left: 4px solid #4CAF50; }
    .error { background: #ffebee; border-left: 4px solid #f44336; }
    .warning { background: #fff8e1; border-left: 4px solid #FFC107; }
    pre { background: #eee; padding: 10px; border-radius: 3px; overflow-x: auto; }
    .test-btn { padding: 8px 15px; background: #4CAF50; color: white; border: none; 
                border-radius: 4px; cursor: pointer; margin-right: 10px; }
    .test-btn.secondary { background: #2196F3; }
    .hidden { display: none; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <div class="container">
    <h1>TradeMe Tracker Debug Page</h1>
    <p>This page provides diagnostic information about the worker and environment.</p>
    
    <div class="card">
      <h2>Request Information</h2>
      <table>
        <tr>
          <th>Property</th>
          <th>Value</th>
        </tr>
        <tr>
          <td>URL</td>
          <td>${request.url}</td>
        </tr>
        <tr>
          <td>Method</td>
          <td>${request.method}</td>
        </tr>
        <tr>
          <td>Headers</td>
          <td><pre>${JSON.stringify(Object.fromEntries([...request.headers]), null, 2)}</pre></td>
        </tr>
        <tr>
          <td>User Agent</td>
          <td>${request.headers.get('user-agent') || 'Not provided'}</td>
        </tr>
      </table>
    </div>
    
    <div class="card ${env.SUPABASE_URL ? 'success' : 'error'}">
      <h2>Environment Variables</h2>
      <table>
        <tr>
          <th>Variable</th>
          <th>Status</th>
        </tr>
        <tr>
          <td>SUPABASE_URL</td>
          <td>${env.SUPABASE_URL ? 'Available ✅' : 'Missing ❌'}</td>
        </tr>
        <tr>
          <td>SUPABASE_ANON_KEY</td>
          <td>${env.SUPABASE_ANON_KEY ? 'Available ✅' : 'Missing ❌'}</td>
        </tr>
        <tr>
          <td>API_BASE_URL</td>
          <td>${env.API_BASE_URL ? env.API_BASE_URL : 'Not set'}</td>
        </tr>
        <tr>
          <td>TRADEME_BASE_URL</td>
          <td>${env.TRADEME_BASE_URL || 'Not set'}</td>
        </tr>
        <tr>
          <td>TRADEME_SANDBOX_MODE</td>
          <td>${env.TRADEME_SANDBOX_MODE || 'Not set'}</td>
        </tr>
      </table>
    </div>
    
    <div class="card">
      <h2>Worker Bindings</h2>
      <table>
        <tr>
          <th>Binding</th>
          <th>Status</th>
        </tr>
        <tr>
          <td>__STATIC_CONTENT</td>
          <td>${env.__STATIC_CONTENT ? 'Available ✅' : 'Missing ❌'}</td>
        </tr>
        <tr>
          <td>__STATIC_CONTENT_MANIFEST</td>
          <td>${env.__STATIC_CONTENT_MANIFEST ? 'Available ✅' : 'Missing ❌'}</td>
        </tr>
        <tr>
          <td>ASSETS</td>
          <td>${env.ASSETS ? 'Available ✅' : 'Missing ❌'}</td>
        </tr>
        <tr>
          <td>PROPERTIES_KV</td>
          <td>${env.PROPERTIES_KV ? 'Available ✅' : 'Missing ❌'}</td>
        </tr>
      </table>
    </div>
    
    <div class="card">
      <h2>Tests</h2>
      <div>
        <button id="test-supabase" class="test-btn">Test Supabase Connection</button>
        <button id="test-js-load" class="test-btn secondary">Test JS Loading</button>
        <button id="test-css-load" class="test-btn secondary">Test CSS Loading</button>
      </div>
      <div id="test-results" class="hidden">
        <h3>Results</h3>
        <pre id="results-output"></pre>
      </div>
    </div>
    
    <script>
      // Helper function to update test results
      function updateResults(message, isError = false) {
        const results = document.getElementById('test-results');
        const output = document.getElementById('results-output');
        results.classList.remove('hidden');
        results.classList.add(isError ? 'error' : 'success');
        output.textContent += message + '\\n';
      }
      
      // Test Supabase Connection
      document.getElementById('test-supabase').addEventListener('click', async () => {
        updateResults('Testing Supabase connection...');
        try {
          const envVars = {
            SUPABASE_URL: '${env.SUPABASE_URL || ""}',
            SUPABASE_ANON_KEY: '${env.SUPABASE_ANON_KEY ? "Available" : "Missing"}',
          };
          
          updateResults('Environment variables: ' + JSON.stringify(envVars));
          
          if (!envVars.SUPABASE_URL || envVars.SUPABASE_ANON_KEY === 'Missing') {
            throw new Error('Missing Supabase credentials');
          }
          
          // Try to fetch from Supabase
          const response = await fetch(envVars.SUPABASE_URL + '/rest/v1/properties?limit=1', {
            headers: {
              'apikey': '${env.SUPABASE_ANON_KEY || ""}',
              'Authorization': 'Bearer ${env.SUPABASE_ANON_KEY || ""}'
            }
          });
          
          const data = await response.json();
          updateResults('Supabase response: ' + JSON.stringify(data));
        } catch (error) {
          updateResults('Supabase connection error: ' + error.message, true);
        }
      });
      
      // Test JavaScript Loading
      document.getElementById('test-js-load').addEventListener('click', () => {
        updateResults('Testing JavaScript loading...');
        const script = document.createElement('script');
        script.src = '/assets/main-BMIXvh54.js';
        script.onerror = () => updateResults('Failed to load JavaScript', true);
        script.onload = () => updateResults('JavaScript loaded successfully');
        document.body.appendChild(script);
      });
      
      // Test CSS Loading
      document.getElementById('test-css-load').addEventListener('click', () => {
        updateResults('Testing CSS loading...');
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/assets/main-DZ89tJPn.css';
        link.onerror = () => updateResults('Failed to load CSS', true);
        link.onload = () => updateResults('CSS loaded successfully');
        document.head.appendChild(link);
      });
      
      // Log that the debug page is loaded
      console.log('Debug page loaded successfully at ' + new Date().toISOString());
    </script>
  </div>
</body>
</html>`;

        return new Response(html, {
          headers: { 'Content-Type': 'text/html' }
        });
      }
      
      // Debug endpoint to test asset serving
      if (url.pathname === '/debug/serve-test') {
        const testPath = url.searchParams.get('path') || '/index.html';
        const debugInfo: any = {
          requested_path: testPath,
          timestamp: new Date().toISOString(),
          steps: []
        };
        
        // Check ASSETS binding
        if (env.ASSETS) {
          debugInfo.steps.push({
            step: "Checking ASSETS binding",
            has_binding: true
          });
          
          try {
            // Create a test request
            const testRequest = new Request(new URL(testPath, request.url).toString());
            debugInfo.test_url = testRequest.url;
            // Don't actually fetch, just log that we would
          } catch (error) {
            debugInfo.steps.push({
              step: "Error creating test request",
              error: error instanceof Error ? error.message : String(error)
            });
          }
        } else {
          debugInfo.steps.push({
            step: "Checking ASSETS binding",
            has_binding: false
          });
        }
        
        // Check manifest
        if (env.__STATIC_CONTENT_MANIFEST) {
          debugInfo.steps.push({
            step: "Checking manifest",
            has_manifest: true
          });
          
          try {
            const manifest = JSON.parse(env.__STATIC_CONTENT_MANIFEST);
            const manifestKey = testPath.startsWith('/') ? testPath.substring(1) : testPath;
            
            debugInfo.steps.push({
              step: "Looking up in manifest",
              manifest_key: manifestKey,
              found: manifestKey in manifest,
              hashed_name: manifest[manifestKey]
            });
          } catch (error) {
            debugInfo.steps.push({
              step: "Error parsing manifest",
              error: error instanceof Error ? error.message : String(error)
            });
          }
        } else {
          debugInfo.steps.push({
            step: "Checking manifest",
            has_manifest: false
          });
        }
        
        // Check direct KV access
        if (env.__STATIC_CONTENT) {
          debugInfo.steps.push({
            step: "Checking direct KV access",
            has_kv: true
          });
          
          try {
            const key = testPath.startsWith('/') ? testPath.substring(1) : testPath;
            
            debugInfo.steps.push({
              step: "Looking up in KV",
              key: key
            });
            
            const exists = await env.__STATIC_CONTENT.get(key, { type: 'stream' }) !== null;
            
            debugInfo.steps.push({
              step: "KV lookup result",
              found: exists
            });
          } catch (error) {
            debugInfo.steps.push({
              step: "Error with KV access",
              error: error instanceof Error ? error.message : String(error)
            });
          }
        } else {
          debugInfo.steps.push({
            step: "Checking direct KV access",
            has_kv: false
          });
        }
        
        return new Response(JSON.stringify(debugInfo, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Handle API requests
      if (url.pathname.startsWith('/api/')) {
        return router.handle(request, env, ctx).catch(errorHandler);
      }
      
      // Use the index HTML template for register (same as other routes)
      if (url.pathname === '/register') {
        return new Response(getIndexHtmlTemplate(env), {
          headers: { 'Content-Type': 'text/html' }
        });
      }
      
      // Default to the index HTML template for any other path
      console.log('Unhandled path, serving index HTML template for:', url.pathname);
      return new Response(getIndexHtmlTemplate(env), {
        headers: { 'Content-Type': 'text/html' }
      });
    } catch (error) {
      console.error("Unhandled error in fetch handler:", error);
      return errorHandler(error);
    }
  },

  // Handle scheduled events
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(scheduledScraper(env));
    
    // Log that we're using sandbox mode if enabled
    if (env.TRADEME_SANDBOX_MODE === 'true') {
      console.log('TradeMe API is running in sandbox mode');
    }
  },
};

/**
 * Get the content type based on file extension
 */
function getContentType(path: string): string {
  const extension = path.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'html':
      return 'text/html';
    case 'css':
      return 'text/css';
    case 'js':
    case 'mjs':
      return 'application/javascript';
    case 'json':
      return 'application/json';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'svg':
      return 'image/svg+xml';
    case 'ico':
      return 'image/x-icon';
    case 'map':
      return 'application/json';
    default:
      return 'text/plain';
  }
}

/**
 * Creates a redirect response to another page
 */
function createRedirect(destination: string): Response {
  return new Response(
    `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="refresh" content="0;url=${destination}">
        <title>Redirecting...</title>
      </head>
      <body>
        Redirecting to ${destination}...
        <script>
          window.location.href = "${destination}";
        </script>
      </body>
    </html>
    `,
    {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    }
  );
}

/**
 * Serves static content and handles SPA routing
 * Simplified to avoid Promise resolution issues
 */
// This function is not used anymore and has been replaced by direct HTML template rendering
/* function serveStaticContent(request: Request, env: Env): Response {
  const url = new URL(request.url);
  console.log(`Handling request for: ${url.pathname}`);
  
  try {
    // Get the pathname from the URL
    let path = url.pathname;
    
    // For root, return the HTML template directly
    if (path === '/' || path === '') {
      console.log('Serving landing page');
      return new Response(getIndexHtmlTemplate(env), {
        headers: { 
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache, must-revalidate'
        }
      });
    }
    
    // Handle index.html
    if (path === '/index.html') {
      console.log('Serving index.html template');
      return new Response(getIndexHtmlTemplate(env), {
        headers: { 
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache, must-revalidate'
        }
      });
    }
    
    // Handle login and dashboard routes
    if (path === '/login' || path === '/dashboard') {
      console.log(`Serving ${path} page`);
      
      // Check for demo session cookie
      const cookieHeader = request.headers.get('Cookie') || '';
      const hasDemoSession = cookieHeader.includes('demo_session=true');
      
      // Redirect unauthenticated users away from dashboard
      if (path === '/dashboard' && !hasDemoSession) {
        console.log('Unauthenticated access to dashboard, redirecting to login');
        return Response.redirect(`${url.origin}/login`, 302);
      }
      
      // If user is already authenticated with demo, redirect from login to dashboard
      if (path === '/login' && hasDemoSession) {
        console.log('Authenticated user accessing login page, redirecting to dashboard');
        return Response.redirect(`${url.origin}/dashboard`, 302);
      }
      
      return new Response(getIndexHtmlTemplate(env), {
        headers: { 
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache, must-revalidate'
        }
      });
    }
    
    // Special handling for favicon.svg
    if (path.endsWith('favicon.svg') || path === '/favicon.ico') {
      const favicon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-home">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>`;
      
      return new Response(favicon, {
        headers: { 
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=31536000' 
        }
      });
    }
    
    // Simple handling for JS files - return empty JS
    if (path.endsWith('.js')) {
      console.log('Serving placeholder JS for:', path);
      return new Response(
        `// Placeholder JavaScript file\nconsole.log("Worker served placeholder for: ${path}");`,
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/javascript',
            'Cache-Control': 'public, max-age=31536000'
          }
        }
      );
    }
    
    // Simple handling for CSS files - return empty CSS
    if (path.endsWith('.css')) {
      console.log('Serving placeholder CSS for:', path);
      return new Response(
        `/* Placeholder CSS file */`,
        { 
          status: 200,
          headers: { 
            'Content-Type': 'text/css',
            'Cache-Control': 'public, max-age=31536000'
          }
        }
      );
    }
    
    // Catch-all for all non-asset paths - serve the HTML template
    if (!path.includes('.')) {
      console.log('Serving HTML template for client-side route:', path);
      return new Response(getIndexHtmlTemplate(env), {
        headers: { 
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache, must-revalidate' 
        }
      });
    }
    
    // For any other asset request, return an empty response with correct content type
    console.log('Serving empty response for unknown asset:', path);
    return new Response('', { 
      status: 200, 
      headers: { 
        'Content-Type': getContentType(path),
        'Cache-Control': 'no-cache, must-revalidate' 
      }
    });
  } catch (error) {
    console.error('Error in static content serving:', error);
    return new Response('Server Error', { 
      status: 500, 
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Environment interface
export interface Env {
  PROPERTIES_KV: KVNamespace;
  API_BASE_URL: string;
  TRADEME_API_URL: string;
  ENVIRONMENT: string;
  TRADEME_CONSUMER_KEY: string;
  TRADEME_CONSUMER_SECRET: string;
  TRADEME_OAUTH_TOKEN: string;
  TRADEME_OAUTH_TOKEN_SECRET: string;
  SCRAPE_INTERVAL_HOURS: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_STORAGE_BUCKET: string;
  TRADEME_SANDBOX_MODE: string;
  DEMO_MODE_ENABLED?: string; // 'true' or 'false'
  // Static assets
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
  // Workers Sites KV namespace
  __STATIC_CONTENT?: {
    get: (key: string, options?: { type: 'stream' | 'text' | 'json' | 'arrayBuffer' }) => Promise<any>;
    put: (key: string, value: string | ReadableStream | ArrayBuffer | FormData) => Promise<void>;
    delete: (key: string) => Promise<void>;
    list: (options?: { prefix?: string; limit?: number; cursor?: string }) => Promise<{ keys: { name: string; expiration?: number; metadata?: any }[] }>;
  };
  __STATIC_CONTENT_MANIFEST?: string;
}
*/  // End of commented out function
