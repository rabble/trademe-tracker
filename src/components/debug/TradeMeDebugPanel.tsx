import React, { useState, useEffect } from 'react';
import { TradeMeService } from '../../services/trademe/trademeService';

export function TradeMeDebugPanel() {
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<{ count: number } | null>(null);

  useEffect(() => {
    if (isVisible) {
      refreshDebugInfo();
    }
  }, [isVisible]);

  const refreshDebugInfo = () => {
    try {
      const info = TradeMeService.getConnectionDebugInfo();
      setDebugInfo(info);
    } catch (err) {
      console.error('Error getting debug info:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleSyncWatchlist = async () => {
    setIsLoading(true);
    setError(null);
    setSyncResult(null);
    
    try {
      const result = await TradeMeService.syncWatchlistToDatabase();
      setSyncResult(result);
      refreshDebugInfo();
    } catch (err) {
      console.error('Error syncing watchlist:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    try {
      TradeMeService.disconnectOAuth();
      refreshDebugInfo();
    } catch (err) {
      console.error('Error disconnecting:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={() => setIsVisible(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-700"
        >
          Debug TradeMe
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">TradeMe Debug Panel</h2>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>

          <div className="mb-4">
            <button 
              onClick={refreshDebugInfo}
              className="bg-blue-600 text-white px-3 py-1 rounded-md mr-2"
            >
              Refresh Info
            </button>
            <button 
              onClick={handleSyncWatchlist}
              disabled={isLoading || !debugInfo.isConnected}
              className={`px-3 py-1 rounded-md mr-2 ${
                isLoading || !debugInfo.isConnected 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isLoading ? 'Syncing...' : 'Sync Watchlist'}
            </button>
            <button 
              onClick={handleDisconnect}
              disabled={!debugInfo.isConnected}
              className={`px-3 py-1 rounded-md ${
                !debugInfo.isConnected 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              Disconnect
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}

          {syncResult && (
            <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded">
              <strong>Sync Result:</strong> {syncResult.count} properties synced
            </div>
          )}

          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Connection Status</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>Connected:</div>
              <div className={debugInfo.isConnected ? 'text-green-600 font-bold' : 'text-red-600'}>
                {debugInfo.isConnected ? 'Yes' : 'No'}
              </div>
              
              <div>Environment:</div>
              <div>{debugInfo.environment}</div>
              
              <div>Token Exists:</div>
              <div>{debugInfo.tokenExists ? 'Yes' : 'No'}</div>
              
              <div>Token Secret Exists:</div>
              <div>{debugInfo.tokenSecretExists ? 'Yes' : 'No'}</div>
              
              <div>Token Length:</div>
              <div>{debugInfo.tokenLength}</div>
              
              <div>Token Secret Length:</div>
              <div>{debugInfo.tokenSecretLength}</div>
              
              <div>API URL:</div>
              <div className="break-all">{debugInfo.apiUrl}</div>
            </div>
          </div>

          <div className="mt-4 bg-gray-100 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Local Storage Keys</h3>
            <ul className="list-disc pl-5">
              {debugInfo.storedKeys?.map((key: string) => (
                <li key={key}>{key}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <h3 className="font-bold mb-2">Console Output</h3>
            <p className="text-sm text-gray-600">
              Check your browser console (F12) for detailed debug logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
