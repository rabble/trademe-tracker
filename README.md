# TradeMe Property Tracker

A web application that automatically tracks favorited properties from TradeMe, primarily residential and land listings.

## Project Setup

### Prerequisites

- Node.js 16+
- npm or yarn
- Cloudflare account (for Worker deployment)

### Installation

1. Clone the repository
```bash
git clone https://github.com/rabble/trademe-tracker.git
cd trademe-tracker
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
You can use the [.env.example](.env.example) file as a template.

4. Start the development server
```bash
npm run dev
```

## Project Structure

- [`src/`](./src/) - Frontend React application
  - [`components/`](./src/components/) - React components
  - [`hooks/`](./src/hooks/) - Custom React hooks
  - [`pages/`](./src/pages/) - Page components
  - [`utils/`](./src/utils/) - Utility functions
  - [`services/`](./src/services/) - API services
  - [`types/`](./src/types/) - TypeScript type definitions
- [`worker/`](./worker/) - Cloudflare Worker for API and scraping
  - [`src/`](./worker/src/) - Worker source code
  - [`src/middleware/`](./worker/src/middleware/) - Middleware functions
  - [`src/routes/`](./worker/src/routes/) - API route handlers
  - [`src/services/`](./worker/src/services/) - Business logic and services

## Available Scripts

### Frontend
- `npm run dev` - Start the frontend development server
- `npm run build` - Build frontend for production
- `npm run preview` - Preview the production build locally

### Cloudflare Worker
- `npm run worker:dev` - Start the worker development server
- `npm run worker:deploy` - Deploy the worker to Cloudflare

You can find all available scripts in the [`package.json`](./package.json) file.

## Tech Stack

### Frontend
- **Framework**: React with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Language**: TypeScript
- **Data Visualization**: Recharts

### Backend
- **Serverless Functions**: Cloudflare Workers
- **Database**: Supabase

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

3. Configure your environment by updating the [`wrangler.toml`](./wrangler.toml) file.

4. Run the worker locally:
```bash
npm run dev
```

5. Deploy to Cloudflare:
```bash
npm run deploy
```

For more details on the worker implementation, check the [`worker/`](./worker/) directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request if you have any improvements or bug fixes.
