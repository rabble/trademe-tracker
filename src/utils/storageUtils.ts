/**
 * Storage utilities for managing OAuth tokens and other persistent data
 */

// OAuth token storage keys
const OAUTH_TOKEN_KEY = 'trademe_oauth_token';
const OAUTH_TOKEN_SECRET_KEY = 'trademe_oauth_token_secret';
const OAUTH_ENVIRONMENT_KEY = 'trademe_environment';
const REQUEST_TOKEN_SECRET_KEY = 'trademe_request_token_secret';
const OAUTH_RETURN_URL_KEY = 'trademe_oauth_return_url';

/**
 * OAuth token data structure
 */
export interface OAuthTokens {
  token: string;
  tokenSecret: string;
  isSandbox: boolean;
}

/**
 * Get stored OAuth tokens from localStorage or sessionStorage
 * 
 * @returns The stored OAuth tokens
 */
export function getStoredOAuthTokens(): OAuthTokens {
  // Try localStorage first, then fall back to sessionStorage
  let token = localStorage.getItem(OAUTH_TOKEN_KEY) || '';
  let tokenSecret = localStorage.getItem(OAUTH_TOKEN_SECRET_KEY) || '';
  let environment = localStorage.getItem(OAUTH_ENVIRONMENT_KEY) || 'sandbox';
  
  // If not found in localStorage, try sessionStorage
  if (!token || !tokenSecret) {
    token = sessionStorage.getItem(OAUTH_TOKEN_KEY) || '';
    tokenSecret = sessionStorage.getItem(OAUTH_TOKEN_SECRET_KEY) || '';
    environment = sessionStorage.getItem(OAUTH_ENVIRONMENT_KEY) || 'sandbox';
    
    // If found in sessionStorage but not localStorage, sync them
    if ((token || tokenSecret) && (!localStorage.getItem(OAUTH_TOKEN_KEY) || !localStorage.getItem(OAUTH_TOKEN_SECRET_KEY))) {
      console.log('Syncing OAuth tokens from sessionStorage to localStorage');
      if (token) localStorage.setItem(OAUTH_TOKEN_KEY, token);
      if (tokenSecret) localStorage.setItem(OAUTH_TOKEN_SECRET_KEY, tokenSecret);
      localStorage.setItem(OAUTH_ENVIRONMENT_KEY, environment);
    }
  }
  
  return {
    token,
    tokenSecret,
    isSandbox: environment === 'sandbox'
  };
}

/**
 * Store OAuth tokens in both localStorage and sessionStorage
 * 
 * @param tokens - The OAuth tokens to store
 */
export function storeOAuthTokens(tokens: OAuthTokens): void {
  localStorage.setItem(OAUTH_TOKEN_KEY, tokens.token);
  localStorage.setItem(OAUTH_TOKEN_SECRET_KEY, tokens.tokenSecret);
  localStorage.setItem(OAUTH_ENVIRONMENT_KEY, tokens.isSandbox ? 'sandbox' : 'production');
  
  sessionStorage.setItem(OAUTH_TOKEN_KEY, tokens.token);
  sessionStorage.setItem(OAUTH_TOKEN_SECRET_KEY, tokens.tokenSecret);
  sessionStorage.setItem(OAUTH_ENVIRONMENT_KEY, tokens.isSandbox ? 'sandbox' : 'production');
}

/**
 * Clear stored OAuth tokens from both localStorage and sessionStorage
 */
export function clearOAuthTokens(): void {
  localStorage.removeItem(OAUTH_TOKEN_KEY);
  localStorage.removeItem(OAUTH_TOKEN_SECRET_KEY);
  sessionStorage.removeItem(OAUTH_TOKEN_KEY);
  sessionStorage.removeItem(OAUTH_TOKEN_SECRET_KEY);
}

/**
 * Store request token secret temporarily
 * 
 * @param secret - The request token secret to store
 */
export function storeRequestTokenSecret(secret: string): void {
  localStorage.setItem(REQUEST_TOKEN_SECRET_KEY, secret);
  sessionStorage.setItem(REQUEST_TOKEN_SECRET_KEY, secret);
}

/**
 * Get stored request token secret
 * 
 * @returns The stored request token secret
 */
export function getRequestTokenSecret(): string {
  let secret = localStorage.getItem(REQUEST_TOKEN_SECRET_KEY) || '';
  
  if (!secret) {
    secret = sessionStorage.getItem(REQUEST_TOKEN_SECRET_KEY) || '';
    if (secret) {
      localStorage.setItem(REQUEST_TOKEN_SECRET_KEY, secret);
    }
  }
  
  return secret;
}

/**
 * Clear request token secret
 */
export function clearRequestTokenSecret(): void {
  localStorage.removeItem(REQUEST_TOKEN_SECRET_KEY);
  sessionStorage.removeItem(REQUEST_TOKEN_SECRET_KEY);
}

/**
 * Store return URL for OAuth flow
 * 
 * @param url - The URL to return to after OAuth
 */
export function storeOAuthReturnUrl(url: string): void {
  localStorage.setItem(OAUTH_RETURN_URL_KEY, url);
}

/**
 * Get stored OAuth return URL
 * 
 * @returns The stored return URL
 */
export function getOAuthReturnUrl(): string | null {
  return localStorage.getItem(OAUTH_RETURN_URL_KEY);
}

/**
 * Clear OAuth return URL
 */
export function clearOAuthReturnUrl(): void {
  localStorage.removeItem(OAUTH_RETURN_URL_KEY);
}
