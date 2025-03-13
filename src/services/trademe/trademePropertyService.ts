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
  getStoredOAuthTokens
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
      // Get stored OAuth tokens
      const { token, tokenSecret, isSandbox } = getStoredOAuthTokens();
      
      if (!token || !tokenSecret) {
        throw new Error('Not authenticated with TradeMe. Please connect your account first.');
      }
      
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
      // Get stored OAuth tokens
      const { token, tokenSecret, isSandbox } = getStoredOAuthTokens();
      
      if (!token || !tokenSecret) {
        throw new Error('Not authenticated with TradeMe. Please connect your account first.');
      }
      
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
   * @returns Promise with count of synced properties
   */
  async syncWatchlistToDatabase(): Promise<{ count: number }> {
    try {
      console.log('Starting syncWatchlistToDatabase...');
      
      // Get stored OAuth tokens
      const { token, tokenSecret, isSandbox } = getStoredOAuthTokens();
      console.log('OAuth tokens retrieved:', {
        hasToken: !!token,
        hasTokenSecret: !!tokenSecret,
        tokenLength: token?.length || 0,
        tokenSecretLength: tokenSecret?.length || 0,
        isSandbox
      });
      
      if (!token || !tokenSecret) {
        console.error('Not authenticated with TradeMe. Missing tokens.');
        throw new Error('Not authenticated with TradeMe. Please connect your account first.');
      }
      
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
      
      // Convert to our Property format
      const userId = localStorage.getItem('user_id') || 'anonymous';
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
        
        for (const property of properties) {
          // Check if property already exists
          const { data: existingProperty } = await supabase
            .from('properties')
            .select('id')
            .eq('trademe_listing_id', property.trademe_listing_id)
            .single();
          
          if (existingProperty) {
            // Update existing property
            const { error } = await supabase
              .from('properties')
              .update(property)
              .eq('trademe_listing_id', property.trademe_listing_id);
            
            if (error) {
              console.error(`Error updating property ${property.id}:`, error);
            } else {
              successCount++;
            }
          } else {
            // Insert new property
            const { error } = await supabase
              .from('properties')
              .insert(property);
            
            if (error) {
              console.error(`Error inserting property ${property.id}:`, error);
            } else {
              successCount++;
            }
          }
        }
        
        console.log(`Successfully stored ${successCount} out of ${properties.length} properties`);
        
        return { count: successCount };
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
