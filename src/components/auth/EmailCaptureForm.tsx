/**
 * Email Capture Form Component
 * 
 * This component provides a lightweight form for capturing email addresses
 * without requiring a full account registration. It's designed for temporary
 * users who want to save their progress or enable cross-device access.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useProgressiveAuth from '../../hooks/useProgressiveAuth';
import { getTempUserId } from '../../lib/tempUserManager';

interface EmailCaptureFormProps {
  /** Optional callback when the form is successfully submitted */
  onSuccess?: () => void;
  /** Optional callback when the form is closed without submission */
  onClose?: () => void;
  /** Optional message to display at the top of the form */
  message?: string;
  /** Whether to show in modal form (with overlay) */
  isModal?: boolean;
}

const EmailCaptureForm: React.FC<EmailCaptureFormProps> = ({
  onSuccess,
  onClose,
  message = "Want to access your saved properties on other devices?",
  isModal = true
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isTemporaryUser } = useProgressiveAuth();

  // If the user is not a temporary user, don't show this form
  if (!isTemporaryUser) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get the temporary user ID
      const tempUserId = getTempUserId();
      
      if (!tempUserId) {
        throw new Error('No temporary user ID found');
      }
      
      // Import supabase client here to avoid circular dependencies
      const { supabase } = await import('../../lib/supabase');
      
      // Update the temp_user record with the email
      const { error: updateError } = await supabase
        .from('temp_users')
        .update({ 
          meta: { 
            email,
            email_captured_at: new Date().toISOString()
          }
        })
        .eq('id', tempUserId);
      
      if (updateError) {
        throw updateError;
      }
      
      // Send a notification email (normally would be via server)
      // For this implementation, we'll skip actual email sending
      console.log('Would send email to:', email);
      
      setSuccess(true);
      onSuccess?.();
      
      // After a short delay, close the form if it's a modal
      if (isModal) {
        setTimeout(() => {
          onClose?.();
        }, 2000);
      }
    } catch (err: any) {
      console.error('Error saving email:', err);
      setError(err.message || 'Failed to save your email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
        <h3 className="text-lg font-medium text-blue-900">Save Your Progress</h3>
        <p className="text-sm text-blue-700">
          {message}
        </p>
      </div>
      
      <div className="p-6">
        {success ? (
          <div className="text-center py-4">
            <svg className="mx-auto h-12 w-12 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Email Saved!</h3>
            <p className="mt-1 text-sm text-gray-500">
              We've saved your email and your browsing session.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="you@example.com"
                required
              />
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
            </div>
            
            <p className="text-xs text-gray-500">
              By providing your email, you'll be able to access your saved properties from any device. 
              We'll send you a link to continue your property search.
            </p>
            
            <div className="flex justify-between items-center">
              <div className="text-sm">
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Create full account instead
                </Link>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save My Progress'}
              </button>
            </div>
          </form>
        )}
        
        {isModal && !success && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-right">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Maybe later
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
        <div className="fixed inset-x-0 mx-auto top-1/2 transform -translate-y-1/2 w-full max-w-md p-4 z-50">
          {content}
        </div>
      </>
    );
  }

  return content;
};

export default EmailCaptureForm;