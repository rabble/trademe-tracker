import React, { useState } from 'react';
import { PropertyFilters } from '../../types';
import { PriceFilter } from './components/PriceFilter';
import { PropertyTypeFilter } from './components/PropertyTypeFilter';
import { RoomsFilter } from './components/RoomsFilter';
import { AreaFilter } from './components/AreaFilter';
import { StatusFilter } from './components/StatusFilter';
import { DaysOnMarketFilter } from './components/DaysOnMarketFilter';
import { ListingTypeFilter } from './components/ListingTypeFilter';

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
          <PriceFilter 
            minPrice={filters.priceRange?.[0]} 
            maxPrice={filters.priceRange?.[1]}
            onChange={(min, max) => updateFilter('priceRange', [min, max] as PropertyFilters['priceRange'])}
          />
          
          {/* Property Type */}
          <PropertyTypeFilter 
            selectedTypes={filters.propertyType}
            onChange={(types) => updateFilter('propertyType', types)}
          />
          
          {/* Bedrooms & Bathrooms */}
          <div className="grid grid-cols-2 gap-4">
            <RoomsFilter 
              type="bedrooms"
              minValue={filters.bedrooms?.[0]}
              maxValue={filters.bedrooms?.[1]}
              onChange={(min, max) => updateFilter('bedrooms', [min, max] as PropertyFilters['bedrooms'])}
            />
            <RoomsFilter 
              type="bathrooms"
              minValue={filters.bathrooms?.[0]}
              maxValue={filters.bathrooms?.[1]}
              onChange={(min, max) => updateFilter('bathrooms', [min, max] as PropertyFilters['bathrooms'])}
            />
          </div>
          
          {/* Land & Floor Area */}
          <div className="grid grid-cols-2 gap-4">
            <AreaFilter 
              type="landArea"
              minValue={filters.landArea?.[0]}
              maxValue={filters.landArea?.[1]}
              onChange={(min, max) => updateFilter('landArea', [min, max] as PropertyFilters['landArea'])}
            />
            <AreaFilter 
              type="floorArea"
              minValue={filters.floorArea?.[0]}
              maxValue={filters.floorArea?.[1]}
              onChange={(min, max) => updateFilter('floorArea', [min, max] as PropertyFilters['floorArea'])}
            />
          </div>
          
          {/* Property Status */}
          <StatusFilter 
            selectedStatuses={filters.status}
            onChange={(statuses) => updateFilter('status', statuses)}
          />
          
          {/* Days on Market */}
          <DaysOnMarketFilter 
            minDays={filters.daysOnMarket?.[0]}
            maxDays={filters.daysOnMarket?.[1]}
            onChange={(min, max) => updateFilter('daysOnMarket', [min, max] as PropertyFilters['daysOnMarket'])}
          />
          
          {/* Listing Type */}
          <ListingTypeFilter 
            selectedTypes={filters.listingType}
            onChange={(types) => updateFilter('listingType', types)}
          />
          
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
