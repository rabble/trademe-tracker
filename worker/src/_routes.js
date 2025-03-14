// This file handles SPA routing for Cloudflare Workers
export async function handleSpaRouting(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // API requests should be handled by the worker
  if (path.startsWith('/api/')) {
    return null; // Let the worker handle API requests
  }
  
  // For all other routes, serve the SPA
  try {
    // Try to serve the requested path
    let response = await env.ASSETS.fetch(request);
    
    // If the response is a 404, serve the index.html instead
    if (response.status === 404) {
      // Rewrite to index.html for SPA routing
      const indexRequest = new Request(`${url.origin}/index.html`, request);
      response = await env.ASSETS.fetch(indexRequest);
    }
    
    return response;
  } catch (error) {
    console.error('Error serving assets:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
