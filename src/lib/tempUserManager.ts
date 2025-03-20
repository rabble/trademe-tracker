/**
 * Temporary User Management System
 * 
 * This module provides utilities for managing temporary user IDs for the
 * progressive login system. It handles generation, storage, and retrieval
 * of temporary user IDs using a combination of cookies and localStorage.
 */

import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';

// Constants
const TEMP_USER_COOKIE_NAME = 'mivoy_temp_user_id';
const TEMP_USER_STORAGE_KEY = 'mivoy_temp_user_id';
const TEMP_USER_ID_PREFIX = 'temp_';
const COOKIE_EXPIRY_DAYS = 30;

/**
 * Generate a new temporary user ID
 * @returns A unique temporary user ID with the 'temp_' prefix
 */
export const generateTempUserId = (): string => {
  return `${TEMP_USER_ID_PREFIX}${uuidv4()}`;
};

/**
 * Store a temporary user ID in both cookies and localStorage for redundancy
 * @param tempUserId The temporary user ID to store
 */
export const storeTempUserId = (tempUserId: string): void => {
  try {
    // Store in cookie (primary storage)
    Cookies.set(TEMP_USER_COOKIE_NAME, tempUserId, {
      expires: COOKIE_EXPIRY_DAYS,
      path: '/',
      sameSite: 'strict'
    });
    
    // Store in localStorage as fallback
    localStorage.setItem(TEMP_USER_STORAGE_KEY, tempUserId);
    
    console.debug('Temporary user ID stored successfully');
  } catch (error) {
    console.error('Failed to store temporary user ID:', error);
  }
};

/**
 * Retrieve the temporary user ID from cookies or localStorage
 * @returns The temporary user ID if found, null otherwise
 */
export const getTempUserId = (): string | null => {
  try {
    // First try to get from cookie (primary)
    let tempUserId = Cookies.get(TEMP_USER_COOKIE_NAME);
    
    // If not found in cookie, try localStorage as fallback
    if (!tempUserId) {
      tempUserId = localStorage.getItem(TEMP_USER_STORAGE_KEY) || undefined;
      
      // If found in localStorage but not in cookie, restore the cookie
      if (tempUserId) {
        storeTempUserId(tempUserId);
      }
    }
    
    // Validate the ID format before returning
    if (tempUserId && isTempUserId(tempUserId)) {
      return tempUserId;
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving temporary user ID:', error);
    return null;
  }
};

/**
 * Ensures a temporary user ID exists, creating one if it doesn't
 * @returns The existing or newly created temporary user ID
 */
export const ensureTempUserId = (): string => {
  let tempUserId = getTempUserId();
  let isNewUser = false;
  
  if (!tempUserId) {
    tempUserId = generateTempUserId();
    storeTempUserId(tempUserId);
    isNewUser = true;
    
    // Register the temporary user in the database
    registerTempUserInDatabase(tempUserId).catch(error => {
      console.error('Failed to register temporary user in database:', error);
    });
  }
  
  // Track analytics for new temporary users
  if (isNewUser) {
    // Import analytics tracking module dynamically to avoid circular dependencies
    import('./analytics/progressiveLoginTracking')
      .then(({ trackTempUserCreated }) => {
        trackTempUserCreated();
      })
      .catch(error => {
        console.error('Failed to track temporary user creation:', error);
      });
  }
  
  return tempUserId;
};

/**
 * Clear the temporary user ID from storage
 */
export const clearTempUserId = (): void => {
  try {
    Cookies.remove(TEMP_USER_COOKIE_NAME, { path: '/' });
    localStorage.removeItem(TEMP_USER_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing temporary user ID:', error);
  }
};

/**
 * Check if a string is a valid temporary user ID
 * @param id The ID to check
 * @returns True if the ID is a valid temporary user ID
 */
export const isTempUserId = (id: string): boolean => {
  return id.startsWith(TEMP_USER_ID_PREFIX) && id.length > TEMP_USER_ID_PREFIX.length + 30; // UUID is at least 30 chars
};

/**
 * Register a new temporary user in the database
 * @param tempUserId The temporary user ID to register
 */
const registerTempUserInDatabase = async (tempUserId: string): Promise<void> => {
  // Import supabase client here to avoid circular dependencies
  const { supabase } = await import('../lib/supabase');
  
  try {
    const { error } = await supabase
      .from('temp_users')
      .insert({ id: tempUserId });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error registering temporary user in database:', error);
    throw error;
  }
};

/**
 * Update the temporary user's last active timestamp
 * @param tempUserId The temporary user ID to update
 */
export const updateTempUserActivity = async (tempUserId: string): Promise<void> => {
  // Import supabase client here to avoid circular dependencies
  const { supabase } = await import('../lib/supabase');
  
  try {
    const { error } = await supabase
      .from('temp_users')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', tempUserId);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating temporary user activity:', error);
  }
};