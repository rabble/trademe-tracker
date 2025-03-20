/**
 * Progressive Login Analytics Tracking
 * 
 * This module provides tracking functions for the progressive login system,
 * including temporary user creation, feature usage, and conversion events.
 */

import { getTempUserId } from '../tempUserManager';
import { supabase } from '../supabase';

// Analytics event types
export type ProgressiveLoginEvent = 
  | 'temp_user_created'
  | 'property_pinned'
  | 'collection_created'
  | 'feature_gated'
  | 'login_prompted'
  | 'email_captured'
  | 'account_created'
  | 'temp_data_merged';

// Event metadata interface
export interface EventMetadata {
  [key: string]: string | number | boolean | null;
}

/**
 * Track a progressive login event
 * @param event The event type to track
 * @param metadata Additional metadata about the event
 */
export const trackProgressiveLoginEvent = async (
  event: ProgressiveLoginEvent,
  metadata: EventMetadata = {}
): Promise<void> => {
  try {
    // Get user identifier (temporary or permanent)
    const tempUserId = getTempUserId();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    // Prepare event data
    const eventData = {
      event_type: event,
      temp_user_id: tempUserId,
      user_id: userId,
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
      }
    };
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', eventData);
    }
    
    // Send to analytics service
    // In a real implementation, this would go to a proper analytics service
    // For this implementation, we'll store it in Supabase if available
    
    if (supabase) {
      const { error } = await supabase
        .from('analytics_events')
        .insert([eventData]);
      
      if (error) {
        console.error('Error storing analytics event:', error);
      }
    }
    
    // You could also send this to a dedicated analytics service like Segment, Amplitude, etc.
    
  } catch (error) {
    console.error('Error tracking progressive login event:', error);
  }
};

/**
 * Track temporary user creation
 */
export const trackTempUserCreated = (): void => {
  trackProgressiveLoginEvent('temp_user_created');
};

/**
 * Track when a property is pinned by a temporary user
 * @param propertyId The ID of the property that was pinned
 * @param pinCount The user's total pin count after this action
 */
export const trackPropertyPinned = (propertyId: string, pinCount: number): void => {
  trackProgressiveLoginEvent('property_pinned', { propertyId, pinCount });
};

/**
 * Track when a collection is created by a temporary user
 * @param collectionId The ID of the collection that was created
 * @param collectionName The name of the collection
 */
export const trackCollectionCreated = (collectionId: string, collectionName: string): void => {
  trackProgressiveLoginEvent('collection_created', { collectionId, collectionName });
};

/**
 * Track when a feature is gated/limited for a temporary user
 * @param feature The feature that was gated
 */
export const trackFeatureGated = (feature: string): void => {
  trackProgressiveLoginEvent('feature_gated', { feature });
};

/**
 * Track when a login prompt is shown to a temporary user
 * @param promptType The type of login prompt that was shown
 * @param action Whether the user took action (clicked register/login), dismissed, or when the prompt was shown
 */
export const trackLoginPrompted = (promptType: string, action: 'register' | 'login' | 'dismissed' | 'shown'): void => {
  trackProgressiveLoginEvent('login_prompted', { promptType, action });
};

/**
 * Track when a temporary user provides their email (partial registration)
 */
export const trackEmailCaptured = (): void => {
  trackProgressiveLoginEvent('email_captured');
};

/**
 * Track when a temporary user creates a full account
 * @param hadTempData Whether the user had temporary data that was merged
 * @param pinCount The number of pins the user had before conversion
 */
export const trackAccountCreated = (hadTempData: boolean, pinCount: number = 0): void => {
  trackProgressiveLoginEvent('account_created', { hadTempData, pinCount });
};

/**
 * Track when temporary data is merged into a permanent account
 * @param tempDataCounts Counts of different types of temporary data
 */
export const trackTempDataMerged = (tempDataCounts: { 
  pins: number;
  collections: number;
}): void => {
  trackProgressiveLoginEvent('temp_data_merged', tempDataCounts);
};