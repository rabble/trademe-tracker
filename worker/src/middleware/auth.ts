import { IRequest } from 'itty-router';
import { Env } from '../index';

// This is a simple auth middleware
// In a real application, you would implement proper JWT validation or other auth mechanisms
export const withAuth = async (request: IRequest, env: Env) => {
  const authHeader = request.headers.get('Authorization');
  
  // For development, we're bypassing authentication
  if (env.ENVIRONMENT === 'development') {
    return;
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Here you would validate the token
    // For now, we're just checking if it exists
    if (!token) {
      return new Response('Unauthorized', { status: 401 });
    }

    // You could add the user to the request for use in route handlers
    // request.user = { id: 'user-id', role: 'user' };
  } catch (error) {
    return new Response('Unauthorized', { status: 401 });
  }
};
