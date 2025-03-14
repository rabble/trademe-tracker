import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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
        
        // Check if tables exist before querying
        try {
          const { data: tableCheck } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .eq('table_name', 'properties');
            
          if (!tableCheck || tableCheck.length === 0) {
            console.warn('Properties table does not exist yet');
            if (isMounted) {
              setProperties([]);
              setTotalCount(0);
              setIsLoading(false);
            }
            return;
          }
        } catch (tableErr) {
          console.warn('Could not check if tables exist:', tableErr);
          // Continue anyway
        }
        
        const { data, count } = await PropertyDbService.fetchProperties(filters, page, limit);
        
        if (isMounted) {
          setProperties(data || []);
          setTotalCount(count || 0);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching properties:', err);
          setError(err instanceof Error ? err : new Error('Failed to fetch properties'));
          // Set empty data on error
          setProperties([]);
          setTotalCount(0);
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
