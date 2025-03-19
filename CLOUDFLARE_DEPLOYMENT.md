# Next.js to Cloudflare Pages Deployment Guide

This guide explains how to deploy a Next.js application to Cloudflare Pages with a static export. This is the successful method used in the SuperSimple.Directory project and can be applied to other Next.js projects.

## Overview

When deploying to Cloudflare Pages, we need to:

1. Configure Next.js for static export (no SSR or API routes)
2. Configure Wrangler for Pages deployment
3. Build and deploy the static output

## Prerequisites

- Node.js and npm installed
- Next.js project
- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler` or as dev dependency)

## Step 1: Configure Next.js for Static Export

Edit your `next.config.js` file:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export', // Essential for static export
  images: {
    unoptimized: true, // Required for static export
  },
  // Define static routes (important for capturing all your routes)
  exportPathMap: async function (defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
    return {
      '/': { page: '/' },
      // Add your important static routes here
      '/features': { page: '/features' },
      '/pricing': { page: '/pricing' },
      '/about': { page: '/about' },
      // Add more routes as needed
    };
  },
};

module.exports = nextConfig;
```

## Step 2: Prepare Dynamic Routes

For pages using `getStaticProps` and `getStaticPaths` (like `/blog/[slug]`):

1. Ensure `getStaticPaths` uses `fallback: false` (required for static export)
2. Remove any `revalidate` property from `getStaticProps` (ISR isn't supported)

Example:

```js
export async function getStaticPaths() {
  // Fetch your paths
  const paths = [
    { params: { slug: 'post-1' } },
    { params: { slug: 'post-2' } }
  ];
  
  return {
    paths,
    fallback: false, // Must be false for static export
  };
}

export async function getStaticProps({ params }) {
  // Fetch your data
  const data = { /* your data */ };
  
  return {
    props: {
      data,
      // DON'T include revalidate here
    },
  };
}
```

## Step 3: Create or Update Wrangler Configuration

Create a `wrangler.toml` file in your project root:

```toml
# Pages configuration
name = "your-project-name"
compatibility_date = "2023-06-21"

# This tells Wrangler where to find your static files
pages_build_output_dir = "out"

# Custom domain configuration (uncomment when ready)
# routes = [
#   { pattern = "your-domain.com", custom_domain = true },
#   { pattern = "www.your-domain.com", custom_domain = true }
# ]

# Environment variables for your project
[vars]
NEXT_PUBLIC_API_URL = "https://your-api.example.com"
# Add other environment variables as needed

# DO NOT include the observability section for Pages deployments
# This only works for Workers, not Pages
```

## Step 4: Add Deployment Scripts to package.json

Update your `package.json` scripts:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "deploy": "npm run build && wrangler pages deploy out --project-name=your-project-name",
  "deploy:prod": "npm run build && wrangler pages deploy out --project-name=your-project-name --branch=main --commit-dirty=true"
}
```

## Step 5: Deploy Your Site

1. Authenticate with Cloudflare (if you haven't already):
   ```bash
   wrangler login
   ```

2. Run the deployment script:
   ```bash
   npm run deploy
   ```

3. For production deployment:
   ```bash
   npm run deploy:prod
   ```

## Common Issues and Solutions

### 1. "Workers observability is only available for Workers projects"

**Problem**: You have an `[observability]` section in your wrangler.toml

**Solution**: Remove the `[observability]` section completely. This is only supported for Workers, not Pages.

### 2. Missing pages in deployment

**Problem**: Some pages are not included in the static export

**Solution**: Add them explicitly to the `exportPathMap` in next.config.js

### 3. Images not loading

**Problem**: Next.js Image Optimization doesn't work with static exports

**Solution**: Make sure you have `images.unoptimized = true` in your next.config.js

### 4. API routes not working

**Problem**: API routes aren't available in static exports

**Solution**: API routes aren't supported in static exports. Use client-side API calls to external services or use Cloudflare Functions/Workers for backend functionality.

### 5. Environment variables not being applied

**Problem**: Environment variables defined in .env files aren't included in the build

**Solution**: Ensure environment variables are:
1. Added to the `[vars]` section in wrangler.toml
2. For client-side variables, prefixed with `NEXT_PUBLIC_`

## Alternative Deployment Strategies

If you need server-side rendering or API routes, consider:

1. **Next.js on Cloudflare Pages with Functions** - Uses Cloudflare's adapter
2. **Next.js on Vercel** - Full support for all Next.js features
3. **Hybrid approach** - Static site with client-side data fetching for dynamic content

## Notes on Client-Side Data Fetching

Since API routes won't work in static exports, consider:

1. Fetching data directly from client-side using hooks like `useEffect`
2. Using external API services (Supabase, Firebase, custom APIs)
3. Implementing Cloudflare Workers for dynamic backend functionality

## Project Structure After Implementation

```
your-project/
├── next.config.js (configured for static export)
├── package.json (with deploy scripts)
├── wrangler.toml (configured for Pages)
├── pages/ (your Next.js pages)
└── out/ (generated after build, contains static files)
```

## Further Resources

- [Next.js Static Export Documentation](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)