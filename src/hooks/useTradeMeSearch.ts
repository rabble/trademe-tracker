import { useState, useEffect } from 'react';
import { Property } from '../types';
import { TradeMeService } from '../services/trademe/trademeService';

interface UseTradeMeSearchResult {
  properties: Property[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTradeMeSearch(searchParams: Record<string, string> = {}): UseTradeMeSearchResult {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchCounter, setRefetchCounter] = useState(0);

  useEffect(() => {
    let isMounted = true;
    
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await TradeMeService.searchProperties(searchParams);
        
        if (isMounted) {
          setProperties(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProperties();

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(searchParams), refetchCounter]);

  const refetch = () => {
    setRefetchCounter(prev => prev + 1);
  };

  return { properties, isLoading, error, refetch };
}
