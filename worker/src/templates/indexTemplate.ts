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
    <script type="module" crossorigin src="./assets/index-DZ-J4Eak.js"></script>
    <link rel="stylesheet" crossorigin href="./assets/index-CVok2Bc6.css">
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
          }
        })
        .catch(error => {
          document.querySelector('p').textContent = 'Cannot connect to API. Please try again later.';
          console.error('API health check failed:', error);
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
  </body>
</html>`;
}
