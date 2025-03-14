import { useState, useEffect } from 'react';
import { PropertyDbService } from '../services/property/propertyDbService';
import type { Property, PropertyFilters } from '../types';

export function useProperties(
  filters?: PropertyFilters,
  page: number = 1,
  limit: number = 20
) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchProperties() {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, count } = await PropertyDbService.fetchProperties(filters, page, limit);
        
        if (isMounted) {
          setProperties(data);
          setTotalCount(count);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching properties:', err);
          setError(err instanceof Error ? err : new Error('Failed to fetch properties'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    fetchProperties();
    
    return () => {
      isMounted = false;
    };
  }, [filters, page, limit]);

  const refetch = async () => {
    setIsLoading(true);
    try {
      const { data, count } = await PropertyDbService.fetchProperties(filters, page, limit);
      setProperties(data);
      setTotalCount(count);
      setError(null);
    } catch (err) {
      console.error('Error refetching properties:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch properties'));
    } finally {
      setIsLoading(false);
    }
  };

  return { properties, totalCount, isLoading, error, refetch };
}
