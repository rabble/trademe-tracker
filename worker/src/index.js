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
        
        // Use Cloudflare's built-in static asset handling
        return env.ASSETS.fetch(request);
      } catch (error) {
        console.error("Error serving static content:", error);
        
        // If the error is that the asset is not found, try serving index.html for SPA routing
        if (error.status === 404 && !url.pathname.includes('.')) {
          try {
            // Create a new request for index.html
            const indexRequest = new Request(`${url.origin}/index.html`, request);
            return env.ASSETS.fetch(indexRequest);
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
