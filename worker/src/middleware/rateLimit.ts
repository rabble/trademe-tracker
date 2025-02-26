import { IRequest } from 'itty-router';
import { Env } from '../index';

// Simple in-memory rate limiting
// In a production environment, you would use a more robust solution with KV or Durable Objects
export const withRateLimit = async (request: IRequest, env: Env) => {
  // Skip rate limiting in development
  if (env.ENVIRONMENT === 'development') {
    return;
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const route = new URL(request.url).pathname;
  
  // Create a key for this IP and route
  const key = `ratelimit:${ip}:${route}`;
  
  try {
    // In a real implementation, you would:
    // 1. Get the current count from KV or Durable Objects
    // 2. Check if it exceeds the limit
    // 3. Increment the count
    // 4. Set an expiry

    // For now, we'll just allow all requests
    return;
  } catch (error) {
    console.error('Rate limit error:', error);
    // Allow the request in case of an error with the rate limiting system
    return;
  }
};
