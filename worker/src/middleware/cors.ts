import { IRequest } from 'itty-router';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const handleCors = () => {
  return new Response(null, {
    headers: corsHeaders,
  });
};

export const withCors = (request: IRequest) => {
  // Add CORS headers to the original request
  if (request.method !== 'OPTIONS') {
    request.corsHeaders = corsHeaders;
  }
};

// Helper to add CORS headers to any response
export const addCorsHeaders = (response: Response): Response => {
  const newResponse = new Response(response.body, response);
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });
  
  return newResponse;
};
