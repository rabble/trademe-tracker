import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TradeMeService } from '../services/trademe/trademeService';
import { supabase } from '../lib/supabase';
import { storeTradeMeUserId } from '../utils/storageUtils';

/**
 * TradeMe OAuth Callback Page
 * 
 * Handles the OAuth callback from TradeMe after a user authorizes the application.
 * Processes the OAuth verifier to obtain an access token and then redirects the user.
 */
export function TradeMeCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get and store the current user ID if available
    const getUserAndStoreId = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.id) {
          storeTradeMeUserId(data.user.id);
          console.log('Stored Supabase user ID for TradeMe integration:', data.user.id);
          return data.user.id;
        }
      } catch (err) {
        console.warn('Failed to get or store user ID:', err);
      }
      return null;
    };

    const handleCallback = async () => {
      try {
        console.log('TradeMeCallbackPage: Handling OAuth callback');
        console.log('URL search params:', location.search);
        
        // Get the query parameters from the URL
        const searchParams = new URLSearchParams(location.search);
        const oauthToken = searchParams.get('oauth_token');
        const oauthVerifier = searchParams.get('oauth_verifier');
        
        // Store debug information
        setDebugInfo({
          callbackUrl: window.location.href,
          oauthToken: oauthToken ? `${oauthToken.substring(0, 10)}...` : null,
          oauthVerifier: oauthVerifier ? `${oauthVerifier.substring(0, 5)}...` : null,
          timestamp: new Date().toISOString()
        });
        
        console.log(`OAuth token: ${oauthToken ? oauthToken.substring(0, 5) + '...' : 'none'}, OAuth verifier: ${oauthVerifier ? oauthVerifier.substring(0, 5) + '...' : 'none'}`);
        
        if (!oauthToken || !oauthVerifier) {
          throw new Error('Missing OAuth parameters in callback URL. Please try again.');
        }
        
        // Store user ID before processing the callback
        await getUserAndStoreId();
        
        // Handle the OAuth callback
        const success = await TradeMeService.handleOAuthCallback(oauthToken, oauthVerifier);
        
        if (success) {
          console.log('OAuth authentication successful');
          setStatus('success');
          
          // Test the connection to verify everything is working
          try {
            const testResult = await TradeMeService.testOAuthConnection();
            console.log('OAuth connection test result:', testResult);
            
            if (!testResult.success) {
              console.warn('OAuth connection test failed:', testResult.message);
              setDebugInfo(prev => ({
                ...prev,
                connectionTest: testResult
              }));
            }
          } catch (testError) {
            console.warn('OAuth connection test error:', testError);
          }
          
          // Redirect back to settings page after a short delay
          setTimeout(() => {
            navigate('/settings');
          }, 3000);
        } else {
          throw new Error('Failed to authenticate with TradeMe. The OAuth process did not complete successfully.');
        }
      } catch (err) {
        console.error('Error handling TradeMe OAuth callback:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'An unknown error occurred during authentication');
        
        // Add error details to debug info
        setDebugInfo(prev => ({
          ...prev,
          error: err instanceof Error ? {
            name: err.name,
            message: err.message,
            stack: err.stack
          } : String(err)
        }));
      }
    };

    handleCallback();
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">TradeMe Authentication</h1>
        
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Completing authentication with TradeMe...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments. Please don't close this page.</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-medium">Successfully connected to TradeMe!</p>
              <p className="text-sm mt-1">Your TradeMe account is now linked to the application.</p>
            </div>
            <p className="text-gray-600 mb-4">You will be redirected back to the settings page in a moment.</p>
            <button
              onClick={() => navigate('/settings')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Return to Settings
            </button>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center">
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="font-medium">Authentication failed</p>
              {error && <p className="text-sm mt-1">{error}</p>}
            </div>
            <p className="text-gray-600 mb-4">Please try again from the settings page.</p>
            <div className="mb-4">
              <button
                onClick={() => navigate('/settings')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Return to Settings
              </button>
            </div>
            
            {/* Debug information accordion (hidden by default) */}
            <details className="mt-4 text-left border rounded p-2">
              <summary className="cursor-pointer text-sm text-gray-500">Debug Information</summary>
              <div className="p-2 text-xs bg-gray-50 mt-2 rounded overflow-auto max-h-40">
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
