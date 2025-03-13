/**
 * TradeMe API configuration
 */

// TradeMe API base URLs
export const TRADEME_SANDBOX_API_URL = 'https://api.tmsandbox.co.nz';
export const TRADEME_API_URL = 'https://api.trademe.co.nz';

// TradeMe OAuth URLs
export const TRADEME_SANDBOX_OAUTH_URL = 'https://api.tmsandbox.co.nz/Oauth';
export const TRADEME_OAUTH_URL = 'https://api.trademe.co.nz/Oauth';

// TradeMe Authorization URLs
export const TRADEME_SANDBOX_AUTH_URL = 'https://www.tmsandbox.co.nz/Oauth/Authorize';
export const TRADEME_AUTH_URL = 'https://www.trademe.co.nz/Oauth/Authorize';

// TradeMe API credentials
export const CONSUMER_KEY = '05853D50C9B49D0BBF512C4F7C288098';
export const CONSUMER_SECRET = 'EE038BB9632A0BB6E1A6637555067E24';

/**
 * Get the appropriate API URLs based on environment
 * 
 * @param isSandbox - Whether to use sandbox environment
 * @returns Object containing API URLs
 */
export function getApiUrls(isSandbox: boolean = true): {
  apiUrl: string;
  oauthUrl: string;
  authUrl: string;
} {
  return {
    apiUrl: isSandbox ? TRADEME_SANDBOX_API_URL : TRADEME_API_URL,
    oauthUrl: isSandbox ? TRADEME_SANDBOX_OAUTH_URL : TRADEME_OAUTH_URL,
    authUrl: isSandbox ? TRADEME_SANDBOX_AUTH_URL : TRADEME_AUTH_URL
  };
}
