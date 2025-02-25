/**
 * API service for the application
 * This is a placeholder for future implementation
 */

// Base API URL
const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Generic fetch function with error handling
 */
async function fetchData<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  /**
   * Placeholder for future API methods
   */
  getProperties: async () => {
    return fetchData('/properties');
  },
};
