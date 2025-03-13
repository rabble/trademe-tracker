import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      
      // Handle API requests
      if (url.pathname.startsWith('/api/')) {
        return new Response(JSON.stringify({ status: 'ok' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // For all other requests, serve static assets from the site
      try {
        console.log(`Handling request for: ${url.pathname}`);
        
        // Try to serve the asset from KV
        let options = {};
        
        // For SPA routing, use index.html as fallback
        if (!url.pathname.includes('.')) {
          options.mapRequestToAsset = req => {
            const url = new URL(req.url);
            url.pathname = '/index.html';
            return new Request(url.toString(), req);
          };
        }
        
        // Use kv-asset-handler to serve assets
        return await getAssetFromKV(
          {
            request,
            waitUntil: ctx.waitUntil.bind(ctx),
          },
          {
            ASSET_NAMESPACE: env.__STATIC_CONTENT,
            ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
            ...options,
          }
        );
      } catch (error) {
        console.error("Error serving static content:", error);
        
        // If the error is that the asset is not found, try serving index.html
        if (error.status === 404) {
          try {
            const notFoundResponse = await getAssetFromKV(
              {
                request: new Request(new URL('/index.html', request.url).toString(), request),
                waitUntil: ctx.waitUntil.bind(ctx),
              },
              {
                ASSET_NAMESPACE: env.__STATIC_CONTENT,
                ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
              }
            );
            return new Response(notFoundResponse.body, {
              ...notFoundResponse,
              status: 200,
            });
          } catch (indexError) {
            // If we still can't find index.html, return a simple 404
            return new Response("Not Found", { status: 404 });
          }
        }
        
        return new Response("Error serving static content", { 
          status: 500,
          headers: { "Content-Type": "text/plain" }
        });
      }
    } catch (error) {
      console.error('Error handling request:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};
