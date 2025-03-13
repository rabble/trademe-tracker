/**
 * Returns an embedded version of index.html as a fallback
 * when the file cannot be found in KV storage
 */
export function getIndexHtmlTemplate(): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TradeMe Property Tracker</title>
    <!-- In production, this should be the built JS file -->
    <script type="module" crossorigin src="/assets/index-DZ-J4Eak.js"></script>
    <link rel="stylesheet" href="/assets/index-CVok2Bc6.css">
    
    <!-- Fallback for development -->
    <script>
      // Check if the main script failed to load
      window.addEventListener('error', function(e) {
        if (e.target && e.target.src && e.target.src.includes('index-DZ-J4Eak.js')) {
          console.log('Production script failed to load, trying development path');
          
          // Create and append development script
          const script = document.createElement('script');
          script.type = 'module';
          script.src = '/src/main.tsx';
          document.head.appendChild(script);
          
          // Prevent the error from showing in console
          e.preventDefault();
        }
      }, true);
    </script>
  </head>
  <body>
    <div id="root">
      <div class="container">
        <h1>TradeMe Property Tracker</h1>
        <p>Loading application...</p>
        <div class="loading"></div>
        <noscript>
          <p>You need to enable JavaScript to run this app.</p>
        </noscript>
      </div>
    </div>
    <script>
      // Check if the API is available
      fetch('/api/health')
        .then(response => {
          if (response.ok) {
            document.querySelector('p').textContent = 'API is available. Application is loading...';
          } else {
            document.querySelector('p').textContent = 'API is not responding. Please try again later.';
            console.error('API health check failed with status:', response.status);
          }
        })
        .catch(error => {
          document.querySelector('p').textContent = 'Cannot connect to API. Please try again later.';
          console.error('API health check failed:', error);
        });
      
      // Debug information
      console.log('Environment:', {
        location: window.location.toString(),
        href: window.location.href,
        origin: window.location.origin,
        pathname: window.location.pathname,
        host: window.location.host
      });
      
      // Check for network errors
      window.addEventListener('error', function(e) {
        console.error('Resource error:', e.target.src || e.target.href, e);
      }, true);
      
      // Add a global error handler to catch database errors
      window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        
        // Check for specific database errors
        if (event.reason && event.reason.message) {
          const errorMsg = event.reason.message;
          
          if (errorMsg.includes('relation "public.properties" does not exist') || 
              errorMsg.includes('Could not find a relationship between')) {
            document.querySelector('p').innerHTML = 'Database setup issue: Tables are missing.<br>Please check Supabase configuration.';
            
            // Add more detailed error information
            const errorDetails = document.createElement('div');
            errorDetails.className = 'error-details';
            errorDetails.innerHTML = `
              <h3>Database Error</h3>
              <p>${errorMsg}</p>
              <p>The application requires the following tables in Supabase:</p>
              <ul>
                <li>properties</li>
                <li>property_insights</li>
                <li>property_changes</li>
              </ul>
              <p>Please check your Supabase setup or contact the administrator.</p>
            `;
            document.querySelector('.container').appendChild(errorDetails);
          }
        }
      });
    </script>
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
      .error-details {
        margin-top: 2rem;
        padding: 1rem;
        background-color: #fff8f8;
        border: 1px solid #ffcdd2;
        border-radius: 4px;
        text-align: left;
      }
      .error-details h3 {
        color: #d32f2f;
        margin-top: 0;
      }
      .error-details ul {
        text-align: left;
        margin: 0.5rem 0;
        padding-left: 1.5rem;
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
        .error-details {
          background-color: #3a2a2a;
          border-color: #5a3a3a;
        }
        .error-details h3 {
          color: #ff6b6b;
        }
      }
    </style>
  </body>
</html>`;
}
