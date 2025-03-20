/**
 * Login Prompt Banner Component
 * 
 * This component displays a banner prompting temporary users to create
 * an account. It appears in response to specific user actions like pinning
 * properties or creating collections.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useProgressiveAuth from '../../hooks/useProgressiveAuth';
import { trackLoginPrompted } from '../../lib/analytics/progressiveLoginTracking';

interface LoginPromptBannerProps {
  /** Type of action that triggered the prompt */
  action?: 'pin' | 'collection' | 'multiple_pins';
  /** Optional count for displaying action-specific messaging */
  count?: number;
  /** Callback for when the banner is dismissed */
  onDismiss?: () => void;
}

const LoginPromptBanner: React.FC<LoginPromptBannerProps> = ({
  action = 'pin',
  count = 1,
  onDismiss
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const { isAuthenticated, isTemporaryUser } = useProgressiveAuth();

  // Track the login prompt when it's shown
  useEffect(() => {
    if (!isDismissed && isTemporaryUser && !isAuthenticated) {
      trackLoginPrompted(action, 'shown');
    }
  }, [isDismissed, isTemporaryUser, isAuthenticated, action]);

  // Don't show the banner for authenticated users
  if (isAuthenticated || !isTemporaryUser || isDismissed) {
    return null;
  }

  // Handle dismissal
  const handleDismiss = () => {
    setIsDismissed(true);
    trackLoginPrompted(action, 'dismissed');
    onDismiss?.();
  };
  
  // Handle register click
  const handleRegisterClick = () => {
    trackLoginPrompted(action, 'register');
  };

  // Generate appropriate message based on action
  const getMessage = () => {
    switch (action) {
      case 'pin':
        return "We've saved this property to your collection! Create a free account to access it from any device.";
      case 'collection':
        return "Your collection has been created! Sign up to keep it safe and access it anywhere.";
      case 'multiple_pins':
        return `You've got ${count} saved properties! Create an account to make sure they're saved permanently.`;
      default:
        return "Create a free account to save your progress and access more features.";
    }
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 mx-auto w-full max-w-md px-4 z-50 animate-slide-up">
      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded shadow-lg flex justify-between items-center">
        <div>
          <p className="font-medium">{getMessage()}</p>
        </div>
        <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
          <Link
            to="/register"
            className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors"
            onClick={handleRegisterClick}
          >
            Sign Up
          </Link>
          <button
            onClick={handleDismiss}
            className="text-blue-500 hover:text-blue-700"
            aria-label="Dismiss"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPromptBanner;