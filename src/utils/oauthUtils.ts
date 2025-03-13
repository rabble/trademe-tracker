/**
 * OAuth utilities for TradeMe API integration
 * Handles signature generation and OAuth header creation
 */

/**
 * Generate OAuth 1.0a signature for TradeMe API
 * TradeMe uses PLAINTEXT signature method which is simpler than HMAC-SHA1
 * 
 * @param consumerSecret - The consumer secret for the application
 * @param tokenSecret - The token secret (optional)
 * @returns The OAuth signature
 */
export function generatePlaintextSignature(
  consumerSecret: string,
  tokenSecret: string = ''
): string {
  return `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
}

/**
 * Generate a complete OAuth 1.0a authorization header
 * 
 * @param method - HTTP method (GET, POST, etc.)
 * @param url - The full URL for the request
 * @param consumerKey - The consumer key for the application
 * @param consumerSecret - The consumer secret for the application
 * @param token - The OAuth token (optional)
 * @param tokenSecret - The OAuth token secret (optional)
 * @param additionalParams - Any additional OAuth parameters to include
 * @returns The complete Authorization header value
 */
export function generateOAuthHeader(
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
  
  // Create the parameter object with additional params if provided
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'PLAINTEXT',
    oauth_timestamp: timestamp,
    oauth_version: '1.0',
    ...additionalParams
  };
  
  if (token) {
    oauthParams.oauth_token = token;
  }
  
  // Create the signature
  const signature = generatePlaintextSignature(consumerSecret, tokenSecret);
  
  // Log the parameters for debugging (optional)
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
  
  // Create the Authorization header
  let authHeader = 'OAuth ';
  const headerParams = { ...oauthParams, oauth_signature: signature };
  
  authHeader += Object.entries(headerParams)
    .map(([key, value]) => `${key}="${encodeURIComponent(value)}"`)
    .join(', ');
  
  return authHeader;
}

/**
 * Generate a direct OAuth header for a specific request type
 * 
 * @param type - The type of OAuth request ('requestToken', 'accessToken', or 'api')
 * @param consumerKey - The consumer key for the application
 * @param consumerSecret - The consumer secret for the application
 * @param params - Additional parameters specific to the request type
 * @returns The complete Authorization header value
 */
export function generateDirectOAuthHeader(
  type: 'requestToken' | 'accessToken' | 'api',
  consumerKey: string,
  consumerSecret: string,
  params: {
    token?: string;
    tokenSecret?: string;
    callbackUrl?: string;
    verifier?: string;
  } = {}
): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
  
  // Base parameters for all request types
  const baseParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_signature_method: 'PLAINTEXT',
    oauth_timestamp: timestamp,
    oauth_nonce: nonce,
    oauth_version: '1.0'
  };
  
  // Add type-specific parameters
  if (type === 'requestToken' && params.callbackUrl) {
    baseParams.oauth_callback = params.callbackUrl;
  } else if (type === 'accessToken' && params.token && params.verifier) {
    baseParams.oauth_token = params.token;
    baseParams.oauth_verifier = params.verifier;
  } else if (type === 'api' && params.token) {
    baseParams.oauth_token = params.token;
  }
  
  // Create the signature
  const signature = `${consumerSecret}&${params.tokenSecret || ''}`;
  
  // Create the Authorization header
  let authHeader = 'OAuth ';
  const headerParams = { ...baseParams, oauth_signature: signature };
  
  authHeader += Object.entries(headerParams)
    .map(([key, value]) => `${key}="${encodeURIComponent(value)}"`)
    .join(', ');
  
  return authHeader;
}
