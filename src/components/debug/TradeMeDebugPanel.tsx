import React, { useState, useEffect } from 'react';
import { TradeMeService } from '../../services/trademe/trademeService';
import { supabase } from '../../lib/supabase';
import { runNetworkDiagnostics } from '../../utils/networkDiagnostics';

export function TradeMeDebugPanel() {
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  const [isVisible, setIsVisible] = useState(true); // Always start visible
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<{ count: number } | null>(null);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<{
    isConnected: boolean;
    error: string | null;
    pingTime: number | null;
  }>({
    isConnected: false,
    error: null,
    pingTime: null
  });
  const [networkDiagnostics, setNetworkDiagnostics] = useState<Record<string, any> | null>(null);
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);

  useEffect(() => {
    if (isVisible) {
      refreshDebugInfo();
      checkSupabaseConnection();
    }
  }, [isVisible]);

  const checkSupabaseConnection = async () => {
    try {
      const startTime = performance.now();
      const { data, error } = await supabase.from('properties').select('count').limit(1);
      const endTime = performance.now();
      
      if (error) {
        console.error('Supabase connection error:', error);
        setSupabaseStatus({
          isConnected: false,
          error: `${error.code}: ${error.message}`,
          pingTime: null
        });
      } else {
        setSupabaseStatus({
          isConnected: true,
          error: null,
          pingTime: Math.round(endTime - startTime)
        });
      }
    } catch (err) {
      console.error('Error checking Supabase connection:', err);
      setSupabaseStatus({
        isConnected: false,
        error: err instanceof Error ? err.message : String(err),
        pingTime: null
      });
    }
  };

  const refreshDebugInfo = () => {
    try {
      const info = TradeMeService.getConnectionDebugInfo();
      setDebugInfo(info);
    } catch (err) {
      console.error('Error getting debug info:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };
  
  const handleRunDiagnostics = async () => {
    try {
      setRunningDiagnostics(true);
      setError(null);
      const results = await runNetworkDiagnostics();
      console.log('Network diagnostics results:', results);
      setNetworkDiagnostics(results);
    } catch (err) {
      console.error('Error running network diagnostics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setRunningDiagnostics(false);
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
  
  const handleStartOAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setTestResult(null);
      const authUrl = await TradeMeService.getOAuthRequestUrl(true); // Use sandbox
      console.log('Got OAuth URL:', authUrl);
      window.open(authUrl, '_blank');
    } catch (err) {
      console.error('Error starting OAuth flow:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const testCallbackUrl = () => {
    try {
      const host = window.location.host;
      const callbackUrl = `https://${host}/settings/trademe-callback`;
      const encodedCallback = encodeURIComponent(callbackUrl);
      
      console.log('Callback URL test:', {
        host,
        callbackUrl,
        encodedCallback,
        length: callbackUrl.length,
        encodedLength: encodedCallback.length
      });
      
      alert(`Callback URL: ${callbackUrl}\nEncoded: ${encodedCallback}`);
    } catch (err) {
      console.error('Error testing callback URL:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };
  
  const handleTestConnection = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setTestResult(null);
      const result = await TradeMeService.testOAuthConnection();
      setTestResult(result);
      if (!result.success) {
        setError(result.message);
      }
      refreshDebugInfo();
    } catch (err) {
      console.error('Error testing connection:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Always visible, so we don't need the conditional rendering

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">TradeMe Debug Panel</h2>
            <button 
              onClick={() => setIsVisible(!isVisible)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isVisible ? "Minimize" : "Expand"}
            </button>
          </div>

          <div className="mb-4">
            <button 
              onClick={() => {
                refreshDebugInfo();
                checkSupabaseConnection();
              }}
              className="bg-blue-600 text-white px-3 py-1 rounded-md mr-2"
            >
              Refresh Info
            </button>
            <button 
              onClick={handleRunDiagnostics}
              disabled={runningDiagnostics}
              className={`px-3 py-1 rounded-md mr-2 ${
                runningDiagnostics 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {runningDiagnostics ? 'Running...' : 'Network Diagnostics'}
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
              className={`px-3 py-1 rounded-md mr-2 ${
                !debugInfo.isConnected 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              Disconnect
            </button>
            <button 
              onClick={handleStartOAuth}
              disabled={isLoading}
              className={`px-3 py-1 rounded-md mr-2 ${
                isLoading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isLoading ? 'Starting...' : 'Start OAuth Flow'}
            </button>
            <button 
              onClick={testCallbackUrl}
              className="bg-teal-600 text-white px-3 py-1 rounded-md mr-2 hover:bg-teal-700"
            >
              Test Callback URL
            </button>
            <button 
              onClick={handleTestConnection}
              disabled={isLoading || !debugInfo.isConnected}
              className={`px-3 py-1 rounded-md ${
                isLoading || !debugInfo.isConnected
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-yellow-600 text-white hover:bg-yellow-700'
              }`}
            >
              {isLoading ? 'Testing...' : 'Test Connection'}
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
          
          {testResult && (
            <div className={`mb-4 p-3 ${testResult.success ? 'bg-green-100 border-green-300 text-green-800' : 'bg-yellow-100 border-yellow-300 text-yellow-800'} rounded`}>
              <div className="font-bold mb-2">
                {testResult.success ? '✅ Connection Test Successful' : '⚠️ Connection Test Failed'}
              </div>
              <div>{testResult.message}</div>
              {testResult.details && (
                <div className="mt-2">
                  <details>
                    <summary className="cursor-pointer font-medium">Response Details</summary>
                    <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
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
              
              <div>Consumer Key:</div>
              <div className="break-all">{debugInfo.consumerKey || 'Not available'}</div>
              
              <div>Consumer Secret:</div>
              <div>{debugInfo.consumerSecretExists ? 'Available' : 'Not available'}</div>
            </div>
            
            <div className="mt-4">
              <button 
                onClick={() => {
                  const token = localStorage.getItem('trademe_oauth_token');
                  const tokenSecret = localStorage.getItem('trademe_oauth_token_secret');
                  console.log('Current OAuth tokens:', { token, tokenSecret });
                  alert(`Current tokens:\nToken: ${token ? token.substring(0, 10) + '...' : 'None'}\nToken Secret: ${tokenSecret ? tokenSecret.substring(0, 10) + '...' : 'None'}`);
                }}
                className="bg-gray-500 text-white px-3 py-1 rounded-md mr-2"
              >
                Show Raw Tokens
              </button>
              
              <button 
                onClick={() => {
                  localStorage.removeItem('trademe_oauth_token');
                  localStorage.removeItem('trademe_oauth_token_secret');
                  localStorage.removeItem('trademe_environment');
                  localStorage.removeItem('trademe_request_token_secret');
                  refreshDebugInfo();
                  alert('All TradeMe tokens cleared from localStorage');
                }}
                className="bg-red-500 text-white px-3 py-1 rounded-md mr-2"
              >
                Clear All Tokens
              </button>
              
              <button 
                onClick={() => {
                  const token = prompt('Enter OAuth Token:');
                  const tokenSecret = prompt('Enter OAuth Token Secret:');
                  if (token && tokenSecret) {
                    localStorage.setItem('trademe_oauth_token', token);
                    localStorage.setItem('trademe_oauth_token_secret', tokenSecret);
                    localStorage.setItem('trademe_environment', 'sandbox');
                    refreshDebugInfo();
                    alert('OAuth tokens set successfully');
                  }
                }}
                className="bg-green-500 text-white px-3 py-1 rounded-md"
              >
                Set Tokens Manually
              </button>
            </div>
          </div>

          <div className="mt-4 bg-gray-100 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Supabase Connection</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>Connected:</div>
              <div className={supabaseStatus.isConnected ? 'text-green-600 font-bold' : 'text-red-600'}>
                {supabaseStatus.isConnected ? 'Yes' : 'No'}
              </div>
              
              {supabaseStatus.pingTime && (
                <>
                  <div>Response Time:</div>
                  <div>{supabaseStatus.pingTime}ms</div>
                </>
              )}
              
              {supabaseStatus.error && (
                <>
                  <div>Error:</div>
                  <div className="text-red-600">{supabaseStatus.error}</div>
                </>
              )}
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

          {networkDiagnostics && (
            <div className="mt-4 bg-gray-100 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Network Diagnostics</h3>
              
              <div className="mb-3">
                <h4 className="font-semibold">Browser Info</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Online Status:</div>
                  <div className={networkDiagnostics.browser.online ? 'text-green-600' : 'text-red-600'}>
                    {networkDiagnostics.browser.online ? 'Online' : 'Offline'}
                  </div>
                  <div>User Agent:</div>
                  <div className="break-all">{networkDiagnostics.browser.userAgent}</div>
                </div>
              </div>
              
              <div className="mb-3">
                <h4 className="font-semibold">Connectivity Tests</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Supabase:</div>
                  <div className={networkDiagnostics.connectivity.supabase.success ? 'text-green-600' : 'text-red-600'}>
                    {networkDiagnostics.connectivity.supabase.success 
                      ? `Connected (${networkDiagnostics.connectivity.supabase.time}ms)` 
                      : `Failed: ${networkDiagnostics.connectivity.supabase.error}`}
                  </div>
                  
                  <div>TradeMe API:</div>
                  <div className={networkDiagnostics.connectivity.trademe.success ? 'text-green-600' : 'text-red-600'}>
                    {networkDiagnostics.connectivity.trademe.success 
                      ? `Connected (${networkDiagnostics.connectivity.trademe.time}ms)` 
                      : `Failed: ${networkDiagnostics.connectivity.trademe.error}`}
                  </div>
                  
                  <div>TradeMe Sandbox:</div>
                  <div className={networkDiagnostics.connectivity.trademeSandbox.success ? 'text-green-600' : 'text-red-600'}>
                    {networkDiagnostics.connectivity.trademeSandbox.success 
                      ? `Connected (${networkDiagnostics.connectivity.trademeSandbox.time}ms)` 
                      : `Failed: ${networkDiagnostics.connectivity.trademeSandbox.error}`}
                  </div>
                  
                  <div>TradeMe OAuth:</div>
                  <div className={networkDiagnostics.connectivity.trademeOAuth.success ? 'text-green-600' : 'text-red-600'}>
                    {networkDiagnostics.connectivity.trademeOAuth.success 
                      ? `Connected (${networkDiagnostics.connectivity.trademeOAuth.time}ms)` 
                      : `Failed: ${networkDiagnostics.connectivity.trademeOAuth.error}`}
                  </div>
                  
                  <div>TradeMe Sandbox OAuth:</div>
                  <div className={networkDiagnostics.connectivity.trademeSandboxOAuth.success ? 'text-green-600' : 'text-red-600'}>
                    {networkDiagnostics.connectivity.trademeSandboxOAuth.success 
                      ? `Connected (${networkDiagnostics.connectivity.trademeSandboxOAuth.time}ms)` 
                      : `Failed: ${networkDiagnostics.connectivity.trademeSandboxOAuth.error}`}
                  </div>
                  
                  <div>OAuth RequestToken:</div>
                  <div className={networkDiagnostics.connectivity.trademeOAuthRequestToken.success ? 'text-green-600' : 'text-red-600'}>
                    {networkDiagnostics.connectivity.trademeOAuthRequestToken.success 
                      ? `Connected (${networkDiagnostics.connectivity.trademeOAuthRequestToken.time}ms)` 
                      : `Failed: ${networkDiagnostics.connectivity.trademeOAuthRequestToken.error}`}
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <h4 className="font-semibold">Location Info</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Protocol:</div>
                  <div>{networkDiagnostics.location.protocol}</div>
                  <div>Host:</div>
                  <div>{networkDiagnostics.location.host}</div>
                </div>
              </div>
            </div>
          )}

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
