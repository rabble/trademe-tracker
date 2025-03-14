import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { SavedFilter, PropertyFilters } from '../types';
import type { Json } from '../lib/supabase/schema';

export function useSavedFilters() {
  const [filters, setFilters] = useState<SavedFilter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchSavedFilters() {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
          .from('saved_filters')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (fetchError) throw fetchError;
        
        if (isMounted) {
          setFilters(data.map(filter => ({
            id: filter.id,
            name: filter.name,
            filters: filter.filters as PropertyFilters,
            createdAt: filter.created_at
          })));
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching saved filters:', err);
          setError(err instanceof Error ? err : new Error('Failed to fetch saved filters'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    fetchSavedFilters();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const saveFilter = async (name: string, filterConfig: PropertyFilters): Promise<SavedFilter> => {
    try {
      // Get the user ID first
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Convert PropertyFilters to a JSON-compatible object
      const filtersJson = JSON.parse(JSON.stringify(filterConfig)) as Json;
      
      const { data, error: saveError } = await supabase
        .from('saved_filters')
        .insert({
          name: name,
          filters: filtersJson,
          user_id: userId
        })
        .select()
        .single();
      
      if (saveError) throw saveError;
      
      const newFilter: SavedFilter = {
        id: data.id,
        name: data.name,
        filters: data.filters as PropertyFilters,
        createdAt: data.created_at
      };
      
      setFilters(prev => [newFilter, ...prev]);
      return newFilter;
    } catch (err) {
      console.error('Error saving filter:', err);
      throw err;
    }
  };

  const updateFilter = async (id: string, name: string, filterConfig: PropertyFilters): Promise<SavedFilter> => {
    try {
      // Convert PropertyFilters to a JSON-compatible object
      const filtersJson = JSON.parse(JSON.stringify(filterConfig)) as Json;
      
      const { data, error: updateError } = await supabase
        .from('saved_filters')
        .update({
          name: name,
          filters: filtersJson
        })
        .eq('id', id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      const updatedFilter: SavedFilter = {
        id: data.id,
        name: data.name,
        filters: data.filters as PropertyFilters,
        createdAt: data.created_at
      };
      
      setFilters(prev => prev.map(filter => 
        filter.id === id ? updatedFilter : filter
      ));
      
      return updatedFilter;
    } catch (err) {
      console.error('Error updating filter:', err);
      throw err;
    }
  };

  const deleteFilter = async (id: string): Promise<void> => {
    try {
      const { error: deleteError } = await supabase
        .from('saved_filters')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      setFilters(prev => prev.filter(filter => filter.id !== id));
    } catch (err) {
      console.error('Error deleting filter:', err);
      throw err;
    }
  };

  const refetch = async () => {
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('saved_filters')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      setFilters(data.map(filter => ({
        id: filter.id,
        name: filter.name,
        filters: filter.filters as PropertyFilters,
        createdAt: filter.created_at
      })));
      
      setError(null);
    } catch (err) {
      console.error('Error refetching saved filters:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch saved filters'));
    } finally {
      setIsLoading(false);
    }
  };

  return { filters, isLoading, error, saveFilter, updateFilter, deleteFilter, refetch };
}
