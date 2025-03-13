/**
 * TradeMe Service
 * Main entry point for TradeMe API integration
 */
import { TradeMeAuthService } from './trademeAuthService';
import { TradeMePropertyService } from './trademePropertyService';

/**
 * Combined TradeMe service that exposes both authentication and property operations
 */
export const TradeMeService = {
  // Authentication methods
  getOAuthRequestUrl: TradeMeAuthService.getOAuthRequestUrl,
  handleOAuthCallback: TradeMeAuthService.handleOAuthCallback,
  disconnectOAuth: TradeMeAuthService.disconnectOAuth,
  isConnectedToTradeMe: TradeMeAuthService.isConnectedToTradeMe,
  handleOAuthCompletion: TradeMeAuthService.handleOAuthCompletion,
  testCallbackUrl: TradeMeAuthService.testCallbackUrl,
  getConnectionDebugInfo: TradeMeAuthService.getConnectionDebugInfo,
  testOAuthConnection: TradeMeAuthService.testOAuthConnection,
  
  // Property methods
  searchProperties: TradeMePropertyService.searchProperties,
  getPropertyDetails: TradeMePropertyService.getPropertyDetails,
  syncWatchlistToDatabase: TradeMePropertyService.syncWatchlistToDatabase,
};
