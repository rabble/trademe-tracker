/**
 * Property Pins Hook
 * 
 * This hook provides functionality for managing property pins for both
 * authenticated and temporary users. It works with the progressive
 * authentication system to ensure pins are stored correctly.
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import useProgressiveAuth from '../useProgressiveAuth';

interface PropertyPin {
  id: string;
  property_id: string;
  user_id: string | null;
  temp_user_id: string | null;
  created_at: string;
  collection_id: string | null;
  notes: string | null;
}

interface PinPropertyOptions {
  collectionId?: string;
  notes?: string;
}

/**
 * Custom hook for managing property pins
 */
export const usePropertyPins = () => {
  const queryClient = useQueryClient();
  const { effectiveUserId, isAuthenticated, isTemporaryUser } = useProgressiveAuth();
  const [isReady, setIsReady] = useState(false);

  // Set up local supabase client with temporary user ID if needed
  useEffect(() => {
    const setTempUserHeader = async () => {
      if (isTemporaryUser && effectiveUserId) {
        // Set the temporary user ID in the Supabase client headers for RLS policies
        await supabase.rpc('set_temp_user_id', { p_temp_user_id: effectiveUserId });
      }
      setIsReady(true);
    };

    setTempUserHeader();
  }, [isTemporaryUser, effectiveUserId]);

  // Query to fetch all pins for the current user
  const {
    data: pins,
    isLoading,
    error,
    refetch
  } = useQuery<PropertyPin[]>({
    queryKey: ['propertyPins', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) {
        return [];
      }

      const query = supabase
        .from('property_pins')
        .select('*');

      // Different query based on user type
      if (isAuthenticated) {
        query.eq('user_id', effectiveUserId);
      } else if (isTemporaryUser) {
        query.eq('temp_user_id', effectiveUserId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
    enabled: !!effectiveUserId && isReady
  });

  // Check if a property is pinned by the current user
  const isPinned = useCallback(
    (propertyId: string) => {
      if (!pins) return false;
      return pins.some(pin => pin.property_id === propertyId);
    },
    [pins]
  );

  // Get pin details for a specific property
  const getPinDetails = useCallback(
    (propertyId: string) => {
      if (!pins) return null;
      return pins.find(pin => pin.property_id === propertyId) || null;
    },
    [pins]
  );

  // Mutation to pin a property
  const pinMutation = useMutation({
    mutationFn: async ({ 
      propertyId,
      options = {} 
    }: { 
      propertyId: string, 
      options?: PinPropertyOptions 
    }) => {
      if (!effectiveUserId) {
        throw new Error('No user ID available');
      }

      // Prepare the pin data based on user type
      const pinData = isAuthenticated
        ? {
            property_id: propertyId,
            user_id: effectiveUserId,
            collection_id: options.collectionId || null,
            notes: options.notes || null
          }
        : {
            property_id: propertyId,
            temp_user_id: effectiveUserId,
            collection_id: options.collectionId || null,
            notes: options.notes || null
          };

      const { data, error } = await supabase
        .from('property_pins')
        .insert(pinData)
        .select('*')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate the pins query to refetch
      queryClient.invalidateQueries({ queryKey: ['propertyPins', effectiveUserId] });
    }
  });

  // Mutation to unpin a property
  const unpinMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      if (!effectiveUserId) {
        throw new Error('No user ID available');
      }

      const pin = getPinDetails(propertyId);
      if (!pin) {
        throw new Error('Property is not pinned');
      }

      const query = supabase
        .from('property_pins')
        .delete()
        .eq('property_id', propertyId);

      // Different query based on user type
      if (isAuthenticated) {
        query.eq('user_id', effectiveUserId);
      } else if (isTemporaryUser) {
        query.eq('temp_user_id', effectiveUserId);
      }

      const { error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return true;
    },
    onSuccess: () => {
      // Invalidate the pins query to refetch
      queryClient.invalidateQueries({ queryKey: ['propertyPins', effectiveUserId] });
    }
  });

  // Mutation to update pin details
  const updatePinMutation = useMutation({
    mutationFn: async ({ 
      propertyId, 
      updates 
    }: { 
      propertyId: string, 
      updates: Partial<Pick<PropertyPin, 'collection_id' | 'notes'>> 
    }) => {
      if (!effectiveUserId) {
        throw new Error('No user ID available');
      }

      const pin = getPinDetails(propertyId);
      if (!pin) {
        throw new Error('Property is not pinned');
      }

      const query = supabase
        .from('property_pins')
        .update(updates)
        .eq('property_id', propertyId);

      // Different query based on user type
      if (isAuthenticated) {
        query.eq('user_id', effectiveUserId);
      } else if (isTemporaryUser) {
        query.eq('temp_user_id', effectiveUserId);
      }

      const { data, error } = await query
        .select('*')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate the pins query to refetch
      queryClient.invalidateQueries({ queryKey: ['propertyPins', effectiveUserId] });
    }
  });

  // Pin a property
  const pinProperty = useCallback(
    (propertyId: string, options?: PinPropertyOptions) => {
      if (isPinned(propertyId)) {
        // Property is already pinned
        return;
      }
      
      return pinMutation.mutateAsync({ propertyId, options });
    },
    [isPinned, pinMutation]
  );

  // Unpin a property
  const unpinProperty = useCallback(
    (propertyId: string) => {
      if (!isPinned(propertyId)) {
        // Property is not pinned
        return;
      }
      
      return unpinMutation.mutateAsync(propertyId);
    },
    [isPinned, unpinMutation]
  );

  // Toggle pin status for a property
  const togglePin = useCallback(
    (propertyId: string, options?: PinPropertyOptions) => {
      if (isPinned(propertyId)) {
        return unpinProperty(propertyId);
      } else {
        return pinProperty(propertyId, options);
      }
    },
    [isPinned, pinProperty, unpinProperty]
  );

  // Update pin details
  const updatePin = useCallback(
    (propertyId: string, updates: Partial<Pick<PropertyPin, 'collection_id' | 'notes'>>) => {
      if (!isPinned(propertyId)) {
        // Property is not pinned
        return;
      }
      
      return updatePinMutation.mutateAsync({ propertyId, updates });
    },
    [isPinned, updatePinMutation]
  );

  return {
    pins,
    isLoading,
    error,
    refetch,
    isPinned,
    getPinDetails,
    pinProperty,
    unpinProperty,
    togglePin,
    updatePin,
    isPinning: pinMutation.isPending,
    isUnpinning: unpinMutation.isPending,
    isUpdating: updatePinMutation.isPending
  };
};

export default usePropertyPins;