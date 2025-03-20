/**
 * Property Collections Hook
 * 
 * This hook provides functionality for managing property collections for both
 * authenticated and temporary users. It works with the progressive
 * authentication system to ensure collections are stored correctly.
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import useProgressiveAuth from '../useProgressiveAuth';
import usePropertyPins from './usePropertyPins';

interface PropertyCollection {
  id: string;
  name: string;
  description: string | null;
  user_id: string | null;
  temp_user_id: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateCollectionInput {
  name: string;
  description?: string;
}

interface UpdateCollectionInput {
  name?: string;
  description?: string;
}

/**
 * Custom hook for managing property collections
 */
export const usePropertyCollections = () => {
  const queryClient = useQueryClient();
  const { effectiveUserId, isAuthenticated, isTemporaryUser } = useProgressiveAuth();
  const { pins, updatePin } = usePropertyPins();
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

  // Query to fetch all collections for the current user
  const {
    data: collections,
    isLoading,
    error,
    refetch
  } = useQuery<PropertyCollection[]>({
    queryKey: ['propertyCollections', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) {
        return [];
      }

      const query = supabase
        .from('property_collections')
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

  // Get a collection by ID
  const getCollectionById = useCallback(
    (collectionId: string) => {
      if (!collections) return null;
      return collections.find(collection => collection.id === collectionId) || null;
    },
    [collections]
  );

  // Get properties in a collection
  const getPropertiesInCollection = useCallback(
    (collectionId: string) => {
      if (!pins) return [];
      return pins.filter(pin => pin.collection_id === collectionId);
    },
    [pins]
  );

  // Mutation to create a new collection
  const createCollectionMutation = useMutation({
    mutationFn: async (input: CreateCollectionInput) => {
      if (!effectiveUserId) {
        throw new Error('No user ID available');
      }

      // Prepare the collection data based on user type
      const collectionData = isAuthenticated
        ? {
            name: input.name,
            description: input.description || null,
            user_id: effectiveUserId
          }
        : {
            name: input.name,
            description: input.description || null,
            temp_user_id: effectiveUserId
          };

      const { data, error } = await supabase
        .from('property_collections')
        .insert(collectionData)
        .select('*')
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate the collections query to refetch
      queryClient.invalidateQueries({ queryKey: ['propertyCollections', effectiveUserId] });
    }
  });

  // Mutation to update a collection
  const updateCollectionMutation = useMutation({
    mutationFn: async ({ 
      collectionId, 
      updates 
    }: { 
      collectionId: string, 
      updates: UpdateCollectionInput 
    }) => {
      if (!effectiveUserId) {
        throw new Error('No user ID available');
      }

      const query = supabase
        .from('property_collections')
        .update(updates)
        .eq('id', collectionId);

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
      // Invalidate the collections query to refetch
      queryClient.invalidateQueries({ queryKey: ['propertyCollections', effectiveUserId] });
    }
  });

  // Mutation to delete a collection
  const deleteCollectionMutation = useMutation({
    mutationFn: async (collectionId: string) => {
      if (!effectiveUserId) {
        throw new Error('No user ID available');
      }

      // First, remove collection reference from all pins in this collection
      const pinsInCollection = getPropertiesInCollection(collectionId);
      
      for (const pin of pinsInCollection) {
        await updatePin(pin.property_id, { collection_id: null });
      }

      // Then delete the collection
      const query = supabase
        .from('property_collections')
        .delete()
        .eq('id', collectionId);

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
      // Invalidate the collections query to refetch
      queryClient.invalidateQueries({ queryKey: ['propertyCollections', effectiveUserId] });
    }
  });

  // Create a new collection
  const createCollection = useCallback(
    (input: CreateCollectionInput) => {
      return createCollectionMutation.mutateAsync(input);
    },
    [createCollectionMutation]
  );

  // Update a collection
  const updateCollection = useCallback(
    (collectionId: string, updates: UpdateCollectionInput) => {
      return updateCollectionMutation.mutateAsync({ collectionId, updates });
    },
    [updateCollectionMutation]
  );

  // Delete a collection
  const deleteCollection = useCallback(
    (collectionId: string) => {
      return deleteCollectionMutation.mutateAsync(collectionId);
    },
    [deleteCollectionMutation]
  );

  // Add a property to a collection
  const addPropertyToCollection = useCallback(
    async (propertyId: string, collectionId: string) => {
      if (!pins) return null;
      
      const pin = pins.find(p => p.property_id === propertyId);
      
      if (pin) {
        // Property is already pinned, just update the collection
        return updatePin(propertyId, { collection_id: collectionId });
      } else {
        // Property is not pinned yet, pin it with the collection
        const { pinProperty } = usePropertyPins();
        return pinProperty(propertyId, { collectionId });
      }
    },
    [pins, updatePin]
  );

  // Remove a property from a collection
  const removePropertyFromCollection = useCallback(
    (propertyId: string, collectionId: string) => {
      if (!pins) return null;
      
      const pin = pins.find(p => p.property_id === propertyId && p.collection_id === collectionId);
      
      if (pin) {
        return updatePin(propertyId, { collection_id: null });
      }
    },
    [pins, updatePin]
  );

  return {
    collections,
    isLoading,
    error,
    refetch,
    getCollectionById,
    getPropertiesInCollection,
    createCollection,
    updateCollection,
    deleteCollection,
    addPropertyToCollection,
    removePropertyFromCollection,
    isCreating: createCollectionMutation.isPending,
    isUpdating: updateCollectionMutation.isPending,
    isDeleting: deleteCollectionMutation.isPending
  };
};

export default usePropertyCollections;