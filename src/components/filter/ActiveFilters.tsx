import React from 'react';
import { PropertyFilters } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ActiveFiltersProps {
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  className?: string;
}

export function ActiveFilters({ filters, onChange, className = '' }: ActiveFiltersProps) {
  // Check if there are any active filters
  const hasActiveFilters = Object.values(filters).some(value => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== undefined;
  });

  if (!hasActiveFilters) {
    return null;
  }

  // Remove a specific filter
  const removeFilter = <K extends keyof PropertyFilters>(key: K) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onChange(newFilters);
  };

  // Remove a specific value from an array filter
  const removeArrayValue = <K extends keyof PropertyFilters>(
    key: K, 
    value: string
  ) => {
    const currentValues = filters[key] as string[];
    if (!currentValues) return;
    
    const newValues = currentValues.filter(v => v !== value);
    onChange({ 
      ...filters, 
      [key]: newValues.length ? newValues : undefined 
    });
  };

  // Remove a specific range value
  const removeRangeValue = <K extends keyof PropertyFilters>(
    key: K, 
    index: 0 | 1
  ) => {
    const currentRange = filters[key] as [number | undefined, number | undefined];
    if (!currentRange) return;
    
    const newRange = [...currentRange] as [number | undefined, number | undefined];
    newRange[index] = undefined;
    
    // If both values are undefined, remove the entire filter
    if (newRange[0] === undefined && newRange[1] === undefined) {
      removeFilter(key);
    } else {
      onChange({ ...filters, [key]: newRange });
    }
  };

  // Format filter values for display
  const formatFilterValue = (key: keyof PropertyFilters, value: any): string => {
    if (key === 'priceRange') {
      const [min, max] = value as [number | undefined, number | undefined];
      if (min !== undefined && max !== undefined) {
        return `${formatCurrency(min)} - ${formatCurrency(max)}`;
      } else if (min !== undefined) {
        return `Min: ${formatCurrency(min)}`;
      } else if (max !== undefined) {
        return `Max: ${formatCurrency(max)}`;
      }
    }
    
    if (key === 'bedrooms' || key === 'bathrooms') {
      const [min, max] = value as [number | undefined, number | undefined];
      if (min !== undefined && max !== undefined) {
        return `${min} - ${max}`;
      } else if (min !== undefined) {
        return `Min: ${min}`;
      } else if (max !== undefined) {
        return `Max: ${max}`;
      }
    }
    
    if (key === 'landArea' || key === 'floorArea') {
      const [min, max] = value as [number | undefined, number | undefined];
      if (min !== undefined && max !== undefined) {
        return `${min} - ${max} m²`;
      } else if (min !== undefined) {
        return `Min: ${min} m²`;
      } else if (max !== undefined) {
        return `Max: ${max} m²`;
      }
    }
    
    if (key === 'daysOnMarket') {
      const [min, max] = value as [number | undefined, number | undefined];
      if (min !== undefined && max !== undefined) {
        return `${min} - ${max} days`;
      } else if (min !== undefined) {
        return `Min: ${min} days`;
      } else if (max !== undefined) {
        return `Max: ${max} days`;
      }
    }
    
    if (key === 'searchQuery') {
      return `"${value}"`;
    }
    
    return value;
  };

  // Get display name for filter keys
  const getFilterName = (key: keyof PropertyFilters): string => {
    const names: Record<keyof PropertyFilters, string> = {
      searchQuery: 'Search',
      priceRange: 'Price',
      propertyType: 'Type',
      bedrooms: 'Bedrooms',
      bathrooms: 'Bathrooms',
      landArea: 'Land Area',
      floorArea: 'Floor Area',
      status: 'Status',
      daysOnMarket: 'Days on Market',
      listingType: 'Listing Type'
    };
    return names[key] || key.toString();
  };

  return (
    <div className={`${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        {Object.entries(filters).map(([key, value]) => {
          const filterKey = key as keyof PropertyFilters;
          
          // Handle array filters (propertyType, status, listingType)
          if (Array.isArray(value) && !Array.isArray(value[0])) {
            return value.map((item, index) => (
              <div 
                key={`${key}-${index}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
              >
                <span>{getFilterName(filterKey)}: {item.toString().replace('_', ' ')}</span>
                <button
                  type="button"
                  className="ml-1.5 text-indigo-600 hover:text-indigo-800"
                  onClick={() => removeArrayValue(filterKey, item)}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ));
          }
          
          // Handle range filters (priceRange, bedrooms, bathrooms, etc.)
          if (Array.isArray(value) && value.length === 2) {
            const [min, max] = value as [number | undefined, number | undefined];
            
            return (
              <React.Fragment key={key}>
                {min !== undefined && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800">
                    <span>Min {getFilterName(filterKey)}: {min}</span>
                    <button
                      type="button"
                      className="ml-1.5 text-indigo-600 hover:text-indigo-800"
                      onClick={() => removeRangeValue(filterKey, 0)}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                {max !== undefined && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800">
                    <span>Max {getFilterName(filterKey)}: {max}</span>
                    <button
                      type="button"
                      className="ml-1.5 text-indigo-600 hover:text-indigo-800"
                      onClick={() => removeRangeValue(filterKey, 1)}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </React.Fragment>
            );
          }
          
          // Handle simple filters (searchQuery)
          return (
            <div 
              key={key}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
            >
              <span>{getFilterName(filterKey)}: {formatFilterValue(filterKey, value)}</span>
              <button
                type="button"
                className="ml-1.5 text-indigo-600 hover:text-indigo-800"
                onClick={() => removeFilter(filterKey)}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
        
        <button
          type="button"
          onClick={() => onChange({})}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 underline"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
