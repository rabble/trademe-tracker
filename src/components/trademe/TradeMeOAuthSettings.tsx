import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { TradeMeService } from '../../services/trademe/trademeService';

export function TradeMeOAuthSettings() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    // Check if already connected
    const connected = TradeMeService.isConnectedToTradeMe();
    if (connected) {
      setIsConnected(true);
      // Get current environment
      const env = localStorage.getItem('trademe_environment') || 'sandbox';
      setEnvironment(env as 'sandbox' | 'production');
    }
    
    // Set up an event listener to detect when the OAuth flow completes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'trademe_oauth_token' && event.newValue) {
        setIsConnected(true);
        const env = localStorage.getItem('trademe_environment') || 'sandbox';
        setEnvironment(env as 'sandbox' | 'production');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleConnectToSandbox = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Start the OAuth flow with the sandbox environment
      const authUrl = await TradeMeService.getOAuthRequestUrl(true);
      
      // Open the auth URL in a new window
      window.open(authUrl, '_blank', 'width=600,height=700');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to TradeMe Sandbox');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectToProduction = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Start the OAuth flow with the production environment
      const authUrl = await TradeMeService.getOAuthRequestUrl(false);
      
      // Open the auth URL in a new window
      window.open(authUrl, '_blank', 'width=600,height=700');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to TradeMe Production');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Disconnect from TradeMe
      await TradeMeService.disconnectOAuth();
      
      setIsConnected(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect from TradeMe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncListings = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus(null);
      setError(null);
      
      // Fetch watchlist from TradeMe
      const result = await TradeMeService.syncWatchlistToDatabase();
      
      setSyncStatus({
        type: 'success',
        message: `Successfully synced ${result.count} properties from your TradeMe watchlist.`
      });
    } catch (err) {
      console.error('Error syncing watchlist:', err);
      setSyncStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to sync TradeMe watchlist'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="border-t border-gray-200 pt-6">
      <h3 className="text-lg font-medium text-gray-900">TradeMe Integration</h3>
      <p className="mt-1 text-sm text-gray-500">
        Connect your TradeMe account to access your watchlist and search for properties.
      </p>
      
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}
      
      <div className="mt-4">
        {!isConnected ? (
          <div className="space-y-3">
            <Button
              onClick={handleConnectToSandbox}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? 'Connecting...' : 'Connect to TradeMe Sandbox'}
            </Button>
            
            <div className="block mt-3">
              <Button
                onClick={handleConnectToProduction}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? 'Connecting...' : 'Connect to TradeMe Production'}
              </Button>
            </div>
            
            <div className="text-xs text-gray-500 mt-2">
              <p>Sandbox is for testing purposes only. No real data will be accessed.</p>
              <p>Production will access your actual TradeMe account and watchlist.</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
              <div className="flex items-center text-green-700 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">TradeMe Integration Active</span>
              </div>
              <p className="text-sm text-green-600 mb-1">
                Successfully connected to TradeMe {environment === 'sandbox' ? 'Sandbox' : 'Production'} API
              </p>
              <p className="text-xs text-green-600">
                OAuth authentication complete. You can now access TradeMe data.
              </p>
            </div>
            
            <div className="flex space-x-4">
              <Button
                onClick={handleSyncListings}
                disabled={isLoading || isSyncing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isSyncing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Syncing...
                  </span>
                ) : 'Sync Watchlist'}
              </Button>
              
              <Button
                onClick={handleDisconnect}
                disabled={isLoading}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                {isLoading ? 'Disconnecting...' : 'Disconnect from TradeMe'}
              </Button>
            </div>
            
            {syncStatus && (
              <div className={`mt-4 p-3 rounded-md text-sm ${
                syncStatus.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <div className="flex items-center">
                  {syncStatus.type === 'success' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="font-medium">{syncStatus.message}</span>
                </div>
                {syncStatus.type === 'success' && (
                  <p className="mt-1 text-xs">
                    Properties have been imported and are now available in your dashboard.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
