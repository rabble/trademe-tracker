// Debug utilities for Cloudflare Workers

/**
 * Logs detailed information about the environment and request
 * @param {Request} request - The incoming request
 * @param {Object} env - The environment object
 * @returns {Object} Debug information
 */
export function logDebugInfo(request, env) {
  const url = new URL(request.url);
  
  // Get available bindings
  const bindings = Object.keys(env);
  
  // Check for specific bindings
  const hasAssets = !!env.ASSETS;
  const hasStaticContent = !!env.__STATIC_CONTENT;
  const hasStaticContentManifest = !!env.__STATIC_CONTENT_MANIFEST;
  
  // Log manifest content if available
  let manifestContent = null;
  if (hasStaticContentManifest) {
    try {
      manifestContent = JSON.parse(env.__STATIC_CONTENT_MANIFEST);
    } catch (e) {
      manifestContent = `Error parsing manifest: ${e.message}`;
    }
  }
  
  // Create debug info object
  const debugInfo = {
    request: {
      url: request.url,
      method: request.method,
      path: url.pathname,
      headers: Object.fromEntries([...request.headers.entries()]),
    },
    environment: {
      bindings,
      hasAssets,
      hasStaticContent,
      hasStaticContentManifest,
      manifestContent
    }
  };
  
  // Log the debug info
  console.log('Debug info:', JSON.stringify(debugInfo, null, 2));
  
  return debugInfo;
}

/**
 * Lists all available assets in the __STATIC_CONTENT KV namespace
 * @param {Object} env - The environment object
 * @returns {Promise<Array>} List of available assets
 */
export async function listAvailableAssets(env) {
  if (!env.__STATIC_CONTENT) {
    console.log('__STATIC_CONTENT binding not available');
    return [];
  }
  
  try {
    // List all keys in the KV namespace
    const keys = await env.__STATIC_CONTENT.list();
    console.log('Available assets:', keys);
    return keys;
  } catch (error) {
    console.error('Error listing assets:', error);
    return [];
  }
}
