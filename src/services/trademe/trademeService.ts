import { Property } from '../../types';

/**
 * Helper function to parse numeric values from strings
 * @param value String value that may contain a number
 * @returns Parsed number or undefined
 */
function parseNumericValue(value: string | undefined): number | undefined {
  if (!value) return undefined;
  
  // Extract numeric part using regex
  const numericMatch = value.match(/(\d+(\.\d+)?)/);
  if (numericMatch && numericMatch[1]) {
    return parseFloat(numericMatch[1]);
  }
  return undefined;
}

/**
 * Maps TradeMe property type strings to our application's property types
 * @param type Property type string from TradeMe
 * @returns Mapped property type or undefined
 */
function mapToPropertyType(
  type: string | undefined
): 'house' | 'apartment' | 'townhouse' | 'section' | 'other' | undefined {
  if (!type) return undefined;
  
  const lowerType = type.toLowerCase();
  
  if (lowerType.includes('house')) return 'house';
  if (lowerType.includes('apartment')) return 'apartment';
  if (lowerType.includes('townhouse') || lowerType.includes('town house')) return 'townhouse';
  if (lowerType.includes('section') || lowerType.includes('land')) return 'section';
  
  return 'other';
}

// TradeMe API base URL for sandbox
const TRADEME_SANDBOX_API_URL = 'https://api.tmsandbox.co.nz';
// TradeMe API base URL for production
const TRADEME_API_URL = 'https://api.trademe.co.nz';

// TradeMe OAuth URLs
const TRADEME_SANDBOX_OAUTH_URL = 'https://api.tmsandbox.co.nz/Oauth';
const TRADEME_OAUTH_URL = 'https://api.trademe.co.nz/Oauth';

// TradeMe Authorization URLs
const TRADEME_SANDBOX_AUTH_URL = 'https://www.tmsandbox.co.nz/Oauth/Authorize';
const TRADEME_AUTH_URL = 'https://www.trademe.co.nz/Oauth/Authorize';

// Use sandbox for development by default
let API_URL = TRADEME_SANDBOX_API_URL;
let OAUTH_URL = TRADEME_SANDBOX_OAUTH_URL;

// TradeMe API credentials
const CONSUMER_KEY = '05853D50C9B49D0BBF512C4F7C288098';
const CONSUMER_SECRET = 'EE038BB9632A0BB6E1A6637555067E24';

// OAuth token storage keys
const OAUTH_TOKEN_KEY = 'trademe_oauth_token';
const OAUTH_TOKEN_SECRET_KEY = 'trademe_oauth_token_secret';
const OAUTH_ENVIRONMENT_KEY = 'trademe_environment';

/**
 * Get stored OAuth tokens
 */
function getStoredOAuthTokens(): { token: string; tokenSecret: string; isSandbox: boolean } {
  const token = localStorage.getItem(OAUTH_TOKEN_KEY) || '';
  const tokenSecret = localStorage.getItem(OAUTH_TOKEN_SECRET_KEY) || '';
  const environment = localStorage.getItem(OAUTH_ENVIRONMENT_KEY) || 'sandbox';
  
  return {
    token,
    tokenSecret,
    isSandbox: environment === 'sandbox'
  };
}

/**
 * Set the API URL based on environment
 */
function setApiEnvironment(isSandbox: boolean): void {
  API_URL = isSandbox ? TRADEME_SANDBOX_API_URL : TRADEME_API_URL;
  OAUTH_URL = isSandbox ? TRADEME_SANDBOX_OAUTH_URL : TRADEME_OAUTH_URL;
  localStorage.setItem(OAUTH_ENVIRONMENT_KEY, isSandbox ? 'sandbox' : 'production');
}

/**
 * Generate OAuth 1.0a signature for TradeMe API
 * TradeMe uses PLAINTEXT signature method which is simpler than HMAC-SHA1
 */
function generateOAuthSignature(
  method: string,
  url: string,
  consumerKey: string,
  consumerSecret: string,
  token: string = '',
  tokenSecret: string = '',
  additionalParams: Record<string, string> = {}
): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
  
  // Create the parameter string with additional params if provided
  let oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'PLAINTEXT',
    oauth_timestamp: timestamp,
    oauth_version: '1.0'
  };
  
  if (token) {
    oauthParams.oauth_token = token;
  }
  
  // Add additional params
  Object.assign(oauthParams, additionalParams);
  
  // Create the signature (PLAINTEXT method)
  const signature = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  
  // Create the Authorization header
  let authHeader = 'OAuth ';
  const headerParams = { ...oauthParams, oauth_signature: signature };
  
  // Log the parameters for debugging
  console.log('OAuth parameters:', {
    method,
    url,
    timestamp,
    nonce: nonce.substring(0, 5) + '...',
    signatureMethod: 'PLAINTEXT',
    hasToken: !!token,
    hasTokenSecret: !!tokenSecret,
    additionalParamKeys: Object.keys(additionalParams)
  });
  
  authHeader += Object.entries(headerParams)
    .map(([key, value]) => `${key}="${encodeURIComponent(value)}"`)
    .join(', ');
  
  return authHeader;
}

export const TradeMeService = {
  /**
   * Get OAuth request URL for TradeMe authentication
   */
  async getOAuthRequestUrl(isSandbox: boolean = true): Promise<string> {
    try {
      console.log(`Starting OAuth flow with ${isSandbox ? 'sandbox' : 'production'} environment`);
      console.log('Network status check:', {
        online: navigator.onLine,
        userAgent: navigator.userAgent,
        protocol: window.location.protocol,
        host: window.location.host
      });
      
      // Set the API environment
      setApiEnvironment(isSandbox);
      
      // Step 1: Get a request token
      const requestTokenUrl = `${OAUTH_URL}/RequestToken`;
      
      // Force HTTPS for Cloudflare deployment
      // This ensures the callback URL is always HTTPS which TradeMe requires
      const host = window.location.host;
      const protocol = window.location.protocol;
      // Use the current protocol if it's already HTTPS, otherwise force HTTPS
      const callbackUrl = `${protocol === 'https:' ? protocol : 'https:'}://${host}/settings/trademe-callback`;
      
      console.log(`Request token URL: ${requestTokenUrl}`);
      console.log(`Callback URL: ${callbackUrl}`);
      
      // Define the scope for the token
      const scope = "MyTradeMeRead";
      
      // Create the OAuth parameters
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const nonce = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
      
      // Create the signature (PLAINTEXT method)
      const signature = `${encodeURIComponent(CONSUMER_SECRET)}&`;
      
      // Create the Authorization header directly
      const authHeader = `OAuth oauth_consumer_key="${encodeURIComponent(CONSUMER_KEY)}", oauth_signature_method="PLAINTEXT", oauth_timestamp="${timestamp}", oauth_nonce="${nonce}", oauth_version="1.0", oauth_callback="${encodeURIComponent(callbackUrl)}", oauth_signature="${signature}"`;
      
      console.log('Making request for OAuth token...');
      
      console.log('Making OAuth request with auth header:', authHeader);
      console.log('OAuth parameters:', {
        consumerKey: CONSUMER_KEY,
        hasConsumerSecret: !!CONSUMER_SECRET,
        timestamp,
        nonce: nonce.substring(0, 5) + '...',
        callbackUrl,
        scope
      });
      
      // Make the request to get a request token
      const response = await fetch(requestTokenUrl, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `scope=${encodeURIComponent(scope)}`,
        mode: 'cors'
      });
      
      console.log('OAuth request response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OAuth request token error:', errorText);
        console.error('Response headers:', Object.fromEntries([...response.headers.entries()]));
        throw new Error(`Failed to get request token: ${response.status} ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      const params = new URLSearchParams(responseText);
      
      const requestToken = params.get('oauth_token') || '';
      const requestTokenSecret = params.get('oauth_token_secret') || '';
      
      console.log(`Got request token: ${requestToken}`);
      
      if (!requestToken) {
        throw new Error('No request token received from TradeMe');
      }
      
      // Store the request token secret temporarily
      localStorage.setItem('trademe_request_token_secret', requestTokenSecret);
      
      // Step 2: Redirect user to authorization page
      const authUrl = isSandbox 
        ? `${TRADEME_SANDBOX_AUTH_URL}?oauth_token=${requestToken}`
        : `${TRADEME_AUTH_URL}?oauth_token=${requestToken}`;
        
      console.log(`Authorization URL: ${authUrl}`);
      
      return authUrl;
    } catch (error) {
      console.error('Error getting OAuth request URL:', error);
      throw error;
    }
  },
  
  /**
   * Handle OAuth callback from TradeMe
   */
  async handleOAuthCallback(oauthToken: string, oauthVerifier: string): Promise<boolean> {
    try {
      console.log(`Handling OAuth callback with token: ${oauthToken.substring(0, 5)}... and verifier: ${oauthVerifier.substring(0, 5)}...`);
      console.log('Local storage keys before callback:', Object.keys(localStorage).filter(key => key.includes('trademe')));
      
      // Get the request token secret from storage
      const requestTokenSecret = localStorage.getItem('trademe_request_token_secret') || '';
      console.log(`Retrieved request token secret: ${requestTokenSecret ? 'Yes' : 'No'}`);
      
      // Step 3: Exchange request token for access token
      const accessTokenUrl = `${OAUTH_URL}/AccessToken`;
      console.log(`Access token URL: ${accessTokenUrl}`);
      
      // Create the OAuth parameters
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const nonce = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
      
      // Create the signature (PLAINTEXT method)
      const signature = `${encodeURIComponent(CONSUMER_SECRET)}&${encodeURIComponent(requestTokenSecret)}`;
      
      // Create the Authorization header directly
      const authHeader = `OAuth oauth_consumer_key="${encodeURIComponent(CONSUMER_KEY)}", oauth_token="${encodeURIComponent(oauthToken)}", oauth_signature_method="PLAINTEXT", oauth_timestamp="${timestamp}", oauth_nonce="${nonce}", oauth_version="1.0", oauth_verifier="${encodeURIComponent(oauthVerifier)}", oauth_signature="${signature}"`;
      
      console.log('Making request for access token with auth header:', authHeader.substring(0, 50) + '...');
      
      const response = await fetch(accessTokenUrl, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        mode: 'cors'
      });
      
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OAuth access token error:', errorText);
        throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      const params = new URLSearchParams(responseText);
      
      const accessToken = params.get('oauth_token') || '';
      const accessTokenSecret = params.get('oauth_token_secret') || '';
      
      console.log(`Got access token: ${accessToken ? 'Yes' : 'No'}`);
      
      if (!accessToken || !accessTokenSecret) {
        throw new Error('No access token received from TradeMe');
      }
      
      // Store the access tokens
      localStorage.setItem(OAUTH_TOKEN_KEY, accessToken);
      localStorage.setItem(OAUTH_TOKEN_SECRET_KEY, accessTokenSecret);
      
      // Clean up the request token secret
      localStorage.removeItem('trademe_request_token_secret');
      
      console.log('OAuth tokens stored successfully:', {
        tokenLength: accessToken.length,
        tokenSecretLength: accessTokenSecret.length
      });
      console.log('Local storage keys after callback:', Object.keys(localStorage).filter(key => key.includes('trademe')));
      
      return true;
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      throw error;
    }
  },
  
  /**
   * Disconnect from TradeMe OAuth
   */
  async disconnectOAuth(): Promise<void> {
    // Clear the stored tokens
    localStorage.removeItem(OAUTH_TOKEN_KEY);
    localStorage.removeItem(OAUTH_TOKEN_SECRET_KEY);
  },
  
  /**
   * Check if user is connected to TradeMe
   */
  isConnectedToTradeMe(): boolean {
    const { token, tokenSecret } = getStoredOAuthTokens();
    console.log('TradeMe connection status:', {
      hasToken: !!token,
      hasTokenSecret: !!tokenSecret,
      tokenLength: token?.length || 0,
      tokenSecretLength: tokenSecret?.length || 0
    });
    return !!token && !!tokenSecret;
  },
  
  /**
   * Get debug information about TradeMe connection
   */
  getConnectionDebugInfo(): Record<string, any> {
    const { token, tokenSecret, isSandbox } = getStoredOAuthTokens();
    return {
      isConnected: !!token && !!tokenSecret,
      environment: isSandbox ? 'sandbox' : 'production',
      tokenExists: !!token,
      tokenSecretExists: !!tokenSecret,
      tokenLength: token?.length || 0,
      tokenSecretLength: tokenSecret?.length || 0,
      storedKeys: Object.keys(localStorage).filter(key => key.includes('trademe')),
      apiUrl: isSandbox ? TRADEME_SANDBOX_API_URL : TRADEME_API_URL,
      consumerKey: CONSUMER_KEY,
      consumerSecretExists: !!CONSUMER_SECRET,
      oauthUrl: isSandbox ? TRADEME_SANDBOX_OAUTH_URL : TRADEME_OAUTH_URL,
      authUrl: isSandbox ? TRADEME_SANDBOX_AUTH_URL : TRADEME_AUTH_URL,
      localStorageData: Object.fromEntries(
        Object.keys(localStorage)
          .filter(key => key.includes('trademe'))
          .map(key => [key, localStorage.getItem(key)?.substring(0, 10) + '...'])
      )
    };
  },
  
  /**
   * Fetch watchlist from TradeMe and store in database
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
      
      // Set the API environment
      setApiEnvironment(isSandbox);
      
      console.log(`Fetching watchlist from ${isSandbox ? 'sandbox' : 'production'} environment`);
      
      // Fetch watchlist from TradeMe
      const url = `${API_URL}/v1/MyTradeMe/Watchlist/All.json?category=5&rows=100`;
      
      console.log(`Fetching watchlist from: ${url}`);
      
      // Create the OAuth parameters
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const nonce = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
      
      // Create the signature (PLAINTEXT method)
      const signature = `${encodeURIComponent(CONSUMER_SECRET)}&${encodeURIComponent(tokenSecret)}`;
      
      // Create the Authorization header directly
      const authHeader = `OAuth oauth_consumer_key="${encodeURIComponent(CONSUMER_KEY)}", oauth_token="${encodeURIComponent(token)}", oauth_signature_method="PLAINTEXT", oauth_timestamp="${timestamp}", oauth_nonce="${nonce}", oauth_version="1.0", oauth_signature="${signature}"`;
      
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
      const properties = propertyListings.map((item: any) => {
        // Extract property ID from the listing ID
        const id = item.ListingId.toString();
        
        // Determine property status based on attributes or other fields
        let status: 'active' | 'under_offer' | 'sold' | 'archived' = 'active';
        
        // Extract price
        let price = 0;
        if (item.StartPrice) {
          price = item.StartPrice;
        }
        
        // Extract bedrooms and bathrooms
        let bedrooms: number | undefined;
        let bathrooms: number | undefined;
        let propertyType: 'house' | 'apartment' | 'townhouse' | 'section' | 'other' | undefined;
        let landArea: number | undefined;
        let floorArea: number | undefined;
        
        // Extract attributes if available
        if (item.Attributes) {
          for (const attr of item.Attributes) {
            if (attr.Name === 'Bedrooms') {
              bedrooms = parseInt(attr.Value || '0', 10);
            } else if (attr.Name === 'Bathrooms') {
              bathrooms = parseInt(attr.Value || '0', 10);
            } else if (attr.Name === 'PropertyType') {
              propertyType = mapToPropertyType(attr.Value);
            } else if (attr.Name === 'LandArea') {
              landArea = parseNumericValue(attr.Value);
            } else if (attr.Name === 'FloorArea') {
              floorArea = parseNumericValue(attr.Value);
            }
          }
        }
        
        return {
          title: item.Title || 'Untitled Property',
          address: item.Suburb || 'Unknown Location',
          price,
          bedrooms,
          bathrooms,
          property_type: propertyType,
          land_area: landArea,
          floor_area: floorArea,
          status,
          days_on_market: 0, // Default value
          created_at: item.StartDate || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          image_urls: item.PictureHref ? [item.PictureHref] : [],
          trademe_listing_id: id,
          url: `https://www.trademe.co.nz/a/property/residential/sale/listing/${id}`,
          source: 'trademe',
          is_favorite: true,
          user_id: localStorage.getItem('user_id') || 'anonymous' // Associate with current user
        };
      });
      
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
  },
  /**
   * Test the OAuth connection
   */
  async testOAuthConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      // Get stored OAuth tokens
      const { token, tokenSecret, isSandbox } = getStoredOAuthTokens();
      
      if (!token || !tokenSecret) {
        return { 
          success: false, 
          message: 'Not authenticated with TradeMe. Missing tokens.' 
        };
      }
      
      // Set the API environment
      setApiEnvironment(isSandbox);
      
      console.log(`Testing OAuth connection with ${isSandbox ? 'sandbox' : 'production'} environment`);
      
      // Use a simple endpoint to test the connection
      const url = `${API_URL}/v1/MyTradeMe/Summary.json`;
      
      console.log(`Testing connection to: ${url}`);
      
      // Create the OAuth parameters
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const nonce = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
      
      // Create the signature (PLAINTEXT method)
      const signature = `${encodeURIComponent(CONSUMER_SECRET)}&${encodeURIComponent(tokenSecret)}`;
      
      // Create the Authorization header directly
      const authHeader = `OAuth oauth_consumer_key="${encodeURIComponent(CONSUMER_KEY)}", oauth_token="${encodeURIComponent(token)}", oauth_signature_method="PLAINTEXT", oauth_timestamp="${timestamp}", oauth_nonce="${nonce}", oauth_version="1.0", oauth_signature="${signature}"`;
      
      console.log('Making test request with auth header:', authHeader.substring(0, 50) + '...');
      
      // Make the direct request to TradeMe
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json'
        },
        mode: 'cors'
      });
      
      console.log('TradeMe API test response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('TradeMe API test error response:', errorText);
        return { 
          success: false, 
          message: `API request failed with status ${response.status}: ${response.statusText}`,
          details: { errorText, status: response.status }
        };
      }
      
      const data = await response.json();
      console.log('TradeMe API test response data:', data);
      
      return { 
        success: true, 
        message: 'Successfully connected to TradeMe API',
        details: data
      };
    } catch (error) {
      console.error('Error testing OAuth connection:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
        details: { error }
      };
    }
  },
  
  /**
   * Search for properties on TradeMe
   */
  async searchProperties(searchParams: Record<string, string> = {}): Promise<Property[]> {
    try {
      // Get stored OAuth tokens
      const { token, tokenSecret, isSandbox } = getStoredOAuthTokens();
      
      if (!token || !tokenSecret) {
        throw new Error('Not authenticated with TradeMe. Please connect your account first.');
      }
      
      // Set the API environment
      setApiEnvironment(isSandbox);
      
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
      
      const url = `${API_URL}/v1/Search/Property.json?${queryString}`;
      
      console.log(`Searching properties at: ${url}`);
      
      // Generate the OAuth header
      const authHeader = generateOAuthSignature(
        'GET', 
        url, 
        CONSUMER_KEY, 
        CONSUMER_SECRET, 
        token, 
        tokenSecret
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
      return this.convertSearchResultsToProperties(data);
    } catch (error) {
      console.error('Error searching properties:', error);
      throw error;
    }
  },
  
  /**
   * Get property details from TradeMe
   */
  async getPropertyDetails(propertyId: string): Promise<Property> {
    try {
      // Get stored OAuth tokens
      const { token, tokenSecret, isSandbox } = getStoredOAuthTokens();
      
      if (!token || !tokenSecret) {
        throw new Error('Not authenticated with TradeMe. Please connect your account first.');
      }
      
      // Set the API environment
      setApiEnvironment(isSandbox);
      
      console.log(`Fetching property details for ${propertyId} with ${isSandbox ? 'sandbox' : 'production'} environment`);
      
      const url = `${API_URL}/v1/Listings/${propertyId}.json`;
      
      console.log(`Fetching property details from: ${url}`);
      
      // Generate the OAuth header
      const authHeader = generateOAuthSignature(
        'GET', 
        url, 
        CONSUMER_KEY, 
        CONSUMER_SECRET, 
        token, 
        tokenSecret
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
      return this.mapListingToProperty(data);
    } catch (error) {
      console.error(`Error fetching property details for ${propertyId}:`, error);
      throw error;
    }
  },
  
  /**
   * Convert TradeMe search results to our Property format
   */
  convertSearchResultsToProperties(searchData: any): Property[] {
    if (!searchData.List || searchData.List.length === 0) {
      return [];
    }
    
    return searchData.List
      .filter((item: any) => item)
      .map((item: any) => this.mapListingToProperty(item));
  },
  
  /**
   * Map a TradeMe listing to our Property format
   */
  mapListingToProperty(item: any): Property {
    // Extract property ID from the listing ID
    const id = item.ListingId?.toString() || '';
    
    // Determine property status based on attributes or other fields
    let status: 'active' | 'under_offer' | 'sold' | 'archived' = 'active';
    
    // Extract price
    let price = 0;
    if (item.PriceDisplay) {
      // Try to extract numeric value from price display
      const priceMatch = item.PriceDisplay.match(/\$([0-9,]+)/);
      if (priceMatch && priceMatch[1]) {
        price = parseInt(priceMatch[1].replace(/,/g, ''), 10);
      }
    } else if (item.StartPrice) {
      price = item.StartPrice;
    }
    
    // Extract bedrooms and bathrooms
    let bedrooms: number | undefined = item.Bedrooms;
    let bathrooms: number | undefined = item.Bathrooms;
    let propertyType: 'house' | 'apartment' | 'townhouse' | 'section' | 'other' | undefined = 
      mapToPropertyType(item.PropertyType);
    let landArea: number | undefined;
    let floorArea: number | undefined;
    
    if (item.LandArea) {
      landArea = typeof item.LandArea === 'number' ? item.LandArea : parseNumericValue(item.LandArea);
    }
    
    if (item.FloorArea) {
      floorArea = typeof item.FloorArea === 'number' ? item.FloorArea : parseNumericValue(item.FloorArea);
    }
    
    // Extract attributes if available
    if (item.Attributes) {
      for (const attr of item.Attributes) {
        if (attr.Name === 'Bedrooms' && !bedrooms) {
          bedrooms = parseInt(attr.Value || '0', 10);
        } else if (attr.Name === 'Bathrooms' && !bathrooms) {
          bathrooms = parseInt(attr.Value || '0', 10);
        } else if (attr.Name === 'PropertyType' && !propertyType) {
          propertyType = mapToPropertyType(attr.Value);
        } else if (attr.Name === 'LandArea' && !landArea) {
          landArea = parseNumericValue(attr.Value);
        } else if (attr.Name === 'FloorArea' && !floorArea) {
          floorArea = parseNumericValue(attr.Value);
        }
      }
    }
    
    // Calculate days on market if possible
    let daysOnMarket = 0;
    if (item.StartDate) {
      const startDate = new Date(item.StartDate);
      const now = new Date();
      daysOnMarket = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    }
    
    return {
      id,
      title: item.Title || 'Untitled Property',
      address: item.Address || item.Suburb || 'Unknown Location',
      price,
      bedrooms,
      bathrooms,
      property_type: propertyType,
      land_area: landArea,
      floor_area: floorArea,
      status,
      days_on_market: daysOnMarket,
      created_at: item.StartDate || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      image_urls: item.PictureHref ? [item.PictureHref] : [],
      trademe_listing_id: id,
      url: `https://www.trademe.co.nz/a/property/residential/sale/listing/${id}`
    };
  }
};
