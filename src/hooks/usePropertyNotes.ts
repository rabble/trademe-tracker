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
    if (!propertyId) {
      console.error('[usePropertyNotes] Cannot save notes: propertyId is undefined');
      return;
    }
    
    console.log(`[usePropertyNotes] ==================== START SAVE NOTES ====================`);
    console.log(`[usePropertyNotes] Saving notes for property ${propertyId}:`, newNotes);
    console.log(`[usePropertyNotes] Property ID type:`, typeof propertyId);
    console.log(`[usePropertyNotes] Property ID length:`, propertyId.length);
    console.log(`[usePropertyNotes] Notes length:`, newNotes.length);
    
    try {
      setIsSaving(true);
      setSaveError(null);
      
      // First check if the property exists
      console.log('[usePropertyNotes] Checking if property exists...');
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('id')
        .eq('id', propertyId)
        .single();
        
      console.log('[usePropertyNotes] Property check result:', { 
        property, 
        error: propertyError,
        propertyExists: !!property,
        errorCode: propertyError?.code,
        errorMessage: propertyError?.message
      });
      
      if (propertyError) {
        console.error('[usePropertyNotes] Property does not exist or error fetching:', propertyError);
        console.error('[usePropertyNotes] Full error details:', JSON.stringify(propertyError));
      }
      
      // Use both services for redundancy
      console.log('[usePropertyNotes] Calling services to save notes...');
      const results = await Promise.allSettled([
        PropertyNotesService.saveNotes(propertyId, newNotes),
        AnalyticsService.savePropertyNotes(propertyId, newNotes)
      ]);
      
      console.log('[usePropertyNotes] Save results:', results);
      
      // Check if any of the promises were rejected
      const rejectedPromises = results.filter(result => result.status === 'rejected');
      if (rejectedPromises.length > 0) {
        console.error('[usePropertyNotes] Some save operations failed:', 
          rejectedPromises.map(p => (p as PromiseRejectedResult).reason));
        
        // If all promises were rejected, throw the first error
        if (rejectedPromises.length === results.length) {
          throw (rejectedPromises[0] as PromiseRejectedResult).reason;
        }
      }
      
      // Try a direct update as a last resort if all else failed
      if (rejectedPromises.length === results.length) {
        console.log('[usePropertyNotes] All service calls failed, trying direct update...');
        const { data, error } = await supabase
          .from('properties')
          .update({ user_notes: newNotes })
          .eq('id', propertyId)
          .select();
          
        console.log('[usePropertyNotes] Direct update result:', { 
          data, 
          error,
          updateSuccessful: !!data && data.length > 0
        });
        
        if (error) {
          console.error('[usePropertyNotes] Direct update failed:', error);
          throw error;
        }
      }
      
      setNotes(newNotes);
      console.log('[usePropertyNotes] Notes saved successfully');
      console.log(`[usePropertyNotes] ==================== END SAVE NOTES ====================`);
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
