# MiVoy

A web application that automatically tracks favorited properties from online listings, primarily residential and land listings in New Zealand.

## Project Setup

### Prerequisites

- Node.js 16+
- npm or yarn
- Cloudflare account (for Worker deployment)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/mivoy.git
cd mivoy
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Start the development server
```bash
npm run dev
```

## Project Structure

- `src/` - Frontend React application
  - `components/` - React components
  - `hooks/` - Custom React hooks
  - `pages/` - Page components
  - `utils/` - Utility functions
  - `services/` - API services
  - `types/` - TypeScript type definitions
- `worker/` - Cloudflare Worker for API and scraping
  - `src/` - Worker source code
  - `src/middleware/` - Middleware functions
  - `src/routes/` - API route handlers
  - `src/services/` - Business logic and services

## Available Scripts

### Frontend
- `npm run dev` - Start the frontend development server
- `npm run build` - Build frontend for production
- `npm run preview` - Preview the production build locally

### Cloudflare Worker
- `npm run worker:dev` - Start the worker development server
- `npm run worker:deploy` - Deploy the worker to Cloudflare

## Tech Stack

- Frontend: React with Vite
- Styling: Tailwind CSS
- Routing: React Router
- Backend: Cloudflare Workers & Supabase
- Language: TypeScript
- Data Visualization: Recharts

## Cloudflare Worker

The Cloudflare Worker handles API requests and scheduled scraping of property data. It runs a daily job at 3:00 AM NZT to fetch and update property information.

### Worker Setup

1. Navigate to the worker directory:
```bash
cd worker
```

2. Install worker dependencies:
```bash
npm install
```

3. Configure your environment by updating the `wrangler.toml` file.

4. Run the worker locally:
```bash
npm run dev
```

5. Deploy to Cloudflare:
```bash
npm run deploy
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
