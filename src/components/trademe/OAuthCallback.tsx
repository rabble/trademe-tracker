import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TradeMeService } from '../../services/trademe/trademeService';

export function OAuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parse the query parameters from the URL
        const searchParams = new URLSearchParams(location.search);
        const oauthToken = searchParams.get('oauth_token');
        const oauthVerifier = searchParams.get('oauth_verifier');

        if (!oauthToken || !oauthVerifier) {
          throw new Error('Missing OAuth token or verifier in callback URL');
        }

        console.log(`Handling OAuth callback with token: ${oauthToken.substring(0, 5)}... and verifier: ${oauthVerifier.substring(0, 5)}...`);

        // Complete the OAuth flow
        const success = await TradeMeService.handleOAuthCallback(oauthToken, oauthVerifier);

        if (success) {
          setStatus('success');
          // Redirect back to settings page after a short delay
          setTimeout(() => {
            navigate('/settings');
          }, 2000);
        } else {
          throw new Error('Failed to complete OAuth flow');
        }
      } catch (err) {
        console.error('Error handling OAuth callback:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          TradeMe OAuth {status === 'success' ? 'Complete' : status === 'error' ? 'Failed' : 'Processing'}
        </h1>

        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Completing authentication with TradeMe...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p className="mt-4 text-gray-600">Successfully connected to TradeMe!</p>
            <p className="mt-2 text-sm text-gray-500">Redirecting you back to settings...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <p className="mt-4 text-red-600">Failed to connect to TradeMe</p>
            {error && <p className="mt-2 text-sm text-gray-500">{error}</p>}
            <button
              onClick={() => navigate('/settings')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Return to Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
