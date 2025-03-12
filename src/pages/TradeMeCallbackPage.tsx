import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TradeMeService } from '../services/trademe/trademeService';

export function TradeMeCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('TradeMeCallbackPage: Handling OAuth callback');
        
        // For development purposes, we'll simulate a successful callback
        // In a real implementation, we would process the OAuth parameters
        
        // Check if we already have tokens (set by the mock flow)
        const hasTokens = localStorage.getItem('trademe_oauth_token') && 
                         localStorage.getItem('trademe_oauth_token_secret');
        
        if (hasTokens) {
          console.log('OAuth authentication successful (mock)');
          setStatus('success');
          // Redirect back to settings page after a short delay
          setTimeout(() => {
            navigate('/settings');
          }, 3000);
        } else {
          // If we don't have tokens, this is a real callback that we can't handle yet
          // In a real implementation, we would process the OAuth parameters
          console.log('No mock tokens found, this would be a real callback');
          setStatus('success');
          setTimeout(() => {
            navigate('/settings');
          }, 3000);
        }
      } catch (err) {
        console.error('Error handling TradeMe OAuth callback:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
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
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-medium">Successfully connected to TradeMe!</p>
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
            <button
              onClick={() => navigate('/settings')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Return to Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
