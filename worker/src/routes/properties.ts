import { Router, IRequest } from 'itty-router';
import { Env } from '../index';
import { addCorsHeaders } from '../middleware/cors';
import { UrlScraperService } from '../services/url-scraper';

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

// POST /api/properties/scrape - Scrape URL for property data
router.post('/scrape', async (request: IRequest, env: Env) => {
  try {
    // Parse the request body to get the URL
    const requestData = await request.json();
    
    if (!requestData.url) {
      const errorResponse = new Response(JSON.stringify({
        success: false,
        error: 'URL is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return addCorsHeaders(errorResponse);
    }

    // Create the URL scraper service
    const scraperService = new UrlScraperService(env);
    
    // Scrape the URL
    const result = await scraperService.scrapeUrl(requestData.url);
    
    // If the URL is from TradeMe, use our custom TradeMe scraper too (client-side)
    // The client will detect this and use the client-side scraper when available
    const isTradeMe = requestData.url.includes('trademe.co.nz');
    
    const response = new Response(JSON.stringify({
      ...result,
      isTradeMe
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error in property scraping handler:', error);
    const errorResponse = new Response(JSON.stringify({
      success: false,
      error: `Error processing request: ${error instanceof Error ? error.message : String(error)}`
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return addCorsHeaders(errorResponse);
  }
});

// POST /api/properties/import - Create property from scraped data
router.post('/import', async (request: IRequest, env: Env) => {
  // Handle OPTIONS preflight request
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
  
  try {
    // Parse the request body
    const propertyData = await request.json();
    
    // Validate required fields
    if (!propertyData.title || !propertyData.url) {
      const errorResponse = new Response(JSON.stringify({
        success: false,
        error: 'Title and URL are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return addCorsHeaders(errorResponse);
    }

    // Generate a unique ID for the property
    const propertyId = crypto.randomUUID();
    
    // Create the property record with reasonable defaults for missing fields
    const property = {
      id: propertyId,
      title: propertyData.title,
      address: propertyData.address || 'Unknown location',
      url: propertyData.url,
      status: propertyData.status || 'active',
      days_on_market: propertyData.days_on_market || 0,
      listing_type: propertyData.listing_type || 'for_sale',
      price: propertyData.price || (propertyData.listing_type === 'rental' ? 500 : 750000),
      // Include all other fields if provided
      ...propertyData,
      // Force created_at and updated_at to be current
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Log the property data being saved
    console.log('Saving property data:', property);
    
    // Store the property in KV store (in a real implementation)
    // await env.PROPERTIES_KV.put(`property:${propertyId}`, JSON.stringify(property));
    
    const response = new Response(JSON.stringify({
      success: true,
      id: propertyId,
      property
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return addCorsHeaders(response);
  } catch (error) {
    console.error('Error in property import handler:', error);
    const errorResponse = new Response(JSON.stringify({
      success: false,
      error: `Error processing request: ${error instanceof Error ? error.message : String(error)}`
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return addCorsHeaders(errorResponse);
  }
});

// Export the router with a handle method for the main router
export const propertiesRoutes = {
  handle: (request: IRequest, ...args: any[]) => router.handle(request, ...args),
};
