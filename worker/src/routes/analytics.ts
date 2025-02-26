import { Router, IRequest } from 'itty-router';
import { Env } from '../index';
import { addCorsHeaders } from '../middleware/cors';
import { PropertyChange } from '../types';
import { ChangeTracker } from '../services/changeTracker';

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
    const propertyId = new URL(request.url).searchParams.get('propertyId');
    
    // Get changes from KV
    const changesJson = await env.PROPERTIES_KV.get('property_changes');
    let changes: PropertyChange[] = [];
    
    if (changesJson) {
      changes = JSON.parse(changesJson);
      
      // Filter by property ID if provided
      if (propertyId) {
        changes = changes.filter(change => change.property_id === propertyId);
      }
      
      // Sort by date (newest first)
      changes.sort((a, b) => 
        new Date(b.change_date).getTime() - new Date(a.change_date).getTime()
      );
    }
    
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

// GET /api/analytics/property-history/:id
router.get('/property-history/:id', async (request: IRequest, env: Env) => {
  try {
    const { id } = request.params;
    const limit = parseInt(new URL(request.url).searchParams.get('limit') || '10');
    
    // Create a change tracker to access the history methods
    const changeTracker = new ChangeTracker(env);
    
    // Get property history
    const history = await changeTracker.getPropertyHistory(id, limit);
    
    const response = new Response(JSON.stringify(history), {
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
