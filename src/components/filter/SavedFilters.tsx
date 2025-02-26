import React, { useState, useEffect } from 'react';
import { PropertyFilters, SavedFilter } from '../../types';

interface SavedFiltersProps {
  currentFilters: PropertyFilters;
  onApplyFilter: (filters: PropertyFilters) => void;
  className?: string;
}

export function SavedFilters({ currentFilters, onApplyFilter, className = '' }: SavedFiltersProps) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Load saved filters from localStorage on component mount
  useEffect(() => {
    const storedFilters = localStorage.getItem('savedFilters');
    if (storedFilters) {
      try {
        setSavedFilters(JSON.parse(storedFilters));
      } catch (error) {
        console.error('Error loading saved filters:', error);
      }
    }
  }, []);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savedFilters', JSON.stringify(savedFilters));
  }, [savedFilters]);

  // Check if there are any active filters
  const hasActiveFilters = Object.values(currentFilters).some(value => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== undefined;
  });

  // Save current filters
  const saveCurrentFilters = () => {
    if (!filterName.trim()) return;
    
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName.trim(),
      filters: currentFilters,
      createdAt: new Date().toISOString()
    };
    
    setSavedFilters([...savedFilters, newFilter]);
    setFilterName('');
    setShowSaveDialog(false);
  };

  // Apply a saved filter
  const applyFilter = (filter: SavedFilter) => {
    onApplyFilter(filter.filters);
    setIsOpen(false);
  };

  // Delete a saved filter
  const deleteFilter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedFilters(savedFilters.filter(filter => filter.id !== id));
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
          Saved Filters
        </button>
        
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => setShowSaveDialog(true)}
            className="px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 border border-transparent rounded-md hover:bg-indigo-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Current Filters
          </button>
        )}
      </div>
      
      {/* Dropdown for saved filters */}
      {isOpen && (
        <div className="absolute z-10 mt-2 w-64 bg-white rounded-md shadow-lg">
          <div className="py-1">
            {savedFilters.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                No saved filters yet
              </div>
            ) : (
              savedFilters.map(filter => (
                <div
                  key={filter.id}
                  onClick={() => applyFilter(filter)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                >
                  <span>{filter.name}</span>
                  <button
                    onClick={(e) => deleteFilter(filter.id, e)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      {/* Save filter dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Save Filter</h3>
            <div className="mb-4">
              <label htmlFor="filter-name" className="block text-sm font-medium text-gray-700 mb-1">
                Filter Name
              </label>
              <input
                type="text"
                id="filter-name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter a name for this filter"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveCurrentFilters}
                disabled={!filterName.trim()}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  filterName.trim() 
                    ? 'bg-indigo-600 hover:bg-indigo-700' 
                    : 'bg-indigo-400 cursor-not-allowed'
                }`}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
