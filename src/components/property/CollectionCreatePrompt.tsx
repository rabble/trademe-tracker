/**
 * Collection Create Prompt Component
 * 
 * This component displays a prompt to encourage users to create a collection
 * for organizing their saved properties, with a special incentive for
 * temporary users to create an account.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useProgressiveAuth from '../../hooks/useProgressiveAuth';
import usePropertyCollections from '../../hooks/property/usePropertyCollections';
import { FeatureGatingModal } from '../auth';

interface CollectionCreatePromptProps {
  /** Pin IDs that would be added to the new collection */
  pinIds?: string[];
  /** Function called when a collection is successfully created */
  onCollectionCreated?: (collectionId: string) => void;
  /** Function to close the prompt */
  onClose: () => void;
}

const CollectionCreatePrompt: React.FC<CollectionCreatePromptProps> = ({
  pinIds = [],
  onCollectionCreated,
  onClose
}) => {
  const [collectionName, setCollectionName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  
  const { isAuthenticated, isTemporaryUser, needsUpgrade } = useProgressiveAuth();
  const { createCollection } = usePropertyCollections();

  // Handle collection creation
  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if the feature is gated for temporary users that have reached a threshold
    if (needsUpgrade('collection')) {
      setShowFeatureModal(true);
      return;
    }
    
    if (!collectionName.trim()) {
      return;
    }
    
    setIsCreating(true);
    
    try {
      const collection = await createCollection({
        name: collectionName.trim(),
        description: description.trim() || undefined
      });
      
      if (collection && collection.id) {
        onCollectionCreated?.(collection.id);
        onClose();
      }
    } catch (error) {
      console.error('Error creating collection:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={onClose} />
      <div className="fixed inset-x-0 mx-auto top-1/2 transform -translate-y-1/2 w-full max-w-md p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100">
            <h3 className="text-lg font-medium text-indigo-900">Create a Collection</h3>
            <p className="text-sm text-indigo-700">
              Organize your saved properties in collections for easier browsing
            </p>
          </div>
          
          <form onSubmit={handleCreateCollection} className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="collection-name" className="block text-sm font-medium text-gray-700">
                  Collection Name
                </label>
                <input
                  type="text"
                  id="collection-name"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="My Dream Homes"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="collection-description" className="block text-sm font-medium text-gray-700">
                  Description (Optional)
                </label>
                <textarea
                  id="collection-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Properties I'm considering..."
                />
              </div>
              
              {isTemporaryUser && !isAuthenticated && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <Link to="/register" className="font-medium text-blue-700 underline">
                          Create an account
                        </Link>
                        {' '}to save your collections permanently and access them from any device.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || !collectionName.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Collection'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <FeatureGatingModal
        feature="comment"
        isOpen={showFeatureModal}
        onClose={() => setShowFeatureModal(false)}
      />
    </>
  );
};

export default CollectionCreatePrompt;