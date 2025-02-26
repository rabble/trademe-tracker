import { addCorsHeaders } from './cors';

// Standard error response format
interface ErrorResponse {
  error: {
    message: string;
    code: string;
    status: number;
  };
}

export const errorHandler = (error: Error | any): Response => {
  console.error('Error:', error);

  // Default error response
  const errorResponse: ErrorResponse = {
    error: {
      message: 'An unexpected error occurred',
      code: 'INTERNAL_SERVER_ERROR',
      status: 500,
    },
  };

  // Handle known error types
  if (error instanceof Error) {
    errorResponse.error.message = error.message;
    
    // You can add custom error handling based on error types
    if (error.name === 'NotFoundError') {
      errorResponse.error.status = 404;
      errorResponse.error.code = 'NOT_FOUND';
    } else if (error.name === 'ValidationError') {
      errorResponse.error.status = 400;
      errorResponse.error.code = 'VALIDATION_ERROR';
    }
  }

  // Create the response with proper status code
  const response = new Response(JSON.stringify(errorResponse), {
    status: errorResponse.error.status,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add CORS headers
  return addCorsHeaders(response);
};
