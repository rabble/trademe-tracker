/**
 * Debug utilities for the worker
 */

/**
 * Creates a debug response with information about the worker environment
 */
export function createDebugResponse(request: Request, env: any): Response {
  const url = new URL(request.url);
  
  const debugInfo = {
    request: {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries([...request.headers]),
      cf: request.cf,
    },
    url: {
      href: url.href,
      origin: url.origin,
      protocol: url.protocol,
      host: url.host,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
    },
    environment: {
      bindings: Object.keys(env),
      hasStaticContent: !!env.__STATIC_CONTENT,
      hasStaticContentManifest: !!env.__STATIC_CONTENT_MANIFEST,
      hasAssets: !!env.ASSETS,
      hasPropertiesKV: !!env.PROPERTIES_KV,
    },
    timestamp: new Date().toISOString(),
  };
  
  return new Response(JSON.stringify(debugInfo, null, 2), {
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}

/**
 * Lists all available assets in the __STATIC_CONTENT KV namespace
 */
export async function listAvailableAssets(env: any): Promise<string[]> {
  if (!env.__STATIC_CONTENT) {
    return ['__STATIC_CONTENT binding not available'];
  }
  
  try {
    const assets = await env.__STATIC_CONTENT.list();
    return assets.keys.map(k => k.name);
  } catch (error) {
    return [`Error listing assets: ${error instanceof Error ? error.message : String(error)}`];
  }
}
