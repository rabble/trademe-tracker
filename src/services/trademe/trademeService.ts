import { Property } from '../../types';

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
  const signature = `${consumerSecret}&${tokenSecret}`;
  
  // Create the Authorization header
  let authHeader = 'OAuth ';
  const headerParams = { ...oauthParams, oauth_signature: signature };
  
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
      
      // Set the API environment
      setApiEnvironment(isSandbox);
      
      // Step 1: Get a request token
      const requestTokenUrl = `${OAUTH_URL}/RequestToken`;
      const callbackUrl = `${window.location.origin}/settings/trademe-callback`;
      
      console.log(`Request token URL: ${requestTokenUrl}`);
      console.log(`Callback URL: ${callbackUrl}`);
      
      // Define the scope for the token
      const scope = "MyTradeMeRead,MyTradeMeWrite,BiddingAndBuying";
      
      // Generate the OAuth header
      const authHeader = generateOAuthSignature(
        'POST', 
        requestTokenUrl, 
        CONSUMER_KEY, 
        CONSUMER_SECRET, 
        '', 
        '', 
        { 
          oauth_callback: callbackUrl,
          scope: scope
        }
      );
      
      console.log('Making request for OAuth token...');
      
      // Make the request to get a request token
      const response = await fetch(requestTokenUrl, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `oauth_callback=${encodeURIComponent(callbackUrl)}&scope=${encodeURIComponent(scope)}`
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OAuth request token error:', errorText);
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
      console.log(`Handling OAuth callback with token: ${oauthToken} and verifier: ${oauthVerifier}`);
      
      // Get the request token secret from storage
      const requestTokenSecret = localStorage.getItem('trademe_request_token_secret') || '';
      console.log(`Retrieved request token secret: ${requestTokenSecret ? 'Yes' : 'No'}`);
      
      // Step 3: Exchange request token for access token
      const accessTokenUrl = `${OAUTH_URL}/AccessToken`;
      console.log(`Access token URL: ${accessTokenUrl}`);
      
      const authHeader = generateOAuthSignature(
        'POST', 
        accessTokenUrl, 
        CONSUMER_KEY, 
        CONSUMER_SECRET, 
        oauthToken, 
        requestTokenSecret, 
        { oauth_verifier: oauthVerifier }
      );
      
      console.log('Making request for access token...');
      
      const response = await fetch(accessTokenUrl, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `oauth_verifier=${oauthVerifier}`
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
    return !!token && !!tokenSecret;
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
          'Accept': 'application/json',
          'Origin': window.location.origin
        }
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
    let propertyType: string | undefined = item.PropertyType;
    let landArea: string | undefined;
    let floorArea: string | undefined;
    
    if (item.LandArea) {
      landArea = `${item.LandArea} ${item.LandAreaUnit || 'm²'}`;
    }
    
    if (item.FloorArea) {
      floorArea = `${item.FloorArea} ${item.FloorAreaUnit || 'm²'}`;
    }
    
    // Extract attributes if available
    if (item.Attributes) {
      for (const attr of item.Attributes) {
        if (attr.Name === 'Bedrooms' && !bedrooms) {
          bedrooms = parseInt(attr.Value || '0', 10);
        } else if (attr.Name === 'Bathrooms' && !bathrooms) {
          bathrooms = parseInt(attr.Value || '0', 10);
        } else if (attr.Name === 'PropertyType' && !propertyType) {
          propertyType = attr.Value;
        } else if (attr.Name === 'LandArea' && !landArea) {
          landArea = attr.Value;
        } else if (attr.Name === 'FloorArea' && !floorArea) {
          floorArea = attr.Value;
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
