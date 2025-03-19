/**
 * TradeMe Property Service
 * Handles property-related operations with TradeMe API
 */
import { Property } from '../../types';
import { 
  getApiUrls, 
  CONSUMER_KEY, 
  CONSUMER_SECRET 
} from '../../config/trademeConfig';
import { 
  generateDirectOAuthHeader 
} from '../../utils/oauthUtils';
import {
  getStoredOAuthTokens,
  validateOAuthTokens,
  getTradeMeUserId
} from '../../utils/storageUtils';
import {
  mapListingToProperty,
  mapWatchlistItemToProperty,
  convertSearchResultsToProperties
} from '../../utils/propertyMappers';

/**
 * TradeMe Property Service
 */
export const TradeMePropertyService = {
  /**
   * Search for properties on TradeMe
   * 
   * @param searchParams - Search parameters
   * @returns Promise with array of properties
   */
  async searchProperties(searchParams: Record<string, string> = {}): Promise<Property[]> {
    try {
      // Validate the OAuth tokens first
      const tokenValidation = validateOAuthTokens();
      
      if (!tokenValidation.isValid) {
        throw new Error(`TradeMe authentication error: ${tokenValidation.errorMessage || 'Unknown error'}`);
      }
      
      // Get stored OAuth tokens
      const { token, tokenSecret, isSandbox } = getStoredOAuthTokens();
      
      // Get the appropriate API URLs
      const { apiUrl } = getApiUrls(isSandbox);
      
      console.log(`Searching properties with ${isSandbox ? 'sandbox' : 'production'} environment`);
      
      // Default to property category
      const defaultParams = {
        category: '5', // Property category
        rows: '20',
        sort_order: 'Default'
      };
      
      const params = { ...defaultParams, ...searchParams };
      
      // Build query string
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      
      const url = `${apiUrl}/v1/Search/Property.json?${queryString}`;
      
      console.log(`Searching properties at: ${url}`);
      
      // Generate the OAuth header
      const authHeader = generateDirectOAuthHeader(
        'api',
        CONSUMER_KEY,
        CONSUMER_SECRET,
        { token, tokenSecret }
      );
      
      // Make the direct request to TradeMe
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json'
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`TradeMe API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Convert TradeMe search results to our Property format
      return convertSearchResultsToProperties(data);
    } catch (error) {
      console.error('Error searching properties:', error);
      throw error;
    }
  },
  
  /**
   * Get property details from TradeMe
   * 
   * @param propertyId - TradeMe property ID
   * @returns Promise with property details
   */
  async getPropertyDetails(propertyId: string): Promise<Property> {
    try {
      // Validate the OAuth tokens first
      const tokenValidation = validateOAuthTokens();
      
      if (!tokenValidation.isValid) {
        throw new Error(`TradeMe authentication error: ${tokenValidation.errorMessage || 'Unknown error'}`);
      }
      
      // Get stored OAuth tokens
      const { token, tokenSecret, isSandbox } = getStoredOAuthTokens();
      
      // Get the appropriate API URLs
      const { apiUrl } = getApiUrls(isSandbox);
      
      console.log(`Fetching property details for ${propertyId} with ${isSandbox ? 'sandbox' : 'production'} environment`);
      
      const url = `${apiUrl}/v1/Listings/${propertyId}.json`;
      
      console.log(`Fetching property details from: ${url}`);
      
      // Generate the OAuth header
      const authHeader = generateDirectOAuthHeader(
        'api',
        CONSUMER_KEY,
        CONSUMER_SECRET,
        { token, tokenSecret }
      );
      
      // Make the direct request to TradeMe
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json',
          'Origin': window.location.origin
        }
      });
      
      if (!response.ok) {
        throw new Error(`TradeMe API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Convert TradeMe listing to our Property format
      return mapListingToProperty(data);
    } catch (error) {
      console.error(`Error fetching property details for ${propertyId}:`, error);
      throw error;
    }
  },
  
  /**
   * Fetch watchlist from TradeMe and store in database
   * 
   * @returns Promise with sync results including count of synced properties
   */
  async syncWatchlistToDatabase(): Promise<{ 
    count: number;
    failures?: number;
    total?: number;
  }> {
    try {
      console.log('Starting syncWatchlistToDatabase...');
      
      // Validate the OAuth tokens first
      const tokenValidation = validateOAuthTokens();
      console.log('OAuth token validation:', tokenValidation);
      
      if (!tokenValidation.isValid) {
        console.error('TradeMe authentication error:', tokenValidation.errorMessage);
        throw new Error(`TradeMe authentication error: ${tokenValidation.errorMessage || 'Unknown error'}`);
      }
      
      // Get stored OAuth tokens
      const { token, tokenSecret, isSandbox } = getStoredOAuthTokens();
      console.log('OAuth tokens retrieved:', {
        hasToken: !!token,
        hasTokenSecret: !!tokenSecret,
        tokenLength: token?.length || 0,
        tokenSecretLength: tokenSecret?.length || 0,
        isSandbox
      });
      
      // Get the appropriate API URLs
      const { apiUrl } = getApiUrls(isSandbox);
      
      console.log(`Fetching watchlist from ${isSandbox ? 'sandbox' : 'production'} environment`);
      
      // Fetch watchlist from TradeMe
      const url = `${apiUrl}/v1/MyTradeMe/Watchlist/All.json?category=5&rows=100`;
      
      console.log(`Fetching watchlist from: ${url}`);
      
      // Generate the OAuth header
      const authHeader = generateDirectOAuthHeader(
        'api',
        CONSUMER_KEY,
        CONSUMER_SECRET,
        { token, tokenSecret }
      );
      
      console.log('Making request to TradeMe API with auth header:', 
        authHeader.substring(0, 20) + '...[truncated]');
      
      // Make the direct request to TradeMe
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json'
        },
        mode: 'cors'
      });
      
      console.log('TradeMe API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('TradeMe API error response:', errorText);
        throw new Error(`TradeMe API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('TradeMe API response data structure:', {
        hasData: !!data,
        hasList: !!data?.List,
        isListArray: Array.isArray(data?.List),
        listLength: data?.List?.length || 0,
        totalCount: data?.TotalCount,
        firstFewItems: data?.List?.slice(0, 2).map((item: any) => ({
          id: item.ListingId,
          title: item.Title,
          hasAttributes: !!item.Attributes
        }))
      });
      
      if (!data.List || !Array.isArray(data.List)) {
        console.error('Invalid response from TradeMe API:', data);
        throw new Error('Invalid response from TradeMe API');
      }
      
      console.log(`Found ${data.List.length} items in watchlist`);
      
      // Filter for property listings only
      const propertyListings = data.List.filter((item: any) => 
        item.CategoryPath && item.CategoryPath.includes('/property/')
      );
      
      console.log(`Found ${propertyListings.length} property listings in watchlist`);
      
      // Get the current user ID from Supabase or use the stored TradeMe user ID
      let userId;
      try {
        // Try to get the authenticated user ID from Supabase
        const { supabase } = await import('../../lib/supabase');
        const { data: authData } = await supabase.auth.getUser();
        userId = authData?.user?.id;
      } catch (error) {
        console.warn('Failed to get Supabase user ID:', error);
      }
      
      // If no Supabase user ID, try to get the stored TradeMe user ID
      if (!userId) {
        userId = getTradeMeUserId();
      }
      
      // Fall back to anonymous if no user ID is available
      if (!userId) {
        console.warn('No user ID found, using anonymous user ID');
        userId = 'anonymous';
      }
      
      console.log(`Using user ID: ${userId.substring(0, 5)}... for property mapping`);
      
      // Convert to our Property format
      const properties = propertyListings.map((item: any) => 
        mapWatchlistItemToProperty(item, userId)
      );
      
      // Store properties in Supabase
      console.log('Storing properties in Supabase:', properties);
      
      try {
        // Import supabase client
        const { supabase } = await import('../../lib/supabase');
        
        // Store each property in the database
        let successCount = 0;
        let failureCount = 0;
        const errors: Array<{ id: string; error: any }> = [];
        const MAX_RETRY_COUNT = 3;
        
        for (const property of properties) {
          let retryCount = 0;
          let success = false;
          
          // Try up to MAX_RETRY_COUNT times for each property
          while (retryCount < MAX_RETRY_COUNT && !success) {
            try {
              // Add logging for the property that's being processed
              console.log(`Processing property ${property.trademe_listing_id} (Attempt ${retryCount + 1}/${MAX_RETRY_COUNT})`, {
                title: property.title,
                price: property.price,
                userId: property.user_id
              });
              
              // Check if property already exists
              const { data: existingProperty, error: queryError } = await supabase
                .from('properties')
                .select('id')
                .eq('trademe_listing_id', property.trademe_listing_id)
                .single();
              
              if (queryError && queryError.code !== 'PGRST116') {
                // PGRST116 is the "not found" error code
                console.error(`Error checking for existing property ${property.trademe_listing_id}:`, queryError);
                throw queryError;
              }
              
              if (existingProperty) {
                // Update existing property
                console.log(`Updating existing property ${property.trademe_listing_id}`);
                const { error } = await supabase
                  .from('properties')
                  .update(property)
                  .eq('trademe_listing_id', property.trademe_listing_id);
                
                if (error) {
                  console.error(`Error updating property ${property.trademe_listing_id}:`, error);
                  throw error;
                } else {
                  successCount++;
                  success = true;
                  console.log(`Successfully updated property ${property.trademe_listing_id}`);
                }
              } else {
                // Insert new property
                console.log(`Inserting new property ${property.trademe_listing_id}`);
                const { error } = await supabase
                  .from('properties')
                  .insert(property);
                
                if (error) {
                  console.error(`Error inserting property ${property.trademe_listing_id}:`, error);
                  throw error;
                } else {
                  successCount++;
                  success = true;
                  console.log(`Successfully inserted property ${property.trademe_listing_id}`);
                }
              }
            } catch (error) {
              retryCount++;
              if (retryCount >= MAX_RETRY_COUNT) {
                console.error(`Failed to process property ${property.trademe_listing_id} after ${MAX_RETRY_COUNT} attempts:`, error);
                failureCount++;
                errors.push({ id: property.trademe_listing_id, error });
              } else {
                console.warn(`Retrying property ${property.trademe_listing_id} after error:`, error);
                // Wait a bit before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          }
        }
        
        console.log(`Sync results: ${successCount} properties stored successfully, ${failureCount} failures`);
        
        if (errors.length > 0) {
          console.error('Errors during sync:', errors);
        }
        
        return { 
          count: successCount,
          failures: failureCount,
          total: properties.length
        };
      } catch (dbError) {
        console.error('Error storing properties in database:', dbError);
        throw new Error(`Failed to store properties in database: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error syncing watchlist:', error);
      throw error;
    }
  }
};
