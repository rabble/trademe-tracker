# Vite React to Cloudflare Pages Deployment Guide

This guide explains how to deploy the TradeMe Tracker (Vite + React) application to Cloudflare Pages. This approach has been successfully tested and confirmed working.

## Overview

When deploying to Cloudflare Pages, we need to:

1. Build the Vite/React application
2. Use direct uploads with Wrangler for Pages deployment
3. Deploy the static output

## Prerequisites

- Node.js and npm installed
- Vite + React project
- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler` or as dev dependency)

## Step 1: Configure the Deployment Scripts

Update your `package.json` scripts to include the Pages deployment commands:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
  "preview": "vite preview",
  "deploy:pages": "npm run build && cd dist && npx wrangler pages deploy . --project-name=trademe-tracker",
  "deploy:pages:prod": "npm run build && cd dist && npx wrangler pages deploy . --project-name=trademe-tracker --branch=main --commit-dirty=true"
}
```

## Step 2: Create a Cloudflare Pages Project

Before your first deployment, you need to create a Pages project:

```bash
wrangler pages project create trademe-tracker --production-branch=main
```

You only need to do this once when setting up the project.

## Step 3: Create a Minimal Wrangler Configuration (Optional)

For the MiVoy project, we created a minimal `wrangler.toml` file:

```toml
name = "mivoy"
compatibility_date = "2023-12-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "dist"

# Define KV namespace if needed
kv_namespaces = [
  { binding = "PROPERTIES_KV", id = "633473f72f9c444ca81d0413d340d3c0" }
]
```

However, the direct upload approach from the `dist` directory doesn't require this file for deployment.

## Step 4: Deploy Your Site

After building your project, to deploy to Cloudflare Pages:

```bash
# For preview deployments:
npm run deploy:pages

# For production deployments:
npm run deploy:pages:prod
```

MiVoy will be available at https://mivoy.pages.dev after deployment.

The deployment script builds your application and then uploads the `dist` directory directly to Cloudflare Pages.

## Step 5: Authentication with Cloudflare

Before your first deployment, make sure you're authenticated with Cloudflare:

```bash
wrangler login
```

This only needs to be done once per machine.

## Common Issues and Solutions

### 1. SSL/TLS Connection Errors

**Problem**: Errors like "ERR_SSL_VERSION_OR_CIPHER_MISMATCH" when trying to access your deployed site

**Solution**: Use the direct upload approach from the dist directory:
```bash
cd dist && npx wrangler pages deploy . --project-name=trademe-tracker
```

### 2. "Pages does not support custom paths for the Wrangler configuration file"

**Problem**: When using `--config` flag with Pages deployments

**Solution**: Don't use the `--config` flag with Pages deployments. Use the direct upload approach instead.

### 3. Configuration File Conflicts

**Problem**: Error about "Configuration file cannot contain both both 'main' and 'pages_build_output_dir' configuration keys"

**Solution**: Use separate wrangler configuration files for Workers and Pages, or use the direct upload approach that doesn't rely on wrangler.toml.

### 4. DNS Issues with Pages Subdomain

**Problem**: DNS_PROBE_FINISHED_NXDOMAIN or other DNS errors when trying to access your Pages site

**Solution**: 
1. Try accessing the specific deployment URL (with the hash prefix)
2. Wait 5-10 minutes for DNS propagation
3. Clear your DNS cache and browser cache

## Separating Worker and Pages Deployments

MiVoy uses both Cloudflare Workers (for the backend) and Cloudflare Pages (for the frontend). To deploy both:

1. **Worker Deployment**:
   ```bash
   npm run worker:deploy
   ```

2. **Pages Deployment**:
   ```bash
   npm run deploy:pages:prod
   ```

## Project Structure After Implementation

```
mivoy/
├── package.json (with deploy scripts for both Worker and Pages)
├── wrangler.toml (configured for Pages)
├── wrangler.worker.toml (configured for Worker)
├── src/ (frontend source code)
├── dist/ (built frontend files)
└── worker/ (backend Worker code)
```

## Further Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)