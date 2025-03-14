import { Router } from 'itty-router';
import { handleCors, withCors } from './middleware/cors';
import { withAuth } from './middleware/auth';
import { withRateLimit } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';
import { propertiesRoutes } from './routes/properties';
import { analyticsRoutes } from './routes/analytics';
import { scheduledScraper } from './services/scraper';
import { getIndexHtmlTemplate } from './templates/indexTemplate';

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
      
      // Debug endpoint to list all static content
      if (url.pathname === '/debug/static-content') {
        try {
          if (!env.__STATIC_CONTENT) {
            return new Response(JSON.stringify({ error: 'No __STATIC_CONTENT binding available' }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          const assets = await env.__STATIC_CONTENT.list();
          return new Response(JSON.stringify({
            assets: assets.keys.map(k => k.name),
            count: assets.keys.length,
            timestamp: new Date().toISOString()
          }, null, 2), {
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
      
      // Handle API requests
      if (url.pathname.startsWith('/api/')) {
        return router.handle(request, env, ctx).catch(errorHandler);
      }
      
      // For all other requests, serve static assets from the site
      return await serveStaticContent(request, env);
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
    default:
      return 'text/plain';
  }
}

/**
 * Serves static content from KV storage
 */
async function serveStaticContent(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  console.log(`Handling request for: ${url.pathname}`);
  
  try {
    // Default to index.html for the root path
    let path = url.pathname;
    if (path === '/' || path === '') {
      path = '/index.html';
    }
    
    console.log(`Looking for asset: ${path}`);
    
    // First try ASSETS binding (Cloudflare Pages integration)
    if (env.ASSETS) {
      try {
        console.log('Using ASSETS binding to serve content');
        return await env.ASSETS.fetch(request);
      } catch (error) {
        console.error('Error using ASSETS binding:', error);
      }
    }
    
    
    // If we get here, we couldn't find the asset
    console.log('Asset not found, returning 404');
    return new Response('Not Found', { 
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    console.error('Error in static content serving:', error);
    return new Response(`Server Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
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
