import React, { useEffect, useState } from 'react';
import { TradeMeService } from '../../services/trademe/trademeService';

export function TradeMeConnectionStatus() {
  const [connectionInfo, setConnectionInfo] = useState<{
    isConnected: boolean;
    environment: string;
    tokenInfo: string;
  }>({
    isConnected: false,
    environment: 'unknown',
    tokenInfo: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = () => {
    try {
      const info = TradeMeService.getConnectionDebugInfo();
      setConnectionInfo({
        isConnected: info.isConnected,
        environment: info.environment,
        tokenInfo: info.tokenExists ? 
          `Token: ${info.tokenLength} chars, Secret: ${info.tokenSecretLength} chars` : 
          'No tokens found'
      });
      
      // Check if we have a last synced timestamp
      const syncTimestamp = localStorage.getItem('trademe_last_synced');
      if (syncTimestamp) {
        const date = new Date(parseInt(syncTimestamp, 10));
        setLastSynced(date.toLocaleString());
      }
    } catch (err) {
      console.error('Error checking connection status:', err);
    }
  };

  const handleSyncWatchlist = async () => {
    setIsLoading(true);
    try {
      const result = await TradeMeService.syncWatchlistToDatabase();
      if (result.count >= 0) {
        // Store the sync timestamp
        localStorage.setItem('trademe_last_synced', Date.now().toString());
        setLastSynced(new Date().toLocaleString());
        alert(`Successfully synced ${result.count} properties from TradeMe watchlist`);
      }
    } catch (err) {
      console.error('Error syncing watchlist:', err);
      alert(`Error syncing watchlist: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    try {
      TradeMeService.disconnectOAuth();
      checkConnectionStatus();
      alert('Successfully disconnected from TradeMe');
    } catch (err) {
      console.error('Error disconnecting:', err);
      alert(`Error disconnecting: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">TradeMe Connection Status</h3>
      
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <div className={`w-3 h-3 rounded-full mr-2 ${connectionInfo.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="font-medium">
            {connectionInfo.isConnected ? 'Connected' : 'Not Connected'}
          </span>
        </div>
        
        {connectionInfo.isConnected && (
          <>
            <p className="text-sm text-gray-600 mb-1">
              Environment: <span className="font-medium">{connectionInfo.environment}</span>
            </p>
            <p className="text-sm text-gray-600 mb-1">
              {connectionInfo.tokenInfo}
            </p>
            {lastSynced && (
              <p className="text-sm text-gray-600">
                Last synced: <span className="font-medium">{lastSynced}</span>
              </p>
            )}
          </>
        )}
      </div>
      
      {connectionInfo.isConnected ? (
        <div className="flex space-x-3">
          <button
            onClick={handleSyncWatchlist}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md ${
              isLoading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isLoading ? 'Syncing...' : 'Sync Watchlist Now'}
          </button>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-600">
          Connect to TradeMe to sync your watchlist properties.
        </p>
      )}
    </div>
  );
}
