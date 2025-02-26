import React, { useState } from 'react';
import { PropertyFilters } from '../../types';

interface FilterPanelProps {
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  className?: string;
}

export function FilterPanel({ filters, onChange, className = '' }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Helper to update a specific filter
  const updateFilter = <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  // Handle price range changes
  const handlePriceChange = (index: 0 | 1, value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    const newRange = [...(filters.priceRange || [undefined, undefined])] as [number | undefined, number | undefined];
    newRange[index] = numValue;
    updateFilter('priceRange', newRange);
  };

  // Handle property type changes
  const handlePropertyTypeChange = (type: string, checked: boolean) => {
    const currentTypes = filters.propertyType || [];
    const newTypes = checked 
      ? [...currentTypes, type] 
      : currentTypes.filter(t => t !== type);
    
    updateFilter('propertyType', newTypes as PropertyFilters['propertyType']);
  };

  // Handle bedrooms/bathrooms changes
  const handleRoomChange = (key: 'bedrooms' | 'bathrooms', index: 0 | 1, value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    const newRange = [...(filters[key] || [undefined, undefined])] as [number | undefined, number | undefined];
    newRange[index] = numValue;
    updateFilter(key, newRange);
  };

  // Handle area changes
  const handleAreaChange = (key: 'landArea' | 'floorArea', index: 0 | 1, value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    const newRange = [...(filters[key] || [undefined, undefined])] as [number | undefined, number | undefined];
    newRange[index] = numValue;
    updateFilter(key, newRange);
  };

  // Handle status changes
  const handleStatusChange = (status: string, checked: boolean) => {
    const currentStatuses = filters.status || [];
    const newStatuses = checked 
      ? [...currentStatuses, status] 
      : currentStatuses.filter(s => s !== status);
    
    updateFilter('status', newStatuses as PropertyFilters['status']);
  };

  // Handle days on market changes
  const handleDaysOnMarketChange = (index: 0 | 1, value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    const newRange = [...(filters.daysOnMarket || [undefined, undefined])] as [number | undefined, number | undefined];
    newRange[index] = numValue;
    updateFilter('daysOnMarket', newRange);
  };

  // Handle listing type changes
  const handleListingTypeChange = (type: string, checked: boolean) => {
    const currentTypes = filters.listingType || [];
    const newTypes = checked 
      ? [...currentTypes, type] 
      : currentTypes.filter(t => t !== type);
    
    updateFilter('listingType', newTypes as PropertyFilters['listingType']);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <button 
          className="flex justify-between items-center w-full text-left font-medium text-gray-900"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>Filter Properties</span>
          <svg 
            className={`w-5 h-5 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Price Range */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Price Range</h3>
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label className="block text-xs text-gray-500 mb-1">Min</label>
                <input
                  type="number"
                  value={filters.priceRange?.[0] || ''}
                  onChange={(e) => handlePriceChange(0, e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded"
                  placeholder="Min price"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-xs text-gray-500 mb-1">Max</label>
                <input
                  type="number"
                  value={filters.priceRange?.[1] || ''}
                  onChange={(e) => handlePriceChange(1, e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded"
                  placeholder="Max price"
                />
              </div>
            </div>
          </div>
          
          {/* Property Type */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Property Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {['house', 'apartment', 'townhouse', 'section', 'other'].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.propertyType?.includes(type as any) || false}
                    onChange={(e) => handlePropertyTypeChange(type, e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{type.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Bedrooms & Bathrooms */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Bedrooms</h3>
              <div className="flex space-x-2">
                <div className="w-1/2">
                  <input
                    type="number"
                    value={filters.bedrooms?.[0] || ''}
                    onChange={(e) => handleRoomChange('bedrooms', 0, e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded"
                    placeholder="Min"
                    min="0"
                  />
                </div>
                <div className="w-1/2">
                  <input
                    type="number"
                    value={filters.bedrooms?.[1] || ''}
                    onChange={(e) => handleRoomChange('bedrooms', 1, e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded"
                    placeholder="Max"
                    min="0"
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Bathrooms</h3>
              <div className="flex space-x-2">
                <div className="w-1/2">
                  <input
                    type="number"
                    value={filters.bathrooms?.[0] || ''}
                    onChange={(e) => handleRoomChange('bathrooms', 0, e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded"
                    placeholder="Min"
                    min="0"
                  />
                </div>
                <div className="w-1/2">
                  <input
                    type="number"
                    value={filters.bathrooms?.[1] || ''}
                    onChange={(e) => handleRoomChange('bathrooms', 1, e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded"
                    placeholder="Max"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Land & Floor Area */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Land Area (m²)</h3>
              <div className="flex space-x-2">
                <div className="w-1/2">
                  <input
                    type="number"
                    value={filters.landArea?.[0] || ''}
                    onChange={(e) => handleAreaChange('landArea', 0, e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded"
                    placeholder="Min"
                    min="0"
                  />
                </div>
                <div className="w-1/2">
                  <input
                    type="number"
                    value={filters.landArea?.[1] || ''}
                    onChange={(e) => handleAreaChange('landArea', 1, e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded"
                    placeholder="Max"
                    min="0"
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Floor Area (m²)</h3>
              <div className="flex space-x-2">
                <div className="w-1/2">
                  <input
                    type="number"
                    value={filters.floorArea?.[0] || ''}
                    onChange={(e) => handleAreaChange('floorArea', 0, e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded"
                    placeholder="Min"
                    min="0"
                  />
                </div>
                <div className="w-1/2">
                  <input
                    type="number"
                    value={filters.floorArea?.[1] || ''}
                    onChange={(e) => handleAreaChange('floorArea', 1, e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded"
                    placeholder="Max"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Property Status */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {['active', 'under_offer', 'sold', 'archived'].map((status) => (
                <label key={status} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.status?.includes(status as any) || false}
                    onChange={(e) => handleStatusChange(status, e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{status.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Days on Market */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Days on Market</h3>
            <div className="flex space-x-4">
              <div className="w-1/2">
                <input
                  type="number"
                  value={filters.daysOnMarket?.[0] || ''}
                  onChange={(e) => handleDaysOnMarketChange(0, e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded"
                  placeholder="Min days"
                  min="0"
                />
              </div>
              <div className="w-1/2">
                <input
                  type="number"
                  value={filters.daysOnMarket?.[1] || ''}
                  onChange={(e) => handleDaysOnMarketChange(1, e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded"
                  placeholder="Max days"
                  min="0"
                />
              </div>
            </div>
          </div>
          
          {/* Listing Type */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Listing Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {['auction', 'price_by_negotiation', 'asking_price', 'tender', 'enquiries_over'].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.listingType?.includes(type as any) || false}
                    onChange={(e) => handleListingTypeChange(type, e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{type.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Apply/Reset Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => onChange({})}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Reset All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
