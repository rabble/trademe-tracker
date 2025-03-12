import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { TradeMeService } from '../../services/trademe/trademeService';

export function TradeMeOAuthSettings() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');

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
            <div className="flex items-center text-green-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Connected to TradeMe {environment === 'sandbox' ? 'Sandbox' : 'Production'}</span>
            </div>
            
            <Button
              onClick={handleDisconnect}
              disabled={isLoading}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              {isLoading ? 'Disconnecting...' : 'Disconnect from TradeMe'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
