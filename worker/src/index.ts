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
      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      } else {
        // Fallback for when ASSETS binding is not available
        return new Response("Static assets not configured", {
          status: 404,
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
}
