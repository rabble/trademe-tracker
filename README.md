# TradeMe Property Tracker

A web application that automatically tracks favorited properties from TradeMe, primarily residential and land listings.

## Project Setup

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/trademe-tracker.git
cd trademe-tracker
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

- `src/components/` - React components
- `src/hooks/` - Custom React hooks
- `src/pages/` - Page components
- `src/utils/` - Utility functions
- `src/services/` - API services
- `src/types/` - TypeScript type definitions

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build locally

## Tech Stack

- Frontend: React with Vite
- Styling: Tailwind CSS
- Routing: React Router
- Backend: Supabase
- Language: TypeScript

## License

This project is licensed under the MIT License - see the LICENSE file for details.
