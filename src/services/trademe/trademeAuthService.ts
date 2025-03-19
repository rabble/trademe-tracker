/**
 * TradeMe Authentication Service
 * Handles OAuth authentication with TradeMe API
 */
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
  storeOAuthTokens,
  clearOAuthTokens,
  storeRequestTokenSecret,
  getRequestTokenSecret,
  clearRequestTokenSecret,
  storeOAuthReturnUrl,
  getOAuthReturnUrl,
  clearOAuthReturnUrl
} from '../../utils/storageUtils';

/**
 * TradeMe Authentication Service
 */
export const TradeMeAuthService = {
  /**
   * Check if user is connected to TradeMe
   * 
   * @returns Boolean indicating if user is connected
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
   * Get OAuth request URL for TradeMe authentication
   * 
   * @param isSandbox - Whether to use sandbox environment
   * @returns Object containing authorization URL
   */
  async getOAuthRequestUrl(isSandbox: boolean = true): Promise<{
    authUrl: string;
  }> {
    try {
      console.log(`Starting OAuth flow with ${isSandbox ? 'sandbox' : 'production'} environment`);
      console.log('Network status check:', {
        online: navigator.onLine,
        userAgent: navigator.userAgent,
        protocol: window.location.protocol,
        host: window.location.host
      });
      
      // Get the appropriate API URLs
      const { oauthUrl, authUrl } = getApiUrls(isSandbox);
      
      // Step 1: Get a request token
      const requestTokenUrl = `${oauthUrl}/RequestToken`;
      
      // Use a callback URL that will handle the OAuth response
      const host = window.location.host;
      const callbackUrl = `https://${host}/settings/trademe-callback`;
      
      console.log(`Using callback URL: ${callbackUrl}`);
      console.log(`Request token URL: ${requestTokenUrl}`);
      
      // Define the scope for the token
      const scope = "MyTradeMeRead";
      
      // Create the OAuth header
      const authHeader = generateDirectOAuthHeader(
        'requestToken',
        CONSUMER_KEY,
        CONSUMER_SECRET,
        { callbackUrl }
      );
      
      console.log('Making request for OAuth token...');
      
      // Make the request to get a request token
      const response = await fetch(requestTokenUrl, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `scope=${encodeURIComponent(scope)}`,
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log('OAuth request response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OAuth request token error:', errorText);
        console.error('Response headers:', Object.fromEntries([...response.headers.entries()]));
        throw new Error(`Failed to get request token: ${response.status} ${response.statusText} - ${errorText}`);
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
      storeRequestTokenSecret(requestTokenSecret);
      
      console.log(`Stored request token secret (${requestTokenSecret.length} chars)`);
      
      // Step 2: Redirect user to authorization page
      const authorizationUrl = `${authUrl}?oauth_token=${requestToken}`;
        
      console.log(`Authorization URL: ${authorizationUrl}`);
      
      // Store the current page URL so we can return to it after OAuth
      const returnUrl = window.location.href;
      storeOAuthReturnUrl(returnUrl);
      console.log(`Stored return URL: ${returnUrl} - will redirect back here after OAuth`);
      
      return {
        authUrl: authorizationUrl
      };
    } catch (error) {
      console.error('Error getting OAuth request URL:', error);
      throw error;
    }
  },
  
  /**
   * Handle OAuth callback from TradeMe
   * 
   * @param oauthToken - OAuth token from callback
   * @param oauthVerifier - OAuth verifier from callback
   * @returns Boolean indicating success
   */
  async handleOAuthCallback(oauthToken: string, oauthVerifier: string): Promise<boolean> {
    try {
      console.log(`Handling OAuth callback with token: ${oauthToken.substring(0, 5)}... and verifier: ${oauthVerifier.substring(0, 5)}...`);
      
      // Get the request token secret from storage
      const requestTokenSecret = getRequestTokenSecret();
      console.log(`Retrieved request token secret: ${requestTokenSecret ? 'Yes' : 'No'}, length: ${requestTokenSecret.length}`);
      
      if (!requestTokenSecret) {
        throw new Error('Request token secret not found. Please try the OAuth flow again.');
      }
      
      // Get the appropriate API URLs (use the environment from storage)
      const { isSandbox } = getStoredOAuthTokens();
      const { oauthUrl } = getApiUrls(isSandbox);
      
      // Step 3: Exchange request token for access token
      const accessTokenUrl = `${oauthUrl}/AccessToken`;
      console.log(`Access token URL: ${accessTokenUrl}`);
      
      // Create the OAuth header
      const authHeader = generateDirectOAuthHeader(
        'accessToken',
        CONSUMER_KEY,
        CONSUMER_SECRET,
        {
          token: oauthToken,
          tokenSecret: requestTokenSecret,
          verifier: oauthVerifier
        }
      );
      
      console.log('Making request for access token with auth header:', authHeader.substring(0, 50) + '...');
      
      const response = await fetch(accessTokenUrl, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        mode: 'cors',
        credentials: 'omit'
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
      storeOAuthTokens({
        token: accessToken,
        tokenSecret: accessTokenSecret,
        isSandbox
      });
      
      // Clean up the request token secret
      clearRequestTokenSecret();
      
      console.log('OAuth tokens stored successfully:', {
        tokenLength: accessToken.length,
        tokenSecretLength: accessTokenSecret.length
      });
      
      // Get the return URL if it exists
      const returnUrl = getOAuthReturnUrl();
      if (returnUrl) {
        console.log(`Redirecting back to: ${returnUrl}`);
        // Clean up the return URL
        clearOAuthReturnUrl();
        // Redirect back to the original page
        window.location.assign(returnUrl);
      }
      
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
    clearOAuthTokens();
    console.log('Cleared OAuth tokens');
  },
  
  /**
   * Handle OAuth completion
   * This should be called when the user is redirected back from TradeMe
   */
  handleOAuthCompletion(): void {
    // Get the stored return URL
    const returnUrl = getOAuthReturnUrl();
    if (returnUrl) {
      console.log(`Redirecting back to: ${returnUrl}`);
      // Clean up the return URL
      clearOAuthReturnUrl();
      // Redirect back to the original page
      window.location.assign(returnUrl);
    } else {
      // If no return URL is found, redirect to the home page
      console.log('No return URL found, redirecting to home page');
      window.location.assign('/');
    }
  },
  
  /**
   * Test if the callback URL is valid
   * 
   * @returns Object with validation results
   */
  testCallbackUrl(): { isValid: boolean; url: string; message: string } {
    try {
      const host = window.location.host;
      const callbackUrl = `https://${host}/settings/trademe-callback`;
      
      // Check if the URL is valid
      const url = new URL(callbackUrl);
      
      // Check if the protocol is https
      if (url.protocol !== 'https:') {
        return {
          isValid: false,
          url: callbackUrl,
          message: 'Callback URL must use HTTPS protocol'
        };
      }
      
      // Check if the URL has a valid host
      if (!url.host || url.host.length < 3) {
        return {
          isValid: false,
          url: callbackUrl,
          message: 'Callback URL has an invalid host'
        };
      }
      
      return {
        isValid: true,
        url: callbackUrl,
        message: 'Callback URL is valid'
      };
    } catch (error) {
      return {
        isValid: false,
        url: '',
        message: `Error creating callback URL: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  },
  
  /**
   * Test the OAuth connection
   * 
   * @returns Object with test results
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
      
      // Get the appropriate API URLs
      const { apiUrl } = getApiUrls(isSandbox);
      
      console.log(`Testing OAuth connection with ${isSandbox ? 'sandbox' : 'production'} environment`);
      
      // Use a simple endpoint to test the connection
      const url = `${apiUrl}/v1/MyTradeMe/Summary.json`;
      
      console.log(`Testing connection to: ${url}`);
      
      // Create the OAuth header
      const authHeader = generateDirectOAuthHeader(
        'api',
        CONSUMER_KEY,
        CONSUMER_SECRET,
        { token, tokenSecret }
      );
      
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
   * Get debug information about TradeMe connection
   * 
   * @returns Object with debug information
   */
  getConnectionDebugInfo(): Record<string, any> {
    const { token, tokenSecret, isSandbox } = getStoredOAuthTokens();
    const { apiUrl, oauthUrl, authUrl } = getApiUrls(isSandbox);
    
    return {
      isConnected: !!token && !!tokenSecret,
      environment: isSandbox ? 'sandbox' : 'production',
      tokenExists: !!token,
      tokenSecretExists: !!tokenSecret,
      tokenLength: token?.length || 0,
      tokenSecretLength: tokenSecret?.length || 0,
      storedKeys: Object.keys(localStorage).filter(key => key.includes('trademe')),
      apiUrl,
      consumerKey: CONSUMER_KEY,
      consumerSecretExists: !!CONSUMER_SECRET,
      oauthUrl,
      authUrl,
      localStorageData: Object.fromEntries(
        Object.keys(localStorage)
          .filter(key => key.includes('trademe'))
          .map(key => [key, localStorage.getItem(key)?.substring(0, 10) + '...'])
      )
    };
  }
};
