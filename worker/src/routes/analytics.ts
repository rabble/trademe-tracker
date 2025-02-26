import { Router, IRequest } from 'itty-router';
import { Env } from '../index';
import { addCorsHeaders } from '../middleware/cors';

// Create a router for analytics endpoints
const router = Router({ base: '/api/analytics' });

// GET /api/analytics/summary
router.get('/summary', async (request: IRequest, env: Env) => {
  try {
    // In a real implementation, you would calculate these metrics from your data
    // For now, return mock data
    const summary = {
      totalProperties: 100,
      activeProperties: 65,
      underOfferProperties: 15,
      soldProperties: 20,
      averagePrice: 850000,
      averageDaysOnMarket: 28,
    };
    
    const response = new Response(JSON.stringify(summary), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return addCorsHeaders(response);
  } catch (error) {
    throw error;
  }
});

// GET /api/analytics/recent-changes
router.get('/recent-changes', async (request: IRequest, env: Env) => {
  try {
    const limit = parseInt(new URL(request.url).searchParams.get('limit') || '10');
    
    // In a real implementation, you would fetch recent changes from your data
    // For now, return mock data
    const changes = [
      {
        id: '1',
        property_id: '123',
        property_title: 'Beautiful 3 Bedroom Home',
        change_type: 'price',
        old_value: '900000',
        new_value: '850000',
        change_date: new Date().toISOString(),
      },
      // Add more mock changes as needed
    ];
    
    const response = new Response(JSON.stringify(changes.slice(0, limit)), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return addCorsHeaders(response);
  } catch (error) {
    throw error;
  }
});

// Export the router with a handle method for the main router
export const analyticsRoutes = {
  handle: (request: IRequest, ...args: any[]) => router.handle(request, ...args),
};
