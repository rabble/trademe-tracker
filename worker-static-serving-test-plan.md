# Worker Static Serving Test Plan

## 1. Deploy the Worker

```bash
cd worker
wrangler deploy
```

## 2. Test Static Content Serving

| Test Case | Expected Result |
|-----------|-----------------|
| Visit the root URL (`/`) | The main app loads successfully |
| Visit a direct URL to a static asset (e.g., `/assets/index-abc123.js`) | The asset is served with the correct MIME type |
| Visit a URL that doesn't match a static asset but is a client route (e.g., `/settings`) | The main app loads and client-side routing takes over |
| Visit a URL that doesn't exist on the client either | The app loads and shows its 404 page |

## 3. Test API Routes

| Test Case | Expected Result |
|-----------|-----------------|
| Visit `/api/health` | Returns "OK" with a 200 status code |
| Visit a non-existent API route (e.g., `/api/nonexistent`) | Returns "API Not Found" with a 404 status code |
| Visit protected routes (e.g., `/api/properties/list`) without auth | Returns an appropriate auth error |
| Visit protected routes with proper auth | Returns the expected data |

## 4. Test Edge Cases

| Test Case | Expected Result |
|-----------|-----------------|
| Request a very large static asset | Asset is served completely |
| Request a static asset with unusual characters in the filename | Asset is served correctly |
| Make many concurrent requests | All requests are handled properly without errors |
| Test with different HTTP methods (GET, POST, etc.) | Proper handling based on the route |

## 5. Debug Endpoints

| Test Case | Expected Result |
|-----------|-----------------|
| Visit `/debug` | Shows debug information including available bindings |
| Visit `/debug/static-content` | Lists all available static assets |

## Verification Checklist

- [ ] All static assets load properly
- [ ] Client-side routing works correctly
- [ ] API endpoints work as expected
- [ ] No console errors related to static content serving
- [ ] The app functions correctly end-to-end