/**
 * Multiple Pins Reminder Component
 * 
 * This component displays a more prominent banner when temporary users have
 * saved multiple properties, encouraging them to create an account to
 * preserve their collection.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useProgressiveAuth from '../../hooks/useProgressiveAuth';
import usePropertyPins from '../../hooks/property/usePropertyPins';

interface MultiplePinsReminderProps {
  /** Threshold of pins to trigger this reminder */
  pinThreshold?: number;
  /** Callback for when the banner is dismissed */
  onDismiss?: () => void;
}

const MultiplePinsReminder: React.FC<MultiplePinsReminderProps> = ({
  pinThreshold = 3,
  onDismiss
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const { isAuthenticated, isTemporaryUser } = useProgressiveAuth();
  const { pins } = usePropertyPins();

  // Check if we should show the reminder based on pin count
  useEffect(() => {
    if (isTemporaryUser && !isAuthenticated && pins && pins.length >= pinThreshold) {
      // Check if this reminder was recently dismissed (within 24 hours)
      const lastDismissed = localStorage.getItem('mivoy_multiple_pins_reminder_dismissed');
      
      if (lastDismissed) {
        const dismissedTime = parseInt(lastDismissed, 10);
        const currentTime = new Date().getTime();
        const hoursSinceDismissed = (currentTime - dismissedTime) / (1000 * 60 * 60);
        
        // If it's been more than 24 hours since last dismissal, show again
        if (hoursSinceDismissed >= 24) {
          setShouldShow(true);
        }
      } else {
        setShouldShow(true);
      }
    } else {
      setShouldShow(false);
    }
  }, [isTemporaryUser, isAuthenticated, pins, pinThreshold]);

  // Don't show the banner if conditions aren't met or it's been dismissed
  if (!shouldShow || isDismissed || !pins) {
    return null;
  }

  // Handle dismissal
  const handleDismiss = () => {
    setIsDismissed(true);
    // Store the dismissal time in localStorage
    localStorage.setItem('mivoy_multiple_pins_reminder_dismissed', new Date().getTime().toString());
    onDismiss?.();
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 mx-auto w-full max-w-lg px-4 z-50 animate-slide-up">
      <div className="bg-indigo-100 border-l-4 border-indigo-500 text-indigo-700 p-5 rounded-lg shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-medium text-indigo-800">You've got quite the collection growing!</h3>
            <p className="mt-1 text-indigo-700">
              You've saved {pins.length} {pins.length === 1 ? 'property' : 'properties'}. Create an account to ensure your pins are saved permanently and accessible from any device.
            </p>
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Free Account
              </Link>
              <button
                onClick={handleDismiss}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Remind Me Later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-4 flex-shrink-0 text-indigo-500 hover:text-indigo-700"
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

export default MultiplePinsReminder;