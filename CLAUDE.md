# Claude Assistant Instructions

## Project Information
This is a Trade Me Property Tracker application that allows users to track and analyze property listings from Trade Me (a popular New Zealand marketplace similar to eBay).

## Commands
- **Build**: `npm run build`
- **Development**: `npm run dev`
- **Test**: `npm test`
- **Lint**: `npm run lint`
- **Typecheck**: `npm run typecheck`

## Code Style Preferences
- Use TypeScript for type safety
- Use functional components with React hooks
- Prefer named exports over default exports
- Use async/await for asynchronous operations
- Follow consistent naming conventions (camelCase for variables/functions, PascalCase for components)

## Project Structure
- `/src` - Main application code
  - `/components` - React components organized by feature
  - `/hooks` - Custom React hooks
  - `/services` - API and external service integrations
  - `/lib` - Utility functions and libraries
  - `/pages` - Page components used by router
  - `/types` - TypeScript type definitions
- `/worker` - Cloudflare Worker backend code
- `/supabase` - Supabase database migrations and configuration

## Important Notes
- The app uses Supabase for backend storage and authentication
- Trade Me integration uses the official TradeMe API with OAuth authentication
- The worker directory contains a Cloudflare Worker that handles backend API functionality and TradeMe API integration