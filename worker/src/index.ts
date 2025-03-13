import { Router } from 'itty-router';
import { handleCors, withCors } from './middleware/cors';
import { withAuth } from './middleware/auth';
import { withRateLimit } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';
import { propertiesRoutes } from './routes/properties';
import { analyticsRoutes } from './routes/analytics';
import { scheduledScraper } from './services/scraper';

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
    try {
      const url = new URL(request.url);
      
      // Handle API requests
      if (url.pathname.startsWith('/api/')) {
        return router.handle(request, env, ctx).catch(errorHandler);
      }
      
      // For all other requests, serve static assets from the site
      try {
        console.log(`Handling request for: ${url.pathname}`);
        
        // When deployed with wrangler, the __STATIC_CONTENT binding is available
        if (env.__STATIC_CONTENT) {
          let path = url.pathname;
          
          // Default to index.html for the root path
          if (path === '/' || path === '') {
            path = '/index.html';
          }
          
          console.log(`Looking for asset: ${path}`);
          
          // List all available assets for debugging
          const assets = await env.__STATIC_CONTENT.list();
          console.log('Available assets:', assets.keys.map(k => k.name));
          
          // Remove leading slash for KV lookup
          const key = path.replace(/^\//, '');
          
          // Try to get the asset from KV
          let asset = null;
          
          // First, try to find the exact asset by key
          if (key === 'index.html') {
            // For index.html, find the hashed version
            const indexFile = assets.keys.find(k => k.name.startsWith('index') && k.name.endsWith('.html'));
            if (indexFile) {
              console.log(`Found index file: ${indexFile.name}`);
              asset = await env.__STATIC_CONTENT.get(indexFile.name);
            }
          } else if (path.startsWith('/assets/')) {
            // For assets in the /assets/ directory, they might be hashed
            const baseName = path.split('/').pop();
            if (baseName) {
              const fileNameParts = baseName.split('.');
              const extension = fileNameParts.pop();
              const nameWithoutExt = fileNameParts.join('.');
              
              // Try to find a matching asset with a hash
              const matchingAsset = assets.keys.find(k => 
                k.name.startsWith(`assets/${nameWithoutExt}`) && 
                k.name.endsWith(`.${extension}`)
              );
              
              if (matchingAsset) {
                console.log(`Found matching hashed asset: ${matchingAsset.name}`);
                asset = await env.__STATIC_CONTENT.get(matchingAsset.name);
              }
            }
          } else {
            // Try direct lookup for other files
            asset = await env.__STATIC_CONTENT.get(key);
          }
          
          // If still not found, try index.html as a fallback for SPA routing
          if (asset === null) {
            console.log(`Asset not found, trying index.html as fallback for path: ${path}`);
            
            // Try to find the index.html file (might be hashed)
            const indexFile = assets.keys.find(k => k.name.startsWith('index') && k.name.endsWith('.html'));
            
            if (indexFile) {
              console.log(`Using index file as fallback: ${indexFile.name}`);
              asset = await env.__STATIC_CONTENT.get(indexFile.name);
              
              if (asset !== null) {
                return new Response(asset, {
                  headers: { 'Content-Type': 'text/html' }
                });
              }
            }
            
            // If we still don't have an asset, serve the embedded index.html
            console.log('No matching assets found, serving embedded index.html');
            return new Response(getEmbeddedIndexHtml(), {
              headers: { 'Content-Type': 'text/html' }
            });
          }
          
          // Set appropriate content type
          const contentType = getContentType(path);
          
          console.log(`Serving asset with content type: ${contentType}`);
          return new Response(asset, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=3600'
            }
          });
        } else if (env.ASSETS) {
          // Fallback to ASSETS binding if available
          return env.ASSETS.fetch(request);
        } else {
          // Fallback for when no static content bindings are available
          console.log('No static content bindings available, serving embedded index.html');
          return new Response(getEmbeddedIndexHtml(), {
            headers: { "Content-Type": "text/html" }
          });
        }
      } catch (error) {
        console.error("Error serving static content:", error);
        // Serve the embedded index.html as a last resort
        return new Response(getEmbeddedIndexHtml(), { 
          headers: { "Content-Type": "text/html" }
        });
      }
    } catch (error) {
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
    default:
      return 'text/plain';
  }
}

/**
 * Returns an embedded version of index.html as a fallback
 * when the file cannot be found in KV storage
 */
function getEmbeddedIndexHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TradeMe Property Tracker</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #f5f5f5;
        color: #333;
      }
      .container {
        max-width: 800px;
        padding: 2rem;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        text-align: center;
      }
      h1 {
        color: #0066cc;
        margin-bottom: 1rem;
      }
      p {
        margin-bottom: 1.5rem;
        line-height: 1.6;
      }
      .loading {
        display: inline-block;
        width: 50px;
        height: 50px;
        border: 3px solid rgba(0, 102, 204, 0.3);
        border-radius: 50%;
        border-top-color: #0066cc;
        animation: spin 1s ease-in-out infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @media (prefers-color-scheme: dark) {
        body {
          background-color: #1a1a1a;
          color: #f0f0f0;
        }
        .container {
          background-color: #2a2a2a;
        }
        h1 {
          color: #4d9fff;
        }
        .loading {
          border: 3px solid rgba(77, 159, 255, 0.3);
          border-top-color: #4d9fff;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>TradeMe Property Tracker</h1>
      <p>Loading application...</p>
      <div class="loading"></div>
      <div id="root"></div>
      <noscript>
        <p>You need to enable JavaScript to run this app.</p>
      </noscript>
    </div>
    <script>
      // Check if the API is available
      fetch('/api/health')
        .then(response => {
          if (response.ok) {
            document.querySelector('p').textContent = 'API is available. Application is loading...';
          } else {
            document.querySelector('p').textContent = 'API is not responding. Please try again later.';
          }
        })
        .catch(error => {
          document.querySelector('p').textContent = 'Cannot connect to API. Please try again later.';
          console.error('API health check failed:', error);
        });
    </script>
  </body>
</html>`;
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
  // Static assets
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
  // Workers Sites KV namespace
  __STATIC_CONTENT?: KVNamespace;
  __STATIC_CONTENT_MANIFEST?: string;
}
