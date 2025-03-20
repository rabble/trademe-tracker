var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-YWMgdE/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// worker/src/debug.js
async function listAvailableAssets(env) {
  if (!env.__STATIC_CONTENT) {
    console.log("__STATIC_CONTENT binding not available");
    return [];
  }
  try {
    const keys = await env.__STATIC_CONTENT.list();
    console.log("Available assets:", keys);
    return keys;
  } catch (error) {
    console.error("Error listing assets:", error);
    return [];
  }
}
__name(listAvailableAssets, "listAvailableAssets");

// worker/src/index.js
function getIndexHtml() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>TradeMe Property Tracker</title>
    <script type="module" crossorigin src="./assets/main-ZE2AqzNy.js"><\/script>
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
__name(getIndexHtml, "getIndexHtml");
var src_default = {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      console.log("Environment bindings:", {
        hasAssets: !!env.ASSETS,
        hasStaticContent: !!env.__STATIC_CONTENT,
        hasStaticContentManifest: !!env.__STATIC_CONTENT_MANIFEST,
        availableBindings: Object.keys(env)
      });
      if (url.pathname.startsWith("/api/")) {
        return new Response(JSON.stringify({ status: "ok" }), {
          headers: { "Content-Type": "application/json" }
        });
      }
      try {
        console.log(`Handling request for: ${url.pathname}`);
        if (env.__STATIC_CONTENT) {
          console.log("Using __STATIC_CONTENT to serve static assets");
          let path = url.pathname.replace(/^\//, "");
          if (path === "" || path === "/") {
            path = "index.html";
          }
          try {
            const asset = await env.__STATIC_CONTENT.get(path, { type: "text" });
            if (asset) {
              console.log(`Found asset: ${path}`);
              let contentType = "text/plain";
              if (path.endsWith(".html")) contentType = "text/html";
              if (path.endsWith(".css")) contentType = "text/css";
              if (path.endsWith(".js")) contentType = "application/javascript";
              if (path.endsWith(".json")) contentType = "application/json";
              if (path.endsWith(".svg")) contentType = "image/svg+xml";
              return new Response(asset, {
                headers: { "Content-Type": contentType }
              });
            }
            if (path !== "index.html") {
              console.log(`Asset not found: ${path}, trying index.html for SPA routing`);
              const indexHtml = await env.__STATIC_CONTENT.get("index.html", { type: "text" });
              if (indexHtml) {
                return new Response(indexHtml, {
                  headers: { "Content-Type": "text/html" }
                });
              }
            }
          } catch (error) {
            console.error(`Error fetching from __STATIC_CONTENT: ${error.message}`);
          }
        }
        if (env.ASSETS) {
          console.log("Using ASSETS binding to serve static content");
          try {
            const response = await env.ASSETS.fetch(request);
            if (response.status === 404) {
              console.log("Asset not found, serving index.html");
              const indexRequest = new Request(`${url.origin}/index.html`, request);
              const indexResponse = await env.ASSETS.fetch(indexRequest);
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
        console.log("No static content bindings available or all attempts failed, serving fallback HTML");
      } catch (error) {
        console.error("Error serving static content:", error);
        console.error({
          errorName: error.name,
          errorMessage: error.message,
          errorStack: error.stack
        });
        return new Response(getIndexHtml(), {
          headers: { "Content-Type": "text/html" }
        });
      }
    } catch (error) {
      console.error("Error handling request:", error);
      console.error({
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack
      });
      return new Response("Internal Server Error", { status: 500 });
    }
  },
  // Add a fetch event handler for debugging
  async scheduled(event, env, ctx) {
    console.log("Scheduled event triggered");
    await listAvailableAssets(env);
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-YWMgdE/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-YWMgdE/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
