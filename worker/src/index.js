// Import debug utilities
import { logDebugInfo, listAvailableAssets } from './debug.js';

// Function to generate a simple HTML page
function getIndexHtml() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>TradeMe Property Tracker</title>
    <script type="module" crossorigin src="./assets/main-ZE2AqzNy.js"></script>
    <link rel="stylesheet" crossorigin href="./assets/main-B7OYuCRH.css">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  </body>
</html>`;
}

// Import the SPA routing handler
import { handleSpaRouting } from './_routes.js';

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      
      // Debug environment bindings
      console.log('Environment bindings:', {
        hasAssets: !!env.ASSETS,
        hasStaticContent: !!env.__STATIC_CONTENT,
        hasStaticContentManifest: !!env.__STATIC_CONTENT_MANIFEST,
        availableBindings: Object.keys(env)
      });
      
      // Handle API requests
      if (url.pathname.startsWith('/api/')) {
        return new Response(JSON.stringify({ status: 'ok' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // For all other requests, try to serve static assets
      try {
        console.log(`Handling request for: ${url.pathname}`);
        
        // Try to serve static assets directly from __STATIC_CONTENT if available
        if (env.__STATIC_CONTENT) {
          console.log('Using __STATIC_CONTENT to serve static assets');
          
          // Get the path without leading slash
          let path = url.pathname.replace(/^\//, '');
          
          // Default to index.html for root path
          if (path === '' || path === '/') {
            path = 'index.html';
          }
          
          try {
            // Try to get the asset from KV
            const asset = await env.__STATIC_CONTENT.get(path, { type: 'text' });
            
            if (asset) {
              console.log(`Found asset: ${path}`);
              
              // Determine content type
              let contentType = 'text/plain';
              if (path.endsWith('.html')) contentType = 'text/html';
              if (path.endsWith('.css')) contentType = 'text/css';
              if (path.endsWith('.js')) contentType = 'application/javascript';
              if (path.endsWith('.json')) contentType = 'application/json';
              if (path.endsWith('.svg')) contentType = 'image/svg+xml';
              
              return new Response(asset, {
                headers: { 'Content-Type': contentType }
              });
            }
            
            // If the asset is not found and it's not index.html, try serving index.html for SPA routing
            if (path !== 'index.html') {
              console.log(`Asset not found: ${path}, trying index.html for SPA routing`);
              const indexHtml = await env.__STATIC_CONTENT.get('index.html', { type: 'text' });
              
              if (indexHtml) {
                return new Response(indexHtml, {
                  headers: { 'Content-Type': 'text/html' }
                });
              }
            }
          } catch (error) {
            console.error(`Error fetching from __STATIC_CONTENT: ${error.message}`);
          }
        }
        
        // Try ASSETS binding if __STATIC_CONTENT failed
        if (env.ASSETS) {
          console.log('Using ASSETS binding to serve static content');
          try {
            const response = await env.ASSETS.fetch(request);
            
            // If asset not found, serve index.html for SPA routing
            if (response.status === 404) {
              console.log('Asset not found, serving index.html');
              // Create a new request for index.html
              const indexRequest = new Request(`${url.origin}/index.html`, request);
              const indexResponse = await env.ASSETS.fetch(indexRequest);
              
              // If index.html is found, return it
              if (indexResponse.status === 200) {
                return indexResponse;
              }
            } else {
              return response;
            }
          } catch (error) {
            console.error(`Error fetching from ASSETS: ${error.message}`);
          }
        }
        
        // If we get here, fall back to the embedded HTML
        console.log('No static content bindings available or all attempts failed, serving fallback HTML');
      } catch (error) {
        console.error("Error serving static content:", error);
        
        // Add detailed error information
        console.error({
          errorName: error.name,
          errorMessage: error.message,
          errorStack: error.stack
        });
        
        // Serve fallback HTML
        return new Response(getIndexHtml(), {
          headers: { 'Content-Type': 'text/html' }
        });
      }
    } catch (error) {
      console.error('Error handling request:', error);
      console.error({
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack
      });
      return new Response('Internal Server Error', { status: 500 });
    }
  },
  
  // Add a fetch event handler for debugging
  async scheduled(event, env, ctx) {
    console.log('Scheduled event triggered');
    
    // List available assets for debugging
    await listAvailableAssets(env);
  }
};
