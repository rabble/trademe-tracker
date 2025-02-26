import { Router, IRequest } from 'itty-router';
import { Env } from '../index';
import { addCorsHeaders } from '../middleware/cors';

// Create a router for properties endpoints
const router = Router({ base: '/api/properties' });

// GET /api/properties
router.get('/', async (request: IRequest, env: Env) => {
  try {
    // Get query parameters for filtering
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    // In a real implementation, you would fetch properties from KV or external API
    // For now, return mock data
    const properties = [
      {
        id: '1',
        title: 'Beautiful 3 Bedroom Home',
        address: '123 Main St, Auckland',
        price: 850000,
        bedrooms: 3,
        bathrooms: 2,
        status: 'active',
        days_on_market: 14,
        created_at: new Date().toISOString(),
      },
      // Add more mock properties as needed
    ];
    
    const response = new Response(JSON.stringify({
      data: properties,
      meta: {
        total: properties.length,
        page,
        limit,
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return addCorsHeaders(response);
  } catch (error) {
    throw error;
  }
});

// GET /api/properties/:id
router.get('/:id', async (request: IRequest, env: Env) => {
  try {
    const { id } = request.params;
    
    // In a real implementation, you would fetch the property from KV or external API
    // For now, return mock data
    const property = {
      id,
      title: 'Beautiful 3 Bedroom Home',
      address: '123 Main St, Auckland',
      price: 850000,
      bedrooms: 3,
      bathrooms: 2,
      status: 'active',
      days_on_market: 14,
      created_at: new Date().toISOString(),
    };
    
    const response = new Response(JSON.stringify(property), {
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
export const propertiesRoutes = {
  handle: (request: IRequest, ...args: any[]) => router.handle(request, ...args),
};
