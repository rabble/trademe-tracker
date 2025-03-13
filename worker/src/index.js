// Function to generate a simple HTML page
function getIndexHtml() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>TradeMe Property Tracker</title>
    <script type="module" crossorigin src="./assets/index-DZ-J4Eak.js"></script>
    <link rel="stylesheet" crossorigin href="./assets/index-CVok2Bc6.css">
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
        
        // Check if we have the ASSETS binding
        if (env.ASSETS) {
          console.log('Using ASSETS binding to serve static content');
          try {
            const response = await env.ASSETS.fetch(request);
          
            // If asset not found, serve index.html for SPA routing
            if (response.status === 404) {
              console.log('Asset not found, serving index.html');
              return new Response(getIndexHtml(), {
                headers: { 'Content-Type': 'text/html' }
              });
            }
          
            return response;
          } catch (error) {
            console.error('Error fetching asset:', error);
            return new Response(getIndexHtml(), {
              headers: { 'Content-Type': 'text/html' }
            });
          }
        } else {
          console.log('ASSETS binding not available, serving fallback HTML');
          return new Response(getIndexHtml(), {
            headers: { 'Content-Type': 'text/html' }
          });
        }
      } catch (error) {
        console.error("Error serving static content:", error);
        
        // Serve fallback HTML
        return new Response(getIndexHtml(), {
          headers: { 'Content-Type': 'text/html' }
        });
      }
    } catch (error) {
      console.error('Error handling request:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};
