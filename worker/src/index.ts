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
            
            console.log('No matching assets found');
            return new Response("Not found", { status: 404 });
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
          return new Response("Static assets not configured", {
            status: 404,
            headers: { "Content-Type": "text/plain" }
          });
        }
      } catch (error) {
        console.error("Error serving static content:", error);
        return new Response("Error serving static content", { 
          status: 500,
          headers: { "Content-Type": "text/plain" }
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
