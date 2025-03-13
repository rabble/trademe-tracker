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
        
        // When deployed with wrangler, the __STATIC_CONTENT binding is available
        if (env.__STATIC_CONTENT) {
          let path = url.pathname;
          
          // Default to index.html for the root path
          if (path === '/' || path === '') {
            path = '/index.html';
          }
          
          console.log(`Looking for asset: ${path}`);
          
          // Remove leading slash for KV lookup
          const key = path.replace(/^\//, '');
          
          // Try to get the asset from KV
          let asset = await env.__STATIC_CONTENT.get(key);
          
          // If not found, try index.html as a fallback for SPA routing
          if (asset === null && !path.includes('.')) {
            console.log(`Asset not found, trying index.html as fallback for path: ${path}`);
            asset = await env.__STATIC_CONTENT.get('index.html');
          }
          
          if (asset === null) {
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
      console.error('Error handling request:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};

/**
 * Get the content type based on file extension
 */
function getContentType(path) {
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
