/**
 * Feature Gating Modal Component
 * 
 * This component displays a modal when temporary users attempt to access
 * features that require a permanent account, providing a clear path to register.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trackFeatureGated } from '../../lib/analytics/progressiveLoginTracking';

interface FeatureGatingModalProps {
  /** Type of feature being gated */
  feature: 'comment' | 'share' | 'notes' | 'export';
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Callback for when the modal is closed without conversion */
  onClose: () => void;
}

const FeatureGatingModal: React.FC<FeatureGatingModalProps> = ({
  feature,
  isOpen,
  onClose
}) => {
  const [isExiting, setIsExiting] = useState(false);

  // Track feature gating when modal opens
  useEffect(() => {
    if (isOpen) {
      trackFeatureGated(feature);
    }
  }, [isOpen, feature]);

  // If the modal is not open, don't render anything
  if (!isOpen) {
    return null;
  }

  // Handle closing the modal with animation
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      onClose();
    }, 300);
  };

  // Get feature-specific heading and message
  const getFeatureContent = () => {
    switch (feature) {
      case 'comment':
        return {
          heading: 'Ready to join the conversation?',
          message: 'Create your free MiVoy account to comment and keep your collections accessible anywhere.'
        };
      case 'share':
        return {
          heading: 'Share your discoveries',
          message: 'Create an account to share properties and collections with friends and family.'
        };
      case 'notes':
        return {
          heading: 'Keep track of your thoughts',
          message: 'Create an account to add notes to properties and organize your search better.'
        };
      case 'export':
        return {
          heading: 'Export your data',
          message: 'Create an account to export your properties and collections for offline viewing.'
        };
      default:
        return {
          heading: 'Unlock more features',
          message: 'Create a free account to access all features of MiVoy.'
        };
    }
  };

  const { heading, message } = getFeatureContent();

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      <div className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transition-transform duration-300 ${isExiting ? 'transform scale-95' : 'transform scale-100'}`}>
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{heading}</h2>
            <p className="mt-2 text-gray-600">{message}</p>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Link
              to="/register"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-center transition-colors"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="w-full py-2 px-4 bg-white hover:bg-gray-50 text-blue-600 font-medium rounded-md text-center border border-blue-600 transition-colors"
            >
              Sign In
            </Link>
            <button
              onClick={handleClose}
              className="w-full py-2 text-gray-500 hover:text-gray-700 font-medium text-center transition-colors"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureGatingModal;