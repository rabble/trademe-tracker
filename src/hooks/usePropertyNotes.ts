import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PropertyNotesService } from '../services/property/propertyNotesService';
import { AnalyticsService } from '../services/analytics/analyticsService';

export function usePropertyNotes(propertyId: string | undefined) {
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [saveError, setSaveError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchNotes() {
      if (!propertyId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('properties')
          .select('user_notes')
          .eq('id', propertyId)
          .single();
        
        if (error) throw error;
        
        if (isMounted) {
          setNotes(data?.user_notes || '');
        }
      } catch (err) {
        console.error('Error fetching property notes:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch property notes'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    fetchNotes();
    
    return () => {
      isMounted = false;
    };
  }, [propertyId]);

  const saveNotes = async (newNotes: string) => {
    if (!propertyId) return;
    
    try {
      setIsSaving(true);
      setSaveError(null);
      
      // Use both services for redundancy
      await Promise.all([
        PropertyNotesService.saveNotes(propertyId, newNotes),
        AnalyticsService.savePropertyNotes(propertyId, newNotes)
      ]);
      
      setNotes(newNotes);
      console.log('Notes saved successfully');
    } catch (err) {
      console.error('Error saving property notes:', err);
      setSaveError(err instanceof Error ? err : new Error('Failed to save property notes'));
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    notes,
    setNotes,
    saveNotes,
    isLoading,
    isSaving,
    error,
    saveError
  };
}
