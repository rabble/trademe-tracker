/**
 * Progressive Authentication Hook
 * 
 * This hook provides a unified interface for managing both temporary and permanent user
 * authentication states. It extends the standard Supabase auth with the ability to handle
 * anonymous users through temporary IDs.
 */

import { useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
  getTempUserId,
  ensureTempUserId,
  clearTempUserId,
  updateTempUserActivity,
  isTempUserId
} from '../lib/tempUserManager';

interface ProgressiveAuthState {
  user: User | null;
  tempUserId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isTemporaryUser: boolean;
  effectiveUserId: string | null;
}

/**
 * Custom hook for managing progressive authentication
 * Handles both permanent and temporary user authentication states
 */
export const useProgressiveAuth = () => {
  const [authState, setAuthState] = useState<ProgressiveAuthState>({
    user: null,
    tempUserId: null,
    isLoading: true,
    isAuthenticated: false,
    isTemporaryUser: false,
    effectiveUserId: null
  });

  // Update auth state based on current user and temp user
  const updateAuthState = useCallback(async (user: User | null) => {
    if (user) {
      // Authenticated user - clear any temp user data
      setAuthState({
        user,
        tempUserId: null,
        isLoading: false,
        isAuthenticated: true,
        isTemporaryUser: false,
        effectiveUserId: user.id
      });
    } else {
      // No authenticated user - use or create a temporary user
      const tempUserId = ensureTempUserId();
      // Update last activity timestamp for temp user
      await updateTempUserActivity(tempUserId);
      
      setAuthState({
        user: null,
        tempUserId,
        isLoading: false,
        isAuthenticated: false,
        isTemporaryUser: true,
        effectiveUserId: tempUserId
      });
    }
  }, []);

  // Initial auth state setup and auth change subscription
  useEffect(() => {
    // Set initial loading state
    setAuthState(prev => ({ ...prev, isLoading: true }));

    // Get current auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      
      // Update state based on current user
      updateAuthState(currentUser);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user || null;
        
        if (event === 'SIGNED_IN') {
          // If user signs in, merge any temporary data
          const tempUserId = getTempUserId();
          if (tempUserId && user) {
            await mergeTemporaryDataToUser(tempUserId, user.id);
            clearTempUserId();
          }
        }
        
        await updateAuthState(user);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [updateAuthState]);

  /**
   * Merge temporary user data to permanent user account
   */
  const mergeTemporaryDataToUser = async (tempUserId: string, userId: string): Promise<void> => {
    try {
      // Get pre-merge counts for analytics
      const { data: pinData } = await supabase
        .from('property_pins')
        .select('id', { count: 'exact' })
        .eq('temp_user_id', tempUserId);
        
      const { data: collectionData } = await supabase
        .from('property_collections')
        .select('id', { count: 'exact' })
        .eq('temp_user_id', tempUserId);
      
      const tempDataCounts = {
        pins: pinData?.length || 0,
        collections: collectionData?.length || 0
      };
      
      // Call the merge function in Supabase
      const { error } = await supabase.rpc('merge_temp_user_data', {
        p_temp_user_id: tempUserId,
        p_permanent_user_id: userId
      });
      
      if (error) {
        throw error;
      }
      
      console.log(`Successfully merged temporary user data from ${tempUserId} to user ${userId}`);
      
      // Track the data merge in analytics
      import('../lib/analytics/progressiveLoginTracking')
        .then(({ trackTempDataMerged }) => {
          trackTempDataMerged(tempDataCounts);
        })
        .catch(err => {
          console.error('Failed to track data merging:', err);
        });
    } catch (error) {
      console.error('Error merging temporary user data:', error);
    }
  };

  /**
   * Sign up a new user and merge any temporary data
   */
  const signUp = async (email: string, password: string) => {
    try {
      // Check if the user has temporary data before signup
      const tempUserId = getTempUserId();
      let pinCount = 0;
      
      if (tempUserId) {
        // Get pin count for analytics
        const { data: pins } = await supabase
          .from('property_pins')
          .select('id', { count: 'exact' })
          .eq('temp_user_id', tempUserId);
        
        pinCount = pins?.length || 0;
      }
      
      // Perform signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      // Track account creation in analytics
      import('../lib/analytics/progressiveLoginTracking')
        .then(({ trackAccountCreated }) => {
          trackAccountCreated(!!tempUserId, pinCount);
        })
        .catch(err => {
          console.error('Failed to track account creation:', err);
        });
      
      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  /**
   * Sign in a user and merge any temporary data
   */
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  /**
   * Check if user needs to upgrade (create a permanent account)
   * @param action Optional action type to check against threshold
   * @returns Whether the user should be prompted to upgrade
   */
  const needsUpgrade = (action?: 'pin' | 'collection' | 'comment' | 'share' | 'notes') => {
    if (authState.isAuthenticated) {
      return false; // Already authenticated
    }
    
    // Always require upgrade for certain actions
    if (action === 'comment' || action === 'share' || action === 'notes') {
      return true;
    }
    
    // Add logic here for other upgrade prompts
    // e.g., threshold number of pins, collections, etc.
    return false; // Default is to not prompt
  };

  /**
   * Get the effective user ID (either permanent or temporary)
   */
  const getEffectiveUserId = () => {
    return authState.effectiveUserId;
  };

  /**
   * Check if a user ID is a temporary one
   */
  const isTemporaryUserId = (id: string) => {
    return isTempUserId(id);
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    needsUpgrade,
    getEffectiveUserId,
    isTemporaryUserId
  };
};

export default useProgressiveAuth;